// Test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...');
console.log('URL:', supabaseUrl ? 'Configured ✅' : 'Missing ❌');
console.log('Key:', supabaseKey ? 'Configured ✅' : 'Missing ❌');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Environment variables not configured properly');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔄 Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('⚠️  Auth error:', authError.message);
    } else {
      console.log('✅ Auth connection working');
    }

    console.log('\n🔄 Testing database tables...');
    
    // Test vacas table
    const { data: vacasData, error: vacasError } = await supabase
      .from('vacas')
      .select('id')
      .limit(1);
    
    if (vacasError) {
      console.log('❌ Vacas table error:', vacasError.message);
      console.log('   Code:', vacasError.code);
    } else {
      console.log('✅ Vacas table accessible');
    }

    // Test participants table
    const { data: participantsData, error: participantsError } = await supabase
      .from('participants')
      .select('id')
      .limit(1);
    
    if (participantsError) {
      console.log('❌ Participants table error:', participantsError.message);
      console.log('   Code:', participantsError.code);
    } else {
      console.log('✅ Participants table accessible');
    }

    // Test transactions table
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('id')
      .limit(1);
    
    if (transactionsError) {
      console.log('❌ Transactions table error:', transactionsError.message);
      console.log('   Code:', transactionsError.code);
    } else {
      console.log('✅ Transactions table accessible');
    }

    // Test invitations table
    const { data: invitationsData, error: invitationsError } = await supabase
      .from('invitations')
      .select('id')
      .limit(1);
    
    if (invitationsError) {
      console.log('❌ Invitations table error:', invitationsError.message);
      console.log('   Code:', invitationsError.code);
    } else {
      console.log('✅ Invitations table accessible');
    }

    console.log('\n📊 Summary:');
    const tables = {
      vacas: !vacasError,
      participants: !participantsError,
      transactions: !transactionsError,
      invitations: !invitationsError
    };
    
    console.log('Tables status:', tables);
    
    const allTablesOk = Object.values(tables).every(Boolean);
    if (allTablesOk) {
      console.log('🎉 All tables are accessible!');
    } else {
      console.log('⚠️  Some tables are missing or inaccessible');
      console.log('💡 You may need to run database migrations in Supabase');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testConnection();
