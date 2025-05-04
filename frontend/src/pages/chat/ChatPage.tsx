import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import store, {RootState} from "@/store/store.ts";
import {logout} from "@/store/authSlice.ts";
import {fetchChannels, setActiveChannelId} from "@/store/channelsSlice.ts";
import Channel from "@/components/channel/Channel.tsx";
import {FaPlus, FaSignOutAlt} from "react-icons/fa";
import {formatTimestamp} from "@/utils/formatTimestamp.ts";
import styles from "./ChatPage.module.css";
import CreateNewChannelModal from "@/components/modals/CreateNewChannelModal.tsx";

function ChatPage() {
    const {channels, activeChannelId, error, loading} = useSelector((state: RootState) => state.channelsData);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const handleLogout = () => {
        store.dispatch(logout());
        navigate("/login");
    };
    useEffect(() => {
        const fetchChannelsToStore = async () => {
            try {
                await store.dispatch(fetchChannels()).unwrap()
            } catch (error) {
                console.error("Error fetching channels:", error);
            }
        }
        fetchChannelsToStore();
    }, []);
    const toggleModalCreateChannel = () => {
        setIsModalOpen(!isModalOpen)
    }
    return (
        <div className="flash-talk-container">
            <aside className={styles.channelsContainer}>
                <h2 className={styles.flashTalkLogoContainer}>
                    <img style={{width: '2rem'}} src="/flashtalk_logo_transperent_reverse.png" alt="FlashTalk Logo"/>
                    <span>FlashTalk</span>
                </h2>
                <ul className={styles.channelsContentContainer}>
                    {loading && <div className={styles.loading}>Loading...</div>}
                    {!loading && !error && channels.map((channel) => {
                        const lastMessage = channel.messages.length ? channel.messages[channel.messages.length - 1] : null;

                        return (
                            <div key={channel.id} className={styles.channelContainerWrapper}>
                                <li className={`${styles.channelContainer} ${channel.id === activeChannelId && styles.active}`}
                                    onClick={() => store.dispatch(setActiveChannelId(channel.id))} key={channel.id}
                                    data-channel={channel.name}>
                                        {/* Channel icon */}
                                        <div className={styles.channelIcon}>{channel.name.slice(0, 3).toUpperCase()}</div>

                                        {/* Channel name and last message */}
                                        <div className={styles.channelPreviewInfoContainer}>
                                            <div className={styles.channelName}># {channel.name}</div>
                                            {lastMessage ?
                                                <div className={styles.channelLastMessage}>{`${lastMessage.authorname}: ${lastMessage.data as string}`}</div>
                                                :
                                                <div className={styles.channelLastMessage}>No messages yet...</div>
                                            }
                                        </div>
                                            {/* Time and unread messages */}
                                        <div className={styles.channelLastMessageContainer}>
                                            <div className={styles.lastMessageDate}>
                                                {lastMessage && formatTimestamp(new Date(lastMessage.date))}
                                            </div>
                                            {/*{channel.id !== activeChannelId && channel.newMessage */}
                                            {/*    <div className={styles.newMessagesIndicator}></div>}*/}
                                        </div>
                                </li>
                            </div>
                        );
                    })}
                </ul>
                <div className={styles.buttonsContainer}>
                    <button className={styles.loggoutButton} onClick={handleLogout}>
                        <FaSignOutAlt/>
                    </button>
                    <button className={styles.createChannelButton} onClick={toggleModalCreateChannel}>
                        <FaPlus/>
                    </button>
                </div>
            </aside>
            <main className={styles.channelContainer}>
                {activeChannelId && (
                    <Channel/>
                )}
                {!activeChannelId && (
                    <div className={styles.welcomeViewContainer}>
                        <h1 className={styles.welcomeViewHeader} id="chat-title">Welcome to the ChatApp! Feel free to
                            join! </h1>
                        <p className={styles.welcomeViewMessage}>Select a channel to see messages.</p>
                    </div>
                )}
            </main>
            <CreateNewChannelModal isModalOpen={isModalOpen} toggleModalCreateChannel={toggleModalCreateChannel}/>
        </div>
    );
}

export default ChatPage;