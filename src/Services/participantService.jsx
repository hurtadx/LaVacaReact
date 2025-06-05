import apiService, { handleApiCall } from './apiService';

/**
 * Participants Service Layer - API Based
 * Uses specific backend endpoints for participant management
 */

/**
 * Obtiene los participantes de una vaca
 * @param {string} vacaId - ID de la vaca
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getVacaParticipants = async (vacaId) => {
  console.log("🚀 participantService.getVacaParticipants - vacaId:", vacaId);
  return handleApiCall(async () => {
    const endpoint = `/api/participants/vaca/${vacaId}/details`;
    console.log("🌐 Calling endpoint:", endpoint);
    
    const response = await apiService.get(endpoint);
    console.log("📡 API Response from participantService:", response);
    console.log("📊 Response participants:", response.participants);
    console.log("📊 Response data:", response.data);
    console.log("📊 Response type:", typeof response);
    console.log("📊 Is response array:", Array.isArray(response));
    
    // Manejo diferentes estructuras de respuesta:
    // 1. Backend returns { participants: [...] }
    // 2. Backend returns { data: [...] }
    // 3. Backend returns direct array [...]
    
    let participantsArray = [];
    
    if (response.participants && Array.isArray(response.participants)) {
      participantsArray = response.participants;
    } else if (response.data && Array.isArray(response.data)) {
      participantsArray = response.data;
    } else if (Array.isArray(response)) {
      // El backend está devolviendo un array directo - comportamiento actual
      participantsArray = response;
    } else {
      console.warn("🚨 Unexpected response format:", response);
      participantsArray = [];
    }
    
    console.log("✅ Final participants array:", participantsArray);
    return participantsArray;
  });
};

/**
 * Obtiene los participantes activos de una vaca
 * @param {string} vacaId - ID de la vaca
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getActiveParticipants = async (vacaId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/participants/vaca/${vacaId}/active`);
    return response.participants;
  });
};

/**
 * Obtiene los participantes con aportes pendientes
 * @param {string} vacaId - ID de la vaca
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getPendingParticipants = async (vacaId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/participants/vaca/${vacaId}/pending`);
    return response.participants;
  });
};

/**
 * Obtiene participantes con paginación
 * @param {string} vacaId - ID de la vaca
 * @param {Object} options - Opciones de paginación
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export const getPageableParticipants = async (vacaId, options = {}) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/participants/vaca/${vacaId}/pageable`, {
      page: options.page || 0,
      size: options.size || 10,
      sort: options.sort || 'joinDate,desc'
    });
    return response;
  });
};

/**
 * Obtiene las participaciones de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getUserParticipations = async (userId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/participants/user/${userId}`);
    return response.participants;
  });
};

/**
 * Obtiene participante por email
 * @param {string} email - Email del participante
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export const getParticipantByEmail = async (email) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/participants/email/${email}`);
    return response.participant;
  });
};

/**
 * Obtiene las contribuciones de un participante
 * @param {string} participantId - ID del participante
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getParticipantContributions = async (participantId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/participants/${participantId}/contributions`);
    return response.contributions;
  });
};

/**
 * Crea un nuevo participante
 * @param {Object} participantData - Datos del participante
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export const createParticipant = async (participantData) => {
  return handleApiCall(async () => {
    const response = await apiService.post('/api/participants', participantData);
    return response.participant;
  });
};

/**
 * Actualiza un participante
 * @param {string} participantId - ID del participante
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export const updateParticipant = async (participantId, updateData) => {
  return handleApiCall(async () => {
    const response = await apiService.put(`/api/participants/${participantId}`, updateData);
    return response.participant;
  });
};

/**
 * Actualiza el estado de un participante
 * @param {string} participantId - ID del participante
 * @param {string} status - Nuevo estado
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export const updateParticipantStatus = async (participantId, status) => {
  return handleApiCall(async () => {
    const response = await apiService.put(`/api/participants/${participantId}/status`, { status });
    return response.participant;
  });
};

/**
 * Activa un participante
 * @param {string} participantId - ID del participante
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export const activateParticipant = async (participantId) => {
  return handleApiCall(async () => {
    const response = await apiService.post(`/api/participants/${participantId}/activate`);
    return response.participant;
  });
};

/**
 * Desactiva un participante
 * @param {string} participantId - ID del participante
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export const deactivateParticipant = async (participantId) => {
  return handleApiCall(async () => {
    const response = await apiService.post(`/api/participants/${participantId}/deactivate`);
    return response.participant;
  });
};

/**
 * Elimina un participante
 * @param {string} participantId - ID del participante
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export const removeParticipant = async (participantId) => {
  return handleApiCall(async () => {
    const response = await apiService.delete(`/api/participants/${participantId}`);
    return response.result;
  });
};

/**
 * Invita múltiples usuarios a una vaca
 * @param {Object} inviteData - Datos de invitación múltiple
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export const bulkInviteParticipants = async (inviteData) => {
  return handleApiCall(async () => {
    const response = await apiService.post('/api/participants/bulk-invite', inviteData);
    return response.result;
  });
};

// Legacy functions for backward compatibility
export const getParticipants = getVacaParticipants;
export const addParticipant = createParticipant;

/**
 * Obtiene el balance de un participante
 * @param {string} participantId - ID del participante
 * @returns {Promise<{data: Object, error: string|null}>}
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
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export const calculateExitDistribution = async (participantId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/participants/${participantId}/exit-distribution`);
    return response.distribution;
  });
};

/**
 * Procesa la salida de un participante
 * @param {string} participantId - ID del participante
 * @param {Object} exitData - Datos de salida
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export const processParticipantExit = async (participantId, exitData = {}) => {
  return handleApiCall(async () => {
    const response = await apiService.post(`/api/participants/${participantId}/exit`, exitData);
    return response.result;
  });
};

/**
 * Obtiene las transacciones de un participante
 * @param {string} participantId - ID del participante
 * @param {Object} options - Opciones de filtrado
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getParticipantTransactions = async (participantId, options = {}) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/participants/${participantId}/transactions`, {
      page: options.page || 1,
      limit: options.limit || 20,
      start_date: options.startDate,
      end_date: options.endDate,
      type: options.type
    });
    return response.transactions;
  });
};

/**
 * Obtiene las estadísticas de un participante
 * @param {string} participantId - ID del participante
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export const getParticipantStats = async (participantId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/participants/${participantId}/stats`);
    return response.stats;
  });
};
