import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { getVoteRequest, submitVote } from '../../Services/votingService';
import { formatCurrency } from '../../Utils/formatters';
import './VoteRequest.css';

const VoteRequest = ({ requestId, userId }) => {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vote, setVote] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    loadRequest();
  }, [requestId]);
  
  useEffect(() => {
    if (request?.deadline) {
      const interval = setInterval(() => {
        const now = new Date();
        const deadline = new Date(request.deadline);
        const diff = deadline - now;
        
        if (diff <= 0) {
          clearInterval(interval);
          setTimeLeft('Votación cerrada');
          return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [request]);
  
  const loadRequest = async () => {
    try {
      const { data, error } = await getVoteRequest(requestId);
      if (error) throw error;
      
      setRequest(data);
      // Si el usuario ya votó, mostrar su voto
      const userVote = data.votes.find(v => v.userId === userId);
      if (userVote) {
        setVote(userVote.vote);
        if (userVote.vote === 'reject' && userVote.reason) {
          setRejectReason(userVote.reason);
        }
      }
    } catch (err) {
      setError("Error cargando solicitud: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleVote = async (voteType) => {
    try {
      setLoading(true);
      
      const voteData = {
        requestId,
        userId,
        vote: voteType,
        reason: voteType === 'reject' ? rejectReason : null
      };
      
      const { error } = await submitVote(voteData);
      if (error) throw error;
      
      setVote(voteType);
      loadRequest(); // Recargar para ver resultados actualizados
    } catch (err) {
      setError("Error al votar: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !request) return <div className="loading">Cargando solicitud...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!request) return <div className="error-message">No se encontró la solicitud</div>;
  
  const { title, amount, description, requester, currentVotes, requiredVotes, userContribution, deadline, status } = request;
  const isActive = status === 'active';
  const isHighContribution = userContribution && userContribution.percentage > 70;
  
  return (
    <div className={`vote-request ${status}`}>
      <div className="request-header">
        <h3>{title}</h3>
        <div className="status-badge">{status === 'active' ? 'En votación' : status === 'approved' ? 'Aprobado' : 'Rechazado'}</div>
      </div>
      
      <div className="request-details">
        <div className="amount-display">
          <span className="label">Monto solicitado:</span>
          <span className="value">{formatCurrency(amount)}</span>
        </div>
        
        <div className="requester">
          <span className="label">Solicitado por:</span>
          <span className="value">{requester.username}</span>
        </div>
        
        <div className="description">
          <p>{description}</p>
        </div>
        
        {userContribution && (
          <div className={`user-contribution ${isHighContribution ? 'high-contribution' : ''}`}>
            <span className="label">Tu aporte:</span>
            <span className="value">{formatCurrency(userContribution.amount)} ({userContribution.percentage}%)</span>
            
            {isHighContribution && (
              <div className="special-notice">
                <FontAwesomeIcon icon={faInfoCircle} />
                <span>Esta solicitud requiere un aporte significativo de tu parte (70%). Tienes poder de veto.</span>
              </div>
            )}
          </div>
        )}
        
        <div className="voting-progress">
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${(currentVotes / requiredVotes) * 100}%` }}
            ></div>
          </div>
          <div className="vote-counts">
            <span>{currentVotes} de {requiredVotes} votos necesarios</span>
          </div>
          <div className="time-remaining">
            <span className="label">Tiempo restante:</span>
            <span className="value">{timeLeft}</span>
          </div>
        </div>
      </div>
      
      {isActive && !vote ? (
        <div className="voting-actions">
          <button 
            className="approve-btn"
            onClick={() => handleVote('approve')}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faCheckCircle} /> Aprobar
          </button>
          
          <button 
            className="reject-btn"
            onClick={() => setVote('reject')}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTimesCircle} /> Rechazar
          </button>
        </div>
      ) : vote === 'reject' && !rejectReason ? (
        <div className="rejection-reason">
          <textarea
            placeholder="¿Por qué rechazas esta solicitud? (opcional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows="2"
          ></textarea>
          <div className="reason-actions">
            <button 
              className="back-btn"
              onClick={() => setVote(null)}
            >
              Volver
            </button>
            <button 
              className="confirm-btn"
              onClick={() => handleVote('reject')}
            >
              Confirmar rechazo
            </button>
          </div>
        </div>
      ) : (
        <div className="user-vote">
          <span className="label">Tu voto:</span>
          <span className={`vote-value ${vote}`}>
            {vote === 'approve' ? 'Aprobado' : 
             vote === 'reject' ? 'Rechazado' : 
             vote === 'abstain' ? 'Abstención' : 
             'No has votado'}
          </span>
          
          {vote === 'reject' && rejectReason && (
            <div className="rejection-reason-display">
              <span className="label">Razón:</span>
              <p>{rejectReason}</p>
            </div>
          )}
        </div>
      )}
      
      {request.votes && request.votes.length > 0 && (
        <div className="all-votes">
          <h4>Votos ({request.votes.length})</h4>
          <ul className="votes-list">
            {request.votes.map(v => (
              <li key={v.userId} className={`vote-item ${v.vote}`}>
                <span className="voter">{v.username}</span>
                <span className="vote-type">
                  {v.vote === 'approve' ? 'Aprobó' : 
                   v.vote === 'reject' ? 'Rechazó' : 'Se abstuvo'}
                </span>
                {v.vote === 'reject' && v.reason && (
                  <p className="vote-reason">{v.reason}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VoteRequest;