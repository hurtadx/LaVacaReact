import { createClient } from '@supabase/supabase-js';
import apiService from './apiService';

/**
 * Hybrid Authentication Service
 * Uses Supabase for authentication and custom API for other operations
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const useSupabaseAuth = import.meta.env.VITE_USE_SUPABASE_AUTH === 'true';

let supabase = null;
if (useSupabaseAuth && supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

/**
 * Maneja errores de autenticación y devuelve un código y mensaje estandarizado
 * @param {Error} error - Error original
 * @returns {Object} - Objeto con código y mensaje de error
 */
const handleAuthError = (error) => {
  const errorMessage = error?.message || 'Error desconocido';
  
  if (errorMessage.includes('Email not confirmed') || errorMessage.includes('email_not_confirmed')) {
    return { code: 'email_not_confirmed', message: 'Por favor verifica tu correo electrónico antes de iniciar sesión.' };
  } else if (errorMessage.includes('Invalid credentials') || errorMessage.includes('invalid_credentials')) {
    return { code: 'invalid_credentials', message: 'Email o contraseña incorrectos.' };
  } else if (errorMessage.includes('already registered') || errorMessage.includes('already in use') || errorMessage.includes('email_in_use')) {
    return { code: 'email_in_use', message: 'Este email ya está registrado. Por favor inicia sesión.' };
  } else if (errorMessage.includes('invalid_email')) {
    return { code: 'invalid_email', message: 'Por favor ingresa un email válido.' };
  } else if (errorMessage.includes('invalid_password')) {
    return { code: 'invalid_password', message: 'La contraseña debe tener al menos 6 caracteres.' };
  }
  
  return { code: 'unknown_error', message: errorMessage };
};

/**
 * Enriquece los datos del usuario con información del perfil
 * @param {Object} user - Usuario base
 * @returns {Promise<Object>} - Usuario enriquecido
 */
export const enrichUserData = async (user) => {
  try {
    if (!user) return null;

    if (useSupabaseAuth && supabase) {
      // Para Supabase
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
    } else {
      // Para API personalizada
      return {
        id: user.id,
        email: user.email,
        username: user.username || user.email?.split('@')[0] || 'Usuario',
        avatar_url: user.avatar_url || null,
        email_confirmed: user.email_confirmed || false,
        created_at: user.created_at,
        last_sign_in: user.last_sign_in,
        displayName: user.username || user.email?.split('@')[0] || 'Usuario',
        ...user
      };
    }
  } catch (error) {
    console.error('Error enriqueciendo datos del usuario:', error);
    return user; // Devolver usuario básico si falla
  }
};

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
    } else {
      // API personalizada
      const response = await apiService.get('/api/auth/me');
      if (response.user) {
        const enrichedUser = await enrichUserData(response.user);
        return { user: enrichedUser, error: null };
      }
      return { user: null, error: null };
    }
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return { user: null, error: message, code };
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
    if (!email || !password) {
      return { 
        user: null, 
        error: true, 
        message: "Email y contraseña son requeridos" 
      };
    }

    if (useSupabaseAuth && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        const { code, message } = handleAuthError(error);
        return { user: null, error: true, code, message };
      }
      
      const enrichedUser = await enrichUserData(data.user);
      return { user: enrichedUser, error: null };
    } else {
      // API personalizada
      const response = await apiService.post('/api/auth/login', {
        email,
        password
      });

      // Guardar tokens de autenticación
      if (response.access_token) {
        apiService.setTokens(response.access_token, response.refresh_token);
      }

      const enrichedUser = await enrichUserData(response.user);
      return { user: enrichedUser, error: null };
    }
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return { user: null, error: true, code, message };
  }
};

/**
 * Registra un nuevo usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @param {string} username - Nombre de usuario
 * @returns {Promise<{user: Object|null, error: boolean, code?: string, message?: string, emailAlreadyExists?: boolean, needsEmailConfirmation?: boolean}>}
 */
export const registerUser = async (email, password, username) => {
  try {
    if (!email || !password || !username) {
      return {
        user: null,
        error: true,
        message: "Todos los campos son obligatorios"
      };
    }

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
        const { code, message } = handleAuthError(error);
        return { 
          user: null, 
          error: true, 
          code,
          message,
          emailAlreadyExists: code === 'email_in_use'
        };
      }
      
      return { 
        user: data.user, 
        error: null,
        needsEmailConfirmation: !data.user?.email_confirmed_at,
        message: "Registro exitoso"
      };
    } else {
      // API personalizada
      const response = await apiService.post('/api/auth/register', {
        email,
        password,
        username
      });

      const needsEmailConfirmation = !response.user?.email_confirmed;
      
      return { 
        user: response.user || null, 
        error: null,
        needsEmailConfirmation,
        message: needsEmailConfirmation 
          ? "Por favor verifica tu correo electrónico para completar el registro"
          : "Registro exitoso"
      };
    }
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return { 
      user: null, 
      error: true, 
      code,
      message,
      emailAlreadyExists: code === 'email_in_use'
    };
  }
};

/**
 * Cierra la sesión del usuario actual
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const logoutUser = async () => {
  try {
    // Limpiar localStorage de datos específicos de la app
    Object.keys(localStorage).forEach(key => {
      if (key.includes('lastVisitedVaca')) {
        localStorage.removeItem(key);
      }
    });

    if (useSupabaseAuth && supabase) {
      const { error } = await supabase.auth.signOut();
      return { success: !error, error: error?.message || null };
    } else {
      // API personalizada
      await apiService.post('/api/auth/logout', {});
      
      // Limpiar tokens locales
      apiService.clearAuth();
      
      return { success: true, error: null };
    }
  } catch (error) {
    // Incluso si la llamada al servidor falla, limpiar tokens locales si es API personalizada
    if (!useSupabaseAuth) {
      apiService.clearAuth();
    }
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ? await enrichUserData(session.user) : null;
      callback(user);
    });
    
    return () => subscription.unsubscribe();
  } else {
    // Para una API REST, simularemos esto con intervalos o eventos personalizados
    let isActive = true;
    
    // Verificar estado inicial
    getCurrentUser().then(({ user }) => {
      if (isActive) callback(user);
    });
    
    // Escuchar eventos personalizados de cambio de autenticación
    const handleAuthChange = async (event) => {
      if (isActive) {
        const user = event.detail?.user ? await enrichUserData(event.detail.user) : null;
        callback(user);
      }
    };
    
    const handleTokenExpired = () => {
      if (isActive) callback(null);
    };
    
    window.addEventListener('auth:state-change', handleAuthChange);
    window.addEventListener('auth:token-expired', handleTokenExpired);
    
    return () => {
      isActive = false;
      window.removeEventListener('auth:state-change', handleAuthChange);
      window.removeEventListener('auth:token-expired', handleTokenExpired);
    };
  }
};

/**
 * Actualiza datos del perfil del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<{user: Object|null, error: string|null}>}
 */
export const updateUserProfile = async (userData) => {
  try {
    if (useSupabaseAuth && supabase) {
      const { data, error } = await supabase.auth.updateUser({
        data: userData
      });
      
      if (error) {
        return { user: null, error: error.message };
      }
      
      const enrichedUser = await enrichUserData(data.user);
      return { user: enrichedUser, error: null };
    } else {
      // API personalizada
      const response = await apiService.put('/api/profiles/me', userData);
      
      const enrichedUser = await enrichUserData(response.user);
      return { user: enrichedUser, error: null };
    }
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return { user: null, error: message, code };
  }
};

/**
 * Sincroniza un perfil de usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} - Perfil sincronizado
 */
export const syncUserProfile = async (userData) => {
  try {
    // Con ambos sistemas, la sincronización es automática
    // Esta función se mantiene por compatibilidad
    return { success: true, data: userData };
  } catch (error) {
    console.error('Error al sincronizar perfil:', error);
    return { success: false, error };
  }
};

/**
 * Reenvía el correo de verificación a un usuario
 * @param {string} email - Email del usuario
 * @returns {Promise<{success: boolean, error: string|null, message: string}>}
 */
export const resendVerificationEmail = async (email) => {
  try {
    if (!email) {
      return { 
        success: false, 
        error: "email_required", 
        message: "Se requiere un correo electrónico" 
      };
    }

    if (useSupabaseAuth && supabase) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        return { 
          success: false, 
          error: error.code || 'resend_error',
          message: error.message
        };
      }
      
      return { 
        success: true, 
        error: null, 
        message: "Si tienes una cuenta con este correo, recibirás un correo de verificación."
      };
    } else {
      // API personalizada
      await apiService.post('/api/auth/resend-verification', { email });
      
      return { 
        success: true, 
        error: null, 
        message: "Si tienes una cuenta con este correo, recibirás un correo de verificación."
      };
    }
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return { 
      success: false, 
      error: code, 
      message 
    };
  }
};

/**
 * Confirma el email del usuario con un token
 * @param {string} token - Token de confirmación
 * @returns {Promise<{success: boolean, error: string|null, message: string}>}
 */
export const confirmEmail = async (token) => {
  try {
    if (!token) {
      return {
        success: false,
        error: "token_required",
        message: "Se requiere un token de confirmación"
      };
    }

    if (!useSupabaseAuth) {
      // Solo disponible para API personalizada
      const response = await apiService.post('/api/auth/confirm-email', { token });

      // Si la confirmación incluye tokens de autenticación
      if (response.access_token) {
        apiService.setTokens(response.access_token, response.refresh_token);
      }

      return {
        success: true,
        error: null,
        message: "Email confirmado exitosamente",
        user: response.user
      };
    }

    return {
      success: false,
      error: "not_available",
      message: "Confirmación manual no disponible con Supabase"
    };
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return {
      success: false,
      error: code,
      message
    };
  }
};

/**
 * Inicia el proceso de recuperación de contraseña
 * @param {string} email - Email del usuario
 * @returns {Promise<{success: boolean, error: string|null, message: string}>}
 */
export const resetPassword = async (email) => {
  try {
    if (!email) {
      return {
        success: false,
        error: "email_required",
        message: "Se requiere un correo electrónico"
      };
    }

    if (useSupabaseAuth && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        return {
          success: false,
          error: error.code || 'reset_error',
          message: error.message
        };
      }
      
      return {
        success: true,
        error: null,
        message: "Si tienes una cuenta con este correo, recibirás un enlace para restablecer tu contraseña."
      };
    } else {
      // API personalizada
      await apiService.post('/api/auth/reset-password', { email });

      return {
        success: true,
        error: null,
        message: "Si tienes una cuenta con este correo, recibirás un enlace para restablecer tu contraseña."
      };
    }
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return {
      success: false,
      error: code,
      message
    };
  }
};

/**
 * Actualiza la contraseña del usuario
 * @param {string} token - Token de restablecimiento (solo para API personalizada)
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<{success: boolean, error: string|null, message: string}>}
 */
export const updatePassword = async (token, newPassword) => {
  try {
    if (!newPassword) {
      return {
        success: false,
        error: "missing_data",
        message: "Se requiere la nueva contraseña"
      };
    }

    if (useSupabaseAuth && supabase) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        return {
          success: false,
          error: error.code || 'update_error',
          message: error.message
        };
      }
      
      return {
        success: true,
        error: null,
        message: "Contraseña actualizada exitosamente"
      };
    } else {
      // API personalizada
      if (!token) {
        return {
          success: false,
          error: "missing_data",
          message: "Se requiere el token de restablecimiento"
        };
      }

      await apiService.post('/api/auth/update-password', { 
        token, 
        password: newPassword 
      });

      return {
        success: true,
        error: null,
        message: "Contraseña actualizada exitosamente"
      };
    }
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return {
      success: false,
      error: code,
      message
    };
  }
};

// Helper para emitir eventos de cambio de estado de autenticación (solo para API personalizada)
export const emitAuthStateChange = (user) => {
  if (!useSupabaseAuth) {
    window.dispatchEvent(new CustomEvent('auth:state-change', { 
      detail: { user } 
    }));
  }
};