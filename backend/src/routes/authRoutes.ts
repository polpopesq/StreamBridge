import { Router } from "express";
import {
  login,
  register,
  logout,
  getActiveUser,
  getUserInfo
} from "../controllers/authController";
import { tokenMiddleware } from "../middlewares/tokenMiddleware";

const router = Router();

router.post("/login", login);
router.post("/register", register);

//protected
router.get("/logout", tokenMiddleware.validateJWT, logout);
router.get("/me", tokenMiddleware.validateJWT, getActiveUser);
router.get("/info", tokenMiddleware.validateJWT, getUserInfo);

export default router;
