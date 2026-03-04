import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
  scenarios: {
    smoke_homepage: {
      executor: 'constant-vus',
      vus: Number(__ENV.K6_VUS || 1),
      duration: __ENV.K6_DURATION || '30s',
      tags: { scenario: 'smoke_homepage' },
    },
  },
};

export default function () {
  const response = http.get(`${baseUrl}/`);

  check(response, {
    'status is 200': (result) => result.status === 200,
    'response time < 1000ms': (result) => result.timings.duration < 1000,
  });

  sleep(1);
}
