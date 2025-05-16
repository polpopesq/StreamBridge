import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/tokenMiddleware";
import * as ytService from "../services/ytService";

export const login = (req: Request, res: Response) => {
    const { url, state } = ytService.createLoginURL();
    res.cookie("oauth_state", state, { httpOnly: true, secure: true });
    res.redirect(url);
};

export const callback = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const code = req.query.code as string;
    const state = req.query.state;
    const originalState = req.cookies?.oauth_state;

    if (!state || state !== originalState) {
        res.status(403).send("Invalid state");
        return;
    }

    const userId = req.user?.user_id;
    if (!userId) return res.status(401).send("Not authenticated");

    await ytService.exchangeCodeForTokens(code, userId);
    res.clearCookie("oauth_state");
    res.redirect(`${process.env.FRONTEND_URL}/transfera/ytMusic`);
};

export const getPlaylistsWithTracks = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.user_id as number;
    try {
        const playlists = await ytService.getPlaylistsWithTracks(userId);

        res.status(200).json(playlists);
    } catch (error) {
        res.status(500).json({ "message": "Unexpected error fetching youtube user playlists." })
    }
}

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.user_id as number;
    try {
        const userData = await ytService.getCurrentUser(userId);
        res.status(200).json({ "youtube_display_name": userData.display_name });
    } catch (error) {
        res.status(500).json({ "message": "Unexpected error fetching youtube user data." })
    }
}
