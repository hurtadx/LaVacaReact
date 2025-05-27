import apiService, { handleApiCall } from './apiService';
import { enrichUserData } from './authService.new';

/**
 * User Service Layer - API Based
 * Replaces Supabase calls with custom backend API endpoints
 */

/**
 * Obtiene el usuario actual autenticado
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getCurrentUser = async () => {
  return handleApiCall(async () => {
    const response = await apiService.get('/api/auth/me');
    
    if (!response.user) {
      return null;
    }

    return await enrichUserData(response.user);
  });
};

/**
 * Busca usuarios por nombre o email
 * @param {string} searchTerm - Término de búsqueda (nombre o email)
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const searchUsers = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 3) {
      return { data: [], error: 'El término de búsqueda debe tener al menos 3 caracteres' };
    }

    const response = await apiService.get('/api/users/search', {
      q: searchTerm.trim(),
      limit: 10
    });

    // Procesar los datos para mantener compatibilidad con el formato anterior
    const safeUserData = response.users.map(user => ({
      id: user.id,
      username: user.username || user.email.split('@')[0],
      email: user.email,
      avatarUrl: user.avatar_url || null 
    }));
    
    return { data: safeUserData, error: null };
  } catch (error) {
    console.error("Error al buscar usuarios:", error.message);
    return { data: [], error: error.message };
  }
};

/**
 * Actualiza el perfil del usuario actual
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const updateUserProfile = async (userData) => {
  return handleApiCall(async () => {
    const response = await apiService.put('/api/profiles/me', userData);
    return await enrichUserData(response.user);
  });
};

/**
 * Obtiene el perfil de un usuario por ID
 * @param {string} userId - ID del usuario
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getUserProfile = async (userId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/profiles/${userId}`);
    return response.profile;
  });
};

/**
 * Obtiene múltiples perfiles de usuario por IDs
 * @param {Array<string>} userIds - Array de IDs de usuario
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getUserProfiles = async (userIds) => {
  return handleApiCall(async () => {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    const response = await apiService.post('/api/profiles/batch', {
      user_ids: userIds
    });
    
    return response.profiles;
  });
};

/**
 * Sube un avatar para el usuario actual
 * @param {File} file - Archivo de imagen
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const uploadAvatar = async (file) => {
  return handleApiCall(async () => {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiService.upload('/api/profiles/me/avatar', formData);
    return response.user;
  });
};

/**
 * Elimina el avatar del usuario actual
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const deleteAvatar = async () => {
  return handleApiCall(async () => {
    const response = await apiService.delete('/api/profiles/me/avatar');
    return response.user;
  });
};

/**
 * Obtiene las estadísticas del usuario
 * @param {string} userId - ID del usuario (opcional, por defecto el usuario actual)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getUserStats = async (userId = null) => {
  return handleApiCall(async () => {
    const endpoint = userId ? `/api/users/${userId}/stats` : '/api/users/me/stats';
    const response = await apiService.get(endpoint);
    return response.stats;
  });
};

/**
 * Obtiene el historial de transacciones del usuario
 * @param {string} userId - ID del usuario (opcional, por defecto el usuario actual)
 * @param {Object} options - Opciones de filtrado
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getUserTransactions = async (userId = null, options = {}) => {
  return handleApiCall(async () => {
    const endpoint = userId ? `/api/users/${userId}/transactions` : '/api/users/me/transactions';
    const response = await apiService.get(endpoint, {
      page: options.page || 1,
      limit: options.limit || 20,
      start_date: options.startDate,
      end_date: options.endDate,
      vaca_id: options.vacaId,
      type: options.type
    });
    
    return response.transactions;
  });
};

/**
 * Obtiene las vacas del usuario
 * @param {string} userId - ID del usuario (opcional, por defecto el usuario actual)
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getUserVacas = async (userId = null) => {
  return handleApiCall(async () => {
    const endpoint = userId ? `/api/users/${userId}/vacas` : '/api/users/me/vacas';
    const response = await apiService.get(endpoint);
    return response.vacas;
  });
};

/**
 * Obtiene las invitaciones pendientes del usuario
 * @param {string} userId - ID del usuario (opcional, por defecto el usuario actual)
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getUserInvitations = async (userId = null) => {
  return handleApiCall(async () => {
    const endpoint = userId ? `/api/users/${userId}/invitations` : '/api/users/me/invitations';
    const response = await apiService.get(endpoint);
    return response.invitations;
  });
};

/**
 * Actualiza las preferencias del usuario
 * @param {Object} preferences - Preferencias a actualizar
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const updateUserPreferences = async (preferences) => {
  return handleApiCall(async () => {
    const response = await apiService.put('/api/users/me/preferences', preferences);
    return response.preferences;
  });
};

/**
 * Obtiene las preferencias del usuario
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getUserPreferences = async () => {
  return handleApiCall(async () => {
    const response = await apiService.get('/api/users/me/preferences');
    return response.preferences;
  });
};

/**
 * Elimina la cuenta del usuario actual
 * @param {string} password - Contraseña para confirmación
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const deleteUserAccount = async (password) => {
  return handleApiCall(async () => {
    const response = await apiService.delete('/api/users/me', {
      password
    });
    return response.result;
  });
};

/**
 * Exporta los datos del usuario (GDPR compliance)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const exportUserData = async () => {
  return handleApiCall(async () => {
    const response = await apiService.get('/api/users/me/export');
    return response.data;
  });
};

// Mantener compatibilidad con la función anterior de auth state change
export { onAuthStateChange } from './authService.new';
