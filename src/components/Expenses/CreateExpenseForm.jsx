import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faReceipt, faPlus } from '@fortawesome/free-solid-svg-icons';
import { createExpense } from '../../Services/expenseService';
import './CreateExpenseForm.css';

const CreateExpenseForm = ({ vacaId, userId, participantId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'other',
    receiptFile: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'receiptFile' && files && files[0]) {
      setFormData(prev => ({
        ...prev,
        receiptFile: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const uploadReceipt = async (file) => {
    if (!file) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `receipts/${vacaId}/${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('receipts')
      .upload(filePath, file, {
        onUploadProgress: (progress) => {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          setUploadProgress(percent);
        }
      });
    
    if (error) throw error;
    
    return filePath;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let receiptId = null;
      
      if (formData.receiptFile) {
        receiptId = await uploadReceipt(formData.receiptFile);
      }
      
      const expenseData = {
        userId,
        participantId,
        vacaId,
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        receiptId
      };
      
      const { data, error } = await createExpense(expenseData);
      if (error) throw error;
      
      onSuccess(data);
    } catch (err) {
      setError("Error al crear gasto: " + err.message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };
  
  return (
    <div className="create-expense-form">
      <h3><FontAwesomeIcon icon={faPlus} /> Registrar Gasto</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="amount">Monto</label>
          <div className="amount-input">
            <span className="currency-symbol">$</span>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="1"
              step="0.01"
              required
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Categoría</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="food">Alimentación</option>
            <option value="transport">Transporte</option>
            <option value="accommodation">Alojamiento</option>
            <option value="entertainment">Entretenimiento</option>
            <option value="other">Otros</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            required
            placeholder="Describe el gasto..."
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="receiptFile" className="receipt-label">
            <FontAwesomeIcon icon={faReceipt} /> Adjuntar Recibo Digital
          </label>
          <div className="receipt-upload">
            <input
              type="file"
              id="receiptFile"
              name="receiptFile"
              accept="image/*,.pdf"
              onChange={handleChange}
              className="file-input"
            />
            <div className="receipt-preview">
              {formData.receiptFile ? (
                <div className="selected-file">
                  <span className="file-name">{formData.receiptFile.name}</span>
                  <span className="file-size">
                    {(formData.receiptFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ) : (
                <span className="no-file">Ningún archivo seleccionado</span>
              )}
            </div>
          </div>
          
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
              </div>
              <span>{uploadProgress}%</span>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            <FontAwesomeIcon icon={faTimes} /> Cancelar
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faSave} /> 
            {loading ? "Guardando..." : "Guardar Gasto"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateExpenseForm;