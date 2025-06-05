/**
 * Mi servicio de autenticación personal - aquí manejo todo lo relacionado con login/logout
 * Lo hice híbrido para usar Supabase cuando esté disponible, sino mi API custom
 */

import { createClient } from '@supabase/supabase-js';
import apiService from './apiService';

// Configuración híbrida: Supabase para auth opcional, API personalizada como fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const useSupabaseAuth = import.meta.env.VITE_USE_SUPABASE_AUTH === 'true';

let supabase = null;
if (useSupabaseAuth && supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

/**
 * Esta función me la hice para manejar todos los errores de auth de forma consistente
 * Le paso cualquier error y me devuelve algo que pueda mostrar al usuario sin asustarle
 * @param {Error} error - El error que me llegó
 * @returns {Object} - Mi objeto con código y mensaje amigable
 */
const handleAuthError = (error) => {
  const errorMessage = error?.message || 'Error desconocido';
  
  if (errorMessage.includes('Email not confirmed') || errorMessage.includes('email_not_confirmed')) {
    return { code: 'email_not_confirmed', message: 'Por favor verifica tu correo electrónico antes de iniciar sesión.' };
  } else if (errorMessage.includes('Invalid credentials') || errorMessage.includes('invalid_credentials')) {
    return { code: 'invalid_credentials', message: 'Credenciales inválidas. Verifica tu email y contraseña.' };
  } else if (errorMessage.includes('Email already registered') || errorMessage.includes('email_in_use')) {
    return { code: 'email_in_use', message: 'El correo electrónico ya está registrado.' };
  } else if (errorMessage.includes('Weak password')) {
    return { code: 'weak_password', message: 'La contraseña debe tener al menos 6 caracteres.' };
  } else if (errorMessage.includes('Invalid email')) {
    return { code: 'invalid_email', message: 'El formato del correo electrónico es inválido.' };
  }
  
  return { code: 'unknown_error', message: errorMessage };
};

/**
 * Aquí tomo los datos básicos del usuario y les añado toda la info extra que necesito
 * Es como "vestir" al usuario con todos sus datos para que esté completo en mi app
 * @param {Object} user - Los datos básicos que me llegan
 * @returns {Promise<Object>} - El usuario ya "vestido" con toda su info
 */
export const enrichUserData = async (user) => {
  try {
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username || user.username || user.email?.split('@')[0] || 'Usuario',
      avatar_url: user.user_metadata?.avatar_url || user.avatar_url || null,
      email_confirmed: user.email_confirmed_at ? true : (user.email_confirmed || false),
      created_at: user.created_at,
      last_sign_in: user.last_sign_in_at || user.last_sign_in,
      displayName: user.user_metadata?.username || user.username || user.email?.split('@')[0] || 'Usuario',
      ...user
    };
  } catch (error) {
    console.error('Error enriqueciendo datos del usuario:', error);
    return user;
  }
};

/**
 * Mi función favorita para saber quién está logueado ahora mismo
 * Primero revisa Supabase, si no está disponible pregunta a mi API
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
 * La función clásica de login - email y password, como toda la vida
 * Aquí es donde la gente entra a mi app por primera vez
 * @param {string} email - El email del usuario
 * @param {string} password - Su contraseña (que nunca guardo en claro, obvio)
 * @returns {Promise<{user: Object|null, error: boolean, code?: string, message?: string}>}
 */
export const loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      return { user: null, error: true, code: 'missing_credentials', message: 'Email y contraseña son requeridos' };
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
    }
    
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
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return { user: null, error: true, code, message };
  }
};

/**
 * Aquí registro usuarios nuevos - siempre me emociona cuando alguien se une
 * Valido que tengan todos los datos y después los creo en Supabase o mi API
 * @param {string} email - Su email
 * @param {string} password - Su contraseña
 * @param {string} username - Como quieren que les llame
 * @returns {Promise<{user: Object|null, error: boolean, needsEmailConfirmation?: boolean, message?: string, emailAlreadyExists?: boolean, code?: string}>}
 */
export const registerUser = async (email, password, username) => {
  try {
    if (!email || !password || !username) {
      return { 
        user: null, 
        error: true, 
        code: 'missing_fields', 
        message: 'Email, contraseña y nombre de usuario son requeridos' 
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
    }
    
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
 * El logout - cuando alguien se va de mi app (siempre me pone triste)
 * Limpio todo: tokens, localStorage, y le digo adiós a Supabase
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const logoutUser = async () => {
  try {
    if (useSupabaseAuth && supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Limpiar localStorage de datos específicos de la app
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('lavaca_')) {
          localStorage.removeItem(key);
        }
      });
      
      try {
        await apiService.post('/api/auth/logout', {});
      } catch (error) {
        console.warn('Error en logout del servidor:', error);
      }
      
      // Limpiar tokens locales
      apiService.clearAuth();
    }
    
    // Emitir evento de cambio de estado
    emitAuthStateChange(null);
    
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
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
    }
    
    // API personalizada
    const response = await apiService.patch('/api/auth/profile', userData);
    const enrichedUser = await enrichUserData(response.user);
    
    return { user: enrichedUser, error: null };
  } catch (error) {
    return { user: null, error: error.message };
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
  }
  
  // Para API personalizada - usar eventos personalizados
  let isActive = true;
  
  // Verificar estado inicial
  getCurrentUser().then(({ user }) => {
    if (isActive) {
      callback(user);
    }
  });
  
  // Escuchar eventos personalizados de cambio de autenticación
  const handleAuthChange = (event) => {
    if (isActive) {
      callback(event.detail.user);
    }
  };
  
  const handleTokenExpired = () => {
    if (isActive) {
      callback(null);
    }
  };
  
  window.addEventListener('auth:state-change', handleAuthChange);
  window.addEventListener('auth:token-expired', handleTokenExpired);
  
  return () => {
    isActive = false;
    window.removeEventListener('auth:state-change', handleAuthChange);
    window.removeEventListener('auth:token-expired', handleTokenExpired);
  };
};

/**
 * Sincroniza un perfil de usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} - Perfil sincronizado
 */
export const syncUserProfile = async (userData) => {
  try {
    if (useSupabaseAuth && supabase) {
      // Para Supabase, simplemente devolver los datos enriquecidos
      return { success: true, data: await enrichUserData(userData) };
    }
    
    // Para API personalizada, sincronizar con el backend
    const response = await apiService.post('/api/auth/sync-profile', userData);
    return { success: true, data: response.user };
  } catch (error) {
    console.error('Error sincronizando perfil:', error);
    return { success: false, error: error.message, data: userData };
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
      return { success: false, error: 'Email requerido', message: 'Debe proporcionar un email' };
    }

    if (useSupabaseAuth && supabase) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      
      if (error) {
        return { success: false, error: error.message, message: 'Error al reenviar email' };
      }
      
      return { success: true, error: null, message: 'Email de verificación reenviado correctamente' };
    }
    
    // API personalizada
    await apiService.post('/api/auth/resend-verification', { email });
    return { success: true, error: null, message: 'Email de verificación reenviado correctamente' };
  } catch (error) {
    return { success: false, error: error.message, message: 'Error al reenviar email de verificación' };
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
      return { success: false, error: 'Token requerido', message: 'Token de confirmación requerido' };
    }

    if (useSupabaseAuth && supabase) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });
      
      if (error) {
        return { success: false, error: error.message, message: 'Error al confirmar email' };
      }
      
      return { success: true, error: null, message: 'Email confirmado correctamente' };
    }
    
    // API personalizada
    await apiService.post('/api/auth/confirm-email', { token });
    return { success: true, error: null, message: 'Email confirmado correctamente' };
  } catch (error) {
    return { success: false, error: error.message, message: 'Error al confirmar email' };
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
      return { success: false, error: 'Email requerido', message: 'Debe proporcionar un email' };
    }

    if (useSupabaseAuth && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        return { success: false, error: error.message, message: 'Error al enviar email de recuperación' };
      }
      
      return { success: true, error: null, message: 'Email de recuperación enviado correctamente' };
    }
    
    // API personalizada
    await apiService.post('/api/auth/reset-password', { email });
    return { success: true, error: null, message: 'Email de recuperación enviado correctamente' };
  } catch (error) {
    return { success: false, error: error.message, message: 'Error al enviar email de recuperación' };
  }
};

/**
 * Actualiza la contraseña del usuario
 * @param {string} token - Token de restablecimiento o contraseña actual
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<{success: boolean, error: string|null, message: string}>}
 */
export const updatePassword = async (token, newPassword) => {
  try {
    if (!newPassword) {
      return { success: false, error: 'Contraseña requerida', message: 'Debe proporcionar una nueva contraseña' };
    }

    if (useSupabaseAuth && supabase) {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        return { success: false, error: error.message, message: 'Error al actualizar contraseña' };
      }
      
      return { success: true, error: null, message: 'Contraseña actualizada correctamente' };
    }
    
    // API personalizada
    await apiService.post('/api/auth/update-password', { token, newPassword });
    return { success: true, error: null, message: 'Contraseña actualizada correctamente' };
  } catch (error) {
    return { success: false, error: error.message, message: 'Error al actualizar contraseña' };
  }
};

/**
 * Helper para emitir eventos de cambio de estado de autenticación
 * @param {Object|null} user - Usuario actual o null si no hay sesión
 */
export const emitAuthStateChange = (user) => {
  window.dispatchEvent(new CustomEvent('auth:state-change', { 
    detail: { user } 
  }));
};

/**
 * Helper para emitir eventos de token expirado
 */
export const emitTokenExpired = () => {
  window.dispatchEvent(new CustomEvent('auth:token-expired'));
};

// Inicializar tokens al cargar el servicio
if (!useSupabaseAuth) {
  apiService.getStoredTokens();
}

export default {
  getCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
  updateUserProfile,
  onAuthStateChange,
  syncUserProfile,
  resendVerificationEmail,
  confirmEmail,
  resetPassword,
  updatePassword,
  enrichUserData,
  emitAuthStateChange,
  emitTokenExpired,
  handleAuthError
};