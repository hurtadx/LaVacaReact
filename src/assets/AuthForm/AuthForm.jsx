import React, { useState } from "react";
import ".//AuthForm.css";


const AuthForm = ({ type }) => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        ...(type === "register" && { confirmPassword: "" }),
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
  // no se le olvide la logica psss
  console.log('Form submitted:', formData);
};    


return (
    <div className="auth-form">
      <h1>{type === "login" ? "Iniciar Sesión" : "Registrarse"}</h1>
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
    </div>
  );
};

export default AuthForm;