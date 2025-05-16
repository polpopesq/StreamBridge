import { Router } from "express";
import { transferPlaylist } from "../controllers/transferController";

const router = Router();

router.post("/", transferPlaylist);

export default router;