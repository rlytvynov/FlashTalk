import cors from "cors"
import express from "express";
import jwt from 'jsonwebtoken'
import http from "node:http";
import { Server, Socket, DefaultEventsMap } from "socket.io";

import { httpCorsOptions, webSocketCorsOptions } from "@config/corsConfig";
import pool from "@config/databaseConfig";
import { JWT_SECRET } from '@config/envConfig'
import { SERVER_HOSTNAME, SERVER_PORT } from "@config/envConfig";
import except from './exceptions/exceptions'
import responseMiddleware from "@middlewares/responseTypeMiddlware";
import authRouter from "@routes/authRouter";
import channelsRouter from "@routes/channelsRouter";
import usersRouter from "@routes/usersRouter";
import { Message } from './types/channel';
import { User } from './types/user'
import dbQueries from './utils/dbQueries'
import { areDisjointSets } from './utils/setOperations'

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
app.use(cors(httpCorsOptions))
app.options('*', cors(httpCorsOptions));
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
const io = new Server(server, { cors: webSocketCorsOptions });
const userSessions: Map<string, string> = new Map<string, string>();  // Keep track of connected users (userId, socketId).
type WebSocket = Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

// Middleware to verify the user token.
io.use((socket, next) => {
    const token = socket.handshake.headers['authorization'];  // The user must provide a token when initiating a connection.
    if (!token) return next(new except.AuthenticationError('Authorization token is missing!'));

    try {
        jwt.verify(token, JWT_SECRET) as { id: string };
        return next();
    } catch (err) {  // Should do better error handling here.
        console.log(err)
        return next(new except.AuthenticationError('Invalid token!'));
    }
});

// Returns the userIds of the users which are currently online and are in at least one common room with the given user (socket).
// So basically returns "friends online".
function getFriendsOnline(socket: WebSocket): String[] {
    const roomsMap = io.of('/').adapter.sids;  // Map<SocketId, Set<Room>>
    const friendsOnline = [];
    for (const [userId, socketId] of userSessions) {
        if (socketId === socket.id) continue;  // Skip the calling socket.

        const socketRooms = roomsMap.get(socketId) as Set<string>;
        if(!areDisjointSets(socket.rooms, socketRooms))  // Are the two users in a common room (are they "friends").
            friendsOnline.push(userId);
    }

    return friendsOnline;
}

// Throws an error if:
//  - 'channelId' does not exist
//  - 'userId' is not admin
async function checkAdmin(userId: string, channelId: string) {
    const result = await pool.query('SELECT adminId FROM channels WHERE id = $1', [parseInt(channelId)]);  // Get the adminId of the channel.
            
    if (result.rows.length === 0)
        throw new except.ResourceDoesNotExistError('Error! The channel does not exist.');
    
    if (parseInt(userId) !== result.rows[0].adminid)
        throw new except.PermissionError('You cannot add or remove users because you are not an admin of this channel!');
}

// Handle the initial connection with the user.
async function initialConnection(socket: WebSocket): Promise<User> {
    const token = socket.handshake.headers['authorization'] as string;  // Already verified in the io middleware.
    const user = jwt.verify(token, JWT_SECRET) as User;  // Decrypt user info.

    userSessions.set(user.id, socket.id);

    // Join user to channels and broadcast that they are online.
    const channelsOfUser = await pool.query('SELECT * FROM get_user_channels_with_members($1)', [parseInt(user.id)]);
    for (const channel of channelsOfUser.rows) {
        socket.join(channel.id);
        // This is not a good way to broadcast that the user is now online because if another user is let's say in 5 of these rooms
        // they will get 5 of these messages, which is unnecessary. Should fix it!!!
        socket.to(channel.id).emit('user-is-online', user.id);
    }

    io.to(socket.id).emit('initial-connection', getFriendsOnline(socket));

    return user;
};

io.on("connection", async (socket) => {
    
    const user = await initialConnection(socket);

    // Listen for new message from user; write it to the DB; send it to other users.
    // TO DO: verify the input data before writing to the DB. For example at the moment we can pass in any random 'channelId'.
    socket.on('new-message', async (channelId: string, authorId: string, messageData: string, callback) => {
        try {
            const messages = await pool.query('SELECT * FROM create_message($1, $2, $3)', [parseInt(channelId), parseInt(authorId), messageData]);
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

    socket.on('add-users-to-channel', async (channelId: string, userIds: string[], callback) => {
        const usersAdded = [];  // Successfully added users.
        try {
            await checkAdmin(user.id, channelId);

            for (const userId of userIds) {
                await dbQueries.addUserToChannel(userId, channelId);
                const user = await dbQueries.getUserById(userId);  // Get the necessary info to send to the other users in the channel.
                (user as any).online = userSessions.has(userId);
                usersAdded.push(user);

                // Add the user to the channel room if they are online.
                const userSocketId = userSessions.get(userId);
                if (userSocketId) {
                    const userSocket = io.sockets.sockets.get(userSocketId) as WebSocket;
                    userSocket.join(channelId);
                    //userSocket.join('Temporary-room-to-send-the-new-users-the-necessary-channel-info');  // tmp
                }
            }

            // Send info to the users already in the channel (excluding the admin).
            socket.to(channelId).emit('new-users-added-to-channel', channelId, usersAdded);
            
            if (callback) callback(null, usersAdded);  // Send back info to the admin who added the users.

        } catch (error) {
            if (callback) callback(error, usersAdded);
        }
    });

    socket.on('remove-user-from-channel', async (channelId: string, userId: string, callback) => {
        try {
            await checkAdmin(user.id, channelId);
            
            // At the moment admins cannot ever leave the channel. Obviously it would be a lot better if they can but for now this is simple and it works.
            if (user.id === userId) throw new except.InvalidOperationError('You are admin. You cannot remove yourself from the channel.');

            await dbQueries.removeUserFromChannel(userId, channelId);

            // Remove user from the channel room if they are online.
            const userSocketId = userSessions.get(userId);
            if (userSocketId) {
                const userSocket = io.sockets.sockets.get(userSocketId) as WebSocket;
                userSocket.leave(channelId);
            }

            // TO DO:
            //  - Send info to the removed user and to the other users in the channel (this is not entirely necessary because they can get the changes on page reload).

            if (callback) callback(null);

        } catch (error) {
            if (callback) callback(error);
        }
    });

    socket.on('disconnecting', () => {
        // Broadcast the user is offline.
        // This line is not in the 'disconnect' listener because 'socket.rooms' is already deleted there.
        // This is not a good way to broadcast that the user is now offline because if another user is let's say in 5 of these rooms
        // they will get 5 of these messages, which is unnecessary. Should be fixed!!!
        socket.rooms.forEach(room => socket.to(room).emit('user-is-offline', user.id));
    });

    socket.on('disconnect', () => {
        userSessions.delete(user.id);
    });
});

//Server start
server.listen(SERVER_PORT, () => {
    console.log(`[server]: Server is running at http://${SERVER_HOSTNAME}:${SERVER_PORT}`);
});