import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middlewares/tokenMiddleware";
import * as youtubeService from "../services/youtubeService";
import { access } from "fs";

export const login = (req: Request, res: Response) => {
    const step = req.query.step as string || "0";
    const { url, csrfToken } = youtubeService.prepareLoginRedirect(step);

    res.cookie("oauth_state", csrfToken, { httpOnly: true, secure: true });
    res.redirect(url);
};

export const callback = async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    const code = req.query.code as string;
    const state = req.query.state;
    const originalState = req.cookies?.oauth_state;

    if (!state || !originalState) {
        res.status(403).send("Missing state");
        return;
    }

    const [csrfToken, step] = (state as string).split("__");
    const stepNumber = parseInt(step);

    if (csrfToken !== originalState) {
        res.status(403).send("Invalid state.");
        return;
    }

    const userId = req.user?.user_id;
    if (!userId) {
        res.status(401).json({ message: "User not authenticated" });
        return;
    }

    await youtubeService.exchangeCodeForTokens(code, userId);
    res.clearCookie("oauth_state");
    res.redirect(`${process.env.FRONTEND_URL}/transfera?step=${stepNumber + 1}`);
};

export const getPlaylistsWithTracks = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.user_id as number;
    try {
        const playlists = await youtubeService.getPlaylistsWithTracksFromYoutube(userId);
        res.status(200).json(playlists);
    } catch (error) {
        if (error instanceof youtubeService.YouTubeAuthRequiredError) {
            const { url, csrfToken } = youtubeService.prepareLoginRedirect();
            res.cookie("oauth_state", csrfToken, { httpOnly: true, secure: true });
            return res.redirect(url);
        }
        res.status(500).json({ "message": "Unexpected error fetching youtube user playlists." })
    }
}

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.user_id as number;
    try {
        const userData = await youtubeService.getYoutubeUser(userId);
        res.status(200).json({ "youtube_display_name": userData.display_name });
    } catch (error) {
        if (error instanceof youtubeService.YouTubeAuthRequiredError) {
            const { url, csrfToken } = youtubeService.prepareLoginRedirect();
            res.cookie("oauth_state", csrfToken, { httpOnly: true, secure: true });
            return res.redirect(url);
        }
        res.status(500).json({ "message": "Unexpected error fetching youtube user data." })
    }
}

export const search = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.user_id as number;
    const query = req.query.query as string;
    if (!query) {
        res.status(400).json({ error: "Missing query parameter" });
        return;
    }

    const accessToken = await youtubeService.getAccessToken(userId);

    const youtubeTracks = await youtubeService.searchTracks(query, accessToken, 10);
    if (!youtubeTracks) {
        res.status(404).json({ message: `No Youtube tracks found for query ${query}` });
        return;
    }

    res.status(200).json(youtubeTracks);
}
