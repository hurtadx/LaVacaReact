import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCow, faPlus } from '@fortawesome/free-solid-svg-icons';
import { getUserVacas, checkTablesExist } from "../../../Supabase/services/vacaService";
import { supabase } from "../../../Supabase/supabaseConfig";
import { useNotification } from "../../../Components/Notification/NotificationContext";
import CreateVacaForm from './CreateVacaForm';
import VacaDetails from './VacaDetails';
import './VacasContent.css';

const VacasContent = ({ vacas, setVacas, loading: externalLoading, setLoading: setExternalLoading, selectedVacaId, setSelectedVacaId }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedVaca, setSelectedVaca] = useState(null);
  const [tablesVerified, setTablesVerified] = useState(false);
  const [internalLoading, setInternalLoading] = useState(false);
  const { showNotification } = useNotification();
  
  const mounted = useRef(true);
  
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);
  
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;
  const setLoading = (state) => {
    if (mounted.current) {
      if (setExternalLoading) {
        setExternalLoading(state);
      } else {
        setInternalLoading(state);
      }
    }
  };
  
  const safeSetState = (setter, value) => {
    if (mounted.current) {
      setter(value);
    }
  };

  useEffect(() => {
    const verifyTablesAndLoadVacas = async () => {
      try {
        
        if ((!vacas || vacas.length === 0) && !selectedVacaId) {
          setLoading(true);
          const tables = await checkTablesExist();
          
          if (!mounted.current) return;
          
          console.log("Estado de las tablas:", tables);
          
          if (!tables.vacas || !tables.participants || !tables.transactions) {
            if (mounted.current) {
              showNotification("La base de datos no está correctamente configurada", "error");
              setLoading(false);
            }
            return;
          }
          
          safeSetState(setTablesVerified, true);
          await loadUserVacas();
        } else {
          
          safeSetState(setTablesVerified, true);
          setLoading(false);
        }
      } catch (error) {
        if (mounted.current) {
          console.error("Error en la inicialización:", error);
          showNotification("Error al inicializar la aplicación", "error");
          setLoading(false);
        }
      }
    };
    
    verifyTablesAndLoadVacas();
    
    return () => {
      mounted.current = false;
    };
  }, []);

  
  useEffect(() => {
    if (selectedVacaId && vacas && vacas.length > 0 && mounted.current) {
      const selectedVaca = vacas.find(vaca => vaca.id === selectedVacaId);
      if (selectedVaca) {
        console.log("Vaca seleccionada desde sidebar:", selectedVaca);
        safeSetState(setSelectedVaca, selectedVaca);
        if (setSelectedVacaId && mounted.current) {
          setSelectedVacaId(null); 
        }
      }
    }
  }, [selectedVacaId, vacas]);

  const loadUserVacas = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        showNotification("Debes iniciar sesión para ver tus vacas", "error");
        setLoading(false);
        return;
      }
      
      console.log("Cargando vacas para el usuario:", user.id);
      
      const { data, error } = await getUserVacas(user.id);
      
      if (error) {
        console.error("Error al cargar vacas:", error);
        showNotification(`Error: ${error}`, "error");
        return;
      }
      
      console.log("Vacas cargadas correctamente:", data);
      setVacas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error inesperado al cargar vacas:", error);
      showNotification("Error al cargar tus vacas", "error");
    } finally {
      setLoading(false);
    }
  };

  
  const handleCreateVaca = (newVaca) => {
    console.log("Nueva vaca creada:", newVaca);
    setVacas(currentVacas => [...(Array.isArray(currentVacas) ? currentVacas : []), newVaca]);
    setShowCreateForm(false);
    showNotification("¡Vaca creada con éxito!", "success");
  };

  const handleVacaClick = (vaca) => {
    setSelectedVaca(vaca);
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
        </button>
      </section>
      
      <section className="vacas-list">
        {loading ? (
          <div className="loading-state">
            <FontAwesomeIcon icon={faCow} className="loading-icon" spin />
            <p>Cargando vacas...</p>
          </div>
        ) : vacas && vacas.length > 0 ? (
          <div className="vacas-grid">
            {vacas.map(vaca => (
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
                  <p className="vaca-members">{vaca.participants?.length || 0} participantes</p>
                </div>
              </div>
            ))}
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