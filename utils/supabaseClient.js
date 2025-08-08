const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and Key must be defined in your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
