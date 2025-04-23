import LoginForm from "@/components/forms/LoginForm";
import { useEffect } from "react";

const Login = () => {
     useEffect(() => {
          document.title = "FlashTalk | Login";
     }, []);

     return (
         <div className="wrapper">
              <LoginForm />
         </div>
     );
};

export default Login;