import React, { useState, useEffect, useContext } from 'react';
import { inviteParticipants } from '../../../../Services/vacaService.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faSpinner, faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import UserSearch from './UserSearch';
import './InviteUsers.css';
import { NotificationContext } from '../../../../Components/Notification/NotificationContext';

const InviteUsers = ({ vacaId, userId, onInvitationComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [existingParticipants, setExistingParticipants] = useState([]);
  const [invitationCount, setInvitationCount] = useState(0);
  const { showNotification, captureError } = useContext(NotificationContext);

  // Si necesitas cargar participantes existentes para excluirlos de la búsqueda
  // useEffect(() => {
  //   const loadExistingParticipants = async () => {
  //     // Implementar lógica para cargar los participantes existentes
  //   };
  //   
  //   if (vacaId) {
  //     loadExistingParticipants();
  //   }
  // }, [vacaId]);

  const handleInviteUsers = async (selectedUsers) => {
    if (!selectedUsers || selectedUsers.length === 0) {
      showNotification('Selecciona al menos un usuario para invitar', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const userIds = selectedUsers.map(user => user.id);
      const { data, error } = await inviteParticipants(vacaId, userIds, userId);

      if (error) {
        setError(error);
        showNotification(error, 'error');
      } else {
        setSuccess(true);
        setInvitationCount(data?.sent || selectedUsers.length);
        
        if (onInvitationComplete) {
          onInvitationComplete(data);
        }
      }
    } catch (err) {
      setError('Error al enviar invitaciones');
      captureError(err); // Usa el captureError existente que maneja diferentes tipos de error
    } finally {
      setLoading(false);
    }
  };

  // Función para limpiar los mensajes de éxito/error después de un tiempo
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setError(null);
      }, 5000); // 5 segundos
      
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="invite-users-container">
      <div className="invite-users-header">
        <h2>
          <FontAwesomeIcon icon={faUserPlus} /> Invitar Participantes
        </h2>
        <p className="invite-description">
          Busca y selecciona usuarios para invitarlos a participar en esta vaca
        </p>
      </div>
      
      {error && (
        <div className="alert error-alert">
          <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
        </div>
      )}
      
      {success && (
        <div className="alert success-alert">
          <FontAwesomeIcon icon={faCheck} /> 
          {invitationCount === 1 
            ? 'Invitación enviada correctamente!' 
            : `${invitationCount} invitaciones enviadas correctamente!`}
        </div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <FontAwesomeIcon icon={faSpinner} spin /> 
          <span>Enviando invitaciones...</span>
        </div>
      ) : (
        <UserSearch 
          onUserSelect={handleInviteUsers}
          excludeUsers={existingParticipants}
        />
      )}
    </div>
  );
};

export default InviteUsers;
