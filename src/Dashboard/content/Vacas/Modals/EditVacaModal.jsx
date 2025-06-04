import React, { useState, useEffect } from 'react';
import { updateVaca } from '../../../../Services/vacaService';

const EditVacaModal = ({ isOpen, onClose, vaca, onVacaUpdated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal_amount: '',
    due_date: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Inicializar form data cuando se abre el modal
  useEffect(() => {
    if (isOpen && vaca) {
      setFormData({
        name: vaca.name || '',
        description: vaca.description || '',
        goal_amount: vaca.goal_amount?.toString() || '',
        due_date: vaca.due_date ? vaca.due_date.split('T')[0] : ''
      });
      setErrors({});
    }
  }, [isOpen, vaca]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre de la vaca es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.goal_amount || parseFloat(formData.goal_amount) <= 0) {
      newErrors.goal_amount = 'El monto objetivo debe ser mayor a 0';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'La fecha límite es requerida';
    } else {
      const selectedDate = new Date(formData.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        newErrors.due_date = 'La fecha límite debe ser futura';
      }
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
      const updatedData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        goal_amount: parseFloat(formData.goal_amount),
        due_date: formData.due_date
      };

      const result = await updateVaca(vaca.id, updatedData);
      
      if (result.success) {
        onVacaUpdated(result.data);
        onClose();
      } else {
        setErrors({ submit: result.error || 'Error al actualizar la vaca' });
      }
    } catch (error) {
      console.error('Error updating vaca:', error);
      setErrors({ submit: 'Error al actualizar la vaca. Por favor intenta de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        description: '',
        goal_amount: '',
        due_date: ''
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content edit-vaca-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <i className="fas fa-edit"></i>
            Editar Vaca
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
          
          <form onSubmit={handleSubmit} className="edit-vaca-form">
            <div className="form-group">
              <label htmlFor="name">
                <i className="fas fa-tag"></i>
                Nombre de la Vaca
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ej: Viaje a la playa"
                disabled={isLoading}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">
                <i className="fas fa-align-left"></i>
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe el propósito de esta vaca..."
                disabled={isLoading}
                className={errors.description ? 'error' : ''}
                rows="3"
              />
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="goal_amount">
                <i className="fas fa-dollar-sign"></i>
                Monto Objetivo
              </label>
              <input
                type="number"
                id="goal_amount"
                name="goal_amount"
                value={formData.goal_amount}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                disabled={isLoading}
                className={errors.goal_amount ? 'error' : ''}
              />
              {errors.goal_amount && <span className="field-error">{errors.goal_amount}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="due_date">
                <i className="fas fa-calendar-alt"></i>
                Fecha Límite
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                disabled={isLoading}
                className={errors.due_date ? 'error' : ''}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]} // Mínimo mañana
              />
              {errors.due_date && <span className="field-error">{errors.due_date}</span>}
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
            className="enhanced-btn enhanced-btn-primary save-btn"
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
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVacaModal;
