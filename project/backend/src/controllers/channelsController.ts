import { Request, Response } from "express";
import {channels} from "../temp_data/channel";

export const getChannels = async (req: Request, res: Response): Promise<any> => {
    try {
        return res.status(200).sendJson(channels, "User retrieved successfully");
    } catch (error) {
        return res.status(500).sendJson({}, (error as Error).message);
    }
}

export const getChannelInfo = async (req: Request, res: Response): Promise<any> => {
    try {
        const channelId = req.params.id as string || "0x234";
        const channel = channels.find(channel => channel.id === channelId);
        if(!channel) {
            return res.status(404).sendJson({}, "Channel not found");
        }
        return res.status(200).sendJson(channel, "User retrieved successfully");
    } catch (error) {
        return res.status(500).sendJson({}, (error as Error).message);
    }
}

export const getSearchedMessages = async (req: Request, res: Response): Promise<any> => {
    try {
        const channelId = req.params.id as string || "0x234";
        const query = (req.query.query as string || "").toLowerCase();
        const offset = parseInt(req.query.offset as string) || 0;
        const limit = parseInt(req.query.limit as string) || 10;

        const channel = channels.find(channel => channel.id === channelId);
        if(!channel) {
            return res.status(404).sendJson({}, "Channel not found");
        }

        const filtered = channel.messages.filter((msg) => {
            return msg.data.toLowerCase().includes(query);
        }) || [];

        const paginated = filtered.slice(offset, offset + limit);
        return res.status(200).sendJson(paginated, "User retrieved successfully");
    } catch (error) {
        return res.status(500).sendJson({}, (error as Error).message);
    }
}