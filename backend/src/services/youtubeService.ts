import dotenv from "dotenv";
import { pool } from "../config/db";
import crypto from "crypto";
import { Playlist } from "@shared/types";

export interface YoutubeTrack {
    name: string;
    channelName: string;
    youtubeId: string;
    description: string;
}

export interface YoutubePlaylist extends Omit<Playlist, "tracks"> {
    tracks: YoutubeTrack[];
}

dotenv.config();

const tokenCache = new Map<number, { accessToken: string, expiresAt: number }>();

const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
];

export class YouTubeAuthRequiredError extends Error {
    constructor() {
        super("User needs to authenticate with YouTube");
        this.name = "YouTubeAuthRequiredError";
    }
}

export interface YoutubeVideoDetails {
    youtubeId: string;
    name: string;
    description: string;
    channelName: string;
    duration: number;
    viewCount: number;
    isLicensed: boolean;
}

export const getVideoDetails = async (videoId: string, accessToken: string): Promise<YoutubeVideoDetails> => {

    const isoToSeconds = (duration: string): number => {
        const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
        const matches = duration.match(regex);
        if (!matches) return 0;

        const hours = parseInt(matches[1] || "0", 10);
        const minutes = parseInt(matches[2] || "0", 10);
        const seconds = parseInt(matches[3] || "0", 10);

        return hours * 3600 + minutes * 60 + seconds;
    };

    const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics,status&id=${videoId}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json"
        }
    });

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
        throw new Error(`Video with ID ${videoId} not found`);
    }

    const video = data.items[0];
    const { snippet, contentDetails, statistics, status } = video;

    return {
        youtubeId: videoId,
        name: snippet.title,
        description: snippet.description,
        channelName: snippet.channelTitle,
        duration: isoToSeconds(contentDetails.duration),
        viewCount: parseInt(statistics.viewCount ?? "0"),
        isLicensed: contentDetails.licensedContent ?? false,
    };
};

const createLoginURL = (step: string): { url: string; state: string } => {
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

export const prepareLoginRedirect = (step: string = "0") => {
    const { url, state } = createLoginURL(step);
    return { url, csrfToken: state.split("__")[0] };
}

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
    tokenCache.set(userId, { accessToken: access_token, expiresAt: expiry });

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

export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string, expiresAt: number } | null> => {
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

    console.log(await res.json());

    if (!res.ok) return null;
    const data = await res.json();
    return {
        accessToken: data.access_token,
        expiresAt: Date.now() + data.expires_in * 1000
    };
};

export const getYoutubeUser = async (userId: number): Promise<{ display_name: string, id: string }> => {
    const accessToken = await getAccessToken(userId);
    console.log("Access token: ", accessToken);
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
    if (cached && cached.expiresAt > Date.now()) return cached.accessToken;

    const refreshToken = await getRefreshTokenFromDB(userId);
    if (!refreshToken) throw new YouTubeAuthRequiredError();

    const refreshed = await refreshAccessToken(refreshToken);
    if (!refreshed) throw new YouTubeAuthRequiredError();

    tokenCache.set(userId, refreshed);
    return refreshed.accessToken;
};

const simplifyPlaylist = (playlist: any): Omit<Playlist, "tracks"> => ({
    id: playlist.id,
    name: playlist.snippet.title,
    imageUrl: playlist.snippet.thumbnails.default.url ?? "",
    public: playlist.status.privacyStatus === "public",
});
const simplifyTrack = (item: any): YoutubeTrack => ({
    name: item.snippet.title,
    channelName: item.snippet.videoOwnerChannelTitle,
    youtubeId: item.id,
    description: item.snippet.description
});

export const getPlaylistsWithTracksFromYoutube = async (userId: number): Promise<YoutubePlaylist[]> => {
    const accessToken = await getAccessToken(userId);

    try {
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
                const tracks = await getPlaylistTracks(playlist.id, accessToken);

                return {
                    ...playlist,
                    tracks
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

export const getPlaylistTracks = async (playlistId: string, accessToken: string): Promise<YoutubeTrack[]> => {
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
    const simplifiedTracks = allItems.map((track) => simplifyTrack(track))

    return simplifiedTracks;
};

export const searchTrack = async (
    name: string,
    artistsNames: string[],
    accessToken: string
): Promise<string> => {
    const query = `${name} ${artistsNames.join(" ")}`;

    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", query);
    url.searchParams.set("type", "video");
    url.searchParams.set("maxResults", "1");

    const res = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`Error searching track "${query}":`, errorText);
        throw new Error(`YouTube search API returned ${res.status}`);
    }

    const data = await res.json();
    const videoId = data.items?.[0]?.id?.videoId;

    if (!videoId) {
        throw new Error(`No results found for "${query}"`);
    }

    return videoId;
};

export const getYoutubeVideoDetails = async (
    youtubeId: string,
    accessToken: string
): Promise<YoutubeTrack> => {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${youtubeId}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json"
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch video details for ${youtubeId}: ${errorText}`);
    }

    const data = await response.json();
    const item = data.items?.[0];
    if (!item) {
        throw new Error(`No video found for YouTube ID ${youtubeId}`);
    }

    const snippet = item.snippet;

    return {
        name: snippet.title,
        channelName: snippet.channelTitle,
        youtubeId,
        description: snippet.description
    };
};

//TODO: incearca cu varianta cu detalii mai multe despre clip

export const getPlaylistById = async (userId: number, playlistId: string): Promise<YoutubePlaylist> => {
    const accessToken = await getAccessToken(userId);

    const playlistRes = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (!playlistRes.ok) {
        const text = await playlistRes.text();
        throw new Error(`Failed to fetch playlist metadata: ${text}`);
    }

    const playlistData = await playlistRes.json();

    const playlistWithoutTracks = simplifyPlaylist(playlistData);
    const tracks = await getPlaylistTracks(playlistWithoutTracks.id, accessToken);

    return {
        ...playlistWithoutTracks,
        tracks
    }
};
