import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPiggyBank, faMoneyBillWave, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import './TransactionsList.css';

const TransactionsList = ({ transactions, participants, vacaColor }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="no-data-message">
        <p>No hay transacciones registradas</p>
      </div>
    );
  }

  const getTransactionIcon = (transaction) => {

    if (transaction.type === 'expense') {
      return faArrowDown;
    } else if (transaction.type === 'withdrawal') {
      return faArrowDown;
    } else {
      return faArrowUp; 
    }
  };

  const getTransactionClass = (transaction) => {
    // Determinar la clase CSS según el tipo de transacción
    if (transaction.type === 'expense' || transaction.type === 'withdrawal') {
      return 'negative';
    } else {
      return 'positive';
    }
  };

  return (
    <ul className="transactions-list">
      {transactions.map(transaction => {
        const participant = participants.find(p => p.id === transaction.participant_id);
        const transactionIcon = getTransactionIcon(transaction);
        const transactionClass = getTransactionClass(transaction);
        
        return (
          <li key={transaction.id} className={`transaction-item ${transactionClass}`}>
            <div className="transaction-icon" style={{backgroundColor: `${vacaColor || '#3F60E5'}20`}}>
              <FontAwesomeIcon icon={transactionIcon} style={{color: vacaColor || '#3F60E5'}} />
            </div>
            <div className="transaction-info">
              <p className={`transaction-amount ${transactionClass}`}>
                {transactionClass === 'positive' ? '+' : '-'}${Math.abs(transaction.amount).toLocaleString()}
              </p>
              <p className="transaction-description">{transaction.description}</p>
              <div className="transaction-details">
                <p className="transaction-date">
                  {transaction?.date ? new Date(transaction.date).toLocaleDateString() : 'Fecha desconocida'}
                </p>
                {participant && (
                  <p className="transaction-participant">por {participant.name}</p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default TransactionsList;