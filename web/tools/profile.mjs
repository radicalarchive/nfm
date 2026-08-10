// Sample the game's JS in a REAL browser and report self time by function.
//
//   node web/tools/profile.mjs [seconds] [extra query string]
//   node web/tools/profile.mjs 20 'res=1&interp=0'
//
// `spike.mjs` says WHICH bucket a long frame went to (and the answer is
// "draw", overwhelmingly). It cannot say which part of draw, because draw is
// one stopwatch around the whole traversal. This attaches the V8 sampling
// profiler instead, so the answer is a function name.
//
// Headed, fresh profile, muted, for the same reasons spike.mjs is -- see the
// banner there. Needs a server on :8123 and a DISPLAY.
//
// `bench=0` is forced into the URL: `stats=1` otherwise freezes the game
// after its 3s window and the profile is then mostly an idle page.

import { spawn } from 'node:child_process';
import { openSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { setTimeout as sleep } from 'node:timers/promises';
import { attach } from './cdp.mjs';

const SECONDS = parseInt(process.argv[2] || '20', 10);
const EXTRA = process.argv[3] ? '&' + process.argv[3] : '';
const PORT = 9224;
// NFM_SPIKES=<ms>: also ask the page to log a SPIKE line for every frame gap
// over that threshold, and split the profile into samples that fall INSIDE
// those frames and samples that do not. Whole-window percentages describe the
// hundreds of ordinary frames and say nothing about the handful of 100-400ms
// ones -- which are the complaint.
const SPIKE_MS = process.env.NFM_SPIKES || '';
const URL = `http://localhost:8123/web/main.html?players=8&stats=1&bench=0`
  + `${SPIKE_MS ? `&spike=${SPIKE_MS}` : ''}${EXTRA}`;

// Same NFM_KEY as spike.mjs, and for the same reason: holding accelerate
// drives the player away from the pack, and the other cars are most of the
// scene. NFM_KEY=none stays on the grid.
const KEYS = {
  up: { windowsVirtualKeyCode: 38, code: 'ArrowUp', key: 'ArrowUp' },
  down: { windowsVirtualKeyCode: 40, code: 'ArrowDown', key: 'ArrowDown' },
  left: { windowsVirtualKeyCode: 37, code: 'ArrowLeft', key: 'ArrowLeft' },
  right: { windowsVirtualKeyCode: 39, code: 'ArrowRight', key: 'ArrowRight' },
  none: null,
};
const KEY = KEYS[process.env.NFM_KEY || 'up'];

const browser = spawn('chromium', [
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=/tmp/nfm-prof-${process.pid}`,
  '--autoplay-policy=no-user-gesture-required', '--mute-audio',
  '--window-size=900,560',
  URL,
], { stdio: ['ignore', 'ignore', openSync('/tmp/nfm-prof.err', 'w')], detached: true });
browser.unref();

const cdp = await attach(PORT, 'main.html');
// SPIKE lines carry `t=<rAF timestamp>s` and `gap=<ms>`, both in the page's
// performance.now() clock, which is what makes the correlation below possible.
const spikeLines = [];
cdp.on((m) => {
  if (m.method === 'Runtime.consoleAPICalled') {
    const text = m.params.args.map((a) => a.value ?? '').join(' ');
    if (text.startsWith('SPIKE')) spikeLines.push(text);
  }
});
await cdp.send('Runtime.enable');
await cdp.send('Profiler.enable');
// 200us: fine enough to resolve a 5ms draw into its parts, coarse enough that
// the profiler's own cost stays off the result.
await cdp.send('Profiler.setSamplingInterval', { interval: 200 });

// Let the assets load and the intro fly-by finish before sampling. The spikes
// live in the first ~12s, so `NFM_PROFILE_DELAY=0` aims the window at those
// instead of at steady-state racing.
await sleep(parseInt(process.env.NFM_PROFILE_DELAY ?? '3000', 10));
await cdp.send('Profiler.start');
// One (page clock, profiler clock) pair, taken as close to the start as the
// protocol allows, so samples can be placed on the page's timeline. Both are
// TimeTicks underneath; the residual is the round trip, a millisecond or two,
// against spikes of 100ms and up. The report prints a self-check.
const clockPair = (await cdp.send('Runtime.evaluate', {
  expression: 'performance.now()', returnByValue: true,
})).result?.result?.value ?? 0;
// Allocation sites alongside CPU. The heap grows ~4MB/s during a race and a
// major GC then frees 110MB in one frame, so "what is producing the garbage"
// is its own question and the CPU sampler cannot answer it -- an allocation
// is cheap where it happens and expensive somewhere else entirely.
await cdp.send('HeapProfiler.enable');
await cdp.send('HeapProfiler.startSampling', { samplingInterval: 32768 });

const t0 = Date.now();
while (Date.now() - t0 < SECONDS * 1000) {
  // Input listeners are not installed until loading finishes, and a key
  // dispatched at navigation is lost; re-assert. (Same as spike.mjs.)
  if (KEY) await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', ...KEY });
  await sleep(1000);
}

const { profile } = (await cdp.send('Profiler.stop')).result;
const heap = (await cdp.send('HeapProfiler.stopSampling')).result.profile;
cdp.close();
try { process.kill(-browser.pid); } catch { /* already gone */ }

// --- report ----------------------------------------------------------------

// Spike frames, as [start, end] on the page clock. The gap reported at a
// frame is what the PREVIOUS frame cost, so the slow work ran in [t-gap, t].
const windows = [];
for (const line of spikeLines) {
  const t = /t=([\d.]+)s/.exec(line);
  const gap = /gap=([\d.]+)ms/.exec(line);
  if (t && gap) windows.push([+t[1] * 1000 - +gap[1], +t[1] * 1000]);
}
windows.sort((a, b) => a[0] - b[0]);
const inSpike = (ms) => {
  for (const [a, b] of windows) { if (ms >= a && ms <= b) return true; if (a > ms) break; }
  return false;
};
// profile.startTime is microseconds on the same TimeTicks base as
// performance.now(); anchor it to the pair taken at Profiler.start.
const toPageMs = (us) => (us - profile.startTime) / 1000 + clockPair;

// timeDeltas[i] is the interval BEFORE samples[i], so charge it to that node.
const byId = new Map(profile.nodes.map((n) => [n.id, n]));
const self = new Map();
let total = 0;
for (let i = 0; i < profile.samples.length; i++) {
  const dt = (profile.timeDeltas[i] || 0) / 1000;   // us -> ms
  if (dt <= 0) continue;
  total += dt;
  const n = byId.get(profile.samples[i]);
  if (!n) continue;
  const f = n.callFrame;
  const file = (f.url || '').split('/').pop().split('?')[0];
  const key = `${f.functionName || '(anonymous)'}  ${file}:${f.lineNumber + 1}`;
  self.set(key, (self.get(key) || 0) + dt);
}

// Split the same samples by whether they landed in a spike frame.
const spikeSelf = new Map();
let spikeTotal = 0, tCur = profile.startTime;
for (let i = 0; i < profile.samples.length; i++) {
  const dt = (profile.timeDeltas[i] || 0);
  tCur += dt;
  if (dt <= 0 || !windows.length || !inSpike(toPageMs(tCur))) continue;
  const n = byId.get(profile.samples[i]);
  if (!n) continue;
  const f = n.callFrame;
  const file = (f.url || '').split('/').pop().split('?')[0];
  const key = `${f.functionName || '(anonymous)'}  ${file}:${f.lineNumber + 1}`;
  spikeSelf.set(key, (spikeSelf.get(key) || 0) + dt / 1000);
  spikeTotal += dt / 1000;
}
if (windows.length) {
  const budget = windows.reduce((a, [x, y]) => a + (y - x), 0);
  console.log(`\n--- ${windows.length} spike frames, ${budget.toFixed(0)}ms of gap;`
    + ` ${spikeTotal.toFixed(0)}ms of samples landed inside them ---`);
  // If those two disagree wildly the clock anchoring is wrong and the split
  // below is describing the wrong frames. They should be within ~20%.
  if (spikeTotal < budget * 0.4 || spikeTotal > budget * 1.6) {
    console.log('  ^^ SAMPLED TIME DOES NOT MATCH THE GAP BUDGET. The two clocks are');
    console.log('     not aligned; do not trust the attribution below.');
  }
  for (const [k, v] of [...spikeSelf.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
    console.log(`  ${(v / spikeTotal * 100).toFixed(1).padStart(5)}%  ${v.toFixed(0).padStart(6)}ms  ${k}`);
  }
}

const rows = [...self.entries()].sort((a, b) => b[1] - a[1]);
console.log(`\n--- self time over ${(total / 1000).toFixed(1)}s of samples ---`);
for (const [k, v] of rows.slice(0, 30)) {
  console.log(`  ${(v / total * 100).toFixed(1).padStart(5)}%  ${(v).toFixed(0).padStart(6)}ms  ${k}`);
}

// Roll up by file too: "graphics.js is 60% of the frame" is the decision this
// is for, and it survives inlining and anonymous callbacks better than any
// single function name does.
const byFile = new Map();
for (const [k, v] of self) {
  const file = k.split('  ')[1].split(':')[0] || '(none)';
  byFile.set(file, (byFile.get(file) || 0) + v);
}
console.log('\n--- self time by file ---');
for (const [k, v] of [...byFile.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
  console.log(`  ${(v / total * 100).toFixed(1).padStart(5)}%  ${(v).toFixed(0).padStart(6)}ms  ${k}`);
}

// --- allocation sites ------------------------------------------------------
// The sampling heap profiler is a tree of call frames with selfSize on each.
// Flatten it the same way the CPU profile is flattened: bytes charged to the
// frame that allocated them, not to its callers.
const alloc = new Map();
let allocTotal = 0;
const name = (f) => `${f.functionName || '(anon)'}@${(f.url || '').split('/').pop().split('?')[0]}:${f.lineNumber + 1}`;
// Keyed by the allocating frame AND its two callers. `new Plane` is most of
// the garbage here and the constructor is not the interesting part -- which
// code is building Planes every frame is.
(function walk(node, stack) {
  const here = [...stack, name(node.callFrame)];
  if (node.selfSize > 0) {
    alloc.set(here.slice(-3).reverse().join(' <- '),
      (alloc.get(here.slice(-3).reverse().join(' <- ')) || 0) + node.selfSize);
    allocTotal += node.selfSize;
  }
  for (const c of node.children || []) walk(c, here);
})(heap.head, []);

console.log(`\n--- allocated over the window: ${(allocTotal / 1048576).toFixed(0)}MB ---`);
for (const [k, v] of [...alloc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20)) {
  console.log(`  ${(v / allocTotal * 100).toFixed(1).padStart(5)}%  ${(v / 1048576).toFixed(1).padStart(7)}MB  ${k}`);
}

// --- line-level attribution ------------------------------------------------
// V8 fills in positionTicks per profile node, which is the only way to see
// INSIDE one hot function. `Plane.d` is 25% of a frame in a 600-line method,
// and stubbing blocks one at a time to find out which part costs is eight
// browser runs against this one.
//
//   NFM_LINES=Plane.js:191   (file:firstLineOfTheFunction, 1-based)
const want = process.env.NFM_LINES;
if (want) {
  const [wf, wl] = want.split(':');
  const lines = new Map();
  let hit = 0;
  for (const n of profile.nodes) {
    const f = n.callFrame;
    const file = (f.url || '').split('/').pop().split('?')[0];
    if (file !== wf || (wl && f.lineNumber + 1 !== +wl)) continue;
    for (const t of n.positionTicks || []) {
      lines.set(t.line, (lines.get(t.line) || 0) + t.ticks);
      hit += t.ticks;
    }
  }
  console.log(`\n--- ticks by line in ${want} (${hit} ticks) ---`);
  // `URL` is the page URL constant at the top of this file, so build the
  // path rather than reaching for the global.
  const src = readFileSync(fileURLToPath(import.meta.url).replace(/tools\/profile\.mjs$/, wf), 'utf8').split('\n');
  for (const [ln, t] of [...lines.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25)) {
    console.log(`  ${(t / hit * 100).toFixed(1).padStart(5)}%  ${String(ln).padStart(4)}  ${(src[ln - 1] || '').trim().slice(0, 90)}`);
  }
}
