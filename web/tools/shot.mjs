// Screenshot a page on the WALL clock, over CDP.
//
//   node web/tools/shot.mjs <url> <out.png> [seconds] [js-to-run-first]
//
// `--screenshot --virtual-time-budget` cannot be used for anything that waits
// on IndexedDB: virtual time races the page clock ahead of the storage
// thread's callbacks, so `indexedDB.open()` never resolves and the page sits
// on "loading…" forever. That is a headless artifact, not a page bug -- the
// same code works in a real browser -- but it means the car editor and
// anything else touching carstore.js has to be shot this way. Console output
// is printed, which is the other thing --screenshot makes awkward.
//
// Needs a server on :8123 serving the repo root.

import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const [url, out, secs = '6', script] = process.argv.slice(2);
if (!url || !out) {
  console.error('usage: node web/tools/shot.mjs <url> <out.png> [seconds] [js]');
  process.exit(2);
}

const PORT = 9350 + Math.floor(Math.random() * 40);
const proc = spawn('chromium', [
  '--headless=new', '--no-sandbox', '--enable-unsafe-swiftshader',
  '--hide-scrollbars', '--window-size=1400,950',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=/tmp/nfm-shot-${PORT}`,
  'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'] });

async function connect() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return new WebSocket(page.webSocketDebuggerUrl);
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error('no devtools');
}

const ws = await connect();
await new Promise((res) => ws.addEventListener('open', res));

let id = 0;
const pending = new Map();
const logs = [];
ws.addEventListener('message', (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  else if (msg.method === 'Runtime.consoleAPICalled') {
    logs.push(msg.params.args.map((a) => a.value ?? a.description).join(' '));
  } else if (msg.method === 'Runtime.exceptionThrown') {
    logs.push('EXCEPTION ' + (msg.params.exceptionDetails.exception?.description ||
                              msg.params.exceptionDetails.text));
  }
});
const send = (method, params = {}) => {
  const n = ++id;
  ws.send(JSON.stringify({ id: n, method, params }));
  return new Promise((res) => pending.set(n, res));
};

await send('Runtime.enable');
await send('Page.enable');
await send('Page.navigate', { url });
await sleep(parseInt(secs, 10) * 1000);

// Optional interaction: drive the page, then wait again before the shot. This
// is how a change is verified as a change rather than as a first paint.
if (script) {
  const r = await send('Runtime.evaluate', { expression: script, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) console.log('[eval] threw', r.result.exceptionDetails.text);
  else console.log('[eval]', JSON.stringify(r.result?.result?.value));
  await sleep(2000);
}

const shot = await send('Page.captureScreenshot', { format: 'png' });
writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
for (const l of logs) console.log('[page]', l);
console.log('wrote', out);

proc.kill();
process.exit(0);
