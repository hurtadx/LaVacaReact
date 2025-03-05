import React from "react";
import './DashboardHeader.css';
import logo from '../../../Components/Img/LogoLaVaca.png';

const DashboardHeader = ({ user }) => {
  
  const displayName = user?.displayName || 
                    user?.user_metadata?.username || 
                    (user?.email ? user.email.split('@')[0] : "Usuario");
  
  console.log("User data in header:", { user, displayName });
  
  return (
    <header className="dash-header" role="banner">
      <div className="dash-header-container">
        <div className="dash-title">
          <img src={logo} alt="LaVaca Banking Logo" />
          <h1>LaVaca</h1>
        </div>
        <div className="user-info">
          <span>{displayName}</span>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;