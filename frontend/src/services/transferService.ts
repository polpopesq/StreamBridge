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