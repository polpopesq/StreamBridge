import { Request, Response } from "express";
import * as spotifyService from "../services/spotifyService";
import { AuthenticatedRequest } from "../middlewares/tokenMiddleware";
import dotenv from "dotenv";
import { Playlist } from "@shared/types";

dotenv.config();

export const login = (req: Request, res: Response): void => {
  const step = req.query.step as string || "profile";
  const { url, csrfToken } = spotifyService.prepareLoginRedirect(step);

  res.cookie("oauth_state", csrfToken, { httpOnly: true, secure: true });
  res.redirect(url);
};

export const callback = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const code = req.query.code as string;
  const returnedState = req.query.state;
  const originalState = req.cookies?.oauth_state;

  if (!returnedState || !originalState) {
    res.status(403).send("Missing state.");
    return;
  }

  if (!code || typeof code !== "string") {
    res.status(403).send("Invalid Spotify code.");
  }

  const [csrfToken, step] = (returnedState as string).split("__");

  if (csrfToken !== originalState) {
    res.status(403).send("Invalid state.");
    return;
  }

  const userId = req.user?.user_id;
  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  await spotifyService.exchangeCodeForTokens(code, userId);
  res.clearCookie("oauth_state");
  const stepNumber = parseInt(step);
  if (isNaN(stepNumber)) {
    res.redirect(`${process.env.FRONTEND_URL}/profil`);
    return;
  }
  res.redirect(`${process.env.FRONTEND_URL}/transfera/?step=${stepNumber + 1}`);
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.user_id as number;
  try {
    const userData = await spotifyService.getSpotifyUser(userId);
    res.status(200).json({ "spotify_display_name": userData.display_name });
  } catch (error) {
    res.status(500).json({ "message": "Unexpected error fetching spotify user data." })
  }
}

export const getPlaylistsWithTracks = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.user_id as number;
  try {
    const playlists = await spotifyService.getUserPlaylistsWithTracks(userId);
    res.status(200).json(playlists);
  } catch (error) {
    res.status(500).json({ "message": "Unexpected error fetching spotify user playlists." })
  }
}

export const search = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.user_id as number;
  const query = req.query.query as string;
  if (!query) {
    res.status(400).json({ error: "Missing query parameter" });
    return;
  }

  const accessToken = await spotifyService.getAccessToken(userId);

  const spotifyTracks = await spotifyService.searchTracks(query, accessToken, 10);
  if (!spotifyTracks) {
    res.status(404).json({ message: `No Spotify tracks found for query ${query}` });
    return;
  }

  res.status(200).json(spotifyTracks);
};

export const getPlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const playlistId = req.query.id as string;
    const userId = req.user?.user_id;

    if (!playlistId || !userId) {
      res.status(400).json({ message: "Missing link or user" });
      return;
    }

    const playlist: Playlist = await spotifyService.getPlaylistFromSpotify(userId, playlistId);
    res.json(playlist);
  } catch (err) {
    console.error("Error in getPlaylist:", err);
    res.status(500).json({ message: "Failed to fetch playlist" });
  }
};