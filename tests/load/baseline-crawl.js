import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend, Rate } from 'k6/metrics';

const successRate = new Rate('success_rate');
const pipelineErrors = new Counter('pipeline_errors');
const generationDuration = new Trend('generation_duration');

export const options = {
  stages: [
    { duration: '30s', target: 5 },
    { duration: '2m', target: 10 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<480000'],
    'success_rate': ['rate>0.99'],
    'generation_duration': ['p(95)<480000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  const payload = JSON.stringify({
    url: 'https://docs.example.com',
    maxPages: 20,
    userId: `load-test-${__VU}-${__ITER}`,
    title: `Load Test Documentation ${__VU}`,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: '480s',
  };

  const startTime = Date.now();
  const res = http.post(`${BASE_URL}/api/generate`, payload, params);
  const duration = Date.now() - startTime;

  const success = check(res, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'has documentation ID': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.id !== undefined;
      } catch (e) {
        return false;
      }
    },
    'no pipeline errors': (r) => {
      try {
        const body = JSON.parse(r.body);
        return !body.error;
      } catch (e) {
        return false;
      }
    },
    'duration under 8 minutes': () => duration < 480000,
  });

  successRate.add(success);
  generationDuration.add(duration);

  if (!success) {
    pipelineErrors.add(1);
    console.error(`Pipeline failed for VU ${__VU} iteration ${__ITER}: ${res.status} ${res.body}`);
  }

  sleep(1);
}

export function handleSummary(data) {
  const p95Latency = data.metrics.generation_duration.values['p(95)'];
  const successRate = data.metrics.success_rate.values.rate;
  const abortRate = 1 - successRate;

  console.log(`\n=== Load Test Results ===`);
  console.log(`P95 Generation Duration: ${(p95Latency / 60000).toFixed(2)} minutes`);
  console.log(`Success Rate: ${(successRate * 100).toFixed(2)}%`);
  console.log(`Abort Rate: ${(abortRate * 100).toFixed(2)}%`);
  console.log(`Target P95: ≤ 8 minutes: ${p95Latency <= 480000 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Target Abort Rate: < 1%: ${abortRate < 0.01 ? '✅ PASS' : '❌ FAIL'}`);

  return {
    'stdout': JSON.stringify(data, null, 2),
    'summary.json': JSON.stringify({
      p95_latency_minutes: p95Latency / 60000,
      success_rate: successRate,
      abort_rate: abortRate,
      targets_met: {
        p95_under_8min: p95Latency <= 480000,
        abort_under_1pct: abortRate < 0.01,
      },
    }, null, 2),
  };
}
