import React, { useState, useEffect } from 'react';
import { updateVaca } from '../../../../Services/vacaService';

const RulesOptionsModal = ({ isOpen, onClose, vaca, onVacaUpdated }) => {
  const [formData, setFormData] = useState({
    // Permisos de invitación
    allow_invite_participants: true,
    invite_approval_required: false,
    max_participants: '',
    
    // Contribuciones
    min_contribution_amount: '',
    max_contribution_amount: '',
    fixed_contribution_amount: '',
    contribution_frequency: 'flexible', // 'weekly', 'monthly', 'flexible'
    
    // Fechas límite
    contribution_deadline: '',
    late_penalty_percentage: '',
    allow_late_contributions: true,
    
    // Aprobaciones
    withdrawal_approval_percentage: '50',
    major_changes_approval_percentage: '75',
    
    // Metas y objetivos
    auto_close_when_goal_reached: false,
    allow_overfunding: true,
    refund_on_failure: true,
    
    // Penalizaciones y expulsión
    enable_penalties: false,
    expulsion_approval_percentage: '66',
    
    // Políticas de salida
    exit_penalty_percentage: '',
    exit_notice_days: '7',
    allow_partial_exit: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && vaca) {
      // Cargar configuraciones existentes o valores por defecto
      const settings = vaca.settings || {};
      setFormData({
        allow_invite_participants: settings.allow_invite_participants ?? true,
        invite_approval_required: settings.invite_approval_required ?? false,
        max_participants: settings.max_participants?.toString() || '',
        
        min_contribution_amount: settings.min_contribution_amount?.toString() || '',
        max_contribution_amount: settings.max_contribution_amount?.toString() || '',
        fixed_contribution_amount: settings.fixed_contribution_amount?.toString() || '',
        contribution_frequency: settings.contribution_frequency || 'flexible',
        
        contribution_deadline: settings.contribution_deadline ? settings.contribution_deadline.split('T')[0] : '',
        late_penalty_percentage: settings.late_penalty_percentage?.toString() || '',
        allow_late_contributions: settings.allow_late_contributions ?? true,
        
        withdrawal_approval_percentage: settings.withdrawal_approval_percentage?.toString() || '50',
        major_changes_approval_percentage: settings.major_changes_approval_percentage?.toString() || '75',
        
        auto_close_when_goal_reached: settings.auto_close_when_goal_reached ?? false,
        allow_overfunding: settings.allow_overfunding ?? true,
        refund_on_failure: settings.refund_on_failure ?? true,
        
        enable_penalties: settings.enable_penalties ?? false,
        expulsion_approval_percentage: settings.expulsion_approval_percentage?.toString() || '66',
        
        exit_penalty_percentage: settings.exit_penalty_percentage?.toString() || '',
        exit_notice_days: settings.exit_notice_days?.toString() || '7',
        allow_partial_exit: settings.allow_partial_exit ?? false
      });
      setErrors({});
    }
  }, [isOpen, vaca]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones de porcentajes
    const percentageFields = [
      'late_penalty_percentage',
      'withdrawal_approval_percentage',
      'major_changes_approval_percentage',
      'expulsion_approval_percentage',
      'exit_penalty_percentage'
    ];

    percentageFields.forEach(field => {
      const value = parseFloat(formData[field]);
      if (formData[field] && (isNaN(value) || value < 0 || value > 100)) {
        newErrors[field] = 'Debe ser un porcentaje entre 0 y 100';
      }
    });

    // Validaciones de montos
    if (formData.min_contribution_amount && parseFloat(formData.min_contribution_amount) < 0) {
      newErrors.min_contribution_amount = 'El monto mínimo no puede ser negativo';
    }

    if (formData.max_contribution_amount && parseFloat(formData.max_contribution_amount) < 0) {
      newErrors.max_contribution_amount = 'El monto máximo no puede ser negativo';
    }

    if (formData.min_contribution_amount && formData.max_contribution_amount) {
      const min = parseFloat(formData.min_contribution_amount);
      const max = parseFloat(formData.max_contribution_amount);
      if (min > max) {
        newErrors.max_contribution_amount = 'El monto máximo debe ser mayor al mínimo';
      }
    }

    // Validación de días de aviso
    if (formData.exit_notice_days && parseInt(formData.exit_notice_days) < 0) {
      newErrors.exit_notice_days = 'Los días de aviso no pueden ser negativos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Preparar los datos para enviar
      const settings = {};
      
      // Convertir valores a los tipos correctos
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        
        if (value === '' || value === null || value === undefined) {
          return; // No incluir valores vacíos
        }
        
        // Campos numéricos
        if (['max_participants', 'min_contribution_amount', 'max_contribution_amount', 
             'fixed_contribution_amount', 'late_penalty_percentage', 'withdrawal_approval_percentage',
             'major_changes_approval_percentage', 'expulsion_approval_percentage', 
             'exit_penalty_percentage', 'exit_notice_days'].includes(key)) {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            settings[key] = numValue;
          }
        } else {
          settings[key] = value;
        }
      });

      const result = await updateVaca(vaca.id, { settings });
      
      if (result.success) {
        onVacaUpdated(result.data);
        onClose();
      } else {
        setErrors({ submit: result.error || 'Error al actualizar las reglas' });
      }
    } catch (error) {
      console.error('Error updating vaca rules:', error);
      setErrors({ submit: 'Error al actualizar las reglas. Por favor intenta de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content rules-options-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <i className="fas fa-cogs"></i>
            Reglas y Configuraciones
          </h2>
          <button 
            className="close-btn" 
            onClick={handleClose}
            disabled={isLoading}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {errors.submit && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {errors.submit}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="rules-options-form">
            {/* Permisos de Invitación */}
            <div className="rules-section">
              <h3 className="rules-section-title">
                <i className="fas fa-user-plus"></i>
                Permisos de Invitación
              </h3>
              
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="allow_invite_participants"
                  name="allow_invite_participants"
                  checked={formData.allow_invite_participants}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="allow_invite_participants">
                  Permitir a los participantes invitar a otros
                </label>
              </div>
              
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="invite_approval_required"
                  name="invite_approval_required"
                  checked={formData.invite_approval_required}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="invite_approval_required">
                  Requerir aprobación para nuevas invitaciones
                </label>
              </div>
              
              <div className="rule-item">
                <label htmlFor="max_participants">Máximo de participantes</label>
                <input
                  type="number"
                  id="max_participants"
                  name="max_participants"
                  value={formData.max_participants}
                  onChange={handleInputChange}
                  placeholder="Sin límite"
                  min="2"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Contribuciones */}
            <div className="rules-section">
              <h3 className="rules-section-title">
                <i className="fas fa-money-bill-wave"></i>
                Configuración de Contribuciones
              </h3>
              
              <div className="rules-grid">
                <div className="rule-item">
                  <label htmlFor="min_contribution_amount">Contribución mínima ($)</label>
                  <input
                    type="number"
                    id="min_contribution_amount"
                    name="min_contribution_amount"
                    value={formData.min_contribution_amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    disabled={isLoading}
                    className={errors.min_contribution_amount ? 'error' : ''}
                  />
                  {errors.min_contribution_amount && (
                    <span className="field-error">{errors.min_contribution_amount}</span>
                  )}
                </div>
                
                <div className="rule-item">
                  <label htmlFor="max_contribution_amount">Contribución máxima ($)</label>
                  <input
                    type="number"
                    id="max_contribution_amount"
                    name="max_contribution_amount"
                    value={formData.max_contribution_amount}
                    onChange={handleInputChange}
                    placeholder="Sin límite"
                    min="0"
                    step="0.01"
                    disabled={isLoading}
                    className={errors.max_contribution_amount ? 'error' : ''}
                  />
                  {errors.max_contribution_amount && (
                    <span className="field-error">{errors.max_contribution_amount}</span>
                  )}
                </div>
                
                <div className="rule-item">
                  <label htmlFor="contribution_frequency">Frecuencia de contribución</label>
                  <select
                    id="contribution_frequency"
                    name="contribution_frequency"
                    value={formData.contribution_frequency}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  >
                    <option value="flexible">Flexible</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensual</option>
                  </select>
                </div>
              </div>
              
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="allow_late_contributions"
                  name="allow_late_contributions"
                  checked={formData.allow_late_contributions}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="allow_late_contributions">
                  Permitir contribuciones tardías
                </label>
              </div>
            </div>

            {/* Aprobaciones */}
            <div className="rules-section">
              <h3 className="rules-section-title">
                <i className="fas fa-vote-yea"></i>
                Porcentajes de Aprobación
              </h3>
              
              <div className="rules-grid">
                <div className="rule-item">
                  <label htmlFor="withdrawal_approval_percentage">Retiros (% de aprobación)</label>
                  <input
                    type="number"
                    id="withdrawal_approval_percentage"
                    name="withdrawal_approval_percentage"
                    value={formData.withdrawal_approval_percentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    disabled={isLoading}
                    className={errors.withdrawal_approval_percentage ? 'error' : ''}
                  />
                  {errors.withdrawal_approval_percentage && (
                    <span className="field-error">{errors.withdrawal_approval_percentage}</span>
                  )}
                </div>
                
                <div className="rule-item">
                  <label htmlFor="major_changes_approval_percentage">Cambios mayores (% de aprobación)</label>
                  <input
                    type="number"
                    id="major_changes_approval_percentage"
                    name="major_changes_approval_percentage"
                    value={formData.major_changes_approval_percentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    disabled={isLoading}
                    className={errors.major_changes_approval_percentage ? 'error' : ''}
                  />
                  {errors.major_changes_approval_percentage && (
                    <span className="field-error">{errors.major_changes_approval_percentage}</span>
                  )}
                </div>
                
                <div className="rule-item">
                  <label htmlFor="expulsion_approval_percentage">Expulsión de miembros (% de aprobación)</label>
                  <input
                    type="number"
                    id="expulsion_approval_percentage"
                    name="expulsion_approval_percentage"
                    value={formData.expulsion_approval_percentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    disabled={isLoading}
                    className={errors.expulsion_approval_percentage ? 'error' : ''}
                  />
                  {errors.expulsion_approval_percentage && (
                    <span className="field-error">{errors.expulsion_approval_percentage}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Políticas de Salida */}
            <div className="rules-section">
              <h3 className="rules-section-title">
                <i className="fas fa-sign-out-alt"></i>
                Políticas de Salida
              </h3>
              
              <div className="rules-grid">
                <div className="rule-item">
                  <label htmlFor="exit_notice_days">Días de aviso para salir</label>
                  <input
                    type="number"
                    id="exit_notice_days"
                    name="exit_notice_days"
                    value={formData.exit_notice_days}
                    onChange={handleInputChange}
                    min="0"
                    disabled={isLoading}
                    className={errors.exit_notice_days ? 'error' : ''}
                  />
                  {errors.exit_notice_days && (
                    <span className="field-error">{errors.exit_notice_days}</span>
                  )}
                </div>
                
                <div className="rule-item">
                  <label htmlFor="exit_penalty_percentage">Penalización por salida (% del total)</label>
                  <input
                    type="number"
                    id="exit_penalty_percentage"
                    name="exit_penalty_percentage"
                    value={formData.exit_penalty_percentage}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    placeholder="0"
                    disabled={isLoading}
                    className={errors.exit_penalty_percentage ? 'error' : ''}
                  />
                  {errors.exit_penalty_percentage && (
                    <span className="field-error">{errors.exit_penalty_percentage}</span>
                  )}
                </div>
              </div>
              
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="allow_partial_exit"
                  name="allow_partial_exit"
                  checked={formData.allow_partial_exit}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="allow_partial_exit">
                  Permitir salida parcial (mantener porcentaje)
                </label>
              </div>
            </div>

            {/* Configuraciones Adicionales */}
            <div className="rules-section">
              <h3 className="rules-section-title">
                <i className="fas fa-sliders-h"></i>
                Configuraciones Adicionales
              </h3>
              
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="auto_close_when_goal_reached"
                  name="auto_close_when_goal_reached"
                  checked={formData.auto_close_when_goal_reached}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="auto_close_when_goal_reached">
                  Cerrar automáticamente al alcanzar la meta
                </label>
              </div>
              
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="allow_overfunding"
                  name="allow_overfunding"
                  checked={formData.allow_overfunding}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="allow_overfunding">
                  Permitir recaudar más del objetivo
                </label>
              </div>
              
              <div className="checkbox-item">
                <input
                  type="checkbox"
                  id="refund_on_failure"
                  name="refund_on_failure"
                  checked={formData.refund_on_failure}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <label htmlFor="refund_on_failure">
                  Reembolsar si no se alcanza la meta
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer">
          <button 
            type="button"
            onClick={handleClose}
            className="enhanced-btn enhanced-btn-secondary cancel-btn"
            disabled={isLoading}
          >
            <i className="fas fa-times"></i>
            Cancelar
          </button>
          
          <button 
            type="submit"
            onClick={handleSubmit}
            className="enhanced-btn enhanced-btn-success save-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Guardando...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                Guardar Configuración
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesOptionsModal;
