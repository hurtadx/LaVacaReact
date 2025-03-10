import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import AuthForm from '../Components/AuthForm/AuthForm';
import Header from '../Layout/header/Header';
import Footer from '../Layout/Footer/Footer';
import AnimatedCarrousel from '../Components/AnimatedCarrousel/AnimatedCarrousel';
import Dashboard from '../Dashboard/Dashboard';
import { NotificationProvider, useNotification } from '../Components/Notification/NotificationContext';
import { checkTablesExist } from "../Supabase/services/vacaService"
import ErrorBoundary from '../Components/ErrorBoundary/ErrorBoundary';

const ErrorHandler = () => {
  const { captureError } = useNotification();
  
  useEffect(() => {
    const handleGlobalError = (event) => {
      console.error("Error global capturado:", event.error);
      captureError(event.error);
    };
    
    const handleUnhandledRejection = (event) => {
      console.error("Promesa rechazada no manejada:", event.reason);
      captureError(event.reason);
    };
    
    // Agregar listeners
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Limpiar al desmontar
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [captureError]);
  
  return null; // Este componente no renderiza nada
};

const AppContent = () => {
  const location = useLocation();
  const [authType, setAuthType] = useState('login');
  const [dbChecked, setDbChecked] = useState(false);
  const { showNotification, captureError } = useNotification();

  const handleTypeChange = () => setAuthType(prev => prev === 'login' ? 'register' : 'login');

  useEffect(() => {
    async function verifyDatabaseSetup() {
      try {
        const tablesExist = await checkTablesExist();
        
        const allExist = tablesExist.vacas && 
                        tablesExist.participants && 
                        tablesExist.transactions;
        
        if (!allExist) {
          showNotification(
            "Algunas tablas no existen en la base de datos. Contacta al administrador.", 
            "error"
          );
          console.error("Tablas faltantes:", 
            Object.entries(tablesExist)
              .filter(([_, exists]) => !exists)
              .map(([table]) => table)
          );
        }
      } catch (error) {
        captureError(error);
      } finally {
        setDbChecked(true);
      }
    }
    
    verifyDatabaseSetup();
  }, [showNotification, captureError]);

  return (
    <div className="App">
      {location.pathname !== '/dashboard' && <Header />}
      <main className="main-content">
        {location.pathname !== '/dashboard' && <AnimatedCarrousel />}
        <Routes>
          <Route path="/" element={<AuthForm type={authType} onTypeChange={handleTypeChange} />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      {location.pathname !== '/dashboard' && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <ErrorHandler />
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </NotificationProvider>
    </BrowserRouter>
  );
};

export default App;