import styles from "@/components/channel/ChannelInfo.module.css";
import {useSelector} from "react-redux";
import {setChannelError, addMembersToChannel, removeMemberFromChannel} from "@/store/channelsSlice.ts";
import store, {RootState} from "@/store/store.ts";
import {useState} from "react";
import {FaPlus, FaSearch, FaTimes, FaTrash} from "react-icons/fa";
import {socket} from "@/socket.ts"
import {ChannelMember} from "@/types/channel.ts"
import {User} from "@/types/user.ts";
import {fetchDataAuth} from "@/utils/fetch.ts";

interface Props {
    isInfoVisible: boolean;
}

function ChannelInfo({isInfoVisible}: Props) {
    const {activeChannelId, channels} = useSelector((state: RootState) => state.channelsData);
    const {user} = useSelector((state: RootState) => state.authData);
    const [redactedMode, setRedactedMode] = useState(false);
    const [candidateUsername, setCandidateUsername] = useState("");
    const [candidates, setCandidates] = useState<Pick<User,  "username" | "displayname" | "id">[]>([]);

    const handleFindCandidate = async () => {
        try {
            if(candidateUsername !== user?.username && !candidates.some(candidate => candidate.username === candidateUsername)) {
                const response = await fetchDataAuth<{
                    data: User
                }>(`${import.meta.env.VITE_API_URL}/users/${candidateUsername}`)
                console.log(response.data)
                if (response.data) {
                    const user = response.data;
                    setCandidates((prev) => [...prev, {
                        username: user.username,
                        displayname: user.displayname,
                        id: user.id
                    }]);
                } else {
                    alert("User not found");
                }
            }
        } catch (error) {
            console.error("Error finding member:", error);
        }
    }

    const handleRemoveCandidate = (id: string) => {
        setCandidates((prev) => prev.filter(user => user.id !== id));
    }

    const handleAddMembers = async () => {
        try {
            const candidateIds = candidates.map(candidate => candidate.id);
            
            socket?.emit('add-users-to-channel', activeChannelId, candidateIds, (error: Error, newMembers: ChannelMember[]) => {
                if (error) 
                    store.dispatch(setChannelError({ type: "channels/addMembers", message: error.message }));
                
                store.dispatch(addMembersToChannel({ channelId: activeChannelId, newMembers }));
            });

            setRedactedMode(false);
            setCandidates([]);
        } catch (error) {
            console.error("Error adding members:", error);
        }
    }

    const handleDeleteMember = async (memberId: string) => {
        try {
            socket?.emit('remove-user-from-channel', activeChannelId, memberId, (error: Error) => {
                if (error)
                    store.dispatch(setChannelError({ type: 'channels/removeMember', message: error.message }));
                else
                    store.dispatch(removeMemberFromChannel({ channelId: activeChannelId, memberId }))
            });
        } catch (error) {
            console.error("Error deleting member:", error);
        }
    }

    return (
        <div className={`${styles.channelInfoContainer} ${isInfoVisible ? styles.channelInfoContainerActive : ""}`}>
            <div className={styles.channelInfoDescriptionTitleContainer}>
                <h3 className={styles.channelInfoDescriptionTitle}>Channel description</h3>
            </div>
            <div className={styles.channelInfoDescriptionContentContainer}>
                <p className={styles.channelInfoText}>{channels.find(channel => channel.id === activeChannelId)?.description}</p>
            </div>
            <div className={styles.channelInfoMembersTitleContainer}>
                <h3 className={styles.channelInfoMembersTitle}>Channel members</h3>
                {   channels.find(channel => channel.id === activeChannelId)?.adminid === user?.id &&
                    <button
                        className={styles.channelInfoMembersButton}
                        onClick={() => setRedactedMode(!redactedMode)
                        }
                    >
                        {redactedMode ? <FaTimes/> : <FaPlus/>}
                    </button>
                    }
            </div>
            <div className={styles.channelInfoMembersContentContainer}>
                {redactedMode ?
                    <>
                        <div className={styles.channelInfoFoundMembersSearchContainer}>
                            <input
                                className={styles.channelInfoFoundMembersSearchInput}
                                placeholder="Write the username..."
                                value={candidateUsername}
                                onChange={(e) => setCandidateUsername(e.target.value)}
                            />
                            <button className={styles.channelInfoFoundMembersSearchButton} onClick={handleFindCandidate}>
                                <FaSearch/></button>
                        </div>
                        {
                            candidates.length !== 0 &&
                            <>
                                <ul className={styles.channelInfoFoundMembersContainer}>
                                    {
                                        candidates.map((user) => (
                                            <li key={user.id} className={styles.channelInfoFoundMemberContainer}>
                                            <span
                                                className={styles.channelInfoFoundMemberIcon}>{String(user.displayname).slice(0, 3).toUpperCase()}</span>
                                                <span className={styles.channelInfoFoundMemberRemove}
                                                      onClick={() => handleRemoveCandidate(user.id)}><FaTimes/></span>
                                            </li>
                                        ))
                                    }
                                </ul>
                                <button onClick={handleAddMembers} className={styles.channelInfoAddMembersButton}>Add</button>
                            </>
                        }
                    </>
                    :
                    <ul className={styles.channelInfoMembersContainer}>
                        {
                            channels.find(channel => channel.id === activeChannelId)?.members.map((member) => (
                                <li key={member.id} className={styles.channelInfoMemberContainer}>
                                    <div className={styles.channelInfoMemberIconContainer}>
                                        <span
                                            className={styles.channelInfoMemberIcon}>{String(member.displayname).slice(0, 3).toUpperCase()}</span>
                                        <span
                                            className={`${ member.online || member.id === user?.id ?
                                                    styles.channelInfoMemberInfoOnlineIndicator : styles.channelInfoMemberInfoOfflineIndicator}`}></span>
                                    </div>
                                    <span className={styles.channelInfoMemberName}>{member.username}</span>
                                    <button onClick={() => handleDeleteMember(member.id)} className={styles.channelInfoMemberDrop}><FaTrash/></button>
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