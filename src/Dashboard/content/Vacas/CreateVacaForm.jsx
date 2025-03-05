import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus, faTrash, faCow, faCheck } from '@fortawesome/free-solid-svg-icons';
import { createVaca } from "../../../Supabase/Services/vacaService";
import { supabase } from "../../../Supabase/supabaseConfig";
import { useNotification } from "../../../Components/Notification/NotificationContext";
import './CreateVacaForm.css';

const CreateVacaForm = ({ onSave, onCancel }) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: '',
    deadline: '',
    color: '#3F60E5',
    participants: []
  });
  
  
  const predefinedColors = [
    '#3F60E5', 
    '#FF5733', 
    '#4CAF50', 
    '#9C27B0', 
    '#FF9800', 
    '#E91E63', 
    '#607D8B', 
    '#009688', 
  ];
  
  const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const handleColorSelect = (color) => {
    setFormData(prevState => ({
      ...prevState,
      color
    }));
  };

  const handleParticipantChange = (e) => {
    const { name, value } = e.target;
    setNewParticipant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addParticipant = () => {
    
    if (!newParticipant.name.trim()) {
      showNotification("Se requiere al menos el nombre del participante", "error");
      return;
    }
    
    
    const participant = {
      ...newParticipant,
      tempId: Date.now().toString()
    };
    
    setFormData(prevState => ({
      ...prevState,
      participants: [...prevState.participants, participant]
    }));
    
    
    setNewParticipant({ name: '', email: '' });
  };

  const removeParticipant = (tempId) => {
    setFormData(prevState => ({
      ...prevState,
      participants: prevState.participants.filter(p => p.tempId !== tempId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    if (!formData.name || !formData.goal) {
      showNotification("El nombre y la meta son obligatorios", "error");
      return;
    }
    
    setLoading(true);
    
    try {
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        showNotification("Debes iniciar sesión para crear una vaca", "error");
        setLoading(false);
        return;
      }
      
      
      const vacaToSave = {
        name: formData.name,
        description: formData.description,
        goal: parseFloat(formData.goal),
        deadline: formData.deadline || null,
        color: formData.color,
        participants: formData.participants
      };
      
      console.log("Creando vaca con datos:", vacaToSave);
      
      
      const { data, error } = await createVaca(vacaToSave, user.id);
      
      if (error) {
        showNotification(`Error al crear la vaca: ${error}`, "error");
        setLoading(false);
        return;
      }
      
      showNotification("¡Vaca creada con éxito!", "success");
      onSave(data); 
    } catch (error) {
      console.error("Error al crear vaca:", error);
      showNotification("Error al crear la vaca", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-vaca-container">
      <div className="create-vaca-header">
        <button className="back-button" onClick={onCancel}>
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </button>
        <div className="vaca-title">
          <FontAwesomeIcon 
            icon={faCow} 
            style={{color: formData.color}} 
            className="vaca-title-icon" 
          />
          <h2>Crear Nueva Vaca</h2>
        </div>
      </div>
      
      <form className="create-vaca-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nombre de la Vaca *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Viaje a la playa"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe el propósito de esta vaca"
            rows={3}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="goal">Meta (€) *</label>
          <div className="input-with-icon">
            <span className="currency-symbol">€</span>
            <input
              type="number"
              id="goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              placeholder="Ej: 1000"
              min="1"
              step="0.01"
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
        
        <div className="form-group">
          <label>Color de la Vaca</label>
          <div className="color-selector">
            {predefinedColors.map(color => (
              <div 
                key={color} 
                className={`color-option ${formData.color === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
              >
                {formData.color === color && (
                  <FontAwesomeIcon icon={faCow} className="color-icon" />
                )}
              </div>
            ))}
            <div className="custom-color-picker">
              <input
                type="color"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="color-input"
              />
              <label htmlFor="color" className="custom-color-label">
                Personalizado
              </label>
            </div>
          </div>
        </div>
        
        <div className="participants-section">
          <h3>
            <FontAwesomeIcon icon={faPlus} /> Añadir Participantes
          </h3>
          
          <div className="add-participant-form">
            <div className="form-group">
              <label htmlFor="participantName">Nombre</label>
              <input
                type="text"
                id="participantName"
                name="name"
                value={newParticipant.name}
                onChange={handleParticipantChange}
                placeholder="Nombre del participante"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="participantEmail">Email (opcional)</label>
              <input
                type="email"
                id="participantEmail"
                name="email"
                value={newParticipant.email}
                onChange={handleParticipantChange}
                placeholder="email@ejemplo.com"
              />
            </div>
            
            <button 
              type="button" 
              className="add-participant-btn"
              onClick={addParticipant}
            >
              <FontAwesomeIcon icon={faPlus} /> Añadir
            </button>
          </div>
          
          {formData.participants.length > 0 && (
            <div className="participants-list">
              <h4>Participantes ({formData.participants.length})</h4>
              <ul>
                {formData.participants.map(participant => (
                  <li key={participant.tempId}>
                    <div className="participant-info">
                      <span className="participant-name">{participant.name}</span>
                      {participant.email && (
                        <span className="participant-email">{participant.email}</span>
                      )}
                    </div>
                    <button 
                      type="button"
                      className="remove-participant-btn"
                      onClick={() => removeParticipant(participant.tempId)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="form-preview">
          <div className="preview-header">
            <h4>Vista Previa</h4>
          </div>
          <div className="vaca-card-preview">
            <div className="vaca-card-header" style={{ backgroundColor: formData.color }}>
              <FontAwesomeIcon icon={faCow} className="vaca-card-icon" />
              <h3>{formData.name || 'Nombre de la Vaca'}</h3>
            </div>
            <div className="vaca-card-content">
              <p className="vaca-goal">Meta: {formData.goal ? `${parseFloat(formData.goal).toLocaleString()}€` : '0€'}</p>
              <p className="vaca-current">Actual: 0€</p>
              <div className="vaca-progress">
                <div 
                  className="vaca-progress-bar" 
                  style={{ width: '0%', backgroundColor: formData.color }}
                ></div>
              </div>
              <p className="vaca-members">{formData.participants.length + 1} participantes</p>
            </div>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? "Creando..." : (
              <>
                <FontAwesomeIcon icon={faCow} /> Crear Vaca
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateVacaForm;