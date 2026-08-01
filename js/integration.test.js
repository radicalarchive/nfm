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

