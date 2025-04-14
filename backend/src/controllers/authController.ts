import { Request, Response } from "express";
import { UserService } from "../services/userService";
import {
  AuthenticatedRequest,
  tokenMiddleware,
} from "../middlewares/tokenMiddleware";

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

  res.cookie("auth_token", token, {
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

  const token = tokenMiddleware.signJWT({ user_id: newUser.id });

  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 3600000,
  });

  res.status(201).json({ message: "User created" });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  tokenMiddleware.clearCookie(res);
  res.json({ message: "Logged out" });
};

export const getActiveUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<any> => {
  return res.json({ user: req.user });
};
