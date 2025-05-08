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

        socket.on('connect', () => { /* to do... */ });
        socket.on('disconnect', () => { /* to do... */ });

        socket.on('initial-connection', (channelsMessages, friendsOnline) => {
            // At the moment 'appendMessagesToChannels' is being executed before the channels are initialized (so it does nothing).
            // Maybe the same is happening with 'updateMembersOnlineStatus'.
            store.dispatch(appendMessagesToChannels(channelsMessages));
            store.dispatch(updateMembersOnlineStatus(friendsOnline));
        });

        socket.on('new-message', (message: Message) => {
            store.dispatch(appendMessageToChannel(message));
        });

        // This listener really should be split in two listeners 'users-are-online' and 'users-are-offline'
        // to skip sending 'isOnline' variable.
        socket.on('users-online-status-changed', (usersOnlineStatus: { userId: string, isOnline: boolean }[]) => {
            store.dispatch(updateMembersOnlineStatus(usersOnlineStatus));
        });

        return () => {
            // All listeners socket.on(...) should be detached like this.
            socket?.off('connect');
            socket?.off('disconnect');
            socket?.off('initial-connection');
            socket?.off('new-message');
            socket?.off('users-online-status-changed');
            socket?.disconnect();
        };
    }, []);
    return (
        <ChatPage/>
    );
}

export default ChatWrapper;