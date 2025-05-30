import { Response } from "express";
import * as transferService from "../services/transferServices.ts";
import { AuthenticatedRequest } from "middlewares/tokenMiddleware";
export type PlatformKey = 'spotify' | 'youtube' | 'txt';


export const transferPlaylist = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.user_id as number;
    const sourcePlatform = req.body.sourcePlatform as PlatformKey;
    const destinationPlatform = req.body.destinationPlatform as PlatformKey;
    const playlistId = req.body.playlistId as string;

    if (!userId || !sourcePlatform || !destinationPlatform || !playlistId) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }

    try {
        const result = await transferService.transferPlaylist(userId, sourcePlatform, destinationPlatform, playlistId);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error transferring playlists:", error);
        res.status(500).json({ message: "Error transferring playlists" });
    }
};