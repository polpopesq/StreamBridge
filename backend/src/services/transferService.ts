import dotenv from "dotenv";
import { pool } from "../config/db";

dotenv.config();

const getTransferHistory = async (userId: number) => {
    try {
        const result = await pool.query(
            "SELECT * FROM transfer_history WHERE user_id = $1",
            [userId]
        );
        return result.rows;
    } catch (error) {
        console.error("Error fetching transfer history:", error);
        throw new Error("Error fetching transfer history");
    }
}
export const transferPlaylists = async (userId: number, source: string, target: string) => {
    try {
        const result = await pool.query(
            "INSERT INTO transfer_history (user_id, source_platform, target_platform) VALUES ($1, $2, $3) RETURNING *",
            [userId, source, target]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error transferring playlists:", error);
        throw new Error("Error transferring playlists");
    }
}
