import React, { useState } from 'react';
import { searchUsers } from '../../../../Services/userService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import './UserSearch.css';

const UserSearch = ({ onUserSelect, excludeUsers = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleSearch = async () => {
    if (searchTerm.trim().length < 3) {
      setError('Ingresa al menos 3 caracteres para buscar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await searchUsers(searchTerm);
      
      if (error) {
        setError(error);
        setSearchResults([]);
      } else {
       
        const filteredResults = data.filter(
          user => !excludeUsers.includes(user.id)
        );
        setSearchResults(filteredResults);
      }
    } catch (err) {
      setError('Error al buscar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (user) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="user-search">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o email"
            className="search-input"
            minLength={3}
          />
          <button 
            type="submit" 
            className="search-btn"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faSearch} />
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      {error && <p className="error-message">{error}</p>}

      <div className="search-results">
        {searchResults.length > 0 ? (
          searchResults.map(user => (
            <div 
              key={user.id} 
              className={`user-item ${selectedUsers.some(u => u.id === user.id) ? 'selected' : ''}`}
              onClick={() => toggleUserSelection(user)}
            >
              <div className="user-avatar">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.username} />
                ) : (
                  <div className="avatar-placeholder">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="user-info">
                <h4 className="user-username">{user.username}</h4>
                <p className="user-email">{user.email}</p>
              </div>
            </div>
          ))
        ) : searchTerm && !loading ? (
          <p className="no-results">No se encontraron usuarios con ese criterio</p>
        ) : null}
      </div>

      {selectedUsers.length > 0 && (
        <div className="selected-users-container">
          <h4>Usuarios seleccionados ({selectedUsers.length})</h4>
          <div className="selected-users-list">
            {selectedUsers.map(user => (
              <div className="selected-user-tag" key={user.id}>
                {user.username}
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
            Invitar seleccionados
          </button>
        </div>
      )}
    </div>
  );
};

export default UserSearch;