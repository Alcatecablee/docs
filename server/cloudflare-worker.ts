/**
 * Cloudflare Workers Entry Point
 * 
 * This is a lightweight edge worker for serving pre-generated documentation
 * with optimal caching and CDN distribution.
 * 
 * For full deployment guide, see: EDGE_DEPLOYMENT_GUIDE.md
 * 
 * Note: This file requires @cloudflare/workers-types to be installed
 * and properly configured in tsconfig. Types are provided by the Cloudflare
 * Workers runtime.
 */

// Type declarations for Cloudflare Workers types
// These are provided by @cloudflare/workers-types package
declare type KVNamespace = any;
declare type DurableObjectNamespace = any;
declare type ExecutionContext = any;
declare type DurableObject = any;
declare type DurableObjectState = any;

export interface Env {
  // Optional: Only required if using KV for caching instead of Worker Sites
  DOCS_CACHE?: KVNamespace;
  RATE_LIMITER?: DurableObjectNamespace;
  DATABASE_URL?: string;
  OPENAI_API_KEY?: string;
  // Worker Sites automatically provides __STATIC_CONTENT
  __STATIC_CONTENT?: KVNamespace;
}

/**
 * Durable Object for distributed rate limiting
 * Coordinates rate limits across all edge locations
 */
export class RateLimiter {
  private state: DurableObjectState;
  private limits: Map<string, { count: number; resetAt: number }>;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.limits = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const key = url.searchParams.get('key') || 'default';
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const windowMs = parseInt(url.searchParams.get('window') || '60000');

    const now = Date.now();
    const current = this.limits.get(key);

    // Reset window if expired
    if (!current || current.resetAt < now) {
      this.limits.set(key, { count: 1, resetAt: now + windowMs });
      return new Response(JSON.stringify({ allowed: true, remaining: limit - 1 }));
    }

    // Check limit
    if (current.count >= limit) {
      return new Response(JSON.stringify({ 
        allowed: false, 
        remaining: 0,
        resetIn: current.resetAt - now 
      }), { status: 429 });
    }

    // Increment and allow
    current.count++;
    this.limits.set(key, current);
    return new Response(JSON.stringify({ allowed: true, remaining: limit - current.count }));
  }
}

/**
 * Main worker handler
 */
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Security headers
    const securityHeaders = {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'no-referrer',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:",
    };

    try {
      // Rate limiting check (optional - requires Durable Object setup)
      if (env.RATE_LIMITER) {
        const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
        const rateLimitId = env.RATE_LIMITER.idFromName(clientIp);
        const rateLimitObj = env.RATE_LIMITER.get(rateLimitId);
        const rateLimitCheck = await rateLimitObj.fetch(
          `https://internal/check?key=${clientIp}&limit=100&window=60000`
        );
        const rateLimit = await rateLimitCheck.json() as { allowed: boolean; remaining: number };

        if (!rateLimit.allowed) {
          return new Response('Rate limit exceeded', { 
            status: 429,
            headers: { ...corsHeaders, ...securityHeaders, 'Retry-After': '60' }
          });
        }
      }

      // Serve static assets with aggressive caching
      // NOTE: This is a simplified implementation. For production, use one of:
      // 1. Worker Sites (recommended): Uncomment [site] in wrangler.toml
      // 2. Custom KV upload: Implement build step to upload assets to DOCS_CACHE
      if (url.pathname.startsWith('/assets/')) {
        const cache = (caches as any).default as Cache;
        let response = await cache.match(request);

        if (!response) {
          // Try Worker Sites first (if configured)
          if (env.__STATIC_CONTENT) {
            const assetKey = url.pathname.substring(1); // Remove leading slash
            const asset = await env.__STATIC_CONTENT.get(assetKey, { type: 'arrayBuffer' });

            if (asset) {
              // Determine content type from file extension
              const ext = assetKey.split('.').pop()?.toLowerCase();
              const contentTypes: Record<string, string> = {
                'js': 'text/javascript',
                'css': 'text/css',
                'png': 'image/png',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'svg': 'image/svg+xml',
                'webp': 'image/webp',
                'woff': 'font/woff',
                'woff2': 'font/woff2',
              };
              const contentType = contentTypes[ext || ''] || 'application/octet-stream';

              response = new Response(asset, {
                headers: {
                  'Content-Type': contentType,
                  'Cache-Control': 'public, max-age=31536000, immutable',
                  ...corsHeaders,
                  ...securityHeaders,
                },
              });

              // Cache the response for future requests
              ctx.waitUntil(cache.put(request, response.clone()));
            }
          }

          // Fallback if not found in Worker Sites
          if (!response) {
            response = new Response('Asset not found. Enable Worker Sites in wrangler.toml', { 
              status: 404,
              headers: { ...corsHeaders, ...securityHeaders }
            });
          }
        }

        return response;
      }

      // Serve HTML from Worker Sites or KV
      if (url.pathname.endsWith('.html') || url.pathname === '/') {
        const cacheKey = url.pathname === '/' ? 'index.html' : url.pathname.substring(1);
        let content = null;

        // Try Worker Sites first
        if (env.__STATIC_CONTENT) {
          content = await env.__STATIC_CONTENT.get(cacheKey);
        }
        // Fallback to custom KV cache if configured
        else if (env.DOCS_CACHE) {
          content = await env.DOCS_CACHE.get(cacheKey);
        }

        if (content) {
          return new Response(content, {
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'Cache-Control': 'public, max-age=3600, must-revalidate',
              ...corsHeaders,
              ...securityHeaders,
            },
          });
        }

        // Fallback: return 404
        return new Response('Documentation not found. Enable Worker Sites in wrangler.toml', {
          status: 404,
          headers: { ...corsHeaders, ...securityHeaders },
        });
      }

      // API routes (example: health check)
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            ...corsHeaders,
            ...securityHeaders,
          },
        });
      }

      // Default: 404
      return new Response('Not found', {
        status: 404,
        headers: { ...corsHeaders, ...securityHeaders },
      });

    } catch (error) {
      // Error handling
      console.error('Worker error:', error);
      return new Response('Internal server error', {
        status: 500,
        headers: { ...corsHeaders, ...securityHeaders },
      });
    }
  },
};
