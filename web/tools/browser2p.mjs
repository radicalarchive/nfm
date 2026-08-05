// Drive two real browsers through a netplay race and report whether they
// agreed, using the Chrome DevTools Protocol rather than --screenshot.
//
// `--virtual-time-budget` cannot be used here: it races the page clock ahead
// while the network runs in real time, so the budget expires before PeerJS has
// finished its handshake with the broker and both ends sit at "connecting".
// CDP keeps the browsers alive on the wall clock instead, which is the only
// way to exercise the transport headlessly.
//
//   node web/tools/browser2p.mjs [seconds]
//
// Needs a server on :8123 serving the repo root.

import { spawn } from 'node:child_process';
import { openSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { attach } from './cdp.mjs';

const SECONDS = parseInt(process.argv[2] || '45', 10);
const ROOM = 'E2E' + Math.floor(Math.random() * 900 + 100);

function launch(port) {
  const p = spawn('chromium', [
    '--headless=new', '--no-sandbox', '--enable-unsafe-swiftshader',
    '--autoplay-policy=no-user-gesture-required',
    '--window-size=800,450', `--remote-debugging-port=${port}`,
    // Profile per RUN, not per port. A killed instance leaves its lock
    // behind, and the next launch then hands its URL to the dead session
    // ("Opening in existing browser session") and never opens a debugging
    // port -- which presents as a connect timeout and looks like a CDP fault.
    `--user-data-dir=/tmp/nfm-e2e-${port}-${process.pid}`,
    'about:blank',
    // stderr to a file, not a pipe. Chromium is chatty here (DBus, ALSA), and
    // nothing was reading the pipe -- a full pipe buffer blocks the browser.
  ], { stdio: ['ignore', 'ignore', openSync(`/tmp/nfm-e2e-${port}.err`, 'w')] });
  return p;
}

const ports = [9333, 9334];
const procs = ports.map(launch);
const sockets = [];
for (const port of ports) {
  // attach() polls /json/list and reports WHY it gave up. The loop this
  // replaced swallowed every error as "not up yet", including the
  // ReferenceError from `new WebSocket` -- a global Node only gained in v22 --
  // and then blamed the browser for a fault that was in this file.
  const c = await attach(port, '');   // still about:blank; navigated below
  c.logs = c.collectConsole();
  await c.send('Runtime.enable');
  await c.send('Page.enable');
  sockets.push(c);
}

const base = 'http://localhost:8123/web/main.html';
await sockets[0].send('Page.navigate', {
  url: `${base}?net=host&room=${ROOM}&stage=1&car=5&players=4&name=Host&musicvol=0&sfxvol=0`,
});
await sleep(4000);
await sockets[1].send('Page.navigate', {
  url: `${base}?net=join&room=${ROOM}&car=2&name=Guest&musicvol=0&sfxvol=0`,
});

for (let s = 0; s < SECONDS; s++) {
  await sleep(1000);
  // Re-assert the throttle every second rather than once at the start: the
  // listeners are not installed until the assets finish loading, and a
  // keydown dispatched before that is simply lost. Enter also skips the
  // intro fly-by, so the cars are actually racing for most of the window.
  for (const c of sockets) {
    await c.evaluate(`dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));`
      + `dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));`
      + `dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));`);
  }
  if (s % 10 === 9) {
    const st = await Promise.all(sockets.map((c) => c.evaluate('document.getElementById("log")?.textContent')));
    console.log(`  ${s + 1}s  host="${st[0]}"  guest="${st[1]}"`);
  }
}

const desyncs = sockets.map((c) => c.logs.filter((l) => /desync/i.test(l)).length);
const oks = sockets.map((c) => c.logs.filter((l) => /^sync ok/.test(l)).length);
console.log(`sync-ok checkpoints: host ${oks[0]}, guest ${oks[1]}`);
console.log(`desyncs reported:    host ${desyncs[0]}, guest ${desyncs[1]}`);
// The handshake happens in the first second and the fps readout logs several
// times a second, so a plain tail buries the one thing this tool is for.
// Report the netplay lines separately -- without them, "0 sync checkpoints"
// cannot be told apart from "the two peers never paired at all".
for (const [i, c] of sockets.entries()) {
  const net = c.logs.filter((l) => /room|join|racing|waiting|peer|desync|error/i.test(l));
  console.log(`--- client ${i} netplay ---\n${net.join('\n') || '(nothing -- never entered netplay)'}`);
  const interesting = c.logs.filter((l) => !/^sync ok/.test(l) && !/fps/.test(l)).slice(-6);
  if (interesting.length) console.log(`--- client ${i} other ---\n${interesting.join('\n')}`);
}
sockets.forEach((c) => c.close());
procs.forEach((p) => p.kill());
process.exit(oks[0] > 0 && desyncs[0] === 0 && desyncs[1] === 0 ? 0 : 1);
