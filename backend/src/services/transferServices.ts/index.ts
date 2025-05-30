
import { PlatformKey } from "../../controllers/transferController";
import { spotifyToYoutubeTransfer, spotifyToTxtTransfer } from "./fromSpotify";
import { youtubeToSpotifyTransfer } from "./fromYoutube";

type TransferHandler = (userId: number, playlistId: string) => Promise<any>;

const transferHandlers: Record<string, TransferHandler> = {
    "spotify|youtube": async (userId: number, playlistId: string) => {
        return await spotifyToYoutubeTransfer(userId, playlistId);
    },
    "youtube|spotify": async (userId, playlistId) => {
        return await youtubeToSpotifyTransfer(userId, playlistId);
    },
    "youtube|txt": async (userId, playlistId) => {
        return await youtubeToTxtTransfer(userId, playlistId);
    },
    "txt|youtube": async (userId, playlistId) => {
        return await txtToYoutubeTransfer(userId, playlistId);
    },
    "spotify|txt": async (userId, playlistId) => {
        return await spotifyToTxtTransfer(userId, playlistId);
    },
    "txt|spotify": async (userId, playlistId) => {
        return await txtToSpotifyTransfer(userId, playlistId);
    },
};

export const transferPlaylist = async (
    userId: number,
    source: PlatformKey,
    target: PlatformKey,
    playlistId: string
) => {
    if (source === target) {
        throw new Error("Source and target platforms must be different");
    }

    const key = `${source}|${target}`;
    const handler = transferHandlers[key];

    if (!handler) {
        throw new Error(`Unsupported platform transfer: ${source} → ${target}`);
    }

    try {
        const playlistToTransfer = await handler(userId, playlistId);
        return playlistToTransfer;
    } catch (error) {
        console.error("Error transferring playlist:", error);
        throw new Error("Error during playlist transfer");
    }
};


