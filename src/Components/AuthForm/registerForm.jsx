import React, { useState } from "react";
import { useNotification } from "../Notification/NotificationContext";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../Services/index";
import { 
  validateEmail, 
  validatePassword, 
  validateUsername,
  validatePasswordMatch 
} from "../common/FormValidator";
import "./AuthForm.css";

const RegisterForm = ({ onSwitchToLogin }) => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    Username: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const passwordCheck = validatePassword(formData.password);
    if (!passwordCheck.isValid) {
      showNotification(passwordCheck.message, "error");
      return false;
    }
    
    const passwordMatchCheck = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (!passwordMatchCheck.isValid) {
      showNotification(passwordMatchCheck.message, "error");
      return false;
    }
    
    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.isValid) {
      showNotification(emailCheck.message, "error");
      return false;
    }
    
    const usernameCheck = validateUsername(formData.Username);
    if (!usernameCheck.isValid) {
      showNotification(usernameCheck.message, "error");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      console.log("📝 Enviando datos de registro:", {
        email: formData.email,
        username: formData.Username
      });
      
      const result = await registerUser(
        formData.email, 
        formData.password, 
        formData.Username
      );
      
      console.log("📊 Resultado completo del registro:", result);
      
      if (!result) {
        showNotification("Error en el servidor de autenticación", "error");
        setLoading(false);
        return;
      }

      
      if (result.emailAlreadyExists === true) {
        console.log("🚫 Email ya registrado detectado");
        showNotification("Este email ya está registrado. Por favor inicia sesión.", "info", 8000);
        setTimeout(() => onSwitchToLogin(), 1500);
        setLoading(false); 
        return; 
      }
      
      
      const { user, error, message, needsEmailConfirmation } = result;
      
      if (error) {
        showNotification(message || "Error en el registro", "error", 8000);
        setLoading(false);
        return;
      }
      
      
      if (needsEmailConfirmation) {
        showNotification(
          "Te hemos enviado un correo de verificación. Por favor revisa tu bandeja de entrada y confirma tu correo antes de iniciar sesión.",
          "info",
          0 
        );
        onSwitchToLogin(); 
      } else {
        showNotification("¡Registro exitoso!", "success");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error en registro:", error);
      
      if (error.message && (
        error.message.includes('already registered') || 
        error.message.includes('already in use') ||
        error.message.includes('User already registered')
      )) {
        showNotification("Este email ya está registrado. Por favor inicia sesión.", "info", 8000);
        setTimeout(() => onSwitchToLogin(), 1500);
      } else {
        showNotification("Error inesperado. Por favor intenta nuevamente más tarde.", "error", 8000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Crear Cuenta</h2>
      <form onSubmit={handleSubmit}>
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
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? "Procesando..." : "Registrarse"}
        </button>
      </form>
      
      <button
        type="button"
        onClick={onSwitchToLogin}
        className="toggle-button"
        disabled={loading}
      >
        ¿Ya tienes cuenta? Inicia sesión
      </button>
    </div>
  );
};

export default RegisterForm;



