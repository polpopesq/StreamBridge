import { Router } from "express";
import {
  login,
  callback,
  search,
  createPlaylist,
  addTracks,
  getCurrentUser
} from "../controllers/spotifyController";

const router = Router();

router.get("/login", login);
router.get("/callback", callback);
router.get("/search", search);
router.get("/create-playlist", createPlaylist);
router.post("/add-tracks", addTracks);
router.get("/me", getCurrentUser);

export default router;
