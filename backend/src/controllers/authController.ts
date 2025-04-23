import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {isValidEmail} from "../utils/emailValidation";
import {users} from "../temp_data/users";
import {JWT_SECRET} from "@config/envConfig";

/**
 * Регистрация на потребител
 * - Валидира входни данни
 * - Проверява за дублиран имейл
 * - Хешира паролата
 * - Записва потребителя във "фалшивата база" (users.json)
 */

export const handleRegister = async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, email, password, displayName } = req.body;
        if (!username || !email || !password || !displayName) {
            return res.status(400).sendJson({}, "All fields are required.");
        }
        if (!isValidEmail(email)) {
            return res.status(400).sendJson({}, "Invalid email format.");
        }
        const emailExists = users.some(u => u.email === email);
        if (emailExists) {
            return res.status(409).sendJson({}, "Email already in use.");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        users.push({ id: "1", username, email, password: hashedPassword, displayName });
        return res.status(201).sendJson({user: { username, displayName, email }}, "User registered successfully")
    } catch (error) {
        return res.status(500).sendJson({}, (error as Error).message)
    }
}

export const handleLogin = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).sendJson({}, "Email and password are required.");
        }
        if (!isValidEmail(email)) {
            return res.status(400).sendJson({}, "Invalid email format.");
        }
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(401).sendJson({}, "Invalid email or password.");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).sendJson({}, "Invalid email or password.");
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                username: user.username,
                displayName: user.displayName
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );
        return res.status(200).sendJson({
            token,
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                email: user.email
            }
        }, "LoginPage successful");
    } catch (error) {
        return res.status(500).sendJson({}, (error as Error).message)
    }
}

export const handleMe = async (req: Request, res: Response): Promise<any> => {
    try {
        return res.sendJson(req.user, "Authenticated user data");
    } catch (error) {
        return res.status(500).sendJson({}, (error as Error).message)
    }
}