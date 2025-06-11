import React, { useState, useRef, useContext } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faPlus, 
  faTrash, 
  faCow, 
  faSearch,
  faUser,
  faCheckCircle,
  faTimes,
  faSpinner,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import { createVaca, searchUsers, getCurrentUser, inviteParticipants } from "../../../Services";
import { useNotification } from "../../../components/Notification/NotificationContext";
import { NotificationContext } from "../../../components/Notification/NotificationContext";
import './CreateVacaForm.css';

const CreateVacaForm = ({ onSave, onCancel }) => {
  const { showNotification } = useNotification();
  const { captureError } = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal: '',
    deadline: '',
    color: '#3F60E5',
    participants: []
  });
  
  const colorInputRef = useRef(null);

  const handleColorIconClick = () => {
    if (colorInputRef.current) {
      colorInputRef.current.click();
    }
  };

  const [newParticipant, setNewParticipant] = useState({
    name: '',
    email: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'goal') {
      const numericValue = value.replace(/[^\d.]/g, '');
      let newValue = numericValue === '' ? '' : numericValue;
      
      setFormData(prevState => ({
        ...prevState,
        [name]: newValue
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handleParticipantChange = (e) => {
    const { name, value } = e.target;
    setNewParticipant(prev => ({
      ...prev,
      [name]: value
    }));
  };

  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (searchTerm.trim().length < 3) {
      setSearchError("Ingresa al menos 3 caracteres para buscar");
      return;
    }
    
    setSearchLoading(true);
    setSearchError(null);
    
    try {
      const { data, error } = await searchUsers(searchTerm);
      
      if (error) {
        setSearchError(error);
        return;
      }
      
    
      const filteredResults = data.filter(
        user => !formData.participants.some(p => p.id === user.id)
      );
      
      setSearchResults(filteredResults);
      
      if (filteredResults.length === 0) {
        setSearchError("No se encontraron usuarios con ese criterio");
      }
    } catch (err) {
      setSearchError("Error al buscar usuarios");
      captureError(err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Función para seleccionar un usuario de los resultados de búsqueda
  const selectUser = (user) => {
    const participant = {
      id: user.id,
      name: user.username || user.email.split('@')[0],
      email: user.email,
      tempId: Date.now().toString(),
      isUser: true
    };
    
    setFormData(prev => ({
      ...prev,
      participants: [...prev.participants, participant]
    }));

   
    setSearchResults([]);
    setSearchTerm('');
  };

  const addParticipant = () => {
    if (!newParticipant.name.trim()) {
      showNotification("Se requiere al menos el nombre del participante", "error");
      return;
    }
    
    const participant = {
      ...newParticipant,
      tempId: Date.now().toString(),
      isUser: false
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
    }    setLoading(true);
      try {      const { user: currentUser, error: authError } = await getCurrentUser();
      
      if (!currentUser || authError) {
        showNotification("Debes iniciar sesión para crear una vaca", "error");
        setLoading(false);
        return;
      }
      
      console.log("Current user data:", currentUser);
      console.log("Current user ID:", currentUser.id);
      
      const vacaToSave = {
        name: formData.name,
        description: formData.description,
        goal: parseFloat(formData.goal),
        deadline: formData.deadline || null,
        color: formData.color
      
      };
      
      console.log("Creando vaca con datos:", vacaToSave);
      console.log("Enviando user_id:", currentUser.id);
      
      const { data, error } = await createVaca(
        vacaToSave,
        currentUser.id,
        currentUser.displayName || currentUser.username,
        currentUser.email
      );
      // Invitar participantes si hay
      const participantsToInvite = formData.participants.filter(p => p.id && p.id !== currentUser.id);
      if (data && participantsToInvite.length > 0) {
        const userIds = participantsToInvite.map(p => p.id);
        try {
          const { error: inviteError } = await inviteParticipants(data.id, userIds, currentUser.id);
          if (!inviteError) {
            showNotification(`${userIds.length} invitaciones enviadas con éxito`, 'success');
          } else {
            showNotification(inviteError || 'Error al enviar invitaciones', 'error');
          }
        } catch (err) {
          showNotification('Error al invitar participantes', 'error');
        }
      }
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

      
      <form className="create-vaca-form" onSubmit={handleSubmit}>
        <div className="form-section centered">
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
        </div>
        
        {/* Meta y fecha límite en una sola fila */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="goal">Meta ($) *</label>
            <div className="input-with-icon">
              <span className="currency-symbol">$</span>
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
        </div>
        
        {/* Color picker */}
        <div className="form-group">
          <label>Color de la Vaca</label>
          <div className="color-picker-container">
            <div className="color-picker-icon-wrapper" onClick={handleColorIconClick}>
              <FontAwesomeIcon 
                icon={faCow} 
                style={{color: formData.color}} 
                className="color-picker-icon" 
              />
              <span className="color-picker-text">Haz clic para cambiar el color</span>
            </div>
            <input
              ref={colorInputRef}
              type="color"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="color-input-hidden"
            />
          </div>
        </div>
        
        {/* SECCIÓN DE PARTICIPANTES MODIFICADA */}
        <div className="participants-section">
          <h3>
            <FontAwesomeIcon icon={faPlus} /> Invitar Participantes
          </h3>
          
          {/* BUSCAR USUARIOS EXISTENTES */}
          <div className="search-form">
            <div className="search-input-wrapper">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar usuario por nombre o email..."
                className="search-input"
              />
              <button
                type="button"
                className="search-btn"
                onClick={handleSearch}
                disabled={searchLoading}
              >
                <FontAwesomeIcon icon={searchLoading ? faSpinner : faSearch} spin={searchLoading} />
              </button>
            </div>
            
            {searchError && <div className="error-message">{searchError}</div>}
          </div>

          {/* RESULTADOS DE BÚSQUEDA */}
          {searchResults.length > 0 && (
            <div className="search-results-container">
              <h3 className="search-results-title">
                Resultados ({searchResults.length})
              </h3>
              
              <div className="search-results">
                {searchResults.map(user => (
                  <div 
                    key={user.id} 
                    className="user-item"
                    onClick={() => selectUser(user)}
                  >
                    <div className="user-avatar">
                      {user.username?.charAt(0).toUpperCase() || <FontAwesomeIcon icon={faUser} />}
                    </div>
                    <div className="user-info">
                      <h4 className="user-username">{user.username || "Usuario"}</h4>
                      <p className="user-email">{user.email}</p>
                    </div>
                    <div className="user-select-indicator">
                      <div className="select-circle"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          
          {formData.participants.length > 0 && (
            <div className="participants-list">
              <h4>Participantes ({formData.participants.length})</h4>
              <ul>
                {formData.participants.map(participant => (
                  <li key={participant.tempId}>
                    <div className="participant-info">
                      <div 
                        className="participant-avatar" 
                        style={{backgroundColor: participant.isUser ? '#3F60E5' : '#34D399'}}
                        data-registered={participant.isUser}
                      >
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="participant-details">
                        <span className="participant-name">{participant.name}</span>
                        {participant.email && (
                          <span className="participant-email">
                            <FontAwesomeIcon icon={faEnvelope} size="xs" />
                            {participant.email}
                          </span>
                        )}
                        {participant.isUser && (
                          <span className="participant-badge">
                            <FontAwesomeIcon icon={faCheckCircle} size="xs" />
                            Usuario registrado
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      type="button"
                      className="remove-participant-btn"
                      onClick={() => removeParticipant(participant.tempId)}
                      title="Eliminar participante"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        
        <div className="form-preview">
          {/* ... */}
          <div className="preview-header">
            <h4>Vista Previa</h4>
          </div>
          <div className="vaca-card-preview">
            <div className="vaca-card-header" style={{ backgroundColor: formData.color }}>
              <FontAwesomeIcon icon={faCow} className="vaca-card-icon" />
              <h3>{formData.name || 'Nombre de la Vaca'}</h3>
            </div>
            <div className="vaca-card-content">
              <p className="vaca-goal">
                Meta: {formData.goal ? `$${parseFloat(formData.goal).toLocaleString('es')}` : '$0'}
              </p>
              <p className="vaca-current">Actual: $0</p>
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