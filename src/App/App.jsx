import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import AuthForm from '../Components/AuthForm/AuthForm';
import Header from '../Layout/header/Header';
import Footer from '../Layout/Footer/Footer';
import Dashboard from '../Dashboard/Dashboard';
import { PrivateRoute, PublicRoute } from '../Components/AuthForm/ProtectedRoutes';
import { NotificationProvider, useNotification } from '../Components/Notification/NotificationContext';
import { checkTablesExist } from "../Services/vacaService.jsx";
import ErrorBoundary from '../Components/ErrorBoundary/ErrorBoundary';
import { supabase } from '../Supabase/supabaseConfig';

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
          {/* Rutas públicas - solo accesibles si NO está autenticado */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<AuthForm type={authType} onTypeChange={handleTypeChange} />} />
            <Route path="/auth/callback" element={<div>Procesando autenticación...</div>} />
          </Route>
          
          {/* Rutas privadas - solo accesibles si está autenticado */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/:section" element={<Dashboard />} />
          </Route>
          
          {/* Ruta de fallback para cualquier otra URL */}
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Cambio en autenticación:", event);
      
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard');
      } else if (event === 'SIGNED_OUT') {
        navigate('/');
      }
    });
    
    return () => subscription.unsubscribe();
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