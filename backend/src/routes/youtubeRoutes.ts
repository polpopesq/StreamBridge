import { Router } from "express";
import { login, callback, getPlaylistsWithTracks, getCurrentUser } from "../controllers/youtubeController";

const router = Router();

router.get("/login", login);
router.get("/callback", callback);
router.get("/me", getCurrentUser);
router.get("/playlists", getPlaylistsWithTracks);

export default router;
