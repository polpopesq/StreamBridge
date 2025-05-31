
import { PlatformKey } from "../../controllers/transferController";
import { spotifyToYoutubeTransfer, spotifyToTxtTransfer } from "./fromSpotify";
import { youtubeToSpotifyTransfer, youtubeToTxtTransfer } from "./fromYoutube";
import { txtToSpotifyTransfer, txtToYoutubeTransfer } from "./fromTxt";

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
    "txt|youtube": async (userId, txtContent) => {
        return await txtToYoutubeTransfer(userId, txtContent);
    },
    "spotify|txt": async (userId, playlistId) => {
        return await spotifyToTxtTransfer(userId, playlistId);
    },
    "txt|spotify": async (userId, txtContent) => {
        return await txtToSpotifyTransfer(userId, txtContent);
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


