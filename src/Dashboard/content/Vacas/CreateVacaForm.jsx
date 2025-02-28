import React, { useState } from "react";
import './CreateVacaForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faPlus,
  faUserPlus,
  faCow } from '@fortawesome/free-solid-svg-icons';

const CreateVacaForm = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: '',
    deadline: '',
    color: '#3F60E5',
    participants: []
  });

  const [participant, setParticipant] = useState({
    email: '',
    name: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'goal' ? parseFloat(value) || '' : value
    }));
  };

  const handleParticipantChange = (e) => {
    const { name, value } = e.target;
    setParticipant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addParticipant = () => {
    if (participant.email && participant.name) {
      setFormData(prev => ({
        ...prev,
        participants: [...prev.participants, { ...participant, id: Date.now().toString() }]
      }));
      setParticipant({ email: '', name: '' });
    }
  };

  const removeParticipant = (id) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.goal) return;
    
    onSave({
      ...formData,
      current: 0,       createdAt: new Date().toISOString(),
      owner: 'currentUserId' // ahorita uso el usuario actual no olvidar
    });
  };

  return (
    <div className="create-vaca-container">
      <div className="create-vaca-header">
        <h1>Crear Nueva Vaca</h1>
        <button className="back-button" onClick={onCancel}>
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </button>
      </div>
      
      <form className="create-vaca-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Información Básica</h2>
          
          <div className="basic-info-grid">
            <div className="form-group full-width">
              <label htmlFor="name">Nombre de la Vaca</label>
              <input 
                type="text" 
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Vaca para Viaje a la Playa"
                required
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="description">Descripción</label>
              <textarea 
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe el propósito de esta vaca..."
                rows={2}
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="goal">Meta (en $)</label>
              <div className="amount-input-group">
                <span>$</span>
                <input 
                  type="number" 
                  id="goal"
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  placeholder="Ej: 1000000"
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="deadline">Fecha límite</label>
              <input 
                type="date" 
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="color">Color de la Vaca</label>
              <div className="color-picker">
                <input 
                  type="color" 
                  id="color"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                />
                <span>Selecciona un color para identificar tu vaca</span>
                <FontAwesomeIcon 
                  icon={faCow} 
                  className="color-preview-icon flip-horizontal" 
                  style={{ color: formData.color }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Participantes</h2>
          
          <div className="participant-form">
            <div className="form-group">
              <label htmlFor="participant-name">Nombre</label>
              <input 
                type="text" 
                id="participant-name"
                placeholder="Nombre del participante"
                name="name"
                value={participant.name}
                onChange={handleParticipantChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="participant-email">Correo electrónico</label>
              <input 
                type="email" 
                id="participant-email"
                placeholder="email@ejemplo.com"
                name="email"
                value={participant.email}
                onChange={handleParticipantChange}
              />
            </div>
            
            <button 
              type="button" 
              className="add-participant-btn"
              onClick={addParticipant}
              disabled={!participant.name || !participant.email}
            >
              <FontAwesomeIcon icon={faUserPlus} /> Añadir
            </button>
          </div>
          
          {formData.participants.length > 0 && (
            <div className="participants-list">
              <h3>Participantes ({formData.participants.length})</h3>
              <ul>
                {formData.participants.map(p => (
                  <li key={p.id}>
                    <span>{p.name} ({p.email})</span>
                    <button 
                      type="button" 
                      className="remove-btn"
                      onClick={() => removeParticipant(p.id)}
                      aria-label="Eliminar participante"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn">
            Cancelar
          </button>
          <button 
            type="submit" 
            className="save-btn"
            disabled={!formData.name || !formData.goal}
          >
            <FontAwesomeIcon icon={faPlus} /> Crear Vaca
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVacaForm;