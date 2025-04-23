import { Router } from "express";
import spotifyRoutes from "./spotifyRoutes";
import authRoutes from "./authRoutes";
import { tokenMiddleware } from "../middlewares/tokenMiddleware";


const router = Router();

router.use("/spotify", tokenMiddleware.validateJWT, spotifyRoutes);
router.use("/auth", authRoutes);

export default router;
