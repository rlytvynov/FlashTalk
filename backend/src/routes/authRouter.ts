import express from "express";
import * as authController from "../controllers/authController";
import authMiddleware from "@middlewares/authMiddleware";

const authRouter = express.Router();

authRouter.post("/register", authController.handleRegister);
authRouter.post("/login", authController.handleLogin);
authRouter.get("/me", authMiddleware, authController.handleMe);

export default authRouter;
