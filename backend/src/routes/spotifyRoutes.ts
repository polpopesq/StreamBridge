import { Router } from "express";
import {
  login,
  callback,
  search,
  createPlaylist,
  addTracks,
} from "../controllers/spotifyController";

const router = Router();

router.get("/login", login);
router.get("/callback", callback);
router.get("/search", search);
router.get("/create-playlist", createPlaylist);
router.post("/add-tracks", addTracks);

export default router;
