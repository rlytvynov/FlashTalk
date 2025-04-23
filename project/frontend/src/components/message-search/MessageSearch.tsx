import {useEffect, useRef, useState} from "react";
import styles from "./MessageSearch.module.css";
import store, {RootState} from "@/store/store.ts";
import {useSelector} from "react-redux";
import {fetchSearchedMessages, utilizeSearchedMessages} from "@/store/channelsSlice.ts";
import {FaSearch, FaTimes} from "react-icons/fa";
import {formatTimestamp} from "@/utils/formatTimestamp.ts";

const LIMIT = 10;

function MessageSearch() {
    const {error, loading, activeChannelId} = useSelector((state: RootState) => state.channelsData);
    const searchedMessages = useSelector((state: RootState) =>
        state.channelsData.channels.find(channel => channel.id === activeChannelId)?.searchedMessages || {data: [], hasMore: false}
    );

    const inputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

    const handleSearch = async () => {
        const query = inputRef.current?.value.toLowerCase().trim() || "";
        if(!query) {
            store.dispatch(utilizeSearchedMessages(activeChannelId));
            return;
        }

        try {
            await store.dispatch(fetchSearchedMessages({channelId: activeChannelId, query: query.toLowerCase(), offset: 0, limit: LIMIT})).unwrap()
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleUploadMore = async (limit: number) => {
        const query = inputRef.current?.value.trim().toLowerCase() || "";
        try {
            await store.dispatch(fetchSearchedMessages({
                channelId: activeChannelId,
                query,
                limit,
                offset: searchedMessages.data.length
            })).unwrap();
        } catch (error) {
            console.error("Error fetching more messages:", error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsInputFocused(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={searchContainerRef} className={styles.messageSearchContainer}>
            <input
                type="text"
                placeholder="Search..."
                ref={inputRef}
                onFocus={() => setIsInputFocused(true)}
                style={{
                    borderBottomLeftRadius: isInputFocused && searchedMessages.data.length ? "0px" : "8px",
                    borderBottomRightRadius: isInputFocused && searchedMessages.data.length ? "0px" : "8px"
                }}
            />
            {!searchedMessages.data.length && <FaSearch onClick={handleSearch} style={{position: 'absolute', right: '1rem', top: '32%', cursor: 'pointer'}}/>}
            {searchedMessages.data.length > 0 &&
                <FaTimes onClick={() => {store.dispatch(utilizeSearchedMessages(activeChannelId)); inputRef.current!.value = "";}}
                         style={{position: 'absolute', right: '1rem', top: '32%', cursor: 'pointer'}}
                />}
            {loading && <div className={styles.loading}>Loading...</div>}
            {error && error.type === "channels/getMessages" && <div className={styles.error}>{error.message}</div>}
            {isInputFocused && searchedMessages.data.length > 0 && (
                <div className={styles.foundMessagesContainer}>
                    <div className={styles.foundMessagesAmountContainer}>
                        <span>Found {searchedMessages.data.length} messages</span>
                        {searchedMessages.hasMore && (
                            <button onClick={() => handleUploadMore(LIMIT)} className={styles.foundMessagesAmountButton}>
                                Load more
                            </button>
                        )}
                        {searchedMessages.hasMore && (
                            <button onClick={() => handleUploadMore(10000000)} className={styles.foundMessagesAmountButton}>
                                Load all matches
                            </button>
                        )}
                    </div>
                    <ul className={styles.foundMessagesContentContainer}>
                        {searchedMessages.data.map((msg, index) => (
                            <li key={index} className={styles.foundMessageContainer}>
                                <div className={styles.foundMessageSender}>
                                    {msg.authorName.slice(0, 2)}
                                </div>
                                <div className={styles.foundMessageContentContainer}>
                                    <div className={styles.foundMessageHeaderContainer}>
                                        <h2>{msg.authorName}</h2>
                                        <span className={styles.foundMessageDate}>{ formatTimestamp(new Date(msg.date))}</span>
                                    </div>
                                    {typeof msg.data === "string" ? (
                                        <div className={styles.foundMessageData}>{msg.data}</div>
                                    ) : (
                                        <div className={styles.foundMessageData}>
                                            <img src={msg.data.url} alt={msg.data.altText || "Image"} />
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default MessageSearch;
