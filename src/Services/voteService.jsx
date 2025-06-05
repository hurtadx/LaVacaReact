import apiService, { handleApiCall } from './apiService';

/**
 * Votes Service Layer - API Based
 * Handles voting system for community withdrawals and decisions
 */

/**
 * Crea una nueva votación para retiro comunitario
 * @param {Object} voteData - Datos de la votación
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const createVote = async (voteData) => {
  return handleApiCall(async () => {
    const response = await apiService.post('/api/votes', {
      vaca_id: voteData.vacaId,
      transaction_id: voteData.transactionId,
      title: voteData.title,
      description: voteData.description,
      amount: parseFloat(voteData.amount),
      created_by: voteData.createdBy,
      expires_at: voteData.expiresAt
    });
    return response.vote;
  });
};

/**
 * Obtiene las votaciones de una vaca
 * @param {string} vacaId - ID de la vaca
 * @param {string} status - Estado de las votaciones ('active', 'completed', 'expired')
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export const getVacaVotes = async (vacaId, status = null) => {
  return handleApiCall(async () => {
    const params = {};
    if (status) params.status = status;
    
    const response = await apiService.get(`/api/votes/vaca/${vacaId}`, params);
    return response.votes;
  });
};

/**
 * Obtiene los detalles de una votación específica
 * @param {string} voteId - ID de la votación
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getVoteDetails = async (voteId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/votes/${voteId}`);
    return response.vote;
  });
};

/**
 * Emite un voto
 * @param {string} voteId - ID de la votación
 * @param {Object} voteData - Datos del voto
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const castVote = async (voteId, voteData) => {
  return handleApiCall(async () => {
    const response = await apiService.post(`/api/votes/${voteId}/cast`, {
      user_id: voteData.userId,
      participant_id: voteData.participantId,
      vote: voteData.vote, // 'approve' o 'reject'
      comment: voteData.comment || null
    });
    return response.vote_cast;
  });
};

/**
 * Obtiene los votos de una votación específica
 * @param {string} voteId - ID de la votación
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export const getVoteCasts = async (voteId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/votes/${voteId}/casts`);
    return response.vote_casts;
  });
};

/**
 * Actualiza un voto ya emitido
 * @param {string} voteId - ID de la votación
 * @param {string} userId - ID del usuario
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const updateVote = async (voteId, userId, updateData) => {
  return handleApiCall(async () => {
    const response = await apiService.put(`/api/votes/${voteId}/cast`, {
      user_id: userId,
      ...updateData
    });
    return response.vote_cast;
  });
};

/**
 * Elimina un voto (si está permitido)
 * @param {string} voteId - ID de la votación
 * @param {string} userId - ID del usuario
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const deleteVote = async (voteId, userId) => {
  return handleApiCall(async () => {
    const response = await apiService.delete(`/api/votes/${voteId}/cast`, {
      user_id: userId
    });
    return response.result;
  });
};

/**
 * Cierra una votación manualmente
 * @param {string} voteId - ID de la votación
 * @param {string} userId - ID del usuario que cierra
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const closeVote = async (voteId, userId) => {
  return handleApiCall(async () => {
    const response = await apiService.put(`/api/votes/${voteId}/close`, {
      closed_by: userId
    });
    return response.vote;
  });
};

/**
 * Obtiene el resultado de una votación
 * @param {string} voteId - ID de la votación
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getVoteResult = async (voteId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/votes/${voteId}/results`);
    return response.result;
  });
};

/**
 * Obtiene las votaciones en las que puede participar un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export const getUserActiveVotes = async (userId) => {  return handleApiCall(async () => {
    const response = await apiService.get(`/api/votes/user/${userId}/pending`);
    return response.votes;
  });
};

/**
 * Obtiene el historial de votos de un usuario
 * @param {string} userId - ID del usuario
 * @param {Object} options - Opciones de filtrado
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export const getUserVoteHistory = async (userId, options = {}) => {  return handleApiCall(async () => {
    const queryParams = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      ...(options.vacaId && { vaca_id: options.vacaId })
    });
    
    const response = await apiService.get(`/api/votes/user/${userId}?${queryParams}`);
    return response.votes;
  });
};

/**
 * Obtiene estadísticas de votaciones
 * @param {string} vacaId - ID de la vaca (opcional)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getVoteStats = async (vacaId = null) => {
  return handleApiCall(async () => {
    const endpoint = vacaId 
      ? `/api/vacas/${vacaId}/votes/stats`
      : '/api/votes/stats';
    
    const response = await apiService.get(endpoint);
    return response.stats;
  });
};

/**
 * Notifica a los participantes sobre una nueva votación
 * @param {string} voteId - ID de la votación
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const notifyVoteParticipants = async (voteId) => {
  return handleApiCall(async () => {
    const response = await apiService.post(`/api/votes/${voteId}/notify`);
    return response.result;
  });
};

/**
 * Obtiene las reglas de votación de una vaca
 * @param {string} vacaId - ID de la vaca
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getVoteRules = async (vacaId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/vacas/${vacaId}/vote-rules`);
    return response.rules;
  });
};

/**
 * Actualiza las reglas de votación de una vaca
 * @param {string} vacaId - ID de la vaca
 * @param {Object} rules - Nuevas reglas
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const updateVoteRules = async (vacaId, rules) => {
  return handleApiCall(async () => {
    const response = await apiService.put(`/api/vacas/${vacaId}/vote-rules`, rules);
    return response.rules;
  });
};
