import { createClient } from '@supabase/supabase-js';
import apiService from './apiService';

// Configuración híbrida: Supabase para auth, API personalizada para el resto
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const useSupabaseAuth = import.meta.env.VITE_USE_SUPABASE_AUTH === 'true';

let supabase = null;
if (useSupabaseAuth && supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

/**
 * Obtiene el usuario actual autenticado
 * @returns {Promise<{user: Object|null, error: string|null}>}
 */
export const getCurrentUser = async () => {
  try {
    if (useSupabaseAuth && supabase) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        return { user: null, error: error.message };
      }
      return { user: await enrichUserData(user), error: null };
    }
    
    // Fallback a API personalizada
    const response = await apiService.get('/api/auth/me');
    if (response.user) {
      const enrichedUser = await enrichUserData(response.user);
      return { user: enrichedUser, error: null };
    }
    return { user: null, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Inicia sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {Promise<{user: Object|null, error: boolean, code?: string, message?: string}>}
 */
export const loginUser = async (email, password) => {
  try {
    if (useSupabaseAuth && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return { user: null, error: true, message: error.message };
      }
      
      const enrichedUser = await enrichUserData(data.user);
      return { user: enrichedUser, error: null };
    }
    
    // Fallback a API personalizada - implementar cuando esté lista
    throw new Error('API personalizada no disponible aún');
  } catch (error) {
    return { user: null, error: true, message: error.message };
  }
};

/**
 * Registra un nuevo usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {string} username - Nombre de usuario
 * @returns {Promise<{user: Object|null, error: boolean, needsEmailConfirmation?: boolean, message?: string}>}
 */
export const registerUser = async (email, password, username) => {
  try {
    if (useSupabaseAuth && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });
      
      if (error) {
        return { 
          user: null, 
          error: true, 
          message: error.message,
          emailAlreadyExists: error.message.includes('already registered')
        };
      }
      
      return { 
        user: data.user, 
        error: null,
        needsEmailConfirmation: !data.user?.email_confirmed_at,
        message: "Registro exitoso"
      };
    }
    
    throw new Error('API personalizada no disponible aún');
  } catch (error) {
    return { user: null, error: true, message: error.message };
  }
};

/**
 * Cierra la sesión del usuario actual
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const logoutUser = async () => {
  try {
    if (useSupabaseAuth && supabase) {
      const { error } = await supabase.auth.signOut();
      return { success: !error, error: error?.message || null };
    }
    
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Configurar un listener para cambios en el estado de autenticación
 * @param {Function} callback - Función a llamar cuando cambia el estado
 * @returns {Function} - Función para desuscribirse
 */
export const onAuthStateChange = (callback) => {
  if (useSupabaseAuth && supabase) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
    
    return () => subscription.unsubscribe();
  }
  
  // Fallback para API personalizada
  return () => {};
};

/**
 * Enriquece los datos del usuario con información del perfil
 * @param {Object} user - Usuario base
 * @returns {Promise<Object>} - Usuario enriquecido
 */
export const enrichUserData = async (user) => {
  if (!user) return null;
  
  return {
    id: user.id,
    email: user.email,
    username: user.user_metadata?.username || user.email?.split('@')[0] || 'Usuario',
    avatar_url: user.user_metadata?.avatar_url || null,
    email_confirmed: !!user.email_confirmed_at,
    created_at: user.created_at,
    last_sign_in: user.last_sign_in_at,
    displayName: user.user_metadata?.username || user.email?.split('@')[0] || 'Usuario',
    ...user
  };
};

// Re-exportar otras funciones necesarias
export const resendVerificationEmail = async (email) => {
  return { success: false, error: 'No implementado', message: 'Función no disponible' };
};

export const syncUserProfile = async (userData) => {
  return { success: true, data: userData };
};
