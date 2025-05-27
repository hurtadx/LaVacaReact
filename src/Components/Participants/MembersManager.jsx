import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserFriends, faUserPlus, faEnvelope, faBan, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { getVacaMembers, inviteMember, removeParticipant } from '../../Services/participantsService';
import { formatCurrency } from '../../Utils/formatters';
import './MembersManager.css';

const MembersManager = ({ vacaId, isAdmin, currentUserId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [exitAmount, setExitAmount] = useState(0);
  
  useEffect(() => {
    loadMembers();
  }, [vacaId]);
  
  const loadMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await getVacaMembers(vacaId);
      if (error) throw error;
      
      setMembers(data || []);
    } catch (err) {
      setError("Error cargando miembros: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInvite = async (e) => {
    e.preventDefault();
    setSendingInvite(true);
    
    try {
      const { error } = await inviteMember(vacaId, inviteEmail, inviteMessage);
      if (error) throw error;
      
      setInviteEmail('');
      setInviteMessage('');
      setShowInviteForm(false);
      // Mostrar notificación de éxito
    } catch (err) {
      setError("Error enviando invitación: " + err.message);
    } finally {
      setSendingInvite(false);
    }
  };
  
  const handleRemoveMember = async (memberId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar a este miembro?")) return;
    
    try {
      const { error } = await removeParticipant(vacaId, memberId);
      if (error) throw error;
      
      loadMembers();
    } catch (err) {
      setError("Error eliminando miembro: " + err.message);
    }
  };
  
  const handleExitRequest = async () => {
    try {
      // Calcular monto de salida
      const response = await calculateExitAmount(vacaId, currentUserId);
      setExitAmount(response.amount);
      setShowExitConfirmation(true);
    } catch (err) {
      setError("Error calculando monto de salida: " + err.message);
    }
  };
  
  const confirmExit = async () => {
    try {
      const { error } = await exitVaca(vacaId, currentUserId);
      if (error) throw error;
      
      // Redirigir al usuario a la pantalla principal o mostrar mensaje
    } catch (err) {
      setError("Error al salir de la vaca: " + err.message);
    }
  };
  
  if (loading && members.length === 0) return <div className="loading">Cargando miembros...</div>;
  if (error) return <div className="error-message">{error}</div>;
  
  return (
    <div className="members-manager">
      <div className="members-header">
        <h3><FontAwesomeIcon icon={faUserFriends} /> Participantes</h3>
        
        <div className="header-actions">
          {isAdmin && (
            <button 
              className="invite-btn"
              onClick={() => setShowInviteForm(!showInviteForm)}
            >
              <FontAwesomeIcon icon={faUserPlus} />
              {showInviteForm ? 'Cancelar' : 'Invitar'}
            </button>
          )}
          
          <button 
            className="exit-btn"
            onClick={handleExitRequest}
          >
            <FontAwesomeIcon icon={faBan} /> Salir de la Vaca
          </button>
        </div>
      </div>
      
      {showInviteForm && (
        <div className="invite-form">
          <form onSubmit={handleInvite}>
            <div className="form-group">
              <label htmlFor="inviteEmail">Email del invitado</label>
              <input
                type="email"
                id="inviteEmail"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                placeholder="ejemplo@correo.com"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="inviteMessage">Mensaje (opcional)</label>
              <textarea
                id="inviteMessage"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                placeholder="Escribe un mensaje personalizado para el invitado..."
                rows="2"
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              className="send-invite-btn"
              disabled={sendingInvite || !inviteEmail}
            >
              <FontAwesomeIcon icon={faEnvelope} />
              {sendingInvite ? 'Enviando...' : 'Enviar Invitación'}
            </button>
          </form>
        </div>
      )}
      
      {showExitConfirmation && (
        <div className="exit-confirmation">
          <div className="confirmation-content">
            <h4>Confirmar Salida</h4>
            
            <p>Al salir de esta vaca, podrás retirar el siguiente monto:</p>
            <div className="exit-amount">{formatCurrency(exitAmount)}</div>
            
            <p className="calculation-note">
              Este monto se calcula como: Tu aporte personal menos la parte proporcional 
              de los gastos ya realizados.
            </p>
            
            <div className="confirmation-actions">
              <button 
                className="cancel-btn"
                onClick={() => setShowExitConfirmation(false)}
              >
                Cancelar
              </button>
              <button 
                className="confirm-btn"
                onClick={confirmExit}
              >
                Confirmar Salida
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="members-list">
        {members.map(member => (
          <div key={member.id} className={`member-card ${member.status}`}>
            <div className="member-avatar">
              {member.avatar ? (
                <img src={member.avatar} alt={member.username} />
              ) : (
                <div className="avatar-placeholder">
                  {member.username?.charAt(0).toUpperCase() || '?'}
                </div>
              )}
              <div className={`status-indicator ${member.status}`}></div>
            </div>
            
            <div className="member-info">
              <h4 className="username">
                {member.username}
                {member.id === currentUserId && <span className="current-user-tag">(Tú)</span>}
              </h4>
              
              <div className="contribution">
                <span className="label">Aporte:</span>
                <span className="value">{formatCurrency(member.contribution)} ({member.percentage}%)</span>
              </div>
              
              {member.status === 'pending' && (
                <div className="pending-warning">
                  <FontAwesomeIcon icon={faExclamationTriangle} />
                  <span>Tiene aportes pendientes</span>
                </div>
              )}
              
              <div className="member-since">
                Miembro desde: {new Date(member.joinDate).toLocaleDateString()}
              </div>
            </div>
            
            {isAdmin && member.id !== currentUserId && (
              <div className="member-actions">
                <button 
                  className="remove-btn"
                  onClick={() => handleRemoveMember(member.id)}
                >
                  <FontAwesomeIcon icon={faBan} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersManager;