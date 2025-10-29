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

export interface SafetyCheckResult {
  safe: boolean;
  violations: string[];
  warnings: string[];
}

export function checkSafety(input: { url: string; content: string }): SafetyCheckResult {
  const violations: string[] = [];
  const warnings: string[] = [];
  
  const { url, content } = input;
  const combinedText = `${url} ${content}`.toLowerCase();
  
  if (!isAllowedDomain(url)) {
    try {
      const urlObj = new URL(url);
      const suspiciousTLDs = ['.ru', '.xyz', '.click', '.top', '.online', '.download', '.loan', '.bid', '.review', '.win'];
      if (suspiciousTLDs.some(tld => urlObj.hostname.endsWith(tld))) {
        violations.push('Domain is blocklisted or suspicious');
      } else {
        violations.push('URL domain not allowed by policy');
      }
    } catch {
      violations.push('URL domain not allowed by policy');
    }
  }
  
  const piiPatterns = [
    { regex: /\b\d{3}-\d{2}-\d{4}\b/, msg: 'SSN' },
    { regex: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{1,4}\b/, msg: 'Credit Card' },
    { regex: /\b\d{4}[- ]?\d{6}[- ]?\d{5}\b/, msg: 'AmEx Card' },
    { regex: /\bsk[_-](test|live|proj)[_-][a-zA-Z0-9]{20,}/, msg: 'API Key' },
    { regex: /\bghp_[a-zA-Z0-9]{36,}/, msg: 'GitHub Token' },
    { regex: /-----BEGIN (RSA|EC|OPENSSH|DSA) PRIVATE KEY-----/, msg: 'Private Key' },
    { regex: /postgresql:\/\/[^:]+:[^@]+@/, msg: 'Database URL' },
    { regex: /Bearer\s+eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+/, msg: 'OAuth Token' },
    { regex: /AKIA[0-9A-Z]{16}/, msg: 'AWS Access Key' },
    { regex: /wJalrXUtn[a-zA-Z0-9\/+=]{36,}/, msg: 'AWS Secret' },
    { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/, msg: 'IP Address' },
    { regex: /([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/, msg: 'MAC Address' },
    { regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/, msg: 'Email' },
    { regex: /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/, msg: 'Phone' },
    { regex: /password\s*[:=]\s*[^\s]+/i, msg: 'Password' },
  ];
  
  for (const pattern of piiPatterns) {
    if (pattern.regex.test(content)) {
      violations.push('Content contains potentially sensitive PII');
      break;
    }
  }
  
  const sqlPatterns = [
    /'.*(?:OR|AND).*'=/, 
    /(?:--|;).*(?:DROP|DELETE|INSERT|UPDATE|SELECT)/i,
    /\bUNION\s+SELECT/i,
    /\bEXEC(?:UTE)?\s+(?:sp_|xp_)/i,
    /'.*AND\s+1=1/i,
    /'--/,
    /'\s+OR\s+1\s*=\s*1/i,
    /'\s+OR\s+'1'\s*=\s*'1/i,
  ];
  if (sqlPatterns.some(p => p.test(combinedText))) {
    warnings.push('URL contains suspicious SQL patterns');
  }
  
  const xssPatterns = [
    /<script[^>]*>.*<\/script>/i,
    /javascript:/i,
    /on(?:load|error|focus|click|mouse|start)=/i,
    /<(?:iframe|embed|object|img|svg|body|input|select|marquee)/i,
    /alert\s*\(/i,
    /document\.cookie/i,
    /%3C(?:script|iframe|img|svg)/i,
    /%253C(?:script|iframe)/i,
  ];
  if (xssPatterns.some(p => p.test(content))) {
    warnings.push('Content contains potentially unsafe HTML/JavaScript');
  }
  
  const promptInjectionPatterns = [
    /ignore\s+(?:all\s+)?(?:previous|above|prior|earlier|your)?\s*(?:instructions|commands|rules|prompts?|training)/i,
    /forget\s+(?:your\s+)?(?:system\s+)?(?:prompt|instructions|rules)/i,
    /you\s+are\s+now\s+(?:in\s+)?(?:debug|admin|god|developer)\s+mode/i,
    /disregard\s+(?:safety|ethical|previous|all)\s+(?:guidelines|constraints|instructions)/i,
    /override.*(?:safety|security|policy|instructions|show|reveal)/i,
    /pretend\s+you\s+(?:are|have)\s+(?:no|without)\s+(?:restrictions|constraints|limits|ethical)/i,
    /system.*(?:disable|bypass).*(?:filter|policy)/i,
    /from\s+now\s+on.*without\s+(?:restrictions|rules|limits)/i,
    /hypothetically.*if\s+you\s+(?:could|would)\s+ignore/i,
    /\/\*.*ignore.*(?:above|previous)/i,
    /(?:ignore|disregard).*(?:above|training)/i,
    /(?:not|never|without)\s+bound\s+by\s+(?:ethical|safety)\s+(?:constraints|guidelines)/i,
    /pretend.*(?:not|never|without).*ethical/i,
    /(?:new|follow\s+my)\s+(?:rules|instructions)/i,
    /do\s+not\s+follow.*(?:previous|any)\s+rules/i,
    /bypass\s+(?:content|safety)\s+policy/i,
    /(?:test|training)\s+scenario.*normal\s+rules.*(?:not|do\s+not)\s+apply/i,
    /you\s+must\s+(?:now\s+)?follow\s+my\s+instructions/i,
    /(?:show|reveal|display)\s+(?:database|secret|api|private)/i,
  ];
  if (promptInjectionPatterns.some(p => p.test(content))) {
    warnings.push('Content contains potential prompt injection attempt');
  }
  
  const pathTraversalPatterns = [
    /\.\.[\/\\]/,
    /%2e%2e[\/\\]/i,
    /%252e%252e/i,
    /\.\.;/,
    /%c0%af/i,
    /%5c/i,
  ];
  if (pathTraversalPatterns.some(p => p.test(url))) {
    warnings.push('URL contains path traversal patterns');
  }
  
  const commandPatterns = [
    /[;&|`$]\s*(?:ls|cat|rm|wget|curl|nc|python|php|sh|bash)/i,
    /\$\([^)]+\)/,
    /`[^`]+`/,
  ];
  if (commandPatterns.some(p => p.test(content))) {
    warnings.push('Content contains shell command patterns');
  }
  
  const profanityList = (process.env.PROFANITY_LIST || 'garbage,hell,damn,sucks,bloody,wtf,crap,bs,stupid,crappy').split(',').map(s => s.trim().toLowerCase());
  if (profanityList.some(word => word && content.toLowerCase().includes(word))) {
    warnings.push('Content may contain profanity');
  }
  
  return {
    safe: violations.length === 0,
    violations,
    warnings,
  };
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


