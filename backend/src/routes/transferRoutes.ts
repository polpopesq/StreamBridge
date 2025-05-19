import { Router } from "express";
import { transferPlaylist, checkPlatformConnected } from "../controllers/transferController";

const router = Router();

router.post("/", transferPlaylist);
router.get("/checkPlatformConnected", checkPlatformConnected);

export default router;