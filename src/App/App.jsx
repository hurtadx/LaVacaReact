import { useState } from 'react'
import './App.css'
import AuthForm from '../assets/AuthForm/AuthForm'
import Header from '../Components/header/Header';

function App() {
  const [authType, setAuthType] = useState('login');

const handleTypeChange = (type) => {
  setAuthType(prevType => prevType === 'login' ? 'register' : 'login');
}

  return (
    <div className="App">
      <Header />

      <div className="auth-container">
        <div className="auth-buttons">
        
        </div>
        <AuthForm 
        type={authType} 
        onTypeChange={handleTypeChange}
        />
      </div>
    </div>
  )
}

export default App