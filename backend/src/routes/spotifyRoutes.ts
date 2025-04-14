import { Router } from "express";
import {
  login,
  callback,
  search,
  createPlaylist,
  addTracks,
} from "../controllers/spotifyController";
import { tokenMiddleware } from "../middlewares/tokenMiddleware";

const router = Router();

router.get("/login", tokenMiddleware.validateJWT, login);
//router.get("/callback", tokenMiddleware.validateJWT, callback);
router.get("/search", search);
router.get("/create-playlist", createPlaylist);
router.post("/add-tracks", addTracks);

export default router;
