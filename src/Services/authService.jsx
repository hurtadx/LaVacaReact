import { supabase } from '../Supabase/supabaseConfig';

/**
 * Maneja errores de autenticación y devuelve un código y mensaje estandarizado
 * @param {Error} error - Error original
 * @returns {Object} - Objeto con código y mensaje de error
 */
const handleAuthError = (error) => {
  const errorMessage = error?.message || 'Error desconocido';
  
  
  if (errorMessage.includes('Email not confirmed')) {
    return { code: 'email_not_confirmed', message: 'Por favor verifica tu correo electrónico antes de iniciar sesión.' };
  } else if (errorMessage.includes('Invalid login credentials')) {
    return { code: 'invalid_credentials', message: 'Email o contraseña incorrectos.' };
  } else if (errorMessage.includes('already registered') || errorMessage.includes('already in use') || errorMessage.includes('User already registered')) {
    return { code: 'email_in_use', message: 'Este email ya está registrado. Por favor inicia sesión.' };
  } else if (errorMessage.includes('email')) {
    return { code: 'invalid_email', message: 'Por favor ingresa un email válido.' };
  } else if (errorMessage.includes('password')) {
    return { code: 'invalid_password', message: 'La contraseña debe tener al menos 6 caracteres.' };
  }
  
  return { code: 'unknown_error', message: errorMessage };
};

/**
 * Enriquece los datos básicos del usuario con información adicional del perfil
 * @param {Object} user - Datos básicos del usuario de autenticación
 * @returns {Object} - Usuario con datos enriquecidos
 */
export const enrichUserData = async (user) => {
  if (!user || !user.id) return null;
  
  try {
    // Obtener el perfil actualizado
    const profile = await syncUserProfile(user);
    console.log("Profile recibido en enrichUserData:", profile);
    
    return {
      ...user,
      profile, // Guardar el perfil completo
      displayName: profile?.username || user.user_metadata?.username || user.email.split('@')[0]
    };
  } catch (error) {
    console.error("Error al enriquecer datos de usuario:", error);
    return {
      ...user,
      displayName: user.user_metadata?.username || user.email.split('@')[0]
    };
  }
};

export const loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      return { 
        user: null, 
        error: true, 
        message: "Email y contraseña son requeridos" 
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      const { code, message } = handleAuthError(error);
      return { user: null, error: true, code, message };
    }

    if (!data || !data.user) {
      return { 
        user: null, 
        error: true, 
        message: "No se pudo obtener la información del usuario" 
      };
    }

    
    const enrichedUser = await enrichUserData(data.user);
    
    return { user: enrichedUser, error: null };
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return { user: null, error: true, code, message };
  }
};

export const registerUser = async (email, password, username) => {
  try {
    if (!email || !password || !username) {
      return {
        user: null,
        error: true,
        message: "Todos los campos son obligatorios"
      };
    }
    
    
    try {
      const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false 
        }
      });
      
      if (!otpError) {
        return {
          user: null,
          error: true,
          message: "Este email ya está registrado. Por favor inicia sesión.",
          emailAlreadyExists: true
        };
      }
    } catch (e) {
      
      console.log("Error en verificación OTP:", e);
    }
    
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username, // Asegurarse de que sea explícito
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    // Verificar si se creó el usuario y guardar inmediatamente el perfil
    if (data?.user?.id) {
      console.log("Usuario creado, ID:", data.user.id);
      console.log("Creando perfil con username:", username);
      
      // Insertar el perfil directamente
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email,
          username: username, // Usar el username proporcionado
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (profileError) {
        console.error("Error al crear perfil en registro:", profileError);
      } else {
        console.log("Perfil creado exitosamente");
      }
    }
    
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
    
    
    if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
      return { 
        user: null, 
        error: true, 
        message: "Este email ya está registrado. Por favor inicia sesión.",
        emailAlreadyExists: true
      };
    }
    
    const needsEmailConfirmation = data && !data.session;
    
    return { 
      user: data?.user || null, 
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

export const logoutUser = async () => {
  try {
    
    Object.keys(localStorage).forEach(key => {
      if (key.includes('lastVisitedVaca')) {
        localStorage.removeItem(key);
      }
    });
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Obtiene el usuario actualmente autenticado
 * @returns {Promise<{user: Object|null, error: string|null}>}
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    if (user) {
      const enrichedUser = await enrichUserData(user);
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
    const { data, error } = await supabase.auth.updateUser({
      data: userData
    });
    
    if (error) throw error;
    
    
    if (data?.user?.id) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          username: userData.username,
          updated_at: new Date()
        });
        
      if (profileError) {
        console.error("Error al actualizar perfil:", profileError);
      }
    }
    
    const enrichedUser = await enrichUserData(data.user);
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
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth state changed:", event);
    
    if (session?.user) {
      const enrichedUser = await enrichUserData(session.user);
      callback(enrichedUser);
    } else {
      callback(null);
    }
  });
  
  return () => {
    subscription.unsubscribe();
  };
};

/**
 * Sincroniza un perfil de usuario con la tabla profiles
 * Se debe ejecutar cuando un usuario se autentica
 * @param {Object} user - Usuario de Supabase auth
 * @returns {Promise<Object>} - Perfil sincronizado
 */
export const syncUserProfile = async (userData) => {
  try {
    
    console.log("syncUserProfile recibió:", JSON.stringify(userData?.user_metadata, null, 2));
    
  
    let username = null;
    
    if (userData.user_metadata?.username) {
      username = userData.user_metadata.username;
      console.log("Username encontrado en user_metadata:", username);
    } else if (userData.username) {
      username = userData.username;
      console.log("Username encontrado en root:", username);
    } else if (userData.email) {
      
      username = userData.email.split('@')[0];
      console.log("Usando email como username:", username);
    }
    
    console.log("Username final para guardar:", username);
    
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert(
        { 
          id: userData.id,  
          email: userData.email,
          username: username, 
          avatar_url: userData.avatar_url,
          updated_at: new Date().toISOString() 
        },
        { 
          onConflict: 'id',  
          returning: 'representation' 
        }
      );
      
    if (error) {
      console.error("Error al sincronizar perfil:", error);
      throw error;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userData.id)
      .single();
      
    console.log("Perfil sincronizado:", profile);
    

    return profile;
    
  } catch (error) {
    console.error('Error en syncUserProfile:', error);
    
    return null;
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
    
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`
    });
    
    if (error) throw error;
    
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