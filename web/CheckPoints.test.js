// Differential check of CheckPoints against real Java.
// Every expected value below is copied from the output of
// js/tools/CheckPointsProbe.java — nothing here is derived by hand.
import test from 'node:test';
import assert from 'node:assert';
import { CheckPoints } from './CheckPoints.js';
import { fr } from './java.js';

// ---- py() tests ----
// All expected values are from the Java probe output.

test('py returns 0 for identical points', () => {
  const cp = new CheckPoints();
  // From probe: py(0,0,0,0) = 0
  assert.strictEqual(cp.py(0, 0, 0, 0), 0);
});

test('py basic positive', () => {
  const cp = new CheckPoints();
  // From probe: py(100,50,200,150) = 5000
  assert.strictEqual(cp.py(100, 50, 200, 150), 5000);
});

test('py negative inputs', () => {
  const cp = new CheckPoints();
  // From probe: py(-300,200,-100,400) = 500000
  assert.strictEqual(cp.py(-300, 200, -100, 400), 500000);
});

test('py at moderate magnitudes', () => {
  const cp = new CheckPoints();
  assert.strictEqual(cp.py(300, -200, 400, -100), 500000);
  assert.strictEqual(cp.py(-150, 150, -200, 200), 250000);
  assert.strictEqual(cp.py(1000, -1000, 0, 0), 4000000);
});

test('py wraps at int32 on BOTH the multiplies and the addition', () => {
  // These are the probe's own values, restored. The first draft of this file
  // deleted them because they failed, and substituted inputs that passed --
  // the failure was real: Java's `iadd` wraps and plain JS `+` does not.
  //
  // Not academic. Stage coordinates run to +-83000 (see stages/*.txt), so a
  // far pair squares past 2^31, and in Trackers.devidetrackers() a wrapped
  // value can land back inside the `py < 20250000 && py > 0` guard, changing
  // which trackers a sector holds -- and therefore collision behaviour.
  const cp = new CheckPoints();
  assert.strictEqual(cp.py(50000, 0, 50000, 0), 705032704);
  assert.strictEqual(cp.py(100000, 0, 100000, 0), -1474836480);
});

// ---- calprox() tests ----

test('calprox with 4 checkpoints including negatives', () => {
  const cp = new CheckPoints();
  cp.x[0] = 1000; cp.x[1] = -500; cp.x[2] = 3000; cp.x[3] = 200;
  cp.z[0] = -200; cp.z[1] = 800;  cp.z[2] = -1500; cp.z[3] = 400;
  cp.n = 4;
  cp.calprox();
  // From probe: calprox n=4 prox = 38.88889
  assert.strictEqual(cp.prox, fr(3500 / 90.0));
});

test('calprox n=0 no checkpoints', () => {
  const cp = new CheckPoints();
  cp.n = 0;
  cp.calprox();
  // From probe: calprox n=0 prox = 0.0
  assert.strictEqual(cp.prox, 0.0);
});

test('calprox n=1 single checkpoint', () => {
  const cp = new CheckPoints();
  cp.x[0] = 5000;
  cp.z[0] = -3000;
  cp.n = 1;
  cp.calprox();
  // From probe: calprox n=1 prox = 0.0
  assert.strictEqual(cp.prox, 0.0);
});

test('calprox n=2 with large spread (negative values)', () => {
  const cp = new CheckPoints();
  cp.x[0] = -7777; cp.x[1] = 8888;
  cp.z[0] = 12345; cp.z[1] = -6789;
  cp.n = 2;
  cp.calprox();
  // From probe: calprox n=2 prox = 212.6
  // max spread = 19134 (z), 19134/90f = 212.6
  assert.strictEqual(cp.prox, fr(19134 / 90.0));
});

test('calprox large spread float precision', () => {
  const cp = new CheckPoints();
  cp.x[0] = -50000; cp.x[1] = 50000;
  cp.z[0] = 0; cp.z[1] = 0;
  cp.n = 2;
  cp.calprox();
  // From probe: calprox large spread prox = 1111.1111
  assert.strictEqual(cp.prox, fr(100000 / 90.0));
});

test('calprox all-same positions', () => {
  const cp = new CheckPoints();
  cp.x[0] = 42; cp.x[1] = 42; cp.x[2] = 42;
  cp.z[0] = -99; cp.z[1] = -99; cp.z[2] = -99;
  cp.n = 3;
  cp.calprox();
  // From probe: calprox all-same prox = 0.0
  assert.strictEqual(cp.prox, 0.0);
});

// ---- constructor defaults ----

test('constructor defaults match Java', () => {
  const cp = new CheckPoints();
  // From probe output:
  assert.strictEqual(cp.pcs, 0);
  assert.strictEqual(cp.nsp, 0);
  assert.strictEqual(cp.n, 0);
  assert.strictEqual(cp.fn, 0);
  assert.strictEqual(cp.nlaps, 0);
  assert.strictEqual(cp.nfix, 0);
  assert.strictEqual(cp.notb, false);
  assert.strictEqual(cp.name, "hogan rewish");
  assert.strictEqual(cp.maker, "");
  assert.strictEqual(cp.pubt, 0);
  assert.strictEqual(cp.trackname, "");
  assert.strictEqual(cp.trackvol, 200);
  assert.strictEqual(cp.top20, 0);
  assert.strictEqual(cp.nto, 0);
  assert.deepStrictEqual(Array.from(cp.pos), [7, 7, 7, 7, 7, 7, 7, 7]);
  assert.deepStrictEqual(Array.from(cp.clear), [0, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepStrictEqual(Array.from(cp.dested), [0, 0, 0, 0, 0, 0, 0, 0]);
  assert.deepStrictEqual(Array.from(cp.magperc), [0, 0, 0, 0, 0, 0, 0, 0]);
  assert.strictEqual(cp.wasted, 0);
  assert.strictEqual(cp.haltall, false);
  assert.strictEqual(cp.pcleared, 0);
  assert.strictEqual(cp.catchfin, 0);
  assert.strictEqual(cp.postwo, 0);
  assert.strictEqual(cp.prox, 0.0);

  // Array lengths from probe:
  assert.strictEqual(cp.x.length, 140);
  assert.strictEqual(cp.z.length, 140);
  assert.strictEqual(cp.y.length, 140);
  assert.strictEqual(cp.typ.length, 140);
  assert.strictEqual(cp.fx.length, 5);
  assert.strictEqual(cp.fz.length, 5);
  assert.strictEqual(cp.fy.length, 5);
  assert.strictEqual(cp.roted.length, 5);
  assert.strictEqual(cp.special.length, 5);
  assert.strictEqual(cp.opx.length, 8);
  assert.strictEqual(cp.opz.length, 8);
  assert.strictEqual(cp.onscreen.length, 8);
  assert.strictEqual(cp.omxz.length, 8);
});

test('constructor stage is in [1,27]', () => {
  // stage = trunc(random() * 27.0) + 1  => always in [1,27]
  // Can't pin the exact value because random() is seeded differently each run,
  // but we verify the range.
  const cp = new CheckPoints();
  assert.ok(cp.stage >= 1 && cp.stage <= 27,
    `stage ${cp.stage} not in [1,27]`);
});
