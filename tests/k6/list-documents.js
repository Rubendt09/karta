import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api/v1';
const TOKEN = __ENV.TOKEN || '';
const PROJECT_ID = __ENV.PROJECT_ID || '';

const listTrend = new Trend('list_time');
const downloadTrend = new Trend('download_time');

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    list_time: ['p(95)<1500'],
    download_time: ['p(95)<3000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  if (!TOKEN || !PROJECT_ID) {
    throw new Error('Set TOKEN and PROJECT_ID env vars');
  }

  const headers = { Authorization: `Bearer ${TOKEN}` };

  const listRes = http.get(`${BASE_URL}/projects/${PROJECT_ID}/documents`, { headers });
  listTrend.add(listRes.timings.duration);

  check(listRes, {
    'list status is 200': (r) => r.status === 200,
    'list time < 1.5s': (r) => r.timings.duration < 1500,
  });

  const documents = listRes.json('data') || [];
  if (documents.length > 0) {
    const doc = documents[Math.floor(Math.random() * documents.length)];
    const downloadRes = http.get(`${BASE_URL}/projects/${PROJECT_ID}/documents/${doc.id}/download`, { headers });
    downloadTrend.add(downloadRes.timings.duration);

    check(downloadRes, {
      'download status is 200': (r) => r.status === 200,
      'download time < 3s': (r) => r.timings.duration < 3000,
    });
  }

  sleep(1);
}
