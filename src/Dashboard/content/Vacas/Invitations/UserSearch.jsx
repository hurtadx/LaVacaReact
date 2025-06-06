import React, { useState, useContext } from 'react';
import { searchUsers } from '../../../../Services/userService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faCheckCircle, 
  faTimes,
  faUser,
  faSpinner,  
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';
import { NotificationContext } from '../../../../components/Notification/NotificationContext';
import './UserSearch.css';

const UserSearch = ({ onUserSelect, excludeUsers = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { captureError } = useContext(NotificationContext);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (searchTerm.trim().length < 3) {
      setError("Ingresa al menos 3 caracteres para buscar");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await searchUsers(searchTerm);
      
      if (error) {
        setError(error);
        return;
      }
      
    // Filtrar usuarios ya excluidos    
      const filteredResults = data.filter(
        user => !excludeUsers.some(excluded => excluded.id === user.id)
      );
      
      setSearchResults(filteredResults);
      
      if (filteredResults.length === 0) {
        setError("No se encontraron usuarios con ese criterio");
      }
    } catch (err) {
      setError("Error al buscar usuarios");
      captureError(err);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
      
      if (isSelected) {
        return prev.filter(u => u.id !== user.id);
      } else {
        return [...prev, user];
      }
    });
  };
  
  return (
    <div className="user-search">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="search-input"
          />
          <button
            type="submit"
            className="search-btn"
            disabled={loading}
          >
            <FontAwesomeIcon icon={loading ? faSpinner : faSearch} spin={loading} />
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
      </form>

      {searchResults.length > 0 && (
        <div className="search-results-container">
          <h3 className="search-results-title">
            Resultados ({searchResults.length})
          </h3>
          
          <div className="search-results">
            {searchResults.map(user => (
              <div 
                key={user.id} 
                className={`user-item ${selectedUsers.some(u => u.id === user.id) ? 'selected' : ''}`}
                onClick={() => toggleUserSelection(user)}
              >
                <div className="user-avatar">
                  {user.username?.charAt(0).toUpperCase() || <FontAwesomeIcon icon={faUser} />}
                </div>
                <div className="user-info">
                  <h4 className="user-username">{user.username || "Usuario"}</h4>
                  <p className="user-email">{user.email}</p>
                </div>
                <div className="user-select-indicator">
                  {selectedUsers.some(u => u.id === user.id) ? 
                    <FontAwesomeIcon icon={faCheckCircle} className="selected-icon" /> : 
                    <div className="select-circle"></div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedUsers.length > 0 && (
        <div className="selected-users-container">
          <h4>Usuarios seleccionados ({selectedUsers.length})</h4>
          <div className="selected-users-list">
            {selectedUsers.map(user => (
              <div className="selected-user-tag" key={user.id}>
                {user.username || user.email}
                <button onClick={() => toggleUserSelection(user)}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            ))}
          </div>
          <button 
            className="invite-selected-btn"
            onClick={() => onUserSelect(selectedUsers)}
          >
            <FontAwesomeIcon icon={faUserPlus} /> 
            Invitar {selectedUsers.length} {selectedUsers.length === 1 ? 'usuario' : 'usuarios'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserSearch;