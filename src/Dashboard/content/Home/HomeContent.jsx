import React from "react";
import './HomeContent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCow } from '@fortawesome/free-solid-svg-icons';
import '../../Resposive/dashboard-responsive.css'


const HomeContent = ({ onVacasButtonClick, totalVacas = 0 }) => {
 
  const vacasToShow = Math.min(totalVacas, 5);
  

  const vacasIcons = Array.from({ length: vacasToShow }, (_, index) => index);
  
  return (
    <>
      <section className="account-summary">
        <div className="card">
          <h3>Total "Vaca Playa"</h3>
          <p className="amount">$0.00</p>
        </div>
        
        <button className="card interactive" onClick={onVacasButtonClick}>
          <h3>Tus Vacas</h3>
          <div className="vacas-count">
            <p className="count">{totalVacas}</p>
            <div className="vacas-icons">
              {vacasIcons.map((_, index) => (
                <FontAwesomeIcon 
                  key={index} 
                  icon={faCow} 
                  className={`vaca-icon vaca-delay-${index}`} 
                />
              ))}
              {totalVacas === 0 && (
                <FontAwesomeIcon 
                  icon={faCow} 
                  className="vaca-icon empty-vaca" 
                />
              )}
            </div>
          </div>
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