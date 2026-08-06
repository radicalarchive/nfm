// One netplay client, in its own process, driven over IPC instead of WebRTC.
//
// Separate processes are not a convenience here, they are the whole point: the
// PRNG and the draw-phase flag are module state, so two worlds inside one node
// process share a stream that two browser tabs never would, and a test built
// that way proves nothing about two machines.
//
// The parent (netloop.mjs) relays packets between two of these with latency and
// loss, and measures how far each client's dead reckoning wanders from the
// authoritative state. Everything below the IPC seam -- StateSync, ownership,
// the fold, the order of receive/send/tick -- is the same code main.js runs.

import { readFileSync } from 'node:fs';
import { parseZip } from '../vfs.js';
import { Graphics2D } from '../graphics.js';
import { Medium } from '../Medium.js';
import { Trackers } from '../Trackers.js';
import { CheckPoints } from '../CheckPoints.js';
import { Control } from '../Control.js';
import { Record } from '../Record.js';
import { CarDefine } from '../CarDefine.js';
import { Mad } from '../Mad.js';
import { GameSparker } from '../GameSparker.js';
import { XtGraphics } from '../XtGraphics.js';
import { objArray, setSeed } from '../java.js';
import { captureCar, applyCar, encodePacket, decodePacket } from '../netcodec.js';
import { StateSync, driftOf } from '../netsession.js';

const R = new URL('../../', import.meta.url);
const readRepo = (p, enc) => readFileSync(new URL(p, R), enc);

const localIndex = parseInt(process.argv[2], 10);
const seed = parseInt(process.argv[3], 10);
const players = parseInt(process.argv[4], 10);
const humanCount = parseInt(process.argv[7], 10);
const humanSlots = [];
for (let i = 0; i < humanCount; i++) humanSlots.push(i);
// How many interpolated frames this client draws per tick -- the asymmetry a
// shared PRNG stream would turn into a divergence.
const interp = parseInt(process.argv[5], 10);
const TARGET = parseInt(process.argv[6], 10);

setSeed(seed);
const zip = await parseZip(new Uint8Array(readRepo('data/models.zip')));
const rd = new Graphics2D(null, null, 800, 450);
const medium = new Medium();
const trackers = new Trackers();
const checkPoints = new CheckPoints();
const array = objArray(124);
const gs = new GameSparker();
const cd = new CarDefine(array, medium, trackers, gs);
const xt = new XtGraphics(medium, cd, rd, gs);
const record = new Record(medium);
gs.loadbase(array, medium, trackers, zip);

const array2 = objArray(610);
const array3 = objArray(8);
for (let i = 0; i < 8; ++i) {
  array3[i] = new Mad(cd, medium, record, xt, i);
  gs.u[i] = new Control(medium);
}
xt.nplayers = players;
// A fixed grid, as the host would send it: never re-drawn per client.
for (let i = 0; i < 8; ++i) xt.sc[i] = [5, 2, 7, 1, 9, 3, 11, 5][i];
checkPoints.stage = 1;
gs.loadstage(array2, array, medium, trackers, checkPoints, xt, array3, record,
             readRepo('stages/1.txt', 'latin1'));
xt.starcnt = 0;                       // skip the intro; this is about sync
medium.trk = 0; medium.iw = 0; medium.ih = 0; medium.w = 800; medium.h = 450;

xt.im = localIndex;
xt.humans = new Set(humanSlots);
for (const slot of humanSlots) if (slot !== localIndex) gs.u[slot].human = true;

const sync = new StateSync(localIndex, humanSlots, players);
// A guest must not run the AI for the host's bots: it dead-reckons them from
// the host's packets instead. This is the flag GameSparker.simulate() gates on.
for (let i = 0; i < 8; ++i) gs.u[i].remote = sync.isRemote(i);

const pad = gs.u[localIndex];
let netTick = 0;
const inbox = [];

// Drift, sampled at every correction. This is the harness's real output: under
// state sync the two clients are EXPECTED to differ between packets, so the
// question is never "do they agree" but "by how much, and does it stay
// bounded". A run whose drift grows without limit is a broken dead reckoning
// even if no single packet was lost.
const driftSamples = [];

/**
 * A scripted input, different per client, deterministic from the tick.
 *
 * The per-client offsets matter: identical inputs would drive identical cars,
 * and two cars in the same state never collide (colide() picks a dominant car
 * by |power * speed * moment| and neither dominates on an exact tie), so the
 * collision paths would go untested while every assertion still passed.
 */
function drive(t) {
  const k = localIndex + 1;
  pad.up = true;
  pad.left = (t % (37 + k * 3)) < 10 + k;
  pad.right = (t % (29 + k * 5)) < 8 + k;
  pad.handb = (t % (97 + k)) === 0;
  pad.steer = Math.sin((t + k * 11) / (9 + k));
}

/**
 * Every car's position, for the parent to compare across processes.
 *
 * Position only, deliberately. The wide field-by-field vector the lockstep
 * harness dumped existed to find the first field that DIVERGED, which was the
 * right question when divergence was fatal. Here divergence is the normal
 * operating state and only its magnitude means anything, so the comparison is
 * in game units and covers the cars a player can actually see going wrong.
 */
function positions() {
  const out = [];
  for (let i = 0; i < players; i++) {
    const o = array2[i];
    out.push([o.x | 0, o.y | 0, o.z | 0, o.xz | 0]);
  }
  return out;
}

process.on('message', (m) => {
  if (m.k === 'packet') {
    const msg = decodePacket(Uint8Array.from(m.b));
    if (msg) inbox.push(msg);
    return;
  }
  if (m.k === 'step') { step(); return; }
});

function step() {
  if (netTick >= TARGET) {
    process.send({ k: 'done', tick: netTick, drift: driftSamples });
    return;
  }

  // ---- receive: fold authoritative state in before the tick runs.
  while (inbox.length) {
    const msg = inbox.shift();
    for (const rec of msg.cars) {
      if (!sync.accepts(rec.slot, msg.tick)) continue;
      const d = driftOf(rec, array2[rec.slot]);
      applyCar(rec, { mad: array3[rec.slot], contO: array2[rec.slot], control: gs.u[rec.slot] });
      sync.markApplied(rec.slot, msg.tick, d);
      // Ignore the first few ticks: the cars start stacked on the grid and a
      // correction there measures the handshake, not the reckoning.
      if (netTick > 10) driftSamples.push([rec.slot, netTick, d]);
    }
  }

  // ---- local input, then publish every car we own.
  drive(netTick);
  const records = sync.owned.map((slot) => captureCar(slot, {
    mad: array3[slot], contO: array2[slot], control: gs.u[slot],
    holdit: xt.holdit,
    pos: checkPoints.pos[slot], magperc: checkPoints.magperc[slot],
  }));
  process.send({ k: 'packet', b: Array.from(encodePacket(netTick, records)) });

  rd.begin();
  gs.tick(rd, medium, trackers, checkPoints, xt, record, array2, array3);
  for (let f = 0; f < interp; f++) {
    medium.interpolating = true;
    rd.begin(true);
    gs.draw(rd, medium, xt, array2, array3);
    medium.interpolating = false;
  }
  netTick++;
  process.send({ k: 'stepped', tick: netTick, pos: positions() });
}

process.send({ k: 'ready', owned: sync.owned });
