import { io } from 'socket.io-client';
const URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export const socket = io(URL, {
    autoConnect: false,
    reconnectionAttempts: 5, // Количество попыток переподключения
    reconnectionDelay: 2000,  // Задержка перед попыткой (в мс)
    timeout: 5000,
    extraHeaders: {
        authorization: localStorage.getItem("token") || ""
    }
});