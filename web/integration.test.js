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

/**
 * @param countdown  keep the race start armed. resetstat() sets starcnt = 130,
 *   which holds all physics for the intro fly-by and the 3-2-1; a test that
 *   wants to drive has to be past it, so this defaults to off and zeroes the
 *   counter the way the pre-countdown port behaved.
 */
async function buildWorld({ stage = 1, car = 1, players = 7, seed = 12345,
                            countdown = false } = {}) {
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

  if (!countdown) xt.starcnt = 0;

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

test('the race starts with the intro and countdown, and holds physics until GO', async () => {
  // resetstat() arming starcnt is the whole start sequence: without it the
  // race began instantly with no fly-by, no 3-2-1 and no countdown sounds,
  // and every branch below is unreachable while still passing every other
  // test. Assert the counter AND its two visible consequences.
  const w = await buildWorld({ countdown: true });
  assert.equal(w.xt.starcnt, 130, 'resetstat did not arm the countdown');
  assert.equal(w.xt.gocnt, 3);

  const z0 = w.array2[0].z;
  w.gs.u[0].up = true;

  // Intro fly-by: 130 -> 38. Physics is frozen throughout.
  for (let t = 0; t < 92; t++) {
    w.rd.begin();
    w.gs.tick(w.rd, w.medium, w.trackers, w.checkPoints, w.xt, w.record, w.array2, w.array3);
  }
  assert.equal(w.array2[0].z, z0, 'the car moved during the intro');
  assert.equal(w.array3[0].speed, 0, 'the car revved during the intro');

  // Countdown: gocnt steps 3 -> 2 -> 1 -> 0 as starcnt passes 24, 13 and 2.
  const seen = [];
  for (let t = 0; t < 38; t++) {
    w.rd.begin();
    w.gs.tick(w.rd, w.medium, w.trackers, w.checkPoints, w.xt, w.record, w.array2, w.array3);
    if (seen[seen.length - 1] !== w.xt.gocnt) seen.push(w.xt.gocnt);
  }
  assert.deepEqual(seen, [3, 2, 1, 0], `countdown ran ${seen}`);
  assert.equal(w.xt.starcnt, 0);

  // And now it drives.
  for (let t = 0; t < 40; t++) {
    w.rd.begin();
    w.gs.tick(w.rd, w.medium, w.trackers, w.checkPoints, w.xt, w.record, w.array2, w.array3);
  }
  assert.notEqual(w.array2[0].z, z0, 'the car never moved after GO');
});

test('the intro camera survives a grid smaller than the Java ever builds', async () => {
  // It orbits car 3, which does not exist at ?players=2 -- a port-only
  // setting. Reaching an empty slot throws inside Medium.around.
  for (const players of [1, 2, 3, 7]) {
    const w = await buildWorld({ players, countdown: true });
    for (let t = 0; t < 5; t++) {
      w.rd.begin();
      w.gs.tick(w.rd, w.medium, w.trackers, w.checkPoints, w.xt, w.record, w.array2, w.array3);
    }
  }
});

test('wasting the field ends the race and asks to leave', async () => {
  // The finish sequence lives entirely in stat(): it freezes the field with
  // holdit, holds the overlay for holdcnt ticks, then sets fase = -2, which is
  // the Java's "leave the race" signal and what main.js watches to return to
  // the launcher. Nothing else in the port produces fase -2, so a race that
  // could never end would look exactly like a race nobody has finished yet.
  const w = await buildWorld({ players: 2 });
  // Waste the opposition for real rather than writing checkPoints.wasted:
  // checkstat() recounts it from the cars' dest flags on every tick, so an
  // assigned value is gone before stat() ever reads it.
  w.array3[1].dest = true;

  w.rd.begin();
  w.gs.tick(w.rd, w.medium, w.trackers, w.checkPoints, w.xt, w.record, w.array2, w.array3);
  assert.equal(w.xt.holdit, true, 'the race did not freeze');
  assert.equal(w.xt.winner, true, 'wasting everyone did not count as a win');
  assert.equal(w.checkPoints.haltall, true);

  // 250 is the single-player hold; it must expire on its own, since the
  // player is not required to press anything.
  for (let t = 0; t < 260 && w.xt.fase !== -2; t++) {
    w.rd.begin();
    w.gs.tick(w.rd, w.medium, w.trackers, w.checkPoints, w.xt, w.record, w.array2, w.array3);
  }
  assert.equal(w.xt.fase, -2, `race never signalled its end (holdcnt ${w.xt.holdcnt})`);
});

test('being wasted ends the race as a loss', async () => {
  const w = await buildWorld({ players: 2 });
  w.array3[0].dest = true;
  w.xt.cntwis = 8;

  w.rd.begin();
  w.gs.tick(w.rd, w.medium, w.trackers, w.checkPoints, w.xt, w.record, w.array2, w.array3);
  assert.equal(w.xt.holdit, true, 'the race did not freeze on being wasted');
  assert.equal(w.xt.winner, false, 'being wasted counted as a win');
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

// The bug this pins: crash()/skid()/scrape() set bfcrash/bfskid/bfscrape to
// suppress the same sample retriggering every tick, and playsounds() is the
// ONLY thing that decrements them (xtGraphics.java:9207-9221). Without it the
// first crash of a race set bfcrash = 2 and every later crash was silent --
// which presented as "a sound effect plays once per race, then never again"
// rather than as a missing method.
test('playsounds decrements the sound debounce counters', async () => {
  const w = await buildWorld();
  w.xt.fase = 0;
  w.xt.starcnt = 0;

  // Arm them the way a crash, a skid and two scrapes would.
  w.xt.bfcrash = 2;
  w.xt.bfskid = 5;
  w.xt.bfscrape = 5;
  w.xt.bfsc1 = 12;
  w.xt.bfsc2 = 6;

  w.xt.playsounds(w.array3[0], w.gs.u[0], w.checkPoints.stage);
  assert.deepStrictEqual(
    [w.xt.bfcrash, w.xt.bfskid, w.xt.bfscrape, w.xt.bfsc1, w.xt.bfsc2],
    [1, 4, 4, 11, 5], 'one pump should decrement each counter exactly once');

  // And they must reach zero rather than stalling, or the effect is silent
  // for the rest of the race.
  for (let t = 0; t < 20; t++) w.xt.playsounds(w.array3[0], w.gs.u[0], w.checkPoints.stage);
  assert.deepStrictEqual(
    [w.xt.bfcrash, w.xt.bfskid, w.xt.bfscrape, w.xt.bfsc1, w.xt.bfsc2],
    [0, 0, 0, 0, 0], 'counters must clear so a later crash can sound');

  // A counter cleared means crash() actually fires again -- the observable
  // symptom, not just the field.
  let plays = 0;
  w.xt.snd = { play: () => { plays++; }, stop() {}, loop() {}, stopLoop() {} };
  w.xt.crash(200.0, 0);
  w.xt.playsounds(w.array3[0], w.gs.u[0], w.checkPoints.stage);
  w.xt.playsounds(w.array3[0], w.gs.u[0], w.checkPoints.stage);
  w.xt.crash(200.0, 0);
  assert.strictEqual(plays, 2, 'the second crash must sound once the debounce has run out');
});

// The race tick has to actually call the pump; porting playsounds() and
// leaving it unreferenced would pass every test above and change nothing.
test('the race tick pumps playsounds once per tick', async () => {
  const w = await buildWorld();
  let pumps = 0;
  const real = w.xt.playsounds.bind(w.xt);
  w.xt.playsounds = (...a) => { pumps++; return real(...a); };
  for (let t = 0; t < 10; t++) {
    w.rd.begin();
    w.gs.tick(w.rd, w.medium, w.trackers, w.checkPoints, w.xt, w.record, w.array2, w.array3);
  }
  assert.strictEqual(pumps, 10, `expected one pump per tick, got ${pumps}`);
});

test('two worlds tick to bit-identical state regardless of how much they draw', async () => {
  // The lockstep prerequisite, and the reason java.js keeps two PRNG streams.
  // Client A draws once per tick; client B also draws three interpolated
  // frames per tick, the way a 60Hz machine does against an 18.9Hz sim. Their
  // simulations must not notice. On a single shared stream B's extra draws
  // advance the sequence and every sim value downstream differs -- a desync
  // caused by nothing but the other player's refresh rate.
  //
  // The two runs are SEQUENTIAL, not interleaved: the PRNG is module state, so
  // two worlds alive at once share one stream and would interleave in a way no
  // two browser tabs ever do. Each run re-seeds from scratch, as a fresh tab
  // does.
  const state = (w) => {
    const out = [];
    for (let i = 0; i < w.xt.nplayers; i++) {
      const o = w.array2[i], m = w.array3[i];
      out.push(o.x, o.y, o.z, o.xz, o.xy, o.zy,
               m.speed, m.power, m.hitmag, m.mxz, m.nlaps);
    }
    out.push(w.checkPoints.wasted, w.checkPoints.catchfin);
    for (let i = 0; i < w.xt.nplayers; i++) out.push(w.checkPoints.pos[i], w.checkPoints.clear[i]);
    return out;
    // The CAMERA is deliberately not in here. Medium.d() -- the draw path --
    // normalises medium.xz into [0,360) and clamps zy/y, so a client drawing
    // interpolated frames normalises more often, and follow() is a stateful
    // ease that reads the result: two clients' cameras drift apart by a whole
    // turn's worth of representation. That cannot desync anything, because no
    // physics class reads medium.xz at all (grep: zero hits in Mad, Control,
    // Wheels, Record, CheckPoints), and each player has their own camera by
    // definition. Asserting on it would pin a divergence that is correct.
  };

  const run = async (interpFrames) => {
    const w = await buildWorld({ seed: 4242 });
    w.gs.u[0].up = true;
    w.gs.u[0].right = true;
    for (let t = 0; t < 200; t++) {
      w.rd.begin();
      w.gs.tick(w.rd, w.medium, w.trackers, w.checkPoints, w.xt, w.record, w.array2, w.array3);
      for (let f = 0; f < interpFrames; f++) {
        w.medium.interpolating = true;
        w.rd.begin(true);
        w.gs.draw(w.rd, w.medium, w.xt, w.array2, w.array3);
        w.medium.interpolating = false;
      }
    }
    return state(w);
  };

  assert.deepEqual(await run(0), await run(3), 'the two simulations diverged');
});
