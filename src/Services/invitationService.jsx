import apiService, { handleApiCall } from './apiService';

/**
 * Invitations Service Layer - API Based
 * Handles invitation management operations
 */

/**
 * Crea nuevas invitaciones para una vaca
 * @param {string} vacaId - ID de la vaca
 * @param {Array<string>} userIds - Array de IDs de usuarios
 * @param {string} senderId - ID del usuario que envía las invitaciones
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const createInvitations = async (vacaId, userIds, senderId) => {
  return handleApiCall(async () => {
    const payload = {
      vaca_id: vacaId,
      user_ids: userIds,
      sender_id: senderId
    };
    if (import.meta.env.DEV) {
      console.log('POST /api/invitations payload:', payload);
    }
    const response = await apiService.post('/api/invitations', payload);
    return response.result;
  });
};

/**
 * Obtiene las invitaciones de un usuario (recibidas)
 * @param {string} userId - ID del usuario
 * @param {string} status - Estado de las invitaciones ('pending', 'accepted', 'rejected')
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export const getUserInvitations = async (userId, status = 'pending') => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/invitations/user/${userId}/received`, {
      status: status
    });
    return response.invitations;
  });
};

/**
 * Obtiene las invitaciones enviadas por un usuario
 * @param {string} senderId - ID del usuario que envió las invitaciones
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export const getSentInvitations = async (senderId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/invitations/user/${senderId}/sent`);
    return response.invitations;
  });
};

/**
 * Obtiene las invitaciones de una vaca específica
 * @param {string} vacaId - ID de la vaca
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export const getVacaInvitations = async (vacaId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/invitations/vaca/${vacaId}`);
    return response.invitations;
  });
};

/**
 * Responde a una invitación
 * @param {string} invitationId - ID de la invitación
 * @param {string} response - Respuesta ('accept' o 'reject')
 * @param {string} userId - ID del usuario que responde
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const respondToInvitation = async (invitationId, response, userId) => {
  return handleApiCall(async () => {
    if (response === 'accept') {
      const apiResponse = await apiService.put(`/api/invitations/${invitationId}/accept`);
      return apiResponse.result;
    } else {
      const apiResponse = await apiService.put(`/api/invitations/${invitationId}/reject`);
      return apiResponse.result;
    }
  });
};

/**
 * Acepta una invitación
 * @param {string} invitationId - ID de la invitación
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export const acceptInvitation = async (invitationId) => {
  return handleApiCall(async () => {
    const response = await apiService.put(`/api/invitations/${invitationId}/accept`);
    return response.result;
  });
};

/**
 * Rechaza una invitación
 * @param {string} invitationId - ID de la invitación
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export const rejectInvitation = async (invitationId) => {
  return handleApiCall(async () => {
    const response = await apiService.put(`/api/invitations/${invitationId}/reject`);
    return response.result;
  });
};

/**
 * Cancela una invitación enviada
 * @param {string} invitationId - ID de la invitación
 * @param {string} senderId - ID del usuario que envió la invitación
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const cancelInvitation = async (invitationId, senderId) => {
  return handleApiCall(async () => {
    const response = await apiService.delete(`/api/invitations/${invitationId}`, {
      sender_id: senderId
    });
    return response.result;
  });
};

/**
 * Reenvía una invitación
 * @param {string} invitationId - ID de la invitación
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const resendInvitation = async (invitationId) => {
  return handleApiCall(async () => {
    const response = await apiService.post(`/api/invitations/${invitationId}/resend`);
    return response.invitation;
  });
};

/**
 * Obtiene los detalles de una invitación específica
 * @param {string} invitationId - ID de la invitación
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getInvitationDetails = async (invitationId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/invitations/${invitationId}`);
    return response.invitation;
  });
};

/**
 * Marca una invitación como leída
 * @param {string} invitationId - ID de la invitación
 * @param {string} userId - ID del usuario
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const markInvitationAsRead = async (invitationId, userId) => {
  return handleApiCall(async () => {
    const response = await apiService.put(`/api/invitations/${invitationId}/read`, {
      user_id: userId
    });
    return response.invitation;
  });
};

/**
 * Obtiene estadísticas de invitaciones
 * @param {string} userId - ID del usuario (opcional)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getInvitationStats = async (userId = null) => {
  return handleApiCall(async () => {
    const endpoint = userId 
      ? `/api/users/${userId}/invitations/stats`
      : '/api/invitations/stats';
    
    const response = await apiService.get(endpoint);
    return response.stats;
  });
};
