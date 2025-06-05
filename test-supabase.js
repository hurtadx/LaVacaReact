// Test de conectividad con Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bembebuyunumtoslmvdn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlbWJlYnV5dW51bXRvc2xtdmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3OTg4OTIsImV4cCI6MjA1NTM3NDg5Mn0.-F7zDOWVRIK2vl_9vfUxgWvIlKl8DCVxtnAgXoRhuU8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Verificando conexión con Supabase...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Conexión básica exitosa');
    
    // Test tables
    const tables = ['vacas', 'transactions', 'participants', 'invitations'];
    
    for (const table of tables) {
      try {
        const { data: tableData, error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (tableError) {
          console.log(`❌ Tabla '${table}': ${tableError.message}`);
        } else {
          console.log(`✅ Tabla '${table}': existe y es accesible`);
        }
      } catch (e) {
        console.log(`❌ Tabla '${table}': Error - ${e.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
}

testConnection();
