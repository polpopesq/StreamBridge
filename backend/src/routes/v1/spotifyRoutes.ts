import { Router } from "express";
import * as spotifyController from "../../controllers/spotifyController";

const router = Router();

router.get("/login", spotifyController.login);
router.get("/callback", spotifyController.callback);

export default router;