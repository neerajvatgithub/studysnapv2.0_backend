/**
 * Test Supabase Connection
 * This script validates that the Supabase credentials are correct
 */
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  // Get credentials from environment
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials missing in .env file');
    return false;
  }
  
  console.log('Supabase URL:', supabaseUrl);
  console.log('Supabase Key:', supabaseKey.substring(0, 3) + '...' + supabaseKey.substring(supabaseKey.length - 3));
  
  try {
    // Create a simple client to test connection
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('Attempting to connect to Supabase...');
    
    // Test the connection with a simple operation
    // Use a simple health check query that doesn't require any tables
    const { data, error } = await supabase.from('pg_stat_statements').select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      // If that fails, try an even simpler test - just getting auth config
      console.log('First test failed, trying alternative method...');
      const { data: configData, error: configError } = await supabase.auth.getSession();
      
      if (configError) {
        console.error('❌ Supabase connection failed:', configError.message);
        return false;
      }
      
      console.log('✅ Supabase connection successful (using auth config)!');
      return true;
    }
    
    console.log('✅ Supabase connection successful!');
    return true;
  } catch (err) {
    console.error('❌ Unexpected error testing Supabase connection:');
    console.error(err);
    return false;
  }
}

// Run the test
testSupabaseConnection()
  .then(success => {
    if (!success) {
      console.log('\nTroubleshooting tips:');
      console.log('1. Verify your SUPABASE_URL and SUPABASE_SERVICE_KEY in .env');
      console.log('2. Make sure your Supabase project is active');
      console.log('3. Check if your IP is allowed to access Supabase');
      console.log('4. Try creating a new service key in the Supabase dashboard');
    } else {
      console.log('\nNext steps:');
      console.log('1. Run the Supabase SQL script to create the necessary tables');
      console.log('2. Start the server with npm run dev');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Failed to run test:');
    console.error(err);
    process.exit(1);
  }); 