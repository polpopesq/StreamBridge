import { Router } from "express";
import spotifyRoutes from "./spotifyRoutes";
import ytRoutes from "./youtubeRoutes";
import authRoutes from "./authRoutes";
import transferRoutes from "./transferRoutes";
import { tokenMiddleware } from "../middlewares/tokenMiddleware";
import { adminMiddleware } from "../middlewares/adminMiddleware";
import adminRoutes from "./adminRoutes";

const router = Router();

router.use("/spotify", tokenMiddleware.validateJWT, spotifyRoutes);
router.use("/youtube", tokenMiddleware.validateJWT, ytRoutes);
router.use("/auth", authRoutes);
router.use("/transfer", tokenMiddleware.validateJWT, transferRoutes);
router.use("/admin", tokenMiddleware.validateJWT, adminMiddleware.validateAdmin, adminRoutes);

export default router;
