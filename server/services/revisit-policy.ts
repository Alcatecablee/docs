import Redis from 'ioredis';

export interface RevisitInfo {
  url: string;
  etag?: string;
  lastModified?: string;
  lastSeen: number;
  ttlMs: number;
}

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000;

class MemoryStore {
  private data = new Map<string, RevisitInfo>();
  async get(key: string): Promise<RevisitInfo | undefined> { return this.data.get(key); }
  async set(key: string, value: RevisitInfo): Promise<void> { this.data.set(key, value); }
}

export class RevisitPolicyService {
  private redis?: Redis;
  private memory = new MemoryStore();

  constructor(redisUrl?: string) {
    if (redisUrl) {
      try {
        this.redis = new Redis(redisUrl, { lazyConnect: true });
        // lazy connect; errors handled on first op
      } catch {
        this.redis = undefined;
      }
    }
  }

  private key(url: string) { return `revisit:${url}`; }

  async get(url: string): Promise<RevisitInfo | undefined> {
    const k = this.key(url);
    if (this.redis) {
      try {
        const raw = await this.redis.get(k);
        if (raw) return JSON.parse(raw);
      } catch {
        // fallback to memory
      }
    }
    return this.memory.get(k);
  }

  async set(info: RevisitInfo): Promise<void> {
    const k = this.key(info.url);
    if (this.redis) {
      try {
        await this.redis.set(k, JSON.stringify(info), 'PX', info.ttlMs);
        return;
      } catch {
        // fallback
      }
    }
    await this.memory.set(k, info);
  }

  async getConditionalHeaders(url: string): Promise<Record<string, string>> {
    const info = await this.get(url);
    const headers: Record<string, string> = {};
    if (info?.etag) headers['If-None-Match'] = info.etag;
    if (info?.lastModified) headers['If-Modified-Since'] = info.lastModified;
    return headers;
  }

  async updateFromResponse(url: string, response: Response, ttlMs: number = DEFAULT_TTL_MS): Promise<void> {
    const etag = (response.headers as any).get('etag') || undefined;
    const lastModified = (response.headers as any).get('last-modified') || undefined;
    const now = Date.now();
    await this.set({ url, etag, lastModified, lastSeen: now, ttlMs });
  }

  shouldRevisit(info?: RevisitInfo): boolean {
    if (!info) return true;
    return Date.now() - info.lastSeen > info.ttlMs;
  }
}

export const createRevisitPolicyService = () => new RevisitPolicyService(process.env.REDIS_URL);


