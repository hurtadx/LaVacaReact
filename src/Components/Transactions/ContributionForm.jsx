
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoneyBillWave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { createContribution } from '../../Services/transactionService';
import './ContributionForm.css';

const ContributionForm = ({ vacaId, userId, onSuccess, onCancel }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await createContribution({
        vacaId,
        userId,
        amount: parseFloat(amount),
        paymentMethod,
        date: new Date().toISOString()
      });
      
      if (result.error) throw new Error(result.error.message);
      
      onSuccess(result.data);
    } catch (err) {
      setError(err.message || 'Error al realizar el aporte');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="contribution-form">
      <h3><FontAwesomeIcon icon={faMoneyBillWave} /> Realizar Aporte</h3>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="amount">Monto a aportar</label>
          <div className="amount-input">
            <span className="currency-symbol">$</span>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              step="0.01"
              required
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Método de pago</label>
          <div className="payment-methods">
            <button
              type="button"
              className={`payment-method-btn ${paymentMethod === 'card' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('card')}
            >
              Tarjeta
            </button>
            <button
              type="button"
              className={`payment-method-btn ${paymentMethod === 'transfer' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('transfer')}
            >
              Transferencia
            </button>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={onCancel}
          >
            <FontAwesomeIcon icon={faTimes} /> Cancelar
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={!amount || !paymentMethod || loading}
          >
            {loading ? 'Procesando...' : 'Confirmar Aporte'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContributionForm;

