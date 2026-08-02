// Drive two netplay clients in separate processes through a lossy relay and
// check they stay in sync.
//
// This is the whole netplay stack except PeerJS itself: two real worlds, real
// InputSync instances, real packets, real lockstep gating -- with IPC standing
// in for the DataChannel. Since the channel it replaces is unreliable and
// unordered, this relay is too, on purpose.
//
//   node web/tools/netloop.mjs [ticks] [lossPercent] [reorderPercent]
//
// Exits non-zero on a desync or a stall, so it can be used as a check.

import { fork } from 'node:child_process';

const TICKS = parseInt(process.argv[2] || '400', 10);
const LOSS = parseFloat(process.argv[3] || '0');
const REORDER = parseFloat(process.argv[4] || '0');
const SEED = 20260802;
const DELAY = 3;
const PLAYERS = 4;

// Deterministic channel noise, so a failure can be reproduced exactly.
let rngState = 12345;
const rnd = () => {
  rngState = (Math.imul(rngState, 1103515245) + 12345) & 0x7fffffff;
  return rngState / 0x7fffffff;
};

const child = (i, interp) => fork(new URL('./netclient.mjs', import.meta.url), [
  String(i), String(SEED), String(DELAY), String(PLAYERS), String(interp), String(TICKS),
]);

// Client 0 draws once per tick, client 1 draws four times: the refresh-rate
// asymmetry that a single PRNG stream turns into a desync.
const kids = [child(0, 0), child(1, 3)];
const hashes = [new Map(), new Map()];
let ready = 0, done = 0, failures = 0;
const held = [];

function deliver(from, bytes) {
  const to = kids[1 - from];
  if (rnd() * 100 < LOSS) return;                     // dropped
  if (rnd() * 100 < REORDER) {                        // delayed behind the next
    held.push({ to, bytes });
    return;
  }
  to.send({ k: 'packet', b: bytes });
  while (held.length) {
    const h = held.shift();
    h.to.send({ k: 'packet', b: h.bytes });
  }
  // Delivering input is what unblocks a stalled peer, so wake it. Without this
  // both clients sit waiting for a packet that already arrived.
  to.send({ k: 'run' });
}

function compare(i, tick, h) {
  hashes[i].set(tick, h);
  const other = hashes[1 - i].get(tick);
  if (other === undefined) return;
  if (other !== h) {
    console.error(`DESYNC at tick ${tick}: ${h.toString(16)} vs ${other.toString(16)}`);
    failures++;
    finish();
  }
}

let stallStreak = 0;
const tallies = [];
let fieldReported = false;
const dumps = [new Map(), new Map()];
for (let i = 0; i < 2; i++) {
  kids[i].on('message', (m) => {
    if (m.k === 'ready') {
      if (++ready === 2) kids.forEach((k) => k.send({ k: 'run' }));
      return;
    }
    if (m.k === 'packet') { deliver(i, m.b); stallStreak = 0; return; }
    if (m.k === 'hash') {
      dumps[i].set(m.tick, m.cars);
      // Report the first FIELD that differs, not just the first hash that
      // does. rpdcatch is excluded: it is the record-ghost countdown, which is
      // local to each client by design and cannot be made symmetric.
      const A = dumps[0].get(m.tick), B = dumps[1].get(m.tick);
      if (A && B && !fieldReported) {
        for (let c = 0; c < A.length; c++) {
          if (A[c] === B[c]) continue;
          const fa = A[c].split(','), fb = B[c].split(',');
          for (let k = 0; k < fa.length; k += 2) {
            if (fa[k + 1] !== fb[k + 1] && fa[k] !== 'rpdcatch') {
              console.log(`FIRST FIELD DIFF t${m.tick} car${c}.${fa[k]}: ${fa[k + 1]} vs ${fb[k + 1]}`);
              fieldReported = true;
            }
          }
        }
      }
      compare(i, m.tick, m.h);
      return;
    }
    if (m.k === 'stalled') {
      // Both sides waiting with nothing in flight means the redundancy window
      // could not cover the loss -- a real failure of the protocol, not noise.
      if (++stallStreak > 200) {
        console.error(`STALLED at tick ${m.tick}, waiting on ${m.missing}`);
        failures++;
        finish();
      }
      return;
    }
    if (m.k === 'done') {
      if (++done === 2) finish();
    }
  });
}

let finished = false;
function finish() {
  if (finished) return;
  finished = true;
  kids.forEach((k) => k.kill());
  const common = [...hashes[0].keys()].filter((t) => hashes[1].has(t));
  const agreed = common.filter((t) => hashes[0].get(t) === hashes[1].get(t)).length;
  console.log(`${agreed}/${common.length} checkpoints agreed over ${TICKS} ticks ` +
              `(loss ${LOSS}%, reorder ${REORDER}%)`);
  process.exit(failures || (common.length === 0 ? 1 : 0));
}

setTimeout(() => {
  console.error('timed out');
  failures++;
  finish();
}, 120000);
