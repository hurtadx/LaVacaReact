import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import './VacaDetails.css';
import '../../../Dashboard/Resposive/vacadetails-responsive.css';
import '../../../components/VacaConfigModal/VacaConfigModal.css';
import VacaConfigModal from '../../../components/VacaConfigModal/VacaConfigModal.jsx';
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
  faSync,  
  faEllipsisV,
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
  faDownload,
  faCheckCircle,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import UserSearch from './Invitations/UserSearch.jsx';
import InviteUsers from './Invitations/InviteUsers.jsx';
import { NotificationContext } from '../../../components/Notification/NotificationContext.jsx';
import { 
  getVacaDetails, 
  addVacaTransaction,
  inviteParticipants,
  getCurrentUser,
  getVacaParticipants,
  updateVaca,
  getVacaTransactions,
  removeParticipant,
  bulkInviteParticipants,
  getVacaStats,
  getUserNotifications,
  markNotificationAsRead,
  acceptInvitation,
  rejectInvitation
} from '../../../Services';
import TransactionForm from '../../../components/Transactions/TransactionForm.jsx';
import TransactionsList from '../../../components/Transactions/TransactionsList.jsx';
import ParticipantCard from '../../../components/Participants/ParticipantCard.jsx';

const VacaDetails = ({ match, user: passedUser, vaca: initialVaca, onBackClick }) => {
  const [vaca, setVaca] = useState(initialVaca || {});
  const [loading, setLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [user, setUser] = useState(passedUser || null);
  const { showNotification } = useContext(NotificationContext);
  const [activeTab, setActiveTab] = useState('transactions');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [participants, setParticipants] = useState([]);
  
  // Estado adicional para funciones avanzadas
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showEditVacaModal, setShowEditVacaModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showExitVacaModal, setShowExitVacaModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [vacaStats, setVacaStats] = useState({});
  
  // Estado adicional para gestión de participantes
  const [showInviteSection, setShowInviteSection] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [invitingUsers, setInvitingUsers] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);
  const [activeParticipants, setActiveParticipants] = useState([]);
  const [pendingParticipants, setPendingParticipants] = useState([]);
  
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    goal: '',
    deadline: ''
  });  const [vacaConfig, setVacaConfig] = useState({
    invitePermission: 'creator',
    amountType: 'variable',
    fixedAmount: '',
    frequency: 'monthly',
    deadlineType: 'specific',
    specificDay: '',
    nDays: '7',
    minApproval: '51',
    customApproval: '',
    hasGoal: true,
    goalAmount: vaca?.goal || '',
    penaltyType: 'none',
    penaltyPercent: '',
    penaltyFixed: '',
    kickPolicy: 'vote',
    exitPolicy: 'refund'
  });
  const optionsMenuRef = useRef(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (!passedUser) {
      const loadUser = async () => {        try {
          const { user: currentUser, error } = await getCurrentUser();
          if (currentUser && !error) {
            setUser(currentUser);
          } else if (error) {
            console.warn("⚠️ Error loading user:", error);
            showNotification("Error al cargar usuario", "warning");
          }
        } catch (error) {
          console.error("❌ Failed to load user:", error.message);
          showNotification("Error al cargar datos del usuario", "error");
        }
      };
      
      loadUser();
    }
  }, [passedUser]);

  
  useEffect(() => {
    if (!initialVaca && match?.params?.id) {      const loadVacaDetails = async () => {
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
          } else {
            showNotification("No se encontraron detalles de la vaca", "warning");
          }
        } catch (error) {
          console.error("❌ Failed to load vaca details:", error.message);
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
    }  }, [vaca, user]);  // Cargo datos adicionales
  useEffect(() => {
    if (vaca?.id) {
      if (import.meta.env.DEV) console.log("Loading additional data for vaca:", vaca.id);
      loadTransactions();
      loadVacaStats();
      loadParticipants(); // Lo agrego aquí también para asegurarme que se llame
    }
  }, [vaca?.id]);
  // Este useEffect me ayuda a hacer debug del estado de la vaca
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("Vaca state changed:", {
        hasVaca: !!vaca,
        vacaId: vaca?.id,
        vacaName: vaca?.name,
        hasParticipants: !!vaca?.participants,
        participantsLength: vaca?.participants?.length
      });
    }
  }, [vaca]);

  // Cierro el menú de opciones al hacer clic afuera
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

  // Cargo las transacciones de la vaca
  const loadTransactions = async () => {
    try {
      const result = await getVacaTransactions(vaca.id);
      if (result.data) {
        setTransactions(result.data);
      }
    } catch (error) {
      console.error("Error cargando transacciones:", error);
    }
  };
  // Cargo las estadísticas de la vaca
  const loadVacaStats = async () => {
    try {
      const result = await getVacaStats(vaca.id);
      if (result.data) {
        setVacaStats(result.data);      } else if (result.error) {
        console.warn("No pude cargar las estadísticas de la vaca:", result.error);
       
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
      console.warn("Error cargando estadísticas de vaca:", error.message);
  
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

  // Manejo cuando se completa una transacción
  const handleTransactionComplete = async (transactionData) => {
    showNotification("Transacción registrada exitosamente", "success");
    
    // Si es una contribución, actualizo el monto current
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
    
    // Actualizo participantes y transacciones
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
    
    // Actualizo la lista de participantes después de enviar invitaciones
    await loadParticipants();
  };  // Cargar participantes desde la API
  const loadParticipants = async () => {
    if (import.meta.env.DEV) console.log("loadParticipants ejecutándose para vaca:", vaca?.id);
    if (vaca?.id) {
      try {
        if (import.meta.env.DEV) console.log("Cargando participantes para vaca:", vaca.id);        
        
        const result = await getVacaParticipants(vaca.id);
        
        if (import.meta.env.DEV) {
          console.log("Resultado getVacaParticipants:", {
            hasData: !!result.data,
            dataLength: result.data?.length || 0,
            hasError: !!result.error
          });
        }
        
        // Aquí manejo las respuestas que pueden venir en diferentes formatos
        let participantsData = [];
        if (result.data) {
          participantsData = Array.isArray(result.data) ? result.data : [];
        } else if (!result.error && vaca.participants) {
          // Si no hay datos de la API, uso los que ya tengo en vaca
          participantsData = Array.isArray(vaca.participants) ? vaca.participants : [];
        }        
        if (import.meta.env.DEV) console.log("participantsData procesados:", participantsData.length);
        
        // Siempre actualizo la lista de participantes y los separo por estado
        setParticipants(participantsData);        // Proceso los datos y normalizo los campos que pueden faltar
        const processedParticipants = participantsData.map(p => {
          // Normalizo el estado para manejar tanto español como inglés
          let normalizedStatus = 'pending';
          if (p.status === 'active' || p.status === 'activo' || p.status === 'accepted') {
            normalizedStatus = 'active';
          } else if (p.status === 'pending' || p.status === 'invited' || p.status === 'pendiente') {
            normalizedStatus = 'pending';
          }
          
          return {
            ...p,
            // Solo uso datos reales del backend, con mínimos fallbacks
            name: p.name || `Usuario ${p.user_id?.slice(0, 8) || 'Sin ID'}`,
            email: p.email || `usuario_${p.user_id?.slice(0, 8) || 'unknown'}@example.com`,
            status: normalizedStatus,
            // Agrego campos calculados para la interfaz
            displayName: p.name || `Usuario ${p.user_id?.slice(0, 8)}`,
            avatarLetter: (p.name || 'U').charAt(0).toUpperCase()
          };
        });
          // Registro en consola los participantes procesados (solo en desarrollo)
        if (import.meta.env.DEV) {
          processedParticipants.forEach((p, index) => {
            console.log(`Participante ${index}:`, {
              name: p.name,
              status: p.status,
              displayName: p.displayName
            });
          });
        }
        
        // Actualizo el estado con los datos procesados
        setParticipants(processedParticipants);
          const active = processedParticipants.filter(p => {
          const isActive = p.status === 'active';
          if (import.meta.env.DEV) console.log(`${p.displayName} - Status: ${p.status}, isActive: ${isActive}`);
          return isActive;
        });        
        const pending = processedParticipants.filter(p => {
          const isPending = p.status === 'pending';
          if (import.meta.env.DEV) console.log(`${p.displayName} - Status: ${p.status}, isPending: ${isPending}`);
          return isPending;
        });
        
        if (import.meta.env.DEV) {
          console.log("Participantes activos:", active.length);
          console.log("Participantes pendientes:", pending.length);
        }
        
        setActiveParticipants(active);
        setPendingParticipants(pending);
        
        if (result.error) {
          console.warn("⚠️ API returned error but we have data:", result.error);
        }
        
      } catch (error) {
        console.error("❌ Exception loading participants:", error);        
        // Aquí uso los participantes que ya tengo como fallback
        const fallbackParticipants = vaca.participants || [];
        if (import.meta.env.DEV) console.log("Usando participantes de fallback:", fallbackParticipants.length);
        
        setParticipants(fallbackParticipants);
        
        // Aunque esté en fallback, sigo separándolos por estado
        const active = fallbackParticipants.filter(p => p.status === 'active' || !p.status || p.status === 'accepted');
        const pending = fallbackParticipants.filter(p => p.status === 'pending' || p.status === 'invited');
        
        setActiveParticipants(active);
        setPendingParticipants(pending);
      }
    }
  };
  // Calculo datos reales de contribución de cada participante
  const calculateContributionData = (participant) => {
    // Obtengo las transacciones de este participante específico
    const participantTransactions = transactions.filter(t => 
      t.user_id === participant.user_id || t.participant_id === participant.id
    );
    
    // Calculo el total que ha contribuido este participante
    const contributed = participantTransactions
      .filter(t => t.type === 'contribution')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Calculo el porcentaje basado en la meta de la vaca
    const percentage = vaca.goal && vaca.goal > 0 
      ? Math.round((contributed / vaca.goal) * 100) 
      : 0;
    
    // Obtengo la fecha de la última actividad
    const lastTransaction = participantTransactions
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    
    const lastActivity = lastTransaction 
      ? Math.floor((new Date() - new Date(lastTransaction.created_at)) / (1000 * 60 * 60 * 24))
      : null;
    
    return {
      contributed: contributed,
      percentage: Math.min(percentage, 100), // No más del 100%
      lastActivity: lastActivity,
      transactionCount: participantTransactions.length
    };
  };

 
  const handleUserSelect = async (users) => {
    if (!users || users.length === 0) return;
    setInvitingUsers(true);
    try {
    
      const userIds = users.map(user => user.id);
      const { data, error } = await inviteParticipants(vaca.id, userIds, user?.id);
      if (!error) {
        showNotification(
          `${users.length} ${users.length === 1 ? 'invitación enviada' : 'invitaciones enviadas'} con éxito`,
          'success'
        );
        setSelectedUsers([]);
        setShowInviteSection(false);
        await loadParticipants();
      } else {
        showNotification(error || 'Error al enviar invitaciones', 'error');
      }
    } catch (error) {
      console.error("Error al enviar invitaciones:", error);
      showNotification("Error al enviar invitaciones", "error");
    } finally {
      setInvitingUsers(false);
    }
  };

  // Manejo la eliminación de participantes pendientes
  const handleRemoveParticipantInvitation = async (participantId) => {
    try {
      const result = await removeParticipant(participantId);
      
      if (result.data || !result.error) {
        showNotification("Invitación eliminada con éxito", "success");
        setShowRemoveConfirm(null);
        await loadParticipants();
      }
    } catch (error) {
      console.error("Error al eliminar participante:", error);
      showNotification("Error al eliminar invitación", "error");
    }
  };

  // Handler para aceptar invitación
  const handleAcceptInvitation = async (participant) => {
    if (!participant.invitation_id) return;
    try {
      const { data, error } = await acceptInvitation(participant.invitation_id);
      if (!error) {
        showNotification('Has aceptado la invitación', 'success');
        await loadParticipants();
      } else {
        showNotification('Error al aceptar invitación', 'error');
      }
    } catch (err) {
      showNotification('Error al aceptar invitación', 'error');
    }
  };

  // Handler para rechazar invitación
  const handleRejectInvitation = async (participant) => {
    if (!participant.invitation_id) return;
    try {
      const { data, error } = await rejectInvitation(participant.invitation_id);
      if (!error) {
        showNotification('Has rechazado la invitación', 'info');
        await loadParticipants();
      } else {
        showNotification('Error al rechazar invitación', 'error');
      }
    } catch (err) {
      showNotification('Error al rechazar invitación', 'error');
    }
  };

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("useEffect loadParticipants - vaca?.id:", vaca?.id);
      console.log("useEffect loadParticipants - dependencies:", { 
        vacaId: vaca?.id, 
        hasParticipants: !!vaca.participants 
      });
    }
    
    if (vaca?.id) {
      if (import.meta.env.DEV) console.log("Calling loadParticipants because vaca.id exists:", vaca.id);
      loadParticipants();
    } else {
      if (import.meta.env.DEV) console.log("NOT calling loadParticipants - no vaca.id");
    }
  }, [vaca?.id, vaca.participants]);

  // Manejo la edición de la vaca
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

  // Manejo la eliminación de participantes
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

  // Manejo cuando alguien quiere salir de la vaca
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

  // Esta función la uso para probar manualmente el endpoint
  const testParticipantsEndpoint = async () => {
    console.log("🧪 === TEST MANUAL DE ENDPOINT ===");
    console.log("🎯 Vaca ID:", vaca?.id);
    
    if (!vaca?.id) {
      console.error("❌ No hay vaca ID para testing");
      return;
    }

    try {
      // Pruebo el endpoint directamente
      const directResponse = await fetch(`${API_BASE_URL}/api/participants/vaca/${vaca.id}/details`);
      console.log("📡 Direct fetch response status:", directResponse.status);
      console.log("📡 Direct fetch response ok:", directResponse.ok);
        if (directResponse.ok) {
        const directData = await directResponse.json();
        if (import.meta.env.DEV) console.log("Direct fetch data:", directData);
      } else {
        const errorText = await directResponse.text();
        console.error("Direct fetch error:", errorText);
      }

      // Ahora pruebo usando el participantService
      if (import.meta.env.DEV) console.log("Testing via participantService...");
      const serviceResult = await getVacaParticipants(vaca.id);
      if (import.meta.env.DEV) console.log("Service result:", serviceResult);} catch (error) {
      console.error("💥 Test error:", error);
    }
    console.log("🧪 === FIN DEL TEST ===");
  };

  // Aquí manejo los eventos del modal de configuración
  const handleSaveConfig = () => {
    console.log('Saving vaca config:', vacaConfig);
    // TODO: Necesito implementar la funcionalidad de guardar
    setShowRulesModal(false);
    showNotification("Configuración guardada exitosamente", "success");
  };

  const handleExitVacaFromConfig = () => {
    setShowRulesModal(false);
    setShowExitVacaModal(true);
  };

  const handleCloseConfig = () => {
    setShowRulesModal(false);
  };

  const isAdmin = vaca.user_id === user?.id;
  const isParticipant = participants.some(p => p.user_id === user?.id);

  // Mostrar notificaciones tipo toast solo una vez (al cargar usuario y vaca)
  useEffect(() => {
    const showUnreadNotifications = async () => {
      if (!user?.id) return;
      try {
        const { data: notifications, error } = await getUserNotifications(user.id);
        if (error) return;
        if (Array.isArray(notifications)) {
          for (const notification of notifications) {
            if (notification.is_read === false) {
              showNotification(notification.message || 'Tienes una notificación', 'info');
              await markNotificationAsRead(notification.id);
            }
          }
        }
      } catch (err) {
        // Silenciar errores de notificaciones
      }
    };
    showUnreadNotifications();
  }, [user?.id]);

  if (loading) {
    return <div className="loading-spinner">Cargando detalles...</div>;
  }
  
  if (!vaca) {
    return <div className="error-message">No se pudieron cargar los detalles</div>;
  }

  
  const handleTabClick = (tab) => {
    setActiveTab(prev => (prev === tab ? null : tab));
  };

  
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
            <button 
              className="primary-action-btn edit-vaca-btn"
              onClick={() => setShowEditVacaModal(true)}
              title="Editar esta vaca"
            >
              <FontAwesomeIcon icon={faEdit} /> <span>Editar</span>
            </button>
          )}
          
          {/* Rules button - visible for all participants */}
          <button 
            className="secondary-action-btn rules-btn"
            onClick={() => setShowRulesModal(true)}
            title="Ver reglas y configuración"
          >
            <FontAwesomeIcon icon={faCog} /> <span>Reglas</span>
          </button>
          
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
          </div>        </div>
        
        {/* Mobile Tab Navigation */}
        <div className="vaca-tabs">
          <button 
            className={`vaca-tab ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => handleTabClick('transactions')}
          >
            <FontAwesomeIcon icon={faMoneyBillWave} /> Transacciones
          </button>
          <button 
            className={`vaca-tab ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => handleTabClick('participants')}
          >
            <FontAwesomeIcon icon={faUsers} /> Participantes
          </button>
        </div>
          {/* Enhanced Layout: 2/3 Transactions, 1/3 Participants */}
        <div className="vaca-main-content">
          {/* Transactions Section (2/3 width) */}
          <div className={`transactions-main-section${activeTab === 'transactions' ? ' active-tab' : ''}${activeTab !== 'transactions' ? ' hidden-tab' : ''}`}>
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
          </div>          {/* Comprehensive Participants Management Section (1/3 width) */}
          <div className={`participants-main-section${activeTab === 'participants' ? ' active-tab' : ''}${activeTab !== 'participants' ? ' hidden-tab' : ''}`}>
            <div className="section-header">
              <h2>
                <FontAwesomeIcon icon={faUsers} /> Gestión de Participantes
              </h2>
              <div className="participants-actions">                <button 
                  className="refresh-participants-btn"
                  onClick={testParticipantsEndpoint}
                  title="TEST - Verificar endpoint"
                >
                  <FontAwesomeIcon icon={faSync} />
                </button>
                <button 
                  className="invite-toggle-btn"
                  onClick={() => setShowInviteSection(!showInviteSection)}
                >
                  <FontAwesomeIcon icon={faUserPlus} />
                  {showInviteSection ? 'Cancelar' : 'Invitar'}
                </button>
              </div>
            </div>

            {/* Invite Section */}
            {showInviteSection && (
              <div className="invite-section">
                <h3>Invitar Nuevos Participantes</h3>
                <UserSearch 
                  onUserSelect={handleUserSelect}
                  excludeUsers={participants}
                />
              </div>
            )}

            {/* Active Participants */}
            {activeParticipants && activeParticipants.length > 0 && (
              <div className="participants-category">
                <h3 className="category-title">
                  <FontAwesomeIcon icon={faCheckCircle} className="active-icon" />
                  Participantes Activos ({activeParticipants.length})
                </h3>
                <div className="participants-grid">                {activeParticipants.map(participant => {
                    const contributionData = calculateContributionData(participant);
                    return (
                      <div key={participant.id} className="participant-card active">
                        <div className="participant-header">                          <div 
                            className="participant-avatar"
                            style={{backgroundColor: vaca.color || '#3F60E5'}}
                          >
                            {participant.avatarLetter || participant.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="participant-info">
                            <span className="participant-name">{participant.displayName || participant.name || 'Usuario desconocido'}</span>
                            <span className="participant-email">{participant.email || 'Sin email'}</span>
                          </div>
                        </div>
                        <div className="participant-stats">                          <div className="stat-item">
                            <span className="stat-label">Contribuido:</span>
                            <span className="stat-value">
                              ${contributionData.contributed > 0 
                                ? contributionData.contributed.toLocaleString() 
                                : '0'}
                            </span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Progreso:</span>
                            <span className="stat-value">{contributionData.percentage}%</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Última actividad:</span>
                            <span className="stat-value">
                              {contributionData.lastActivity !== null 
                                ? `${contributionData.lastActivity} días` 
                                : 'Sin actividad'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pending Participants */}
            {pendingParticipants && pendingParticipants.length > 0 && (
              <div className="participants-category">
                <h3 className="category-title">
                  <FontAwesomeIcon icon={faClock} className="pending-icon" />
                  Invitaciones Pendientes ({pendingParticipants.length})
                </h3>
                <div className="participants-grid">
                  {pendingParticipants.map(participant => {
                    const isCurrentUser = participant.user_id === user?.id;
                    return (
                      <div key={participant.id} className="participant-card pending">
                        <div className="participant-header">                          <div 
                            className="participant-avatar pending"
                            style={{backgroundColor: '#fbbf24'}}
                          >
                            {participant.avatarLetter || participant.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="participant-info">
                            <span className="participant-name">{participant.displayName || participant.name || 'Usuario desconocido'}</span>
                            <span className="participant-email">{participant.email || 'Sin email'}</span>
                            <span className="pending-label">
                              <FontAwesomeIcon icon={faClock} /> Pendiente
                            </span>
                          </div>
                        </div>
                        <div className="participant-stats">
                          <div className="stat-item">
                            <span className="stat-label">Contribuido:</span>
                            <span className="stat-value">$0</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Porcentaje:</span>
                            <span className="stat-value">0%</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Última actividad:</span>
                            <span className="stat-value">-</span>
                          </div>
                        </div>
                        {isAdmin && (
                          <div className="participant-actions">
                            <button 
                              className="remove-invitation-btn"
                              onClick={() => setShowRemoveConfirm(participant.id)}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                              Eliminar invitación
                            </button>
                          </div>
                        )}
                        {isCurrentUser && (
                          <div className="participant-actions">
                            <button className="accept-invitation-btn" onClick={() => handleAcceptInvitation(participant)}>
                              <FontAwesomeIcon icon={faCheck} /> Aceptar
                            </button>
                            <button className="reject-invitation-btn" onClick={() => handleRejectInvitation(participant)}>
                              <FontAwesomeIcon icon={faTimes} /> Rechazar
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* No participants message */}
            {(!activeParticipants || activeParticipants.length === 0) && 
             (!pendingParticipants || pendingParticipants.length === 0) && (
              <div className="no-participants">
                <FontAwesomeIcon icon={faUsers} className="no-participants-icon" />
                <p>No hay participantes aún</p>
                {isAdmin && (
                  <button 
                    className="invite-first-btn"
                    onClick={() => setShowInviteSection(true)}
                  >
                    <FontAwesomeIcon icon={faUserPlus} />
                    Invitar primeros participantes
                  </button>
                )}
              </div>
            )}

            {/* Remove Confirmation Modal */}
            {showRemoveConfirm && (
              <div className="confirmation-overlay">
                <div className="confirmation-modal">
                  <div className="confirmation-header">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="warning-icon" />
                    <h3>Confirmar eliminación</h3>
                  </div>
                  <p>¿Estás seguro de que deseas eliminar esta invitación?</p>
                  <div className="confirmation-actions">
                    <button 
                      className="cancel-btn"
                      onClick={() => setShowRemoveConfirm(null)}
                    >
                      Cancelar
                    </button>
                    <button 
                      className="confirm-btn"
                      onClick={() => handleRemoveParticipantInvitation(showRemoveConfirm)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
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
          <VacaConfigModal
            config={vacaConfig}
            setConfig={setVacaConfig}
            onSave={handleSaveConfig}
            onExit={handleExitVacaFromConfig}
            onClose={handleCloseConfig}
          />
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
                </button>                <button 
                  className="exit-btn"
                  onClick={handleExitVaca}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} /> Salir de la Vaca
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invite Users Modal */}
        {showInviteModal && (
          <InviteUsers
            vacaId={vaca.id}
            userId={user?.id}
            onInvitationComplete={handleInviteUsersComplete}
            onClose={() => setShowInviteModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default VacaDetails;