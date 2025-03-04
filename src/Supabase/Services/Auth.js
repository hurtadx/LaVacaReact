import { supabase } from "../supabaseConfig";

export const registerUser = async (email, password, username) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        }
      }
    });

    if (error) throw error;

    return { user: data.user, error: null };
  } catch (error) {
    let errorMessage;
    
    switch (error.message) {
      case 'User already registered':
        errorMessage = 'email-already-in-use';
        break;
      case 'Invalid email':
        errorMessage = 'invalid-email';
        break;
      case 'Password should be at least 6 characters':
        errorMessage = 'weak-password';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { user: null, error: errorMessage };
  }
};

export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return { user: data.user, error: null };
  } catch (error) {
    let errorMessage;
    
    switch (error.message) {
      case 'Invalid login credentials':
        errorMessage = 'wrong-password';
        break;
      case 'Invalid email':
        errorMessage = 'invalid-email';
        break;
      case 'Email not confirmed':
        errorMessage = 'user-not-found';
        break;
      case 'Too many requests':
        errorMessage = 'too-many-requests';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { user: null, error: errorMessage };
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

// Función adicional para obtener el usuario actual
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    return { user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// Función para actualizar el perfil del usuario
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

// Función para escuchar cambios de autenticación
export const onAuthStateChange = (callback) => {
  const subscription = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
  
  return () => subscription.data.subscription.unsubscribe();
};