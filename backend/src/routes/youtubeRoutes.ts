import { Router } from "express";
import { login, callback, getPlaylistsWithTracks, getCurrentUser, search, getPlaylist } from "../controllers/youtubeController";
import { get } from "http";

const router = Router();

router.get("/login", login);
router.get("/callback", callback);
router.get("/me", getCurrentUser);
router.get("/playlists", getPlaylistsWithTracks);
router.get("/search", search);
router.get("/get-playlist", getPlaylist);

export default router;
