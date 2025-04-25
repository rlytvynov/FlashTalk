import http from "node:http";
import express from "express";
import {Server} from "socket.io";
import cors from "cors"

import { SERVER_HOSTNAME, SERVER_PORT } from "@config/envConfig";
import corsOptions from "@config/corsConfig";
import responseMiddleware from "@middlewares/responseTypeMiddlware";
import authRouter from "@routes/authRouter";
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
app.use('/api/channels', channelsRouter);
/**
 * Сокет соединение - DR4
 */
const server = http.createServer(app);
/*
const io = new Server(server, {
    cors: corsOptions
});
//midlleware за authorizаtion на оптребителя за соета
const userSessions: Map<string, string> = new Map<string, string>();
io.on("connection", async (socket) => {
    console.log("Нов потребител е свързан:", socket.id);
    //примерно добаяне на сокет ид на потребител
    userSessions.set(socket.id, socket.user.id.toString())
    const associatedChannels =  await pool.query("SELECT * FROM user_channels($1)", [socket.user.id])
    for (const channel of associatedChannels.rows) {
        socket.join(channel.id)
        socket.broadcast.to(channel.id).emit('user-connected', socket.user.id.toString());
        console.log("Потребителят е добавен в канала:", channel.name);
    }
    //примерен обработчик на събитие
    socket.on("new-message", async (message) => {
        const messages = await pool.query("SELECT * FROM create_message($1, $2, $3, $4)", [message.channelid, message.authorid, message.data ])
        //примерен broadcast emit
        socket.broadcast.to(message.channelid).emit('chat message', messages.rows[0]);
    });

    socket.on("disconnect", () => {
        console.log("Потребителят е изключен:", socket.id);
    });
});
*/

//Server start
server.listen(SERVER_PORT, () => {
    console.log(`[server]: Server is running at http://${SERVER_HOSTNAME}:${SERVER_PORT}`);
});


