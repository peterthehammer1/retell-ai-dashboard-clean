# Retell AI Dashboard

A simple, clean dashboard for monitoring Retell AI calls with real-time data from Supabase.

## Features

- 📞 Real-time call monitoring
- 📊 Call statistics and analytics
- 🔄 Auto-refresh every 30 seconds
- 🎨 Beautiful, responsive design
- ⚡ Fast and lightweight

## Setup

1. **Deploy to Netlify:**
   - Connect this repository to Netlify
   - Set environment variables:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

2. **Configure Retell AI:**
   - Webhook URL: `https://your-site.netlify.app/.netlify/functions/webhook-handler`
   - Events: `call_started`, `call_ended`, `call_analyzed`

## Environment Variables

Set these in your Netlify dashboard:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## How It Works

1. Customer calls Retell AI Agent
2. Retell AI sends webhook to your Netlify function
3. Function saves data to Supabase
4. Dashboard displays data in real-time

## Files

- `index.html` - Main dashboard
- `netlify/functions/webhook-handler.js` - Webhook handler
- `netlify.toml` - Netlify configuration

## Testing

Test the webhook:
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/webhook-handler \
  -H "Content-Type: application/json" \
  -d '{
    "event": "call_started",
    "call": {
      "call_id": "test-call-123",
      "agent_id": "agent-123",
      "call_type": "phone_call",
      "call_status": "started",
      "agent_version": 1,
      "from_number": "+15551234567",
      "to_number": "+15559876543",
      "direction": "inbound",
      "start_timestamp": "2025-09-08T14:30:00Z"
    },
    "timestamp": "2025-09-08T14:30:00Z"
  }'
```
