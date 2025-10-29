# Observability Backend Configuration

## Overview

The application uses OpenTelemetry (OTEL) for distributed tracing and metrics. The OTEL SDK is configured in `server/otel.ts` and exports data via OTLP (OpenTelemetry Protocol) over HTTP.

## Current Status

- ✅ **OTEL SDK configured** with trace and metric exporters
- ✅ **Auto-instrumentation** for HTTP, Express, and database calls
- ✅ **Environment-based configuration** for flexible backend wiring
- ⚠️ **Default endpoint**: `http://localhost:4318` (development only)

## Production Backend Options

### Option 1: Grafana Cloud (Recommended)

**Pros**: Managed service, free tier available, integrated traces/metrics/logs  
**Setup Time**: 5 minutes

#### Steps:

1. Create account at [grafana.com/auth/sign-up](https://grafana.com/auth/sign-up)

2. Navigate to **Connections → OpenTelemetry**

3. Copy your OTLP endpoint and create an API token

4. Set environment variables in Replit:

```bash
# Grafana Cloud OTLP endpoint (example)
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-central-0.grafana.net/otlp

# Grafana Cloud authentication
OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic <base64-encoded-username:token>"

# Service name for filtering
OTEL_SERVICE_NAME=viberdoc-production
```

5. Restart the application - traces and metrics will appear in Grafana Cloud

#### Grafana Cloud Dashboards

Pre-built dashboards available:
- **RED Metrics**: Rate, Errors, Duration for all endpoints
- **Service Map**: Visualize request flow between services
- **Trace Explorer**: Search and analyze distributed traces

### Option 2: Honeycomb

**Pros**: Excellent query performance, great for debugging  
**Setup Time**: 5 minutes

#### Steps:

1. Create account at [honeycomb.io](https://honeycomb.io)

2. Create a new environment and copy API key

3. Set environment variables:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.honeycomb.io

OTEL_EXPORTER_OTLP_HEADERS="x-honeycomb-team=<your-api-key>"

OTEL_SERVICE_NAME=viberdoc-production
```

### Option 3: Self-Hosted (OpenTelemetry Collector + Grafana + Prometheus)

**Pros**: Full control, no data egress, cost-effective at scale  
**Setup Time**: 30-60 minutes

#### Architecture:

```
Application → OTEL Collector → {
  Grafana Tempo (traces)
  Prometheus (metrics)
  Loki (logs)
}
```

#### Docker Compose Example:

```yaml
version: '3.8'

services:
  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    command: ["--config=/etc/otel-collector-config.yaml"]
    volumes:
      - ./otel-collector-config.yaml:/etc/otel-collector-config.yaml
    ports:
      - "4318:4318"  # OTLP HTTP receiver

  tempo:
    image: grafana/tempo:latest
    command: ["-config.file=/etc/tempo.yaml"]
    volumes:
      - ./tempo.yaml:/etc/tempo.yaml
      - tempo-data:/var/tempo
    ports:
      - "3200:3200"

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=true
      - GF_AUTH_ANONYMOUS_ORG_ROLE=Admin
    volumes:
      - grafana-data:/var/lib/grafana
    ports:
      - "3000:3000"

volumes:
  tempo-data:
  prometheus-data:
  grafana-data:
```

Application environment variables:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
OTEL_SERVICE_NAME=viberdoc-production
```

### Option 4: Datadog

**Pros**: Enterprise-grade, APM + infrastructure monitoring  
**Setup Time**: 10 minutes

#### Steps:

1. Install Datadog agent or use their OTLP ingestion

2. Set environment variables:

```bash
OTEL_EXPORTER_OTLP_ENDPOINT=https://http-intake.logs.datadoghq.com

OTEL_EXPORTER_OTLP_HEADERS="DD-API-KEY=<your-dd-api-key>"

OTEL_SERVICE_NAME=viberdoc-production
```

## Monitoring Dashboards

### Essential Metrics to Monitor

#### 1. Request Metrics (RED)
- **Rate**: Requests per second (HTTP, API calls)
- **Errors**: Error rate per endpoint
- **Duration**: P50, P95, P99 latencies

#### 2. Circuit Breaker Metrics
- Circuit state transitions (CLOSED → OPEN → HALF_OPEN)
- Failure counts per service
- Recovery success rate

#### 3. Rate Limiter Metrics
- Request rejection rate per provider
- Quota utilization (daily/monthly)
- Token bucket fill rate

#### 4. Crawling Metrics
- Pages crawled per minute
- robots.txt disallow hits
- Retry and backoff events
- Content hash deduplication hits

#### 5. AI Provider Metrics
- Tokens consumed per provider
- Request latency per model
- Schema validation failures
- Safety filter rejections

### Sample Grafana Dashboard Queries

```promql
# HTTP request rate
rate(http_server_requests_total[5m])

# Error rate
rate(http_server_requests_total{status=~"5.."}[5m]) / rate(http_server_requests_total[5m])

# P95 latency
histogram_quantile(0.95, rate(http_server_request_duration_bucket[5m]))

# Circuit breaker open count
circuit_breaker_state{state="OPEN"}

# Rate limit rejections
rate_limit_rejected_total
```

## Alerting Rules

### Critical Alerts

```yaml
# High error rate
- alert: HighErrorRate
  expr: rate(http_server_requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  annotations:
    summary: "Error rate above 5% for {{ $labels.route }}"

# Circuit breaker open
- alert: CircuitBreakerOpen
  expr: circuit_breaker_state{state="OPEN"} > 0
  for: 1m
  annotations:
    summary: "Circuit breaker open for {{ $labels.service }}"

# High latency
- alert: HighLatency
  expr: histogram_quantile(0.95, rate(http_server_request_duration_bucket[5m])) > 8000
  for: 10m
  annotations:
    summary: "P95 latency above 8 seconds"

# Quota exhaustion
- alert: QuotaNearExhaustion
  expr: rate_limit_quota_remaining / rate_limit_quota_total < 0.1
  for: 5m
  annotations:
    summary: "{{ $labels.provider }} quota below 10%"
```

## Testing the Integration

### 1. Verify OTEL Export

```bash
# Check OTEL startup logs
grep "OpenTelemetry SDK started" logs/app.log

# Test trace export (should see 200 OK)
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -d '{"resourceSpans": []}'
```

### 2. Generate Test Traffic

```bash
# Generate traces
for i in {1..100}; do
  curl http://localhost:5000/api/health
done
```

### 3. Query Backend

**Grafana Cloud:**
- Navigate to **Explore** → **Tempo**
- Query: `{service.name="viberdoc-production"}`

**Honeycomb:**
- Navigate to **Datasets** → Your service
- Query: `COUNT` grouped by `http.route`

## Troubleshooting

### Issue: No traces appearing in backend

**Checks:**
1. Verify `OTEL_EXPORTER_OTLP_ENDPOINT` is set correctly
2. Check network connectivity: `curl -v $OTEL_EXPORTER_OTLP_ENDPOINT/v1/traces`
3. Verify authentication headers are correct
4. Check application logs for OTEL errors

### Issue: High cardinality warnings

**Solution:** Reduce label cardinality by:
- Normalizing URL paths (replace IDs with placeholders)
- Limiting user-agent variations
- Grouping error messages

### Issue: Missing metrics in Prometheus

**Solution:**
- Ensure `PeriodicExportingMetricReader` interval is not too long (currently 60s)
- Check Prometheus scrape config targets OTEL collector
- Verify metric names match Prometheus naming conventions

## Production Checklist

- [ ] Configure production OTLP endpoint (not localhost)
- [ ] Set up authentication/API keys in secrets
- [ ] Create RED metrics dashboard
- [ ] Configure alerts for critical errors
- [ ] Set up on-call rotation for alerts
- [ ] Document runbooks for common incidents
- [ ] Test failover scenarios (backend unavailable)
- [ ] Monitor OTEL SDK overhead (< 5% CPU/memory)

## Cost Optimization

### Sampling Strategies

For high-traffic production:

```typescript
// server/otel.ts - Add sampler
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';

const sdk = new NodeSDK({
  // Sample 10% of traces
  sampler: new TraceIdRatioBasedSampler(0.1),
  // ... rest of config
});
```

### Metric Aggregation

Reduce metric cardinality:
- Group low-traffic routes into "other"
- Aggregate by service instead of instance
- Use exemplars for linking traces to metrics

## Next Steps

1. **Week 1**: Set up Grafana Cloud and validate trace export
2. **Week 2**: Create production dashboards for RED metrics
3. **Week 3**: Configure alerting rules and on-call rotation
4. **Week 4**: Add custom business metrics (docs generated, search queries)

## References

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Grafana Cloud OTLP Setup](https://grafana.com/docs/grafana-cloud/send-data/otlp/)
- [OTEL Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/)
- [Production Hardening Roadmap](./PRODUCTION_HARDENING_ROADMAP.md) - Phase 1 Milestone 6.1
