/**
 * Supabase Configuration
 */
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase credentials missing in environment variables');
}

// Log Supabase config for debugging
console.log('Initializing Supabase with URL:', supabaseUrl);
console.log('Service Key (first 10 chars):', supabaseServiceKey ? supabaseServiceKey.substring(0, 10) + '...' : 'undefined');

// Create Supabase client with additional options for auth
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

module.exports = supabase; 