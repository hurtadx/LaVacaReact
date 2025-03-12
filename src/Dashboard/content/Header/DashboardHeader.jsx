import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../../Services/authService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import InvitationsList from './InvitationsList'; // Descomenta esta línea
import './DashboardHeader.css';
import logo from '../../../Components/Img/LogoLaVaca.png';

const DashboardHeader = ({ 
  user, 
  pendingInvitations = [], 
  hasUnreadNotifications = false,
  onNotificationsOpen,
  onInvitationResponse
}) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  
  const displayName = user?.displayName || 
                     user?.user_metadata?.username || 
                     (user?.email ? user.email.split('@')[0] : "Usuario");
  
  const handleLogout = async () => {
    const { error } = await logoutUser();
    if (!error) {
      navigate('/login');
    }
  };
  
  const toggleNotifications = () => {
    const newState = !showNotifications;
    setShowNotifications(newState);
    
    if (newState && hasUnreadNotifications && onNotificationsOpen) {
      onNotificationsOpen();
    }
  };
  
  const handleInvitationResponse = (invitationId, response, vacaId) => {
    // Llamamos a la función proporcionada por el padre
    if (onInvitationResponse) {
      onInvitationResponse(invitationId, response, vacaId);
    }
    
    // Opcionalmente, podrías cerrar el panel de notificaciones después de responder
    // setShowNotifications(false);
  };
  
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="dash-title">
          <img src={logo} alt="LaVaca Banking Logo" />
          <h1>LaVaca</h1>
        </div>
      </div>
      
      <div className="header-right">
        <div className={`notifications-container ${hasUnreadNotifications ? 'has-notifications' : ''}`}>
          <button 
            className="notifications-btn"
            onClick={toggleNotifications}
            aria-label="Notificaciones"
          >
            <FontAwesomeIcon icon={faBell} />
            
            {hasUnreadNotifications && (
              <span className="notification-badge">{pendingInvitations.length}</span>
            )}
          </button>
          
          {showNotifications && (
            <div className="notifications-panel">
              <h3>Notificaciones</h3>
              <InvitationsList 
                invitations={pendingInvitations}
                onInvitationResponse={handleInvitationResponse}
              />
            </div>
          )}
        </div>
        
        <div className="user-info">
          {displayName}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;