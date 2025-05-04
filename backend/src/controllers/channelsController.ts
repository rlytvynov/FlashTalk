import { Request, Response } from "express";
import pool from "@config/databaseConfig";

export const getChannels = async (req: Request, res: Response): Promise<any> => {
    try {
        const {rows} = await pool.query("SELECT * FROM get_user_channels_with_members($1)", [req.user.id]);
        return res.status(200).sendJson(rows, "Channels retrieved successfully");
    } catch (error) {
        return res.status(500).sendJson({}, (error as Error).message);
    }
}

export const createChannel = async (req: Request, res: Response): Promise<any> => {
    try {
        const { name, description } = req.body;
        const { rows } = await pool.query("SELECT * FROM create_channel($1, $2, $3)", [name, description, req.user.id])
        return res.status(200).sendJson(rows[0], "Channel created successfully");
    } catch (error) {
        return res.status(500).sendJson({}, (error as Error).message);
    }
}

export const addChannelMember = async (req: Request, res: Response): Promise<any> => {
    try {
        const { channelId, userId } = req.body;
        if (!channelId || !userId) {
            return res.status(400).sendJson({}, "Channel ID and User ID are required.");
        }
        const isAdminRights = await pool.query("SELECT * FROM channels WHERE id=$1 AND adminId=$2", [channelId, req.user.id]);
        if (isAdminRights.rowCount === 0) {
            return res.status(403).sendJson({}, "You don't have permission to add members to this channel.");
        }
        const { rows } = await pool.query("SELECT * FROM add_user_to_channel($1, $2)", [userId, channelId])
        return res.status(200).sendJson(rows[0], "Channel member added successfully");
    } catch (error) {
        return res.status(500).sendJson({}, (error as Error).message);
    }
}

export const getSearchedMessages = async (req: Request, res: Response): Promise<any> => {
    try {
        const channelId = req.params.id as string;
        const query = (req.query.query as string || "")
        const offset = parseInt(req.query.offset as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;
        const { rows } = await pool.query("SELECT * FROM get_searched_channel_messages($1, $2, $3, $4)", [channelId, query, limit, offset]);
        return res.status(200).sendJson({messages: rows, hasMore: rows[0] ? rows[0].total_count >= rows.length : false}, "Messages retrieved successfully");
    } catch (error) {
        return res.status(500).sendJson({}, (error as Error).message);
    }
}