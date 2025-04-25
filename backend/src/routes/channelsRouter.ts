import express from "express";
import * as channelsController from "../controllers/channelsController";
import authMiddleware from "@middlewares/authMiddleware";

const channelsRouter = express.Router();
channelsRouter.use(authMiddleware)

channelsRouter.get("/", channelsController.getChannels);
channelsRouter.post("/", channelsController.createChannel);
channelsRouter.get("/:id/search", channelsController.getSearchedMessages);

export default channelsRouter;
