import React from "react";
import './Dashboard.css';
import logo from '../Components/Img/LogoLaVaca.png';  

const Dashboard = () => {
  return (
    <>
    
    <header className="Dash-header" role="banner">
      <div className="header-Dash-container">
        <div className="title">
          <img src={logo} alt="LaVaca Banking Logo" />
          <h1>LaVaca</h1>
        </div>

        <div className="user-info">
          <span>Nombre de Usuario</span>
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


      </div>


    </>
  );
}

export default Dashboard;