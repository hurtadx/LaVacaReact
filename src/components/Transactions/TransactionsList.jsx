import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import './TransactionsList.css';

const TransactionsList = ({ transactions, participants, vacaColor }) => {
  console.log('[TransactionsList] Rendered with transactions:', transactions);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="no-data-message">
        <p>No hay transacciones registradas</p>
      </div>
    );
  }

  const getTransactionIcon = (transaction) => {
    if (transaction.type === 'expense' || transaction.type === 'withdrawal') {
      return faArrowDown;
    } else {
      return faArrowUp;
    }
  };

  const getTransactionClass = (transaction) => {
    if (transaction.type === 'expense' || transaction.type === 'withdrawal') {
      return 'negative';
    } else {
      return 'positive';
    }
  };

  const getTransactionTypeLabel = (transaction) => {
    if (transaction.type === 'expense' || transaction.type === 'withdrawal') {
      return 'Gasto';
    } else if (transaction.type === 'contribution') {
      return 'Aporte';
    } else {
      return transaction.type;
    }
  };

  return (
    <div className="transactions-container">
      <div className="transactions-header">
        <h3>Transacciones</h3>
      </div>
      <div className="transactions-list">
        {transactions.map(transaction => {
          const participant = participants.find(p => p.id === transaction.participant_id);
          const transactionIcon = getTransactionIcon(transaction);
          const transactionClass = getTransactionClass(transaction);
          const typeLabel = getTransactionTypeLabel(transaction);
          return (
            <div key={transaction.id} className={`transaction-card ${transactionClass}`}>
              <div className="transaction-card-header">
                <div className="transaction-icon" style={{backgroundColor: `${vacaColor || '#3F60E5'}20`}}>
                  <FontAwesomeIcon icon={transactionIcon} style={{color: vacaColor || '#3F60E5'}} />
                </div>
                <div className="transaction-amount-type">
                  <span className={`transaction-amount ${transactionClass}`}>
                    {transactionClass === 'positive' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
                  </span>
                  <span className="transaction-type-label">{typeLabel}</span>
                </div>
              </div>
              <div className="transaction-card-body">
                <div className="transaction-description">{transaction.description}</div>
                <div className="transaction-details">
                  <span className="transaction-date">
                    {transaction?.date ? new Date(transaction.date).toLocaleDateString() : 'Fecha desconocida'}
                  </span>
                  {participant && (
                    <span className="transaction-participant">por {participant.name}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionsList;