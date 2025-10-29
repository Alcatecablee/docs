import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '5m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  const res = http.get(`${BASE_URL}/api/documentations`);
  
  const result = check(res, {
    'status is 200': (r) => r.status === 200,
  });

  errorRate.add(!result);
  sleep(1);
}

export function handleSummary(data) {
  const errors = data.metrics.errors.values.rate;
  const maxVUs = Math.max(...data.metrics.vus.values);

  console.log(`\n=== Stress Test Results ===`);
  console.log(`Max VUs: ${maxVUs}`);
  console.log(`Error Rate: ${(errors * 100).toFixed(2)}%`);
  console.log(`System ${errors < 0.05 ? 'STABLE' : 'DEGRADED'} under stress`);

  return {
    'stdout': JSON.stringify(data, null, 2),
  };
}
