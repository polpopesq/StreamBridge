import dotenv from "dotenv";
import { pool } from "../config/db";
import { PlatformKey } from "../controllers/transferController";

dotenv.config();

export const transferPlaylists = async (userId: number, source: PlatformKey, target: PlatformKey, playlistId: string) => {
    try {
        if (source === target) {
            throw new Error("Source and target platforms must be different");
        }
        const sourceCheckQuery = `
            SELECT * FROM linked_platforms
            WHERE user_id = $1 AND platform_id = $2
        `;
        const sourceCheckValues = [userId, source];
        const sourceCheckResult = await pool.query(sourceCheckQuery, sourceCheckValues);
        if (sourceCheckResult.rowCount === 0) {
            throw new Error(`User does not have ${source} connected`);
        }

        const targetCheckQuery = `
            SELECT * FROM linked_platforms
            WHERE user_id = $1 AND platform_id = $2
        `;
        const targetCheckValues = [userId, target];
        const targetCheckResult = await pool.query(targetCheckQuery, targetCheckValues);
        if (targetCheckResult.rowCount === 0) {
            throw new Error(`User does not have ${target} connected`);
        }


    } catch (error) {
        console.error("Error transferring playlists:", error);
        throw new Error("Error transferring playlists");
    }
}

export const isPlatformConnected = async (userId: number, platform: PlatformKey): Promise<boolean> => {
    try {
        const query = `
            SELECT ${platform}_id, ${platform}_refresh_token FROM users
            WHERE id = $1
        `;
        const values = [userId];
        const result = await pool.query(query, values);

        return result.rowCount !== null
            && result.rowCount > 0
            && result.rows[0][`${platform}_id`] !== null
            && result.rows[0][`${platform}_refresh_token`] !== null;
    } catch (error) {
        console.error("Error checking platform connection:", error);
        throw new Error("Error checking platform connection");
    }
}