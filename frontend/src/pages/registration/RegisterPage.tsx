import RegisterForm from "@/components/forms/RegisterForm";
import { useEffect } from "react";

const Register = () => {
    useEffect(() => {
        document.title = "FlashTalk | Registration";
    }, []);

    return (
        <div className="wrapper">
            <RegisterForm />
        </div>
    );
};

export default Register;
