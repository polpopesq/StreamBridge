import { BACKEND_URL, PlatformKey } from "../constants";

export const transferPlaylist = async (
    sourcePlatform: PlatformKey,
    destinationPlatform: PlatformKey,
    playlistId: string,
) => {
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

    if (!response.ok) {
        throw new Error("Failed to transfer playlist");
    }

    return response.json();
}