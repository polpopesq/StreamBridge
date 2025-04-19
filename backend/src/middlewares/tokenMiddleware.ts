import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
export const AUTH_COOKIE = "auth_token";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret";

//This interface ensures we have a user_id property inside the token, along with standard JWT fields (iat, exp, etc.)
export interface AuthPayload extends JwtPayload {
  user_id: number;
}

//Extend Express’s Request type so that route handlers can safely do req.user.
export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

export const tokenMiddleware = {
  //This is called after a user logs in or registers, and is usually stored in a cookie.
  signJWT: (payload: AuthPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
  },

  validateJWT: (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.[AUTH_COOKIE];

    if (!token) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
      (req as AuthenticatedRequest).user = decoded;
      next();
    } catch {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }
  },

  clearCookie: (res: Response): void => {
    res.clearCookie(AUTH_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  },
};
