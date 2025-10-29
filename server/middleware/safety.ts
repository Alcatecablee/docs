import { Request, Response, NextFunction } from 'express';

function parseList(envVar?: string): string[] {
  return (envVar || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
}

const DEFAULT_BLOCKED = ['localhost', '127.0.0.1', '0.0.0.0'];

export function isAllowedDomain(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    const host = u.hostname.toLowerCase();
    const allowed = parseList(process.env.ALLOWED_DOMAINS);
    const blocked = new Set([...DEFAULT_BLOCKED, ...parseList(process.env.BLOCKED_DOMAINS)]);
    if (blocked.has(host)) return false;
    if (allowed.length === 0) return true; // allow all except blocked when no allowlist
    return allowed.some((d) => host === d || host.endsWith('.' + d));
  } catch {
    return false;
  }
}

export function containsPIIOrProfanity(text: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  const piiPatterns = [
    /\b\d{3}-\d{2}-\d{4}\b/, // SSN-like
    /\b\d{16}\b/,             // 16-digit (card-like)
    /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/,
    /\b\w+@\w+\.[a-z]{2,}\b/, // email
  ];
  const profanity = (process.env.PROFANITY_LIST || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (piiPatterns.some((re) => re.test(t))) return true;
  if (profanity.length > 0 && profanity.some((w) => w && t.includes(w))) return true;
  return false;
}

export function enforceSafety(req: Request, res: Response, next: NextFunction) {
  try {
    const { url } = req.body || {};
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'URL is required' });
    if (!isAllowedDomain(url)) return res.status(400).json({ error: 'URL domain not allowed by policy' });
    // Inspect optional free-text inputs if present
    const freeText = JSON.stringify(req.body || {});
    if (containsPIIOrProfanity(freeText)) return res.status(400).json({ error: 'Request content failed safety checks' });
    next();
  } catch (e: any) {
    return res.status(400).json({ error: 'Safety check failed', details: e?.message });
  }
}


