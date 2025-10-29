# Edge Deployment Guide

## Overview

This guide covers deploying ViberDoc to edge platforms for global CDN distribution, automatic SSL, and optimal performance.

**Status**: Phase 1 Milestone 5.1 & 5.2 (PRODUCTION_HARDENING_ROADMAP.md)

## Deployment Options

### Option 1: Cloudflare Workers (Recommended)

**Pros**: Global CDN, automatic SSL, KV storage, Durable Objects for state  
**Performance**: TTFB < 50ms globally  
**Cost**: Free tier: 100k requests/day, Paid: $5/month for 10M requests

#### Prerequisites

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login
```

#### Setup Steps

1. **Update Account ID**

Edit `wrangler.toml`:
```toml
account_id = "your-account-id-here"
```

Find your account ID at: https://dash.cloudflare.com/ → Workers & Pages → Overview

2. **Create KV Namespace** (for caching)

```bash
# Production namespace
wrangler kv:namespace create "DOCS_CACHE" --preview=false

# Copy the ID and update wrangler.toml:
[env.production.kv_namespaces]
binding = "DOCS_CACHE"
id = "your-kv-namespace-id"
```

3. **Configure Secrets**

```bash
# Set database connection string
wrangler secret put DATABASE_URL --env production

# Set API keys
wrangler secret put OPENAI_API_KEY --env production
wrangler secret put SUPABASE_KEY --env production
```

4. **Deploy**

```bash
# Deploy to production
npm run build
wrangler deploy --env production

# Your site will be available at:
# https://viberdoc.your-subdomain.workers.dev
```

5. **Custom Domain Setup**

In Cloudflare dashboard:
- Navigate to **Workers & Pages** → **Your Worker** → **Settings** → **Triggers**
- Add custom domain: `docs.viberdoc.app`
- SSL certificate automatically provisioned via Universal SSL

#### Worker Code

The Cloudflare Worker implementation is in `server/cloudflare-worker.ts`. Key features:

**Static Asset Serving**:
- Checks Cloudflare Cache first for fastest response
- Falls back to KV storage for assets not in edge cache
- Applies aggressive caching (1 year) for immutable assets
- Supports all common file types (JS, CSS, images, fonts)

**HTML Caching**:
- 1 hour cache for HTML files with revalidation
- Stored in KV namespace for global availability

**Rate Limiting**:
- Distributed rate limiting via Durable Objects
- Per-IP limits with customizable thresholds
- Automatic rate limit resets after time window

**Security Headers**:
- HSTS with preload
- Content Security Policy
- X-Frame-Options DENY
- X-Content-Type-Options nosniff

**Architecture**:
```
Request → Edge Cache → KV Storage → 404
          ↓ (if miss)    ↓ (if miss)
          Cache PUT ←────┘
```

See `server/cloudflare-worker.ts` for full implementation.

### Option 2: Vercel (Already Configured)

**Pros**: Zero-config deployments, preview deployments, serverless functions  
**Performance**: Global edge network  
**Cost**: Free tier: 100GB bandwidth, Paid: $20/month

#### Existing Configuration

`vercel.json` is already configured. To deploy:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

#### Environment Variables

Set in Vercel dashboard or CLI:

```bash
vercel env add DATABASE_URL production
vercel env add OPENAI_API_KEY production
vercel env add SUPABASE_KEY production
```

#### Custom Domain

In Vercel dashboard:
- Navigate to **Settings** → **Domains**
- Add domain: `docs.viberdoc.app`
- Configure DNS records as shown
- SSL automatically provisioned via Let's Encrypt

### Option 3: Cloudflare Pages (Static Sites)

**Best for**: Pre-generated static documentation  
**Pros**: Unlimited bandwidth, automatic SSL, free  

#### Setup

1. **Build static site**

```bash
npm run build
# Outputs to ./dist
```

2. **Deploy via Wrangler**

```bash
npx wrangler pages deploy dist --project-name=viberdoc
```

3. **Custom domain**

Add in Cloudflare Pages dashboard

## SSL Configuration

### Automatic SSL

Both Cloudflare and Vercel provide automatic SSL:

**Cloudflare**:
- Universal SSL (free) - Issued within 24 hours
- Advanced Certificate Manager ($10/month) - Custom certificates
- Supports wildcards: `*.docs.viberdoc.app`

**Vercel**:
- Let's Encrypt SSL (free)
- Automatic renewal
- Supports wildcards with DNS verification

### HSTS Headers

Add to worker/server config:

```typescript
// Cloudflare Worker
app.use('*', secureHeaders({
  strictTransportSecurity: 'max-age=31536000; includeSubDomains; preload',
}));

// Express
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});
```

### HSTS Preload

Submit to Chrome's HSTS preload list:
1. Ensure HSTS header includes `preload` directive
2. Submit at: https://hstspreload.org/
3. Wait 6-12 weeks for inclusion

## Cache Configuration

### Cache Headers

```typescript
// Static assets (CSS, JS, images) - 1 year
app.use('/assets/*', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  next();
});

// HTML pages - 1 hour
app.use('*.html', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
  next();
});

// API responses - 5 minutes
app.use('/api/*', (req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
  next();
});
```

### Cache Busting

**Asset Hashing** (automatic with Vite):

```javascript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
  },
};
```

Files will be named: `main.a1b2c3d4.js`

### CDN Cache Purge

**Cloudflare**:
```bash
# Purge everything
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  -d '{"purge_everything":true}'

# Purge specific files
curl -X POST "https://api.cloudflare.com/client/v4/zones/{zone_id}/purge_cache" \
  -H "Authorization: Bearer {api_token}" \
  -d '{"files":["https://docs.viberdoc.app/index.html"]}'
```

**Vercel**:
Automatic purge on deployment

## Performance Targets

From PRODUCTION_HARDENING_ROADMAP.md - Phase 1 Milestone 5.2:

| Metric | Target | Measurement |
|--------|--------|-------------|
| TTFB P95 | < 200ms | Cached pages |
| Cache HIT ratio | > 90% | Global CDN |
| SSL handshake | < 100ms | TLS 1.3 |

### Validation

```bash
# Test TTFB
curl -w "@curl-format.txt" -o /dev/null -s https://docs.viberdoc.app

# curl-format.txt:
time_namelookup:  %{time_namelookup}s
time_connect:     %{time_connect}s
time_appconnect:  %{time_appconnect}s
time_pretransfer: %{time_pretransfer}s
time_starttransfer: %{time_starttransfer}s (TTFB)
time_total:       %{time_total}s
```

## DNS Configuration

### Cloudflare DNS (Recommended)

```
# Example DNS records
docs.viberdoc.app    CNAME   viberdoc.workers.dev   (Proxied)
*.docs.viberdoc.app  CNAME   viberdoc.workers.dev   (Proxied)
```

### Vercel DNS

```
docs.viberdoc.app    CNAME   cname.vercel-dns.com   (DNS only)
```

## Monitoring

### Edge Metrics

**Cloudflare Analytics**:
- Requests per second
- Bandwidth usage
- Cache hit ratio
- Error rates
- Geographic distribution

**Vercel Analytics**:
- Page views
- Core Web Vitals
- Edge request counts
- Serverless function invocations

### Alerts

Configure alerts for:
- Cache hit ratio < 85%
- TTFB P95 > 200ms
- Error rate > 1%
- SSL certificate expiration

## Deployment Automation

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Edge

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      # Cloudflare Workers
      - name: Deploy to Cloudflare
        run: npx wrangler deploy --env production
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      
      # Or Vercel
      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Rollback Procedure

### Cloudflare Workers

```bash
# List recent deployments
wrangler deployments list

# Rollback to specific version
wrangler rollback --version-id={version-id}
```

### Vercel

```bash
# Promote a previous deployment to production
vercel promote {deployment-url}
```

## Production Checklist

- [ ] Configure custom domain
- [ ] Enable automatic SSL
- [ ] Set HSTS headers with preload
- [ ] Configure cache headers for assets
- [ ] Implement asset hashing/fingerprinting
- [ ] Set up CDN purge automation
- [ ] Configure geographic routing if needed
- [ ] Set up monitoring and alerts
- [ ] Test TTFB from multiple regions
- [ ] Validate cache hit ratio > 90%
- [ ] Configure deployment automation
- [ ] Document rollback procedures

## Cost Estimation

### Cloudflare Workers

**Free Tier**:
- 100,000 requests/day
- KV: 1GB storage, 1M reads, 1M writes/day

**Paid ($5/month)**:
- 10M requests included
- $0.50 per additional million
- KV: $0.50/GB storage

### Vercel

**Free Tier**:
- 100GB bandwidth/month
- Serverless: 100GB-hours

**Pro ($20/month)**:
- 1TB bandwidth
- Serverless: 1000GB-hours

## Next Steps

1. **Week 1**: Deploy to Cloudflare Workers staging
2. **Week 2**: Configure custom domain and SSL
3. **Week 3**: Validate performance targets (TTFB < 200ms)
4. **Week 4**: Production deployment with monitoring

## References

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Vercel Documentation](https://vercel.com/docs)
- [PRODUCTION_HARDENING_ROADMAP.md](./PRODUCTION_HARDENING_ROADMAP.md) - Phase 1 Milestones 5.1 & 5.2
