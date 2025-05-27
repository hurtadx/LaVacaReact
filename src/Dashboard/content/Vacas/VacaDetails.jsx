import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import './VacaDetails.css';
import '../../../Dashboard/Resposive/vacadetails-responsive.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faUsers, 
  faCalendarAlt, 
  faMoneyBillWave,
  faPlus,
  faPiggyBank,
  faCow,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import InviteUsers from './Invitations/InviteUsers';
import { NotificationContext } from '../../../Components/Notification/NotificationContext';
import { 
  getVacaDetails, 
  addVacaTransaction,  inviteParticipants
} from '../../../Services/vacaService.jsx';
import { getCurrentUser } from '../../../Services/authService.jsx';
import TransactionForm from '../../../Components/Transactions/TransactionForm.jsx';
import TransactionsList from '../../../Components/Transactions/TransactionsList.jsx';

const VacaDetails = ({ match, user: passedUser, vaca: initialVaca, onBackClick }) => {
  const [vaca, setVaca] = useState(initialVaca || {});
  const [loading, setLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [user, setUser] = useState(passedUser || null);
  const { showNotification } = useContext(NotificationContext);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');
  const [showTransactionForm, setShowTransactionForm] = useState(false);    useEffect(() => {
    if (!passedUser) {
      const loadUser = async () => {
        try {
          const { user: currentUser, error } = await getCurrentUser();
          if (currentUser && !error) {
            setUser(currentUser);
          }
        } catch (error) {
          console.error("Error al cargar usuario:", error);
        }
      };
      
      loadUser();
    }
  }, [passedUser]);

  
  useEffect(() => {
    if (!initialVaca && match?.params?.id) {
      const loadVacaDetails = async () => {
        setLoading(true);
        try {
          const { data, error } = await getVacaDetails(match.params.id);
          if (error) {teExpen
            throw new Error(error);
          }
          if (data) {
            setVaca(data);
          }
        } catch (error) {
          console.error("Error al cargar detalles:", error);
          showNotification("Error al cargar los detalles de la vaca", "error");
        } finally {
          setLoading(false);
        }
      };
      
      loadVacaDetails();
    }
  }, [match?.params?.id, initialVaca, showNotification]);

  useEffect(() => {
    if (vaca && vaca.id) {
      try {
        
        const userPrefix = user?.id ? `user_${user.id}_` : '';
        localStorage.setItem(`${userPrefix}lastVisitedVaca`, JSON.stringify({
          id: vaca.id,
          name: vaca.name,
          current: vaca.current,
          goal: vaca.goal
        }));
        
        
        const storageEvent = new Event('storage');
        storageEvent.key = `${userPrefix}lastVisitedVaca`;
        window.dispatchEvent(storageEvent);
      } catch (error) {
        console.error("Error al guardar la última vaca visitada:", error);
      }
    }
  }, [vaca, user?.id]);

  useEffect(() => {
    if (vaca && vaca.id && user) {
      try {
        
        const userPrefix = user?.id ? `user_${user.id}_` : '';
        
        
        localStorage.setItem(`${userPrefix}lastVisitedVaca`, JSON.stringify({
          id: vaca.id,
          name: vaca.name,
          current: vaca.current,
          goal: vaca.goal
        }));
        
        console.log("Guardando última vaca visitada:", vaca.name);
        
        
        const event = new CustomEvent('vacaVisited', { 
          detail: { userId: user.id, vacaId: vaca.id }
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error("Error al guardar la última vaca visitada:", error);
      }
    }
  }, [vaca, user]);

  const progressPercent = vaca.current 
    ? Math.min((vaca.current / vaca.goal) * 100, 100) 
    : 0;

  const formattedDeadline = vaca.deadline 
    ? new Date(vaca.deadline).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }) 
    : 'Sin fecha límite';
    

  const calculateDaysLeft = () => {
    if (!vaca.deadline) return null;
    
    const today = new Date();
    const deadline = new Date(vaca.deadline);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };
  
  const daysLeft = calculateDaysLeft();

  // Reemplazar handleAddPayment por handleTransactionComplete
  const handleTransactionComplete = (transactionData) => {
    showNotification("Transacción registrada exitosamente", "success");
    
    // Si es una contribución, actualizar el monto actual
    if (transactionData.type === 'contribution') {
      setVaca(prev => ({
        ...prev,
        current: transactionData.newTotal || prev.current,
        transactions: [transactionData.data, ...(prev.transactions || [])]
      }));
    } else {
      // Para otros tipos de transacciones
      setVaca(prev => ({
        ...prev,
        transactions: [transactionData.data, ...(prev.transactions || [])]
      }));
    }
    
    setShowTransactionForm(false);
  };

  const handleInvitationComplete = (data) => {
    const count = data?.sent || 0;
    showNotification(
      count === 1 
        ? 'Invitación enviada con éxito' 
        : `${count} invitaciones enviadas con éxito`,
      'success'
    );
    setShowInviteForm(false);
  };

  const handleExpenseCreated = (newExpense) => {
    setShowCreateExpenseForm(false);
    // Actualizar la lista de gastos o mostrar notificación
  };

  if (loading) {
    return <div className="loading-spinner">Cargando detalles...</div>;
  }
  
  if (!vaca) {
    return <div className="error-message">No se pudieron cargar los detalles</div>;
  }

  return (
    <div className="vaca-details-container">
      {/* Header existente */}
      <div className="vaca-details-header">
        <button className="back-button" onClick={onBackClick}>
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </button>
        <div className="vaca-title">
          <FontAwesomeIcon 
            icon={faCow} 
            style={{color: vaca.color || '#3F60E5'}} 
            className="vaca-title-icon" 
          />
          <h1>{vaca.name}</h1>
        </div>
      </div>
      
      <div className="vaca-details-content">
        <div className="vaca-details-summary" style={{ borderTopColor: vaca.color || '#3F60E5' }}>
          <div className="vaca-details-info">
            <p className="vaca-description">{vaca.description || 'Sin descripción'}</p>
            
            <div className="vaca-details-stats">
              <div className="stat">
                <FontAwesomeIcon icon={faMoneyBillWave} className="stat-icon" />
                <span>Meta: ${vaca?.goal !== undefined ? vaca.goal.toLocaleString() : '0'}</span>
              </div>
              
              <div className="stat">
                <FontAwesomeIcon icon={faCalendarAlt} className="stat-icon" />
                <span>Fecha límite: {vaca?.deadline ? new Date(vaca.deadline).toLocaleString() : 'Sin fecha límite'}</span>
              </div>
              
              {daysLeft !== null && (
                <div className="stat">
                  <FontAwesomeIcon icon={faCalendarAlt} className="stat-icon" />
                  <span>{daysLeft} días restantes</span>
                </div>
              )}
              
              <div className="stat">
                <FontAwesomeIcon icon={faUsers} className="stat-icon" />
                <span>{vaca.participants?.length || 0} participantes</span>
              </div>
            </div>
          </div>
          
          <div className="vaca-details-progress">
            <div className="vaca-progress-circle">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle 
                  cx="60" cy="60" r="54" fill="none" 
                  stroke="#e6e6e6" strokeWidth="12" 
                />
                <circle 
                  cx="60" cy="60" r="54" fill="none" 
                  stroke={vaca.color || '#3F60E5'} strokeWidth="12"
                  strokeDasharray="339.292"
                  strokeDashoffset={339.292 - (339.292 * progressPercent) / 100}
                  transform="rotate(-90 60 60)"
                  className="progress-circle-bar"
                />
              </svg>
              <div className="progress-text">
                <strong>{progressPercent.toFixed(0)}%</strong>
              </div>
            </div>
            
            <div className="vaca-amount-info">
              <p>Ahorrado:</p>
              <h3>${vaca?.current !== undefined ? vaca.current.toLocaleString() : '0'}</h3>
              <p>de ${vaca?.goal?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
        
        {window.innerWidth <= 768 ? (
          <>
            {/* Tabs para móvil */}
            <div className="vaca-tabs">
              <button 
                className={`vaca-tab ${activeTab === 'transactions' ? 'active' : ''}`}
                onClick={() => setActiveTab('transactions')}
              >
                <FontAwesomeIcon icon={faMoneyBillWave} /> Transacciones
              </button>
              <button 
                className={`vaca-tab ${activeTab === 'participants' ? 'active' : ''}`}
                onClick={() => setActiveTab('participants')}
              >
                <FontAwesomeIcon icon={faUsers} /> Participantes
              </button>
            </div>
            
            {/* Contenido según la pestaña activa */}
            {activeTab === 'transactions' ? (
              <div className="vaca-section">
                <h2>
                  <FontAwesomeIcon icon={faMoneyBillWave} /> Transacciones
                </h2>
                <div className="add-transaction">
                  <button 
                    className="add-transaction-btn"
                    onClick={() => setShowTransactionForm(!showTransactionForm)}
                  >
                    <FontAwesomeIcon icon={faPlus} /> Nueva Transacción
                  </button>
                </div>
                
                {showTransactionForm ? (
                  <TransactionForm 
                    vacaId={vaca.id}
                    userId={user.id}
                    participantId={vaca.participants?.find(p => p.user_id === user.id)?.id}
                    onSuccess={handleTransactionComplete}
                    onCancel={() => setShowTransactionForm(false)}
                  />
                ) : (
                  <TransactionsList 
                    transactions={vaca.transactions || []} 
                    participants={vaca.participants || []}
                    vacaColor={vaca.color}
                  />
                )}
              </div>
            ) : (
              <div className="participants-section">
                <h2>
                  <FontAwesomeIcon icon={faUsers} /> Participantes ({vaca.participants?.length || 0})
                </h2>
                {vaca.participants && vaca.participants.length > 0 ? (
                  <ul className="participants-list">
                    {vaca.participants.map(participant => (
                      <li key={participant.id} className="participant-item">
                        <div className="participant-avatar" style={{backgroundColor: vaca.color || '#3F60E5'}}>
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="participant-info">
                          <h4>{participant.name}</h4>
                          <p>{participant.email}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-data-message">No hay participantes aún</p>
                )}
              </div>
            )}
          </>
        ) : (
          /* Vista de escritorio con ambas secciones */
          <div className="vaca-details-sections">
            <div className="vaca-section">
              <h2>
                <FontAwesomeIcon icon={faMoneyBillWave} /> Transacciones
              </h2>
              <div className="add-transaction">
                <button 
                  className="add-transaction-btn"
                  onClick={() => setShowTransactionForm(!showTransactionForm)}
                >
                  <FontAwesomeIcon icon={faPlus} /> Nueva Transacción
                </button>
              </div>
              
              {showTransactionForm ? (
                <TransactionForm 
                  vacaId={vaca.id}
                  userId={user.id}
                  participantId={vaca.participants?.find(p => p.user_id === user.id)?.id}
                  onSuccess={handleTransactionComplete}
                  onCancel={() => setShowTransactionForm(false)}
                />
              ) : (
                <TransactionsList 
                  transactions={vaca.transactions || []} 
                  participants={vaca.participants || []}
                  vacaColor={vaca.color}
                />
              )}
            </div>
            
            <div className="participants-section">
              <h2>
                <FontAwesomeIcon icon={faUsers} /> Participantes ({vaca.participants?.length || 0})
              </h2>
              {vaca.participants && vaca.participants.length > 0 ? (
                <ul className="participants-list">
                  {vaca.participants.map(participant => (
                    <li key={participant.id} className="participant-item">
                      <div className="participant-avatar" style={{backgroundColor: vaca.color || '#3F60E5'}}>
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="participant-info">
                        <h4>{participant.name}</h4>
                        <p>{participant.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-data-message">No hay participantes aún</p>
              )}
            </div>
          </div>
        )}

        {/* Sección de invitaciones */}
        <div className="vaca-actions">   
          {vaca && user && vaca.user_id === user.id && (
            <button 
              className="secondary-button invite-btn"
              onClick={() => setShowInviteModal(true)} 
            >
              <FontAwesomeIcon icon={faUserPlus} /> Invitar usuarios
            </button>
          )}
        </div>

        {/* Modal de invitaciones */}
        {showInviteModal && (
          <InviteUsers 
            vacaId={vaca.id}
            userId={user.id}
            onInvitationComplete={(data) => {
              handleInvitationComplete(data);
              setShowInviteModal(false); 
            }}
            onClose={() => setShowInviteModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default VacaDetails;