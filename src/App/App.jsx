import { useState } from 'react'
import './App.css'
import AuthForm from '../assets/AuthForm/AuthForm'

function App() {
  const [authType, setAuthType] = useState('login');

  const toggleAuthType = () => {
    setAuthType(authType === 'login' ? 'register' : 'login');
  };
  

  return (
    <div className="App">
      <h1>LaVaca PROYECTO!</h1>
      <div className="auth-container">
        <div className="auth-buttons">
        
        </div>
        <AuthForm type={authType} />
      </div>
    </div>
  )
}

export default App