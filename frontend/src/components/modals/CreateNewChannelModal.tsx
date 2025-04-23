import styles from "./CreateNewChannelModal.module.css"
import {FaSearch, FaTimes} from "react-icons/fa";
import {useState} from "react";
import {User} from "@/types/user.ts";
interface Props {isModalOpen: boolean, toggleModalCreateChannel: () => void}

function CreateNewChannelModal({isModalOpen, toggleModalCreateChannel}: Props) {
    const [searchedUserId, setSearchedUserId] = useState("");
    const [foundUsers, setFoundUsers] = useState<Pick<User,  "username" | "displayName" | "id">[]>([]);
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
        <div className={`${styles.modalWindowContainer} ${isModalOpen ? styles.open : ""}`}>
            <div className={styles.modalWindowContent}>
                <h2>Create a new channel</h2>
                <input id="channel-name" type="text" placeholder="Channel name..."/>
                <textarea placeholder="Channel Description..."/>
                <div className={styles.modalWindowFoundMembersSearchContainer}>
                    <input
                        className={styles.modalWindowFoundMembersSearchInput}
                        placeholder="Write the user id..."
                        value={searchedUserId}
                        onChange={(e) => setSearchedUserId(e.target.value)}
                    />
                    <button className={styles.modalWindowFoundMembersSearchButton} onClick={handleFindMember}>
                        <FaSearch/></button>
                </div>
                {
                    foundUsers.length !== 0 &&
                    <>
                        <ul className={styles.modalWindowFoundMembersContainer}>
                            {
                                foundUsers.map((user) => (
                                    <li key={user.id} className={styles.modalWindowFoundMemberContainer}>
                                            <span
                                                className={styles.modalWindowFoundMemberIcon}>{String(user.displayName).slice(0, 3).toUpperCase()}</span>
                                        <span className={styles.modalWindowFoundMemberRemove}
                                              onClick={() => handleRemoveFoundUser(user.id)}><FaTimes/></span>
                                    </li>
                                ))
                            }
                        </ul>
                    </>
                }
                <div className={styles.buttonsContainer}>
                    <button onClick={toggleModalCreateChannel}>Create</button>
                    <button onClick={toggleModalCreateChannel}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default CreateNewChannelModal;