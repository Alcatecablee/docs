# Deployment Fixes Summary

## Issues Fixed

### 1. Content Security Policy (CSP)
**Problem:** CSP was blocking Google Fonts and external images
**Solution:** Updated `vercel.json` and `server/cloudflare-worker.ts` to allow:
- `style-src`: Added `https://fonts.googleapis.com`
- `font-src`: Added `https://fonts.gstatic.com`  
- `img-src`: Changed to `https:` to allow all HTTPS images
- `frame-src`: Added PayPal domains for payment integration

### 2. Missing /quotation Route (404 Error)
**Problem:** Index.tsx navigated to non-existent `/quotation` route
**Solution:** Updated `handleGenerate()` to:
1. Check Supabase authentication (required!)
2. Generate unique sessionId
3. Navigate to `/generate/:sessionId` with URL in state
4. GenerationProgress page handles the actual generation flow

### 3. API Routes Returning 405
**Problem:** Vercel was serving `index.html` for ALL routes, including `/api/*`
**Solution:** Updated `vercel.json` rewrites to proxy API routes first:
```json
"rewrites": [
  { "source": "/api/:path*", "destination": "https://YOUR_BACKEND_URL/api/:path*" },
  { "source": "/(.*)", "destination": "/index.html" }
]
```

## Important Deployment Configuration

### CRITICAL: The 405 Error Fix

The 405 error happens because Vercel is a **static hosting platform** and serves `index.html` for all routes. Your Express server with the `/api/*` routes is NOT deployed on Vercel.

### Deployment Options (Choose ONE):

#### Option 1: Separate Backend Deployment (RECOMMENDED)
Deploy your Express backend separately and configure the frontend to call it:

1. **Deploy backend** to a Node.js hosting platform:
   - Railway: `railway up`
   - Render: Connect GitHub repo
   - Fly.io: `fly deploy`
   - Replit: Already running here!

2. **Update frontend API calls** in `src/lib/queryClient.ts`:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
   
   export async function apiRequest(path: string, options?: RequestInit) {
     const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
     // ... rest of code
   }
   ```

3. **Add environment variable** in Vercel:
   - `VITE_API_URL=https://your-backend.railway.app`

4. **Update CORS** in `server/index.ts` to allow Vercel domain

#### Option 2: Migrate to Vercel Serverless Functions
Convert your Express routes to Vercel serverless functions:

1. **Install Vercel adapter**:
   ```bash
   npm install @vercel/node
   ```

2. **Create `/api` folder** in project root

3. **Convert routes**: Move each Express route to a serverless function:
   ```typescript
   // api/generate-docs.ts
   import { VercelRequest, VercelResponse } from '@vercel/node';
   
   export default async function handler(req: VercelRequest, res: VercelResponse) {
     // Your route logic here
   }
   ```

4. **Update vercel.json**:
   ```json
   {
     "functions": {
       "api/**/*.ts": {
         "memory": 1024,
         "maxDuration": 60
       }
     }
   }
   ```

#### Option 3: Use Vercel with Express (Experimental)
Wrap entire Express app as a serverless function:

1. **Create `/api/index.ts`**:
   ```typescript
   import app from '../server/index';
   export default app;
   ```

2. **Update vercel.json**:
   ```json
   {
     "rewrites": [
       { "source": "/api/(.*)", "destination": "/api" }
     ]
   }
   ```

## Architecture Understanding

### User Flow:
1. **Landing Page** → User enters URL
2. **Auth Check** → Supabase authentication required (MANDATORY)
3. **Payment Check** → Quote-based PayPal system (NOT Stripe)
4. **Generation** → Navigate to `/generate/:sessionId`
5. **Progress Tracking** → SSE connection to `/api/progress/:sessionId`
6. **Doc Creation** → POST to `/api/generate-docs` with authentication

### Payment Model:
- **System**: Quote-based with PayPal (subscriptions, invoices, custom orders)
- **NOT Stripe**: The Stripe CSP errors are noise - system uses PayPal
- **Tiers**: Free (Starter), $675 (Growing), $1800 (Established), $5000 (Major)
- **Flow**: User selects tier → Gets quote → Pays → Then generates docs

### Authentication:
- **Backend**: Uses `verifySupabaseAuth` middleware
- **Required**: All generation and export endpoints require Supabase session
- **Anonymous users**: Blocked at backend - frontend must check auth first

## Next Steps for Production

1. **Configure Backend URL** in `vercel.json` line 16
2. **Deploy Backend** separately if not using Vercel serverless
3. **Test Auth Flow**: Ensure Supabase is configured with correct keys
4. **Test Payment**: Verify PayPal integration works
5. **Test Generation**: Try the full flow: Sign in → Generate → Download
