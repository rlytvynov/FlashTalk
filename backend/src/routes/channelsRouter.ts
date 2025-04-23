import express from "express";
import * as channelsController from "../controllers/channelsController";
import authMiddleware from "@middlewares/authMiddleware";

const channelsRouter = express.Router();
channelsRouter.use(authMiddleware)

channelsRouter.get("/", channelsController.getChannels);
channelsRouter.get("/:id", channelsController.getChannelInfo);
channelsRouter.get("/:id/search", channelsController.getSearchedMessages);

export default channelsRouter;
