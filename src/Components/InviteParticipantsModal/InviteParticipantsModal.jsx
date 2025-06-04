import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faSearch, 
  faSpinner, 
  faUser, 
  faEnvelope, 
  faCheckCircle,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { searchUsers, getCurrentUser } from '../../Services';
import { inviteParticipants } from '../../Services/vacaService';
import { useNotification } from '../Notification/NotificationContext';
import './InviteParticipantsModal.css';

const InviteParticipantsModal = ({ isOpen, onClose, vacaId, onInviteSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  const { showNotification, captureError } = useNotification();

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
      
      // Filtrar usuarios ya seleccionados
      const filteredResults = data.filter(
        user => !selectedParticipants.some(p => p.id === user.id)
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
    
    setSelectedParticipants(prev => [...prev, participant]);

    // Limpiar búsqueda después de seleccionar
    setSearchResults([]);
    setSearchTerm('');
  };

  const removeParticipant = (tempId) => {
    setSelectedParticipants(prev => prev.filter(p => p.tempId !== tempId));
  };
  const handleInvite = async () => {
    if (selectedParticipants.length === 0) {
      showNotification("Selecciona al menos un participante para invitar", "error");
      return;
    }
    
    setInviteLoading(true);
    
    try {
      // Obtener el usuario actual para enviarlo como senderId
      const { user: currentUser, error: userError } = await getCurrentUser();
      
      if (!currentUser || userError) {
        showNotification("Error: No se pudo obtener información del usuario actual", "error");
        return;
      }
      
      // Extraer solo los IDs de los usuarios seleccionados
      const userIds = selectedParticipants.map(participant => participant.id);
      
      // Llamar a la función con los parámetros correctos: vacaId, userIds, senderId
      const { data, error } = await inviteParticipants(vacaId, userIds, currentUser.id);
      
      if (error) {
        showNotification(`Error al enviar invitaciones: ${error}`, "error");
        return;
      }
      
      const sentCount = data?.sent || selectedParticipants.length;
      showNotification(`¡${sentCount} invitación(es) enviada(s) con éxito!`, "success");
      
      // Resetear el modal
      setSelectedParticipants([]);
      setSearchResults([]);
      setSearchTerm('');
      setSearchError(null);
      
      // Callback para actualizar la lista de participantes en VacaDetails
      if (onInviteSuccess) {
        onInviteSuccess();
      }
      
      onClose();
    } catch (err) {
      showNotification("Error al enviar invitaciones", "error");
      captureError(err);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleClose = () => {
    // Resetear estado al cerrar
    setSelectedParticipants([]);
    setSearchResults([]);
    setSearchTerm('');
    setSearchError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content invite-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header del modal */}
        <div className="modal-header">
          <h2>
            <FontAwesomeIcon icon={faUserPlus} /> Invitar Participantes
          </h2>
          <button className="close-button" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="modal-body">
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
          
          {/* PARTICIPANTES SELECCIONADOS */}
          {selectedParticipants.length > 0 && (
            <div className="participants-list">
              <h4>Participantes seleccionados ({selectedParticipants.length})</h4>
              <ul>
                {selectedParticipants.map(participant => (
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

        {/* Footer del modal */}
        <div className="modal-footer">
          <button className="cancel-button" onClick={handleClose}>
            Cancelar
          </button>
          <button 
            className="invite-button" 
            onClick={handleInvite}
            disabled={selectedParticipants.length === 0 || inviteLoading}
          >
            {inviteLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Enviando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faUserPlus} /> 
                Invitar {selectedParticipants.length > 0 ? `(${selectedParticipants.length})` : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteParticipantsModal;
