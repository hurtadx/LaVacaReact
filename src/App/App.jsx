import { useState } from 'react';
import './App.css';
import AuthForm from '../assets/AuthForm/AuthForm';
import Header from '../Components/header/Header';
import Footer from '../Components/Footer/Footer';


function App() {
  const [authType, setAuthType] = useState('login');

  const handleTypeChange = (type) => {
    setAuthType(prevType => prevType === 'login' ? 'register' : 'login');
  }

  return (
    <div className="App">
      <Header />

      <div className="main-content">
        
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
  );
}

export default App;