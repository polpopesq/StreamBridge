import { Router } from "express";
import spotifyRoutes from "./spotifyRoutes";
import authRoutes from "./authRoutes";

const router = Router();

router.use("/spotify", spotifyRoutes);
router.use("/auth", authRoutes);

export default router;