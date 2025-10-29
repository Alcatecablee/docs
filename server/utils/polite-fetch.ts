import fetch from 'node-fetch';
import { createRobotsTxtService } from '../services/robots-txt';
import { monitoring } from '../monitoring';
import { logger } from '../logger';

type Bucket = {
  tokens: number;
  capacity: number;
  refillRatePerSec: number;
  lastRefill: number;
};

const perHostBuckets: Map<string, Bucket> = new Map();
const perHostInFlight: Map<string, number> = new Map();

const DEFAULT_PER_HOST_QPS = 1; // 1 req/sec per host by default
const DEFAULT_MAX_CONCURRENCY = 2; // at most 2 concurrent per host
const GLOBAL_USER_AGENT = process.env.CRAWLER_USER_AGENT || 'DocSS-Crawler/1.0 (+https://example.com)';

const robotsService = createRobotsTxtService(GLOBAL_USER_AGENT);

function getBucketForHost(host: string): Bucket {
  const existing = perHostBuckets.get(host);
  if (existing) return existing;
  const bucket: Bucket = {
    tokens: DEFAULT_PER_HOST_QPS,
    capacity: DEFAULT_PER_HOST_QPS,
    refillRatePerSec: DEFAULT_PER_HOST_QPS,
    lastRefill: Date.now()
  };
  perHostBuckets.set(host, bucket);
  return bucket;
}

function refill(bucket: Bucket) {
  const now = Date.now();
  const elapsedSec = (now - bucket.lastRefill) / 1000;
  const add = elapsedSec * bucket.refillRatePerSec;
  bucket.tokens = Math.min(bucket.capacity, bucket.tokens + add);
  bucket.lastRefill = now;
}

async function waitForToken(host: string, crawlDelaySec: number): Promise<void> {
  const bucket = getBucketForHost(host);
  const minDelayMs = Math.max(0, crawlDelaySec * 1000);
  const start = Date.now();
  while (true) {
    refill(bucket);
    const inFlight = perHostInFlight.get(host) || 0;
    if (bucket.tokens >= 1 && inFlight < DEFAULT_MAX_CONCURRENCY) {
      bucket.tokens -= 1;
      if (minDelayMs > 0) await new Promise(r => setTimeout(r, minDelayMs));
      const waited = Date.now() - start;
      if (waited > 0 || minDelayMs > 0) {
        monitoring.recordMetric('crawler.wait_for_token', waited, true, undefined, {
          host,
          crawlDelayMs: minDelayMs,
          inFlight
        });
      }
      return;
    }
    await new Promise(r => setTimeout(r, 100));
  }
}

export type PoliteFetchOptions = {
  method?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  signal?: AbortSignal;
  respectRobots?: boolean;
};

export async function politeFetch(url: string, options: PoliteFetchOptions = {}) {
  const u = new URL(url);
  const origin = `${u.protocol}//${u.host}`;
  const host = u.host;
  const respectRobots = options.respectRobots !== false;

  let crawlDelay = 0;
  if (respectRobots) {
    const t0 = Date.now();
    const { allowed, crawlDelay: cd } = await robotsService.isAllowed(url);
    monitoring.recordMetric('crawler.robots_check', Date.now() - t0, allowed, allowed ? undefined : 'ROBOTS_BLOCKED', {
      host,
      path: u.pathname,
      query: u.search,
      allowed
    });
    crawlDelay = cd || 0;
    if (!allowed) {
      const err: any = new Error(`Blocked by robots.txt: ${url}`);
      err.code = 'ROBOTS_BLOCKED';
      throw err;
    }
  }

  await waitForToken(host, crawlDelay);
  perHostInFlight.set(host, (perHostInFlight.get(host) || 0) + 1);

  const controller = new AbortController();
  const timeout = options.timeoutMs ?? 8000;
  const t = setTimeout(() => controller.abort(), timeout);

  try {
    const t0 = Date.now();
    const resp = await fetch(url, {
      method: options.method || 'GET',
      signal: options.signal || controller.signal,
      headers: {
        'User-Agent': GLOBAL_USER_AGENT,
        ...(options.headers || {})
      }
    } as any);
    monitoring.recordMetric('crawler.fetch', Date.now() - t0, !!resp && resp.ok, !resp || !resp.ok ? `HTTP_${resp && resp.status}` : undefined, {
      host,
      status: resp && resp.status,
      method: options.method || 'GET'
    });
    if (!resp.ok) {
      logger.warn({ host, url, status: resp && resp.status }, 'Fetch non-OK');
    }
    return resp;
  } finally {
    clearTimeout(t);
    perHostInFlight.set(host, Math.max(0, (perHostInFlight.get(host) || 1) - 1));
  }
}

export async function politeHeadOrGet(url: string): Promise<Response | null> {
  try {
    const head = await politeFetch(url, { method: 'HEAD', timeoutMs: 5000 });
    if (head.ok) return head as any;
  } catch {}
  try {
    const get = await politeFetch(url, { method: 'GET', timeoutMs: 8000 });
    if (get.ok) return get as any;
  } catch {}
  return null;
}

export async function politeFetchWithRetry(
  url: string,
  options: PoliteFetchOptions = {},
  retries: number = 2,
  baseDelayMs: number = 300
) {
  let attempt = 0;
  while (true) {
    try {
      const resp = await politeFetch(url, options);
      if (resp && resp.ok) return resp;
      const status = resp && resp.status;
      const transient = status === 429 || (status && status >= 500);
      if (!transient) return resp;
      if (attempt >= retries) return resp;
    } catch (e: any) {
      if (attempt >= retries) throw e;
    }
    const jitter = Math.floor(Math.random() * baseDelayMs);
    const delay = baseDelayMs * Math.pow(2, attempt) + jitter;
    await new Promise(r => setTimeout(r, delay));
    attempt += 1;
  }
}


