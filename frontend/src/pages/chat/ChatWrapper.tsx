import {useEffect} from "react";
import {socket} from "@/socket.ts";
import ChatPage from "@/pages/chat/ChatPage.tsx";

function ChatWrapper() {
    useEffect(() => {
        socket.connect();

        socket.on('connect', () => { /* to do... */ });
        socket.on('disconnect', () => { /* to do... */ });

        socket.on('initial-connection', () => {
            /* to do... */
        });

        socket.on('new-message', () => {
            /* to do... */
        });

        return () => {
            // All listeners (socket.on(...)) should be detached like this.
            socket.off('connect');
            socket.off('disconnect');
            socket.off('initial-connection');
            socket.disconnect();
        };
    }, []);
    return (
        <ChatPage/>
    );
}

export default ChatWrapper;