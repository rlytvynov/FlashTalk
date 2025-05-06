import { useEffect } from 'react';

import ChatPage from '@/pages/chat/ChatPage.tsx';
import {initializeSocket, socket} from '@/socket.ts';
import { appendMessageToChannel, updateMemberOnlineStatus } from "@/store/channelsSlice.ts";
import store from "@/store/store.ts";
import { Message } from '@/types/message';

function ChatWrapper() {
    useEffect(() => {
        const token = localStorage.getItem("token") || "";
        initializeSocket(token);
        if (!socket) return;

        socket.connect();

        socket.on('connect', () => { /* to do... */ });
        socket.on('disconnect', () => { /* to do... */ });

        socket.on('initial-connection', () => {
            /* to do... */
        });

        socket.on('new-message', (message: Message) => {
            store.dispatch(appendMessageToChannel(message));
        });

        socket.on('user-online-status-changed', (userOnlineStatus) => {
            store.dispatch(updateMemberOnlineStatus(userOnlineStatus));
        });

        return () => {
            // All listeners socket.on(...) should be detached like this.
            socket?.off('connect');
            socket?.off('disconnect');
            socket?.off('initial-connection');
            socket?.off('new-message');
            socket?.off('user-online-status-changed');
            socket?.disconnect();
        };
    }, []);
    return (
        <ChatPage/>
    );
}

export default ChatWrapper;