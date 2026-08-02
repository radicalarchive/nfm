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
import { setTimeout as sleep } from 'node:timers/promises';

const SECONDS = parseInt(process.argv[2] || '45', 10);
const ROOM = 'E2E' + Math.floor(Math.random() * 900 + 100);

function launch(port) {
  const p = spawn('chromium', [
    '--headless=new', '--no-sandbox', '--enable-unsafe-swiftshader',
    '--autoplay-policy=no-user-gesture-required',
    '--window-size=800,450', `--remote-debugging-port=${port}`,
    `--user-data-dir=/tmp/nfm-e2e-${port}`,
    'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });
  return p;
}

async function connect(port) {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return new WebSocket(page.webSocketDebuggerUrl);
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error(`no devtools on ${port}`);
}

class Client {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.logs = [];
    ws.addEventListener('message', (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        this.pending.get(msg.id)(msg);
        this.pending.delete(msg.id);
      } else if (msg.method === 'Runtime.consoleAPICalled') {
        this.logs.push(msg.params.args.map((a) => a.value).join(' '));
      }
    });
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res) => this.pending.set(id, res));
  }
  async evaluate(expr) {
    const r = await this.send('Runtime.evaluate', { expression: expr, returnByValue: true });
    return r.result?.result?.value;
  }
}

const ports = [9333, 9334];
const procs = ports.map(launch);
const sockets = [];
for (const port of ports) {
  const ws = await connect(port);
  await new Promise((res) => ws.addEventListener('open', res));
  const c = new Client(ws);
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
for (const [i, c] of sockets.entries()) {
  const interesting = c.logs.filter((l) => !/^sync ok/.test(l)).slice(-6);
  console.log(`--- client ${i} log tail ---\n${interesting.join('\n')}`);
}
procs.forEach((p) => p.kill());
process.exit(oks[0] > 0 && desyncs[0] === 0 && desyncs[1] === 0 ? 0 : 1);
