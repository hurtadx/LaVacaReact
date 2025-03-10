import React, { useState } from "react";
import { useNotification } from "../Notification/NotificationContext";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../Supabase/services/Auth";
import { validateEmail } from "../common/FormValidator";
import "./AuthForm.css";

const LoginForm = ({ onSwitchToRegister }) => {
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      showNotification("Por favor, completa todos los campos", "error");
      return false;
    }
    
    const emailCheck = validateEmail(formData.email);
    if (!emailCheck.isValid) {
      showNotification(emailCheck.message, "error");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const { user, error, message } = await loginUser(formData.email, formData.password);
      
      if (error) {
        if (error === 'email-not-confirmed') {
          setNeedsVerification(true);
        }
        showNotification(message, "error");
        setLoading(false);
        return;
      }
      
      showNotification(`¡Bienvenido, ${user.displayName}!`, "success");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error en login:", error);
      showNotification("Error inesperado. Por favor intenta nuevamente más tarde.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
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
        
        <button type="submit" disabled={loading}>
          {loading ? "Procesando..." : "Iniciar Sesión"}
        </button>
      </form>
      
      {needsVerification && (
        <div className="verification-message">
          <p>Debes verificar tu correo electrónico antes de iniciar sesión.</p>
          <button 
            onClick={async () => {
              

            }}
          >
            Reenviar correo de verificación
          </button>
        </div>
      )}
      
      <button
        type="button"
        onClick={onSwitchToRegister}
        className="toggle-button"
        disabled={loading}
      >
        ¿No tienes cuenta? Regístrate
      </button>
    </div>
  );
};

export default LoginForm;