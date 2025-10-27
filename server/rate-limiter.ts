import { LRUCache } from 'lru-cache';

export interface RateLimiterConfig {
  tokensPerMinute: number;
  burstCapacity?: number;
}

export interface QuotaConfig {
  dailyLimit?: number;
  monthlyLimit?: number;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
  capacity: number;
  refillRate: number;
}

interface QuotaUsage {
  dailyUsed: number;
  monthlyUsed: number;
  lastDailyReset: number;
  lastMonthlyReset: number;
}

export class RateLimiter {
  private buckets: Map<string, TokenBucket> = new Map();
  private quotas: Map<string, QuotaUsage> = new Map();
  private configs: Map<string, RateLimiterConfig> = new Map();
  private quotaConfigs: Map<string, QuotaConfig> = new Map();

  constructor() {
    setInterval(() => this.cleanup(), 60000);
  }

  configure(provider: string, config: RateLimiterConfig, quotaConfig?: QuotaConfig) {
    this.configs.set(provider, config);
    if (quotaConfig) {
      this.quotaConfigs.set(provider, quotaConfig);
    }

    if (!this.buckets.has(provider)) {
      const capacity = config.burstCapacity || config.tokensPerMinute;
      this.buckets.set(provider, {
        tokens: capacity,
        lastRefill: Date.now(),
        capacity,
        refillRate: config.tokensPerMinute / 60000,
      });
    }

    if (!this.quotas.has(provider) && quotaConfig) {
      this.quotas.set(provider, {
        dailyUsed: 0,
        monthlyUsed: 0,
        lastDailyReset: Date.now(),
        lastMonthlyReset: Date.now(),
      });
    }
  }

  async acquire(provider: string, tokens: number = 1): Promise<boolean> {
    const config = this.configs.get(provider);
    if (!config) {
      console.warn(`No rate limit config for provider: ${provider}, allowing request`);
      return true;
    }

    if (!this.checkQuota(provider, tokens)) {
      return false;
    }

    const bucket = this.buckets.get(provider);
    if (!bucket) {
      return false;
    }

    this.refillBucket(bucket);

    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens;
      this.updateQuota(provider, tokens);
      return true;
    }

    return false;
  }

  async waitForToken(provider: string, tokens: number = 1, maxWaitMs: number = 5000): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitMs) {
      if (await this.acquire(provider, tokens)) {
        return true;
      }
      await this.sleep(100);
    }

    return false;
  }

  private refillBucket(bucket: TokenBucket): void {
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = timePassed * bucket.refillRate;

    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  private checkQuota(provider: string, tokens: number): boolean {
    const quotaConfig = this.quotaConfigs.get(provider);
    if (!quotaConfig) {
      return true;
    }

    const quota = this.quotas.get(provider);
    if (!quota) {
      return true;
    }

    this.resetQuotaIfNeeded(quota);

    if (quotaConfig.dailyLimit && quota.dailyUsed + tokens > quotaConfig.dailyLimit) {
      console.warn(`Daily quota exceeded for ${provider}: ${quota.dailyUsed}/${quotaConfig.dailyLimit}`);
      return false;
    }

    if (quotaConfig.monthlyLimit && quota.monthlyUsed + tokens > quotaConfig.monthlyLimit) {
      console.warn(`Monthly quota exceeded for ${provider}: ${quota.monthlyUsed}/${quotaConfig.monthlyLimit}`);
      return false;
    }

    return true;
  }

  private updateQuota(provider: string, tokens: number): void {
    const quota = this.quotas.get(provider);
    if (!quota) {
      return;
    }

    this.resetQuotaIfNeeded(quota);
    quota.dailyUsed += tokens;
    quota.monthlyUsed += tokens;
  }

  private resetQuotaIfNeeded(quota: QuotaUsage): void {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneMonthMs = 30 * 24 * 60 * 60 * 1000;

    if (now - quota.lastDailyReset > oneDayMs) {
      quota.dailyUsed = 0;
      quota.lastDailyReset = now;
    }

    if (now - quota.lastMonthlyReset > oneMonthMs) {
      quota.monthlyUsed = 0;
      quota.lastMonthlyReset = now;
    }
  }

  getUsage(provider: string): { available: number; quota: QuotaUsage | undefined } {
    const bucket = this.buckets.get(provider);
    const quota = this.quotas.get(provider);

    if (bucket) {
      this.refillBucket(bucket);
    }

    if (quota) {
      this.resetQuotaIfNeeded(quota);
    }

    return {
      available: bucket?.tokens || 0,
      quota: quota ? { ...quota } : undefined,
    };
  }

  private cleanup(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000;

    for (const [provider, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefill > maxAge) {
        this.buckets.delete(provider);
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const rateLimiter = new RateLimiter();

export function initializeRateLimits() {
  rateLimiter.configure('google', {
    tokensPerMinute: 1000000,
    burstCapacity: 1000000,
  }, {
    dailyLimit: 1500000,
    monthlyLimit: 45000000,
  });

  rateLimiter.configure('together', {
    tokensPerMinute: 100000,
    burstCapacity: 100000,
  }, {
    monthlyLimit: 30000000,
  });

  rateLimiter.configure('openrouter', {
    tokensPerMinute: 50000,
    burstCapacity: 50000,
  });

  rateLimiter.configure('groq', {
    tokensPerMinute: 6000,
    burstCapacity: 6000,
  }, {
    dailyLimit: 14400,
    monthlyLimit: 288000,
  });

  rateLimiter.configure('hyperbolic', {
    tokensPerMinute: 200,
    burstCapacity: 200,
  }, {
    dailyLimit: 288000,
    monthlyLimit: 8640000,
  });

  rateLimiter.configure('deepseek', {
    tokensPerMinute: 10000,
    burstCapacity: 10000,
  });

  rateLimiter.configure('openai', {
    tokensPerMinute: 10000,
    burstCapacity: 10000,
  });

  console.log('✅ Rate limiters initialized for all AI providers');
}
