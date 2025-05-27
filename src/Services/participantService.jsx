import apiService, { handleApiCall } from './apiService';

/**
 * Participants Service Layer - API Based
 * Handles participant management operations
 */

/**
 * Obtiene los participantes de una vaca
 * @param {string} vacaId - ID de la vaca
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export const getParticipants = async (vacaId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/vacas/${vacaId}/participants`);
    return response.participants;
  });
};

/**
 * Añade un nuevo participante a una vaca
 * @param {string} vacaId - ID de la vaca
 * @param {Object} participantData - Datos del participante
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const addParticipant = async (vacaId, participantData) => {
  return handleApiCall(async () => {
    const response = await apiService.post(`/api/vacas/${vacaId}/participants`, {
      name: participantData.name,
      email: participantData.email,
      user_id: participantData.userId || null
    });
    return response.participant;
  });
};

/**
 * Actualiza los datos de un participante
 * @param {string} participantId - ID del participante
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const updateParticipant = async (participantId, updateData) => {
  return handleApiCall(async () => {
    const response = await apiService.put(`/api/participants/${participantId}`, updateData);
    return response.participant;
  });
};

/**
 * Elimina un participante de una vaca
 * @param {string} participantId - ID del participante
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const removeParticipant = async (participantId) => {
  return handleApiCall(async () => {
    const response = await apiService.delete(`/api/participants/${participantId}`);
    return response.result;
  });
};

/**
 * Obtiene el balance de un participante específico
 * @param {string} participantId - ID del participante
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getParticipantBalance = async (participantId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/participants/${participantId}/balance`);
    return response.balance;
  });
};

/**
 * Calcula la distribución de salida para un participante
 * @param {string} participantId - ID del participante
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const calculateExitDistribution = async (participantId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/participants/${participantId}/exit-calculation`);
    return response.calculation;
  });
};

/**
 * Procesa la salida de un participante
 * @param {string} participantId - ID del participante
 * @param {Object} exitData - Datos de la salida
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const processParticipantExit = async (participantId, exitData) => {
  return handleApiCall(async () => {
    const response = await apiService.post(`/api/participants/${participantId}/exit`, exitData);
    return response.result;
  });
};

/**
 * Obtiene el historial de transacciones de un participante
 * @param {string} participantId - ID del participante
 * @param {Object} options - Opciones de filtrado
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export const getParticipantTransactions = async (participantId, options = {}) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/participants/${participantId}/transactions`, {
      page: options.page || 1,
      limit: options.limit || 20,
      type: options.type,
      start_date: options.startDate,
      end_date: options.endDate
    });
    return response.transactions;
  });
};

/**
 * Obtiene estadísticas de un participante
 * @param {string} participantId - ID del participante
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getParticipantStats = async (participantId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/participants/${participantId}/stats`);
    return response.stats;
  });
};

/**
 * Actualiza el estado de actividad de un participante
 * @param {string} participantId - ID del participante
 * @param {boolean} isActive - Estado de actividad
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const updateParticipantStatus = async (participantId, isActive) => {
  return handleApiCall(async () => {
    const response = await apiService.patch(`/api/participants/${participantId}/status`, {
      is_active: isActive
    });
    return response.participant;
  });
};
