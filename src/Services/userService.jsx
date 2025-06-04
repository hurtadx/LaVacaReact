import apiService, { handleApiCall } from './apiService';
import { enrichUserData } from './authService';

/**
 * User Service Layer - API Based
 * Replaces Supabase calls with custom Spring Boot backend API endpoints
 * 
 * Backend API Specifications:
 * - UUIDs are required for all user IDs
 * - Proper 400 Bad Request error handling
 * - URL parameters used for user identification
 * - Profile endpoints follow RESTful conventions
 */

/**
 * Utility function to validate UUID format
 * @param {string} id - ID to validate
 * @returns {boolean} - True if valid UUID
 */
const isValidUUID = (id) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Obtiene el usuario actual autenticado
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiService.get('/api/auth/me');
    
    if (!response.user) {
      return { data: null, error: null };
    }

    const enrichedUser = await enrichUserData(response.user);
    return { data: enrichedUser, error: null };
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    
    if (error.status === 401) {
      return { data: null, error: 'No autenticado' };
    }
    
    return { data: null, error: error.message || 'Error al obtener usuario' };
  }
};

/**
 * Busca usuarios por nombre o email
 * @param {string} searchTerm - Término de búsqueda (nombre o email)
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const searchUsers = async (searchTerm) => {
  try {
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length < 3) {
      return { 
        data: [], 
        error: 'El término de búsqueda debe tener al menos 3 caracteres' 
      };
    }    const cleanSearchTerm = searchTerm.trim();
    
    console.log(`🔍 Buscando usuarios con término: "${cleanSearchTerm}"`);
    

    const response = await apiService.get(`/api/search/users?q=${encodeURIComponent(cleanSearchTerm)}&limit=10`);
      console.log(`📊 Respuesta de búsqueda:`, response);
    

    const usersArray = Array.isArray(response) ? response : (response.users || []);
    
    // Procesar los datos para mantener compatibilidad con el formato anterior
    const safeUserData = usersArray.map(user => ({
      id: user.id,
      username: user.username || user.email?.split('@')[0] || 'Usuario',
      email: user.email,
      avatarUrl: user.avatarUrl || user.avatar_url || null 
    }));
    
    console.log(`✅ Usuarios procesados (${safeUserData.length}):`, safeUserData);
    
    return { data: safeUserData, error: null };
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    
    if (error.status === 400) {
      return { 
        data: [], 
        error: 'Término de búsqueda inválido' 
      };
    }
    
    return { data: [], error: error.message || 'Error al buscar usuarios' };
  }
};

/**
 * Actualiza el perfil del usuario actual
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const updateUserProfile = async (userData) => {
  try {
    if (!userData || typeof userData !== 'object') {
      return { data: null, error: 'Datos de usuario inválidos' };
    }

    // Validar campos si están presentes
    if (userData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      return { data: null, error: 'Email inválido' };
    }

    if (userData.username && userData.username.trim().length < 3) {
      return { data: null, error: 'El nombre de usuario debe tener al menos 3 caracteres' };
    }

    // Limpiar datos
    const cleanUserData = { ...userData };
    if (cleanUserData.username) {
      cleanUserData.username = cleanUserData.username.trim();
    }
    if (cleanUserData.email) {
      cleanUserData.email = cleanUserData.email.trim().toLowerCase();
    }

    const response = await apiService.put('/api/profiles/me', cleanUserData);
    
    const enrichedUser = await enrichUserData(response.user || response);
    return { data: enrichedUser, error: null };
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    
    if (error.status === 400) {
      return { data: null, error: 'Datos de perfil inválidos' };
    }
    
    if (error.status === 409) {
      return { data: null, error: 'El email o nombre de usuario ya están en uso' };
    }
    
    return { data: null, error: error.message || 'Error al actualizar perfil' };
  }
};

/**
 * Obtiene el perfil de un usuario por ID
 * @param {string} userId - ID del usuario (UUID)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getUserProfile = async (userId) => {
  try {
    if (!userId || !isValidUUID(userId)) {
      return { data: null, error: 'ID de usuario inválido (UUID requerido)' };
    }

    const response = await apiService.get(`/api/profiles/${userId}`);
    return { data: response.profile || response, error: null };
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    
    if (error.status === 404) {
      return { data: null, error: 'Usuario no encontrado' };
    }
    
    if (error.status === 403) {
      return { data: null, error: 'No tienes permisos para ver este perfil' };
    }
    
    return { data: null, error: error.message || 'Error al obtener perfil' };
  }
};

/**
 * Obtiene múltiples perfiles de usuario por IDs
 * @param {Array<string>} userIds - Array de IDs de usuario (UUIDs)
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getUserProfiles = async (userIds) => {
  try {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return { data: [], error: null };
    }

    // Validar que todos los IDs sean UUIDs válidos
    for (const userId of userIds) {
      if (!isValidUUID(userId)) {
        return { 
          data: [], 
          error: `ID de usuario inválido: ${userId}` 
        };
      }
    }

    const response = await apiService.post('/api/profiles/batch', {
      userIds: userIds
    });
    
    return { data: response.profiles || [], error: null };
  } catch (error) {
    console.error("Error al obtener perfiles:", error);
    
    if (error.status === 400) {
      return { data: [], error: 'Lista de IDs de usuario inválida' };
    }
    
    return { data: [], error: error.message || 'Error al obtener perfiles' };
  }
};

/**
 * Sube un avatar para el usuario actual
 * @param {File} file - Archivo de imagen
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const uploadAvatar = async (file) => {
  try {
    if (!file) {
      return { data: null, error: 'Se requiere un archivo' };
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        data: null, 
        error: 'Tipo de archivo no válido. Solo se permiten JPEG, PNG, GIF y WebP' 
      };
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { 
        data: null, 
        error: 'El archivo es demasiado grande. Máximo 5MB' 
      };
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiService.upload('/api/profiles/me/avatar', formData);
    
    const enrichedUser = await enrichUserData(response.user || response);
    return { data: enrichedUser, error: null };
  } catch (error) {
    console.error("Error al subir avatar:", error);
    
    if (error.status === 400) {
      return { data: null, error: 'Archivo de avatar inválido' };
    }
    
    if (error.status === 413) {
      return { data: null, error: 'El archivo es demasiado grande' };
    }
    
    return { data: null, error: error.message || 'Error al subir avatar' };
  }
};

/**
 * Elimina el avatar del usuario actual
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const deleteAvatar = async () => {
  try {
    const response = await apiService.delete('/api/profiles/me/avatar');
    
    const enrichedUser = await enrichUserData(response.user || response);
    return { data: enrichedUser, error: null };
  } catch (error) {
    console.error("Error al eliminar avatar:", error);
    
    if (error.status === 404) {
      return { data: null, error: 'No hay avatar para eliminar' };
    }
    
    return { data: null, error: error.message || 'Error al eliminar avatar' };
  }
};

/**
 * Obtiene las estadísticas del usuario
 * @param {string} userId - ID del usuario (UUID, opcional, por defecto el usuario actual)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getUserStats = async (userId = null) => {
  try {
    if (userId && !isValidUUID(userId)) {
      return { data: null, error: 'ID de usuario inválido (UUID requerido)' };
    }

    const endpoint = userId ? `/api/users/${userId}/stats` : '/api/users/me/stats';
    const response = await apiService.get(endpoint);
    
    return { data: response.stats || response, error: null };
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    
    if (error.status === 404) {
      return { data: null, error: 'Usuario no encontrado' };
    }
    
    if (error.status === 403) {
      return { data: null, error: 'No tienes permisos para ver estas estadísticas' };
    }
    
    return { data: null, error: error.message || 'Error al obtener estadísticas' };
  }
};

/**
 * Obtiene el historial de transacciones del usuario
 * @param {string} userId - ID del usuario (UUID, opcional, por defecto el usuario actual)
 * @param {Object} options - Opciones de filtrado
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getUserTransactions = async (userId = null, options = {}) => {
  try {
    if (userId && !isValidUUID(userId)) {
      return { data: [], error: 'ID de usuario inválido (UUID requerido)' };
    }

    const endpoint = userId ? `/api/users/${userId}/transactions` : '/api/users/me/transactions';
    
    // Construir parámetros de query
    const queryParams = new URLSearchParams();
    if (options.page) queryParams.append('page', options.page);
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.startDate) queryParams.append('startDate', options.startDate);
    if (options.endDate) queryParams.append('endDate', options.endDate);
    if (options.vacaId) queryParams.append('vacaId', options.vacaId);
    if (options.type) queryParams.append('type', options.type);
    
    const queryString = queryParams.toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    const response = await apiService.get(url);
    return { data: response.transactions || [], error: null };
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    
    if (error.status === 404) {
      return { data: [], error: 'Usuario no encontrado' };
    }
    
    if (error.status === 403) {
      return { data: [], error: 'No tienes permisos para ver estas transacciones' };
    }
    
    return { data: [], error: error.message || 'Error al obtener transacciones' };
  }
};

/**
 * Obtiene las vacas del usuario
 * @param {string} userId - ID del usuario (UUID, opcional, por defecto el usuario actual)
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getUserVacas = async (userId = null) => {
  try {
    if (userId && !isValidUUID(userId)) {
      return { data: [], error: 'ID de usuario inválido (UUID requerido)' };
    }

    const endpoint = userId ? `/api/users/${userId}/vacas` : '/api/users/me/vacas';
    const response = await apiService.get(endpoint);
    
    return { data: response.vacas || [], error: null };
  } catch (error) {
    console.error("Error al obtener vacas del usuario:", error);
    
    if (error.status === 404) {
      return { data: [], error: null }; // No vacas encontradas, no es error
    }
    
    if (error.status === 403) {
      return { data: [], error: 'No tienes permisos para ver estas vacas' };
    }
    
    return { data: [], error: error.message || 'Error al obtener vacas' };
  }
};

/**
 * Obtiene las invitaciones pendientes del usuario
 * @param {string} userId - ID del usuario (UUID, opcional, por defecto el usuario actual)
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getUserInvitations = async (userId = null) => {
  try {
    if (userId && !isValidUUID(userId)) {
      return { data: [], error: 'ID de usuario inválido (UUID requerido)' };
    }

    const endpoint = userId ? `/api/users/${userId}/invitations` : '/api/users/me/invitations';
    const response = await apiService.get(endpoint);
    
    return { data: response.invitations || [], error: null };
  } catch (error) {
    console.error("Error al obtener invitaciones:", error);
    
    if (error.status === 404) {
      return { data: [], error: null }; // No invitaciones encontradas, no es error
    }
    
    if (error.status === 403) {
      return { data: [], error: 'No tienes permisos para ver estas invitaciones' };
    }
    
    return { data: [], error: error.message || 'Error al obtener invitaciones' };
  }
};

/**
 * Actualiza las preferencias del usuario
 * @param {Object} preferences - Preferencias a actualizar
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const updateUserPreferences = async (preferences) => {
  try {
    if (!preferences || typeof preferences !== 'object') {
      return { data: null, error: 'Preferencias inválidas' };
    }

    const response = await apiService.put('/api/users/me/preferences', preferences);
    return { data: response.preferences || response, error: null };
  } catch (error) {
    console.error("Error al actualizar preferencias:", error);
    
    if (error.status === 400) {
      return { data: null, error: 'Datos de preferencias inválidos' };
    }
    
    return { data: null, error: error.message || 'Error al actualizar preferencias' };
  }
};

/**
 * Obtiene las preferencias del usuario
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getUserPreferences = async () => {
  try {
    const response = await apiService.get('/api/users/me/preferences');
    return { data: response.preferences || response, error: null };
  } catch (error) {
    console.error("Error al obtener preferencias:", error);
    
    if (error.status === 404) {
      // No hay preferencias configuradas, devolver configuración por defecto
      return { 
        data: {
          notifications: true,
          emailAlerts: false,
          theme: 'light',
          language: 'es'
        }, 
        error: null 
      };
    }
    
    return { data: null, error: error.message || 'Error al obtener preferencias' };
  }
};

/**
 * Elimina la cuenta del usuario actual
 * @param {string} password - Contraseña para confirmación
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const deleteUserAccount = async (password) => {
  try {
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      return { data: null, error: 'Se requiere la contraseña para confirmar la eliminación' };
    }

    const response = await apiService.delete('/api/users/me', {
      password: password.trim()
    });
    
    return { data: response.result || response, error: null };
  } catch (error) {
    console.error("Error al eliminar cuenta:", error);
    
    if (error.status === 400) {
      return { data: null, error: 'Contraseña incorrecta' };
    }
    
    if (error.status === 403) {
      return { data: null, error: 'No tienes permisos para eliminar esta cuenta' };
    }
    
    return { data: null, error: error.message || 'Error al eliminar cuenta' };
  }
};

/**
 * Exporta los datos del usuario (GDPR compliance)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const exportUserData = async () => {
  try {
    const response = await apiService.get('/api/users/me/export');
    return { data: response.data || response, error: null };
  } catch (error) {
    console.error("Error al exportar datos:", error);
    
    if (error.status === 403) {
      return { data: null, error: 'No tienes permisos para exportar datos' };
    }
    
    return { data: null, error: error.message || 'Error al exportar datos' };
  }
};

// Mantener compatibilidad con la función anterior de auth state change
export { onAuthStateChange } from './authService';
