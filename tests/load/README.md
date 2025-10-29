# Load Testing Suite

This directory contains k6 load tests for validating Phase 1 success metrics.

## Prerequisites

Install k6:
```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6

# Docker
docker pull grafana/k6
```

## Running Tests

### Baseline Crawl Test
Tests the 20-page crawl + research pipeline against Phase 1 targets:
- P95 latency ≤ 8 minutes
- < 1% pipeline abort rate

```bash
# Local test
k6 run tests/load/baseline-crawl.js

# Against specific environment
BASE_URL=https://your-app.replit.dev k6 run tests/load/baseline-crawl.js

# With custom VUs and duration
k6 run --vus 20 --duration 5m tests/load/baseline-crawl.js
```

### Smoke Test
Quick validation with minimal load:
```bash
k6 run tests/load/smoke-test.js
```

### Stress Test
Push system to limits to find breaking points:
```bash
k6 run tests/load/stress-test.js
```

## Success Criteria

From PRODUCTION_HARDENING_ROADMAP.md Phase 1:

| Metric | Target | Test |
|--------|--------|------|
| P95 end-to-end latency | ≤ 8 min | baseline-crawl.js |
| Pipeline abort rate | < 1% | baseline-crawl.js |

## Results

Test results are saved to:
- `stdout` - Full k6 metrics
- `summary.json` - Key metrics for CI integration

Example summary:
```json
{
  "p95_latency_minutes": 7.2,
  "success_rate": 0.995,
  "abort_rate": 0.005,
  "targets_met": {
    "p95_under_8min": true,
    "abort_under_1pct": true
  }
}
```

## CI Integration

Add to GitHub Actions:
```yaml
- name: Load Test
  run: |
    k6 run tests/load/baseline-crawl.js
    if [ $(jq '.targets_met.p95_under_8min and .targets_met.abort_under_1pct' summary.json) != "true" ]; then
      echo "Load test failed to meet targets"
      exit 1
    fi
```
