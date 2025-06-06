import React, { useContext } from 'react';
import { respondToInvitation } from '../../../Services';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import './InvitationsList.css';
import { NotificationContext } from '../../../components/Notification/NotificationContext';

const InvitationsList = ({ invitations = [], onInvitationResponse }) => {
  const { showNotification, captureError } = useContext(NotificationContext);

  const handleResponse = async (invitationId, userId, response) => {
    try {
      const { success, error, data } = await respondToInvitation(invitationId, userId, response);
      
      if (success && onInvitationResponse) {
      
        onInvitationResponse(invitationId, response, data?.vaca_id);
        
   
        if (response === 'accept') {
          showNotification('Has aceptado la invitación', 'success');
        } else {
          showNotification('Has rechazado la invitación', 'info');
        }
      } else {
        captureError(error || 'Error al procesar tu respuesta');
      }
    } catch (err) {
      captureError(err);
    }
  };

  if (invitations.length === 0) {
    return <p className="no-invitations">No tienes invitaciones pendientes</p>;
  }

  return (
    <div className="invitations-list">
      {invitations.map(invitation => (
        <div key={invitation.id} className="invitation-item">
          <div className="invitation-content">
            <div className="invitation-header">
              <span className="invitation-sender">{invitation.sender?.username || 'Usuario'}</span>
              <span className="invitation-date">
                {new Date(invitation.createdAt || invitation.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="invitation-message">
              Te ha invitado a unirte a <strong>{invitation.vaca?.name || 'una vaca'}</strong>
            </p>
            <p className="invitation-description">
              {invitation.vaca?.description || 'Sin descripción'}
            </p>
          </div>
          <div className="invitation-actions">
            <button 
              className="accept-btn"
              onClick={() => handleResponse(invitation.id, invitation.user_id, 'accept')}
              aria-label="Aceptar invitación"
            >
              <FontAwesomeIcon icon={faCheckCircle} /> Aceptar
            </button>
            <button 
              className="reject-btn"
              onClick={() => handleResponse(invitation.id, invitation.user_id, 'reject')}
              aria-label="Rechazar invitación"
            >
              <FontAwesomeIcon icon={faTimesCircle} /> Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvitationsList;