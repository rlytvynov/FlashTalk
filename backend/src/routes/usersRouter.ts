import express from "express";
import * as channelsController from "../controllers/usersController";
import authMiddleware from "@middlewares/authMiddleware";

const channelsRouter = express.Router();
channelsRouter.use(authMiddleware)

channelsRouter.get("/:username", channelsController.getUser);

export default channelsRouter;
