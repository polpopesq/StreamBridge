import { Router } from "express";
import {
  login,
  register,
  logout,
  getActiveUser,
} from "../controllers/authController";
import { tokenMiddleware } from "../middlewares/tokenMiddleware";

const router = Router();

router.post("/login", login);
router.post("/register", register);

//protected
router.post("/logout", tokenMiddleware.validateJWT, logout);
router.get("/me", tokenMiddleware.validateJWT, getActiveUser);

export default router;
