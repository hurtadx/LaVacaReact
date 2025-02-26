import React, { useState } from "react";
import { useNotification } from "../Notification/NotificationContext";
import "./AuthForm.css";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser } from "../../Firebase/Services/Auth";

const MIN_PASSWORD_LENGTH = 6;
const MIN_USERNAME_LENGTH = 3;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validatePassword = (password) => password.length >= MIN_PASSWORD_LENGTH;
const validateEmail = (email) => EMAIL_REGEX.test(email);
const validateUsername = (username) => username.length >= MIN_USERNAME_LENGTH;

const AuthForm = ({ type, onTypeChange }) => {  
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        ...(type === "register" && { confirmPassword: "", Username: "" }),
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      try {
        if(type === "register"){
          if (!validateRegisterForm()) {
            setLoading(false);
            return;
          }
          
          const { user, error } = await registerUser(
            formData.email, 
            formData.password,
            formData.Username
          );
          
          if (error) {
        
            if (error.includes("email-already-in-use")) {
              showNotification("Ya hay una cuenta registrada con este correo. Inicia sesión.", "error");
            } else if (error.includes("weak-password")) {
              showNotification("La contraseña es demasiado débil. Usa una combinación de letras, números y símbolos.", "error");
            } else if (error.includes("invalid-email")) {
              showNotification("El formato del correo electrónico no es válido.", "error");
            } else {
              showNotification(error, "error");
            }
            setLoading(false);
            return;
          }
          
          showNotification("Registro exitoso", "success");
        } else {
          if (!validateLoginForm()) {
            setLoading(false);
            return;
          }
          
          const { user, error } = await loginUser(formData.email, formData.password);
          
          if (error) {
        
            if (error.includes("user-not-found")) {
              showNotification("No existe una cuenta con este correo. Por favor regístrate.", "error");
            } else if (error.includes("wrong-password")) {
              showNotification("Contraseña incorrecta. Verifica tus credenciales.", "error");
            } else if (error.includes("too-many-requests")) {
              showNotification("Demasiados intentos fallidos. Por favor intenta más tarde o restablece tu contraseña.", "error");
            } else if (error.includes("user-disabled")) {
              showNotification("Esta cuenta ha sido deshabilitada. Contacta a soporte.", "error");
            } else {
              showNotification(error, "error");
            }
            setLoading(false);
            return;
          }
          
          showNotification("Inicio de sesión exitoso", "success");
        }
        
        
        navigate("/dashboard");
      } catch (error) {
        showNotification("Error inesperado. Por favor intenta nuevamente más tarde.", "error");
        console.error(error); 
        setLoading(false);
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
                  type="text"
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
            <button type="submit" disabled={loading}>
              {loading 
                ? "Procesando..." 
                : type === "login" 
                  ? "Iniciar Sesión" 
                  : "Registrarse"
              }
            </button>
          </form> 
          <button
            type="button"
            onClick={onTypeChange}  
            className="toggle-button"
            disabled={loading}
          >
            {type === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
          </button>
        </div>
      </div>
    );
};

export default AuthForm;