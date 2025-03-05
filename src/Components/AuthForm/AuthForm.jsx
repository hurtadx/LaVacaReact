import React, { useState } from "react";
import LoginForm from "./loginForm";
import RegisterForm from "./registerForm";
import "./AuthForm.css";

const AuthForm = ({ type: initialType }) => {
  const [type, setType] = useState(initialType || "login");
  
  const toggleFormType = () => {
    setType(prevType => prevType === "login" ? "register" : "login");
  };
  
  return (
    <div className="auth-container">
      {type === "login" ? (
        <LoginForm onSwitchToRegister={toggleFormType} />
      ) : (
        <RegisterForm onSwitchToLogin={toggleFormType} />
      )}
    </div>
  );
};

export default AuthForm;