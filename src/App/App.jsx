import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import AuthForm from '../Components/AuthForm/AuthForm';
import Header from '../Layout/header/Header';
import Footer from '../Layout/Footer/Footer';
import AnimatedCarrousel from '../Components/AnimatedCarrousel/AnimatedCarrousel';
import Dashboard from '../Dashboard/Dashboard';
import { NotificationProvider, useNotification } from '../Components/Notification/NotificationContext';
import { checkTablesExist } from "../Services/vacaService.jsx";
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
    
    
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [captureError]);
  
  return null; 
};

const AppContent = () => {
  const location = useLocation();
  const [authType, setAuthType] = useState('login');
  const [dbChecked, setDbChecked] = useState(false);
  const { showNotification, captureError } = useNotification();
  
  
  const isChecking = useRef(false);

  const handleTypeChange = () => setAuthType(prev => prev === 'login' ? 'register' : 'login');

  useEffect(() => {
    const verifyDatabaseSetup = async () => {
      
      if (isChecking.current || dbChecked) return;
      isChecking.current = true;
      
      try {
        console.log("Verificando estructura de base de datos una sola vez...");
        const tables = await checkTablesExist();
        
        const missingTables = [];
        if (!tables.vacas) missingTables.push('vacas');
        
        
        if (!tables.transactions) missingTables.push('transactions');
        
        if (missingTables.length > 0) {
          console.log("Tablas faltantes:", missingTables);
          showNotification("La base de datos no está correctamente configurada. Contacta al administrador.", "error");
        }
        
        setDbChecked(true);
      } catch (error) {
        console.error("Error al verificar base de datos:", error);
        setDbChecked(true);
      } finally {
        isChecking.current = false;
      }
    };
    
    verifyDatabaseSetup();
  }, []); 

  return (
    <div className="App">
      {location.pathname !== '/dashboard' && <Header />}
      <main className="main-content">
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