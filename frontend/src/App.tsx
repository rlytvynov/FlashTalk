import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import RegisterPage from "@/pages/registration/RegisterPage.tsx";
import LoginPage from "@/pages/login/LoginPage.tsx";
import HomePage from "@/pages/home/HomePage.tsx";
import {useEffect} from "react";
import store, {RootState} from "@/store/store.ts";
import {fetchTokenValidation} from "@/store/authSlice.ts";
import {useSelector} from "react-redux";
import ErrorDisplay from "@/components/error/ErrorDisplay.tsx";
import {ToastContainer} from "react-toastify";
import ChatWrapper from "@/pages/chat/ChatWrapper.tsx";

function App() {
    const { user } = useSelector((state: RootState) => state.authData);
    useEffect(() => {
        const verifyToken = async () => {
            try {
                await store.dispatch(fetchTokenValidation()).unwrap();
            } catch (error) {
                console.error("Token validation failed:", error);
            }
        };
        verifyToken()
    }, []);
    return (
        <>
            <BrowserRouter>
                <Routes>
                    {/* Only show login/register if not authenticated */}
                    {!user && (
                        <>
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/login" element={<LoginPage />} />
                        </>
                    )}
                    {/* Root path logic based on auth status */}
                    <Route path="/" element={ user ? <ChatWrapper /> : <HomePage /> } />
                    {/* Optional: Catch-all redirect for unknown paths */}
                    <Route path="*" element={<Navigate to="/" replace />}/>
                </Routes>
            </BrowserRouter>
            <ToastContainer />
            <ErrorDisplay/>
        </>
    )
}

export default App
