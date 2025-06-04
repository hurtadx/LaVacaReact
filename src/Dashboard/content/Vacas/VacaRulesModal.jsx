/* VacaRulesModal.jsx - Modal de configuración de reglas */
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faCog, 
  faUsers, 
  faMoney, 
  faCalendar, 
  faPercentage, 
  faTarget, 
  faShield, 
  faSignOutAlt,
  faSave
} from '@fortawesome/free-solid-svg-icons';
import './VacaRulesModal.css';

const VacaRulesModal = ({ 
  vaca, 
  isOpen, 
  onClose, 
  onRulesUpdate, 
  onLeaveVaca,
  isOwner,
  currentUserId 
}) => {
  const [rules, setRules] = useState({
    // Permisos
    canInvite: 'owner', // 'owner' | 'all'
    
    // Aportes
    contributionType: 'variable', // 'fixed' | 'variable'
    fixedAmount: 0,
    
    // Frecuencia
    frequency: 'monthly', // 'daily' | 'weekly' | 'biweekly' | 'monthly'
    
    // Fecha límite de pago
    paymentDeadlineType: 'specific', // 'specific' | 'after_cycle'
    specificDay: 5,
    daysAfterCycle: 3,
    
    // Aprobación
    approvalPercentage: 51,
    
    // Meta y objetivo
    hasGoal: true,
    goalAmount: 0,
    purpose: 'other', // 'travel' | 'gift' | 'event' | 'emergency' | 'other'
    customPurpose: '',
    
    // Penalizaciones
    penaltyType: 'none', // 'none' | 'percentage' | 'fixed'
    penaltyPercentage: 0,
    penaltyAmount: 0,
    
    // Expulsión
    canExpelMembers: 'vote', // 'vote' | 'owner' | 'none'
    
    // Salida
    canLeaveEarly: 'recover', // 'recover' | 'lose' | 'cannot'
  });
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('permissions');

  useEffect(() => {
    if (vaca && isOpen) {
      // Cargar reglas existentes de la vaca
      setRules(prev => ({
        ...prev,
        hasGoal: !!vaca.goal,
        goalAmount: vaca.goal || 0,
        // Aquí puedes cargar otras reglas desde vaca.rules si las tienes almacenadas
        ...vaca.rules
      }));
    }
  }, [vaca, isOpen]);

  const handleRuleChange = (key, value) => {
    setRules(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveRules = async () => {
    setLoading(true);
    try {
      await onRulesUpdate(rules);
      onClose();
    } catch (error) {
      console.error('Error updating rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveVaca = () => {
    if (rules.canLeaveEarly === 'cannot') {
      alert('Las reglas de esta vaca no permiten salir antes del cierre.');
      return;
    }
    
    const message = rules.canLeaveEarly === 'recover' 
      ? '¿Estás seguro de que quieres salir? Recuperarás tu dinero aportado.'
      : '¿Estás seguro de que quieres salir? Perderás todo lo aportado.';
    
    if (window.confirm(message)) {
      onLeaveVaca();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="vaca-rules-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FontAwesomeIcon icon={faCog} /> Configuración de la Vaca
          </h2>
          <button className="close-btn" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'permissions' ? 'active' : ''}`}
            onClick={() => setActiveTab('permissions')}
          >
            <FontAwesomeIcon icon={faUsers} /> Permisos
          </button>
          <button 
            className={`tab-btn ${activeTab === 'contributions' ? 'active' : ''}`}
            onClick={() => setActiveTab('contributions')}
          >
            <FontAwesomeIcon icon={faMoney} /> Aportes
          </button>
          <button 
            className={`tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            <FontAwesomeIcon icon={faTarget} /> Objetivos
          </button>
          <button 
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <FontAwesomeIcon icon={faShield} /> Seguridad
          </button>
          {!isOwner && (
            <button 
              className={`tab-btn ${activeTab === 'leave' ? 'active' : ''}`}
              onClick={() => setActiveTab('leave')}
            >
              <FontAwesomeIcon icon={faSignOutAlt} /> Salir
            </button>
          )}
        </div>

        <div className="modal-content">
          {activeTab === 'permissions' && (
            <div className="rules-section">
              <h3>¿Quién puede invitar?</h3>
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    name="canInvite" 
                    value="owner"
                    checked={rules.canInvite === 'owner'}
                    onChange={e => handleRuleChange('canInvite', e.target.value)}
                    disabled={!isOwner}
                  />
                  Solo el creador
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="canInvite" 
                    value="all"
                    checked={rules.canInvite === 'all'}
                    onChange={e => handleRuleChange('canInvite', e.target.value)}
                    disabled={!isOwner}
                  />
                  Todos los miembros
                </label>
              </div>

              <h3>¿Permitir expulsar miembros?</h3>
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    name="canExpelMembers" 
                    value="vote"
                    checked={rules.canExpelMembers === 'vote'}
                    onChange={e => handleRuleChange('canExpelMembers', e.target.value)}
                    disabled={!isOwner}
                  />
                  Sí, mediante votación
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="canExpelMembers" 
                    value="owner"
                    checked={rules.canExpelMembers === 'owner'}
                    onChange={e => handleRuleChange('canExpelMembers', e.target.value)}
                    disabled={!isOwner}
                  />
                  Solo el creador
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="canExpelMembers" 
                    value="none"
                    checked={rules.canExpelMembers === 'none'}
                    onChange={e => handleRuleChange('canExpelMembers', e.target.value)}
                    disabled={!isOwner}
                  />
                  No
                </label>
              </div>
            </div>
          )}

          {activeTab === 'contributions' && (
            <div className="rules-section">
              <h3>Monto por aporte</h3>
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    name="contributionType" 
                    value="fixed"
                    checked={rules.contributionType === 'fixed'}
                    onChange={e => handleRuleChange('contributionType', e.target.value)}
                    disabled={!isOwner}
                  />
                  Fijo
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="contributionType" 
                    value="variable"
                    checked={rules.contributionType === 'variable'}
                    onChange={e => handleRuleChange('contributionType', e.target.value)}
                    disabled={!isOwner}
                  />
                  Variable (cada quien decide)
                </label>
              </div>
              
              {rules.contributionType === 'fixed' && (
                <div className="input-group">
                  <label>Monto fijo:</label>
                  <input 
                    type="number" 
                    value={rules.fixedAmount}
                    onChange={e => handleRuleChange('fixedAmount', Number(e.target.value))}
                    disabled={!isOwner}
                    placeholder="Ej: 10000"
                  />
                </div>
              )}

              <h3>Frecuencia de aportes</h3>
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    name="frequency" 
                    value="daily"
                    checked={rules.frequency === 'daily'}
                    onChange={e => handleRuleChange('frequency', e.target.value)}
                    disabled={!isOwner}
                  />
                  Diario
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="frequency" 
                    value="weekly"
                    checked={rules.frequency === 'weekly'}
                    onChange={e => handleRuleChange('frequency', e.target.value)}
                    disabled={!isOwner}
                  />
                  Semanal
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="frequency" 
                    value="biweekly"
                    checked={rules.frequency === 'biweekly'}
                    onChange={e => handleRuleChange('frequency', e.target.value)}
                    disabled={!isOwner}
                  />
                  Quincenal
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="frequency" 
                    value="monthly"
                    checked={rules.frequency === 'monthly'}
                    onChange={e => handleRuleChange('frequency', e.target.value)}
                    disabled={!isOwner}
                  />
                  Mensual
                </label>
              </div>

              <h3>Porcentaje mínimo de aprobación para retirar</h3>
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    name="approvalPercentage" 
                    value="51"
                    checked={rules.approvalPercentage === 51}
                    onChange={e => handleRuleChange('approvalPercentage', Number(e.target.value))}
                    disabled={!isOwner}
                  />
                  51%
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="approvalPercentage" 
                    value="66"
                    checked={rules.approvalPercentage === 66}
                    onChange={e => handleRuleChange('approvalPercentage', Number(e.target.value))}
                    disabled={!isOwner}
                  />
                  66%
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="approvalPercentage" 
                    value="100"
                    checked={rules.approvalPercentage === 100}
                    onChange={e => handleRuleChange('approvalPercentage', Number(e.target.value))}
                    disabled={!isOwner}
                  />
                  100%
                </label>
              </div>
            </div>
          )}

          {activeTab === 'goals' && (
            <div className="rules-section">
              <h3>Meta de ahorro</h3>
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    name="hasGoal" 
                    value="true"
                    checked={rules.hasGoal}
                    onChange={e => handleRuleChange('hasGoal', e.target.value === 'true')}
                    disabled={!isOwner}
                  />
                  Con meta
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="hasGoal" 
                    value="false"
                    checked={!rules.hasGoal}
                    onChange={e => handleRuleChange('hasGoal', e.target.value === 'true')}
                    disabled={!isOwner}
                  />
                  Sin meta (fondo libre)
                </label>
              </div>

              {rules.hasGoal && (
                <div className="input-group">
                  <label>Monto de la meta:</label>
                  <input 
                    type="number" 
                    value={rules.goalAmount}
                    onChange={e => handleRuleChange('goalAmount', Number(e.target.value))}
                    disabled={!isOwner}
                    placeholder="Ej: 1000000"
                  />
                </div>
              )}

              <h3>Motivo del fondo</h3>
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    name="purpose" 
                    value="travel"
                    checked={rules.purpose === 'travel'}
                    onChange={e => handleRuleChange('purpose', e.target.value)}
                    disabled={!isOwner}
                  />
                  Viaje
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="purpose" 
                    value="gift"
                    checked={rules.purpose === 'gift'}
                    onChange={e => handleRuleChange('purpose', e.target.value)}
                    disabled={!isOwner}
                  />
                  Regalo
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="purpose" 
                    value="event"
                    checked={rules.purpose === 'event'}
                    onChange={e => handleRuleChange('purpose', e.target.value)}
                    disabled={!isOwner}
                  />
                  Evento
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="purpose" 
                    value="emergency"
                    checked={rules.purpose === 'emergency'}
                    onChange={e => handleRuleChange('purpose', e.target.value)}
                    disabled={!isOwner}
                  />
                  Emergencia
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="purpose" 
                    value="other"
                    checked={rules.purpose === 'other'}
                    onChange={e => handleRuleChange('purpose', e.target.value)}
                    disabled={!isOwner}
                  />
                  Otro
                </label>
              </div>

              {rules.purpose === 'other' && (
                <div className="input-group">
                  <label>Motivo personalizado:</label>
                  <input 
                    type="text" 
                    value={rules.customPurpose}
                    onChange={e => handleRuleChange('customPurpose', e.target.value)}
                    disabled={!isOwner}
                    placeholder="Describe el motivo..."
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="rules-section">
              <h3>Penalización por retraso</h3>
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    name="penaltyType" 
                    value="none"
                    checked={rules.penaltyType === 'none'}
                    onChange={e => handleRuleChange('penaltyType', e.target.value)}
                    disabled={!isOwner}
                  />
                  Sin penalización
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="penaltyType" 
                    value="percentage"
                    checked={rules.penaltyType === 'percentage'}
                    onChange={e => handleRuleChange('penaltyType', e.target.value)}
                    disabled={!isOwner}
                  />
                  % sobre el aporte
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="penaltyType" 
                    value="fixed"
                    checked={rules.penaltyType === 'fixed'}
                    onChange={e => handleRuleChange('penaltyType', e.target.value)}
                    disabled={!isOwner}
                  />
                  Monto fijo adicional
                </label>
              </div>

              {rules.penaltyType === 'percentage' && (
                <div className="input-group">
                  <label>Porcentaje de penalización:</label>
                  <input 
                    type="number" 
                    value={rules.penaltyPercentage}
                    onChange={e => handleRuleChange('penaltyPercentage', Number(e.target.value))}
                    disabled={!isOwner}
                    placeholder="Ej: 5"
                    min="0"
                    max="100"
                  />
                </div>
              )}

              {rules.penaltyType === 'fixed' && (
                <div className="input-group">
                  <label>Monto fijo de penalización:</label>
                  <input 
                    type="number" 
                    value={rules.penaltyAmount}
                    onChange={e => handleRuleChange('penaltyAmount', Number(e.target.value))}
                    disabled={!isOwner}
                    placeholder="Ej: 1000"
                  />
                </div>
              )}

              <h3>Salida de la vaca</h3>
              <div className="radio-group">
                <label>
                  <input 
                    type="radio" 
                    name="canLeaveEarly" 
                    value="recover"
                    checked={rules.canLeaveEarly === 'recover'}
                    onChange={e => handleRuleChange('canLeaveEarly', e.target.value)}
                    disabled={!isOwner}
                  />
                  Sí, recupera su dinero
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="canLeaveEarly" 
                    value="lose"
                    checked={rules.canLeaveEarly === 'lose'}
                    onChange={e => handleRuleChange('canLeaveEarly', e.target.value)}
                    disabled={!isOwner}
                  />
                  Sí, pero pierde lo aportado
                </label>
                <label>
                  <input 
                    type="radio" 
                    name="canLeaveEarly" 
                    value="cannot"
                    checked={rules.canLeaveEarly === 'cannot'}
                    onChange={e => handleRuleChange('canLeaveEarly', e.target.value)}
                    disabled={!isOwner}
                  />
                  No puede salir hasta el cierre
                </label>
              </div>
            </div>
          )}

          {activeTab === 'leave' && !isOwner && (
            <div className="rules-section">
              <h3>Salir de esta vaca</h3>
              <p className="leave-warning">
                {rules.canLeaveEarly === 'recover' && 
                  'Si sales ahora, recuperarás todo el dinero que has aportado.'
                }
                {rules.canLeaveEarly === 'lose' && 
                  'Si sales ahora, perderás todo el dinero que has aportado.'
                }
                {rules.canLeaveEarly === 'cannot' && 
                  'Las reglas de esta vaca no permiten salir antes del cierre.'
                }
              </p>
              
              <button 
                className="leave-vaca-btn"
                onClick={handleLeaveVaca}
                disabled={rules.canLeaveEarly === 'cannot'}
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                Salir de la vaca
              </button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancelar
          </button>
          {isOwner && (
            <button 
              className="save-btn" 
              onClick={handleSaveRules}
              disabled={loading}
            >
              <FontAwesomeIcon icon={loading ? faSpinner : faSave} spin={loading} />
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VacaRulesModal;
