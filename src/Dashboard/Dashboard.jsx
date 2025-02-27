import React, { useState, useEffect } from "react";
import './Dashboard.css';
import logo from '../Components/Img/LogoLaVaca.png';  
import { auth } from "../Firebase/config";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faCow, 
  faGear, 
  faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeItem, setActiveItem] = useState('Inicio');
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = '/';
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <>
      <header className="dash-header" role="banner">
        <div className="dash-header-container">
          <div className="title">
            <img src={logo} alt="LaVaca Banking Logo" />
            <h1>LaVaca</h1>
          </div>
          <div className="user-info">
            <span>{user?.displayName || user?.email || "Usuario"}</span>
          </div>
        </div>
      </header>

      <div className="dash-layout">
        <aside className="sidebar">
          <nav>
            <ul>
              <li 
                className={activeItem === 'Inicio' ? 'active' : ''} 
                onClick={() => setActiveItem('Inicio')}
              >
                <FontAwesomeIcon icon={faHome} className="sidebar-icon" /> Inicio
              </li>
              <li 
                className={activeItem === 'Vacas' ? 'active' : ''} 
                onClick={() => setActiveItem('Vacas')}
              >
                <FontAwesomeIcon icon={faCow} className="sidebar-icon" /> Vacas
              </li>
              <li 
                className={activeItem === 'Ajustes' ? 'active' : ''} 
                onClick={() => setActiveItem('Ajustes')}
              >
                <FontAwesomeIcon icon={faGear} className="sidebar-icon" /> Ajustes
              </li>
              <li className="logout" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} className="sidebar-icon" /> Salir
              </li>
            </ul>
          </nav>
        </aside>
        
        <main className="main-content">
          <div className="dashboard-module">
            <section className="account-summary">
              <div className="card">
                <h3>Total "Vaca Playa"</h3>
                <p className="amount">$0.00</p>
              </div>
              
              <button className="card interactive">
                <h3>Tus Vacas</h3>
                <p className="count">0</p>
              </button>
              
              <div className="card">
                <h3>Próximo Pago</h3>
                <p className="days">Quedan 0 días</p>
              </div>
            </section>
            
            <section className="transactions">
              <h2>Últimas Transacciones</h2>
              <ul>
                <li>Retiro Vaca Playa -$20,000</li>
                <li>Retiro Vaca Playa -$20,000</li>
                <li>Retiro Vaca Farra -$90,000</li>
              </ul>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

export default Dashboard;