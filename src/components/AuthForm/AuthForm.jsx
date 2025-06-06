import React, { useState } from "react";
import LoginForm from "./loginForm";
import RegisterForm from "./registerForm";
import "./AuthForm.css";
import AnimatedCarrousel from "../AnimatedCarrousel/AnimatedCarrousel";

const AuthForm = ({ type: initialType }) => {
  const [type, setType] = useState(initialType || "login");
  
  const toggleFormType = () => {
    setType(prevType => prevType === "login" ? "register" : "login");
  };
  
  return (
    <div className="auth-page-container">
      {/* Panel izquierdo con imagen */}
      <div className="auth-left-panel">
        <div className="decorative-line"></div>
        <div className="decorative-line"></div>
        <div className="auth-image-container">
          <AnimatedCarrousel/>
        </div>
        <div className="auth-welcome-text">
          <h1>¡Bienvenido a La Vaca!</h1>
          <p>La plataforma para organizar colectas y ahorros grupales de manera sencilla y segura.</p>
        </div>
      </div>
      
      {/* Contenedor del formulario a la derecha */}
      <div className="auth-container">
        {type === "login" ? (
          <LoginForm onSwitchToRegister={toggleFormType} />
        ) : (
          <RegisterForm onSwitchToLogin={toggleFormType} />
        )}
      </div>
    </div>
  );
};

export default AuthForm;