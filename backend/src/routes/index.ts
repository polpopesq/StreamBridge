import { Router } from "express";
import spotifyRoutes from "./spotifyRoutes";
import ytRoutes from "./ytRoutes";
import authRoutes from "./authRoutes";
import transferRoutes from "./transferRoutes";
import { tokenMiddleware } from "../middlewares/tokenMiddleware";

const router = Router();

router.use("/spotify", tokenMiddleware.validateJWT, spotifyRoutes);
router.use("/ytmusic", tokenMiddleware.validateJWT, ytRoutes);
router.use("/auth", authRoutes);
router.use("/transfer", tokenMiddleware.validateJWT, transferRoutes);

export default router;
