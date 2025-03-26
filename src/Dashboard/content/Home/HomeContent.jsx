import React, { useState, useEffect, useMemo } from 'react';
import './HomeContent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCow, faCalendarAlt, faHistory } from '@fortawesome/free-solid-svg-icons';
import '../../Resposive/dashboard-responsive.css';

const HomeContent = ({ onVacasButtonClick, totalVacas = 0, vacas = [], onVacaSelect, user }) => {
  const vacasToShow = Math.min(totalVacas, 5);
  const vacasIcons = Array.from({ length: vacasToShow }, (_, index) => index);
  
  
  const [lastVisitedVaca, setLastVisitedVaca] = useState(null);
  
  
  useEffect(() => {
    const loadLastVisitedVaca = () => {
      try {
        
        const lastVisitedKey = Object.keys(localStorage).find(key => 
          key.includes('lastVisitedVaca')
        );
        
        console.log("Clave encontrada:", lastVisitedKey);
        
        if (lastVisitedKey) {
          const storedData = localStorage.getItem(lastVisitedKey);
          console.log("Datos encontrados:", storedData);
          
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            setLastVisitedVaca(parsedData);
            console.log("Última vaca visitada cargada:", parsedData);
          }
        }
      } catch (error) {
        console.error("Error al cargar la última vaca visitada:", error);
      }
    };
    
    
    loadLastVisitedVaca();
    
    
    const handleStorageChange = (e) => {
      if (e.key?.includes('lastVisitedVaca')) {
        console.log("Cambio detectado en localStorage para lastVisitedVaca");
        loadLastVisitedVaca();
      }
    };
    
    
    const handleVacaVisited = () => {
      console.log("Evento vacaVisited detectado");
      loadLastVisitedVaca();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('vacaVisited', handleVacaVisited);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('vacaVisited', handleVacaVisited);
    };
  }, []); 
  
  
  const nextPaymentData = useMemo(() => {
    if (!vacas || vacas.length === 0) {
      return { days: 0, vaca: null };
    }
    
    const today = new Date();
    let closestVaca = null;
    let minDays = Infinity;
    
    vacas.forEach(vaca => {
      
      if (vaca.deadline) {
        const deadline = new Date(vaca.deadline);
        
        if ((!vaca.current || vaca.current < vaca.goal) && deadline > today) {
          const diffTime = deadline.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < minDays) {
            minDays = diffDays;
            closestVaca = vaca;
          }
        }
      }
    });
    
    return { days: minDays === Infinity ? 0 : minDays, vaca: closestVaca };
  }, [vacas]);
  
  
  const handleNextPaymentClick = () => {
    if (nextPaymentData.vaca && onVacaSelect) {
      onVacaSelect(nextPaymentData.vaca);
    }
  };
  
  return (
    <>
      <section className="account-summary">
        <div className={`card ${lastVisitedVaca ? 'has-last-visited' : ''}`}>
          <h3>
            {lastVisitedVaca ? lastVisitedVaca.name : "Total Vaca"}
            {lastVisitedVaca && <FontAwesomeIcon icon={faHistory} className="last-visited-icon" />}
          </h3>
          <p className="amount">
            {lastVisitedVaca ? 
              `$${lastVisitedVaca.current ? lastVisitedVaca.current.toLocaleString() : '0'}` : 
              "Sin datos"}
          </p>
          {lastVisitedVaca && (
            <p className="vaca-goal-text">
              Meta: ${lastVisitedVaca.goal ? lastVisitedVaca.goal.toLocaleString() : '0'}
            </p>
          )}
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
        
        <button 
          className={`card interactive ${nextPaymentData.vaca ? 'has-payment' : ''}`} 
          onClick={handleNextPaymentClick}
          disabled={!nextPaymentData.vaca}
        >
          <h3>Próximo Pago</h3>
          {nextPaymentData.vaca ? (
            <>
              <p className="days">Quedan {nextPaymentData.days} días</p>
              <p className="vaca-name">{nextPaymentData.vaca.name}</p>
            </>
          ) : (
            <p className="days">No hay pagos próximos</p>
          )}
          {nextPaymentData.vaca && (
            <FontAwesomeIcon icon={faCalendarAlt} className="calendar-icon" />
          )}
        </button>
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