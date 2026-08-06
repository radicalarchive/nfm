// Drive two real browsers through the LAUNCHER's multiplayer path: host a
// game, find it in the public game list, join it, chat both ways, and start
// the race from the lobby.
//
// This is the only test of the launcher's netplay wiring, and it is
// deliberately different from browsern.mjs, which drives `main.html?net=host`
// -- the URL path. Everything below only exists in the launcher: the
// directory (netdirectory.js), the lobby screen, and the hand-off of a LIVE
// connection into boot(), which is the whole reason the launcher and the race
// share one page.
//
// It talks to public WebTorrent trackers, so it needs the network and it is
// slower and flakier than anything else here. A failure at "guest never saw
// the game listed" is a tracker problem far more often than a code problem;
// the join-by-code fallback is checked separately for exactly that reason.
//
//   node web/tools/browserlobby.mjs [seconds-of-race]
//
// Needs a server on :8123 serving the repo root.

import { spawn } from 'node:child_process';
import { openSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { attach } from './cdp.mjs';

const RACE_SECONDS = parseInt(process.argv[2] || '20', 10);
// Ports per RUN. A killed chromium leaves its profile lock behind and the next
// launch on the same port hands its URL to the dead session, which presents as
// a CDP timeout and sends you debugging flags instead of processes.
const BASE_PORT = 9410 + (process.pid % 50);

// The renderer is turned down as far as it goes: two headless browsers share
// one CPU with no GPU, and a starved client sends its state too slowly, which
// looks like a protocol fault and is not one. See browsern.mjs.
const LIGHT = 'res=1&interp=0&overlay=0&draw=0';

function launch(port) {
  return spawn('chromium', [
    '--headless=new', '--no-sandbox', '--enable-unsafe-swiftshader',
    '--autoplay-policy=no-user-gesture-required', '--mute-audio',
    '--window-size=1000,700', `--remote-debugging-port=${port}`,
    `--user-data-dir=/tmp/nfm-lobby-${port}-${process.pid}`, 'about:blank',
  ], { stdio: ['ignore', 'ignore', openSync(`/tmp/nfm-lobby-${port}.err`, 'w')] });
}

const say = (m) => console.log(m);
let failures = 0;
function check(ok, what) {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${what}`);
  if (!ok) failures++;
  return ok;
}

/** Press a key in the page. The launcher listens on window for e.key. */
const key = (c, k) =>
  c.evaluate(`dispatchEvent(new KeyboardEvent('keydown',{key:${JSON.stringify(k)},bubbles:true}))`);

/** Poll until `expr` is truthy, or give up. Returns the final value. */
async function until(c, expr, ms, label) {
  const deadline = Date.now() + ms;
  for (;;) {
    const v = await c.evaluate(expr);
    if (v) return v;
    if (Date.now() > deadline) {
      say(`    (timed out waiting for ${label || expr})`);
      return v;
    }
    await sleep(500);
  }
}

const procs = [], sockets = [];
for (let i = 0; i < 2; i++) {
  const port = BASE_PORT + i;
  procs.push(launch(port));
  const c = await attach(port, '');
  c.logs = c.collectConsole();
  await c.send('Runtime.enable');
  await c.send('Page.enable');
  sockets.push(c);
}
const [host, guest] = sockets;

// Names are seeded through localStorage rather than typed: the inline editor
// is a launcher feature of its own and is not what this test is about, and a
// player with no name is refused a room on purpose.
for (const [c, name] of [[host, 'HostHarry'], [guest, 'GuestGwen']]) {
  await c.send('Page.navigate', { url: `http://localhost:8123/index.html?${LIGHT}` });
  await sleep(1500);
  await c.evaluate(`localStorage.setItem('nfm.launcher', JSON.stringify(
    { name: ${JSON.stringify(name)}, stage: 1, players: 4, res: 1, interp: false }))`);
  await c.send('Page.reload');
}
say('booting both launchers…');
for (const c of sockets) await until(c, `document.getElementById('brandsub').textContent !== 'loading…'`, 40000, 'assets');

/** Fire the row with this data-act, whatever position it is in. */
const fireRow = (c, act) => c.evaluate(`(() => {
  const el = [...document.querySelectorAll('.item')].find(e => e.dataset.act === ${JSON.stringify(act)});
  if (!el) return false;
  el.click();
  return true;
})()`);

// ---- host opens a room ----------------------------------------------------
say('\nhost: menu -> multiplayer -> host a game');
await key(host, 'ArrowDown');            // Multiplayer
await key(host, 'Enter');
await sleep(1000);
check(await host.evaluate(`document.body.dataset.page`) === 'mp', 'keyboard reached the multiplayer screen');
// Keyboard navigation, asserted directly rather than relied on to land on a
// particular row: the row ORDER changes as games appear in the list, so a test
// that counted ArrowDowns would break for a reason that is not a bug.
await key(host, 'ArrowDown');
const moved = await host.evaluate(
  `[...document.querySelectorAll('#page-mp .item')].findIndex(e => e.classList.contains('is-sel'))`);
check(moved === 1, `ArrowDown moves the selection (row ${moved})`);
check(await fireRow(host, 'host'), 'found the Host a game row');
const code = await until(host, `document.getElementById('lobby-code').textContent`, 40000, 'a room code');
check(!!code, `host opened room ${code || '(none)'}`);
check(await host.evaluate(`document.body.dataset.page`) === 'lobby', 'host is on the lobby screen');

// ---- guest finds it in the public list ------------------------------------
say('\nguest: menu -> multiplayer, then look for the game in the list');
await key(guest, 'ArrowDown');
await key(guest, 'Enter');
// The directory is the point of this step: the guest must SEE the host's game
// without being told the code.
const listed = await until(guest,
  `!!document.querySelector('[data-act^="join:"]')`, 90000, 'the game to be listed');
check(!!listed, 'guest saw the host\'s game in the public list');

if (listed) {
  await guest.evaluate(`document.querySelector('[data-act^="join:"]').click()`);
} else {
  // Fall back to the code so the rest of the test still means something: a
  // tracker that is slow to gossip must not be reported as a lobby fault.
  say('    falling back to join-by-code');
  await guest.evaluate(`(() => {
    const el = [...document.querySelectorAll('.item')].find(e => e.dataset.act === 'joincode');
    el.click();
    const i = document.querySelector('.editbox');
    i.value = ${JSON.stringify(code)};
    i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  })()`);
}

// Patience here is not politeness: joining a room means a SECOND tracker
// rendezvous, on the room's own identifier, and the trackers gossip on their
// own schedule. Two minutes is generous rather than typical -- most joins are
// a few seconds -- but a slow tracker must not read as a broken lobby.
const joined = await until(guest, `document.body.dataset.page === 'lobby'`, 120000, 'the guest to reach the lobby');
check(!!joined, 'guest reached the lobby');

// ---- both see the room ----------------------------------------------------
const roster = (c) => c.evaluate(
  `[...document.querySelectorAll('#plist .pn')].map(e => e.textContent.trim()).join(' | ')`);
await until(host, `document.querySelectorAll('#plist .prow').length >= 2`, 60000, 'two players on the host');
await until(guest, `document.querySelectorAll('#plist .prow').length >= 2`, 60000, 'two players on the guest');
const hr = await roster(host), gr = await roster(guest);
say(`\n  host sees:  ${hr}`);
say(`  guest sees: ${gr}`);
check(/HostHarry/.test(hr) && /GuestGwen/.test(hr), 'host roster has both players');
check(/HostHarry/.test(gr) && /GuestGwen/.test(gr), 'guest roster has both players');

// ---- chat, both directions -------------------------------------------------
say('\nchat both ways');
const chat = async (c, text) => {
  await c.evaluate(`(() => {
    const el = [...document.querySelectorAll('.item')].find(e => e.dataset.act === 'chat');
    el.click();
    const i = document.querySelector('.editbox');
    i.value = ${JSON.stringify(text)};
    i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  })()`);
  await sleep(1200);
};
await chat(host, 'from-the-host');
await chat(guest, 'from-the-guest');
await sleep(1500);
const log = (c) => c.evaluate(`document.getElementById('chatlog').textContent`);
const hl = await log(host), gl = await log(guest);
check(hl.includes('from-the-guest'), 'host received the guest\'s line');
check(gl.includes('from-the-host'), 'guest received the host\'s line');

// ---- start the race from the lobby ----------------------------------------
say('\nhost starts the race');
await host.evaluate(`(() => {
  const el = [...document.querySelectorAll('.item')].find(e => e.dataset.act === 'start');
  el.click();
})()`);
for (const c of sockets) await until(c, `document.body.dataset.page === 'race'`, 30000, 'the race screen');
check(await host.evaluate(`document.body.dataset.page`) === 'race', 'host is racing');
check(await guest.evaluate(`document.body.dataset.page`) === 'race', 'guest is racing');

// Drive both cars so there is motion to disagree about, and let state flow.
for (let s = 0; s < RACE_SECONDS; s++) {
  await sleep(1000);
  for (const c of sockets) {
    await c.evaluate(`dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));`
      + `dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));`
      + `dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));`);
  }
}

// The positive signal: each client has APPLIED corrections for the other's
// car. A checker that only looks for errors passes when it examined nothing.
const drifts = sockets.map((c) => c.logs
  .map((l) => /^drift @\d+: ([\d.]+) units slots=(\S*)/.exec(l)).filter(Boolean));
// Gate on the SLOTS heard, not on the number of reports. The drift line is
// printed every few seconds whether or not anything arrived, so a count above
// zero proves only that the race is running -- an earlier version of this
// check passed while both clients heard nothing at all, which is how a
// stringified state packet went unnoticed.
for (const [i, ms] of drifts.entries()) {
  const who = i === 0 ? 'host ' : 'guest';
  const slots = new Set();
  for (const m of ms) for (const s of m[2].split(',')) if (s !== '') slots.add(+s);
  say(`  ${who}: ${ms.length} drift reports, heard slots [${[...slots].sort()}]`);
  check(slots.size > 0, `${who} applied state for another player's car`);
}

for (const [i, c] of sockets.entries()) {
  const net = c.logs.filter((l) => /room|join|racing|error|fail/i.test(l)).slice(-6);
  if (net.length) say(`--- client ${i} ---\n${net.join('\n')}`);
}

sockets.forEach((c) => c.close());
procs.forEach((p) => p.kill());
say(failures ? `\nFAIL — ${failures} check(s) failed` : '\nPASS — hosted, listed, joined, chatted and raced');
process.exit(failures ? 1 : 0);
