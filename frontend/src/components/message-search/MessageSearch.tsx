import {useEffect, useRef, useState} from "react";
import styles from "./MessageSearch.module.css";
import store, {RootState} from "@/store/store.ts";
import {useSelector} from "react-redux";
import {fetchSearchedMessages, utilizeSearchedMessages} from "@/store/channelsSlice.ts";
import {FaSearch} from "react-icons/fa";
import {formatTimestamp} from "@/utils/formatTimestamp.ts";

const LIMIT = 1;

function MessageSearch() {
    const {loading, activeChannelId} = useSelector((state: RootState) => state.channelsData);
    const searchedMessages = useSelector((state: RootState) =>
        state.channelsData.channels.find(channel => channel.id === activeChannelId)?.searchedMessages || {data: [], hasMore: false}
    );

    const inputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

    const handleSearch = async () => {
        const query = inputRef.current?.value.trim() || "";
        if(!query) {
            store.dispatch(utilizeSearchedMessages(activeChannelId));
            return;
        }
        try {
            console.log({channelId: activeChannelId, query, offset: 0, limit: LIMIT})
            await store.dispatch(fetchSearchedMessages({channelId: activeChannelId, query, offset: 0, limit: LIMIT})).unwrap()
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleUploadMore = async (limit: number) => {
        const query = inputRef.current?.value.trim() || "";
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
                store.dispatch(utilizeSearchedMessages(activeChannelId));
                if(inputRef.current) {
                    inputRef.current.value = "";
                }
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
                    zIndex: '100',
                    borderBottomLeftRadius: isInputFocused && searchedMessages.data.length ? "0px" : "8px",
                    borderBottomRightRadius: isInputFocused && searchedMessages.data.length ? "0px" : "8px"
                }}
            />
            <FaSearch onClick={handleSearch} style={{position: 'absolute', right: '1rem', top: '32%', cursor: 'pointer'}}/>
            {loading && <div style={
                {
                    position: 'absolute',
                    top: '80%',
                    zIndex: '1',
                    left: '0',
                    padding: '1rem',
                    backgroundColor: '#fff',
                    width: '100%',
                    border: '1px solid #ccc',
                }
            }>
                Loading...
            </div>}
            {isInputFocused && searchedMessages.data.length === 0 && inputRef.current?.value !== '' && (
                <div style={
                    {
                        position: 'absolute',
                        top: '80%',
                        zIndex: '1',
                        left: '0',
                        padding: '1rem',
                        backgroundColor: '#fff',
                        width: '100%',
                        border: '1px solid #ccc',
                    }
                }>
                    <span>No messages found</span>
                </div>
            )}
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
                                    {msg.authorname.slice(0, 2)}
                                </div>
                                <div className={styles.foundMessageContentContainer}>
                                    <div className={styles.foundMessageHeaderContainer}>
                                        <h2>{msg.authorname}</h2>
                                        <span
                                            className={styles.foundMessageDate}>{formatTimestamp(new Date(msg.date))}</span>
                                    </div>
                                    <div className={styles.foundMessageData}>{msg.data}</div>
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
