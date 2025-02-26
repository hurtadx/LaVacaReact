import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import AuthForm from '../Components/AuthForm/AuthForm';
import Header from '../Layout/header/Header';
import Footer from '../Layout/Footer/Footer';
import AnimatedCarrousel from '../Components/AnimatedCarrousel/AnimatedCarrousel';
import Dashboard from '../Dashboard/Dashboard';
import { NotificationProvider } from '../Components/Notification/NotificationContext';

const AppContent = () => {
  const location = useLocation();
  const [authType, setAuthType] = useState('login');

  const handleTypeChange = () => setAuthType(prev => prev === 'login' ? 'register' : 'login');

  return (
    <NotificationProvider>
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
    </NotificationProvider>
  );
};


const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;