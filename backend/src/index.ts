import http from "node:http";
import express from "express";
import {Server} from "socket.io";
import cors from "cors"

import { SERVER_HOSTNAME, SERVER_PORT } from "@config/envConfig";
import corsOptions from "@config/corsConfig";
import { JWT_SECRET } from '@config/envConfig'
import jwt from 'jsonwebtoken'
import responseMiddleware from "@middlewares/responseTypeMiddlware";
import authRouter from "@routes/authRouter";
import usersRouter from "@routes/usersRouter";
import channelsRouter from "@routes/channelsRouter";
import pool from "@config/databaseConfig";

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
        interface Response {
            sendJson: <T>(data: T, message?: string) => this;
        }
    }
}

// Базова конфигурация
const app = express();
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(responseMiddleware)
/**
 * Бизнес-логика - авторизация и др http запроси (DR1, DR3, DR5)
 */
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/channels', channelsRouter);
/**
 * Сокет соединение - DR4
 */
const server = http.createServer(app);
const io = new Server(server, { cors: corsOptions });

// Middleware to verify the user token.
io.use((socket, next) => {
    const token = socket.handshake.headers['authorization'];  // The user must provide a token when initiating a connection.
    if (!token) return next(new Error('Authorization token is missing!'));

    try {
        jwt.verify(token, JWT_SECRET) as { id: string };
    } catch (err) {  // Should do better error handling here.
        return next(new Error('Invalid token!'));
    }
});

// Keep track of connected users.
const userSessions: Map<string, string> = new Map<string, string>();  // (socketID, userID)
io.on("connection", (socket) => {
    const token = socket.handshake.headers['authorization'] as string;  // Already verified in the io middleware.
    const user = jwt.verify(token, JWT_SECRET) as { id: string, username: string };  // Get the user ID.
    console.log(`[server]: ${user.username} connected.`);

    userSessions.set(socket.id, user.id);
    
    // const associatedChannels =  await pool.query("SELECT * FROM user_channels($1)", [user.id])
    // for (const channel of associatedChannels.rows) {
    //     socket.join(channel.id)
    //     socket.broadcast.to(channel.id).emit('user-connected', user.id);
    // }
    
    // Example event handler.
    // socket.on("new-message", async (message) => {
    //     const messages = await pool.query("SELECT * FROM create_message($1, $2, $3, $4)", [message.channelid, message.authorid, message.data ])
    //     //примерен broadcast emit
    //     socket.broadcast.to(message.channelid).emit('chat message', messages.rows[0]);
    // });

    socket.on("disconnect", () => {
        console.log("Потребителят е изключен:", socket.id);
    });
});


//Server start
server.listen(SERVER_PORT, () => {
    console.log(`[server]: Server is running at http://${SERVER_HOSTNAME}:${SERVER_PORT}`);
});


