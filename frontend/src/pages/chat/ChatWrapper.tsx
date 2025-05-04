import { useEffect } from 'react';

import ChatPage from '@/pages/chat/ChatPage.tsx';
import { socket } from '@/socket.ts';
import { Message } from '@/types/message';

import { appendMessageToChannel } from "@/store/channelsSlice.ts";
import store from "@/store/store.ts";

function ChatWrapper() {
    useEffect(() => {
        socket.connect();

        socket.on('connect', () => { /* to do... */ });
        socket.on('disconnect', () => { /* to do... */ });

        socket.on('initial-connection', () => {
            /* to do... */
        });

        socket.on('new-message', (message: Message) => {
            store.dispatch(appendMessageToChannel(message));
        });

        socket.on('new-user-is-online', () => {
            /* to do... */
        });

        return () => {
            // All listeners socket.on(...) should be detached like this.
            socket.off('connect');
            socket.off('disconnect');
            socket.off('initial-connection');
            socket.off('new-message');
            socket.off('new-user-is-online');
            socket.disconnect();
        };
    }, []);
    return (
        <ChatPage/>
    );
}

export default ChatWrapper;