import {useSelector} from "react-redux";
import store, {RootState} from "@/store/store.ts";
import {socket} from "@/socket.ts"
import styles from "./Channel.module.css";
import MessageSearch from "@/components/message-search/MessageSearch.tsx";
import {FaInfo, FaTimes} from "react-icons/fa";
import {formatTimestamp} from "@/utils/formatTimestamp.ts";
import {useState} from "react";
import ChannelInfo from "@/components/channel/ChannelInfo.tsx";
import {appendMessageToChannel, setChannelError} from "@/store/channelsSlice.ts";
import {Message} from "@/types/message.ts";

function Channel() {
    const {activeChannelId, channels} = useSelector((state: RootState) => state.channelsData);
    const {user} = useSelector((state: RootState) => state.authData);
    const [isInfoVisible, setIsInfoVisible] = useState(false);

    const [msg, setMsg] = useState("");
    const handleSendMsg = async () => {
        try {
            socket?.emit('new-message', activeChannelId, user?.id, msg, (error: string, message: Message)=>{
                if (error) {
                    store.dispatch(setChannelError({type: "channels/sendMessage", message: error}));
                } else {
                    store.dispatch(appendMessageToChannel(message));
                }
            });
            setMsg("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }



    const toggleInfoShow = () => {
        setIsInfoVisible(!isInfoVisible)
    }

    return (
        <div className={styles.channelContainer}>
            <div className={styles.channelHeaderContainer}>
                <div className={styles.channelPortfolioContainer}>
                    <h1 className={styles.channelIcon}>{channels.find(channel => channel.id === activeChannelId)?.name.slice(0, 3).toUpperCase()}</h1>
                    <div className={styles.channelShortInfoContainer}>
                        <h2 className={styles.channelName}>{channels.find(channel => channel.id === activeChannelId)?.name}</h2>
                        <p className={styles.channelMembersOnline}>{channels.find(channel => channel.id === activeChannelId)?.members.length} members</p>
                    </div>
                    <div className={styles.channelMessageSearchContainer}>
                        <MessageSearch/>
                    </div>
                    <div className={styles.channelInfoContainer}>
                        {!isInfoVisible &&
                            <button className={styles.channelInfoButton} onClick={toggleInfoShow}><FaInfo/>
                            </button>}
                        {isInfoVisible &&
                            <button className={styles.channelInfoButton} onClick={toggleInfoShow}><FaTimes/>
                            </button>}
                        <ChannelInfo isInfoVisible={isInfoVisible}/>
                    </div>
                </div>
            </div>
            <ul
                ref={(el) => {
                    if (el) {
                        el.scrollTop = el.scrollHeight;
                    }
                }}
                className={styles.channelMessagesContainer}>
                {
                    channels.find(channel => channel.id === activeChannelId)?.messages.map((message) => (
                        <li key={message.id} className={`${styles.channelMessageContainer}`}>
                            {message.authorid === user?.id ?
                                <div className={`${styles.messageContentContainer} ${styles.myMessage}`}>
                                    <span className={styles.messageData}>{message.data as string}</span>
                                    <div className={styles.messageTime}>{formatTimestamp(new Date(message.date))}</div>
                                </div> :
                                <>
                                    <div className={styles.messageSenderIconContainer}>
                                        <span className={styles.messageSenderIcon}>{String(message.authorname).slice(0, 3).toUpperCase()}</span>
                                        <span
                                            className={`${
                                                channels.find(channel => channel.id === activeChannelId)?.members
                                                        .find(member => member.id === message.authorid)?.online || message.authorid === user?.id ?
                                                        styles.messageSenderOnlineIndicator : styles.messageSenderOfflineIndicator}`}></span>
                                    </div>
                                    <div className={styles.messageContentContainer}>
                                        <div className={styles.messageSender}>{message.authorname}</div>
                                        <span className={styles.messageData}>{message.data as string}</span>
                                        <div className={styles.messageTime}>{formatTimestamp(new Date(message.date))}</div>
                                    </div>
                                </>
                            }
                        </li>
                    ))
                }
            </ul>
            <div className={styles.chatInputContainer}>
                <input value={msg} onChange={(e) => setMsg(e.target.value)} type="text" placeholder="Type your message..."/>
                <button onClick={handleSendMsg}>Send</button>
            </div>
        </div>
    );
}

export default Channel;