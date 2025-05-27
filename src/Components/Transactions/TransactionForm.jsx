import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faReceipt, faPlus, faMoneyBillWave, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { createTransaction, getTransactionTypes } from '../../Services/transactionService';
import { getCurrentUser } from '../../Services/authService';
import { uploadReceipt } from '../../Services/transactionService';
import './TransactionForm.css';

const TransactionForm = ({ vacaId, userId, participantId, onSuccess, onCancel }) => {
  const [transactionType, setTransactionType] = useState('contribution');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    receiptFile: null,
    withdrawalType: 'personal'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transactionTypes, setTransactionTypes] = useState([]);
  
  useEffect(() => {
 
    const loadTransactionTypes = async () => {
      try {
        const { data } = await getTransactionTypes();
        if (data) {
          setTransactionTypes(data);
        }
      } catch (error) {
        console.error("Error cargando tipos de transacción:", error);
      }
    };
    
    loadTransactionTypes();
  }, []);
  
  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    
    if (name === 'receiptFile' && files?.length) {
      setFormData(prev => ({
        ...prev,
        receiptFile: files[0]
      }));
    } else if (type === 'radio') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
    const uploadReceiptFile = async (file) => {
    if (!file) return null;
    
    setUploadProgress(0);
    
    try {
      const filePath = await uploadReceipt(file, vacaId, (progress) => {
        const percent = Math.round((progress.loaded / progress.total) * 100);
        setUploadProgress(percent);
      });
      
      return filePath;
    } catch (error) {
      console.error("Error uploading receipt:", error);
      throw error;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let receiptId = null;
        // Si es un gasto y tiene recibo adjunto, subirlo
      if (transactionType === 'expense' && formData.receiptFile) {
        receiptId = await uploadReceiptFile(formData.receiptFile);
      }
      
      // Preparar los datos de la transacción
      const transactionData = {
        vacaId,
        userId,
        participantId,
        amount: parseFloat(formData.amount),
        description: formData.description,
        type: transactionType,
        category: formData.category,
        receiptId,
        withdrawalType: formData.withdrawalType
      };
      
      // Ajustar el signo del monto según el tipo de transacción
      if (transactionType === 'expense' || transactionType === 'withdrawal') {
        transactionData.amount = -Math.abs(transactionData.amount);
      }
      
      const { data, error, newTotal } = await createTransaction(transactionData);
      
      if (error) throw new Error(error);
      
      onSuccess({
        data,
        type: transactionType,
        newTotal
      });
    } catch (err) {
      setError(err.message || "Error al procesar la transacción");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };
  
  return (
    <div className="transaction-form">
      <h3>
        <FontAwesomeIcon icon={faPlus} /> 
        {transactionType === 'contribution' ? 'Realizar Aporte' : 
         transactionType === 'expense' ? 'Registrar Gasto' : 
         'Solicitar Retiro'}
      </h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="transaction-type-selector">
        <button 
          type="button"
          className={`type-btn ${transactionType === 'contribution' ? 'active' : ''}`}
          onClick={() => setTransactionType('contribution')}
        >
          <FontAwesomeIcon icon={faArrowUp} /> Aporte
        </button>
        <button 
          type="button"
          className={`type-btn ${transactionType === 'expense' ? 'active' : ''}`}
          onClick={() => setTransactionType('expense')}
        >
          <FontAwesomeIcon icon={faReceipt} /> Gasto
        </button>
        <button 
          type="button"
          className={`type-btn ${transactionType === 'withdrawal' ? 'active' : ''}`}
          onClick={() => setTransactionType('withdrawal')}
        >
          <FontAwesomeIcon icon={faArrowDown} /> Retiro
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Campo de monto - común para todos los tipos */}
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
        
        {/* Campos específicos para gastos */}
        {transactionType === 'expense' && (
          <>
            <div className="form-group">
              <label htmlFor="category">Categoría</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar categoría</option>
                <option value="food">Alimentación</option>
                <option value="transport">Transporte</option>
                <option value="accommodation">Alojamiento</option>
                <option value="entertainment">Entretenimiento</option>
                <option value="other">Otros</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="receiptFile" className="receipt-label">
                <FontAwesomeIcon icon={faReceipt} /> Adjuntar Recibo Digital
              </label>
              <input
                type="file"
                id="receiptFile"
                name="receiptFile"
                accept="image/*,.pdf"
                onChange={handleChange}
                className="file-input"
              />
              
              {formData.receiptFile && (
                <div className="file-preview">
                  Archivo seleccionado: {formData.receiptFile.name}
                </div>
              )}
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{width: `${uploadProgress}%`}}
                    ></div>
                  </div>
                  <span>{uploadProgress}%</span>
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Campos específicos para retiros */}
        {transactionType === 'withdrawal' && (
          <div className="form-group">
            <label>Tipo de Retiro</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="withdrawalType"
                  value="personal"
                  checked={formData.withdrawalType === 'personal'}
                  onChange={handleChange}
                />
                Personal (solo mis fondos)
              </label>
              <label>
                <input
                  type="radio"
                  name="withdrawalType"
                  value="community"
                  checked={formData.withdrawalType === 'community'}
                  onChange={handleChange}
                />
                Comunitario (requiere votación)
              </label>
            </div>
          </div>
        )}
        
        {/* Descripción - común para todos los tipos */}
        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            required
            placeholder={
              transactionType === 'contribution' ? "Describe tu aporte..." :
              transactionType === 'expense' ? "Describe el gasto..." :
              "Describe el motivo del retiro..."
            }
          ></textarea>
        </div>
        
        {/* Botones de acción */}
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
            {loading ? "Procesando..." : 
             transactionType === 'contribution' ? "Confirmar Aporte" :
             transactionType === 'expense' ? "Registrar Gasto" :
             "Solicitar Retiro"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;