// Run the game in a REAL browser and report where the long frames went, with
// the machine's CPU/thermal state sampled alongside.
//
//   node web/tools/spike.mjs [seconds] [extra query string]
//   node web/tools/spike.mjs 60 'music=0'
//
// This is the tool for "sometimes it drops to 2-4 fps", which the averages in
// ?bench= structurally cannot show: a run that is mostly fine and occasionally
// catastrophic reports a mean describing neither state.
//
// Headed on purpose. Headless Chromium uses SwiftShader, which has none of the
// real driver's behaviour around buffer uploads or vsync.
//
// It samples /proc and /sys because the symptom is reported to be intermittent
// and SOMETIMES CURED BY A REBOOT -- which no amount of frame instrumentation
// can explain, and which points at CPU frequency being stuck rather than at
// anything in the renderer. The two have to be recorded on one timeline or the
// question stays unanswerable.
//
// Needs a server on :8123 and a DISPLAY.

import { spawn } from 'node:child_process';
import { openSync, readFileSync, existsSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';
import { attach } from './cdp.mjs';

const SECONDS = parseInt(process.argv[2] || '60', 10);
const EXTRA = process.argv[3] ? '&' + process.argv[3] : '';
const PORT = 9223;
const URL = `http://localhost:8123/web/main.html?players=8&stats=1&spike=100${EXTRA}`;

// --- machine state ---------------------------------------------------------

function readNum(path) {
  try { return parseInt(readFileSync(path, 'utf8').trim(), 10); } catch { return null; }
}

/** Mean core MHz right now, plus the caps that a stuck machine would show. */
function machine() {
  const mhz = readFileSync('/proc/cpuinfo', 'utf8')
    .split('\n').filter((l) => l.startsWith('cpu MHz'))
    .map((l) => parseFloat(l.split(':')[1]));
  const avg = mhz.reduce((a, b) => a + b, 0) / Math.max(1, mhz.length);
  const temps = [];
  for (let i = 0; i < 12; i++) {
    const t = readNum(`/sys/class/thermal/thermal_zone${i}/temp`);
    if (t != null) temps.push(t / 1000);
  }
  return {
    mhz: avg,
    maxMhz: Math.max(...mhz),
    // The three knobs that latch low and stay there. scaling_max_freq is what
    // a thermal event lowers; max_perf_pct is intel_pstate's own ceiling.
    scalingMax: readNum('/sys/devices/system/cpu/cpu0/cpufreq/scaling_max_freq'),
    hwMax: readNum('/sys/devices/system/cpu/cpu0/cpufreq/cpuinfo_max_freq'),
    maxPerfPct: readNum('/sys/devices/system/cpu/intel_pstate/max_perf_pct'),
    noTurbo: readNum('/sys/devices/system/cpu/intel_pstate/no_turbo'),
    temp: temps.length ? Math.max(...temps) : null,
  };
}

// --- run -------------------------------------------------------------------

const before = machine();
console.log(`machine at start: ${before.mhz.toFixed(0)}MHz avg`
  + `  cap ${(before.scalingMax / 1000).toFixed(0)}/${(before.hwMax / 1000).toFixed(0)}MHz`
  + `  max_perf_pct=${before.maxPerfPct}  no_turbo=${before.noTurbo}`
  + `  ${before.temp}C`);
if (before.scalingMax < before.hwMax || before.maxPerfPct < 100) {
  console.log('  ^^ THE CPU IS CAPPED BELOW ITS HARDWARE MAXIMUM. This alone can');
  console.log('     account for the slow runs, and it is not a renderer problem.');
}

const browser = spawn('chromium', [
  `--remote-debugging-port=${PORT}`,
  // Fresh profile per run. A killed instance leaves its lock behind, and
  // chromium then hands the URL to the dead session ("Opening in existing
  // browser session") and never opens a debugging port -- which presents as
  // "no devtools target" and looks like a CDP bug.
  `--user-data-dir=/tmp/nfm-spike-${process.pid}`,
  '--autoplay-policy=no-user-gesture-required',
  '--window-size=900,560',
  URL,
], { stdio: ['ignore', 'ignore', openSync('/tmp/nfm-spike.err', 'w')], detached: true });
browser.unref();

const cdp = await attach(PORT, 'main.html');
const logs = [];
cdp.on((m) => {
  if (m.method === 'Runtime.consoleAPICalled') {
    logs.push(m.params.args.map((a) => a.value ?? '').join(' '));
  }
});
await cdp.send('Runtime.enable');
await cdp.send('Page.enable');

// Is the GPU actually being used? A Chromium that has fallen back to software
// rendering is slow in exactly this way, and it is invisible from inside the
// page. This is the other thing a reboot "fixes".
const gpu = await cdp.send('Runtime.evaluate', {
  expression: `(() => {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return 'NO WEBGL';
    const d = gl.getExtension('WEBGL_debug_renderer_info');
    return d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  })()`,
  returnByValue: true,
});
const renderer = gpu.result?.result?.value ?? '?';
console.log(`renderer: ${renderer}`);
if (/swiftshader|llvmpipe|software/i.test(renderer)) {
  console.log('  ^^ SOFTWARE RENDERING. Not the GPU. This is reboot-curable and');
  console.log('     has nothing to do with the port.');
}

const samples = [];
const t0 = Date.now();
while (Date.now() - t0 < SECONDS * 1000) {
  // The input listeners are not installed until the assets finish loading, so
  // a key dispatched at navigation is lost. Re-assert it every second, the
  // same reason browser2p.mjs does.
  await cdp.send('Input.dispatchKeyEvent', {
    type: 'keyDown', windowsVirtualKeyCode: 38, code: 'ArrowUp', key: 'ArrowUp',
  });
  samples.push({ t: (Date.now() - t0) / 1000, ...machine() });
  await sleep(1000);
}

cdp.close();
try { process.kill(-browser.pid); } catch { /* already gone */ }

// --- report ----------------------------------------------------------------

const spikes = logs.filter((l) => l.startsWith('SPIKE'));
const fps = logs.filter((l) => l.includes('fps'));
console.log('\n--- last frame-rate readouts ---');
console.log(fps.slice(-6).join('\n'));

console.log(`\n--- ${spikes.length} spikes over ${SECONDS}s ---`);
console.log(spikes.slice(0, 30).join('\n'));

const tot = { sim: 0, draw: 0, gl: 0, othr: 0, OUT: 0 };
for (const s of spikes) {
  for (const k of Object.keys(tot)) {
    const m = s.match(new RegExp(`${k}=(-?[\\d.]+)`));
    if (m) tot[k] += parseFloat(m[1]);
  }
}
const sum = Object.values(tot).reduce((a, b) => a + b, 0) || 1;
console.log('\nspike time by bucket (OUT = main thread was not ours):');
for (const [k, v] of Object.entries(tot)) {
  console.log(`  ${k.padEnd(5)} ${v.toFixed(0).padStart(7)}ms  ${(v / sum * 100).toFixed(1)}%`);
}

const mhz = samples.map((s) => s.mhz);
console.log(`\nCPU over the run: min ${Math.min(...mhz).toFixed(0)}MHz`
  + `  mean ${(mhz.reduce((a, b) => a + b, 0) / mhz.length).toFixed(0)}MHz`
  + `  max ${Math.max(...mhz).toFixed(0)}MHz`
  + `  peak temp ${Math.max(...samples.map((s) => s.temp ?? 0))}C`);
const capped = samples.filter((s) => s.scalingMax < s.hwMax || s.maxPerfPct < 100);
if (capped.length) {
  console.log(`  CAPPED in ${capped.length}/${samples.length} samples`
    + ` -- lowest ceiling ${(Math.min(...capped.map((s) => s.scalingMax)) / 1000).toFixed(0)}MHz`);
}
