import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import './Notification.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faInfoCircle, faExclamationTriangle, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const Notification = ({ message, type, persistent = false, onClose }) => {
  
  useEffect(() => {
    if (persistent && onClose) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [persistent, onClose]);

  
  const getIcon = () => {
    switch(type) {
      case 'success':
        return faCheckCircle;
      case 'error':
        return faExclamationTriangle;
      case 'info':
        return faInfoCircle;
      default:
        return faInfoCircle;
    }
  };

  return (
    <div 
      className={`notification ${type}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="notification-content">
        <FontAwesomeIcon icon={getIcon()} className="notification-icon" />
        <p>{message}</p>
      </div>
      
      {(persistent || onClose) && (
        <button 
          onClick={onClose} 
          className="notification-close"
          aria-label="Cerrar notificación"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  );
};

Notification.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'info']).isRequired,
  persistent: PropTypes.bool,
  onClose: PropTypes.func,
};

export default React.memo(Notification);