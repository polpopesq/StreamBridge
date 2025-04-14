import { Request, Response } from "express";
import {
  createLoginURL,
  exchangeCodeForTokens,
} from "../services/spotifyService";
import { AuthenticatedRequest } from "../middlewares/tokenMiddleware";

//pasul 1. apelam /login din backend
//aceasta ruta creeaza un url pe care utilizatorul este directionat sa se logheze si sa dea permisiuni
//daca accepta, e redirectionat catre redirect uri
export const login = (req: Request, res: Response): void => {
  const { url, state } = createLoginURL();
  res.cookie("oauth_state", state, { httpOnly: true, secure: true });
  res.redirect(url);
};

//asta e redirect uri, aici ajungi dupa ce primesti acordul userului
export const callback = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const code = req.query.code as string;
  const returnedState = req.query.state;
  const originalState = req.cookies?.oauth_state;

  if (!originalState || !returnedState || returnedState !== originalState) {
    res.status(403).send("Invalid or missing state parameter");
    return;
  }

  if (!code || typeof code !== "string") {
    res.status(403).send("Invalid Spotify code.");
  }

  const userId = req.user?.user_id;
  if (!userId) {
    res.status(401).json({ message: "User not authenticated" });
    return;
  }

  await exchangeCodeForTokens(code, userId);
};

export const search = (req: Request, res: Response) => {};

export const createPlaylist = (req: Request, res: Response) => {};

export const addTracks = (req: Request, res: Response) => {};
