const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

const BASE_URL = process.env.BASE_URL || 'http://localhost:8080/api/v1';
const TOKEN = process.env.TOKEN || '';
const PROJECT_ID = process.env.PROJECT_ID || '';
const DOCUMENT_ID = process.env.DOCUMENT_ID || '';
const MESSAGE = process.env.MESSAGE || 'Resume los puntos principales del documento';

if (!TOKEN || !PROJECT_ID) {
  console.error('Set TOKEN and PROJECT_ID env vars');
  process.exit(1);
}

const outputFile = path.join(__dirname, 'sse-latency.csv');
if (!fs.existsSync(outputFile)) {
  fs.writeFileSync(outputFile, 'startTime,firstByteTime,completeTime,ttfb,ttc\n');
}

const startTime = Date.now();
let firstByteTime = null;
let completeTime = null;

const body = JSON.stringify({
  message: MESSAGE,
  documentIds: DOCUMENT_ID ? [DOCUMENT_ID] : [],
  history: [],
});

fetch(`${BASE_URL}/projects/${PROJECT_ID}/chat`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${TOKEN}`,
  },
  body,
})
  .then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let done = false;

    function pump() {
      return reader.read().then(({ value, done: readerDone }) => {
        if (readerDone) return;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          if ((line.startsWith('event:text') || line.startsWith('event: text')) && !firstByteTime) {
            firstByteTime = Date.now();
          }
          if (line.startsWith('event:complete') || line.startsWith('event: complete')) {
            completeTime = Date.now();
            done = true;
          }
        }

        if (done) {
          const ttfb = firstByteTime - startTime;
          const ttc = completeTime - startTime;
          fs.appendFileSync(outputFile, `${startTime},${firstByteTime},${completeTime},${ttfb},${ttc}\n`);
          console.log(`TTFB: ${ttfb}ms, TTC: ${ttc}ms`);
          reader.cancel();
          return;
        }

        return pump();
      });
    }

    return pump();
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
