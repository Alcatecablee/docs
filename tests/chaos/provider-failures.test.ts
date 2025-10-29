import { describe, it, expect } from 'vitest';
import { withCircuitBreaker } from '../../server/utils/circuit-breaker';
import { RateLimiter } from '../../server/rate-limiter';

const config = {
  failureThreshold: 3,
  resetTimeout: 1000,
};

describe('Chaos Engineering: Provider Failures', () => {
  describe('Circuit Breaker Resilience', () => {
    it('should open circuit after consecutive failures', async () => {
      const failingFn = async () => {
        throw new Error('Provider down');
      };

      for (let i = 0; i < 3; i++) {
        await expect(withCircuitBreaker('test-fail', failingFn, config)).rejects.toThrow('Provider down');
      }

      await expect(withCircuitBreaker('test-fail', failingFn, config)).rejects.toThrow('Circuit breaker OPEN');
    });

    it('should transition to half-open state after reset timeout', async () => {
      const failingFn = async () => {
        throw new Error('Provider down');
      };

      for (let i = 0; i < 3; i++) {
        await expect(withCircuitBreaker('test-reset', failingFn, config)).rejects.toThrow('Provider down');
      }

      await new Promise(resolve => setTimeout(resolve, 1100));

      const successFn = async () => 'recovered';
      const result = await withCircuitBreaker('test-reset', successFn, config);
      expect(result).toBe('recovered');
    });

    it('should handle intermittent failures gracefully', async () => {
      let callCount = 0;
      const intermittentFn = async () => {
        callCount++;
        if (callCount % 2 === 0) {
          throw new Error('Intermittent failure');
        }
        return 'success';
      };

      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < 10; i++) {
        try {
          await withCircuitBreaker('intermittent', intermittentFn, { ...config, failureThreshold: 10 });
          successCount++;
        } catch (error) {
          failureCount++;
        }
      }

      expect(failureCount).toBeGreaterThan(0);
      expect(successCount).toBeGreaterThan(0);
    });
  });

  describe('Rate Limiter Under Pressure', () => {
    it('should reject requests when quota exceeded', async () => {
      const limiter = new RateLimiter();
      limiter.configure('test-provider', {
        tokensPerMinute: 5,
        burstCapacity: 2,
      });

      const results = await Promise.allSettled(
        Array.from({ length: 10 }, () =>
          limiter.acquire('test-provider', 1)
        )
      );

      const rejected = results.filter(r => r.status === 'fulfilled' && !r.value).length;
      expect(rejected).toBeGreaterThan(0);
    });

    it('should recover after rate limit window passes', async () => {
      const limiter = new RateLimiter();
      limiter.configure('test-provider-2', {
        tokensPerMinute: 60,
        burstCapacity: 5,
      });

      for (let i = 0; i < 5; i++) {
        await limiter.acquire('test-provider-2', 1);
      }

      const rejected = await limiter.acquire('test-provider-2', 1);
      expect(rejected).toBe(false);

      await new Promise(resolve => setTimeout(resolve, 150));

      const allowed = await limiter.acquire('test-provider-2', 1);
      expect(allowed).toBe(true);
    });
  });

  describe('Provider Failure Scenarios', () => {
    it('should handle complete provider outage', async () => {
      const outageFn = async () => {
        throw new Error('ECONNREFUSED: Provider unreachable');
      };

      const results = await Promise.allSettled(
        Array.from({ length: 10 }, () =>
          withCircuitBreaker('outage-provider', outageFn, { failureThreshold: 5, resetTimeout: 500 })
        )
      );

      const failed = results.filter(r => r.status === 'rejected');
      expect(failed.length).toBe(10);

      const circuitOpenErrors = failed.filter(r => 
        r.status === 'rejected' && r.reason.message.includes('Circuit breaker OPEN')
      );
      expect(circuitOpenErrors.length).toBeGreaterThan(0);
    });

    it('should handle timeout failures', async () => {
      const timeoutFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 10000));
        return 'should not reach here';
      };

      const withTimeout = async () => {
        return Promise.race([
          timeoutFn(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 100)
          ),
        ]);
      };

      for (let i = 0; i < 4; i++) {
        await expect(withCircuitBreaker('timeout-provider', withTimeout, { failureThreshold: 3, resetTimeout: 1000 })).rejects.toThrow();
      }
    });

    it('should handle partial degradation (some endpoints fail)', async () => {
      const healthyEndpoint = async () => 'healthy';
      const degradedEndpoint = async () => {
        throw new Error('Endpoint degraded');
      };

      for (let i = 0; i < 5; i++) {
        await withCircuitBreaker('healthy', healthyEndpoint, config);
      }

      for (let i = 0; i < 3; i++) {
        await expect(withCircuitBreaker('degraded', degradedEndpoint, config)).rejects.toThrow();
      }

      const healthyResult = await withCircuitBreaker('healthy', healthyEndpoint, config);
      expect(healthyResult).toBe('healthy');

      await expect(withCircuitBreaker('degraded', degradedEndpoint, config)).rejects.toThrow('Circuit breaker OPEN');
    });
  });

  describe('Recovery Scenarios', () => {
    it('should gracefully recover from temporary outage', async () => {
      let isDown = true;
      const recoveryFn = async () => {
        if (isDown) {
          throw new Error('Provider temporarily down');
        }
        return 'recovered';
      };

      for (let i = 0; i < 3; i++) {
        await expect(withCircuitBreaker('recovery', recoveryFn, { failureThreshold: 3, resetTimeout: 500 })).rejects.toThrow();
      }

      await new Promise(resolve => setTimeout(resolve, 600));

      isDown = false;

      const result = await withCircuitBreaker('recovery', recoveryFn, { failureThreshold: 3, resetTimeout: 500 });
      expect(result).toBe('recovered');
    });
  });

  describe('Load Spike Scenarios', () => {
    it('should handle sudden traffic spike with backpressure', async () => {
      const limiter = new RateLimiter();
      limiter.configure('spike-test', {
        tokensPerMinute: 10,
        burstCapacity: 3,
      });

      const results = await Promise.allSettled(
        Array.from({ length: 50 }, () =>
          limiter.acquire('spike-test', 1)
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
      const rejected = results.filter(r => r.status === 'fulfilled' && !r.value).length;

      expect(rejected).toBeGreaterThan(0);
      expect(successful).toBeLessThan(50);
    });
  });

  describe('Data Corruption Scenarios', () => {
    it('should handle malformed responses from provider', async () => {
      const malformedFn = async () => {
        return { invalid: 'json{broken' };
      };

      const result = await withCircuitBreaker('malformed', malformedFn, config);
      expect(result).toHaveProperty('invalid');
    });

    it('should handle empty responses', async () => {
      const emptyFn = async () => null;

      const result = await withCircuitBreaker('empty', emptyFn, config);
      expect(result).toBeNull();
    });
  });
});
