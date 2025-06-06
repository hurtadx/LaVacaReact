
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReceipt, faFilter, faSearch, faDownload } from '@fortawesome/free-solid-svg-icons';
import { getExpenses, downloadReceipt } from '../../Services/expenseService';
import { formatCurrency, formatDate } from '../../Utils/formatters';
import './ExpensesList.css';

const ExpensesList = ({ vacaId }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    loadExpenses();
  }, [vacaId]);
  
  const loadExpenses = async () => {
    setLoading(true);
    try {
      const { data, error } = await getExpenses(vacaId, filters);
      if (error) throw error;
      
      setExpenses(data || []);
    } catch (err) {
      setError("Error cargando gastos: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const applyFilters = () => {
    loadExpenses();
  };
  
  const resetFilters = () => {
    setFilters({
      category: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      searchTerm: ''
    });
    loadExpenses();
  };
  
  const handleDownloadReceipt = async (receiptId) => {
    try {
      await downloadReceipt(receiptId);
    } catch (err) {
      setError("Error descargando recibo: " + err.message);
    }
  };
  
  if (loading && expenses.length === 0) return <div className="loading">Cargando gastos...</div>;
  if (error) return <div className="error-message">{error}</div>;
  
  return (
    <div className="expenses-container">
      <div className="expenses-header">
        <h3><FontAwesomeIcon icon={faReceipt} /> Gastos y Recibos</h3>
        
        <div className="header-actions">
          <div className="search-box">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Buscar gastos..."
              value={filters.searchTerm}
              name="searchTerm"
              onChange={handleFilterChange}
              onKeyUp={(e) => e.key === 'Enter' && applyFilters()}
            />
          </div>
          
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FontAwesomeIcon icon={faFilter} />
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
        </div>
      </div>
      
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="category">Categoría</label>
              <select 
                id="category"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="">Todas las categorías</option>
                <option value="food">Alimentación</option>
                <option value="transport">Transporte</option>
                <option value="accommodation">Alojamiento</option>
                <option value="entertainment">Entretenimiento</option>
                <option value="other">Otros</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="startDate">Desde</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="endDate">Hasta</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="minAmount">Monto mínimo</label>
              <input
                type="number"
                id="minAmount"
                name="minAmount"
                value={filters.minAmount}
                onChange={handleFilterChange}
                min="0"
                step="0.01"
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="maxAmount">Monto máximo</label>
              <input
                type="number"
                id="maxAmount"
                name="maxAmount"
                value={filters.maxAmount}
                onChange={handleFilterChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="filter-actions">
            <button className="apply-btn" onClick={applyFilters}>Aplicar Filtros</button>
            <button className="reset-btn" onClick={resetFilters}>Resetear</button>
          </div>
        </div>
      )}
      
      {expenses.length === 0 ? (
        <div className="no-expenses">
          <p>No hay gastos registrados aún para esta vaca.</p>
        </div>
      ) : (
        <div className="expenses-list">
          {expenses.map(expense => (
            <div key={expense.id} className="expense-card">
              <div className="expense-header">
                <div className="establishment">{expense.establishment}</div>
                <div className="amount">{formatCurrency(expense.amount)}</div>
              </div>
              
              <div className="expense-details">
                <div className="date-time">
                  <span className="date">{formatDate(expense.date)}</span>
                  <span className="time">{new Date(expense.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                
                <div className="requester">
                  <span className="label">Solicitado por:</span>
                  <span className="value">{expense.requester.username}</span>
                </div>
                
                <div className="description">
                  <p>{expense.description}</p>
                </div>
                
                <div className="vote-result">
                  <span className="label">Resultado:</span>
                  <span className={`value ${expense.voteResult}`}>
                    {expense.voteResult === 'approved' ? 'Aprobado' : 
                     expense.voteResult === 'rejected' ? 'Rechazado' : 
                     'En votación'}
                  </span>
                  {expense.voteCount && (
                    <span className="vote-count">({expense.voteCount.approve}/{expense.voteCount.total})</span>
                  )}
                </div>
              </div>
              
              {expense.hasReceipt && (
                <div className="receipt-actions">
                  <button 
                    className="download-receipt-btn"
                    onClick={() => handleDownloadReceipt(expense.receiptId)}
                  >
                    <FontAwesomeIcon icon={faDownload} /> Ver Recibo Digital
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpensesList;