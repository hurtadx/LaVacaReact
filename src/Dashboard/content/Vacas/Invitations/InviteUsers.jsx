import React, { useState, useEffect, useContext, useRef } from 'react';
import { inviteParticipants } from '../../../../Services/vacaService.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserPlus, 
  faSpinner, 
  faCheck, 
  faExclamationTriangle,
  faUsers,
  faTimes,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import UserSearch from './UserSearch';
import './InviteUsers.css';
import { NotificationContext } from '../../../../Components/Notification/NotificationContext';

const InviteUsers = ({ vacaId, userId, onInvitationComplete, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [existingParticipants, setExistingParticipants] = useState([]);
  const [invitationCount, setInvitationCount] = useState(0);
  const { showNotification, captureError } = useContext(NotificationContext);
  const modalRef = useRef(null);

 
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

 
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

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
        
        if (data?.sent > 0) {
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      }
    } catch (err) {
      setError('Error al enviar invitaciones');
      captureError(err);
    } finally {
      setLoading(false);
    }
  };


  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="invite-users-modal" onClick={handleModalClick} ref={modalRef}>
        <button className="modal-close-btn" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <div className="invite-users-header">
          <h2>
            <FontAwesomeIcon icon={faUserPlus} />
            Invitar Participantes
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
            <div className="loading-spinner">
              <FontAwesomeIcon icon={faSpinner} spin />
            </div>
            <span>Enviando invitaciones...</span>
          </div>
        ) : (
          <UserSearch 
            onUserSelect={handleInviteUsers}
            excludeUsers={existingParticipants}
          />
        )}
      </div>
    </div>
  );
};

export default InviteUsers;
