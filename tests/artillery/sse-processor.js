const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'sse-latency.csv');

function beforeScenario(context, ee, next) {
  context.vars.startTime = Date.now();
  context.vars.firstByteTime = null;
  context.vars.completeTime = null;
  return next();
}

function afterResponse(requestParams, response, context, ee, next) {
  const body = response.body || '';
  const lines = body.split('\n');

  lines.forEach((line) => {
    if ((line.startsWith('event:text') || line.startsWith('event: text')) && !context.vars.firstByteTime) {
      context.vars.firstByteTime = Date.now();
    }
    if (line.startsWith('event:complete') || line.startsWith('event: complete')) {
      context.vars.completeTime = Date.now();
    }
  });

  if (context.vars.completeTime) {
    const ttfb = context.vars.firstByteTime - context.vars.startTime;
    const ttc = context.vars.completeTime - context.vars.startTime;
    const row = `${context.vars.startTime},${context.vars.firstByteTime},${context.vars.completeTime},${ttfb},${ttc}\n`;
    fs.appendFileSync(OUTPUT, row);
  }

  return next();
}

module.exports = {
  beforeScenario,
  afterResponse,
};
