import { useState } from 'react'
import './App.css'
import AuthForm from '../assets/AuthForm/AuthForm'

function App() {
  const [authType, setAuthType] = useState('login');

  return (
    <div className="App">
      <h1>LaVaca PROYECTO!</h1>
      <div className="auth-container">
        <div className="auth-buttons">
          <button 
            onClick={() => setAuthType('login')}
            className={authType === 'login' ? 'active' : ''}
          >
           Iniciar Sesión
          </button>
          <button 
            onClick={() => setAuthType('register')}
            className={authType === 'register' ? 'active' : ''}
          >
            Registrarse
          </button>
        </div>
        <AuthForm type={authType} />
      </div>
    </div>
  )
}

export default App