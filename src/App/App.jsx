import { useState } from 'react';
import './App.css';
import AuthForm from '../assets/AuthForm/AuthForm';
import Header from '../Components/header/Header';
import Footer from '../Components/Footer/Footer';
import AnimatedCarrousel from '../assets/AnimatedCarrousel/AnimatedCarrousel';
import { NotificationProvider } from '../assets/Notification/NotificationContext';

function App() {
  const [authType, setAuthType] = useState('login');

  const handleTypeChange = (type) => {
    setAuthType(prevType => prevType === 'login' ? 'register' : 'login');
  }

  return (
    <NotificationProvider>
      <div className="App">
        <Header />

        <div className="main-content">
          <AnimatedCarrousel/>
          <div className="auth-container">
            <div className="auth-buttons">
              <AuthForm 
                type={authType} 
                onTypeChange={handleTypeChange}
              />
            </div>
          </div>
        </div>

        <div className='footer-container'>
          <Footer />
        </div>
      </div>
    </NotificationProvider>
  );
}

export default App;