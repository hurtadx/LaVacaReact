import React from "react";
import './SidebarComponent.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faCow, 
  faGear, 
  faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ activeItem, onItemClick, onLogout }) => {
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
            className={activeItem === 'Vacas' ? 'active' : ''} 
            onClick={() => onItemClick('Vacas')}
          >
            <FontAwesomeIcon icon={faCow} className="sidebar-icon" /> Vacas
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