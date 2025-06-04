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
  faUserPlus,
  faSync,  faEllipsisV,
  faEdit,
  faCog,
  faTimes,
  faCheck,
  faSignOutAlt,
  faUserMinus,
  faChartLine,
  faExclamationTriangle,
  faInfoCircle,
  faTrash,
  faEye,
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import InviteParticipantsModal from '../../../components/InviteParticipantsModal/InviteParticipantsModal';
import { NotificationContext } from '../../../components/Notification/NotificationContext';
import { 
  getVacaDetails, 
  addVacaTransaction,
  inviteParticipants,
  getCurrentUser,
  getVacaParticipants,
  updateVaca,
  removeVacaParticipant,
  getVacaTransactions,
  removeParticipant,
  getVacaStats
} from '../../../Services';
import TransactionForm from '../../../Components/Transactions/TransactionForm.jsx';
import TransactionsList from '../../../Components/Transactions/TransactionsList.jsx';
import ParticipantCard from '../../../Components/Participants/ParticipantCard.jsx';

const VacaDetails = ({ match, user: passedUser, vaca: initialVaca, onBackClick }) => {
  const [vaca, setVaca] = useState(initialVaca || {});
  const [loading, setLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [user, setUser] = useState(passedUser || null);
  const { showNotification } = useContext(NotificationContext);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('transactions');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [participants, setParticipants] = useState([]);
  
  // New state for enhanced features
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showEditVacaModal, setShowEditVacaModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showExitVacaModal, setShowExitVacaModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [vacaStats, setVacaStats] = useState({});
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    goal: '',
    deadline: ''
  });
  const [rulesData, setRulesData] = useState({
    invitationPermissions: 'admin_only',
    contributionAmount: '',
    contributionFrequency: 'monthly',
    contributionDeadline: '',
    approvalPercentage: 75,
    goalSettings: 'fixed',
    penaltySettings: 'none',
    memberExpulsion: 'majority_vote',
    exitPolicy: 'anytime'
  });
  const optionsMenuRef = useRef(null);

  useEffect(() => {
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
          if (error) {
            throw new Error(error);
          }
          if (data) {
            setVaca(data);
            setEditFormData({
              name: data.name || '',
              description: data.description || '',
              goal: data.goal || '',
              deadline: data.deadline || ''
            });
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
        
        
        const event = new CustomEvent('vacaVisited', { 
          detail: { userId: user.id, vacaId: vaca.id }
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error("Error al guardar la última vaca visitada:", error);
      }
    }
  }, [vaca, user]);

  // Load additional data
  useEffect(() => {
    if (vaca?.id) {
      loadTransactions();
      loadVacaStats();
    }
  }, [vaca?.id]);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Load transactions
  const loadTransactions = async () => {
    try {
      const result = await getVacaTransactions(vaca.id);
      if (result.data) {
        setTransactions(result.data);
      }
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  };
  // Load vaca statistics
  const loadVacaStats = async () => {
    try {
      const result = await getVacaStats(vaca.id);
      if (result.data) {
        setVacaStats(result.data);
      } else if (result.error) {
        console.warn("Could not load vaca stats:", result.error);
       
        setVacaStats({
          totalContributions: 0,
          totalExpenses: 0,
          currentBalance: 0,
          goalProgress: 0,
          participantCount: 0,
          transactionCount: 0,
          averageContribution: 0,
          lastActivity: new Date().toISOString()
        });
      }
    } catch (error) {
      console.warn("Error loading vaca stats:", error.message);
  
      setVacaStats({
        totalContributions: 0,
        totalExpenses: 0,
        currentBalance: 0,
        goalProgress: 0,
        participantCount: 0,
        transactionCount: 0,
        averageContribution: 0,
        lastActivity: new Date().toISOString()
      });
    }
  };

  // Handle transaction completion
  const handleTransactionComplete = async (transactionData) => {
    showNotification("Transacción registrada exitosamente", "success");
    
    // If it's a contribution, update current amount
    if (transactionData.type === 'contribution') {
      setVaca(prev => ({
        ...prev,
        current: transactionData.newTotal || prev.current,
        transactions: [transactionData.data, ...(prev.transactions || [])]
      }));
    } else {

      setVaca(prev => ({
        ...prev,
        transactions: [transactionData.data, ...(prev.transactions || [])]
      }));
    }
    
    setShowTransactionForm(false);
    
    // Refresh participants and transactions
    await loadParticipants();
    await loadTransactions();
  };

  const handleInvitationComplete = async (data) => {
    const count = data?.sent || 0;
    showNotification(
      count === 1 
        ? 'Invitación enviada con éxito' 
        : `${count} invitaciones enviadas con éxito`,
      'success'
    );
    setShowInviteForm(false);
    
    // Refresh participants list after sending invitations
    await loadParticipants();
  };  // Load participants using the API endpoint
  const loadParticipants = async () => {
    console.log("🚀 loadParticipants ejecutándose - vaca:", vaca);
    if (vaca?.id) {
      try {
        console.log("🔄 Cargando participantes para vaca:", vaca.id);        const result = await getVacaParticipants(vaca.id);
        
        console.log("🔍 Resultado completo getVacaParticipants:", result);
        
        if (result.error) {
          console.error("❌ Error loading participants:", result.error);
          // Fallback to existing participants data
          console.log("🔄 Usando participantes existentes como fallback");
          setParticipants(vaca.participants || []);
        } else {
          console.log("✅ Participantes cargados exitosamente:", result.data);
          console.log("📊 Número de participantes:", result.data?.length || 0);
          setParticipants(result.data || []);
        }
      } catch (error) {
        console.error("Exception loading participants:", error);
        
        setParticipants(vaca.participants || []);
      }
    }
  };

  useEffect(() => {
    loadParticipants();
  }, [vaca?.id, vaca.participants]);

  // Handle edit vaca
  const handleEditVaca = async () => {
    try {
      const result = await updateVaca(vaca.id, editFormData);
      if (result.error) {
        throw new Error(result.error);
      }
      
      setVaca(prev => ({
        ...prev,
        ...editFormData
      }));
      
      showNotification("Vaca actualizada exitosamente", "success");
      setShowEditVacaModal(false);
    } catch (error) {
      console.error("Error updating vaca:", error);
      showNotification("Error al actualizar la vaca", "error");
    }
  };

  // Handle remove participant
  const handleRemoveParticipant = async (participantId) => {
    try {
      const result = await removeParticipant(vaca.id, participantId);
      if (result.error) {
        throw new Error(result.error);
      }
      
      showNotification("Participante eliminado exitosamente", "success");
      await loadParticipants();
    } catch (error) {
      console.error("Error removing participant:", error);
      showNotification("Error al eliminar participante", "error");
    }
  };

  // Handle exit vaca
  const handleExitVaca = async () => {
    try {
      const currentParticipant = participants.find(p => p.user_id === user.id);
      if (currentParticipant) {
        await handleRemoveParticipant(currentParticipant.id);
        showNotification("Has salido de la vaca exitosamente", "success");
        onBackClick();
      }
    } catch (error) {
      console.error("Error exiting vaca:", error);
      showNotification("Error al salir de la vaca", "error");
    }
  };

  // Check if user is admin
  const isAdmin = vaca.user_id === user?.id;
  const isParticipant = participants.some(p => p.user_id === user?.id);

  if (loading) {
    return <div className="loading-spinner">Cargando detalles...</div>;
  }
  
  if (!vaca) {
    return <div className="error-message">No se pudieron cargar los detalles</div>;
  }

  return (
    <div className="vaca-details-container">
      {/* Enhanced Header with Options Menu */}
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
        </div>        <div className="header-actions">
          {/* Admin actions - visible directly */}
          {isAdmin && (
            <>              <button 
                className="primary-action-btn edit-vaca-btn"
                onClick={() => setShowEditVacaModal(true)}
                title="Editar esta vaca"
              >
                <FontAwesomeIcon icon={faEdit} /> <span>Editar</span>
              </button>
              <button 
                className="secondary-action-btn rules-btn"
                onClick={() => setShowRulesModal(true)}
                title="Configurar reglas y opciones"
              >
                <FontAwesomeIcon icon={faCog} /> <span>Reglas</span>
              </button>
            </>
          )}
          
          {/* Options menu for additional actions */}
          <div className="options-menu" ref={optionsMenuRef}>
            <button 
              className="options-menu-button"
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              title="Más opciones"
            >
              <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            {showOptionsMenu && (
              <div className="options-menu-dropdown">
                {isParticipant && !isAdmin && (
                  <button onClick={() => setShowExitVacaModal(true)} className="exit-option">
                    <FontAwesomeIcon icon={faSignOutAlt} /> Salir de la Vaca
                  </button>
                )}
                <button>
                  <FontAwesomeIcon icon={faDownload} /> Exportar Datos
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="vaca-details-content">
        {/* Enhanced Vaca Summary with Editable Description */}
        <div className="vaca-details-summary" style={{ borderTopColor: vaca.color || '#3F60E5' }}>
          <div className="vaca-details-info">
            <div className="vaca-description-section">
              <h3>Descripción</h3>
              <p className="vaca-description">{vaca.description || 'Sin descripción'}</p>
            </div>
            
            <div className="vaca-details-stats">
              <div className="stat">
                <FontAwesomeIcon icon={faMoneyBillWave} className="stat-icon" />
                <span>Meta: ${vaca?.goal !== undefined ? vaca.goal.toLocaleString() : '0'}</span>
              </div>
              
              <div className="stat">
                <FontAwesomeIcon icon={faCalendarAlt} className="stat-icon" />
                <span>Fecha límite: {formattedDeadline}</span>
              </div>
              
              {daysLeft !== null && (
                <div className="stat">
                  <FontAwesomeIcon icon={faCalendarAlt} className="stat-icon" />
                  <span>{daysLeft} días restantes</span>
                </div>
              )}
              
              <div className="stat">
                <FontAwesomeIcon icon={faUsers} className="stat-icon" />
                <span>{participants?.length || 0} participantes</span>
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
        
        {/* Enhanced Layout: 2/3 Transactions, 1/3 Participants */}
        <div className="vaca-main-content">
          {/* Transactions Section (2/3 width) */}
          <div className="transactions-main-section">
            <div className="section-header">
              <h2>
                <FontAwesomeIcon icon={faMoneyBillWave} /> Historial de Transacciones
              </h2>
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
                participantId={participants?.find(p => p.user_id === user.id)?.id}
                onSuccess={handleTransactionComplete}
                onCancel={() => setShowTransactionForm(false)}
              />
            ) : (
              <div className="transactions-list-container">
                <TransactionsList 
                  transactions={transactions.length > 0 ? transactions : vaca.transactions || []} 
                  participants={participants || []}
                  vacaColor={vaca.color}
                />
              </div>
            )}
          </div>

          {/* Participants Section (1/3 width) */}
          <div className="participants-main-section">
            <div className="section-header">
              <h2>
                <FontAwesomeIcon icon={faUsers} /> Participantes ({participants?.length || 0})
              </h2>
              <div className="participants-actions">                {isAdmin && (
                  <button 
                    className="invite-participants-btn"
                    onClick={() => setShowInviteModal(true)}
                  >
                    <FontAwesomeIcon icon={faUserPlus} /> Invitar
                  </button>
                )}
                <button 
                  className="refresh-participants-btn"
                  onClick={loadParticipants}
                  title="Actualizar participantes"
                >
                  <FontAwesomeIcon icon={faSync} />
                </button>
              </div>
            </div>            {participants && participants.length > 0 ? (
              <div className="participants-list">                {participants.map(participant => {
                  const participantStats = vacaStats[participant.id] || {};
                  return (
                    <ParticipantCard
                      key={participant.id}
                      participant={participant}
                      stats={participantStats}
                      vacaColor={vaca.color || '#3F60E5'}
                      isAdmin={isAdmin}
                      currentUserId={user?.id}
                      onRemove={() => handleRemoveParticipant(participant.id)}
                      onViewDetails={(participant) => {
                        console.log('Ver detalles de:', participant);
                        // TODO: Implementar modal de detalles
                      }}
                      onInviteUsers={() => setShowInviteModal(true)}
                    />
                  );
                })}
              </div>            ) : (
              <div className="empty-participants-state">
                <FontAwesomeIcon icon={faUsers} className="empty-icon" />
                <h3>No hay participantes</h3>
                <p>Esta vaca aún no tiene participantes registrados.</p>
                {isAdmin ? (
                  <div className="empty-state-actions">
                    <p className="admin-hint">Como administrador, puedes invitar personas para que se unan a esta vaca.</p>
                    <button 
                      className="invite-first-participants-btn"
                      onClick={() => setShowInviteModal(true)}
                    >
                      <FontAwesomeIcon icon={faUserPlus} /> Invitar Primeros Participantes
                    </button>
                  </div>
                ) : (
                  <p className="participant-hint">Contacta al administrador para unirte a esta vaca.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit Vaca Modal */}
        {showEditVacaModal && (
          <div className="modal-overlay">
            <div className="modal-content edit-vaca-modal">
              <div className="modal-header">
                <h3>Editar Vaca</h3>
                <button 
                  className="close-modal-btn"
                  onClick={() => setShowEditVacaModal(false)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    placeholder="Nombre de la vaca"
                  />
                </div>
                <div className="form-group">
                  <label>Descripción:</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    placeholder="Descripción de la vaca"
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Meta ($):</label>
                  <input
                    type="number"
                    value={editFormData.goal}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      goal: parseFloat(e.target.value) || 0
                    }))}
                    placeholder="Meta de ahorro"
                  />
                </div>
                <div className="form-group">
                  <label>Fecha límite:</label>
                  <input
                    type="date"
                    value={editFormData.deadline ? new Date(editFormData.deadline).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditFormData(prev => ({
                      ...prev,
                      deadline: e.target.value
                    }))}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowEditVacaModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="save-btn"
                  onClick={handleEditVaca}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rules/Options Modal */}
        {showRulesModal && (
          <div className="modal-overlay">
            <div className="modal-content rules-modal">
              <div className="modal-header">
                <h3>Reglas y Opciones</h3>
                <button 
                  className="close-modal-btn"
                  onClick={() => setShowRulesModal(false)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="modal-body">
                <div className="rules-sections">
                  <div className="rules-section">
                    <h4><FontAwesomeIcon icon={faUserPlus} /> Permisos de Invitación</h4>
                    <select
                      value={rulesData.invitationPermissions}
                      onChange={(e) => setRulesData(prev => ({
                        ...prev,
                        invitationPermissions: e.target.value
                      }))}
                    >
                      <option value="admin_only">Solo administrador</option>
                      <option value="all_members">Todos los miembros</option>
                      <option value="founding_members">Miembros fundadores</option>
                    </select>
                  </div>

                  <div className="rules-section">
                    <h4><FontAwesomeIcon icon={faMoneyBillWave} /> Contribuciones</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Monto mínimo ($):</label>
                        <input
                          type="number"
                          value={rulesData.contributionAmount}
                          onChange={(e) => setRulesData(prev => ({
                            ...prev,
                            contributionAmount: e.target.value
                          }))}
                          placeholder="Monto mínimo"
                        />
                      </div>
                      <div className="form-group">
                        <label>Frecuencia:</label>
                        <select
                          value={rulesData.contributionFrequency}
                          onChange={(e) => setRulesData(prev => ({
                            ...prev,
                            contributionFrequency: e.target.value
                          }))}
                        >
                          <option value="flexible">Flexible</option>
                          <option value="weekly">Semanal</option>
                          <option value="monthly">Mensual</option>
                          <option value="quarterly">Trimestral</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="rules-section">
                    <h4><FontAwesomeIcon icon={faChartLine} /> Configuración de Meta</h4>
                    <select
                      value={rulesData.goalSettings}
                      onChange={(e) => setRulesData(prev => ({
                        ...prev,
                        goalSettings: e.target.value
                      }))}
                    >
                      <option value="fixed">Meta fija</option>
                      <option value="adjustable">Ajustable por votación</option>
                      <option value="progressive">Progresiva</option>
                    </select>
                  </div>

                  <div className="rules-section">
                    <h4><FontAwesomeIcon icon={faExclamationTriangle} /> Penalizaciones</h4>
                    <select
                      value={rulesData.penaltySettings}
                      onChange={(e) => setRulesData(prev => ({
                        ...prev,
                        penaltySettings: e.target.value
                      }))}
                    >
                      <option value="none">Sin penalizaciones</option>
                      <option value="late_fee">Multa por retraso</option>
                      <option value="progressive_penalty">Penalización progresiva</option>
                    </select>
                  </div>

                  <div className="rules-section">
                    <h4><FontAwesomeIcon icon={faUserMinus} /> Expulsión de Miembros</h4>
                    <select
                      value={rulesData.memberExpulsion}
                      onChange={(e) => setRulesData(prev => ({
                        ...prev,
                        memberExpulsion: e.target.value
                      }))}
                    >
                      <option value="admin_only">Solo administrador</option>
                      <option value="majority_vote">Votación mayoritaria</option>
                      <option value="unanimous_vote">Votación unánime</option>
                    </select>
                  </div>

                  <div className="rules-section">
                    <h4><FontAwesomeIcon icon={faSignOutAlt} /> Política de Salida</h4>
                    <select
                      value={rulesData.exitPolicy}
                      onChange={(e) => setRulesData(prev => ({
                        ...prev,
                        exitPolicy: e.target.value
                      }))}
                    >
                      <option value="anytime">En cualquier momento</option>
                      <option value="notice_required">Aviso previo requerido</option>
                      <option value="penalty_applies">Con penalización</option>
                      <option value="no_exit">No permitido</option>
                    </select>
                  </div>

                  <div className="rules-section">
                    <h4><FontAwesomeIcon icon={faCheck} /> Porcentaje de Aprobación</h4>
                    <div className="form-group">
                      <label>Porcentaje requerido para decisiones importantes:</label>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={rulesData.approvalPercentage}
                        onChange={(e) => setRulesData(prev => ({
                          ...prev,
                          approvalPercentage: parseInt(e.target.value)
                        }))}
                      />
                      <span className="percentage-display">{rulesData.approvalPercentage}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowRulesModal(false)}
                >
                  Cancelar
                </button>
                <button className="save-btn">
                  Guardar Reglas
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exit Vaca Modal */}
        {showExitVacaModal && (
          <div className="modal-overlay">
            <div className="modal-content exit-vaca-modal">
              <div className="modal-header">
                <h3><FontAwesomeIcon icon={faExclamationTriangle} /> Salir de la Vaca</h3>
                <button 
                  className="close-modal-btn"
                  onClick={() => setShowExitVacaModal(false)}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
              <div className="modal-body">
                <div className="exit-warning">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="warning-icon" />
                  <p>¿Estás seguro de que quieres salir de esta vaca?</p>
                  <p className="warning-text">
                    Esta acción no se puede deshacer. Perderás acceso a todas las transacciones 
                    y ya no podrás participar en esta vaca.
                  </p>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowExitVacaModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  className="exit-btn"
                  onClick={handleExitVaca}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} /> Salir de la Vaca
                </button>
              </div>
            </div>
          </div>
        )}        {/* Invite Participants Modal */}
        {showInviteModal && (
          <InviteParticipantsModal 
            isOpen={showInviteModal}
            onClose={() => setShowInviteModal(false)}
            vacaId={vaca.id}
            onInviteSuccess={async () => {
              // Recargar participantes después de invitar
              await loadParticipants();
              // Recargar stats si es necesario
              if (vaca.id) {
                await loadVacaStats();
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default VacaDetails;