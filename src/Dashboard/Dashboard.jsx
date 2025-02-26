import React, { useState, useEffect } from "react";
import './Dashboard.css';
import logo from '../Components/Img/LogoLaVaca.png';  
import { auth } from "../Firebase/config";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <>
      <header className="Dash-header" role="banner">
        <div className="header-Dash-container">
          <div className="title">
            <img src={logo} alt="LaVaca Banking Logo" />
            <h1>LaVaca</h1>
          </div>

          <div className="user-info">
            <span>{user?.displayName || user?.email || "Usuario"}</span>
          </div>
        </div>
      </header>
      <div className="Sidebar">
        <nav>
          <ul>
            <li>Inicio</li>
            <li>Vacas</li>
            <li>Ajustes</li>

            <li className="Logout">Salir</li>
          </ul>
        </nav>
      </div>
      
      <div className="main-content">
        <div className="Module-container">
          <div className="main-module">
              



          </div> 
        </div>


      </div>


    </>
  );
}

export default Dashboard;