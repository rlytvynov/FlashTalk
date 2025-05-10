import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {isValidEmail} from "../utils/emailValidation";
import {JWT_SECRET} from "@config/envConfig";
import pool from "@config/databaseConfig";

/**
 * Регистрация на потребител
 * - Валидира входни данни
 * - Проверява за дублиран имейл
 * - Хешира паролата
 * - Записва потребителя във "фалшивата база" (users.json)
 */
export const handleRegister = async (req: Request, res: Response): Promise<any> => {
    try {
        const { username, email, password, displayname } = req.body;
        if (!username || !email || !password || !displayname) {
            return res.status(400).sendJson({}, "All fields are required.");
        }
        if (!isValidEmail(email)) {
            return res.status(400).sendJson({}, "Invalid email format.");
        }
        const existedUsers = await pool.query("SELECT * FROM users WHERE email = $1 OR username = $2", [email, username]);
        if (existedUsers.rows.length > 0) {
            return res.status(409).sendJson({}, "Email or Username already in use.");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const {rows} = await pool.query("SELECT * FROM create_user($1, $2, $3, $4)", [
            username, email, hashedPassword, displayname
        ])
        return res.status(201).sendJson({}, "User registered successfully")
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
        const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (rows.length === 0) {
            return res.status(401).sendJson({}, "Invalid email or password.");
        }
        const foundUser = rows[0];
        const isMatch = await bcrypt.compare(password, foundUser.password);
        if (!isMatch) {
            return res.status(401).sendJson({}, "Invalid email or password.");
        }

        const token = jwt.sign(
            {
                id: foundUser.id,
                email: foundUser.email,
                username: foundUser.username,
                displayname: foundUser.displayname
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );
        return res.status(200).sendJson({
            token,
            user: {
                id: foundUser.id,
                username: foundUser.username,
                displayname: foundUser.displayname,
                email: foundUser.email
            }
        }, "LoginPage successful");
    } catch (error) {
        console.log("Error during login:", error);
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