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

export const checkPlatformConnected = async (platform: PlatformKey) => {
    const response = await fetch(`${BACKEND_URL}/transfer/checkPlatformConnected?platform=${platform}`, {
        method: "GET",
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Failed to check platform connection");
    }

    const json = await response.json();
    return json?.isConnected;
}