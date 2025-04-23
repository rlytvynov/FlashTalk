import { useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./HomePage.module.css";

const HomePage = () => {
    useEffect(() => {
        document.title = "FlashTalk | Chat";
    }, []);

    return (
        <div style={{padding: "2rem", textAlign: "center"}}>
            <h1>Welcome to FlashTalk!</h1>
            <p style={{color: "gray"}}>
                You're not logged in.{" "}
                <Link to="/login" className={styles.loginLinkStandalone}>
                    Login
                </Link>
            </p>
        </div>
    );
};

export default HomePage;
