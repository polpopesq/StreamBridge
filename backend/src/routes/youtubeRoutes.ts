import { Router } from "express";
import { login, callback, getPlaylistsWithTracks, getCurrentUser, search } from "../controllers/youtubeController";

const router = Router();

router.get("/login", login);
router.get("/callback", callback);
router.get("/me", getCurrentUser);
router.get("/playlists", getPlaylistsWithTracks);
router.get("/search", search);

export default router;
