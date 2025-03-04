import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bembebuyunumtoslmvdn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlbWJlYnV5dW51bXRvc2xtdmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3OTg4OTIsImV4cCI6MjA1NTM3NDg5Mn0.-F7zDOWVRIK2vl_9vfUxgWvIlKl8DCVxtnAgXoRhuU8';

export const supabase = createClient(supabaseUrl, supabaseKey);