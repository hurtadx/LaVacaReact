import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faUserCheck, 
  faUserClock, 
  faCoins, 
  faCalendarAlt,
  faTrash,
  faEdit,
  faEye,
  faChevronDown,
  faChevronUp,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import './ParticipantCard.css';

const ParticipantCard = ({ 
  participant, 
  stats = {}, 
  vacaColor = '#3F60E5', 
  isAdmin = false, 
  currentUserId,
  onRemove,
  onViewDetails,
  onInviteUsers
}) => {
  const [showStats, setShowStats] = useState(false);
  
  const isCurrentUser = participant.user_id === currentUserId;
  const isRegisteredUser = !!participant.user_id;
  

  const joinDate = participant.created_at || participant.joinDate;
  const lastActivity = stats.lastActivity || participant.last_activity;
  const totalContributions = stats.totalContributions || 0;
  const totalTransactions = stats.transactionCount || 0;
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className={`participant-card ${isCurrentUser ? 'current-user' : ''}`}>
      <div className="participant-header">
        <div 
          className="participant-avatar"
          style={{ backgroundColor: vacaColor }}
          data-registered={isRegisteredUser}
        >
          {getInitials(participant.name)}
        </div>
        <div className="participant-info">
          <h4 className="participant-name">
            {participant.name}
            {isCurrentUser && <span className="you-badge">Tú</span>}
          </h4>
          {participant.email && (
            <p className="participant-email">{participant.email}</p>
          )}
          <div className="participant-status">
            {isRegisteredUser ? (
              <span className="status-active">
                <FontAwesomeIcon icon={faUserCheck} />
                Usuario registrado
              </span>
            ) : (
              <span className="status-pending">
                <FontAwesomeIcon icon={faUserClock} />
                Invitación pendiente
              </span>
            )}
          </div>
        </div>        {isAdmin && !isCurrentUser && (
          <div className="participant-actions">
            <button
              className="action-btn invite-btn"
              onClick={() => onInviteUsers && onInviteUsers()}
              title="Invitar más usuarios"
            >
              <FontAwesomeIcon icon={faUserPlus} />
            </button>
            <button
              className="action-btn view-btn"
              onClick={() => onViewDetails && onViewDetails(participant)}
              title="Ver detalles"
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
            <button
              className="action-btn remove-btn"
              onClick={() => onRemove && onRemove(participant.id)}
              title="Eliminar participante"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        )}
      </div>

      <div className="participant-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faCoins} />
            </div>
            <div className="stat-content">
              <span className="stat-value">${totalContributions.toLocaleString()}</span>
              <span className="stat-label">Contribuido</span>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon">
              <FontAwesomeIcon icon={faCalendarAlt} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{totalTransactions}</span>
              <span className="stat-label">Transacciones</span>
            </div>
          </div>
        </div>

        <div className="participant-dates">
          <div className="date-info">
            <span className="date-label">Se unió:</span>
            <span className="date-value">{formatDate(joinDate)}</span>
          </div>
          {lastActivity && (
            <div className="date-info">
              <span className="date-label">Última actividad:</span>
              <span className="date-value">{formatDate(lastActivity)}</span>
            </div>
          )}
        </div>
      </div>

      {showStats && (
        <div className="expanded-stats">
          <div className="stats-row">
            <span>Balance:</span>
            <span>${(stats.balance || 0).toLocaleString()}</span>
          </div>
          <div className="stats-row">
            <span>Promedio por transacción:</span>
            <span>${(totalTransactions > 0 ? totalContributions / totalTransactions : 0).toFixed(2)}</span>
          </div>
          <div className="stats-row">
            <span>Estado:</span>
            <span className={`status-badge ${isRegisteredUser ? 'active' : 'pending'}`}>
              {isRegisteredUser ? 'Activo' : 'Pendiente'}
            </span>
          </div>
        </div>
      )}

      <button 
        className="toggle-stats-btn"
        onClick={() => setShowStats(!showStats)}
      >
        {showStats ? 'Menos detalles' : 'Más detalles'}
      </button>
    </div>
  );
};

export default ParticipantCard;
