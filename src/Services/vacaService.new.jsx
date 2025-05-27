import apiService, { handleApiCall } from './apiService';

/**
 * Vaca Service Layer - API Based
 * Replaces Supabase calls with custom backend API endpoints
 */

/**
 * Invita participantes a una vaca
 * @param {string} vacaId - ID de la vaca
 * @param {Array<string>} userIds - Array de IDs de usuarios a invitar
 * @param {string} senderId - ID del usuario que envía las invitaciones
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const inviteParticipants = async (vacaId, userIds, senderId) => {
  try {
    if (!vacaId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return { 
        data: null, 
        error: 'Se requiere un ID de vaca y al menos un usuario para invitar' 
      };
    }

    const response = await apiService.post('/api/invitations', {
      vaca_id: vacaId,
      user_ids: userIds,
      sender_id: senderId
    });

    return { 
      data: {
        sent: response.sent_count,
        invitations: response.invitations
      }, 
      error: null 
    };
  } catch (error) {
    console.error("Error al invitar participantes:", error);
    return { data: null, error: error.message };
  }
};

/**
 * Obtiene las invitaciones de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getInvitations = async (userId) => {
  try {
    if (!userId) {
      return { data: [], error: 'Se requiere un ID de usuario' };
    }
    
    const response = await apiService.get('/api/invitations/user', {
      user_id: userId,
      status: 'pending'
    });
    
    return { data: response.invitations || [], error: null };
  } catch (error) {
    console.error("Error al obtener invitaciones:", error);
    return { data: [], error: error.message };
  }
};

/**
 * Responde a una invitación (aceptar o rechazar)
 * @param {string} invitationId - ID de la invitación
 * @param {string} userId - ID del usuario
 * @param {string} response - Respuesta: 'accept' o 'reject'
 * @returns {Promise<{success: boolean, error: string|null, data?: Object}>}
 */
export const respondToInvitation = async (invitationId, userId, response) => {
  try {
    if (!invitationId || !userId || !['accept', 'reject'].includes(response)) {
      return { 
        success: false, 
        error: 'Parámetros inválidos. La respuesta debe ser "accept" o "reject"' 
      };
    }
    
    const apiResponse = await apiService.patch(`/api/invitations/${invitationId}`, {
      user_id: userId,
      status: response === 'accept' ? 'accepted' : 'rejected'
    });
    
    return { 
      success: true, 
      error: null,
      data: {
        status: response === 'accept' ? 'accepted' : 'rejected',
        vaca_id: apiResponse.vaca_id
      }
    };
  } catch (error) {
    console.error("Error al responder invitación:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Verifica qué tablas existen - Simplificado para API
 * @returns {Promise<Object>} - Estado de disponibilidad del servicio
 */
export const checkTablesExist = async () => {
  try {
    const response = await apiService.get('/api/health');
    
    return {
      vacas: response.services?.vacas || true,
      participants: response.services?.participants || true,
      transactions: response.services?.transactions || true,
      database_connected: response.database_connected || true
    };
  } catch (error) {
    console.warn("Error al verificar estado del servicio:", error);
    // Asumir que está disponible si no podemos verificar
    return {
      vacas: true,
      participants: true,
      transactions: true,
      database_connected: false
    };
  }
};

/**
 * Crea una nueva vaca
 * @param {Object} vacaData - Datos de la vaca
 * @param {string} userId - ID del usuario creador
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const createVaca = async (vacaData, userId) => {
  try {
    if (!vacaData.name || !vacaData.goal) {
      return { 
        data: null, 
        error: 'El nombre y la meta son campos obligatorios' 
      };
    }

    const response = await apiService.post('/api/vacas', {
      name: vacaData.name,
      description: vacaData.description || '',
      goal: parseFloat(vacaData.goal),
      deadline: vacaData.deadline || null,
      color: vacaData.color || '#3F60E5',
      user_id: userId,
      participants: vacaData.participants || []
    });

    return { data: response.vaca, error: null };
  } catch (error) {
    console.error("Error al crear vaca:", error);
    return { data: null, error: error.message };
  }
};

/**
 * Obtiene las vacas de un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getUserVacas = async (userId) => {
  console.log("getUserVacas called with userId:", userId);
  
  try {
    const response = await apiService.get('/api/vacas/user', {
      user_id: userId
    });

    console.log("User vacas API response:", response);

    return { data: response.vacas || [], error: null };
  } catch (error) {
    console.error("Error al obtener vacas:", error);
    return { data: [], error: error.message || "Error desconocido" };
  }
};

/**
 * Obtiene los detalles de una vaca específica
 * @param {string} vacaId - ID de la vaca
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getVacaDetails = async (vacaId) => {
  try {
    const response = await apiService.get(`/api/vacas/${vacaId}`);
    return { data: response.vaca, error: null };
  } catch (error) {
    console.error("Error al obtener detalles de vaca:", error);
    return { data: null, error: error.message };
  }
};

/**
 * Añade una transacción a una vaca
 * @param {Object} transactionData - Datos de la transacción
 * @returns {Promise<{data: Object|null, error: string|null, newTotal?: number}>}
 */
export const addVacaTransaction = async (transactionData) => {
  try {
    const { vacaId, amount, description, userId } = transactionData;
    
    if (!vacaId || !amount || !userId) {
      return {
        data: null,
        error: 'Faltan datos para la transacción'
      };
    }
    
    const response = await apiService.post('/api/transactions', {
      vaca_id: vacaId,
      amount: parseFloat(amount),
      description: description || 'Pago',
      user_id: userId,
      type: 'contribution'
    });
    
    return {
      data: response.transaction,
      error: null,
      newTotal: response.new_vaca_total
    };
  } catch (error) {
    console.error("Error al añadir pago:", error);
    return { data: null, error: error.message };
  }
};

/**
 * Actualiza los datos de una vaca
 * @param {string} vacaId - ID de la vaca
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const updateVaca = async (vacaId, updateData) => {
  return handleApiCall(async () => {
    const response = await apiService.put(`/api/vacas/${vacaId}`, updateData);
    return response.vaca;
  });
};

/**
 * Elimina una vaca (marca como inactiva)
 * @param {string} vacaId - ID de la vaca
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const deleteVaca = async (vacaId) => {
  return handleApiCall(async () => {
    const response = await apiService.delete(`/api/vacas/${vacaId}`);
    return response.result;
  });
};

/**
 * Obtiene los participantes de una vaca
 * @param {string} vacaId - ID de la vaca
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getVacaParticipants = async (vacaId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/vacas/${vacaId}/participants`);
    return response.participants;
  });
};

/**
 * Añade un participante a una vaca
 * @param {string} vacaId - ID de la vaca
 * @param {Object} participantData - Datos del participante
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const addVacaParticipant = async (vacaId, participantData) => {
  return handleApiCall(async () => {
    const response = await apiService.post(`/api/vacas/${vacaId}/participants`, participantData);
    return response.participant;
  });
};

/**
 * Elimina un participante de una vaca
 * @param {string} vacaId - ID de la vaca
 * @param {string} participantId - ID del participante
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const removeVacaParticipant = async (vacaId, participantId) => {
  return handleApiCall(async () => {
    const response = await apiService.delete(`/api/vacas/${vacaId}/participants/${participantId}`);
    return response.result;
  });
};

/**
 * Obtiene las transacciones de una vaca
 * @param {string} vacaId - ID de la vaca
 * @param {Object} options - Opciones de filtrado
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getVacaTransactions = async (vacaId, options = {}) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/vacas/${vacaId}/transactions`, {
      page: options.page || 1,
      limit: options.limit || 50,
      type: options.type,
      start_date: options.startDate,
      end_date: options.endDate
    });
    return response.transactions;
  });
};

/**
 * Obtiene estadísticas de una vaca
 * @param {string} vacaId - ID de la vaca
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getVacaStats = async (vacaId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/vacas/${vacaId}/stats`);
    return response.stats;
  });
};

/**
 * Cierra una vaca (marca como completada)
 * @param {string} vacaId - ID de la vaca
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const closeVaca = async (vacaId) => {
  return handleApiCall(async () => {
    const response = await apiService.patch(`/api/vacas/${vacaId}/close`);
    return response.vaca;
  });
};

/**
 * Reabre una vaca cerrada
 * @param {string} vacaId - ID de la vaca
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const reopenVaca = async (vacaId) => {
  return handleApiCall(async () => {
    const response = await apiService.patch(`/api/vacas/${vacaId}/reopen`);
    return response.vaca;
  });
};
