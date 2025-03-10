import { supabase } from "../supabaseConfig";

export const registerUser = async (email, password, username) => {
  try {
    console.log("Intentando registrar:", { email, username });
    
    // PASO 1: Verificación previa de email existente (método simplificado)
    try {
      // Usamos un método más simple y directo para verificar si el email existe
      const { data: checkData, error: checkError } = await supabase.auth.admin.getUserByEmail(email);
      
      // Si tenemos datos de usuario y no hay error, el email ya existe
      if (checkData && !checkError) {
        console.log("✅ Email ya registrado (verificación directa):", email);
        return {
          user: null,
          error: true,
          message: "Este email ya está registrado. Por favor inicia sesión.",
          emailAlreadyExists: true,
          debug: { checkData, checkError }
        };
      }
    } catch (checkException) {
      console.error("❌ Error en verificación inicial:", checkException);
    }
    
    // PASO 2: Intento real de registro
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    console.log("Resultado registro:", { data, error });
    
    // PASO 3: Verificar errores específicos después del registro
    if (error) {
      // Si el error es sobre email ya existente
      if (error.message.includes('already registered') || 
          error.message.includes('already in use') ||
          error.message.includes('User already registered')) {
        return { 
          user: null, 
          error: true, 
          message: "Este email ya está registrado. Por favor inicia sesión.",
          emailAlreadyExists: true,  // Esta bandera es crucial
          debug: { error }
        };
      }
      
      // Otros tipos de errores
      return { 
        user: null, 
        error: true,
        message: `Error al registrar: ${error.message}` 
      };
    }
    
    // PASO 4: Verificar si las identidades existen en la respuesta
    if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
      return { 
        user: null, 
        error: true, 
        message: "Este email ya está registrado. Por favor inicia sesión.",
        emailAlreadyExists: true,  // Esta bandera es crucial
        debug: { data }
      };
    }
    
    // PASO 5: Respuesta exitosa con verificación de email si es necesario
    const needsEmailConfirmation = data && !data.session;
    
    return { 
      user: data?.user || null, 
      error: null,
      needsEmailConfirmation,
      message: needsEmailConfirmation 
        ? "Por favor verifica tu correo electrónico para completar el registro"
        : "Registro exitoso"
    };
    
  } catch (exception) {
    console.error("Error general en registro:", exception);
    
    // Verificación final para email ya existente
    if (exception.message && (
       exception.message.includes('already registered') || 
       exception.message.includes('already in use') ||
       exception.message.includes('User already registered')
    )) {
      return { 
        user: null, 
        error: true, 
        message: "Este email ya está registrado. Por favor inicia sesión.",
        emailAlreadyExists: true
      };
    }
    
    return { 
      user: null, 
      error: true,
      message: exception.message || "Error desconocido durante el registro"
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

    console.log("Intentando iniciar sesión con:", { email });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    console.log("Respuesta completa de autenticación:", { data, error });

    if (error) {
      console.error("Error de autenticación:", error);
      
      
      if (error.message.includes("Email not confirmed")) {
        return { 
          user: null, 
          error: true, 
          message: "Por favor verifica tu correo electrónico antes de iniciar sesión." 
        };
      } else if (error.message.includes("Invalid login credentials")) {
        return { 
          user: null, 
          error: true, 
          message: "Email o contraseña incorrectos." 
        };
      } else {
        return { 
          user: null, 
          error: true, 
          message: `Error al iniciar sesión: ${error.message}` 
        };
      }
    }

    if (!data || !data.user) {
      return { 
        user: null, 
        error: true, 
        message: "No se pudo obtener la información del usuario" 
      };
    }

    
    const enrichedUser = {
      ...data.user,
      displayName: data.user.user_metadata?.username || 
                  data.user.email.split('@')[0]
    };

    return { 
      user: enrichedUser, 
      error: null 
    };
  } catch (error) {
    console.error("Error inesperado en login:", error);
    return { 
      user: null, 
      error: true, 
      message: `Error inesperado: ${error.message}` 
    };
  }
};

export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};


export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};


export const updateUserProfile = async (userData) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: userData
    });
    
    if (error) throw error;
    
    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};


export const onAuthStateChange = (callback) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log("Auth state changed:", event, session);
    
    if (session?.user) {
      
      const enrichedUser = {
        ...session.user,
        displayName: session.user.user_metadata?.username || 
                    session.user.email.split('@')[0]
      };
      callback(enrichedUser);
    } else {
      callback(null);
    }
  });
  
  return () => {
    subscription.unsubscribe();
  };
};