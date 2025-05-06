import express from "express";
import * as channelsController from "../controllers/channelsController";
import authMiddleware from "@middlewares/authMiddleware";

const channelsRouter = express.Router();

channelsRouter.get("/", authMiddleware, channelsController.getChannels);
channelsRouter.post("/", authMiddleware, channelsController.createChannel);
channelsRouter.get("/:id/search", authMiddleware, channelsController.getSearchedMessages);

export default channelsRouter;
