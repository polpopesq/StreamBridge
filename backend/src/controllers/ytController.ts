import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/tokenMiddleware";
import * as youtubeService from "../services/ytService";

export const login = (req: Request, res: Response) => {
    const { url, state } = youtubeService.createLoginURL();
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

    await youtubeService.exchangeCodeForTokens(code, userId);
    res.clearCookie("oauth_state");
    res.redirect(`${process.env.FRONTEND_URL}/transfera/youtube`);
};
