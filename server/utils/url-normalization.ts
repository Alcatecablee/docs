export function normalizeUrl(rawUrl: string): string {
  const u = new URL(rawUrl);
  // Lowercase host
  u.host = u.host.toLowerCase();
  // Remove default ports
  if ((u.protocol === 'http:' && u.port === '80') || (u.protocol === 'https:' && u.port === '443')) {
    u.port = '';
  }
  // Remove fragments
  u.hash = '';
  // Sort query params and drop tracking params
  const params = new URLSearchParams(u.search);
  const drop = new Set(['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid','ref']);
  const kept: [string,string][] = [];
  params.forEach((value, key) => { if (!drop.has(key.toLowerCase())) kept.push([key, value]); });
  kept.sort(([a],[b]) => a.localeCompare(b));
  u.search = kept.length ? `?${kept.map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')}` : '';
  // Remove trailing slash for non-root paths
  if (u.pathname !== '/' && u.pathname.endsWith('/')) {
    u.pathname = u.pathname.replace(/\/+$/,'');
  }
  // Collapse multiple slashes
  u.pathname = u.pathname.replace(/\/+/, '/');
  return u.toString();
}

export function isSameOrigin(a: string, b: string): boolean {
  const ua = new URL(a); const ub = new URL(b);
  return ua.protocol === ub.protocol && ua.host.toLowerCase() === ub.host.toLowerCase();
}

export function isLikelyDocPath(pathname: string): boolean {
  const p = pathname.toLowerCase();
  return /(docs|doc|guide|getting-started|tutorial|manual|reference|api)/.test(p);
}


