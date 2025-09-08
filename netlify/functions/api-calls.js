const { createClient } = require('@supabase/supabase-js');

exports.handler = async function(event, context) {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
      headers: { 'Allow': 'GET' }
    };
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL or Key is not set in environment variables.');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Supabase environment variables not configured.' })
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 API calls endpoint called');

    const { data: calls, error } = await supabase
      .from('calls')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch calls from Supabase', details: error.message })
      };
    }

    console.log('✅ Successfully fetched calls:', calls.length);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(calls)
    };

  } catch (error) {
    console.error('Error fetching calls:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch calls', details: error.message })
    };
  }
};
