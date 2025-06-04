import React, { Component } from 'react';
import { NotificationContext } from '../../components/Notification/NotificationContext';

class ErrorBoundary extends Component {
 g
  static contextType = NotificationContext;
  
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error en renderizado:", error, errorInfo);
    
    
    if (this.context && this.context.captureError) {
      this.context.captureError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      
      return (
        <div className="error-container">
          <h2>Algo salió mal</h2>
          <p>Por favor, intenta recargar la página</p>
          <button 
            onClick={() => window.location.reload()}
            className="reload-button"
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;