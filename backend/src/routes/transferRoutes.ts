import { Router } from "express";
import { transferPlaylist, proceedTransfer } from "../controllers/transferController";

const router = Router();

router.post("/", transferPlaylist);
router.post("/proceed", proceedTransfer);

export default router;