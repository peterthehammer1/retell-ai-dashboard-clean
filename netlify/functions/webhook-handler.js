const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    }
  }

  try {
    console.log('🚀 Webhook received!')
    
    // Parse the body
    let payload
    try {
      payload = JSON.parse(event.body)
    } catch (error) {
      console.error('❌ JSON parse error:', error)
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Invalid JSON' })
      }
    }

    const { event: eventType, call } = payload
    
    if (!eventType || !call) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Missing event or call data' })
      }
    }

    console.log(`📞 Processing ${eventType} for call ${call.call_id}`)

    // Connect to Supabase
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials')
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Server configuration error' })
      }
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Prepare call data
    const callData = {
      id: 'webhook-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      call_id: call.call_id,
      call_type: call.call_type || 'phone_call',
      from_number: call.from_number || null,
      to_number: call.to_number || null,
      direction: call.direction || null,
      agent_id: call.agent_id || 'unknown',
      agent_version: call.agent_version || 1,
      call_status: call.call_status || 'started',
      start_timestamp: call.start_timestamp ? new Date(call.start_timestamp).getTime().toString() : null,
      end_timestamp: call.end_timestamp ? new Date(call.end_timestamp).getTime().toString() : null,
      duration_ms: call.duration_ms || null,
      transcript: call.transcript || null,
      recording_url: call.recording_url || null,
      call_analysis: call.call_analysis ? JSON.stringify(call.call_analysis) : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert or update call data
    const { data, error } = await supabase
      .from('calls')
      .upsert(callData, { 
        onConflict: 'call_id',
        ignoreDuplicates: false 
      })
      .select()

    if (error) {
      console.error('❌ Supabase error:', error)
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Database error', details: error.message })
      }
    }

    console.log('✅ Call data saved successfully:', call.call_id)
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: true, 
        callId: call.call_id,
        event: eventType,
        message: 'Call data saved to Supabase successfully'
      })
    }

  } catch (error) {
    console.error('❌ Function error:', error)
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      })
    }
  }
}
