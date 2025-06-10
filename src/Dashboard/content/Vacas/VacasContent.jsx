import React, { useState, useEffect, useRef, useContext } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCow, faPlus, faUsers } from '@fortawesome/free-solid-svg-icons';
import { getUserVacas, checkTablesExist } from "../../../Services";
import { getCurrentUser } from "../../../Services";
import { useNotification, NotificationContext } from "../../../components/Notification/NotificationContext";
import CreateVacaForm from './CreateVacaForm';
import VacaDetails from './VacaDetails';
import './VacasContent.css';

const VacasContent = ({ vacas, setVacas, onVacaSelect, loading: externalLoading, setLoading: setExternalLoading }) => {
  const [loading, setLoading] = useState(externalLoading || false);
  const [tablesVerified, setTablesVerified] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { showNotification } = useContext(NotificationContext);
  const mounted = useRef(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedVaca, setSelectedVaca] = useState(null);
  const [selectedVacaId, setSelectedVacaId] = useState(null);

  useEffect(() => {
    mounted.current = true;
    let tablesChecked = false;
    
    const verifyTablesAndLoadVacas = async () => {
      if (tablesChecked || initialized) return;
      tablesChecked = true;
      
      try {
        
        setInitialized(true);
        await loadUserVacas();
      } catch (error) {
        if (mounted.current) {
          console.error("Error cargando vacas, verificando tablas:", error);
          
          try {
            const tables = await checkTablesExist();
            
            if (!tables.vacas || !tables.participants || !tables.transactions) {
              showNotification(
                "La base de datos no está correctamente configurada. Algunas tablas pueden faltar.",
                "error"
              );
            }
          } catch (tableError) {
            console.error("Error verificando tablas:", tableError);
          }
          
          setLoading(false);
        }
      }
    };
    
    verifyTablesAndLoadVacas();
    
    return () => {
      mounted.current = false;
    };
  }, []); 

  const safeSetState = (setter, value) => {
    if (mounted.current) {
      setter(value);
    }
  };
  useEffect(() => {
    if (selectedVacaId && vacas && vacas.length > 0 && mounted.current) {
      const selectedVaca = vacas.find(vaca => vaca.id === selectedVacaId);
      if (selectedVaca) {
        if (import.meta.env.DEV) console.log("Vaca seleccionada:", selectedVaca.name);
        safeSetState(setSelectedVaca, selectedVaca);
        if (setSelectedVacaId && mounted.current) {
          setSelectedVacaId(null); 
        }
      }
    }
  }, [selectedVacaId, vacas]);  const loadUserVacas = async () => {
    setLoading(true);
    
    try {
      // Get current user from auth service
      const { user: currentUser, error: authError } = await getCurrentUser();
      
      if (import.meta.env.DEV) {
        console.group('🔍 Loading User Vacas');
        console.log('User:', currentUser?.id || 'No ID');
        console.log('Token:', localStorage.getItem('lavaca_access_token') ? 'Present' : 'Missing');
        if (authError) console.log('Auth Error:', authError);
        console.groupEnd();
      }
      
      if (!currentUser?.id || authError) {
        console.error("No user or auth error:", authError);
        showNotification("Debes iniciar sesión para ver tus vacas", "error");
        setLoading(false);
        return;
      }
      
      // Cargo las vacas del usuario
      const { data, error } = await getUserVacas(currentUser.id);
      
      if (error) {
                console.error("Error al cargar vacas:", error);
        showNotification(`Error al cargar vacas: ${error}`, "error");
        setLoading(false);
        return;
      }
      
      if (import.meta.env.DEV) console.log("Vacas cargadas:", data?.length || 0);
      
      if (Array.isArray(data)) {
        safeSetState(setVacas, data);
      } else {
        console.error("Datos de vacas no es un array:", typeof data);
        safeSetState(setVacas, []);
      }
    } catch (error) {
      console.error("Error inesperado al cargar vacas:", error);
      showNotification("Error al cargar tus vacas", "error");
    } finally {
      setLoading(false);
    }
  };

    const handleCreateVaca = (newVaca) => {
    if (import.meta.env.DEV) console.log("Nueva vaca creada:", newVaca.name);
    setVacas(currentVacas => [...(Array.isArray(currentVacas) ? currentVacas : []), newVaca]);
    setShowCreateForm(false);
    showNotification("¡Vaca creada con éxito!", "success");
  };

  const handleVacaClick = (vaca) => {
    if (onVacaSelect) {
      onVacaSelect(vaca);
    } else {
      setSelectedVaca(vaca);
    }
  };

  const handleBackClick = () => {
    setSelectedVaca(null);
    loadUserVacas(); 
  };
  
  
  if (selectedVaca) {
    return <VacaDetails vaca={selectedVaca} onBackClick={handleBackClick} />;
  }
  
  if (showCreateForm) {
    return <CreateVacaForm onSave={handleCreateVaca} onCancel={() => setShowCreateForm(false)} />;
  }
    return (
    <div className="vacas-container">
      <section className="vacas-header">
        <h1>Tus Vacas</h1>
        <button className="create-vaca-btn" onClick={() => setShowCreateForm(true)}>
          <FontAwesomeIcon icon={faPlus} /> Crear Nueva Vaca
        </button>      </section>
      
      <section className="vacas-list">
        {loading ? (
          <div className="loading-state">
            <FontAwesomeIcon icon={faCow} className="loading-icon" spin />
            <p>Cargando vacas...</p>
          </div>
        ) : vacas && vacas.length > 0 ? (
          <div className="vacas-grid">
            {vacas.map(vaca => {
              // DEBUG: Log para ver los datos de participantes en cada vaca
              console.log('Vaca:', vaca.name, 'participants:', vaca.participants, 'participantCount:', vaca.participantCount);
              return (
                <div 
                  key={vaca.id} 
                  className="vaca-card"
                  onClick={() => handleVacaClick(vaca)}
                >
                  <div className="vaca-card-header" style={{ backgroundColor: vaca.color || '#3F60E5' }}>
                    <FontAwesomeIcon icon={faCow} className="vaca-card-icon" />
                    <h3>{vaca.name}</h3>
                  </div>
                  <div className="vaca-card-content">
                    <p className="vaca-goal">Meta: ${vaca.goal.toLocaleString()}</p>
                    <p className="vaca-current">Actual: ${vaca.current ? vaca.current.toLocaleString() : '0'}</p>
                    <div className="vaca-progress">
                      <div 
                        className="vaca-progress-bar" 
                        style={{ 
                          width: `${vaca.current ? Math.min((vaca.current / vaca.goal) * 100, 100) : 0}%`,
                          backgroundColor: vaca.color || '#3F60E5'
                        }}
                      ></div>
                    </div>
                    <div className="vaca-card-stats">
                      <span className="vaca-card-stat">
                        <FontAwesomeIcon icon={faUsers} className="vaca-card-stat-icon" />
                        {Array.isArray(vaca.participants) ? vaca.participants.length : 0} participantes
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <FontAwesomeIcon icon={faCow} className="empty-icon" style={{fontSize: "64px", color: "#3F60E5"}} />
            <h3>No tienes ninguna vaca creada</h3>
            <p>¡Crea tu primera vaca para comenzar a ahorrar con tus amigos!</p>
            <button className="create-first-btn" onClick={() => setShowCreateForm(true)}>
              <FontAwesomeIcon icon={faPlus} /> Crear Primera Vaca
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default VacasContent;