import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Variables de entorno de Supabase no definidas');
}


export const supabase = createClient(supabaseUrl, supabaseAnonKey);


export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('healthcheck').select('*').limit(1);
    return { connected: !error, error: error?.message };
  } catch (err) {
    return { connected: false, error: err.message };
  }
};