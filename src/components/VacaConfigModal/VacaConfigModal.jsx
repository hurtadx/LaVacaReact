import React from 'react';
import './VacaConfigModal.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave, faSignOutAlt, faCog } from '@fortawesome/free-solid-svg-icons';

const VacaConfigModal = ({ config, setConfig, onSave, onExit, onClose }) => (
  <div className="modal-overlay vaca-config-modal-overlay">
    <div className="modal-content vaca-config-modal">
      <button className="close-modal-btn" onClick={onClose}>
        <FontAwesomeIcon icon={faTimes} />
      </button>
      <h2>
        <FontAwesomeIcon icon={faCog} />
        Configuración de la vaca
      </h2>
      <form className="vaca-config-form" onSubmit={e => { e.preventDefault(); onSave(); }}>
        <div className="form-section">
          <label>¿Quién puede invitar?</label>
          <select value={config.invitePermission} onChange={e => setConfig({ ...config, invitePermission: e.target.value })}>
            <option value="creator">Solo el creador</option>
            <option value="all">Todos los miembros</option>
          </select>
        </div>
        <div className="form-section">
          <label>Monto por aporte:</label>
          <select value={config.amountType} onChange={e => setConfig({ ...config, amountType: e.target.value })}>
            <option value="fixed">Fijo</option>
            <option value="variable">Variable</option>
          </select>
          {config.amountType === 'fixed' && (
            <input type="number" min="0" value={config.fixedAmount} onChange={e => setConfig({ ...config, fixedAmount: e.target.value })} placeholder="Monto fijo ($)" />
          )}
        </div>
        <div className="form-section">
          <label>Frecuencia de aportes:</label>
          <select value={config.frequency} onChange={e => setConfig({ ...config, frequency: e.target.value })}>
            <option value="daily">Diario</option>
            <option value="weekly">Semanal</option>
            <option value="biweekly">Quincenal</option>
            <option value="monthly">Mensual</option>
          </select>
        </div>
        <div className="form-section">
          <label>Fecha límite de pago:</label>
          <select value={config.deadlineType} onChange={e => setConfig({ ...config, deadlineType: e.target.value })}>
            <option value="specific">Día específico</option>
            <option value="n_days">N días después de inicio</option>
          </select>
          {config.deadlineType === 'specific' && (
            <input type="date" value={config.specificDay} onChange={e => setConfig({ ...config, specificDay: e.target.value })} />
          )}
          {config.deadlineType === 'n_days' && (
            <input type="number" min="1" value={config.nDays} onChange={e => setConfig({ ...config, nDays: e.target.value })} placeholder="Número de días" />
          )}
        </div>
        <div className="form-section">
          <label>Porcentaje mínimo de aprobación:</label>
          <select value={config.minApproval} onChange={e => setConfig({ ...config, minApproval: e.target.value })}>
            <option value="51">51%</option>
            <option value="66">66%</option>
            <option value="100">100%</option>
            <option value="custom">Personalizado</option>
          </select>
          {config.minApproval === 'custom' && (
            <input type="number" min="1" max="100" value={config.customApproval} onChange={e => setConfig({ ...config, customApproval: e.target.value })} placeholder="Porcentaje (%)" />
          )}
        </div>
        <div className="form-section">
          <label>Meta de ahorro:</label>
          <select value={config.hasGoal ? 'with' : 'without'} onChange={e => setConfig({ ...config, hasGoal: e.target.value === 'with' })}>
            <option value="with">Con meta</option>
            <option value="without">Sin meta (fondo libre)</option>
          </select>
          {config.hasGoal && (
            <input type="number" min="0" value={config.goalAmount} onChange={e => setConfig({ ...config, goalAmount: e.target.value })} placeholder="Meta de ahorro ($)" />
          )}
        </div>
        <div className="form-section">
          <label>Penalización por retraso:</label>
          <select value={config.penaltyType} onChange={e => setConfig({ ...config, penaltyType: e.target.value })}>
            <option value="none">Sin penalización</option>
            <option value="percent">% sobre el aporte</option>
            <option value="fixed">Monto fijo</option>
          </select>
          {config.penaltyType === 'percent' && (
            <input type="number" min="0" max="100" value={config.penaltyPercent} onChange={e => setConfig({ ...config, penaltyPercent: e.target.value })} placeholder="Porcentaje (%)" />
          )}
          {config.penaltyType === 'fixed' && (
            <input type="number" min="0" value={config.penaltyFixed} onChange={e => setConfig({ ...config, penaltyFixed: e.target.value })} placeholder="Monto fijo ($)" />
          )}
        </div>
        <div className="form-section">
          <label>¿Permitir expulsar miembros?</label>
          <select value={config.kickPolicy} onChange={e => setConfig({ ...config, kickPolicy: e.target.value })}>
            <option value="vote">Mediante votación</option>
            <option value="creator">Solo el creador</option>
            <option value="none">No</option>
          </select>
        </div>
        <div className="form-section">
          <label>¿Puede salir antes del cierre?</label>
          <select value={config.exitPolicy} onChange={e => setConfig({ ...config, exitPolicy: e.target.value })}>
            <option value="refund">Recupera su dinero</option>
            <option value="lose">Pierde lo aportado</option>
            <option value="no">No puede salir</option>
          </select>
        </div>
        
        <div className="modal-actions">
          <button type="submit" className="save-config-btn">
            <FontAwesomeIcon icon={faSave} />
            Guardar
          </button>
          <button type="button" className="exit-vaca-btn" onClick={onExit}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            Salir de la vaca
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default VacaConfigModal;
