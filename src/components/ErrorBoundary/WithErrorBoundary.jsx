import React from 'react';
import { useNotification } from '../Notification/NotificationContext';
import ErrorBoundary from './ErrorBoundary';

export const WithErrorBoundary = ({ children }) => {
  const { captureError } = useNotification();
  
  return (
    <ErrorBoundary onError={captureError}>
      {children}
    </ErrorBoundary>
  );
};