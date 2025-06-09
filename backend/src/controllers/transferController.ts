import { Response } from "express";
import * as transferService from "../services/transferServices.ts";
import { AuthenticatedRequest } from "middlewares/tokenMiddleware";
import { Mapping, PlatformKey, Playlist } from "@shared/types.js";

export const transferPlaylist = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.user_id as number;
    const sourcePlatform = req.body.sourcePlatform as PlatformKey;
    const destinationPlatform = req.body.destinationPlatform as PlatformKey;
    const playlist = req.body.selectedPlaylist as Playlist;

    if (!userId || !sourcePlatform || !destinationPlatform || !playlist) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }

    try {
        const result = await transferService.transferPlaylist(userId, sourcePlatform, destinationPlatform, playlist);
        res.status(200).json(result);
    } catch (error) {
        console.error("Error transferring playlists:", error);
        res.status(500).json({ message: "Error transferring playlists" });
    }
};

export const proceedTransfer = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.user_id as number;
    const sourcePlatform = req.body.sourcePlatform as PlatformKey;
    const destinationPlatform = req.body.destinationPlatform as PlatformKey;
    const mappings = req.body.mappings as Mapping[];
    const playlistTitle = req.body.playlistTitle as string;
    const isPublic = req.body.isPublic as boolean;
    const ogPlaylistId = req.body.ogPlaylistId as string;

    if (!userId || !sourcePlatform || !destinationPlatform || !mappings || !playlistTitle || isPublic === null || !ogPlaylistId) {
        res.status(400).json({ message: "Missing required fields" });
        return;
    }

    try {
        const serviceResult = await transferService.proceedTransfer(userId, sourcePlatform, destinationPlatform, mappings, playlistTitle, isPublic, ogPlaylistId);
        res.status(201).json({ playlistId: serviceResult });
    } catch (error) {
        console.error("Error finishing transfer:", error);
        res.status(500).json({ message: "Error finishing transfer" });
    }
}