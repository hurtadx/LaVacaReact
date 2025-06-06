import apiService, { handleApiCall, formatApiError, formatApiSuccess } from './apiService';

/**
 * Authentication Service Layer - API Based
 * Replaces Supabase auth with custom backend API endpoints
 */

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
 * @param {Object} user - Usuario base de la API  
 * @returns {Promise<Object>} - Usuario enriquecido con datos del perfil
 */
export const enrichUserData = async (user) => {
  try {
    if (!user) return null;

    // Los datos del usuario ya vienen enriquecidos desde la API
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
  } catch (error) {
    console.error('Error enriqueciendo datos del usuario:', error);
    return user; // Devolver usuario básico si falla
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
    
    await apiService.post('/api/auth/logout', {});
    
    // Limpiar tokens locales
    apiService.clearAuth();
    
    return { success: true, error: null };
  } catch (error) {
    // Incluso si la llamada al servidor falla, limpiar tokens locales
    apiService.clearAuth();
    return { success: false, error: error.message };
  }
};

/**
 * Obtiene el usuario actualmente autenticado
 * @returns {Promise<{user: Object|null, error: string|null}>}
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiService.get('/api/auth/me');
    
    if (response.user) {
      const enrichedUser = await enrichUserData(response.user);
      return { user: enrichedUser, error: null };
    }
    
    return { user: null, error: null };
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return { user: null, error: message, code };
  }
};

/**
 * Actualiza datos del perfil del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<{user: Object|null, error: string|null}>}
 */
export const updateUserProfile = async (userData) => {
  try {
    const response = await apiService.put('/api/profiles/me', userData);
    
    const enrichedUser = await enrichUserData(response.user);
    return { user: enrichedUser, error: null };
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return { user: null, error: message, code };
  }
};

/**
 * Configurar un listener para cambios en el estado de autenticación
 * @param {Function} callback - Función a llamar cuando cambia el estado (recibe el usuario)
 * @returns {Function} - Función para desuscribirse
 */
export const onAuthStateChange = (callback) => {
  // Para una API REST, simularemos esto con intervalos o eventos personalizados
  let isActive = true;
  
  // Verificar estado inicial
  getCurrentUser().then(({ user }) => {
    if (isActive) callback(user);
  });
  
  // Escuchar eventos personalizados de cambio de autenticación
  const handleAuthChange = (event) => {
    if (isActive) callback(event.detail?.user || null);
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
};

/**
 * Sincroniza un perfil de usuario - ya no necesario con API unificada
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} - Perfil sincronizado
 */
export const syncUserProfile = async (userData) => {
  try {
    // Con la nueva API, la sincronización es automática
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
    
    await apiService.post('/api/auth/resend-verification', { email });
    
    return { 
      success: true, 
      error: null, 
      message: "Si tienes una cuenta con este correo, recibirás un correo de verificación."
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

    await apiService.post('/api/auth/reset-password', { email });

    return {
      success: true,
      error: null,
      message: "Si tienes una cuenta con este correo, recibirás un enlace para restablecer tu contraseña."
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
 * Actualiza la contraseña del usuario
 * @param {string} token - Token de restablecimiento
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<{success: boolean, error: string|null, message: string}>}
 */
export const updatePassword = async (token, newPassword) => {
  try {
    if (!token || !newPassword) {
      return {
        success: false,
        error: "missing_data",
        message: "Se requieren el token y la nueva contraseña"
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
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return {
      success: false,
      error: code,
      message
    };
  }
};

// Helper para emitir eventos de cambio de estado de autenticación
export const emitAuthStateChange = (user) => {
  window.dispatchEvent(new CustomEvent('auth:state-change', { 
    detail: { user } 
  }));
};
