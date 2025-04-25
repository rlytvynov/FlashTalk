import styles from "./CreateNewChannelModal.module.css"
import {useState} from "react";
import store from "@/store/store.ts";
import {fetchCreateChannel} from "@/store/channelsSlice.ts";

interface Props {isModalOpen: boolean, toggleModalCreateChannel: () => void}

function CreateNewChannelModal({isModalOpen, toggleModalCreateChannel}: Props) {
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name || !description) {
            alert("Please fill in all fields");
            return;
        }
        try {
            await store.dispatch(fetchCreateChannel({name, description})).unwrap()
        } catch (error) {
            console.error("Error creating channel:", error);
        }
    }
    return (
        <div className={`${styles.modalWindowContainer} ${isModalOpen ? styles.open : ""}`}>
            <form onSubmit={handleSubmit} className={styles.modalWindowContent}>
                <h2>Create a new channel</h2>
                <input value={name} onChange={(e) => setName(e.target.value)} id="channel-name" type="text" placeholder="Channel name..."/>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Channel Description..."/>
                <div className={styles.buttonsContainer}>
                    <button type='submit' onClick={toggleModalCreateChannel}>Create</button>
                    <button onClick={toggleModalCreateChannel}>Cancel</button>
                </div>
            </form>
        </div>
    )
}

export default CreateNewChannelModal;