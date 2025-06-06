import { BACKEND_URL } from "../constants";
import { Mapping, PlatformKey } from "@shared/types";

export const transferPlaylist = async (sourcePlatform: PlatformKey, destinationPlatform: PlatformKey, playlistId: string): Promise<Mapping[]> => {
    const response = await fetch(`${BACKEND_URL}/transfer`, {
        method: "POST",
        body: JSON.stringify({
            sourcePlatform,
            destinationPlatform,
            playlistId,
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

export const proceedTransfer = async (sourcePlatform: PlatformKey, destinationPlatform: PlatformKey, mappings: Mapping[], playlistTitle: string, isPublic: boolean): Promise<string> => {
    const response = await fetch(`${BACKEND_URL}/transfer/proceed`, {
        method: "POST",
        body: JSON.stringify({
            sourcePlatform,
            destinationPlatform,
            mappings,
            playlistTitle,
            isPublic
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