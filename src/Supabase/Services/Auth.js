import { supabase } from "../supabaseConfig";

export const registerUser = async (email, password, username) => {
  try {
    console.log("Intentando registrar:", { email, username });
    
    
    if (!supabase) {
      console.error("Error: Cliente Supabase no inicializado");
      return { 
        user: null, 
        error: true,
        message: "Error de configuración del cliente Supabase" 
      };
    }
    
    
    if (!email || !password || !username) {
      return {
        user: null,
        error: true,
        message: "Todos los campos son obligatorios"
      };
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        }
      }
    });

    console.log("Resultado registro:", { data, error });

    if (error) {
      return { 
        user: null, 
        error: true,
        message: `Error al registrar: ${error.message}` 
      };
    }

    
    if (!data) {
      return {
        user: null,
        error: true,
        message: "No se recibieron datos del servidor"
      };
    }

    
    const needsEmailConfirmation = !data.session;

    return { 
      user: data.user || null, 
      error: null,
      needsEmailConfirmation,
      message: needsEmailConfirmation 
        ? "Por favor verifica tu correo electrónico para completar el registro"
        : "Registro exitoso"
    };
  } catch (error) {
    console.error("Error en registro:", error);
    
    return { 
      user: null, 
      error: true,
      message: `Error inesperado: ${error.message}`,
      needsEmailConfirmation: false
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