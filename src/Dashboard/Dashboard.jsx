import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserVacas, getInvitations } from '../Services/vacaService.jsx';
import { getCurrentUser } from '../Services/userService'; 
import { logoutUser } from '../Services/authService';
import DashboardHeader from '../Dashboard/content/Header/DashboardHeader';
import { NotificationContext } from '../Components/Notification/NotificationContext';
import { supabase, checkSupabaseConnection } from '../Supabase/supabaseConfig';
import VacaDetails from './content/Vacas/VacaDetails';
import './Dashboard.css';
import './Resposive/dashboard-responsive.css'; 
import Sidebar from "./assets/components/SidebarComponent";
import HomeContent from "./content/Home/HomeContent";
import VacasContent from "./content/Vacas/VacasContent";
import SettingsContent from "./content/Settings/SettingsContent";
import DashboardSkeleton from '../Components/SkeletonLoading/DashboardSkeleton'; 


const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [vacas, setVacas] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [activeItem, setActiveItem] = useState('Inicio');
  const [selectedVacaId, setSelectedVacaId] = useState(null);
  const { showNotification } = useContext(NotificationContext);
  const [connectionStatus, setConnectionStatus] = useState({ checking: true });

  useEffect(() => {
    const verifyConnection = async () => {
      const status = await checkSupabaseConnection();
      setConnectionStatus({ ...status, checking: false });
      
      if (!status.connected) {
        showNotification('Error de conexión con el servidor. Intenta recargar la página.', 'error');
      } else if (!status.session) {
        navigate('/login');
      }
    };
    
    verifyConnection();
  }, [navigate, showNotification]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: currentUser, error } = await getCurrentUser();
        
        if (error || !currentUser) {
          console.error('Error al obtener el usuario:', error);
          navigate('/login');
          return;
        }
        
        setUser(currentUser);
        
        
        const { data: userVacas, error: vacasError } = await getUserVacas(currentUser.id);
        if (!vacasError) {
          setVacas(userVacas || []);
        }
        
        await loadPendingInvitations(currentUser.id);
      } catch (error) {
        console.error('Error en Dashboard:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]); 

  
  useEffect(() => {
    if (!user?.id) return; 
    
    console.log("Setting up subscription for user:", user.id);
    
    const invitationsSubscription = supabase
      .channel(`invitations-channel-${user.id}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'invitations',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          loadPendingInvitations(user.id);
        }
      )
      .subscribe();
    
    return () => {
      console.log("Cleaning up subscription for user:", user.id);
      invitationsSubscription.unsubscribe();
    };
  }, [user?.id]); 

  const loadPendingInvitations = async (userId) => {
    try {
      const { data: invitations, error } = await getInvitations(userId);
      
      if (error) {
        console.error('Error al cargar invitaciones:', error);
        return;
      }
      
      setPendingInvitations(invitations || []);
      setHasUnreadNotifications(invitations?.length > 0);
    } catch (error) {
      console.error('Error al procesar invitaciones:', error);
    }
  };

  const markNotificationsAsRead = () => {
    setHasUnreadNotifications(false);
  };

  const handleInvitationResponse = async (invitationId, response, vacaId) => {
    try {
      
      setPendingInvitations(current => 
        current.filter(inv => inv.id !== invitationId)
      );
      
      if (pendingInvitations.length <= 1) {
        setHasUnreadNotifications(false);
      }
      
      
      if (response === 'accept' && user) {
        
        setTimeout(async () => {
          const { data: userVacas } = await getUserVacas(user.id);
          if (userVacas) {
            setVacas(userVacas);
          }
          
          
          showNotification('Te has unido a una nueva vaca', 'success');
        }, 1000);
      } else if (response === 'reject') {
        showNotification('Has rechazado la invitación', 'info');
      }
    } catch (error) {
      console.error('Error al procesar respuesta a invitación:', error);
    }
  };

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

  const handleVacaSelect = (vaca) => {
    setActiveItem('Vacas');
    setSelectedVacaId(vaca.id);
  };
  
  const renderContent = () => {
    switch(activeItem) {
      case 'Inicio':
        return <HomeContent 
                onVacasButtonClick={() => {
                  setActiveItem('Vacas');
                  setSelectedVacaId(null); 
                }} 
                totalVacas={vacas.length}
                loading={loading}
                vacas={vacas}
                onVacaSelect={handleVacaSelect}
               />;
      case 'Vacas':
        
        if (selectedVacaId) {
          const selectedVaca = vacas.find(vaca => vaca.id === selectedVacaId);
          return <VacaDetails 
                  vaca={selectedVaca} 
                  user={user} 
                  onBackClick={() => setSelectedVacaId(null)} 
                 />;
        }
        
        return <VacasContent 
                vacas={vacas}
                setVacas={setVacas}
                onVacaSelect={(vaca) => setSelectedVacaId(vaca.id)}
               />;
      case 'Ajustes':
        return <SettingsContent user={user} />;
      default:
        return <HomeContent 
                onVacasButtonClick={() => {
                  setActiveItem('Vacas');
                  setSelectedVacaId(null);
                }} 
                totalVacas={vacas.length}
                loading={loading}
                vacas={vacas}
                onVacaSelect={handleVacaSelect}
               />;
    }
  };

  if (connectionStatus.checking) {
    return <DashboardSkeleton message="Verificando conexión..." />;
  }
  
  if (!connectionStatus.connected) {
    return (
      <div className="error-state">
        <h2>Error de conexión</h2>
        <p>No se pudo conectar con el servidor. Verifica tu conexión a internet.</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  if (loading) {
    
    
    
    return <DashboardSkeleton />;
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader 
        user={user} 
        pendingInvitations={pendingInvitations} 
        hasUnreadNotifications={hasUnreadNotifications}
        onNotificationsOpen={markNotificationsAsRead}
        onInvitationResponse={handleInvitationResponse}
      />

      <div className="dash-layout">
        <Sidebar 
          activeItem={activeItem} 
          onItemClick={(item, vacaId = null) => {
            setActiveItem(item);
            if (item === 'Vacas') {
              
              if (vacaId) {
                setSelectedVacaId(vacaId);
              } 
              
              else {
                setSelectedVacaId(null);
              }
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
};

export default Dashboard;


