import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api/v1';
const TOKEN = __ENV.TOKEN || '';
const PROJECT_ID = __ENV.PROJECT_ID || '';

const uploadTrend = new Trend('upload_time');

export const options = {
  scenarios: {
    light_uploads: {
      executor: 'constant-vus',
      vus: 5,
      duration: '30s',
      env: { SIZE_MB: '1' },
    },
    heavy_uploads: {
      executor: 'constant-vus',
      vus: 3,
      duration: '30s',
      env: { SIZE_MB: '5' },
      startTime: '35s',
    },
  },
  thresholds: {
    upload_time: ['p(95)<5000'],
    http_req_failed: ['rate<0.05'],
  },
};

function buildFile(sizeMb) {
  const size = sizeMb * 1024 * 1024;
  const chunk = 'x'.repeat(1024);
  let content = '';
  while (content.length < size) {
    content += chunk;
  }
  content = content.substring(0, size);
  return http.file(content, `doc-${sizeMb}mb.bin`, 'application/octet-stream');
}

export default function () {
  if (!TOKEN || !PROJECT_ID) {
    throw new Error('Set TOKEN and PROJECT_ID env vars');
  }

  const sizeMb = parseInt(__ENV.SIZE_MB || '1');
  const file = buildFile(sizeMb);

  const payload = {
    file: file,
    name: `test-doc-${sizeMb}mb-${Date.now()}`,
    priority: 'MEDIA',
    description: 'Documento de prueba generado por k6',
  };

  const res = http.post(`${BASE_URL}/projects/${PROJECT_ID}/documents`, payload, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
    tags: { size_mb: `${sizeMb}` },
  });

  uploadTrend.add(res.timings.duration);

  check(res, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });

  sleep(1);
}
