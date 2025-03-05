
import { supabase } from "../../supabaseConfig";
import { handleAuthError } from './errorHandler';

export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error("No se pudo obtener la información del usuario");
    }

    return { 
      user: enrichUserData(data.user), 
      error: null 
    };
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return { user: null, error: code, message };
  }
};

export const registerUser = async (email, password, username) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: username
        }
      }
    });

    if (error) throw error;

    
    const needsEmailConfirmation = !data.session;

    return { 
      user: enrichUserData(data.user), 
      error: null,
      needsEmailConfirmation
    };
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return { user: null, error: code, message };
  }
};

export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return { success: false, error: code, message };
  }
};


const enrichUserData = (user) => {
  if (!user) return null;
  
  return {
    ...user,
    displayName: user.user_metadata?.username || 
                user.user_metadata?.full_name || 
                user.email?.split('@')[0] || 
                "Usuario"
  };
};

export const resendVerificationEmail = async (email) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email
    });
    
    if (error) throw error;
    
    return {
      success: true,
      message: 'Se ha reenviado el correo de verificación.'
    };
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return { success: false, error: code, message };
  }
};