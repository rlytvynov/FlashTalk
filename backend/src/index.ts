import cors from "cors"
import express from "express";
import jwt from 'jsonwebtoken'
import http from "node:http";
import {Server} from "socket.io";

import corsOptions from "@config/corsConfig";
import pool from "@config/databaseConfig";
import { JWT_SECRET } from '@config/envConfig'
import { SERVER_HOSTNAME, SERVER_PORT } from "@config/envConfig";
import responseMiddleware from "@middlewares/responseTypeMiddlware";
import authRouter from "@routes/authRouter";
import channelsRouter from "@routes/channelsRouter";
import usersRouter from "@routes/usersRouter";
import { Message } from './types/channel';

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

// Socket connection.
const server = http.createServer(app);
const io = new Server(server, { cors: corsOptions });
const userSessions: Map<string, string> = new Map<string, string>();  // Keep track of connected users (socketId, userId).

// Middleware to verify the user token.
io.use((socket, next) => {
    const token = socket.handshake.headers['authorization'];  // The user must provide a token when initiating a connection.
    if (!token) return next(new Error('Authorization token is missing!'));

    try {
        jwt.verify(token, JWT_SECRET) as { id: string };
        return next();
    } catch (err) {  // Should do better error handling here.
        return next(new Error('Invalid token!'));
    }
});

io.on("connection", async (socket) => {
    const token = socket.handshake.headers['authorization'] as string;  // Already verified in the io middleware.
    const user = jwt.verify(token, JWT_SECRET) as { id: string, username: string, displayName: string };  // Decrypt user info.
    console.log(`[server]: User connected. Username: "${user.username}" | id: ${user.id}`);

    userSessions.set(user.id, socket.id);

    // Join user to channels and broadcast that they are online.
    const channelsOfUser = await pool.query("SELECT * FROM get_user_channels_with_members($1)", [parseInt(user.id)]);
    for (const channel of channelsOfUser.rows) {
        socket.join(channel.id);
        socket.broadcast.to(channel.id).emit('new-user-is-online', user.id);
    }

    // Send initial info to the user when they first connect.
    // NOT FINISHED!!! Must add more stuff like other user online statuses.
    io.to(socket.id).emit('initial-connection', channelsOfUser.rows);

    // Listen for new message from user; write it to the DB; send it to other users.
    socket.on('new-message', async (channelId, authorId, messageData, callback) => {
        try {
            const messages = await pool.query("SELECT * FROM create_message($1, $2, $3)", [parseInt(channelId), parseInt(authorId), messageData]);
            const message: Message = messages.rows[0];
            message.authorname = user.displayName;  // The frontend wants the 'displayName' so add it to the message.
            socket.broadcast.to(channelId).emit('new-message', message);

            if (callback) {
                callback(null, message);
            }
        } catch (error) {
            if (callback) {
                callback(error, null);
            }
        }
    });

    socket.on("disconnect", () => {
        /* to do... */
        console.log("Потребителят е изключен:", socket.id);
    });
});


//Server start
server.listen(SERVER_PORT, () => {
    console.log(`[server]: Server is running at http://${SERVER_HOSTNAME}:${SERVER_PORT}`);
});


