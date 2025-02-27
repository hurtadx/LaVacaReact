import React from "react";
import './HomeContent.css';

const HomeContent = ({ onVacasButtonClick }) => {
  return (
    <>
      <section className="account-summary">
        <div className="card">
          <h3>Total "Vaca Playa"</h3>
          <p className="amount">$0.00</p>
        </div>
        
        <button className="card interactive" onClick={onVacasButtonClick}>
          <h3>Tus Vacas</h3>
          <p className="count">0</p>
        </button>
        
        <div className="card">
          <h3>Próximo Pago</h3>
          <p className="days">Quedan 0 días</p>
        </div>
      </section>
      
      <section className="transactions">
        <h2>Últimas Transacciones</h2>
        <ul>
          <li>Retiro Vaca Playa -$20,000</li>
          <li>Retiro Vaca Playa -$20,000</li>
          <li>Retiro Vaca Farra -$90,000</li>
        </ul>
      </section>
    </>
  );
};

export default HomeContent;