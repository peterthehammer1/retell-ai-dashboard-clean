const https = require('https');

// Test data for different Retell AI webhook events
const testEvents = [
  {
    name: "Call Started Event",
    event: "call_started",
    data: {
      call_id: "call_test_started_" + Date.now(),
      call_type: "phone_call",
      from_number: "+15551234567",
      to_number: "+15559876543",
      direction: "inbound",
      agent_id: "agent_sales_001",
      agent_version: 1,
      call_status: "started",
      start_timestamp: new Date().toISOString()
    }
  },
  {
    name: "Call Ended Event",
    event: "call_ended",
    data: {
      call_id: "call_test_ended_" + Date.now(),
      call_type: "phone_call",
      from_number: "+15551234567",
      to_number: "+15559876543",
      direction: "inbound",
      agent_id: "agent_sales_001",
      agent_version: 1,
      call_status: "ended",
      start_timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      end_timestamp: new Date().toISOString(),
      duration_ms: 300000, // 5 minutes
      transcript: "Hello, this is a test call. The customer asked about our products and we had a great conversation. They seem interested in our premium package. Thank you for calling!",
      recording_url: "https://example.com/recording/test_call.mp3"
    }
  },
  {
    name: "Call Analyzed Event",
    event: "call_analyzed",
    data: {
      call_id: "call_test_analyzed_" + Date.now(),
      call_type: "phone_call",
      from_number: "+15551234567",
      to_number: "+15559876543",
      direction: "inbound",
      agent_id: "agent_sales_001",
      agent_version: 1,
      call_status: "ended",
      start_timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
      end_timestamp: new Date(Date.now() - 100000).toISOString(), // 1.67 minutes ago
      duration_ms: 500000, // 8.33 minutes
      transcript: "This was a comprehensive sales call where the customer expressed strong interest in our premium package. The conversation covered pricing, features, and implementation timeline. The customer asked detailed questions about integration with their existing systems.",
      recording_url: "https://example.com/recording/analyzed_call.mp3",
      call_analysis: {
        sentiment: "positive",
        summary: "Highly successful sales call with strong customer interest in premium package",
        key_points: [
          "Customer interested in premium package",
          "Discussed pricing and features",
          "Asked about integration capabilities",
          "Requested follow-up call next week"
        ],
        next_steps: [
          "Send detailed proposal",
          "Schedule follow-up call",
          "Prepare integration documentation"
        ],
        confidence_score: 0.85
      }
    }
  }
];

async function testWebhook(eventData) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(eventData);
    
    const options = {
      hostname: 'aicalldata.netlify.app',
      port: 443,
      path: '/.netlify/functions/webhook-handler',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-retell-signature': 'test-signature'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function testAllEvents() {
  console.log('🧪 Testing Retell AI Webhook with comprehensive data...\n');
  
  for (const event of testEvents) {
    console.log(`📞 Testing: ${event.name}`);
    console.log(`   Event: ${event.event}`);
    console.log(`   Call ID: ${event.data.call_id}`);
    
    try {
      const result = await testWebhook(event);
      
      if (result.statusCode === 200) {
        console.log(`   ✅ Success: ${result.statusCode}`);
        console.log(`   Response: ${result.body}\n`);
      } else {
        console.log(`   ❌ Error: ${result.statusCode}`);
        console.log(`   Response: ${result.body}\n`);
      }
    } catch (error) {
      console.log(`   💥 Exception: ${error.message}\n`);
    }
    
    // Wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('🎯 Testing complete! Check your dashboard at https://aicalldata.netlify.app');
}

testAllEvents().catch(console.error);
