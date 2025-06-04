import apiService, { handleApiCall } from './apiService';

/**
 * Vaca Service Layer - API Based
 * Replaces Supabase calls with custom Spring Boot backend API endpoints
 *  * Backend API Specifications:
 * - UUIDs are required for all IDs
 * - Status values: vacas use EXACTLY ('draft', 'open', 'closed', 'canceled') - DATABASE CONSTRAINT
 * - Invitations use specific format ('pending', 'accepted', 'rejected', 'cancelled')
 * - URL parameters used instead of body parameters for user identification
 * - Proper 400 Bad Request error handling
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
 * Utility function to validate vaca status values
 * @param {string} status - Status to validate
 * @returns {boolean} - True if valid status
 */
const isValidVacaStatus = (status) => {
  const validStatuses = ['draft', 'open', 'closed', 'canceled'];
  return validStatuses.includes(status);
};

/**
 * Invita participantes a una vaca
 * @param {string} vacaId - ID de la vaca (UUID)
 * @param {Array<string>} userIds - Array de IDs de usuarios a invitar (UUIDs)
 * @param {string} senderId - ID del usuario que envía las invitaciones (UUID)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const inviteParticipants = async (vacaId, userIds, senderId) => {
  try {
    // Validación de parámetros
    if (!vacaId || !isValidUUID(vacaId)) {
      return { data: null, error: 'Se requiere un ID de vaca válido (UUID)' };
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return { data: null, error: 'Se requiere al menos un usuario para invitar' };
    }

    if (!senderId || !isValidUUID(senderId)) {
      return { data: null, error: 'Se requiere un ID de remitente válido (UUID)' };
    }

    // Validar que todos los userIds sean UUIDs válidos
    for (const userId of userIds) {
      if (!isValidUUID(userId)) {
        return { data: null, error: `ID de usuario inválido: ${userId}` };
      }
    }

    // Enviar invitaciones usando senderId como parámetro URL
    const response = await apiService.post(`/api/invitations?senderId=${senderId}`, {
      vacaId: vacaId,
      userIds: userIds
    });

    return { 
      data: {
        sent: response.sentCount || response.sent_count,
        invitations: response.invitations || []
      }, 
      error: null 
    };
  } catch (error) {
    console.error("Error al invitar participantes:", error);
    
    // Manejo específico de errores 400 Bad Request
    if (error.status === 400) {
      return { 
        data: null, 
        error: error.message || 'Datos de invitación inválidos' 
      };
    }
    
    return { data: null, error: error.message || 'Error al enviar invitaciones' };
  }
};

/**
 * Obtiene las invitaciones de un usuario
 * @param {string} userId - ID del usuario (UUID)
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getInvitations = async (userId) => {
  try {
    if (!userId || !isValidUUID(userId)) {
      return { data: [], error: 'Se requiere un ID de usuario válido (UUID)' };
    }
    
    // Usar userId como parámetro URL y status como query parameter
    const response = await apiService.get(`/api/invitations?userId=${userId}&status=pending`);
    
    return { data: response.invitations || [], error: null };
  } catch (error) {
    console.error("Error al obtener invitaciones:", error);
    
    if (error.status === 400) {
      return { data: [], error: 'Parámetros de solicitud inválidos' };
    }
    
    return { data: [], error: error.message || 'Error al obtener invitaciones' };
  }
};

/**
 * Responde a una invitación (aceptar o rechazar)
 * @param {string} invitationId - ID de la invitación (UUID)
 * @param {string} userId - ID del usuario (UUID)
 * @param {string} response - Respuesta: 'accept' o 'reject'
 * @returns {Promise<{success: boolean, error: string|null, data?: Object}>}
 */
export const respondToInvitation = async (invitationId, userId, response) => {
  try {
    // Validaciones
    if (!invitationId || !isValidUUID(invitationId)) {
      return { success: false, error: 'ID de invitación inválido (UUID requerido)' };
    }
    
    if (!userId || !isValidUUID(userId)) {
      return { success: false, error: 'ID de usuario inválido (UUID requerido)' };
    }
    
    if (!['accept', 'reject'].includes(response)) {
      return { success: false, error: 'La respuesta debe ser "accept" o "reject"' };
    }
    
    // Mapear respuesta a status del backend
    const statusMap = {
      'accept': 'accepted',
      'reject': 'rejected'
    };
    
    // Usar userId como parámetro URL
    const apiResponse = await apiService.patch(
      `/api/invitations/${invitationId}?userId=${userId}`, 
      {
        status: statusMap[response]
      }
    );
    
    return { 
      success: true, 
      error: null,
      data: {
        status: statusMap[response],
        vacaId: apiResponse.vacaId || apiResponse.vaca_id
      }
    };
  } catch (error) {
    console.error("Error al responder invitación:", error);
    
    if (error.status === 400) {
      return { 
        success: false, 
        error: 'Datos de respuesta inválidos o invitación no válida' 
      };
    }
    
    if (error.status === 404) {
      return { 
        success: false, 
        error: 'Invitación no encontrada' 
      };
    }
    
    return { success: false, error: error.message || 'Error al responder invitación' };
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
 * @param {string} userId - ID del usuario creador (UUID)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const createVaca = async (vacaData, userId) => {
  try {
    console.log("=== CREATE VACA DEBUG ===");
    console.log("Raw vacaData received:", JSON.stringify(vacaData, null, 2));
    console.log("Raw userId received:", userId);
    console.log("userId type:", typeof userId);
    
    // Validaciones básicas
    if (!vacaData.name || typeof vacaData.name !== 'string' || vacaData.name.trim().length === 0) {
      return { 
        data: null, 
        error: 'El nombre es obligatorio y debe ser un texto válido' 
      };
    }

    if (!vacaData.goal || isNaN(parseFloat(vacaData.goal)) || parseFloat(vacaData.goal) <= 0) {
      return { 
        data: null, 
        error: 'La meta es obligatoria y debe ser un número mayor a 0' 
      };
    }

    if (!userId || typeof userId !== 'string' || !isValidUUID(userId)) {
      return { 
        data: null, 
        error: `Se requiere un ID de usuario válido (UUID). Recibido: ${userId}` 
      };
    }

    const goalAmount = parseFloat(vacaData.goal);    // Preparar el payload EXACTAMENTE como el backend lo espera
    
    const requestPayload = {
      name: vacaData.name.trim(),
      description: (vacaData.description || '').trim(),
      goal: goalAmount,
      deadline: vacaData.deadline || null,
      color: vacaData.color || '#3F60E5',
      status: 'open',
      userId: userId
    };

    // Validar que los participantes (si existen) sean UUIDs válidos
    if (vacaData.participants && Array.isArray(vacaData.participants) && vacaData.participants.length > 0) {
      const validParticipants = [];
      for (const participantId of vacaData.participants) {
        if (typeof participantId === 'string' && isValidUUID(participantId)) {
          validParticipants.push(participantId);
        } else {
          console.warn(`Participante inválido ignorado: ${participantId}`);
        }
      }
      if (validParticipants.length > 0) {
        requestPayload.participants = validParticipants;
      }
    }

    console.log("=== FINAL REQUEST DETAILS ===");
    console.log("URL:", `http://localhost:8080/api/vacas?userId=${userId}`);
    console.log("Method: POST");
    console.log("Headers: Content-Type: application/json");
    console.log("Body payload:", JSON.stringify(requestPayload, null, 2));
    console.log("Payload size:", JSON.stringify(requestPayload).length, "bytes");

    // Verificar que el payload es válido JSON
    try {
      JSON.parse(JSON.stringify(requestPayload));
    } catch (jsonError) {
      console.error("JSON serialization error:", jsonError);
      return {
        data: null,
        error: 'Error interno: datos no serializables'
      };
    }

    // Enviar petición al backend Spring Boot
    console.log("Enviando petición al backend...");
    const response = await apiService.post(`/api/vacas?userId=${userId}`, requestPayload);

    console.log("=== BACKEND RESPONSE ===");
    console.log("Response received:", JSON.stringify(response, null, 2));

    return { data: response.vaca || response, error: null };
  } catch (error) {
    console.error("=== ERROR DETAILS ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error status:", error.status);
    console.error("Full error:", error);
    
    // Manejo específico de errores del backend Spring Boot
    if (error.status === 400) {
      const errorMsg = error.message || 'Datos de vaca inválidos';
      console.error("400 Bad Request - Posibles causas:");
      console.error("1. Campos obligatorios faltantes (name, goal, userId)");
      console.error("2. UUID mal formado");
      console.error("3. Tipo de dato incorrecto");
      console.error("4. Nombre duplicado");
      
      return { 
        data: null, 
        error: `Error de validación: ${errorMsg}. Verifique que todos los campos sean correctos.` 
      };
    }
    
    if (error.status === 409) {
      return {
        data: null,
        error: 'Ya existe una vaca con ese nombre para este usuario'
      };
    }

    if (error.status === 500) {
      return {
        data: null,
        error: 'Error interno del servidor. Contacte al administrador.'
      };
    }
    
    return { data: null, error: error.message || 'Error al crear vaca' };
  }
};

/**
 * Obtiene las vacas de un usuario
 * @param {string} userId - ID del usuario (UUID)
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getUserVacas = async (userId) => {
  try {
    if (!userId || !isValidUUID(userId)) {
      return { data: [], error: 'Se requiere un ID de usuario válido (UUID)' };
    }    
    
    const response = await apiService.get(`/api/users/${userId}/vacas`);
    const vacasArray = Array.isArray(response) ? response : (response.vacas || []);
    
    return { data: vacasArray, error: null };
  } catch (error) {
    console.error("❌ Error al obtener vacas:", error);
    
    if (error.status === 400) {
      return { data: [], error: 'ID de usuario inválido' };
    }
    
    if (error.status === 404) {
      return { data: [], error: null }; // No vacas encontradas, no es error
    }
    
    return { data: [], error: error.message || "Error al obtener vacas" };
  }
};

/**
 * Obtiene los detalles de una vaca específica
 * @param {string} vacaId - ID de la vaca (UUID)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getVacaDetails = async (vacaId) => {
  try {
    if (!vacaId || !isValidUUID(vacaId)) {
      return { data: null, error: 'Se requiere un ID de vaca válido (UUID)' };
    }

    const response = await apiService.get(`/api/vacas/${vacaId}`);
    return { data: response.vaca || response, error: null };
  } catch (error) {
    console.error("Error al obtener detalles de vaca:", error);
    
    if (error.status === 404) {
      return { data: null, error: 'Vaca no encontrada' };
    }
    
    if (error.status === 403) {
      return { data: null, error: 'No tienes permisos para ver esta vaca' };
    }
    
    return { data: null, error: error.message || 'Error al obtener detalles de vaca' };
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
    
    // Validaciones
    if (!vacaId || !isValidUUID(vacaId)) {
      return { data: null, error: 'ID de vaca inválido (UUID requerido)' };
    }
    
    if (!userId || !isValidUUID(userId)) {
      return { data: null, error: 'ID de usuario inválido (UUID requerido)' };
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return { data: null, error: 'El monto debe ser un número mayor a 0' };
    }
    
    const transactionAmount = parseFloat(amount);
    
    // Preparar datos de transacción según especificación del backend
    const requestPayload = {
      vacaId: vacaId,
      amount: transactionAmount,
      description: description?.trim() || 'Pago',
      type: 'contribution'
    };
    
    // Usar userId como parámetro URL
    const response = await apiService.post(
      `/api/transactions?userId=${userId}`, 
      requestPayload
    );
    
    return {
      data: response.transaction || response,
      error: null,
      newTotal: response.newVacaTotal || response.new_vaca_total
    };
  } catch (error) {
    console.error("Error al añadir pago:", error);
    
    if (error.status === 400) {
      return { 
        data: null, 
        error: 'Datos de transacción inválidos' 
      };
    }
    
    if (error.status === 404) {
      return { 
        data: null, 
        error: 'Vaca no encontrada' 
      };
    }
    
    if (error.status === 403) {
      return { 
        data: null, 
        error: 'No tienes permisos para agregar pagos a esta vaca' 
      };
    }
    
    return { data: null, error: error.message || 'Error al añadir pago' };
  }
};

/**
 * Actualiza los datos de una vaca
 * @param {string} vacaId - ID de la vaca (UUID)
 * @param {Object} updateData - Datos a actualizar
 * @param {string} userId - ID del usuario que actualiza (UUID)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const updateVaca = async (vacaId, updateData, userId) => {
  try {
    if (!vacaId || !isValidUUID(vacaId)) {
      return { data: null, error: 'ID de vaca inválido (UUID requerido)' };
    }
    
    if (!userId || !isValidUUID(userId)) {
      return { data: null, error: 'ID de usuario inválido (UUID requerido)' };
    }
    
    // Validar datos de actualización
    if (updateData.goal && (isNaN(parseFloat(updateData.goal)) || parseFloat(updateData.goal) <= 0)) {
      return { data: null, error: 'La meta debe ser un número mayor a 0' };
    }
    
    // Preparar datos según especificación del backend
    const requestPayload = { ...updateData };
    
    if (requestPayload.goal) {
      requestPayload.goal = parseFloat(requestPayload.goal);
    }
    
    if (requestPayload.name) {
      requestPayload.name = requestPayload.name.trim();
    }
    
    if (requestPayload.description) {
      requestPayload.description = requestPayload.description.trim();
    }
    
    // Usar userId como parámetro URL
    const response = await apiService.put(
      `/api/vacas/${vacaId}?userId=${userId}`, 
      requestPayload
    );
    
    return { data: response.vaca || response, error: null };
  } catch (error) {
    console.error("Error al actualizar vaca:", error);
    
    if (error.status === 400) {
      return { data: null, error: 'Datos de actualización inválidos' };
    }
    
    if (error.status === 404) {
      return { data: null, error: 'Vaca no encontrada' };
    }
    
    if (error.status === 403) {
      return { data: null, error: 'No tienes permisos para actualizar esta vaca' };
    }
    
    return { data: null, error: error.message || 'Error al actualizar vaca' };
  }
};

/**
 * Elimina una vaca (marca como inactiva)
 * @param {string} vacaId - ID de la vaca (UUID)
 * @param {string} userId - ID del usuario (UUID)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const deleteVaca = async (vacaId, userId) => {
  try {
    if (!vacaId || !isValidUUID(vacaId)) {
      return { data: null, error: 'ID de vaca inválido (UUID requerido)' };
    }
    
    if (!userId || !isValidUUID(userId)) {
      return { data: null, error: 'ID de usuario inválido (UUID requerido)' };
    }
    
    // Usar userId como parámetro URL
    const response = await apiService.delete(`/api/vacas/${vacaId}?userId=${userId}`);
    
    return { data: response.result || response, error: null };
  } catch (error) {
    console.error("Error al eliminar vaca:", error);
    
    if (error.status === 404) {
      return { data: null, error: 'Vaca no encontrada' };
    }
    
    if (error.status === 403) {
      return { data: null, error: 'No tienes permisos para eliminar esta vaca' };
    }
    
    return { data: null, error: error.message || 'Error al eliminar vaca' };
  }
};

/**
 * Obtiene los participantes de una vaca
 * @param {string} vacaId - ID de la vaca (UUID)
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getVacaParticipants = async (vacaId) => {
  console.log("🔗 getVacaParticipants llamado con vacaId:", vacaId);
  try {
    if (!vacaId || !isValidUUID(vacaId)) {
      console.error("❌ ID de vaca inválido:", vacaId);
      return { data: [], error: 'ID de vaca inválido (UUID requerido)' };
    }
    
    console.log("📡 Haciendo petición GET a:", `/api/participants/vaca/${vacaId}/details`);
    const response = await apiService.get(`/api/participants/vaca/${vacaId}/details`);
    console.log("📥 Respuesta del servidor:", response);
    return { data: response.participants || response || [], error: null };
  } catch (error) {
    console.error("Error al obtener participantes:", error);
    
    if (error.status === 404) {
      return { data: [], error: 'Vaca no encontrada' };
    }
    
    if (error.status === 403) {
      return { data: [], error: 'No tienes permisos para ver los participantes' };
    }
    
    return { data: [], error: error.message || 'Error al obtener participantes' };
  }
};

/**
 * Añade un participante a una vaca
 * @param {string} vacaId - ID de la vaca (UUID)
 * @param {Object} participantData - Datos del participante
 * @param {string} requesterId - ID del usuario que hace la petición (UUID)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const addVacaParticipant = async (vacaId, participantData, requesterId) => {
  try {
    if (!vacaId || !isValidUUID(vacaId)) {
      return { data: null, error: 'ID de vaca inválido (UUID requerido)' };
    }
    
    if (!requesterId || !isValidUUID(requesterId)) {
      return { data: null, error: 'ID de solicitante inválido (UUID requerido)' };
    }
    
    if (!participantData.userId || !isValidUUID(participantData.userId)) {
      return { data: null, error: 'ID de participante inválido (UUID requerido)' };
    }
    
    // Preparar datos según especificación del backend
    const requestPayload = {
      userId: participantData.userId,
      role: participantData.role || 'member'
    };
    
    // Usar requesterId como parámetro URL
    const response = await apiService.post(
      `/api/vacas/${vacaId}/participants?requesterId=${requesterId}`, 
      requestPayload
    );
    
    return { data: response.participant || response, error: null };
  } catch (error) {
    console.error("Error al añadir participante:", error);
    
    if (error.status === 400) {
      return { data: null, error: 'Datos de participante inválidos' };
    }
    
    if (error.status === 404) {
      return { data: null, error: 'Vaca no encontrada' };
    }
    
    if (error.status === 403) {
      return { data: null, error: 'No tienes permisos para añadir participantes' };
    }
    
    if (error.status === 409) {
      return { data: null, error: 'El usuario ya es participante de esta vaca' };
    }
    
    return { data: null, error: error.message || 'Error al añadir participante' };
  }
};

/**
 * Elimina un participante de una vaca
 * @param {string} vacaId - ID de la vaca (UUID)
 * @param {string} participantId - ID del participante (UUID)
 * @param {string} requesterId - ID del usuario que hace la petición (UUID)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const removeVacaParticipant = async (vacaId, participantId, requesterId) => {
  try {
    if (!vacaId || !isValidUUID(vacaId)) {
      return { data: null, error: 'ID de vaca inválido (UUID requerido)' };
    }
    
    if (!participantId || !isValidUUID(participantId)) {
      return { data: null, error: 'ID de participante inválido (UUID requerido)' };
    }
    
    if (!requesterId || !isValidUUID(requesterId)) {
      return { data: null, error: 'ID de solicitante inválido (UUID requerido)' };
    }
    
    // Usar requesterId como parámetro URL
    const response = await apiService.delete(
      `/api/vacas/${vacaId}/participants/${participantId}?requesterId=${requesterId}`
    );
    
    return { data: response.result || response, error: null };
  } catch (error) {
    console.error("Error al eliminar participante:", error);
    
    if (error.status === 404) {
      return { data: null, error: 'Participante o vaca no encontrados' };
    }
    
    if (error.status === 403) {
      return { data: null, error: 'No tienes permisos para eliminar participantes' };
    }
    
    return { data: null, error: error.message || 'Error al eliminar participante' };
  }
};

/**
 * Obtiene las transacciones de una vaca
 * @param {string} vacaId - ID de la vaca (UUID)
 * @param {Object} options - Opciones de filtrado
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const getVacaTransactions = async (vacaId, options = {}) => {
  try {
    if (!vacaId || !isValidUUID(vacaId)) {
      return { data: [], error: 'ID de vaca inválido (UUID requerido)' };
    }
    
    // Construir parámetros de query
    const queryParams = new URLSearchParams();
    
    if (options.page) queryParams.append('page', options.page);
    if (options.limit) queryParams.append('limit', options.limit);
    if (options.type) queryParams.append('type', options.type);
    if (options.startDate) queryParams.append('startDate', options.startDate);
    if (options.endDate) queryParams.append('endDate', options.endDate);
    
    const queryString = queryParams.toString();
    const url = queryString 
      ? `/api/vacas/${vacaId}/transactions?${queryString}`
      : `/api/vacas/${vacaId}/transactions`;
    
    const response = await apiService.get(url);
    return { data: response.transactions || [], error: null };
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    
    if (error.status === 404) {
      return { data: [], error: 'Vaca no encontrada' };
    }
    
    if (error.status === 403) {
      return { data: [], error: 'No tienes permisos para ver las transacciones' };
    }
    
    return { data: [], error: error.message || 'Error al obtener transacciones' };
  }
};

/**
 * Obtiene estadísticas de una vaca
 * @param {string} vacaId - ID de la vaca (UUID)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getVacaStats = async (vacaId) => {
  try {
    if (!vacaId || !isValidUUID(vacaId)) {
      return { data: null, error: 'ID de vaca inválido (UUID requerido)' };
    }
    
    try {
      // First try to get stats from the dedicated endpoint
      const response = await apiService.get(`/api/vacas/${vacaId}/stats`);
      return { data: response.stats || response, error: null };
    } catch (statsError) {
      // If stats endpoint doesn't exist, calculate basic stats from available data
      console.warn("Stats endpoint not available, calculating from available data:", statsError.message);
      
      try {
        // Get vaca details and transactions to calculate basic stats
        const [vacaResult, transactionsResult] = await Promise.all([
          getVacaDetails(vacaId),
          getVacaTransactions(vacaId)
        ]);
        
        if (vacaResult.error || transactionsResult.error) {
          throw new Error(vacaResult.error || transactionsResult.error);
        }
        
        const vaca = vacaResult.data;
        const transactions = transactionsResult.data || [];
        
        // Calculate basic stats
        const totalContributions = transactions
          .filter(t => t.type === 'contribution' || t.type === 'aporte')
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
        
        const totalExpenses = transactions
          .filter(t => t.type === 'expense' || t.type === 'gasto')
          .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
          const currentBalance = totalContributions - totalExpenses;
        const goalProgress = vaca.goal ? (currentBalance / vaca.goal) * 100 : 0;
        
        // Calculate participant count from transactions if not available in vaca object
        const participantCount = vaca.participants?.length || 
          new Set(transactions.map(t => t.user_id)).size || 0;
        
        const stats = {
          totalContributions,
          totalExpenses,
          currentBalance,
          goalProgress: Math.min(goalProgress, 100),
          participantCount,
          transactionCount: transactions.length,
          averageContribution: participantCount ? totalContributions / participantCount : 0,
          lastActivity: transactions.length > 0 ? transactions[0].created_at : vaca.created_at
        };
        
        return { data: stats, error: null };
      } catch (fallbackError) {
        console.error("Error calculating fallback stats:", fallbackError);
        
        // Return mock stats if even fallback fails
        return {
          data: {
            totalContributions: 0,
            totalExpenses: 0,
            currentBalance: 0,
            goalProgress: 0,
            participantCount: 0,
            transactionCount: 0,
            averageContribution: 0,
            lastActivity: new Date().toISOString()
          },
          error: null
        };
      }
    }
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    
    if (error.status === 404) {
      return { data: null, error: 'Vaca no encontrada' };
    }
    
    if (error.status === 403) {
      return { data: null, error: 'No tienes permisos para ver las estadísticas' };
    }
    
    return { data: null, error: error.message || 'Error al obtener estadísticas' };
  }
};

/**
 * Cierra una vaca (marca como completada)
 * @param {string} vacaId - ID de la vaca (UUID)
 * @param {string} userId - ID del usuario (UUID)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const closeVaca = async (vacaId, userId) => {
  try {
    if (!vacaId || !isValidUUID(vacaId)) {
      return { data: null, error: 'ID de vaca inválido (UUID requerido)' };
    }
    
    if (!userId || !isValidUUID(userId)) {
      return { data: null, error: 'ID de usuario inválido (UUID requerido)' };
    }
    
    // Usar userId como parámetro URL y cambiar status a 'closed'
    const response = await apiService.patch(
      `/api/vacas/${vacaId}?userId=${userId}`, 
      { status: 'closed' }
    );
    
    return { data: response.vaca || response, error: null };
  } catch (error) {
    console.error("Error al cerrar vaca:", error);
    
    if (error.status === 404) {
      return { data: null, error: 'Vaca no encontrada' };
    }
    
    if (error.status === 403) {
      return { data: null, error: 'No tienes permisos para cerrar esta vaca' };
    }
    
    if (error.status === 400) {
      return { data: null, error: 'La vaca no puede ser cerrada en su estado actual' };
    }
    
    return { data: null, error: error.message || 'Error al cerrar vaca' };
  }
};

/**
 * Reabre una vaca cerrada
 * @param {string} vacaId - ID de la vaca (UUID)
 * @param {string} userId - ID del usuario (UUID)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const reopenVaca = async (vacaId, userId) => {
  try {
    if (!vacaId || !isValidUUID(vacaId)) {
      return { data: null, error: 'ID de vaca inválido (UUID requerido)' };
    }
    
    if (!userId || !isValidUUID(userId)) {
      return { data: null, error: 'ID de usuario inválido (UUID requerido)' };
    }
    
    // Usar userId como parámetro URL y cambiar status a 'active'
    const response = await apiService.patch(
      `/api/vacas/${vacaId}?`,
      { status: 'open' }
    );
    
    return { data: response.vaca || response, error: null };
  } catch (error) {
    console.error("Error al reabrir vaca:", error);
    
    if (error.status === 404) {
      return { data: null, error: 'Vaca no encontrada' };
    }
    
    if (error.status === 403) {
      return { data: null, error: 'No tienes permisos para reabrir esta vaca' };
    }
    
    if (error.status === 400) {
      return { data: null, error: 'La vaca no puede ser reabierta en su estado actual' };
    }
    
    return { data: null, error: error.message || 'Error al reabrir vaca' };
  }
};

/**
 * Función de debugging para validar datos antes de enviar al backend
 * @param {Object} vacaData - Datos de la vaca a validar
 * @param {string} userId - ID del usuario
 * @returns {Object} - Resultado de validación con detalles
 */
export const validateVacaData = (vacaData, userId) => {
  const errors = [];
  const warnings = [];
  
  console.log("=== VALIDATING VACA DATA ===");
  
  // Validar userId
  if (!userId) {
    errors.push("userId es requerido");
  } else if (typeof userId !== 'string') {
    errors.push(`userId debe ser string, recibido: ${typeof userId}`);
  } else if (!isValidUUID(userId)) {
    errors.push(`userId debe ser UUID válido, recibido: ${userId}`);
  }
  
  // Validar vacaData
  if (!vacaData) {
    errors.push("vacaData es requerido");
    return { valid: false, errors, warnings };
  }
  
  // Validar name
  if (!vacaData.name) {
    errors.push("name es requerido");
  } else if (typeof vacaData.name !== 'string') {
    errors.push(`name debe ser string, recibido: ${typeof vacaData.name}`);
  } else if (vacaData.name.trim().length === 0) {
    errors.push("name no puede estar vacío");
  } else if (vacaData.name.length > 100) {
    warnings.push("name es muy largo (máximo 100 caracteres recomendado)");
  }
  
  // Validar goal
  if (!vacaData.goal && vacaData.goal !== 0) {
    errors.push("goal es requerido");
  } else {
    const goalNum = parseFloat(vacaData.goal);
    if (isNaN(goalNum)) {
      errors.push(`goal debe ser numérico, recibido: ${vacaData.goal}`);
    } else if (goalNum <= 0) {
      errors.push(`goal debe ser mayor a 0, recibido: ${goalNum}`);
    } else if (goalNum > 999999999) {
      warnings.push("goal es muy alto (máximo recomendado: 999,999,999)");
    }
  }
  
  // Validar description (opcional)
  if (vacaData.description && typeof vacaData.description !== 'string') {
    warnings.push(`description debe ser string, recibido: ${typeof vacaData.description}`);
  }
  
  // Validar deadline (opcional)
  if (vacaData.deadline) {
    const deadline = new Date(vacaData.deadline);
    if (isNaN(deadline.getTime())) {
      warnings.push(`deadline debe ser fecha válida, recibido: ${vacaData.deadline}`);
    } else if (deadline < new Date()) {
      warnings.push("deadline está en el pasado");
    }
  }
  
  // Validar color (opcional)
  if (vacaData.color && !/^#[0-9A-F]{6}$/i.test(vacaData.color)) {
    warnings.push(`color debe ser hex válido, recibido: ${vacaData.color}`);
  }
  
  // Validar participants (opcional)
  if (vacaData.participants) {
    if (!Array.isArray(vacaData.participants)) {
      warnings.push(`participants debe ser array, recibido: ${typeof vacaData.participants}`);
    } else {
      vacaData.participants.forEach((participant, index) => {
        if (!isValidUUID(participant)) {
          warnings.push(`participants[${index}] debe ser UUID válido: ${participant}`);
        }
      });
    }
  }
  
  const result = {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      totalErrors: errors.length,
      totalWarnings: warnings.length,
      recommendedAction: errors.length > 0 ? 'FIX_ERRORS' : warnings.length > 0 ? 'REVIEW_WARNINGS' : 'READY_TO_SEND'
    }
  };
  
  console.log("Validation result:", result);
  return result;
};

/**
 * Función de prueba para validar conectividad con el backend
 * @returns {Promise<Object>} - Resultado de la prueba
 */
export const testBackendConnection = async () => {
  try {
    console.log("=== TESTING BACKEND CONNECTION ===");
    console.log("Backend URL:", import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');
    
    const startTime = Date.now();
    const response = await apiService.get('/api/health');
    const endTime = Date.now();
    
    console.log(`Connection successful in ${endTime - startTime}ms`);
    console.log("Health response:", response);
    
    return {
      success: true,
      responseTime: endTime - startTime,
      data: response,
      error: null
    };
  } catch (error) {
    console.error("Backend connection failed:", error);
    return {
      success: false,
      responseTime: null,
      data: null,
      error: error.message
    };
  }
};
