// Drive N real browsers through a netplay race and report how well they
// tracked each other, using the Chrome DevTools Protocol rather than
// --screenshot.
//
// This is the only test that exercises netpeer.js: the star topology, the
// host's accept queue and its relay of guest packets exist nowhere else, and
// PeerJS cannot be driven under node.
//
// `--virtual-time-budget` cannot be used here: it races the page clock ahead
// while the network runs in real time, so the budget expires before PeerJS has
// finished its handshake with the broker and both ends sit at "connecting".
// CDP keeps the browsers alive on the wall clock instead, which is the only
// way to exercise the transport headlessly.
//
//   node web/tools/browsern.mjs [seconds] [players]
//
// Needs a server on :8123 serving the repo root.

import { spawn } from 'node:child_process';
import { openSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { attach } from './cdp.mjs';

const SECONDS = parseInt(process.argv[2] || '45', 10);
const PLAYERS = Math.max(2, parseInt(process.argv[3] || '2', 10));
const ROOM = 'E2E' + Math.floor(Math.random() * 900 + 100);

// This tool measures the TRANSPORT, so the renderer is turned down as far as
// it goes. N headless browsers share one CPU with no GPU between them, and a
// client starved to 5 tick/s while another runs at 18 sends its packets three
// times too slowly -- which shows up as drift and reads as a protocol fault
// when it is really this machine failing to run N copies of the game at once.
// ?draw=0 skips gs.draw() entirely -- no projection, no backdrop, no geometry.
// The simulation still runs at full rate and the net layer is untouched, so
// the game plays itself blind. Nothing softer is enough: ?raster=0 only stubs
// the emit path and leaves Plane.d's per-vertex projection, which is ~81% of
// draw, running in full.
const LIGHT = '&res=1&interp=0&overlay=0&draw=0';

function launch(port) {
  const p = spawn('chromium', [
    '--headless=new', '--no-sandbox', '--enable-unsafe-swiftshader',
    // Autoplay unblocked so the audio-unlock path is exercised, muted so the
    // engine loop and soundtrack stay off the machine's speakers -- two
    // browsers playing the game aloud for the length of the run otherwise.
    // The audio pipeline still runs, so nothing under test is skipped.
    '--autoplay-policy=no-user-gesture-required', '--mute-audio',
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

const ports = Array.from({ length: PLAYERS }, (_, i) => 9333 + i);
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
  url: `${base}?net=host&room=${ROOM}&stage=1&car=5&players=6&humans=${PLAYERS}`
     + `&name=Host&musicvol=0&sfxvol=0${LIGHT}`,
});
// Guests join one at a time. Staggering them is not politeness: it is what
// puts a second connection through the host's accept path while an earlier
// one is already bound, which is the case a single guest never reaches.
await sleep(4000);
for (let i = 1; i < PLAYERS; i++) {
  await sockets[i].send('Page.navigate', {
    url: `${base}?net=join&room=${ROOM}&car=${i + 1}&name=Guest${i}&musicvol=0&sfxvol=0${LIGHT}`,
  });
  await sleep(2500);
}

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
  // Exercise the reliable channel from each client in turn, and check the
  // others received it. Chat is the only traffic that must never be dropped,
  // so it rides a separate ordered DataChannel from the state packets.
  if (s === 12) {
    for (const [i, c] of sockets.entries()) {
      await c.evaluate(`window.nfmChat && nfmChat('hello-from-${i}')`);
      await sleep(400);
    }
  }
  if (s % 10 === 9) {
    const st = await Promise.all(sockets.map((c) => c.evaluate('document.getElementById("log")?.textContent')));
    console.log(`  ${s + 1}s  ` + st.map((t, i) => `[${i}] ${t}`).join('  '));
  }
}

// Under state sync there is no agreement to check for: the clients are
// SUPPOSED to differ between packets, so main.js reports the worst recent
// correction and the slots it came from, and that is what this reads.
//
// Count a POSITIVE signal. A checker that only looks for evidence of FAILURE
// reports success when it has examined nothing at all, which is the most
// expensive way for a sync test to be wrong.
//
// WHAT IS AND IS NOT GATED HERE. Drift is reported but NOT failed on: N
// headless browsers share one CPU with no GPU, and a client starved to 7
// tick/s while another runs at 19 sends its state nearly three times too
// slowly, which produces large corrections that say nothing about the
// protocol. netloop.mjs is where drift is measured, because it controls
// pacing exactly. What this tool uniquely proves is that the TRANSPORT works:
// that N peers pair, that the host assigns distinct slots, and that every
// client hears every other one -- including guest-to-guest, which only exists
// from three players up and only via the host's relay.
const parsed = sockets.map((c) => c.logs
  .map((l) => /^drift @\d+: ([\d.]+) units slots=(\S*)/.exec(l))
  .filter(Boolean));
const drifts = parsed.map((ms) => ms.map((m) => parseFloat(m[1])));
const heard = parsed.map((ms) => {
  const set = new Set();
  for (const m of ms) for (const s of m[2].split(',')) if (s !== '') set.add(+s);
  return set;
});
for (const [i, d] of drifts.entries()) {
  const who = i === 0 ? 'host   ' : `guest ${i}`;
  console.log(d.length
    ? `${who} ${d.length} corrections, worst ${Math.max(...d).toFixed(1)} units,`
      + ` heard slots [${[...heard[i]].sort((a, b) => a - b)}]`
    : `${who} NO corrections — this client never heard anybody`);
}

// Every client must have heard every other PLAYER. Bots are host-owned, so a
// guest hearing them proves nothing extra about the relay.
let allHeard = true;
for (let i = 0; i < PLAYERS; i++) {
  for (let j = 0; j < PLAYERS; j++) {
    if (i === j) continue;
    if (!heard[i].has(j)) {
      console.log(`  MISSING: client ${i} never heard player ${j}`
        + (i !== 0 && j !== 0 ? '  (guest-to-guest — the relay path)' : ''));
      allHeard = false;
    }
  }
}

// The handshake happens in the first second and the fps readout logs several
// times a second, so a plain tail buries the one thing this tool is for.
// Report the netplay lines separately -- without them, "0 sync checkpoints"
// cannot be told apart from "the two peers never paired at all".
for (const [i, c] of sockets.entries()) {
  const net = c.logs.filter((l) => /room|join|racing|prediction|peer|correction|error/i.test(l));
  console.log(`--- client ${i} netplay ---\n${net.join('\n') || '(nothing -- never entered netplay)'}`);
  const interesting = c.logs.filter((l) => !/^drift @/.test(l) && !/fps/.test(l)).slice(-6);
  if (interesting.length) console.log(`--- client ${i} other ---\n${interesting.join('\n')}`);
}
sockets.forEach((c) => c.close());
procs.forEach((p) => p.kill());
// Chat: every client must have seen every other client's line. This is the
// reliable channel's end-to-end check, and for guests it also proves the
// host's chat relay, which is a separate path from the state relay.
let allChat = true;
for (let i = 0; i < PLAYERS; i++) {
  const seen = sockets[i].logs.filter((l) => /hello-from-\d/.test(l));
  for (let j = 0; j < PLAYERS; j++) {
    if (!seen.some((l) => l.includes(`hello-from-${j}`))) {
      console.log(`  MISSING CHAT: client ${i} never saw client ${j}'s line`);
      allChat = false;
    }
  }
}
console.log(allChat ? 'chat: every client saw every line' : 'chat: INCOMPLETE');

// Pairing and reachability are the assertions; drift is only reported. See the
// note above on why this machine cannot measure drift meaningfully.
const ok = drifts.every((d) => d.length > 0) && allHeard && allChat;
console.log(ok ? 'PASS — peers paired, state heard both ways, chat delivered'
               : 'FAIL');
process.exit(ok ? 0 : 1);
