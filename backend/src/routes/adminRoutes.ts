import { Router } from "express";
import {
    getMatchedSongs,
    getNonMatchedSongs,
    createMatchedSong,
    updateMatchedSong,
    updateNonMatchedSong,
    deleteMatchedSong,
    deleteNonMatchedSong,
} from "../controllers/adminController";

const router = Router();

router.get("/matched-songs", getMatchedSongs);
router.post("/matched-songs", createMatchedSong);
router.put("/matched-songs", updateMatchedSong);
router.delete("/matched-songs/:id", deleteMatchedSong);

router.get("/non-matched-songs", getNonMatchedSongs);
router.put("/non-matched-songs", updateNonMatchedSong);
router.delete("/non-matched-songs/:id", deleteNonMatchedSong);

export default router;
