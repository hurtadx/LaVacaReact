import React, { createContext, useContext, useState, useCallback } from 'react';
import Notification from './Notification';


export const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [timeoutId, setTimeoutId] = useState(null);

  
  const showNotification = useCallback((message, type = 'success', duration = 5000) => {
    
    if (timeoutId) clearTimeout(timeoutId);
    
    
    setNotification({ 
      message,
      type,
      persistent: duration === 0 
    });
    
    
    if (duration > 0) {
      const id = setTimeout(() => {
        setNotification(null);
      }, duration);
      
      setTimeoutId(id);
    }
  }, [timeoutId]);

  
  const closeNotification = useCallback(() => {
    if (timeoutId) clearTimeout(timeoutId);
    setNotification(null);
    setTimeoutId(null);
  }, [timeoutId]);

  
  const captureError = useCallback((error) => {
    console.error("Error capturado:", error);
    let message;
    
    if (typeof error === 'string') {
      message = error;
    } else if (error && error.message) {
      message = error.message;
      
      
      if (message.includes('network') || message.includes('Network Error')) {
        message = "Error de conexión. Verifica tu internet y vuelve a intentarlo.";
      } else if (message.includes('message channel closed')) {
        message = "Error de comunicación. Por favor, actualiza la página.";
      } else if (message.includes('Invalid login credentials')) {
        message = "Credenciales inválidas. Verifica tu usuario y contraseña.";
      } else if (message.includes('already registered') || message.includes('already in use')) {
        message = "Este email ya está registrado. Por favor inicia sesión.";
      }
    } else {
      message = "Se produjo un error inesperado";
    }
    
    
    showNotification(message, 'error', 8000);
  }, [showNotification]);

  
  React.useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return (
    <NotificationContext.Provider value={{ 
      showNotification, 
      closeNotification, 
      captureError 
    }}>
      {children}
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          persistent={notification.persistent}
          onClose={closeNotification}
        />
      )}
    </NotificationContext.Provider>
  );
};