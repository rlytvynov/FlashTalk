import { useState } from "react";
import {fetchRegisterUser} from "@/store/authSlice";
import { Link, useNavigate } from "react-router-dom";
import styles from "./RegisterForm.module.css";
import store, {RootState} from "@/store/store.ts";
import {useSelector} from "react-redux";

// Интерфейс за формата – типизация на въведените стойности
interface FormData {
    fullName: string;
    nickname: string;
    email: string;
    password: string;
    repeatPassword: string;
}

const RegisterForm = () => {
    const navigate = useNavigate();
    const { loading } = useSelector((state: RootState) => state.authData);
    // Състояние на въведените стойности от потребителя
    const [formData, setFormData] = useState<FormData>({
        fullName: "",
        nickname: "",
        email: "",
        password: "",
        repeatPassword: ""
    });
    // Състояние за валидационни грешки при отделни полета
    const [formErrors, setFormErrors] = useState<Partial<FormData>>({});

    // Функция за валидация на формата
    const validateForm = () => {
        const errors: Partial<FormData> = {};

        // Проверка за задължителни полета и конкретни условия
        if (!formData.fullName.trim()) errors.fullName = "Full name is required.";
        if (!formData.nickname.trim()) errors.nickname = "Nickname is required.";

        if (!formData.email.trim()) {
            errors.email = "Email is required.";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Invalid email format.";
        }

        if (!formData.password) {
            errors.password = "Password is required.";
        } else if (formData.password.length < 6) {
            errors.password = "Password must be at least 6 characters.";
        }

        if (!formData.repeatPassword) {
            errors.repeatPassword = "Please repeat your password.";
        } else if (formData.password !== formData.repeatPassword) {
            errors.repeatPassword = "Passwords do not match.";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Обработка при промяна на някое поле от формата
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Актуализиране на въведената стойност
        setFormData(prev => ({ ...prev, [name]: value }));
        // Изчистване на локалната грешка за текущото поле (ако има)
        setFormErrors(prev => ({ ...prev, [name]: undefined }));
    };

    // Обработка при изпращане на формата
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Ако има грешки – не изпращаме заявка
        if (!validateForm()) return;
        // Изпращаме заявка за регистрация
        try {
            await store.dispatch(fetchRegisterUser({
                username: formData.nickname,
                email: formData.email,
                password: formData.password,
                displayName: formData.fullName
            })).unwrap();
            navigate("/login")
        } catch (error) {
            console.error("Registration error:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.heading}>Register to FlashTalk</h2>

            {/* Полетата от формата – рендират се от масив за по-кратко */}
            {[
                {name: "fullName", label: "Full Name", placeholder: "Enter your full name"},
                {name: "nickname", label: "Nickname", placeholder: "Choose a nickname"},
                {name: "email", label: "Email", placeholder: "Enter your email", type: "email"},
                {name: "password", label: "Password", placeholder: "Enter a password", type: "password"},
                {
                    name: "repeatPassword",
                    label: "Repeat Password",
                    placeholder: "Repeat your password",
                    type: "password"
                },
            ].map(({name, label, placeholder, type = "text"}) => (
                <div key={name} className={styles.inputGroup}>
                    <label htmlFor={name} className={styles.label}>{label}</label>
                    <input
                        type={type}
                        name={name}
                        id={name}
                        value={formData[name as keyof FormData]}
                        onChange={handleChange}
                        placeholder={placeholder}
                        className={`${styles.input} ${formErrors[name as keyof FormData] ? styles.inputError : ""}`}
                    />
                    {/* Показване на грешка под полето, ако има такава */}
                    {formErrors[name as keyof FormData] && (
                        <p className={styles.errorText}>{formErrors[name as keyof FormData]}</p>
                    )}
                </div>
            ))}

            {/*{error && error.type === "auth/register" && (*/}
            {/*    <p className={styles.errorText} style={{textAlign: "center"}}>*/}
            {/*        {error.message}*/}
            {/*    </p>*/}
            {/*)}*/}

            {/* Бутон за регистрация */}
            <button
                type="submit"
                className={styles.button}
                disabled={loading}
            >
                {loading ? "Registering..." : "Register"}
            </button>

            {/* Линк към login страница за потребители с акаунт */}
            <p className={styles.bottomText}>
                Already have an account?{" "}
                <Link to="/login" className={styles.loginLink}>
                    Login here
                </Link>
            </p>
        </form>
    );
};

export default RegisterForm;
