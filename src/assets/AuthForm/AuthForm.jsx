import React, { useState } from "react";
import { useNotification } from "../Notification/NotificationContext";
import "./AuthForm.css";

// Constantes
const MIN_PASSWORD_LENGTH = 6;
const MIN_USERNAME_LENGTH = 3;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Funciones de validación
const validatePassword = (password) => password.length >= MIN_PASSWORD_LENGTH;
const validateEmail = (email) => EMAIL_REGEX.test(email);
const validateUsername = (username) => username.length >= MIN_USERNAME_LENGTH;

const AuthForm = ({ type, onTypeChange }) => {  
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        ...(type === "register" && { confirmPassword: "", Username: "" }),
    });

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

const handleSubmit = (e) => {
  e.preventDefault();

  if(type === "register"){
    if (!validateRegisterForm()) return;
    showNotification("Registro exitoso", "success");
  } else {
    if (!validateLoginForm()) return;
    showNotification("Inicio de sesión exitoso", "success");
  }
};

const validateRegisterForm = () => {
  if (formData.password !== formData.confirmPassword) {
    showNotification("Las contraseñas no coinciden", "error");
    return false;
  }
  
  if (!validatePassword(formData.password)) {
    showNotification(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`, "error");
    return false;
  }

  if (!validateEmail(formData.email)) {
    showNotification("Por favor, ingresa un email válido", "error");
    return false;
  }

  if (!validateUsername(formData.Username)) {
    showNotification(`El nombre de usuario debe tener al menos ${MIN_USERNAME_LENGTH} caracteres`, "error");
    return false;
  }

  return true;
};

const validateLoginForm = () => {
  if (!formData.email || !formData.password) {
    showNotification("Por favor, completa todos los campos", "error");
    return false;
  }
  return true;
};

return (
  <div className="auth-container">
    <div className="auth-form">
      <form onSubmit={handleSubmit}>
        {type === "register" && (
          <div className="form-group">
            <label htmlFor="Username">Nombre de Usuario</label>
            <input
              type="Username"
              id="Username"
              name="Username"
              value={formData.Username}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        {type === "register" && (
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <button type="submit">
          {type === "login" ? "Iniciar Sesión" : "Registrarse"}
        </button>
      </form> 
      <a
        type="button"
        onClick={onTypeChange}  
        className="toggle-button"
      >
        {type === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </a>
    </div>
  </div>
  );
};

export default AuthForm;