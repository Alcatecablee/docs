import fetch from 'node-fetch';

type RobotsRule = {
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
};

type RobotsCacheEntry = {
  fetchedAt: number;
  expiresAt: number;
  rulesByAgent: Map<string, RobotsRule>;
};

const robotsCache: Map<string, RobotsCacheEntry> = new Map();

const DEFAULT_TTL_MS = 10 * 60 * 1000;
const DEFAULT_CRAWL_DELAY = 0;

function normalizePath(pathname: string): string {
  if (!pathname.startsWith('/')) return '/' + pathname;
  return pathname;
}

function patternToRegex(pattern: string): RegExp {
  // Convert simple robots pattern to regex: * → .*, and respect trailing $ as end-anchor
  // We escape regex metachars EXCEPT '$' so that a literal '$' in robots means end of URL
  const escaped = pattern
    .replace(/[.+?^{}()|[\]\\]/g, '\\$&') // exclude '$' from this class on purpose
    .replace(/\*/g, '.*');
  return new RegExp('^' + escaped);
}

function pickBestAgent(agents: string[], ua: string): string {
  // Prefer exact match, then wildcard '*'
  const lowerUA = ua.toLowerCase();
  let best = '*';
  for (const a of agents) {
    if (a === '*') continue;
    if (lowerUA.includes(a.toLowerCase())) return a;
  }
  return best;
}

export function parseRobots(text: string): Map<string, RobotsRule> {
  const lines = text.split(/\r?\n/).map(l => l.trim());
  const rulesByAgent: Map<string, RobotsRule> = new Map();
  let currentAgents: string[] = [];
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key === 'user-agent') {
      const agent = value || '*';
      if (!rulesByAgent.has(agent)) rulesByAgent.set(agent, { allow: [], disallow: [] });
      // Start a new agent block (robots allows multiple agents grouped)
      currentAgents = [agent];
    } else if (key === 'allow' || key === 'disallow') {
      const pattern = normalizePath(value || '/');
      if (currentAgents.length === 0) {
        // Spec allows rules preceding agent? Safest: attach to wildcard
        if (!rulesByAgent.has('*')) rulesByAgent.set('*', { allow: [], disallow: [] });
        currentAgents = ['*'];
      }
      for (const a of currentAgents) {
        const r = rulesByAgent.get(a)!;
        if (key === 'allow') r.allow.push(pattern);
        else r.disallow.push(pattern);
      }
    } else if (key === 'crawl-delay') {
      const delay = parseFloat(value);
      if (!isNaN(delay)) {
        const seconds = Math.max(0, delay);
        if (currentAgents.length === 0) {
          if (!rulesByAgent.has('*')) rulesByAgent.set('*', { allow: [], disallow: [] });
          currentAgents = ['*'];
        }
        for (const a of currentAgents) {
          const r = rulesByAgent.get(a)!;
          r.crawlDelay = seconds;
        }
      }
    } else if (key === 'sitemap') {
      // Ignored here (sitemaps handled elsewhere)
    }
  }
  // Ensure wildcard exists
  if (!rulesByAgent.has('*')) rulesByAgent.set('*', { allow: [], disallow: [] });
  return rulesByAgent;
}

async function fetchRobotsTxt(origin: string, userAgent: string, timeoutMs = 5000): Promise<RobotsCacheEntry> {
  const url = new URL('/robots.txt', origin).href;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { 'User-Agent': userAgent }
    } as any);
    const now = Date.now();
    if (!resp.ok) {
      return {
        fetchedAt: now,
        expiresAt: now + DEFAULT_TTL_MS,
        rulesByAgent: new Map([['*', { allow: [], disallow: [], crawlDelay: DEFAULT_CRAWL_DELAY }]])
      };
    }
    const text = await resp.text();
    const rulesByAgent = parseRobots(text);
    return {
      fetchedAt: now,
      expiresAt: now + DEFAULT_TTL_MS,
      rulesByAgent
    };
  } catch {
    const now = Date.now();
    return {
      fetchedAt: now,
      expiresAt: now + DEFAULT_TTL_MS,
      rulesByAgent: new Map([['*', { allow: [], disallow: [], crawlDelay: DEFAULT_CRAWL_DELAY }]])
    };
  } finally {
    clearTimeout(t);
  }
}

export class RobotsTxtService {
  private userAgent: string;

  constructor(userAgent: string) {
    this.userAgent = userAgent;
  }

  /**
   * Prime the cache for a host origin with provided robots.txt text (useful for tests)
   */
  primeCache(origin: string, robotsText: string, ttlMs: number = DEFAULT_TTL_MS) {
    const now = Date.now();
    robotsCache.set(origin, {
      fetchedAt: now,
      expiresAt: now + ttlMs,
      rulesByAgent: parseRobots(robotsText)
    });
  }

  async getRulesFor(hostOrigin: string): Promise<{ rules: RobotsRule; agent: string }> {
    const key = hostOrigin;
    const cached = robotsCache.get(key);
    const now = Date.now();
    if (cached && cached.expiresAt > now) {
      const agent = pickBestAgent(Array.from(cached.rulesByAgent.keys()), this.userAgent);
      const rules = cached.rulesByAgent.get(agent) || cached.rulesByAgent.get('*')!;
      return { rules: rules || { allow: [], disallow: [], crawlDelay: DEFAULT_CRAWL_DELAY }, agent };
    }
    const entry = await fetchRobotsTxt(hostOrigin, this.userAgent);
    robotsCache.set(key, entry);
    const agent = pickBestAgent(Array.from(entry.rulesByAgent.keys()), this.userAgent);
    const rules = entry.rulesByAgent.get(agent) || entry.rulesByAgent.get('*')!;
    return { rules: rules || { allow: [], disallow: [], crawlDelay: DEFAULT_CRAWL_DELAY }, agent };
  }

  async isAllowed(targetUrl: string): Promise<{ allowed: boolean; crawlDelay: number }> {
    const u = new URL(targetUrl);
    const origin = `${u.protocol}//${u.host}`;
    const { rules } = await this.getRulesFor(origin);
    const path = normalizePath(u.pathname + (u.search || ''));
    // Compute most specific rule: longest matching pattern wins; Allow wins ties.
    const matches = (patterns: string[]) => patterns
      .map(p => ({ p, re: patternToRegex(p) }))
      .filter(x => x.re.test(path))
      .sort((a, b) => b.p.length - a.p.length);
    const allowMatches = matches(rules.allow);
    const disallowMatches = matches(rules.disallow);
    const topAllow = allowMatches[0]?.p.length || -1;
    const topDisallow = disallowMatches[0]?.p.length || -1;
    if (topAllow === -1 && topDisallow === -1) {
      return { allowed: true, crawlDelay: rules.crawlDelay ?? DEFAULT_CRAWL_DELAY };
    }
    if (topAllow >= topDisallow) {
      return { allowed: true, crawlDelay: rules.crawlDelay ?? DEFAULT_CRAWL_DELAY };
    }
    return { allowed: false, crawlDelay: rules.crawlDelay ?? DEFAULT_CRAWL_DELAY };
  }
}

export const createRobotsTxtService = (userAgent: string) => new RobotsTxtService(userAgent);


