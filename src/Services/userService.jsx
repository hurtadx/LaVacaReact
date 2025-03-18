import { supabase } from '../Supabase/supabaseConfig';
import { enrichUserData } from './authService';

/**
 * Obtiene el usuario actual autenticado
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;
    
    if (!user) {
      return { data: null, error: null };
    }

    const enrichedUser = await enrichUserData(user);
    return { data: enrichedUser, error: null };
  } catch (error) {
    console.error("Error al obtener usuario actual:", error);
    return { data: null, error: error.message };
  }
};

/**
 * Busca usuarios por nombre o email
 * @param {string} searchTerm - Término de búsqueda (nombre o email)
 * @returns {Promise<{data: Array, error: string|null}>}
 */
export const searchUsers = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 3) {
      return { data: [], error: 'El término de búsqueda debe tener al menos 3 caracteres' };
    }

    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, email') 
      .or(`username.ilike.%${searchTerm}%, email.ilike.%${searchTerm}%`)
      .limit(10);
    
    if (error) throw error;
    
    
    const safeUserData = data.map(user => ({
      id: user.id,
      username: user.username || user.email.split('@')[0],
      email: user.email,
      avatarUrl: user.avatar_url || null 
    }));
    
    return { data: safeUserData, error: null };
  } catch (error) {
    console.error("Error al buscar usuarios:", error.message);
    return { data: [], error: error.message };
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