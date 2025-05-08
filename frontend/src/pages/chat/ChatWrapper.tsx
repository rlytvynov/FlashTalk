import { useEffect } from 'react';

import ChatPage from '@/pages/chat/ChatPage.tsx';
import { initializeSocket, socket } from '@/socket.ts';
import { appendMessageToChannel, appendMessagesToChannels, updateMembersOnlineStatus } from "@/store/channelsSlice.ts";
import store from "@/store/store.ts";
import { Message } from '@/types/message';

function ChatWrapper() {
    useEffect(() => {
        const token = localStorage.getItem("token") || "";
        initializeSocket(token);
        if (!socket) return;

        socket.connect();

        socket.on('connect', () => { /* TO DO optional: prompt the user that they are online. */});
        socket.on('disconnect', () => { /* TO DO optional: prompt the user that they are offline. */ });

        socket.on('initial-connection', (channelsMessages, friendsOnline) => {
            // At the moment 'appendMessagesToChannels' and 'updateMembersOnlineStatus' are being executed
            // before the channels are initialized (so it does nothing).
            store.dispatch(appendMessagesToChannels(channelsMessages));
            store.dispatch(updateMembersOnlineStatus(friendsOnline));
        });

        socket.on('new-message', (message: Message) => {
            store.dispatch(appendMessageToChannel(message));
        });

        socket.on('user-is-offline', userId => {
            store.dispatch(updateMembersOnlineStatus([{ userId, isOnline: false }]));
        });

        socket.on('user-is-online', userId => {
            store.dispatch(updateMembersOnlineStatus([{ userId, isOnline: true }]));
        });
        
        return () => {
            // All listeners socket.on(...) should be detached like this.
            socket?.off('connect');
            socket?.off('disconnect');
            socket?.off('initial-connection');
            socket?.off('new-message');
            socket?.off('user-is-offline');
            socket?.off('user-is-online');
            socket?.disconnect();
        };
    }, []);
    return (
        <ChatPage/>
    );
}

export default ChatWrapper;