import { useState } from 'react';
import './App.css';
import AuthForm from '../assets/AuthForm/AuthForm';
import Header from '../Components/header/Header';
import Footer from '../Components/Footer/Footer';
import AnimatedCarrousel from '../assets/AnimatedCarrousel/AnimatedCarrousel';
import { NotificationProvider } from '../assets/Notification/NotificationContext';

const App = () => {  
  const [authType, setAuthType] = useState('login');


  const handleTypeChange = () => setAuthType(prev => prev === 'login' ? 'register' : 'login');

  return (
    <NotificationProvider>
      <div className="App">
        <Header />
        <main className="main-content"> 
          <AnimatedCarrousel />
          <AuthForm 
            type={authType} 
            onTypeChange={handleTypeChange}
          />
        </main>
        <Footer /> 
      </div>
    </NotificationProvider>
  );
};

export default App;