// socket.ts
import { io, Socket } from 'socket.io-client';

export let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
    socket = io(import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:8080', {
        autoConnect: false,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        timeout: 5000,
        extraHeaders: {
            'ngrok-skip-browser-warning': 'true',
            authorization: token
        }
    });
};
