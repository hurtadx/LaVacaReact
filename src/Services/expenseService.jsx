import apiService, { handleApiCall } from './apiService';

/**
 * Expense Service Layer - API Based
 * Replaces Supabase calls with custom backend API endpoints
 */

/**
 * Obtiene los gastos de una vaca con filtros opcionales
 * @param {string} vacaId - ID de la vaca
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export const getExpenses = async (vacaId, filters = {}) => {
  try {
    const params = {
      vaca_id: vacaId,
      page: filters.page || 1,
      limit: filters.limit || 50
    };

    // Aplicar filtros
    if (filters.startDate) {
      params.start_date = filters.startDate;
    }
    
    if (filters.endDate) {
      params.end_date = filters.endDate;
    }
    
    if (filters.minAmount) {
      params.min_amount = parseFloat(filters.minAmount);
    }
    
    if (filters.maxAmount) {
      params.max_amount = parseFloat(filters.maxAmount);
    }
    
    if (filters.category) {
      params.category = filters.category;
    }
    
    if (filters.searchTerm) {
      params.search = filters.searchTerm;
    }

    if (filters.status) {
      params.status = filters.status;
    }

    const response = await apiService.get('/api/expenses', params);
    
    // Procesar datos para agregar propiedades que espera el componente
    const processedData = response.expenses.map(expense => ({
      ...expense,
      establishment: expense.category || 'General',
      voteResult: expense.approved ? 'approved' : expense.rejected ? 'rejected' : 'pending',
      hasReceipt: !!expense.receipt_url,
      receiptId: expense.receipt_id,
      requester: {
        username: expense.requester?.username || 'Usuario desconocido',
        id: expense.requester?.id
      }
    }));
    
    return { data: processedData, error: null };
  } catch (error) {
    console.error('Error obteniendo gastos:', error);
    return { data: null, error: error.message };
  }
};

/**
 * Crea un nuevo gasto
 * @param {Object} expenseData - Datos del gasto
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const createExpense = async (expenseData) => {
  return handleApiCall(async () => {
    const payload = {
      vaca_id: expenseData.vacaId,
      user_id: expenseData.userId,
      participant_id: expenseData.participantId,
      description: expenseData.description,
      amount: parseFloat(expenseData.amount),
      category: expenseData.category,
      receipt_id: expenseData.receiptId || null
    };

    const response = await apiService.post('/api/expenses', payload);
    return response.expense;
  });
};

/**
 * Actualiza un gasto existente
 * @param {string} expenseId - ID del gasto
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const updateExpense = async (expenseId, updateData) => {
  return handleApiCall(async () => {
    const response = await apiService.put(`/api/expenses/${expenseId}`, updateData);
    return response.expense;
  });
};

/**
 * Elimina un gasto
 * @param {string} expenseId - ID del gasto
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const deleteExpense = async (expenseId) => {
  return handleApiCall(async () => {
    const response = await apiService.delete(`/api/expenses/${expenseId}`);
    return response.result;
  });
};

/**
 * Obtiene los detalles de un gasto específico
 * @param {string} expenseId - ID del gasto
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getExpenseDetails = async (expenseId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/expenses/${expenseId}`);
    return response.expense;
  });
};

/**
 * Sube un recibo para un gasto
 * @param {string} expenseId - ID del gasto
 * @param {File} file - Archivo del recibo
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const uploadExpenseReceipt = async (expenseId, file) => {
  return handleApiCall(async () => {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await apiService.upload(`/api/expenses/${expenseId}/receipt`, formData);
    return response.expense;
  });
};

/**
 * Descarga un recibo de gasto
 * @param {string} receiptId - ID del recibo
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const downloadReceipt = async (receiptId) => {
  try {
    if (!receiptId) throw new Error('No hay recibo disponible');
    
    const response = await apiService.request(`/api/receipts/${receiptId}/download`, {
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
 * Elimina el recibo de un gasto
 * @param {string} expenseId - ID del gasto
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const deleteExpenseReceipt = async (expenseId) => {
  return handleApiCall(async () => {
    const response = await apiService.delete(`/api/expenses/${expenseId}/receipt`);
    return response.expense;
  });
};

/**
 * Aprueba un gasto
 * @param {string} expenseId - ID del gasto
 * @param {string} userId - ID del usuario que aprueba
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const approveExpense = async (expenseId, userId) => {
  return handleApiCall(async () => {
    const response = await apiService.patch(`/api/expenses/${expenseId}/approve`, {
      user_id: userId
    });
    return response.expense;
  });
};

/**
 * Rechaza un gasto
 * @param {string} expenseId - ID del gasto
 * @param {string} userId - ID del usuario que rechaza
 * @param {string} reason - Razón del rechazo
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const rejectExpense = async (expenseId, userId, reason) => {
  return handleApiCall(async () => {
    const response = await apiService.patch(`/api/expenses/${expenseId}/reject`, {
      user_id: userId,
      reason
    });
    return response.expense;
  });
};

/**
 * Obtiene gastos pendientes de aprobación
 * @param {string} vacaId - ID de la vaca (opcional)
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export const getPendingExpenses = async (vacaId = null) => {
  return handleApiCall(async () => {
    const endpoint = vacaId 
      ? `/api/vacas/${vacaId}/expenses/pending`
      : '/api/expenses/pending';
    
    const response = await apiService.get(endpoint);
    return response.expenses;
  });
};

/**
 * Obtiene el resumen de gastos de una vaca
 * @param {string} vacaId - ID de la vaca
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getExpensesSummary = async (vacaId) => {
  return handleApiCall(async () => {
    const response = await apiService.get(`/api/vacas/${vacaId}/expenses/summary`);
    return response.summary;
  });
};

/**
 * Obtiene las categorías de gastos disponibles
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export const getExpenseCategories = async () => {
  return handleApiCall(async () => {
    const response = await apiService.get('/api/expense-categories');
    return response.categories;
  });
};

/**
 * Obtiene estadísticas de gastos
 * @param {Object} filters - Filtros para las estadísticas
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getExpensesStats = async (filters = {}) => {
  return handleApiCall(async () => {
    const response = await apiService.get('/api/expenses/stats', filters);
    return response.stats;
  });
};

/**
 * Solicita reembolso para un gasto
 * @param {string} expenseId - ID del gasto
 * @param {Object} reimbursementData - Datos del reembolso
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const requestReimbursement = async (expenseId, reimbursementData) => {
  return handleApiCall(async () => {
    const response = await apiService.post(`/api/expenses/${expenseId}/reimbursement`, reimbursementData);
    return response.reimbursement;
  });
};

/**
 * Procesa el reembolso de un gasto
 * @param {string} expenseId - ID del gasto
 * @param {string} reimbursementId - ID del reembolso
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const processReimbursement = async (expenseId, reimbursementId) => {
  return handleApiCall(async () => {
    const response = await apiService.patch(`/api/expenses/${expenseId}/reimbursement/${reimbursementId}/process`);
    return response.reimbursement;
  });
};
