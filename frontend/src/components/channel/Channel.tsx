import {useSelector} from "react-redux";
import {RootState} from "@/store/store.ts";
import styles from "./Channel.module.css";
import MessageSearch from "@/components/message-search/MessageSearch.tsx";
import {FaInfo, FaTimes} from "react-icons/fa";
import {formatTimestamp} from "@/utils/formatTimestamp.ts";
import {useState} from "react";
import ChannelInfo from "@/components/channel/ChannelInfo.tsx";

function Channel() {
    const {activeChannelId, channels} = useSelector((state: RootState) => state.channelsData);
    const {user} = useSelector((state: RootState) => state.authData);

    const [isInfoVisible, setIsInfoVisible] = useState(false);

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
                        <p className={styles.channelMembersOnline}>42 members online</p>
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
            <ul className={styles.channelMessagesContainer}>
                {
                    channels.find(channel => channel.id === activeChannelId)?.messages.map((message) => (
                        <li key={message.date} className={`${styles.channelMessageContainer}`}>
                            {message.authorid === user?.id ?
                                <div className={`${styles.messageContentContainer} ${styles.myMessage}`}>
                                    <span className={styles.messageData}>{message.data as string}</span>
                                    <div className={styles.messageTime}>{formatTimestamp(new Date(message.date))}</div>
                                </div> :
                                <>
                                    <div className={styles.messageSenderIconContainer}>
                                        <span className={styles.messageSenderIcon}>{String(message.authorname).slice(0, 3).toUpperCase()}</span>
                                        <span className={styles.messageSenderOnlineIndicator}></span>
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
                <input type="text" placeholder="Type your message..."/>
                <button>Send</button>
            </div>
        </div>
    );
}

export default Channel;