import { Request, Response } from "express";
import * as transferService from "../services/transferService";
import { AuthenticatedRequest } from "middlewares/tokenMiddleware";

export const transferPlaylist = async (req: AuthenticatedRequest, res: Response) => {
    console.log("req body from transferControoler", req.body);
    console.log("req user from transferControoler", req.user);
    const userId = req.user?.user_id as number;
    const { source, target } = req.body;

    // try {
    //     const result = await transferService.transferPlaylists(userId, source, target);
    //     res.status(200).json(result);
    // } catch (error) {
    //     console.error("Error transferring playlists:", error);
    //     res.status(500).json({ message: "Error transferring playlists" });
    // }
};