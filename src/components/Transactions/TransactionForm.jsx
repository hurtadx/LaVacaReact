import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faReceipt, faPlus, faMoneyBillWave, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { createTransaction } from '../../Services/transactionService';
import { getCurrentUser } from '../../Services/authService';
import { uploadReceipt } from '../../Services/transactionService';
import { getVacaParticipants } from '../../Services/participantService';
import './TransactionForm.css';

const TransactionForm = (props) => {
  const { vacaId, userId: propUserId, participantId: propParticipantId, onSuccess, onCancel } = props;

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
  const [userId, setUserId] = useState(propUserId || null);
  const [participantId, setParticipantId] = useState(propParticipantId || null);
  const [userInfo, setUserInfo] = useState(null);

  // Autocompletar userId y participantId si no vienen como props
  React.useEffect(() => {
    const fetchIds = async () => {
      if (!userId) {
        const { user } = await getCurrentUser();
        if (user?.id) setUserId(user.id);
        if (user) setUserInfo({ name: user.displayName || user.username || user.email, avatar: user.avatar_url });
      }
      if (!participantId && vacaId && (userId || propUserId)) {
        try {
          const { data: participants } = await getVacaParticipants(vacaId);
          if (Array.isArray(participants)) {
            const found = participants.find(p => p.user_id === (userId || propUserId));
            if (found) setParticipantId(found.id);
          }
        } catch (e) { /* ignore */ }
      }
    };
    fetchIds();
    // Solo depende de vacaId, propUserId, userId, propParticipantId
    // para evitar loops infinitos
  }, [vacaId, propUserId, userId, propParticipantId]);
  
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
    // Validación de IDs requeridos
    if (!vacaId || !userId || !participantId) {
      console.warn('[APORTE] Faltan datos requeridos:', { vacaId, userId, participantId });
      setLoading(false);
      return;
    }
    try {
      let receiptId = null;
      if (transactionType === 'expense' && formData.receiptFile) {
        receiptId = await uploadReceiptFile(formData.receiptFile);
      }
      // Ajustar el tipo para el backend
      let backendType = transactionType;
      if (transactionType === 'contribution') backendType = 'aporte';
      // Preparar los datos de la transacción en snake_case y solo columnas válidas
      const transactionPayload = {
        vaca_id: vacaId,
        user_id: userId,
        participant_id: participantId,
        amount: transactionType === 'expense' ? -Math.abs(parseFloat(formData.amount)) : parseFloat(formData.amount),
        description: formData.description,
        type: backendType
      };
      // Si hay recibo y es gasto, puedes agregar receipt_id si tu backend lo soporta
      if (transactionType === 'expense' && receiptId) {
        transactionPayload.receipt_id = receiptId;
      }
      // Si tienes approved_by o date, puedes agregarlos aquí si aplica
      // transactionPayload.date = new Date().toISOString(); // Descomenta si tu backend lo requiere
      // transactionPayload.approved_by = ... // Si aplica
      // Eliminar campos con valor null o undefined
      Object.keys(transactionPayload).forEach(key => {
        if (transactionPayload[key] === null || transactionPayload[key] === undefined) {
          delete transactionPayload[key];
        }
      });
      // Llamar al endpoint correcto para aporte
      if (backendType === 'aporte') {
        const { default: apiService } = await import('../../Services/apiService');
        console.log('[APORTE] Payload enviado al backend:', JSON.stringify(transactionPayload, null, 2));
        const result = await apiService.post('/api/transactions/aporte', transactionPayload);
        console.log('[APORTE] Respuesta backend:', result); // <-- LOG de la respuesta
        if (result.error) throw new Error(result.error || 'Error en el aporte');
        // El backend ahora devuelve transaction, newTotal, username y email
        onSuccess({
          data: result.transaction,
          type: backendType,
          newTotal: result.newTotal,
          username: result.username,
          email: result.email
        });
      } else {
        // Para otros tipos, usar el servicio normal pero pasando solo columnas válidas
        const { default: apiService } = await import('../../Services/apiService');
        console.log('[TRANSACCIÓN] Payload enviado al backend:', JSON.stringify(transactionPayload, null, 2));
        const result = await apiService.post('/api/transactions', transactionPayload);
        if (result.error) throw new Error(result.error);
        onSuccess({ data: result, type: backendType });
      }
    } catch (err) {
      setError(err.message || 'Error al procesar la transacción');
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
        {/* Botón de retiro eliminado */}
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