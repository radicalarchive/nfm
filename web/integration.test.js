// End-to-end: build the world exactly as main.js does, then run the race tick.
//
// This is the test that would have caught any of the transpiled classes being
// individually plausible but collectively broken. It exercises loadbase ->
// ContO's .rad parser -> loadstage -> Medium's procedural terrain ->
// Trackers' spatial index -> the fase==0 tick -> Mad.drive/colide -> the
// Graphics2D batcher, with no mocks anywhere except the GL context itself.
//
// Expected counts are read off stages/1.txt directly (see the comments), not
// copied from a previous run of this code.
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { parseZip } from './vfs.js';
import { Graphics2D } from './graphics.js';
import { Medium } from './Medium.js';
import { Trackers } from './Trackers.js';
import { CheckPoints } from './CheckPoints.js';
import { Control } from './Control.js';
import { Record } from './Record.js';
import { CarDefine } from './CarDefine.js';
import { Mad } from './Mad.js';
import { GameSparker } from './GameSparker.js';
import { XtGraphics } from './XtGraphics.js';
import { objArray, setSeed, setPooling } from './java.js';

const R = new URL('../', import.meta.url);
const readRepo = (p, enc) => readFileSync(new URL(p, R), enc);

async function buildWorld({ stage = 1, car = 1, players = 7, seed = 12345 } = {}) {
  setSeed(seed);
  const zip = await parseZip(new Uint8Array(readRepo('data/models.zip')));
  const rd = new Graphics2D(null, null, 800, 450);
  const medium = new Medium();
  const trackers = new Trackers();
  const checkPoints = new CheckPoints();
  const array = objArray(124);
  const gs = new GameSparker();
  const carDefine = new CarDefine(array, medium, trackers, gs);
  const xt = new XtGraphics(medium, carDefine, rd, gs);
  const record = new Record(medium);

  gs.loadbase(array, medium, trackers, zip);

  const array2 = objArray(610);
  const array3 = objArray(8);
  for (let i = 0; i < 8; ++i) {
    array3[i] = new Mad(carDefine, medium, record, xt, i);
    gs.u[i] = new Control(medium);
  }
  xt.nplayers = players;
  for (let i = 0; i < 8; ++i) xt.sc[i] = car;
  checkPoints.stage = stage;

  gs.loadstage(array2, array, medium, trackers, checkPoints, xt, array3, record,
               readRepo(`stages/${stage}.txt`, 'latin1'));

  medium.trk = 0; medium.iw = 0; medium.ih = 0; medium.w = 800; medium.h = 450;
  return { rd, medium, trackers, checkPoints, gs, xt, record, array, array2, array3 };
}

test('loadbase builds every model in models.zip', async () => {
  const w = await buildWorld();
  // mload stays 1 only if the summed uncompressed size hits Java's own
  // 615671 checksum, so this covers the whole decode + parse path.
  assert.equal(w.gs.mload, 1, 'models.zip size checksum failed');
  assert.equal(w.array.filter(Boolean).length, 84, 'expected 84 base models');
});

test('loadstage parses stage 1 to the counts in the file', async () => {
  const w = await buildWorld();
  assert.notEqual(w.checkPoints.stage, -3, 'stage failed to load');
  assert.equal(w.checkPoints.name, 'The Introductory Stage');
  // stages/1.txt: 2 `chk(` lines, `nlaps(4)`.
  assert.equal(w.checkPoints.nsp, 2);
  assert.equal(w.checkPoints.nlaps, 4);
  // 7 players + 47 set + 2 chk + 1 fix + 75 boundary rails.
  assert.equal(w.gs.nob, 132);
  assert.ok(w.trackers.nt > 0, 'no collision trackers registered');
  assert.ok(w.medium.nmt > 0, 'no mountains generated');
});

test('the race tick runs without throwing and emits geometry', async () => {
  const w = await buildWorld();
  w.gs.u[0].up = true;
  let minVerts = Infinity;
  for (let t = 0; t < 60; t++) {
    w.rd.begin();
    w.gs.tick(w.rd, w.medium, w.trackers, w.checkPoints, w.xt, w.record, w.array2, w.array3);
    minVerts = Math.min(minVerts, w.rd.vertexCount);
    assert.ok(Number.isFinite(w.array2[0].x), `tick ${t}: car x went non-finite`);
    assert.ok(Number.isFinite(w.array3[0].speed), `tick ${t}: speed went non-finite`);
  }
  // A frame that draws nothing means the world built but the camera or the
  // projection is wrong -- the failure mode a "it didn't throw" test misses.
  assert.ok(minVerts > 1000, `only ${minVerts} vertices in the thinnest frame`);
});

test('holding throttle actually accelerates the car', async () => {
  const w = await buildWorld();
  const z0 = w.array2[0].z;
  w.gs.u[0].up = true;
  for (let t = 0; t < 60; t++) {
    w.rd.begin();
    w.gs.tick(w.rd, w.medium, w.trackers, w.checkPoints, w.xt, w.record, w.array2, w.array3);
  }
  assert.ok(w.array3[0].speed > 10, `speed only reached ${w.array3[0].speed}`);
  assert.notEqual(w.array2[0].z, z0, 'car never moved');
});

test('the run is deterministic for a fixed seed', async () => {
  // If this fails, something reached for unseeded Math.random() and the
  // differential tests downstream cannot be trusted.
  const run = async () => {
    const w = await buildWorld({ seed: 999 });
    w.gs.u[0].up = true;
    for (let t = 0; t < 30; t++) {
      w.rd.begin();
      w.gs.tick(w.rd, w.medium, w.trackers, w.checkPoints, w.xt, w.record, w.array2, w.array3);
    }
    return [w.array2[0].x, w.array2[0].y, w.array2[0].z, w.medium.xz];
  };
  assert.deepEqual(await run(), await run());
});

test('array pooling is output-identical to fresh allocation', async () => {
  // Pooling is a deliberate deviation from the Java's allocate-per-frame, so
  // it is only acceptable if it is invisible. Plane.d()'s scratch arrays are
  // fully overwritten before any read, which is what makes reuse safe -- this
  // guards that assumption.
  const shot = async (pool) => {
    setPooling(pool);
    const w = await buildWorld({ seed: 4242 });
    w.gs.u[0].up = true;
    w.gs.u[0].right = true;
    let sig = 0;
    for (let t = 0; t < 60; t++) {
      w.rd.begin();
      w.gs.tick(w.rd, w.medium, w.trackers, w.checkPoints, w.xt, w.record, w.array2, w.array3);
      // Sample the position words; the checksum only has to be stable across
      // the two runs being compared, not meaningful on its own.
      for (let i = 0; i < w.rd.count * 3 && i < 4000; i += 137) sig = (sig + w.rd.f32[i] * 7) | 0;
    }
    setPooling(false);
    return [sig, w.rd.vertexCount, w.array2[0].x, w.array2[0].z, Math.fround(w.array3[0].speed)];
  };
  // Sequential, NOT Promise.all: setPooling is module-global state, so
  // concurrent runs would clobber each other's flag.
  const off = await shot(false);
  const on = await shot(true);
  assert.deepEqual(on, off, 'pooling changed the rendered output or the physics');
});

test('stat() executes for 60 ticks without throwing and emits HUD geometry', async () => {
  const wWithHud = await buildWorld({ seed: 5555 });
  wWithHud.gs.u[0].up = true;
  let hudVerts = 0;
  for (let t = 0; t < 60; t++) {
    wWithHud.rd.begin();
    wWithHud.gs.tick(wWithHud.rd, wWithHud.medium, wWithHud.trackers, wWithHud.checkPoints, wWithHud.xt, wWithHud.record, wWithHud.array2, wWithHud.array3);
    hudVerts += wWithHud.rd.vertexCount;
  }

  const wNoHud = await buildWorld({ seed: 5555 });
  wNoHud.gs.u[0].up = true;
  wNoHud.xt.stat = () => {};
  let noHudVerts = 0;
  for (let t = 0; t < 60; t++) {
    wNoHud.rd.begin();
    wNoHud.gs.tick(wNoHud.rd, wNoHud.medium, wNoHud.trackers, wNoHud.checkPoints, wNoHud.xt, wNoHud.record, wNoHud.array2, wNoHud.array3);
    noHudVerts += wNoHud.rd.vertexCount;
  }

  assert.ok(hudVerts > noHudVerts, `Expected HUD to emit extra vertices (hud: ${hudVerts}, noHud: ${noHudVerts})`);
});


test('a moving car transfers momentum to a parked one', async () => {
  // Regression for the collision threshold being computed with Math.imul.
  // `CarDefine.comprad` is a float[] (formula7 is 0.4), and Math.imul
  // truncates its operands, so the narrow-phase threshold collapsed to 0 for
  // any pair summing below 1 -- every car in the default field. Cars drove
  // through each other with no contact at all.
  //
  // The two cars must NOT be identical in speed: colide() picks a dominant
  // car by |power * speed * moment|, and on an exact tie neither dominates
  // and no contact is evaluated. That is the Java's behaviour, not a bug, and
  // it is why this test drives one car into a stationary one.
  const w = await buildWorld({ players: 2 });
  w.xt.fase = 0;

  const target = w.array2[1];
  target.x = w.array2[0].x;
  target.z = w.array2[0].z + 260;      // parked directly ahead
  const startX = target.x, startZ = target.z;

  w.gs.u[0].up = true;                 // car 1 is given no input whatsoever

  for (let t = 0; t < 40; t++) {
    for (let a = 0; a < 2; a++) {
      for (let b = 0; b < 2; b++) {
        if (a !== b) w.array3[a].colide(w.array2[a], w.array3[b], w.array2[b]);
      }
    }
    for (let a = 0; a < 2; a++) {
      w.array3[a].drive(w.gs.u[a], w.array2[a], w.trackers, w.checkPoints);
    }
  }

  const moved = Math.hypot(target.x - startX, target.z - startZ);
  assert.ok(moved > 100, `parked car should be knocked forward, moved ${moved}`);
  assert.ok(w.array3[1].speed > 0, 'parked car should pick up speed from the hit');
});

// Every effect in the game advances its own counter from inside draw() --
// the repair sparkle, dust puffs, crash sparks, the electric ring's bolts,
// the backdrop's lightning and checkpoint flicker. An interpolated frame
// re-runs draw() ~3x per tick, so an unguarded effect animates at display
// rate: the ring's electricity was rerolled every frame (a buzz instead of a
// bolt), and the repair sparkle could skip the frame that clears `fix`. The
// guard is `medium.interpolating`, checked at each mutation. This test fails
// for any effect that forgets it, which is the point -- the old approach was
// a list of field names in main.js that could only be as complete as the last
// bug report.
const EFFECT_FIELDS = ['fcnt', 'fix', 'ust', 'sprk_'];
const EFFECT_ARRAYS = ['elc', 'edl', 'edr', 'elp', 'stg', 'rtg', 'sx', 'sy', 'sz',
                       'scx', 'scz', 'osmag', 'rx', 'ry', 'rz', 'vrx', 'vry', 'vrz'];

function effectState(w) {
  const out = [];
  for (let i = 0; i < w.gs.nob; i++) {
    const o = w.array2[i];
    if (!o) continue;
    for (const f of EFFECT_FIELDS) out.push(`${i}.${f}=${o[f]}`);
    for (const f of EFFECT_ARRAYS) out.push(`${i}.${f}=${o[f] ? Array.from(o[f]).join() : ''}`);
    if (o.smag) for (let j = 0; j < o.smag.length; j++) out.push(`${i}.smag${j}=${Array.from(o.smag[j]).join()}`);
  }
  for (const f of ['cpflik', 'elecr', 'noelec', 'lilo', 'lightn']) out.push(`m.${f}=${w.medium[f]}`);
  return out;
}

test('an interpolated draw advances no per-effect animation state', async () => {
  const w = await buildWorld();
  w.gs.u[0].up = true;
  for (let t = 0; t < 40; t++) {
    w.rd.begin();
    w.gs.tick(w.rd, w.medium, w.trackers, w.checkPoints, w.xt, w.record, w.array2, w.array3);
  }

  // Arm the effects that a 40-tick clean lap does not necessarily produce, so
  // the guarded paths are actually reached rather than skipped.
  const car = w.array2[0];
  car.fix = true;
  car.fcnt = 1;
  car.stg[0] = 1;
  car.stg[1] = 4;
  car.sprk_ = 1;
  car.rcx = 400; car.rcy = 120; car.rcz = 400;
  car.srx = car.x; car.sry = car.y; car.srz = car.z;
  w.medium.lightn = 8;
  w.medium.lton = true;

  // One ordinary tick-rate draw, to let those settle into a drawable state.
  w.rd.begin();
  w.gs.draw(w.rd, w.medium, w.xt, w.array2, w.array3);

  const before = effectState(w);
  // main.js rewinds the PRNG cursor after each interpolated frame -- draw
  // consumes randoms and a call that must return a value cannot be guarded
  // away -- so every interpolated frame of a tick starts from the same one.
  // Mirror that here or the two frames compared below are not the same frame.
  const rewind = { rand: Int32Array.from(w.medium.rand), cntrn: w.medium.cntrn, trn: w.medium.trn };
  w.medium.interpolating = true;
  w.rd.begin();
  w.gs.draw(w.rd, w.medium, w.xt, w.array2, w.array3);
  const first = w.rd.snapshotFrom(0);
  const after = effectState(w);
  w.medium.interpolating = false;

  const drift = before.filter((s, i) => s !== after[i]);
  assert.deepStrictEqual(drift, [], `interpolated draw advanced: ${drift.join(' ')}`);

  // And two interpolated frames of the same tick must draw the same picture.
  // Guarding the counters is not enough on its own: electrify() and fixit()
  // roll their shape straight from the PRNG, so they also have to cache it.
  w.medium.rand.set(rewind.rand);
  w.medium.cntrn = rewind.cntrn;
  w.medium.trn = rewind.trn;
  w.medium.interpolating = true;
  w.rd.begin();
  w.gs.draw(w.rd, w.medium, w.xt, w.array2, w.array3);
  const second = w.rd.snapshotFrom(0);
  w.medium.interpolating = false;
  // Compared by hand rather than with deepStrictEqual: these are ~10^5-word
  // typed arrays and the assertion library's diff of two of them is slower
  // than the whole rest of the suite.
  let diff = second.length === first.length ? -1 : 0;
  if (diff === -1) {
    for (let i = 0; i < first.length; i++) {
      if (first[i] !== second[i]) { diff = i; break; }
    }
  }
  assert.strictEqual(diff, -1, `two interpolated redraws of one tick differ:`
    + ` ${first.length} vs ${second.length} words, first at ${diff}`
    + ` (${first[diff]} vs ${second[diff]})`);
});
