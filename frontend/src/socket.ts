import { io } from 'socket.io-client';
const URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:8080';

export const socket = io(URL, {
    autoConnect: false,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,  // In milliseconds.
    timeout: 5000,
    extraHeaders: {
        authorization: localStorage.getItem("token") || ""
    }
});