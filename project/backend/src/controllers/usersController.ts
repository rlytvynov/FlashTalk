import { Request, Response } from "express";

export const getUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const user = { id: 1, name: "John Doe", email: "john@example.com" };
        return res.status(200).sendJson(user, "User retrieved successfully");
    } catch (error) {
        return res.status(500).sendJson({}, (error as Error).message)
    }
}