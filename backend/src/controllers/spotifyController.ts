import { Request, Response } from "express"
import { exchangeCodeForToken, generateAuthUrl } from "../services/spotify/spotifyAuthService";

export const login = (req: Request, res: Response): void => {
    const authUrl = generateAuthUrl();
    res.redirect(authUrl);
}

export const callback = async (req: Request, res: Response): Promise<void> => {
    var code = req.query.code as string | null;
    var state = req.query.state as string | null;
    var error = req.query.error as string | null;

    if (error) {
        console.error(`Authorization failed: ${error}`);
        res.status(400).send({ error: `Authorization failed: ${error}` });
        return;
    }

    if (!state) {
        res.status(400).json({ error: "State mismatch" });
        return;
    }

    if (!code) {
        res.status(400).json({ error: "Authorization code missing" });
        return;
    }

    try {
        const tokenData = await exchangeCodeForToken(code);
        res.json(tokenData);

    } catch (err) {
        res.status(500).send({error: "Failed to obtain access token"});
    }
}