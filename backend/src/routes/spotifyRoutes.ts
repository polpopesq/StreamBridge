import { Router } from "express";
import {
  login,
  callback,
  search,
  getCurrentUser,
  getPlaylistsWithTracks,
  getPlaylist
} from "../controllers/spotifyController";

const router = Router();

router.get("/login", login);
router.get("/callback", callback);
router.get("/search", search);
router.get("/me", getCurrentUser);
router.get("/playlists", getPlaylistsWithTracks);
router.get("/get-playlist", getPlaylist);


export default router;
