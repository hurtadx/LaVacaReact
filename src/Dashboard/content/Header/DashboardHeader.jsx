import React from "react";
import './DashboardHeader.css';
import logo from '../../../Components/Img/LogoLaVaca.png';

const DashboardHeader = ({ user }) => {
  return (
    <header className="dash-header" role="banner">
      <div className="dash-header-container">
        <div className="dash-title">
          <img src={logo} alt="LaVaca Banking Logo" />
          <h1>LaVaca</h1>
        </div>
        <div className="user-info">
          <span>{user?.displayName || user?.email || "Usuario"}</span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;