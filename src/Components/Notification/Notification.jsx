import React from 'react';
import PropTypes from 'prop-types';
import './Notification.css';

const Notification = ({ message, type }) => {
  return (
    <div 
      className={`notification ${type}`}
      role="alert"
      aria-live="assertive"
    >
      <p>{message}</p>
    </div>
  );
};

Notification.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error']).isRequired,
};

export default React.memo(Notification);