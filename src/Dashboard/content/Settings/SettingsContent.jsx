import React from "react";
import './SettingsContent.css';

const SettingsContent = () => {
  return (
    <section className="settings-section">
      <h1>Ajustes</h1>
      <div className="settings-card">
        <h3>Perfil de Usuario</h3>
        <form className="settings-form">
          <div className="form-group">
            <label>Nombre de usuario</label>
            <input type="text" placeholder="Tu nombre de usuario" />
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" placeholder="Tu correo electrónico" disabled />
          </div>
          <button type="submit">Guardar Cambios</button>
        </form>
      </div>
    </section>
  );
};

export default SettingsContent;