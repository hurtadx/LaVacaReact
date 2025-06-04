import React, { useState, useEffect } from 'react';
import { removeVacaParticipant } from '../../../../Services/vacaService';
import { useAuth } from '../../../../components/AuthForm/ProtectedRoutes';

const ExitVacaModal = ({ isOpen, onClose, vaca, onExitSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    confirmExit: false,
    reason: '',
    notifyOthers: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userContribution, setUserContribution] = useState(0);
  const [refundAmount, setRefundAmount] = useState(0);
  const [penalties, setPenalties] = useState(0);

  useEffect(() => {
    if (isOpen && vaca && user) {
      // Calcular la contribución del usuario actual
      const participant = vaca.participants?.find(p => p.user_id === user.id);
      const contribution = participant?.total_contributed || 0;
      setUserContribution(contribution);

      // Calcular penalizaciones y reembolso
      const settings = vaca.settings || {};
      const exitPenaltyPercentage = settings.exit_penalty_percentage || 0;
      const penaltyAmount = (contribution * exitPenaltyPercentage) / 100;
      const refund = Math.max(0, contribution - penaltyAmount);

      setPenalties(penaltyAmount);
      setRefundAmount(refund);

      // Resetear form
      setFormData({
        confirmExit: false,
        reason: '',
        notifyOthers: true
      });
      setError('');
    }
  }, [isOpen, vaca, user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.confirmExit) {
      setError('Debes confirmar que entiendes las consecuencias de salir de la vaca');
      return;
    }

    if (!formData.reason.trim()) {
      setError('Por favor proporciona una razón para salir de la vaca');
      return;
    }

    setIsLoading(true);
    
    try {
      const exitData = {
        user_id: user.id,
        reason: formData.reason.trim(),
        notify_others: formData.notifyOthers,
        exit_type: 'voluntary'
      };

      const result = await removeVacaParticipant(vaca.id, user.id, exitData);
      
      if (result.success) {
        onExitSuccess({
          refundAmount,
          penalties,
          reason: formData.reason
        });
        onClose();
      } else {
        setError(result.error || 'Error al salir de la vaca');
      }
    } catch (error) {
      console.error('Error exiting vaca:', error);
      setError('Error al procesar la salida. Por favor intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        confirmExit: false,
        reason: '',
        notifyOthers: true
      });
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const settings = vaca?.settings || {};
  const exitNoticeDays = settings.exit_notice_days || 0;
  const exitPenaltyPercentage = settings.exit_penalty_percentage || 0;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content exit-vaca-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <i className="fas fa-sign-out-alt"></i>
            Salir de la Vaca
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
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {/* Advertencia principal */}
          <div className="exit-warning">
            <div className="exit-warning-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="exit-warning-text">
              <strong>¡Atención!</strong> Estás a punto de salir de la vaca "{vaca?.name}". 
              Esta acción afectará tu participación y puede tener consecuencias financieras.
            </div>
          </div>

          {/* Información financiera */}
          <div className="exit-financial-info">
            <div className="financial-item">
              <span className="label">Tu contribución total:</span>
              <span className="amount positive">${userContribution.toFixed(2)}</span>
            </div>
            
            {exitPenaltyPercentage > 0 && (
              <div className="financial-item">
                <span className="label">Penalización por salida ({exitPenaltyPercentage}%):</span>
                <span className="amount negative">-${penalties.toFixed(2)}</span>
              </div>
            )}
            
            <div className="financial-item total">
              <span className="label">Monto a reembolsar:</span>
              <span className="amount">${refundAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Consecuencias */}
          <div className="exit-consequences">
            <div className="exit-consequences-title">
              <i className="fas fa-info-circle"></i>
              Consecuencias de salir:
            </div>
            <ul>
              <li>Perderás acceso inmediato a la vaca y sus beneficios</li>
              <li>No podrás participar en futuras votaciones o decisiones</li>
              {exitPenaltyPercentage > 0 && (
                <li>Se aplicará una penalización del {exitPenaltyPercentage}% sobre tu contribución</li>
              )}
              {exitNoticeDays > 0 && (
                <li>El reembolso se procesará en {exitNoticeDays} días</li>
              )}
              <li>No podrás volver a unirte a esta vaca una vez que salgas</li>
              {refundAmount < userContribution && (
                <li>Perderás ${(userContribution - refundAmount).toFixed(2)} de tu contribución total</li>
              )}
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="exit-form">
            <div className="form-group">
              <label htmlFor="reason">
                <i className="fas fa-comment"></i>
                Razón para salir (requerido)
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                placeholder="Explica brevemente por qué deseas salir de esta vaca..."
                disabled={isLoading}
                rows="3"
                required
              />
            </div>

            <div className="checkbox-item">
              <input
                type="checkbox"
                id="notifyOthers"
                name="notifyOthers"
                checked={formData.notifyOthers}
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <label htmlFor="notifyOthers">
                Notificar a otros participantes sobre mi salida
              </label>
            </div>

            <div className="exit-confirmation">
              <label htmlFor="confirmExit">
                <input
                  type="checkbox"
                  id="confirmExit"
                  name="confirmExit"
                  checked={formData.confirmExit}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
                <strong>Confirmo que entiendo las consecuencias y deseo salir de esta vaca</strong>
              </label>
            </div>
          </form>

          {exitNoticeDays > 0 && (
            <div className="exit-notice">
              <i className="fas fa-clock"></i>
              <span>
                Período de aviso: {exitNoticeDays} días. 
                Tu salida será efectiva después de este período.
              </span>
            </div>
          )}
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
            className="enhanced-btn enhanced-btn-danger exit-btn"
            disabled={isLoading || !formData.confirmExit || !formData.reason.trim()}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Procesando...
              </>
            ) : (
              <>
                <i className="fas fa-sign-out-alt"></i>
                Confirmar Salida
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitVacaModal;
