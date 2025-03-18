import { pool } from "../../config/db";
import bcrypt from "bcrypt";

const saltRounds = 10;

//TODO: create an user type which shall be returned from this function, or null, same for isPasswordMatch
export const UserService = {
    findByEmail: async (email: string): Promise<any> => {
        try {
            const selectResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

            if (selectResult.rowCount == 0) {
                return null;
            }

            return selectResult.rows[0];
        } catch (err) {
            console.error(err);
            return null;
        }
    },

    isPasswordMatch: async (user: any, password: string): Promise<boolean> => {
        const isMatch = await bcrypt.compare(password, user.password);
        return isMatch;
    },

    createUser: async (email : string, password : string): Promise<any> => {
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        try {
            const insertResult = await pool.query(
                "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
                [email, hashedPassword]
            );

            if (insertResult.rowCount == 0) {
                return null;
            }

            return insertResult.rows[0];
        } catch(err) {
            console.error(err);
            return null;
        }        
    }
}

