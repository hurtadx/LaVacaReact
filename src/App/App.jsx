import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import AuthForm from '../components/AuthForm/AuthForm';
import Header from '../Layout/header/Header';
import Footer from '../Layout/Footer/Footer';
import Dashboard from '../Dashboard/Dashboard';
import { PrivateRoute, PublicRoute } from '../components/AuthForm/ProtectedRoutes';
import { NotificationProvider, useNotification } from '../components/Notification/NotificationContext';
import { checkTablesExist } from "../Services";
import { onAuthStateChange } from "../Services";
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';

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
      
      try {        console.log("Verificando estructura de base de datos una sola vez...");
        const result = await checkTablesExist();
        
        if (result.error) {
          console.error("Error al verificar tablas:", result.error);
          showNotification("Error al verificar la configuración de la base de datos.", "error");
        } else if (!result.data) {
          console.log("Las tablas de la base de datos no están disponibles");
          showNotification("La base de datos no está correctamente configurada. Contacta al administrador.", "error");
        } else {
          console.log("Base de datos configurada correctamente");
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
      <main className="main-content">        <Routes>
          {/* Rutas públicas - solo accesibles si NO está autenticado */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<AuthForm type={authType} onTypeChange={handleTypeChange} />} />
            <Route path="/auth/callback" element={<div>Procesando autenticación...</div>} />
          </Route>
          
          
          
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/:section" element={<Dashboard />} />
          </Route>
          
         
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {location.pathname !== '/dashboard' && <Footer />}
    </div>
  );
};

// Componente para escuchar cambios en la autenticación
const AuthChangeListener = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      console.log("Cambio en autenticación:", user ? "SIGNED_IN" : "SIGNED_OUT");
      
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    });
    
    return unsubscribe;
  }, [navigate]);
  
  return null;
};

const App = () => {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <BrowserRouter>
          <AuthChangeListener />
          <AppContent />
        </BrowserRouter>
      </NotificationProvider>
    </ErrorBoundary>
  );
};

export default App;