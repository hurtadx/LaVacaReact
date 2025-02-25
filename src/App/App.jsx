import { useState } from 'react';
import './App.css';
import AuthForm from '../Components/AuthForm/AuthForm';
import Header from '../Layout/header/Header';
import Footer from '../Layout/Footer/Footer';
import AnimatedCarrousel from '../Components/AnimatedCarrousel/AnimatedCarrousel';
import { NotificationProvider } from '../Components/Notification/NotificationContext';

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