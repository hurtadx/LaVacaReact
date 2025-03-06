import React, { useState, useEffect } from "react";
import './Dashboard.css';
import { onAuthStateChange, logoutUser } from "../Supabase/Services/Auth"; 
import { getUserVacas } from "../Supabase/Services/vacaService";
import DashboardHeader from "./content/Header/DashboardHeader";
import Sidebar from "./assets/components/SidebarComponent";
import HomeContent from "./content/Home/HomeContent";
import VacasContent from "./content/Vacas/VacasContent";
import SettingsContent from "./content/Settings/SettingsContent";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeItem, setActiveItem] = useState('Inicio');
  const [vacas, setVacas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Efecto para cargar el usuario autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChange(currentUser => {
      console.log("Received user in Dashboard:", currentUser);
      setUser(currentUser);
    });
    
    return unsubscribe;
  }, []);
  
  // Efecto para cargar las vacas del usuario cuando el usuario cambia
  useEffect(() => {
    const fetchVacas = async () => {
      if (user && user.id) {
        setLoading(true);
        try {
          const { data, error } = await getUserVacas(user.id);
          if (error) throw error;
          setVacas(data);
        } catch (error) {
          console.error("Error al obtener las vacas:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchVacas();
  }, [user]);

  const handleLogout = async () => {
    try {
      const { success, error } = await logoutUser();
      if (success) {
        window.location.href = '/';
      } else {
        console.error("Error al cerrar sesión", error);
      }
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };
  
  const renderContent = () => {
    switch(activeItem) {
      case 'Inicio':
        return <HomeContent 
                onVacasButtonClick={() => setActiveItem('Vacas')} 
                totalVacas={vacas.length}
                loading={loading}
               />;
      case 'Vacas':
        return <VacasContent 
                vacas={vacas} 
                setVacas={setVacas}
                loading={loading} 
               />;
      case 'Ajustes':
        return <SettingsContent />;
      default:
        return <HomeContent 
                onVacasButtonClick={() => setActiveItem('Vacas')} 
                totalVacas={vacas.length}
                loading={loading}
               />;
    }
  };

  return (
    <div className="dashboard-container">
      <DashboardHeader user={user} />

      <div className="dash-layout">
        <Sidebar 
          activeItem={activeItem} 
          onItemClick={(item, vacaId = null) => {
            setActiveItem(item);
            if (item === 'Vacas' && vacaId) {
              setSelectedVacaId(vacaId);
            }
          }}
          onLogout={handleLogout} 
          vacas={vacas}
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