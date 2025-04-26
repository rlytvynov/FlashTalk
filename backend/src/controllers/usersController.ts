import { Request, Response } from "express";
import pool from "@config/databaseConfig";

export const getUser = async (req: Request, res: Response): Promise<any> => {
    try {
        console.log(req.params.username)
        const {rows} = await pool.query("SELECT * FROM users WHERE username=$1", [req.params.username]);
        return res.status(200).sendJson(rows[0], "User retrieved successfully");
    } catch (error) {
        return res.status(500).sendJson({}, (error as Error).message)
    }
}