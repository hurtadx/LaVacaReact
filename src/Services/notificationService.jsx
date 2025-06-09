import apiService, { handleApiCall } from './apiService';

/**
 * Notification Service Layer - API Based
 * Handles notification management operations
 */

/**
 * Obtiene las notificaciones de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export const getUserNotifications = async (userId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/notifications/user/${userId}`);
    console.log('Respuesta completa de notificaciones:', response);
    // El backend retorna un array directamente
    return response;
  });
};

/**
 * Marca una notificación como leída
 * @param {string} notificationId - ID de la notificación
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const markNotificationAsRead = async (notificationId) => {
  return handleApiCall(async () => {
    const response = await apiService.put(`/api/notifications/${notificationId}/read`);
    return response.notification;
  });
};

/**
 * Obtiene una notificación específica por su ID
 * @param {string} notificationId - ID de la notificación
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getNotificationById = async (notificationId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/notifications/${notificationId}`);
    return response.notification;
  });
};
