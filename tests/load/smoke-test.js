import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '30s',
  thresholds: {
    'http_req_failed': ['rate<0.01'],
    'http_req_duration': ['p(95)<5000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';

export default function () {
  const endpoints = [
    { method: 'GET', url: `${BASE_URL}/` },
    { method: 'GET', url: `${BASE_URL}/api/health` },
    { method: 'GET', url: `${BASE_URL}/api/documentations` },
  ];

  endpoints.forEach(({ method, url }) => {
    const res = http.request(method, url);
    check(res, {
      [`${method} ${url} - status is 200`]: (r) => r.status === 200,
      [`${method} ${url} - response time < 5s`]: (r) => r.timings.duration < 5000,
    });
    sleep(0.5);
  });
}
