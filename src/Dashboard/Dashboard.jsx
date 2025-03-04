import React, { useState, useEffect } from "react";
import './Dashboard.css';
import { onAuthStateChange, logoutUser } from "../Supabase/services/Auth"; // Cambiado de Firebase a Supabase
import DashboardHeader from "./content/Header/DashboardHeader";
import Sidebar from "./assets/components/SidebarComponent";
import HomeContent from "./content/Home/HomeContent";
import VacasContent from "./content/Vacas/VacasContent";
import SettingsContent from "./content/Settings/SettingsContent";

// Vaca de prueba
const vacaDemo = {
  id: 'vaca-demo-1',
  name: 'Viaje a la Playa',
  description: 'Ahorro grupal para nuestro viaje a Cartagena en las próximas vacaciones. ¡El objetivo es pasarla bien sin preocuparnos por el dinero!',
  goal: 1500000,
  current: 750000,
  color: '#3F60E5',
  createdAt: new Date().toISOString(),
  deadline: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
  owner: 'user123',
  participants: [
    { id: 'part1', name: 'María López', email: 'maria@example.com' },
    { id: 'part2', name: 'Juan González', email: 'juan@example.com' },
    { id: 'part3', name: 'Carlos Rodríguez', email: 'carlos@example.com' },
    { id: 'part4', name: 'Ana Martínez', email: 'ana@example.com' }
  ],
  transactions: [
    { 
      id: 'trans1', 
      amount: 200000, 
      description: 'Depósito inicial', 
      date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
      participant: 'part1'
    },
    { 
      id: 'trans2', 
      amount: 150000, 
      description: 'Pago mensual', 
      date: new Date(new Date().setDate(new Date().getDate() - 20)).toISOString(),
      participant: 'part2'
    },
    { 
      id: 'trans3', 
      amount: 400000, 
      description: 'Aporte extra', 
      date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
      participant: 'part3'
    }
  ]
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [activeItem, setActiveItem] = useState('Inicio');
  const [vacas, setVacas] = useState([vacaDemo]);
  
  useEffect(() => {
    // Usar el nuevo método de Supabase para escuchar cambios de autenticación
    const unsubscribe = onAuthStateChange(currentUser => {
      setUser(currentUser);
    });
    
    return unsubscribe;
  }, []);

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
               />;
      case 'Vacas':
        return <VacasContent 
                vacas={vacas} 
                setVacas={setVacas} 
               />;
      case 'Ajustes':
        return <SettingsContent />;
      default:
        return <HomeContent 
                onVacasButtonClick={() => setActiveItem('Vacas')} 
                totalVacas={vacas.length}
               />;
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