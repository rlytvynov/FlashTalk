import {useEffect, useRef, useState} from "react";
import styles from "./MessageSearch.module.css";
import store, {RootState} from "@/store/store.ts";
import {useSelector} from "react-redux";
import {fetchSearchedMessages, utilizeSearchedMessages} from "@/store/channelsSlice.ts";

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
        await store.dispatch(fetchSearchedMessages({channelId: activeChannelId, query: query.toLowerCase(), offset: 0, limit: LIMIT})).unwrap()
    };

    const handleUploadMore = async (limit: number) => {
        const query = inputRef.current?.value.trim().toLowerCase() || "";
        await store.dispatch(fetchSearchedMessages({
            channelId: activeChannelId,
            query,
            limit,
            offset: searchedMessages.data.length
        })).unwrap();
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
        <div ref={searchContainerRef} className={styles.messageSearch}>
            <input
                type="text"
                placeholder="Search..."
                ref={inputRef}
                onFocus={() => setIsInputFocused(true)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        handleSearch(); // Тук викаме Вашата функция
                    }
                }}
                style={{
                    borderBottomLeftRadius: isInputFocused && searchedMessages.data.length ? "0px" : "8px",
                    borderBottomRightRadius: isInputFocused && searchedMessages.data.length ? "0px" : "8px"
                }}
            />
            {loading && <div className={styles.loading}>Loading...</div>}
            {error && <div className={styles.error}>{error}</div>}
            {isInputFocused && searchedMessages.data.length > 0 && (
                <div className={styles.foundMessages}>
                    <div className={styles.foundMessagesAmount}>
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
                    <div className={styles.foundMessagesContent}>
                        {searchedMessages.data.map((msg, index) => (
                            <div key={index} className={styles.foundMessage}>
                                <div className={styles.foundMessageSender}>
                                    {msg.senderNickname.slice(0, 2)}
                                </div>
                                <div className={styles.foundMessageContent}>
                                    <div className={styles.foundMessageHeader}>
                                        <h2>{msg.senderNickname}</h2>
                                        <span className={styles.foundMessageDate}>{msg.date}</span>
                                    </div>
                                    {typeof msg.data === "string" ? (
                                        <div className={styles.message}>{msg.data}</div>
                                    ) : (
                                        <div className={styles.message}>
                                            <img src={msg.data.url} alt={msg.data.altText || "Image"} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MessageSearch;
