# Chaos Engineering Test Suite

This directory contains chaos engineering tests to validate system resilience under failure conditions.

## Purpose

From PRODUCTION_HARDENING_ROADMAP.md Phase 1 Milestone 6.3:
> "Chaos injection for provider outages"

These tests simulate real-world failure scenarios to ensure the system degrades gracefully and recovers properly.

## Test Categories

### 1. Circuit Breaker Resilience
- **Consecutive failures** - Validates circuit opens after threshold
- **Half-open transitions** - Tests recovery mechanism
- **Intermittent failures** - Handles flapping providers

### 2. Rate Limiter Under Pressure
- **Quota exceeded** - Validates request rejection
- **Window recovery** - Tests rate limit reset
- **Burst capacity** - Validates token bucket behavior

### 3. Provider Failure Scenarios
- **Complete outage** - Total provider unavailability
- **Timeout failures** - Slow/hanging providers
- **Partial degradation** - Some endpoints fail, others work
- **Cascading failures** - One failure doesn't cascade to others

### 4. Recovery Scenarios
- **Graceful recovery** - Proper state transition from OPEN → HALF_OPEN → CLOSED
- **Flapping providers** - Repeatedly failing and recovering
- **Load spike handling** - Sudden traffic increases with backpressure

### 5. Data Corruption
- **Malformed responses** - Invalid JSON from providers
- **Empty responses** - Null/undefined data handling

## Running Tests

```bash
# Run all chaos tests
npm run test tests/chaos

# Run specific scenario
npm run test tests/chaos/provider-failures.test.ts

# Run with coverage
npm run test:coverage tests/chaos
```

## Success Criteria

All tests must pass with:
- ✅ Circuit breakers open on repeated failures
- ✅ Circuit breakers recover after reset timeout
- ✅ Rate limiters reject over-quota requests
- ✅ No cascading failures between independent providers
- ✅ Graceful degradation (system stays up, returns errors)

## Monitoring

In production, monitor these metrics:
- Circuit breaker state transitions (CLOSED → OPEN → HALF_OPEN)
- Rate limit rejections per provider
- Provider failure rates
- Recovery times (OPEN → CLOSED)

## Integration with CI

These tests run automatically in CI to catch regressions:

```yaml
- name: Chaos Tests
  run: npm run test tests/chaos
  continue-on-error: false
```

## Real-World Simulation

To simulate failures in production:

1. **Circuit Breaker Testing:**
   ```typescript
   // Temporarily inject failures
   if (Math.random() < 0.3) throw new Error('Simulated chaos');
   ```

2. **Rate Limit Testing:**
   ```typescript
   // Temporarily reduce limits
   process.env.RATE_LIMIT_RPM = '10';
   ```

3. **Timeout Testing:**
   ```typescript
   // Add artificial delays
   await new Promise(resolve => setTimeout(resolve, 5000));
   ```

## Key Learnings

From initial testing:
- Circuit breakers prevent cascading failures ✅
- Rate limiters provide backpressure under load ✅
- System degrades gracefully (no crashes) ✅
- Recovery mechanisms work as designed ✅

## Next Steps

1. Add network partition simulation (split-brain scenarios)
2. Test database connection pool exhaustion
3. Simulate memory pressure scenarios
4. Add distributed tracing for failure paths
