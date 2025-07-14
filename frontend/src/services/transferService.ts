import { BACKEND_URL } from "../constants";
import { Mapping, PlatformKey, Playlist } from "@shared/types";

export const transferPlaylist = async (sourcePlatform: PlatformKey, destinationPlatform: PlatformKey, selectedPlaylist: Playlist): Promise<Mapping[]> => {
    const response = await fetch(`${BACKEND_URL}/transfer`, {
        method: "POST",
        body: JSON.stringify({
            sourcePlatform,
            destinationPlatform,
            selectedPlaylist,
        }),
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
    });

    const transferJson = await response.json();

    if (!response.ok) {
        throw new Error("Failed to transfer playlist: ", transferJson);
    }

    return transferJson;
}

export const proceedTransfer = async (sourcePlatform: PlatformKey, destinationPlatform: PlatformKey, mappings: Mapping[], playlistTitle: string, isPublic: boolean, ogPlaylistId: string): Promise<string> => {
    const response = await fetch(`${BACKEND_URL}/transfer/proceed`, {
        method: "POST",
        body: JSON.stringify({
            sourcePlatform,
            destinationPlatform,
            mappings,
            playlistTitle,
            isPublic,
            ogPlaylistId
        }),
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include"
    });

    const data = await response.json();
    const newPlaylistId = data.playlistId as string;

    if (!newPlaylistId) {
        console.error("Error: no playlist returned from /transfer/proceed!");
        return "";
    } else {
        const baseUrls: Record<PlatformKey, string> = {
            "spotify": 'https://open.spotify.com/playlist/',
            "youtube": 'https://www.youtube.com/playlist?list=',
            "txt": ""
        };
        return baseUrls[destinationPlatform] + newPlaylistId;
    }
}

export function extractSpotifyPlaylistId(url: string): string | null {
    const match = url.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}

export function extractYouTubePlaylistId(url: string): string | null {
    const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

export function detectPlaylistPlatform(url: string): 'spotify' | 'youtube' | null {
    if (/open\.spotify\.com\/playlist\/[a-zA-Z0-9]+/.test(url)) {
        return 'spotify';
    }

    if (/youtube\.com\/playlist\?list=/.test(url) || /youtu\.be\/.*[?&]list=/.test(url)) {
        return 'youtube';
    }

    return null;
}
