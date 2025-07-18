import { Request, Response } from "express";
import { UserService } from "../services/userService";
import {
  AuthenticatedRequest,
  tokenMiddleware,
} from "../middlewares/tokenMiddleware";
import { AUTH_COOKIE } from "../middlewares/tokenMiddleware";

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const user = await UserService.findByEmail(email);
  if (user === null) {
    res.status(404).json({ message: `User with email ${email} not found.` });
    return;
  }

  const isMatch = await UserService.isPasswordMatch(user, password);
  if (!isMatch) {
    res.status(400).json({ message: "Invalid credentials." });
    return;
  }

  const token = tokenMiddleware.signJWT({ user_id: user.id });

  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600000,
  });

  res.status(200).json({ message: "Login successful" });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const searchUser = await UserService.findByEmail(email);
  if (searchUser !== null) {
    res
      .status(409)
      .json({ message: `User with email ${email} already exists.` });
    return;
  }

  const newUser = await UserService.createUser(email, password);
  if (newUser === null) {
    res
      .status(500)
      .json({ message: "Unexpected error on creating new user in DB." });
    return;
  }

  res.status(201).json({ message: "User created" });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  tokenMiddleware.clearCookie(res);
  res.json({ message: "Logged out" });
};

export const getActiveUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  if (req.user) {
    const user = await UserService.getUser(req.user.user_id);
    res.status(200).json(user)
  } else res.status(404).send({ message: "User not found." })
};

export const getUserInfo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const profile = await UserService.getProfileData(userId);
    res.status(200).json(profile);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await UserService.findByEmail(email);
  if (!user) {
    res.status(404).send({ message: `User with email ${email} not found.` });
    return;
  }

  const token = UserService.generateResetToken(user.email);
  const resetLink = `${process.env.FRONTEND_URL}/new-password/${token}`;

  await UserService.sendResetPasswordEmail(user.email, resetLink);
  res.status(200).json({ message: "Email trimis cu succes." });
}

export const setNewPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  try {
    const userId = await UserService.verifyResetToken(token);
    await UserService.setNewPassword(userId, newPassword);
    res.status(204).json({ message: "Parola a fost schimbata cu succes." })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    res.status(400).send({ message: `${errorMessage}; password not updated.` });
    return;
  }
}