import apiService, { handleApiCall } from './apiService';

/**
 * Transaction Service Layer - API Based
 * Replaces Supabase calls with custom backend API endpoints
 */

/**
 * Obtiene los tipos de transacción disponibles
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export const getTransactionTypes = async () => {
  return handleApiCall(async () => {
    const response = await apiService.get('/api/transaction-types');
    return response.types;
  });
};

/**
 * Crea una nueva transacción
 * @param {Object} transactionData - Datos de la transacción
 * @returns {Promise<{data: Object|null, error: string|null, newTotal?: number}>}
 */
export const createTransaction = async (transactionData) => {
  try {
    const { 
      vacaId, 
      userId, 
      participantId, 
      amount, 
      description, 
      type,
      category, 
      receiptId,
      withdrawalType
    } = transactionData;
    
    if (!vacaId || !userId || !amount) {
      return {
        data: null,
        error: 'Faltan datos obligatorios para la transacción'
      };
    }
    
    const payload = {
      vaca_id: vacaId,
      user_id: userId,
      participant_id: participantId,
      amount: parseFloat(amount),
      description: description || 'Transacción',
      type: type || 'contribution',
      transaction_type_id: category || null
    };

    // Datos específicos según el tipo de transacción
    if (type === 'expense' && receiptId) {
      payload.attachment_receipts = receiptId;
    }
    
    if (type === 'withdrawal') {
      payload.withdrawal_type = withdrawalType;
      
      // Si es un retiro comunitario, necesita aprobación
      if (withdrawalType === 'community') {
        payload.needs_approval = true;
        payload.approved = false;
      }
    }

    const response = await apiService.post('/api/transactions', payload);
    
    return {
      data: response.transaction,
      error: null,
      newTotal: response.new_vaca_total
    };
  } catch (error) {
    console.error("Error al crear transacción:", error);
    return { data: null, error: error.message };
  }
};

/**
 * Obtiene las transacciones del usuario actual
 * @param {string} userId - ID del usuario
 * @param {Object} options - Opciones de filtrado
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export const getUserTransactions = async (userId, options = {}) => {
  return handleApiCall(async () => {
    const response = await apiService.get('/api/users/me/transactions', {
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
 * Obtiene las transacciones de una vaca específica
 * @param {string} vacaId - ID de la vaca
 * @param {Object} options - Opciones de filtrado
 * @returns {Promise<{data: Array|null, error: string|null}>}
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
 * Obtiene los detalles de una transacción específica
 * @param {string} transactionId - ID de la transacción
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getTransactionDetails = async (transactionId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/transactions/${transactionId}`);
    return response.transaction;
  });
};

/**
 * Actualiza una transacción existente
 * @param {string} transactionId - ID de la transacción
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const updateTransaction = async (transactionId, updateData) => {
  return handleApiCall(async () => {
    const response = await apiService.put(`/api/transactions/${transactionId}`, updateData);
    return response.transaction;
  });
};

/**
 * Elimina una transacción
 * @param {string} transactionId - ID de la transacción
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const deleteTransaction = async (transactionId) => {
  return handleApiCall(async () => {
    const response = await apiService.delete(`/api/transactions/${transactionId}`);
    return response.result;
  });
};

/**
 * Aprueba una transacción de retiro comunitario
 * @param {string} transactionId - ID de la transacción
 * @param {string} userId - ID del usuario que aprueba
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const approveTransaction = async (transactionId, userId) => {
  return handleApiCall(async () => {
    const response = await apiService.patch(`/api/transactions/${transactionId}/approve`, {
      user_id: userId
    });
    return response.transaction;
  });
};

/**
 * Rechaza una transacción de retiro comunitario
 * @param {string} transactionId - ID de la transacción
 * @param {string} userId - ID del usuario que rechaza
 * @param {string} reason - Razón del rechazo
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const rejectTransaction = async (transactionId, userId, reason) => {
  return handleApiCall(async () => {
    const response = await apiService.patch(`/api/transactions/${transactionId}/reject`, {
      user_id: userId,
      reason
    });
    return response.transaction;
  });
};

/**
 * Sube un recibo para una transacción
 * @param {string} transactionId - ID de la transacción
 * @param {File} file - Archivo del recibo
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const uploadReceipt = async (transactionId, file) => {
  return handleApiCall(async () => {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await apiService.upload(`/api/transactions/${transactionId}/receipt`, formData);
    return response.transaction;
  });
};

/**
 * Elimina el recibo de una transacción
 * @param {string} transactionId - ID de la transacción
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const deleteReceipt = async (transactionId) => {
  return handleApiCall(async () => {
    const response = await apiService.delete(`/api/transactions/${transactionId}/receipt`);
    return response.transaction;
  });
};

/**
 * Descarga el recibo de una transacción
 * @param {string} transactionId - ID de la transacción
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const downloadReceipt = async (transactionId) => {
  try {
    const response = await apiService.request(`/api/transactions/${transactionId}/receipt/download`, {
      method: 'GET'
    });
    
    // Si la respuesta es un blob, crear URL y descargar
    if (response instanceof Response) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      return { success: true, error: null };
    }
    
    // Si la respuesta incluye una URL de descarga
    if (response.download_url) {
      window.open(response.download_url, '_blank');
      return { success: true, error: null };
    }
    
    throw new Error('No se pudo obtener el recibo');
  } catch (error) {
    console.error('Error descargando recibo:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obtiene el resumen de transacciones de una vaca
 * @param {string} vacaId - ID de la vaca
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getTransactionSummary = async (vacaId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/vacas/${vacaId}/transactions/summary`);
    return response.summary;
  });
};

/**
 * Obtiene transacciones pendientes de aprobación
 * @param {string} vacaId - ID de la vaca (opcional)
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export const getPendingTransactions = async (vacaId = null) => {
  return handleApiCall(async () => {
    const endpoint = vacaId 
      ? `/api/vacas/${vacaId}/transactions/pending`
      : '/api/transactions/pending';
    
    const response = await apiService.get(endpoint);
    return response.transactions;
  });
};

/**
 * Procesa múltiples transacciones en lote
 * @param {Array} transactions - Array de datos de transacciones
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const createBatchTransactions = async (transactions) => {
  return handleApiCall(async () => {
    const response = await apiService.post('/api/transactions/batch', {
      transactions
    });
    return response.result;
  });
};

/**
 * Obtiene estadísticas de transacciones
 * @param {Object} filters - Filtros para las estadísticas
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getTransactionStats = async (filters = {}) => {
  return handleApiCall(async () => {
    const response = await apiService.get('/api/transactions/stats', filters);
    return response.stats;
  });
};
