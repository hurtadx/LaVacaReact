import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../Supabase/supabaseConfig';
import './VacaDetails.css';
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
  addVacaTransaction,
  inviteParticipants
} from '../../../Services/vacaService.jsx';

// Actualizar la definición del componente para aceptar user como prop
const VacaDetails = ({ match, user: passedUser, vaca: initialVaca, onBackClick }) => {
  const [vaca, setVaca] = useState(initialVaca || {});
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [user, setUser] = useState(passedUser || null);
  const { showNotification } = useContext(NotificationContext);

  // Si no tenemos usuario pasado como prop, cargarlo desde auth
  useEffect(() => {
    if (!passedUser) {
      const loadUser = async () => {
        try {
          const { data } = await supabase.auth.getUser();
          if (data?.user) {
            setUser(data.user);
          }
        } catch (error) {
          console.error("Error al cargar usuario:", error);
        }
      };
      
      loadUser();
    }
  }, [passedUser]);

  // Si no tenemos vaca inicial, cargarla usando el ID de match.params
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

  const handleAddPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      showNotification("Por favor ingresa un monto válido", "error");
      return;
    }
    
    setLoading(true);
    
    try {
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        showNotification("Debes iniciar sesión para realizar un pago", "error");
        setLoading(false);
        return;
      }
      
      
      const isParticipant = vaca.participants?.some(p => p.user_id === user.id);
      
      if (!isParticipant && vaca.user_id !== user.id) {
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, email')
          .eq('id', user.id)
          .single();
          
        const { error: addParticipantError } = await supabase
          .from('participants')
          .insert({
            vaca_id: vaca.id,
            name: profile?.username || user.email?.split('@')[0] || 'Usuario',
            email: profile?.email || user.email,
            user_id: user.id
          });
          
        if (addParticipantError) {
          console.error("Error añadiendo participante:", addParticipantError);
          showNotification("Error al registrarte como participante", "error");
          setLoading(false);
          return;
        }
      }
      
      
      const { data, error, newTotal } = await addVacaTransaction({
        vacaId: vaca.id,
        amount: parseFloat(paymentAmount),
        description: paymentDescription || "Pago",
        participant: user.id
      });
      
      if (error) {
        showNotification(`Error: ${error}`, "error");
        setLoading(false);
        return;
      }
      
      showNotification("Pago registrado exitosamente", "success");
      
      
      setVaca(prev => ({
        ...prev,
        current: newTotal,
        transactions: [data, ...(prev.transactions || [])]
      }));
      
      setShowAddPayment(false);
      setPaymentAmount('');
      setPaymentDescription('');
    } catch (error) {
      console.error("Error en pago:", error);
      showNotification("Error al procesar el pago", "error");
    } finally {
      setLoading(false);
    }
  };

  // Manejador para cuando se completa una invitación
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

  return (
    <div className="vaca-details-container">
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
                <span>Meta: ${vaca.goal.toLocaleString()}</span>
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
              <h3>${vaca.current ? vaca.current.toLocaleString() : '0'}</h3>
              <p>de ${vaca.goal.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="vaca-details-sections">
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
          
          <div className="vaca-section">
            <h2>
              <FontAwesomeIcon icon={faMoneyBillWave} /> Transacciones
            </h2>
            <div className="add-transaction">
              <button 
                className="add-transaction-btn"
                onClick={() => setShowAddPayment(!showAddPayment)}
              >
                <FontAwesomeIcon icon={faPlus} /> Añadir pago
              </button>
            </div>
            
            {showAddPayment && (
              <div className="payment-form">
                <div className="form-group">
                  <label htmlFor="paymentAmount">Monto</label>
                  <div className="amount-input-group">
                    <span>$</span>
                    <input
                      type="number"
                      id="paymentAmount"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0"
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="paymentDescription">Descripción</label>
                  <input
                    type="text"
                    id="paymentDescription"
                    value={paymentDescription}
                    onChange={(e) => setPaymentDescription(e.target.value)}
                    placeholder="Ej: Pago mensual"
                  />
                </div>
                
                <div className="payment-form-actions">
                  <button 
                    className="cancel-payment-btn"
                    onClick={() => setShowAddPayment(false)}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="save-payment-btn"
                    onClick={handleAddPayment}
                    disabled={!paymentAmount}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            )}
            
            {vaca.transactions && vaca.transactions.length > 0 ? (
              <ul className="transactions-list">
                {vaca.transactions.map(transaction => {
    
                  const participant = vaca.participants?.find(p => p.id === transaction.participant);
                  
                  return (
                    <li key={transaction.id} className="transaction-item">
                      <div className="transaction-icon" style={{backgroundColor: `${vaca.color}20` || '#3F60E520'}}>
                        <FontAwesomeIcon icon={faPiggyBank} style={{color: vaca.color || '#3F60E5'}} />
                      </div>
                      <div className="transaction-info">
                        <p className="transaction-amount">${transaction.amount.toLocaleString()}</p>
                        <p className="transaction-description">{transaction.description}</p>
                        <div className="transaction-details">
                          <p className="transaction-date">{new Date(transaction.date).toLocaleDateString()}</p>
                          {participant && (
                            <p className="transaction-participant">por {participant.name}</p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="no-data-message">
                <p>No hay transacciones registradas</p>
              </div>
            )}
          </div>
        </div>

        {/* Sección de acciones */}
        <div className="vaca-actions">
          <button 
            className="primary-button add-payment-btn" 
            onClick={() => setShowAddPayment(!showAddPayment)}
          >
            {showAddPayment ? 'Cancelar' : 'Añadir pago'}
          </button>
          
          {/* Botón para invitar usuarios - solo visible para el creador */}
          {vaca && user && vaca.user_id === user.id && (
            <button 
              className="secondary-button invite-btn"
              onClick={() => setShowInviteForm(!showInviteForm)}
            >
              <FontAwesomeIcon icon={faUserPlus} />
              {showInviteForm ? 'Cancelar' : 'Invitar usuarios'}
            </button>
          )}
        </div>

        {/* Formulario de invitación */}
        {showInviteForm && vaca && user && (
          <div className="invite-form-container">
            <InviteUsers 
              vacaId={vaca.id}
              userId={user.id}
              onInvitationComplete={handleInvitationComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VacaDetails;