import {useEffect, useRef, useState} from "react";
import {Message} from "@/types/message.ts"
import styles from "./MessageSearch.module.css"
import store, {RootState} from "@/store/store.ts";
import {setFoundedMessages} from "@/store/fondedMessagesSlice.ts";
import {useSelector} from "react-redux";

interface Props {
    messages: Message[];
}

function MessageSearch({ messages }: Props) {
    const {foundedMessages} = useSelector((state: RootState) => state.foundMessagesData)
    const inputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

    const handleSearch = () => {
        const query = inputRef.current?.value.toLowerCase() || "";
        if(!query) {
            store.dispatch(setFoundedMessages([]))
            return;
        }
        const results = messages.filter((msg) =>
            typeof msg.data === "string"
                ? msg.data.toLowerCase().includes(query)
                : msg.data.altText?.toLowerCase().includes(query)
        );
        store.dispatch(setFoundedMessages(results.length > 0 ? results : []));
    };

    const handleUploadMore = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        console.log("Load all matches clicked!");
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if ( searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
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
                onChange={handleSearch}
                style={{
                    borderBottomLeftRadius: isInputFocused && foundedMessages.length ? "0px" : "8px",
                    borderBottomRightRadius: isInputFocused && foundedMessages.length ? "0px" : "8px"
                }}
            />
            {isInputFocused && foundedMessages.length > 0 && (
                <div className={styles.foundMessages}>
                    <div className={styles.foundMessagesAmount}>
                        <span>Found {foundedMessages.length} messages</span>
                        <button onClick={handleUploadMore} className={styles.foundMessagesAmountButton}>
                            Load all matches
                        </button>
                    </div>
                    <div className={styles.foundMessagesContent}>
                        {foundedMessages.map((msg, index) => (
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
