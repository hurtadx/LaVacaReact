import React from "react";
import './VacasContent.css';
import logo from '../../../Components/Img/LogoLaVaca.png';

const VacasContent = () => {
  return (
    <>
      <section className="vacas-header">
        <h1>Tus Vacas</h1>
        <button className="create-vaca-btn">Crear Nueva Vaca</button>
      </section>
      
      <section className="vacas-list">
        
        <div className="empty-state">
          <img src={logo} alt="LaVaca" className="empty-icon" />
          <h3>No tienes ninguna vaca creada</h3>
          <p>¡Crea tu primera vaca para comenzar a ahorrar con tus amigos!</p>
          <button className="create-first-btn">Crear Primera Vaca</button>
        </div>
      </section>
    </>
  );
};

export default VacasContent;