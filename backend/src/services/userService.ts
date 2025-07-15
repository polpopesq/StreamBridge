import { FrontendUser } from "@shared/types";
import { pool } from "../config/db";
import bcrypt from "bcrypt";
import { Transfer, ProfileData } from "@shared/types";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import { youtubeToSpotifyTransfer } from "./transferServices.ts/fromYoutube";

const saltRounds = 10;

export interface User {
  id: number;
  email: string;
  password: string;
}

interface ResetTokenPayload {
  sub: number;
  jti: string;
  iat: number;
}

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '15m';

export const UserService = {
  findByEmail: async (email: string): Promise<User | null> => {
    try {
      const selectResult = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

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

  createUser: async (email: string, password: string): Promise<User | null> => {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      const insertResult = await pool.query(
        "INSERT INTO users (email, password, isadmin) VALUES ($1, $2, false) RETURNING *",
        [email, hashedPassword]
      );

      if (insertResult.rowCount == 0) {
        return null;
      }

      return insertResult.rows[0];
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  getUser: async (id: number): Promise<FrontendUser> => {
    const queryResult = await pool.query(
      "SELECT id, email, isadmin FROM users WHERE id = $1",
      [id]
    );

    const result = queryResult.rows[0];

    return {
      id: result.id,
      email: result.email,
      isAdmin: result.isadmin
    };
  },

  getProfileData: async (userId: number): Promise<ProfileData> => {
    const userResult = await pool.query(
      `SELECT email, youtube_id, spotify_id, isAdmin
         FROM users
         WHERE id = $1`,
      [userId]
    );

    if (userResult.rowCount === 0) {
      throw new Error("User not found");
    }

    const user = userResult.rows[0];

    const transfersResult = await pool.query(
      `SELECT source_platform, destination_platform, playlist_source_id, playlist_destination_id, status, created_at
         FROM transfers
         WHERE user_id = $1
         ORDER BY created_at DESC`,
      [userId]
    );

    const transfers: Transfer[] = transfersResult.rows.map((t) => ({
      sourcePlatform: t.source_platform,
      destinationPlatform: t.destination_platform,
      sourceId: t.playlist_source_id,
      destinationId: t.playlist_destination_id,
      status: t.status,
      createdAt: t.created_at.toISOString(),
    }));

    const profileData: ProfileData = {
      email: user.email,
      isYoutubeConnected: !!user.youtube_id,
      isSpotifyConnected: !!user.spotify_id,
      isAdmin: user.isadmin,
      transfers,
    };

    return profileData;
  },

  generateResetToken: (email: string): string => {
    const jti = uuidv4();

    return jwt.sign(
      {
        sub: email,
        jti,
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  },

  sendResetPasswordEmail: async (email: string, resetLink: string) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: '"StreamBridge" <paul.popescu2003@gmail.com>',
      to: email,
      subject: 'Resetare parola',
      html: `
      <p>Ai solicitat resetarea parolei.</p>
      <p>Click <a href="${resetLink}">aici</a> pentru a seta o parolă nouă.</p>
      <p>Linkul expiră în 15 minute.</p>
    `,
    };

    await transporter.sendMail(mailOptions);
  },

  verifyResetToken: async (token: string): Promise<number> => {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.sub !== "string"
    ) throw new Error("Bad token.");

    const user = await UserService.findByEmail(decoded.sub);
    if (!user) throw new Error("No user found by the token.");

    return user.id;
  },

  setNewPassword: async (userId: number, newPassword: string) => {
    const encodedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    const result = await pool.query("UPDATE users SET password = $1 WHERE id=$2", [encodedNewPassword, userId]);
    if (result.rowCount === 0) {
      throw new Error(`User with ID ${userId} not found.`);
    }
  }
}