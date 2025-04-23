import { useState } from "react";
import { useSelector } from "react-redux";
import { fetchLoginUser } from "@/store/authSlice";
import store, { RootState } from "@/store/store";
import { Link, useNavigate } from "react-router-dom";
import styles from "./LoginForm.module.css";

// Типизация на входните данни от формата
interface LoginData {
    email: string;
    password: string;
}

const LoginForm = () => {
    const { loading } = useSelector((state: RootState) => state.authData);
    const navigate = useNavigate();
    const [formData, setFormData] = useState<LoginData>({ email: "", password: ""});
    const [formErrors, setFormErrors] = useState<Partial<LoginData>>({});
    // Валидация на въведените данни – връща true само ако всичко е коректно
    const validateForm = () => {
        const errors: Partial<LoginData> = {};
        // Валидация на имейл
        if (!formData.email.trim()) {
            errors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Invalid email format.";
        }
        // Валидация на парола
        if (!formData.password) {
            errors.password = "Password is required.";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Обработка при промяна в полетата – обновява данните и изчиства грешки
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Изчистваме грешките локално за това поле
        setFormErrors({ ...formErrors, [e.target.name]: undefined });
    };

    // Изпращане на формата за вход
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        // Извикваме login thunk с подадените данни
        try {
            await store.dispatch(fetchLoginUser(formData)).unwrap();
            navigate("/")
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.heading}>Login to FlashTalk</h2>

            {/* Генериране на полетата от формата */}
            {[
                { name: "email", label: "Email", placeholder: "Enter your email", type: "email" },
                { name: "password", label: "Password", placeholder: "Enter your password", type: "password" }
            ].map(({ name, label, placeholder, type = "text" }) => (
                <div key={name} className={styles.inputGroup}>
                    <label htmlFor={name} className={styles.label}>{label}</label>
                    <input
                        type={type}
                        name={name}
                        id={name}
                        value={formData[name as keyof LoginData]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className={`${styles.input} ${formErrors[name as keyof LoginData] ? styles.inputError : ""}`}
                    />
                    {/* Ако има грешка за това поле – показваме я */}
                    {formErrors[name as keyof LoginData] && (
                        <p className={styles.errorText}>{formErrors[name as keyof LoginData]}</p>
                    )}
                </div>
            ))}
            {/* Бутон за вход – деактивира се при loading или непопълнени полета */}
            <button
                type="submit"
                className={styles.button}
                disabled={loading}
            >
                {loading ? "Logging in..." : "Login"}
            </button>

            {/* Линк за потребители без акаунт */}
            <p className={styles.bottomText}>
                Don't have an account?{" "}
                <Link to="/register" className={styles.registerLink}>
                    Register here
                </Link>
            </p>
        </form>
    );
};

export default LoginForm;
