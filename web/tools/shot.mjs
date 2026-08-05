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
import { writeFileSync, openSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { attach } from './cdp.mjs';

const [url, out, secs = '6', script] = process.argv.slice(2);
if (!url || !out) {
  console.error('usage: node web/tools/shot.mjs <url> <out.png> [seconds] [js]');
  process.exit(2);
}

const PORT = 9350 + Math.floor(Math.random() * 40);
const proc = spawn('chromium', [
  '--headless=new', '--no-sandbox', '--enable-unsafe-swiftshader',
  '--hide-scrollbars', '--window-size=1400,950',
  `--remote-debugging-port=${PORT}`,
  // Profile per RUN. A killed instance leaves its lock behind and the next
  // launch hands its URL to the dead session instead of opening a port.
  `--user-data-dir=/tmp/nfm-shot-${PORT}-${process.pid}`,
  'about:blank',
  // stderr to a file, not an unread pipe: a full pipe buffer blocks chromium.
], { stdio: ['ignore', 'ignore', openSync(`/tmp/nfm-shot-${PORT}.err`, 'w')] });

// attach() reports why it gave up. The loop this replaced caught everything as
// "not up yet" -- including the ReferenceError from `new WebSocket`, a global
// Node only gained in v22 -- and then reported "no devtools".
const cdp = await attach(PORT, '');
const send = (method, params) => cdp.send(method, params);

const logs = [];
cdp.on((m) => {
  if (m.method === 'Runtime.consoleAPICalled') {
    logs.push(m.params.args.map((a) => a.value ?? a.description).join(' '));
  } else if (m.method === 'Runtime.exceptionThrown') {
    logs.push('EXCEPTION ' + (m.params.exceptionDetails.exception?.description
                              || m.params.exceptionDetails.text));
  }
});

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

cdp.close();
proc.kill();
process.exit(0);
