import { createClient } from '@supabase/supabase-js';

// Corregir el nombre de la variable para que coincida con .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // Cambiado correctamente a ANON_KEY

// Verificar que la clave esté definida
if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Variables de entorno de Supabase no definidas');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Función para comprobar la conectividad y sesión
export const checkSupabaseConnection = async () => {
  try {
    // Verificar si hay una sesión activa
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error de conexión con Supabase:', error);
      return { connected: false, session: false, error };
    }
    
    return { 
      connected: true,
      session: !!data?.session,
      userId: data?.session?.user?.id
    };
  } catch (err) {
    console.error('Error al verificar conexión con Supabase:', err);
    return { connected: false, session: false, error: err };
  }
};