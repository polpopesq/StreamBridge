import dotenv from "dotenv";
import { pool } from "../config/db";
import crypto from "crypto";
import { Playlist, TrackUI } from "@shared/types";

dotenv.config();

const tokenCache = new Map<number, { accessToken: string, expiresIn: number }>();

const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
];

export const createLoginURL = (step: string): { url: string; state: string } => {
    const csrfToken = crypto.randomBytes(16).toString("hex");
    const state = `${csrfToken}__${step}`;
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

    const currentUser = await getYoutubeUser(userId);
    const ytUserId = currentUser.id;

    await saveUserInfo(userId, refresh_token, ytUserId);
};

const saveUserInfo = async (
    userId: number,
    refreshToken: string,
    ytUserId: string
): Promise<void> => {
    try {
        const updateQuery = `
        UPDATE users
        SET youtube_id = $2, youtube_refresh_token = $3
        WHERE id = $1;
    `
        await pool.query(
            updateQuery,
            [userId, ytUserId, refreshToken]
        );
        const userPlaylists = await getPlaylistsWithTracksFromYoutube(userId);
        console.log("saving playlists:", userPlaylists);
        await Promise.all(
            userPlaylists.map((playlist) => savePlaylist(userId, playlist))
        );
    } catch (error) {
        console.error("Error saving user info:", error);
        throw new Error("Failed to save user info");
    }
};

const getRefreshTokenFromDB = async (userId: number): Promise<string | null> => {
    try {
        const res = await pool.query(
            `SELECT youtube_refresh_token
             FROM users
             WHERE id = $1
             `,
            [userId]
        );
        return res.rows[0].youtube_refresh_token;
    }
    catch (error) {
        console.error("Error loading refresh token:", error);
        return null;
    }
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

export const getYoutubeUser = async (userId: number): Promise<{ display_name: string, id: string }> => {
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
    if (!refreshToken) throw new Error("User not linked with YouTube. Start the OAuth flow.");

    const refreshed = await refreshAccessToken(refreshToken);
    if (!refreshed) throw new Error("Could not refresh token");

    tokenCache.set(userId, refreshed);
    return refreshed.accessToken;
};

const simplifyPlaylist = (playlist: any): Omit<Playlist, "tracks"> => ({
    id: playlist.id,
    name: playlist.snippet.title,
    imageUrl: playlist.snippet.thumbnails.default.url ?? "",
    public: playlist.status.privacyStatus === "public",
    // we'll fetch tracks separately
});
const simplifyTrack = (item: any): YoutubeTrack => ({
    name: item.snippet.title,
    channelName: item.snippet.channelTitle,
    youtubeId: item.id,
});

export const getPlaylistsWithTracksFromYoutube = async (userId: number): Promise<YoutubePlaylist[]> => {
    try {
        const accessToken = await getAccessToken(userId);
        const response = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails,status&mine=true&maxResults=50`, {
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

                const simplifiedTracks: YoutubeTrack[] = tracksData
                    .map((item: any): YoutubeTrack => simplifyTrack(item));

                return {
                    ...playlist,
                    tracks: simplifiedTracks
                };
            })
        );
        return playlistsWithTracks.filter((playlist: any) => playlist.tracks.length > 0);
    }
    catch (error) {
        console.error("Eroare la fetch din yt: ", error);
        return [];
    }
};

export const getPlaylistsWithTracksFromDB = async (userId: number): Promise<YoutubePlaylist[]> => {
    const playlistsQuery = `
        SELECT id, name, image_url, youtube_id, public
        FROM playlists
        WHERE user_id = $1
      `;
    const playlistsResult = await pool.query(playlistsQuery, [userId]);

    const playlists: YoutubePlaylist[] = [];

    for (const row of playlistsResult.rows) {
        const playlistId = row.id;

        const tracksQuery = `
          SELECT t.name, t.artists_names, t.youtube_id
          FROM playlist_tracks pt
          JOIN tracks t ON pt.track_id = t.id
          WHERE pt.playlist_id = $1
          ORDER BY pt.position
        `;
        const tracksResult = await pool.query(tracksQuery, [playlistId]);

        const tracks: YoutubeTrack[] = tracksResult.rows.map((track: any) => ({
            name: track.name,
            channelName: track.channel_name,
            youtubeId: track.youtube_id
        }));

        playlists.push({
            id: row.spotify_id,
            name: row.name,
            imageUrl: row.image_url,
            tracks,
            public: row.public
        });
    }

    return playlists;
}


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

interface YoutubeTrack {
    name: string;
    channelName: string;
    youtubeId: string;
}

interface YoutubePlaylist extends Omit<Playlist, "tracks"> {
    tracks: YoutubeTrack[];
}

const savePlaylist = async (userId: number, playlist: YoutubePlaylist): Promise<void> => {
    try {
        const playlistQuery = `
    INSERT INTO playlists (user_id, youtube_id, image_url, name)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (youtube_id, user_id) DO UPDATE
    SET name = EXCLUDED.name,
        image_url = EXCLUDED.image_url
  `;
        await pool.query(playlistQuery, [userId, playlist.id, playlist.imageUrl, playlist.name]);

        const trackPromises = playlist.tracks.map(async (track, index) => {
            const insertTrackQuery = `
      INSERT INTO tracks (name, channel_name, youtube_id)
      VALUES ($1, $2, $3)
      ON CONFLICT (youtube_id) DO NOTHING
    `;

            const insertPlaylistTrackQuery = `
      INSERT INTO playlist_tracks (playlist_id, track_id, position)
      VALUES (
        (SELECT id FROM playlists WHERE youtube_id = $1 AND user_id = $2),
        (SELECT id FROM tracks WHERE youtube_id = $3),
        $4
      )
      ON CONFLICT DO NOTHING
    `;

            await pool.query(insertTrackQuery, [track.name, track.channelName, track.youtubeId]);
            await pool.query(insertPlaylistTrackQuery, [playlist.id, userId, track.youtubeId, index]);
        });

        await Promise.all(trackPromises);
    }
    catch (error) {
        console.error(error);
    }
};

//TODO
const getTrackForAI = (item: any) => ({
    name: item.snippet.title,
    channel: item.snippet.videoOwnerChannelTitle,
    description: item.snippet.description,
});