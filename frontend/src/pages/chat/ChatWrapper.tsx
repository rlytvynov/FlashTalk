import { useEffect } from 'react';

import ChatPage from '@/pages/chat/ChatPage.tsx';
import { initializeSocket, socket } from '@/socket.ts';
import { addChannel, removeChannel, addMembersToChannel, removeMemberFromChannel, appendMessageToChannel, updateMembersOnlineStatus } from "@/store/channelsSlice.ts";
import store from "@/store/store.ts";
import { Channel, ChannelMember } from '@/types/channel'
import { Message } from '@/types/message';

function ChatWrapper() {
    useEffect(() => {
        const token = localStorage.getItem("token") || "";
        initializeSocket(token);
        if (!socket) return;

        socket.connect();

        socket.on('connect', () => { /* TO DO optional: prompt the user that they are online. */});
        socket.on('disconnect', () => { /* TO DO optional: prompt the user that they are offline. */ });

        socket.on('initial-connection', (friendsOnline: string[]) => {
            setTimeout(() => {
                store.dispatch(updateMembersOnlineStatus(friendsOnline.map(userId => {
                    return { userId, isOnline: true };
                })))
            }, 500);  // Wait for 'store' to initialize.
        });

        socket.on('new-message', (message: Message) => {
            store.dispatch(appendMessageToChannel(message));
        });

        socket.on('new-users-added-to-channel', (channelId: string, newMembers: ChannelMember[]) => {
            store.dispatch(addMembersToChannel({ channelId, newMembers }));
            console.log('here');  // tmp
        });

        socket.on('user-removed-from-channel', (channelId: string, memberId: string) => {
            store.dispatch(removeMemberFromChannel({ channelId, memberId }));
        });

        socket.on('you-were-added-to-channel', (partialChannel: Omit<Channel, 'newMessage' | 'searchedMessages'>) => {
            // TO DO: ask if it is OK to set these values to 'newMessage' and 'searchedMessages'.
            const channel: Channel = { ...partialChannel, newMessage: false, searchedMessages: { data: [], hasMore: false } };
            store.dispatch(addChannel(channel));
        });

        socket.on('you-were-removed-from-channel', (channelId: string) => {
            store.dispatch(removeChannel(channelId));
        });

        socket.on('user-is-offline', (userId) => {
            store.dispatch(updateMembersOnlineStatus([{ userId, isOnline: false }]));
        });

        socket.on('user-is-online', (userId) => {
            store.dispatch(updateMembersOnlineStatus([{ userId, isOnline: true }]));
        });
        
        return () => {
            // All listeners socket.on(...) should be detached like this.
            socket?.off('connect');
            socket?.off('disconnect');
            socket?.off('initial-connection');
            socket?.off('new-message');
            socket?.off('new-users-added-to-channel');
            socket?.off('user-removed-from-channel');
            socket?.off('you-were-added-to-channel');
            socket?.off('you-were-removed-from-channel');
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