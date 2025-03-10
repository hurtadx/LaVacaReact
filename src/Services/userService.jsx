import { supabase } from "../Supabase/supabaseConfig";
import { handleAuthError } from './errorHandler';
import { enrichUserData } from './authService';

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    return { user: enrichUserData(user), error: null };
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return { user: null, error: code, message };
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: userData
    });
    
    if (error) throw error;
    
    return { user: enrichUserData(data.user), error: null };
  } catch (error) {
    const { code, message } = handleAuthError(error);
    return { user: null, error: code, message };
  }
};

export const onAuthStateChange = (callback) => {
  const subscription = supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user ? enrichUserData(session.user) : null;
    callback(user);
  });
  
  return () => subscription.data.subscription.unsubscribe();
};