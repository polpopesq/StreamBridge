import { pool } from "../config/db";
import dotenv from "dotenv";
import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./tokenMiddleware";

dotenv.config();

export const adminMiddleware = {
    validateAdmin: async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.user_id;
        if (!userId) {
            res.status(401).json({ message: "Not authenticated" });
        }

        try {
            const result = await pool.query("SELECT * from users WHERE id = $1", [userId]);
            const user = result.rows[0]

            if (!user || !user.isadmin) {
                res.status(403).json({ message: "Admin access required" });
            }

            next();
        } catch (err) {
            res.status(401).json({ message: "Error checking admin status" });
        }
    }
};
