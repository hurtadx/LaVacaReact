import React, { useState, useEffect } from "react";
import './Dashboard.css';
import { auth } from "../Firebase/config";
import DashboardHeader from "./content/Header/DashboardHeader";
import Sidebar from "./assets/components/SidebarComponent";
import HomeContent from "./content/Home/HomeContent";
import VacasContent from "./content/Vacas/VacasContent";
import SettingsContent from "./content/Settings/SettingsContent";

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

  
  const renderContent = () => {
    switch(activeItem) {
      case 'Inicio':
        return <HomeContent onVacasButtonClick={() => setActiveItem('Vacas')} />;
      case 'Vacas':
        return <VacasContent />;
      case 'Ajustes':
        return <SettingsContent />;
      default:
        return <HomeContent onVacasButtonClick={() => setActiveItem('Vacas')} />;
    }
  };

  return (
    <div className="dashboard-container">
      <DashboardHeader user={user} />

      <div className="dash-layout">
        <Sidebar 
          activeItem={activeItem} 
          onItemClick={setActiveItem} 
          onLogout={handleLogout} 
        />
        
        <main className="dashboard-main-content">
          <div className="dashboard-module">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;