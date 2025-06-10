// filepath: c:\Users\pracsistemas\LaVacaReact\src\Services\vacaService.jsx
import apiService from './apiService.jsx';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuración para determinar qué backend usar
const useSupabase = false; 

/**
 * Create a new vaca (vacation pool)
 * @param {Object} vacaData - The vaca data
 * @param {string} userId - The user ID creating the vaca
 * @param {string} userName - The user name creating the vaca
 * @param {string} userEmail - The user email creating the vaca
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const createVaca = async (vacaData, userId, userName, userEmail) => {
  try {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('vacas')
        .insert([{
          ...vacaData,
          created_by: userId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } else {
      // Limpiar campos vacíos o nulos
      const vacaDataClean = Object.fromEntries(
        Object.entries(vacaData)
          .filter(([_, v]) => v !== undefined && v !== null && v !== "")
      );
      // Log para depuración
      console.log("Payload enviado a backend:", {
        ...vacaDataClean,
        userId,
        name: userName,
        email: userEmail
      });
      const vacaPayload = {
        ...vacaDataClean,
        userId,
        name: userName,
        email: userEmail
      };
      const response = await apiService.post('/api/vacas', vacaPayload);
      return { data: response.data, error: null };
    }
  } catch (error) {
    console.error('Error creating vaca:', error);
    return { data: null, error: error.message || 'Failed to create vaca' };
  }
};

/**
 * Get details of a specific vaca
 * @param {string} vacaId - The vaca ID
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getVacaDetails = async (vacaId) => {
  try {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('vacas')
        .select(`
          *,
          participants (*),
          transactions (*),
          expenses (*)
        `)
        .eq('id', vacaId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } else {
      const response = await apiService.get(`/vacas/${vacaId}`);
      return { data: response.data, error: null };
    }
  } catch (error) {
    console.error('Error fetching vaca details:', error);
    return { data: null, error: error.message || 'Failed to fetch vaca details' };
  }
};

/**
 * Add a transaction to a vaca
 * @param {string} vacaId - The vaca ID
 * @param {Object} transactionData - The transaction data
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const addVacaTransaction = async (vacaId, transactionData) => {
  try {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          vaca_id: vacaId,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } else {
      const response = await apiService.post(`/vacas/${vacaId}/transactions`, transactionData);
      return { data: response.data, error: null };
    }
  } catch (error) {
    console.error('Error adding vaca transaction:', error);
    return { data: null, error: error.message || 'Failed to add transaction' };
  }
};

/**
 * Update a vaca
 * @param {string} vacaId - The vaca ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const updateVaca = async (vacaId, updateData) => {
  try {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('vacas')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', vacaId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } else {
      const response = await apiService.put(`/vacas/${vacaId}`, updateData);
      return { data: response.data, error: null };
    }
  } catch (error) {
    console.error('Error updating vaca:', error);
    return { data: null, error: error.message || 'Failed to update vaca' };
  }
};

/**
 * Delete a vaca
 * @param {string} vacaId - The vaca ID
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const deleteVaca = async (vacaId) => {
  try {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('vacas')
        .delete()
        .eq('id', vacaId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } else {
      const response = await apiService.delete(`/vacas/${vacaId}`);
      return { data: response.data, error: null };
    }
  } catch (error) {
    console.error('Error deleting vaca:', error);
    return { data: null, error: error.message || 'Failed to delete vaca' };
  }
};

/**
 * Check if database tables exist (for testing/debugging)
 * @returns {Promise<{data: boolean, error: string|null}>}
 */
export const checkTablesExist = async () => {
  try {
    if (useSupabase) {
     
      const { data, error } = await supabase
        .from('vacas')
        .select('id')
        .limit(1);

      if (error && error.code === 'PGRST116') {
        // La tabla no existe
        return { data: false, error: null };
      }
      return { data: true, error: null };
    } else {
      // Uso el endpoint de salud correcto
      const response = await apiService.get('/api/health');
      // Si el estado es UP, asumo que las tablas existen (o backend está sano)
      return { data: response.status === 'UP', error: null };
    }
  } catch (error) {
    console.error('Error checking tables:', error);
    return { data: false, error: error.message || 'Failed to check tables' };
  }
};

/**
 * Get vaca statistics
 * @param {string} vacaId - The vaca ID
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getVacaStats = async (vacaId) => {
  try {
    if (useSupabase) {
      // Get basic vaca info with aggregated data
      const { data, error } = await supabase
        .from('vacas')
        .select(`
          *,
          participants:participants(count),
          transactions:transactions(count, amount),
          expenses:expenses(count, amount)
        `)
        .eq('id', vacaId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } else {
      const response = await apiService.get(`/vacas/${vacaId}/stats`);
      return { data: response.data, error: null };
    }
  } catch (error) {
    console.error('Error fetching vaca stats:', error);
    return { data: null, error: error.message || 'Failed to fetch vaca stats' };
  }
};