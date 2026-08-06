// Drive two state-sync clients in separate processes through a lossy, laggy
// relay and measure how far their dead reckoning wanders.
//
// This is the whole netplay stack except PeerJS itself: two real worlds, real
// StateSync instances, real packets, real ownership -- with IPC standing in for
// the DataChannel. Since the channel it replaces is unreliable and unordered,
// this relay is too, on purpose.
//
//   node web/tools/netloop.mjs [ticks] [lossPct] [latencyTicks] [reorderPct] [humans] [mode]
//
// `mode` is `unreliable` (the default, and what the DataChannel is configured
// as) or `reliable`, which emulates a reliable/ordered channel -- what a
// transport like p2pt, built on simple-peer's defaults, would give instead. A
// lost packet is then not lost: it is retransmitted a round trip later, and
// every packet behind it on the same link waits for it (head-of-line
// blocking). Nothing else changes, so the two arms are directly comparable.
//
// WHAT IT CHECKS, and why it is not what the lockstep version checked. Under
// lockstep the assertion was bit-identical state and any difference was fatal.
// Under state sync the clients are SUPPOSED to differ between packets -- that
// is what dead reckoning is -- so the assertions are:
//
//   1. drift stays bounded. A correction is normal; a correction that grows
//      run-over-run means the prediction is wrong, not merely late.
//   2. a guest's copy of the host's bots tracks the host's own. This is the
//      property lockstep got for free and state sync has to earn, so it is the
//      one most likely to be quietly broken.
//
// Exits non-zero if drift exceeds the threshold.

import { fork } from 'node:child_process';

const TICKS = parseInt(process.argv[2] || '400', 10);
const LOSS = parseFloat(process.argv[3] || '0');
const LATENCY = parseInt(process.argv[4] || '2', 10);   // ticks each way
const REORDER = parseFloat(process.argv[5] || '0');
const HUMANS = parseInt(process.argv[6] || '2', 10);
const MODE = process.argv[7] || 'unreliable';
const RELIABLE = MODE === 'reliable';
const SEED = 20260802;
const PLAYERS = 6;      // slots 0..HUMANS-1 human; the rest bots, host-owned

// A car is ~200 units across. A correction under this is invisible; well over
// it is the rubber-band a player complains about.
const DRIFT_LIMIT = 400;

// Deterministic channel noise, so a failure can be reproduced exactly.
let rngState = 12345;
const rnd = () => {
  rngState = (Math.imul(rngState, 1103515245) + 12345) & 0x7fffffff;
  return rngState / 0x7fffffff;
};

const child = (i, interp) => fork(new URL('./netclient.mjs', import.meta.url), [
  String(i), String(SEED), String(PLAYERS), String(interp), String(TICKS),
  String(HUMANS),
]);

// Every client draws a different number of interpolated frames per tick: the
// refresh-rate asymmetry that a single shared PRNG stream would turn into a
// divergence, and which no same-process test can reproduce.
const kids = [];
for (let i = 0; i < HUMANS; i++) kids.push(child(i, i * 2));

let ready = 0, done = 0;
let clock = 0;
// Packets in flight: delivered once `clock` reaches their arrival tick.
let flight = [];
const stepped = kids.map(() => false);
const positions = kids.map(() => new Map());
const drift = kids.map(() => []);
let owned = [];

/**
 * The star: everything goes via client 0, and a guest-to-guest packet pays the
 * latency TWICE because it is two hops.
 *
 * Modelling the second hop matters -- a relay that delivered guest-to-guest in
 * one hop would understate the lag that dead reckoning has to cover, and the
 * harness would report a tracking quality no real session could reach.
 */
// Reliable mode is per-LINK, so each hop keeps its own delivery clock: the
// arrival of the last packet it delivered. Ordering is a property of the
// channel, and a guest-to-guest packet crosses two of them.
const linkAt = new Map();
const stalls = { held: 0, ticksHeld: 0, worst: 0, retransmits: 0 };

function relay(from, bytes) {
  const hop = (to, hops) => {
    const wire = clock + LATENCY * hops;
    if (!RELIABLE) {
      if (rnd() * 100 < LOSS) return;                    // dropped entirely
      // Latency, plus optional jitter that lands a packet behind a later one
      // -- which is exactly how an unordered channel misbehaves.
      let at = wire;
      if (rnd() * 100 < REORDER) at += 1 + Math.floor(rnd() * 2);
      flight.push({ to, bytes, at });
      return;
    }
    // Reliable/ordered. A drop costs a round trip on that hop to notice and
    // resend, and the resend can drop too. Nothing is ever lost, only late.
    let at = wire;
    while (rnd() * 100 < LOSS) {
      at += 2 * LATENCY * hops;                          // nack + retransmit
      stalls.retransmits++;
    }
    // Head-of-line blocking: an ordered channel cannot deliver this packet
    // before the one in front of it, however late that one is. This is the
    // whole cost of the reliable channel, and it is why reorder does not
    // apply here -- an ordered channel has no reordering to model.
    const link = `${from}->${to}`;
    const floor = linkAt.get(link) ?? -Infinity;
    const held = Math.max(0, floor - at);
    if (held > 0) {
      stalls.held++;
      stalls.ticksHeld += held;
      stalls.worst = Math.max(stalls.worst, held);
    }
    at = Math.max(at, floor);
    linkAt.set(link, at);
    flight.push({ to, bytes, at });
  };
  if (from === 0) {
    for (let i = 1; i < kids.length; i++) hop(i, 1);     // host -> every guest
  } else {
    hop(0, 1);                                           // guest -> host
    for (let i = 1; i < kids.length; i++) {              // ...relayed onward
      if (i !== from) hop(i, 2);
    }
  }
}

function deliverDue() {
  const due = flight.filter((p) => p.at <= clock);
  flight = flight.filter((p) => p.at > clock);
  for (const p of due) kids[p.to].send({ k: 'packet', b: p.bytes });
}

/** Both clients have finished tick `clock`; advance the world by one. */
function advance() {
  clock++;
  deliverDue();
  stepped.fill(false);
  // Always step, even past TICKS: a client only reports `done` when it is
  // ASKED to step and finds it has arrived. Returning here instead leaves both
  // sides idle at the target tick waiting for each other -- a deadlock, and one
  // that looks exactly like a protocol stall from the outside.
  for (const k of kids) k.send({ k: 'step' });
}

for (let i = 0; i < kids.length; i++) {
  kids[i].on('message', (m) => {
    if (m.k === 'ready') {
      if (i === 0) owned = m.owned;
      if (++ready === kids.length) for (const k of kids) k.send({ k: 'step' });
      return;
    }
    if (m.k === 'packet') { relay(i, m.b); return; }
    if (m.k === 'stepped') {
      positions[i].set(m.tick, m.pos);
      stepped[i] = true;
      if (stepped.every(Boolean)) advance();
      return;
    }
    if (m.k === 'done') {
      drift[i] = m.drift;
      if (++done === kids.length) finish();
    }
  });
}

let finished = false;
function finish() {
  if (finished) return;
  finished = true;
  kids.forEach((k) => k.kill());

  console.log(`host owns slots [${owned}] — bots included, as GameSparker.java:1348 does\n`);

  // ---- 1. drift at correction time, per client.
  let worst = 0, growth = 0;
  for (let i = 0; i < kids.length; i++) {
    const ds = drift[i].map((d) => d[2]);
    if (!ds.length) { console.log(`client ${i}: no corrections applied`); continue; }
    const mean = ds.reduce((a, b) => a + b, 0) / ds.length;
    const max = Math.max(...ds);
    worst = Math.max(worst, max);
    console.log(`client ${i}: ${ds.length} corrections, mean drift ${mean.toFixed(1)}, max ${max.toFixed(1)}`);
    // Growth check: if the second half drifts materially worse than the first,
    // the prediction is diverging rather than merely lagging.
    const half = Math.floor(ds.length / 2);
    const m1 = ds.slice(0, half).reduce((a, b) => a + b, 0) / (half || 1);
    const m2 = ds.slice(half).reduce((a, b) => a + b, 0) / (ds.length - half || 1);
    console.log(`           first half ${m1.toFixed(1)} -> second half ${m2.toFixed(1)}`);
    if (m1 > 0.5) growth = Math.max(growth, m2 / m1);   // ignore ratios off ~zero
  }

  // ---- 2. how far the guest's view of a host-owned car TRAILS the host's.
  //
  // Comparing the two clients at the same tick index is the obvious thing and
  // it is wrong: it reports (latency x speed), which at race pace is hundreds
  // of units and looks like a catastrophic desync. It is not error at all --
  // it is the pipeline delay, and the proof is that the number halves when
  // LATENCY goes to 0.
  //
  // The honest question is whether the guest's copy is the host's own state
  // SHIFTED IN TIME, or genuinely wrong. So: find the tick offset that best
  // aligns them, and report the residual at that offset. A small residual at a
  // stable offset means the reckoning is sound and the car is merely late,
  // which interpolation on the render side can hide. A residual that grows
  // whatever the offset means the prediction itself is broken.
  const common = [...positions[0].keys()]
    .filter((t) => positions.every((p) => p.has(t))).sort((a, b) => a - b);
  const samples = common.filter((t) => t > 50);
  const MAX_OFF = 10;
  // Every car, against every client that does NOT own it. The two-player
  // version only ever checked the host's cars as the guest saw them, which
  // leaves the case that appears for the first time at three players entirely
  // untested: a guest's view of ANOTHER guest, which is the only path that
  // crosses two hops and is relayed rather than sent directly.
  console.log('\neach car as its non-owners see it, best time alignment:');
  let worstResidual = 0;
  const ownerOfCar = (c) => (c < HUMANS ? c : 0);
  for (let c = 0; c < PLAYERS; c++) {
    const owner = ownerOfCar(c);
    for (let obs = 0; obs < kids.length; obs++) {
      if (obs === owner) continue;
      let best = { off: -1, resid: Infinity };
      for (let off = 0; off <= MAX_OFF; off++) {
        let sum = 0, n = 0;
        for (const t of samples) {
          const A = positions[owner].get(t - off), B = positions[obs].get(t);
          if (!A || !B) continue;
          const dx = A[c][0] - B[c][0], dy = A[c][1] - B[c][1], dz = A[c][2] - B[c][2];
          sum += Math.sqrt(dx * dx + dy * dy + dz * dz);
          n++;
        }
        if (n && sum / n < best.resid) best = { off, resid: sum / n };
      }
      const what = c < HUMANS ? `player ${c}` : `bot ${c}`;
      const hops = owner === 0 || obs === 0 ? '1 hop' : '2 hops';
      console.log(`  ${what} owned by ${owner}, seen by ${obs} (${hops}):`
        + ` trails ${best.off} ticks, residual ${best.resid.toFixed(1)} units`);
      worstResidual = Math.max(worstResidual, best.resid);
    }
  }

  console.log(`\n${HUMANS} humans + ${PLAYERS - HUMANS} bots, ticks ${TICKS}, `
    + `loss ${LOSS}%, latency ${LATENCY} ticks/hop, reorder ${REORDER}%, ${MODE}`);
  if (RELIABLE) {
    console.log(`retransmits ${stalls.retransmits}; ${stalls.held} packets held behind an `
      + `earlier one, ${stalls.ticksHeld} tick-delays total, worst stall ${stalls.worst} ticks`);
  }

  // What passes and what merely gets reported.
  //
  // The worst SINGLE correction is deliberately not a failure. Under loss a
  // long gap between packets lets the prediction wander and then snap, and at
  // 30% loss that reaches ~600 units -- but it is the price of the lost
  // packets, not a defect in the protocol, and the fix is smoothing the
  // correction on the render side rather than anything on the wire. Gating on
  // it would fail a healthy run for the wrong reason. It is reported as the
  // budget that smoothing has to hide.
  //
  // What DOES fail: steady-state tracking that is bad even after alignment
  // (the reckoning is wrong, not late), or drift that grows across the run
  // (the two worlds are separating and no packet rate will save it).
  const growing = growth > 1.5;
  const ok = worstResidual <= DRIFT_LIMIT && !growing;
  console.log(`steady-state residual ${worstResidual.toFixed(1)} units (limit ${DRIFT_LIMIT})`);
  console.log(`drift growth first->second half: x${growth.toFixed(2)} (limit x1.50)`);
  console.log(`worst single correction ${worst.toFixed(1)} units — the render-side smoothing budget`);
  console.log(ok ? 'PASS' : `FAIL — ${growing ? 'drift is growing across the run' : 'steady-state tracking is off'}`);
  process.exit(ok ? 0 : 1);
}

setTimeout(() => {
  console.error('timed out');
  process.exit(1);
}, 120000);
