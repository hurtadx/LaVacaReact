import React, { useState } from "react";
import './SidebarComponent.css'; 
import '../../Resposive/sidebar-responsive.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faCow, 
  faGear, 
  faSignOutAlt,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ activeItem, onItemClick, onLogout, vacas = [] }) => {
  const [isVacasOpen, setIsVacasOpen] = useState(false);

  const toggleVacasMenu = (e) => {
    e.stopPropagation(); 
    setIsVacasOpen(!isVacasOpen);
  };

  const handleVacaClick = (vacaId) => {
    onItemClick('Vacas', vacaId); 
  };

  return (
    <aside className="sidebar">
      <nav>
        <ul>
          <li 
            className={activeItem === 'Inicio' ? 'active' : ''} 
            onClick={() => onItemClick('Inicio')}
          >
            <FontAwesomeIcon icon={faHome} className="sidebar-icon" /> Inicio
          </li>
          <li 
            className={`sidebar-dropdown ${activeItem === 'Vacas' ? 'active' : ''} ${isVacasOpen ? 'open' : ''}`}
            onClick={() => onItemClick('Vacas')}
          >
            <div className="sidebar-item-header">
              <div className="sidebar-item-title">
                <FontAwesomeIcon icon={faCow} className="sidebar-icon" /> 
                Vacas
              </div>
              <button 
                className="dropdown-toggle" 
                onClick={toggleVacasMenu}
              >
                <FontAwesomeIcon 
                  icon={isVacasOpen ? faChevronUp : faChevronDown} 
                  className="dropdown-icon" 
                />
              </button>
            </div>
            
            {isVacasOpen && (
              <ul className="dropdown-menu">
                {vacas.length === 0 ? (
                  <li className="dropdown-empty">No hay vacas</li>
                ) : (
                  vacas.map(vaca => (
                    <li 
                      key={vaca.id} 
                      className="dropdown-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVacaClick(vaca.id);
                      }}
                    >
                      <FontAwesomeIcon 
                        icon={faCow} 
                        className="vaca-color-icon" 
                        style={{color: vaca.color || '#3F60E5'}}
                      />
                      <span className="vaca-name">{vaca.name}</span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </li>
          <li 
            className={activeItem === 'Ajustes' ? 'active' : ''} 
            onClick={() => onItemClick('Ajustes')}
          >
            <FontAwesomeIcon icon={faGear} className="sidebar-icon" /> Ajustes
          </li>
          <li className="logout" onClick={onLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} className="sidebar-icon" /> Salir
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;