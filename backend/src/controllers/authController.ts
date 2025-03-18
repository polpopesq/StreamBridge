import { Request, Response } from "express"
import { UserService } from "../services/server/authService";

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = UserService.findByEmail(email);
    if(user === null) {
        return res.status(404).json({message: `User with email ${email} not found.`});
    }

    const isMatch = UserService.isPasswordMatch(user, password);
    if(!isMatch) {
        return res.status(400).json({message: "Invalid credentials."});
    }

    //TODO: call middleware to create token and return something else
    return null;
}

export const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const searchUser = UserService.findByEmail(email);
    if(searchUser !== null) {
        return res.status(409).json({message: `User with email ${email} already exists.`});
    }

    const newUser = UserService.createUser(email, password);
    if(newUser === null) {
        return res.status(500).json({message: "Unexpected error."});
    }
}