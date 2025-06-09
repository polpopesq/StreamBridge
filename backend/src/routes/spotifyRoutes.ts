import { Router } from "express";
import {
  login,
  callback,
  search,
  getCurrentUser,
  getPlaylistsWithTracks
} from "../controllers/spotifyController";

const router = Router();

router.get("/login", login);
router.get("/callback", callback);
router.get("/search", search);
router.get("/me", getCurrentUser);
router.get("/playlists", getPlaylistsWithTracks);

export default router;
