import dotenv from "dotenv";
import { pool } from "../config/db";
import crypto from "crypto";
import { Playlist, TrackUI } from "@shared/types";


dotenv.config();

const tokenCache = new Map<number, { accessToken: string, expiresIn: number }>();

const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
];

export const createLoginURL = (): { url: string; state: string } => {
    const state = crypto.randomBytes(16).toString("hex");
    const query = new URLSearchParams({
        client_id: process.env.YT_CLIENT_ID!,
        redirect_uri: process.env.YT_REDIRECT_URI!,
        response_type: "code",
        scope: scopes.join(" "),
        access_type: "offline",
        prompt: "consent",
        state,
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${query.toString()}`;
    return { url, state };
};

export const exchangeCodeForTokens = async (code: string, userId: number): Promise<void> => {
    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            code,
            client_id: process.env.YT_CLIENT_ID!,
            client_secret: process.env.YT_CLIENT_SECRET!,
            redirect_uri: process.env.YT_REDIRECT_URI!,
            grant_type: "authorization_code",
        }),
    });

    if (!res.ok) throw new Error("Failed to exchange code");

    const data = await res.json();
    const { access_token, refresh_token, expires_in } = data;
    const expiry = Date.now() + expires_in * 1000;
    tokenCache.set(userId, { accessToken: access_token, expiresIn: expiry });

    const currentUser = await getCurrentUser(userId);
    const ytUserId = currentUser.id;

    await saveUserInfo(userId, refresh_token, ytUserId);
};

const getPlatformIdByName = async (platformName: string): Promise<number | null> => {
    const res = await pool.query(`SELECT id FROM platforms WHERE name = $1`, [platformName]);
    return res.rows[0]?.id || null;
};

const saveUserInfo = async (
    userId: number,
    refreshToken: string,
    ytUserId: string
): Promise<void> => {
    const platformId = await getPlatformIdByName("ytMusic");
    if (!platformId) throw new Error("Platform not found");

    const check = await pool.query(
        `SELECT id FROM linked_platforms WHERE user_id = $1 AND platform_id = $2`,
        [userId, platformId]
    );

    if (check.rows.length > 0) {
        await pool.query(
            `UPDATE linked_platforms 
       SET refresh_token = $1, user_platform_id = $2 
       WHERE user_id = $3 AND platform_id = $4`,
            [refreshToken, ytUserId, userId, platformId]
        );
    } else {
        await pool.query(
            `INSERT INTO linked_platforms 
       (user_id, platform_id, user_platform_id, refresh_token)
       VALUES ($1, $2, $3, $4)`,
            [userId, platformId, ytUserId, refreshToken]
        );
    }
};

const getRefreshTokenFromDB = async (userId: number): Promise<string | null> => {
    const platformId = await getPlatformIdByName("youtube");
    const res = await pool.query(
        `SELECT refresh_token FROM linked_platforms WHERE user_id = $1 AND platform_id = $2`,
        [userId, platformId]
    );
    return res.rows[0]?.refresh_token || null;
};

export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string, expiresIn: number } | null> => {
    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: process.env.YT_CLIENT_ID!,
            client_secret: process.env.YT_CLIENT_SECRET!,
            refresh_token: refreshToken,
            grant_type: "refresh_token"
        }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return {
        accessToken: data.access_token,
        expiresIn: Date.now() + data.expires_in * 1000
    };
};

export const getCurrentUser = async (userId: number): Promise<{ display_name: string, id: string }> => {
    const accessToken = await getAccessToken(userId);
    const response = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Accept": "application/json"
        }
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error("YouTube API error:", errorText);
        throw new Error(`YouTube API returned ${response.status}`);
    }
    const data = await response.json();
    return { display_name: data.items[0].snippet.title, id: data.items[0].id };
}

export const getAccessToken = async (userId: number): Promise<string> => {
    const cached = tokenCache.get(userId);
    if (cached && cached.expiresIn > Date.now()) return cached.accessToken;

    const refreshToken = await getRefreshTokenFromDB(userId);
    if (!refreshToken) throw new Error("User not linked with YouTube");

    const refreshed = await refreshAccessToken(refreshToken);
    if (!refreshed) throw new Error("Could not refresh token");

    tokenCache.set(userId, refreshed);
    return refreshed.accessToken;
};

const simplifyPlaylist = (playlist: any): Omit<Playlist, "tracks"> => ({
    id: playlist.id,
    name: playlist.snippet.title,
    imageUrl: playlist.snippet.thumbnails.default.url ?? "",
    // we'll fetch tracks separately
});
const simplifyTrack = (item: any): TrackUI => ({
    name: item.snippet.title,
    artistsNames: [""],// YouTube doesn't provide artist info
});

//TODO
const getTrackForAI = (item: any) => ({
    name: item.snippet.title,
    channel: item.snippet.videoOwnerChannelTitle,
    description: item.snippet.description,
});

export const getPlaylistsWithTracks = async (userId: number): Promise<Playlist[]> => {
    const accessToken = await getAccessToken(userId);
    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50`, {
        headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Accept": "application/json"
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("YouTube API error:", errorText);
        throw new Error(`YouTube API returned ${response.status}`);
    }

    const data = await response.json();
    const simplifiedPlaylists = data.items.map((playlist: any) => simplifyPlaylist(playlist));

    const playlistsWithTracks = await Promise.all(
        simplifiedPlaylists.map(async (playlist: any) => {
            const tracksData = await getTracksForPlaylist(playlist.id, accessToken);

            const simplifiedTracks: TrackUI[] = tracksData
                .map((item: any): TrackUI => simplifyTrack(item));

            return {
                ...playlist,
                tracks: simplifiedTracks
            };
        })
    );

    return playlistsWithTracks.filter((playlist: any) => playlist.tracks.length > 0);
};


export const getTracksForPlaylist = async (playlistId: string, accessToken: string): Promise<any[]> => {
    let allItems: any[] = [];
    let nextPageToken = "";

    do {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&pageToken=${nextPageToken}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Accept": "application/json"
            }
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error(`Error fetching tracks for playlist ${playlistId}:`, errorText);
            throw new Error(`YouTube playlistItems API returned ${res.status}`);
        }

        const data = await res.json();
        allItems = allItems.concat(data.items);
        nextPageToken = data.nextPageToken || "";
    } while (nextPageToken);

    return allItems;
};

