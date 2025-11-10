# Vercel Serverless Deployment Guide

## Overview

Your Express backend has been converted to work as Vercel Serverless Functions. This means your entire API runs on-demand without needing a constantly running server.

## Architecture

- **Frontend**: Static React app built with Vite → Served from `/dist`
- **Backend**: Express API wrapped as serverless function → `/api/index.ts`
- **Routing**: 
  - `/api/*` → Serverless function
  - `/*` → Static frontend (SPA)

## Deployment Steps

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Configure Environment Variables

In your Vercel project dashboard, add these environment variables:

#### Required - Database
```
DATABASE_URL=your-postgres-connection-string
```

#### Required - Authentication
```
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

#### Required - At least ONE AI Provider
```
# Option 1: OpenAI
OPENAI_API_KEY=sk-...

# Option 2: Groq (Fast, Free Tier)
GROQ_API_KEY=gsk_...

# Option 3: DeepSeek (Cheap)
DEEPSEEK_API_KEY=sk-...

# Option 4: Google AI
GOOGLE_API_KEY=...

# Option 5: Together AI
TOGETHER_API_KEY=...

# Option 6: OpenRouter
OPENROUTER_API_KEY=...

# Option 7: Hyperbolic
HYPERBOLIC_API_KEY=...
```

#### Optional - Features
```
# PayPal (for payments)
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=sandbox  # or 'live' for production

# YouTube API (for video documentation)
YOUTUBE_API_KEY=...

# Redis (for queue/caching - optional)
REDIS_URL=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Data Retention
ENABLE_DATA_RETENTION=true  # Set to 'false' to disable

# Rate Limiting
ENABLE_RATE_LIMITING=true
```

### 3. Build Configuration

Vercel automatically detects Vite projects. The build settings should be:

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```bash
npm install
```

### 4. Deploy

#### Via Git (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Vercel
3. Vercel automatically deploys on every push

#### Via CLI
```bash
vercel --prod
```

## Important Notes

### Serverless Function Limits

**Free Tier:**
- 10-second execution timeout
- 1024 MB memory
- 100 GB bandwidth/month

**Pro Tier ($20/month):**
- 60-second execution timeout (configured in vercel.json)
- More memory and bandwidth

### Server-Sent Events (SSE)

The `/api/progress/:sessionId` endpoint uses SSE for real-time updates. This works within Vercel's timeout limits (60 seconds on Pro, 10 seconds on Free).

**Consideration:** If documentation generation takes longer than 60 seconds, you'll need to:
- Increase `maxDuration` in `vercel.json` (requires Enterprise plan)
- OR switch to polling instead of SSE
- OR use Vercel Edge Config for status updates

### Cron Jobs

The data retention cron job (`server/index.ts` line 226) **does NOT run** in serverless mode.

To enable scheduled tasks on Vercel:
1. Upgrade to Pro or Enterprise plan
2. Use Vercel Cron (add to `vercel.json`):

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

3. Create `/api/cron/cleanup.ts`:
```typescript
import { VercelRequest, VercelResponse } from '@vercel/node';
import { runDailyCleanup } from '../../server/data-retention';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify cron secret to prevent unauthorized access
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    await runDailyCleanup();
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
```

### Background Job Queue

The BullMQ queue (`server/index.ts` line 183) is initialized but may have limitations:

- **In-memory mode**: Works but jobs lost on cold starts
- **Redis mode**: Requires persistent Redis (Upstash recommended)
- **Alternative**: Use Vercel Edge Config or external job queue (InngestHQ, Trigger.dev)

### Cold Starts

First request after inactivity may take 1-3 seconds to "wake up" the function. Subsequent requests are fast.

## Testing Locally

To test serverless behavior locally:

```bash
# Install Vercel CLI
npm install -g vercel

# Run local development server
vercel dev
```

This simulates the serverless environment with your configured environment variables.

## Troubleshooting

### 405 Method Not Allowed
- **Cause**: API routes not reaching serverless function
- **Fix**: Check `vercel.json` rewrites are correct

### 504 Gateway Timeout
- **Cause**: Function exceeds execution timeout
- **Fix**: 
  - Optimize slow operations
  - Upgrade to Pro for 60-second timeout
  - Split into smaller operations

### Database Connection Errors
- **Cause**: Too many concurrent connections
- **Fix**: Use connection pooling (Neon serverless already does this)

### Environment Variables Not Found
- **Cause**: Not set in Vercel dashboard
- **Fix**: Add all required variables in Project Settings → Environment Variables

## Production Checklist

- [ ] All environment variables configured in Vercel
- [ ] Database connection string added (DATABASE_URL)
- [ ] At least one AI provider API key configured
- [ ] Supabase authentication credentials added
- [ ] Build completes successfully
- [ ] API endpoints return 200 (not 405)
- [ ] SSE progress updates work
- [ ] Documentation generation completes
- [ ] PDF/DOCX exports work
- [ ] PayPal integration works (if enabled)

## Monitoring

Vercel provides built-in monitoring:
- **Analytics**: Function invocations, errors, duration
- **Logs**: Real-time function logs (Pro plan)
- **Speed Insights**: Performance metrics

Access via: Project Dashboard → Analytics/Logs

## Cost Estimates

**Free Tier:**
- Good for testing and low-traffic sites
- ~10-second timeout may be limiting

**Pro ($20/month):**
- Recommended for production
- 60-second timeout handles most operations
- Better for moderate traffic

**Enterprise:**
- Custom limits
- Required for very long-running operations (>60s)

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Serverless Functions: https://vercel.com/docs/concepts/functions/serverless-functions
- Edge Functions: https://vercel.com/docs/concepts/functions/edge-functions
