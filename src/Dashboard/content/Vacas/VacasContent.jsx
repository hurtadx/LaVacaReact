import React, { useState } from "react";
import './VacasContent.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCow, faPlus } from '@fortawesome/free-solid-svg-icons';
import CreateVacaForm from './CreateVacaForm';
import VacaDetails from './VacaDetails';

const VacasContent = ({ vacas, setVacas }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedVaca, setSelectedVaca] = useState(null);

  const handleCreateVaca = (newVaca) => {
    // esto genera los id de la vacasssss
    const vacaWithId = { ...newVaca, id: Date.now().toString() };
    setVacas([...vacas, vacaWithId]);
    setShowCreateForm(false);
  };

  const handleVacaClick = (vaca) => {
    setSelectedVaca(vaca);
  };

  const handleBackClick = () => {
    setSelectedVaca(null);
  };

  
  if (selectedVaca) {
    return <VacaDetails vaca={selectedVaca} onBackClick={handleBackClick} />;
  }

 
  if (showCreateForm) {
    return <CreateVacaForm onSave={handleCreateVaca} onCancel={() => setShowCreateForm(false)} />;
  }

 
  
  return (
    <>
      <section className="vacas-header">
        <h1>Tus Vacas</h1>
        <button className="create-vaca-btn" onClick={() => setShowCreateForm(true)}>
          <FontAwesomeIcon icon={faPlus} /> Crear Nueva Vaca
        </button>
      </section>
      
      <section className="vacas-list">
        {vacas && vacas.length > 0 ? (
          <div className="vacas-grid">
            {vacas.map(vaca => (
              <div 
                key={vaca.id} 
                className="vaca-card"
                onClick={() => handleVacaClick(vaca)}
              >
                <div className="vaca-card-header" style={{ backgroundColor: vaca.color || '#3F60E5' }}>
                  <FontAwesomeIcon icon={faCow} className="vaca-card-icon" />
                  <h3>{vaca.name}</h3>
                </div>
                <div className="vaca-card-content">
                  <p className="vaca-goal">Meta: ${vaca.goal.toLocaleString()}</p>
                  <p className="vaca-current">Actual: ${vaca.current ? vaca.current.toLocaleString() : '0'}</p>
                  <div className="vaca-progress">
                    <div 
                      className="vaca-progress-bar" 
                      style={{ width: `${vaca.current ? Math.min((vaca.current / vaca.goal) * 100, 100) : 0}%` }}
                    ></div>
                  </div>
                  <p className="vaca-members">{vaca.participants?.length || 0} participantes</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FontAwesomeIcon icon={faCow} className="empty-icon" style={{fontSize: "64px", color: "#3F60E5"}} />
            <h3>No tienes ninguna vaca creada</h3>
            <p>¡Crea tu primera vaca para comenzar a ahorrar con tus amigos!</p>
            <button className="create-first-btn" onClick={() => setShowCreateForm(true)}>
              <FontAwesomeIcon icon={faPlus} /> Crear Primera Vaca
            </button>
          </div>
        )}
      </section>
    </>
  );
};

export default VacasContent;