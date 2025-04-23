import styles from "@/components/channel/ChannelInfo.module.css";
import {useSelector} from "react-redux";
import {RootState} from "@/store/store.ts";
import {useEffect, useState} from "react";
import {FaPencil} from "react-icons/fa6";
import {FaPlus, FaSearch, FaTimes, FaTrash} from "react-icons/fa";
import {User} from "@/types/user.ts";

interface Props {
    isInfoVisible: boolean;
}

function ChannelInfo({isInfoVisible}: Props) {
    const {activeChannelId, channels} = useSelector((state: RootState) => state.channelsData);
    const [redactedMode, setRedactedMode] = useState({
        description: false,
        members: false,
    });
    const [descriptionDraft, setDescriptionDraft] = useState("");
    const [searchedUserId, setSearchedUserId] = useState("");
    const [foundUsers, setFoundUsers] = useState<Pick<User,  "username" | "displayName" | "id">[]>([]);

    useEffect(() => {
        if (redactedMode.description) {
            const current = channels.find(channel => channel.id === activeChannelId)?.description || "";
            setDescriptionDraft(current);
        }
    }, [redactedMode.description, activeChannelId, channels]);

    const handleDescriptionChange = async () => {
        try {

        } catch (error) {
            console.error("Error updating channel description:", error);
        }
    }

    const handleRemoveFoundUser = (id: string) => {
        setFoundUsers((prev) => prev.filter(user => user.id !== id));
    }

    const handleFindMember = async () => {
        try {
            setFoundUsers((prev) => [
                ...prev,
                {
                    id: String(Math.random() * 1000),
                    username: "lpulova",
                    displayName: "Ludmila Pulova"
                }
            ]);
        } catch (error) {
            console.error("Error finding member:", error);
        }
    }

    return (
        <div className={`${styles.channelInfoContainer} ${isInfoVisible ? styles.channelInfoContainerActive : ""}`}>
            <div className={styles.channelInfoDescriptionTitleContainer}>
                <h3 className={styles.channelInfoDescriptionTitle}>Channel description</h3>
                <button
                    className={styles.channelInfoDescriptionButton}
                    onClick={() => setRedactedMode((prev) => ({...prev, description: !prev.description}))}
                >
                    {redactedMode.description ? <FaTimes/> : <FaPencil/>}
                </button>
            </div>
            <div className={styles.channelInfoDescriptionContentContainer}>
                {redactedMode.description ?
                    <>
                        <textarea
                            className={styles.channelInfoDescriptionTextArea}
                            placeholder="Write a description..."
                            value={descriptionDraft}
                            onChange={(e) => setDescriptionDraft(e.target.value)}
                        />
                        <button className={styles.channelInfoDecriptionButton} onClick={handleDescriptionChange}>Save
                        </button>
                    </> :
                    <p className={styles.channelInfoText}>{channels.find(channel => channel.id === activeChannelId)?.description}</p>
                }
            </div>
            <div className={styles.channelInfoMembersTitleContainer}>
                <h3 className={styles.channelInfoMembersTitle}>Channel members</h3>
                <button
                    className={styles.channelInfoMembersButton}
                    onClick={() => setRedactedMode(
                        (prev) => ({
                            ...prev, members: !prev.members
                        }))
                    }
                >
                    {redactedMode.members ? <FaTimes/> : <FaPlus/>}
                </button>
            </div>
            <div className={styles.channelInfoMembersContentContainer}>
                {redactedMode.members ?
                    <>
                        <div className={styles.channelInfoFoundMembersSearchContainer}>
                            <input
                                className={styles.channelInfoFoundMembersSearchInput}
                                placeholder="Write the user id..."
                                value={searchedUserId}
                                onChange={(e) => setSearchedUserId(e.target.value)}
                            />
                            <button className={styles.channelInfoFoundMembersSearchButton} onClick={handleFindMember}>
                                <FaSearch/></button>
                        </div>
                        {
                            foundUsers.length !== 0 &&
                            <>
                                <ul className={styles.channelInfoFoundMembersContainer}>
                                    {
                                        foundUsers.map((user) => (
                                            <li key={user.id} className={styles.channelInfoFoundMemberContainer}>
                                            <span
                                                className={styles.channelInfoFoundMemberIcon}>{String(user.displayName).slice(0, 3).toUpperCase()}</span>
                                                <span className={styles.channelInfoFoundMemberRemove}
                                                      onClick={() => handleRemoveFoundUser(user.id)}><FaTimes/></span>
                                            </li>
                                        ))
                                    }
                                </ul>
                                <button className={styles.channelInfoAddMembersButton}>Add</button>
                            </>
                        }
                    </>
                    :
                    <ul className={styles.channelInfoMembersContainer}>
                        {
                            channels.find(channel => channel.id === activeChannelId)?.members.map((member) => (
                                <li key={member.username} className={styles.channelInfoMemberContainer}>
                                    <div className={styles.channelInfoMemberIconContainer}>
                                        <span
                                            className={styles.channelInfoMemberIcon}>{String(member.displayName).slice(0, 3).toUpperCase()}</span>
                                        <span className={styles.channelInfoMemberInfoOnlineIndicator}></span>
                                    </div>
                                    <span className={styles.channelInfoMemberName}>{member.username}</span>
                                    <button className={styles.channelInfoMemberDrop}><FaTrash/></button>
                                </li>
                            ))
                        }
                    </ul>
                }
            </div>
        </div>
    );
}

export default ChannelInfo;