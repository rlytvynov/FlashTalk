import {useEffect} from "react";
import {socket} from "@/socket.ts";
import ChatPage from "@/pages/chat/ChatPage.tsx";

function ChatWrapper() {
    useEffect(() => {
        socket.connect();

        function onConnect() {

            console.log("Connected");

        }

        function onDisconnect() {
            console.log("Disconnected");
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.disconnect();
        };
    }, []);
    return (
        <ChatPage/>
    );
}

export default ChatWrapper;