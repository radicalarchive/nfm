// Differential test of Mad.js against real Java Mad class output.
// Expected values below come directly from js/tools/MadProbe.java output.
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { parseZip } from './vfs.js';
import { Medium } from './Medium.js';
import { Trackers } from './Trackers.js';
import { CheckPoints } from './CheckPoints.js';
import { Control } from './Control.js';
import { Record } from './Record.js';
import { ContO } from './ContO.js';
import { Mad } from './Mad.js';
import { intArray, floatArray, objArray } from './java.js';

test('Mad.py matches Java probe including overflow and negative values', () => {
  const cd = {};
  const m = new Medium();
  const rpd = {};
  const xt = {};
  const mad = new Mad(cd, m, rpd, xt, 0);

  // Values from MadProbe.java
  assert.strictEqual(mad.py(50000, 0, 50000, 0), 705032704);
  assert.strictEqual(mad.py(-30000, 40000, -50000, 60000), -179869184);
});

test('Mad.rpy matches Java probe', () => {
  const cd = {};
  const m = new Medium();
  const rpd = {};
  const xt = {};
  const mad = new Mad(cd, m, rpd, xt, 0);

  // Values from MadProbe.java
  assert.strictEqual(mad.rpy(500.5, -200.25, 100.0, -300.0, 400.0, 1000.0), 1011050);
});

// 300-tick differential run against the real Java (js/tools/MadProbe.java).
//
// zy and xy are DELIBERATELY NOT ASSERTED, and this is not a gap being swept
// under the rug -- they are not verifiable by this method:
//
//   Mad.drive() perturbs contO.zy/contO.xy through Medium.random(), which
//   bottoms out in java.lang.Math.random(). That is UNSEEDED on the Java side,
//   so the probe is non-deterministic in exactly those two fields. Three
//   consecutive runs of the same probe gave zy = 0, -1, -1 at tick 50 and
//   xy = -7, -6, -7 at tick 300. Every other field was byte-identical across
//   all three runs.
//
//   Asserting them would produce a test that fails or passes at random.
//
// To verify zy/xy properly, PORT_SPEC's phase-1 prescription is required:
// replace Math.random() with an identical seeded PRNG on BOTH sides -- i.e.
// patch and recompile Medium.class so the Java probe is deterministic too.
// Until that exists, this test pins the deterministic 90%: position (x/y/z),
// heading (xz), speed, and the pzy/pxy turn accumulators, all of which match
// Java exactly for 300 ticks.
test('Mad reseto and 300-tick drive match Java probe state', async () => {
  const zipBuf = fs.readFileSync('/home/evan/games/nfm/data/models.zip');
  const modelsZip = await parseZip(zipBuf);
  const formula7Bytes = modelsZip.get('formula7.rad');

  const m = new Medium();
  const trackers = new Trackers();
  const checkPoints = new CheckPoints();
  const control = new Control(m);
  const rpd = new Record(m);

  const bounce = floatArray(16); bounce.fill(1.2);
  const flipy = intArray(16); flipy.fill(100);
  const airs = floatArray(16); airs.fill(1.0);
  const airc = intArray(16); airc.fill(1);
  const swits = objArray(16);
  for (let i = 0; i < 16; i++) {
    swits[i] = intArray(3);
    swits[i][0] = 50; swits[i][1] = 100; swits[i][2] = 150;
  }
  const acelf = objArray(16);
  for (let i = 0; i < 16; i++) {
    acelf[i] = floatArray(3);
    acelf[i][0] = 10; acelf[i][1] = 10; acelf[i][2] = 10;
  }
  const handb = intArray(16); handb.fill(5);
  const turn = intArray(16); turn.fill(4);
  const simag = floatArray(16); simag.fill(1.0);
  const grip = floatArray(16); grip.fill(20.0);
  const powerloss = intArray(16); powerloss.fill(100000);
  const maxmag = intArray(16); maxmag.fill(1000);
  const msquash = intArray(16); msquash.fill(100);
  const clrad = intArray(16); clrad.fill(500);
  const dammult = floatArray(16); dammult.fill(1.0);
  const moment = floatArray(16); moment.fill(1.0);
  const push = intArray(16); push.fill(100);
  const revpush = intArray(16); revpush.fill(100);
  const revlift = intArray(16); revlift.fill(10);
  const lift = intArray(16); lift.fill(10);
  const comprad = floatArray(16); comprad.fill(300);

  const cd = {
    bounce, flipy, airs, airc, swits, acelf, handb, turn, simag, grip,
    powerloss, maxmag, msquash, clrad, dammult, moment, push, revpush,
    revlift, lift, comprad,
  };

  // `human` is part of the contract Mad depends on: simulation branches ask
  // "is this car player-driven" rather than "is it mine", so that two netplay
  // clients treat both human cars identically. With one player it is exactly
  // the old `i === im` test, which is what the Java does and what this probe
  // was captured against.
  const xt = { im: 0, dcrashes: intArray(8), skid: () => {}, pit: () => {},
               human(i) { return i === this.im; } };

  const baseContO = new ContO(formula7Bytes, m, trackers);
  const contO = new ContO(baseContO, 1000, 200, -5000, 0);

  contO.keyx[0] = -100; contO.keyx[1] = 100; contO.keyx[2] = 100; contO.keyx[3] = -100;
  contO.keyz[0] = 200; contO.keyz[1] = 200; contO.keyz[2] = -200; contO.keyz[3] = -200;
  contO.grat = 0;
  contO.x = 1000; contO.y = 200; contO.z = -5000;
  contO.xz = 45; contO.zy = 0; contO.xy = 0;

  trackers.devidetrackers(-10000, 40000, -10000, 40000);

  checkPoints.pcs = 0;
  checkPoints.dested = intArray(8);
  checkPoints.nfix = 0;
  checkPoints.n = 4;
  checkPoints.typ = intArray([1, 1, 1, 1]);
  checkPoints.x = intArray([0, 5000, 5000, 0]);
  checkPoints.y = intArray([0, 0, 0, 0]);
  checkPoints.z = intArray([0, 0, 5000, 5000]);
  checkPoints.nsp = 4;
  checkPoints.nlaps = 1;
  checkPoints.stage = 1;
  checkPoints.fn = 0;

  rpd.dest = intArray(8);
  rpd.fix = intArray(8);

  const mad = new Mad(cd, m, rpd, xt, 0);
  mad.reseto(0, contO, checkPoints);

  // RESETO assertions (from Java probe: RESETO_FORCA=0.08049845, RESETO_POWER=98.0)
  assert.strictEqual(Math.fround(mad.forca), Math.fround(0.08049845));
  assert.strictEqual(mad.power, 98.0);

  control.up = true;
  control.right = true;

  // Expected checkpoint values from Java MadProbe output (MadProbe.expected.txt):
  const expectedTicks = {
    1:   { x: 1000, y: 207, z: -5000, xz: 45,    speed: 10.000000, pzy: 0, pxy: 0 },
    2:   { x: 1000, y: 221, z: -5000, xz: 45,    speed: 20.000000, pzy: 0, pxy: 0 },
    10:  { x: 926,  y: 251, z: -4865, xz: 13,    speed: 57.942753, pzy: 0, pxy: 0 },
    50:  { x: 1977, y: 254, z: -5490, xz: -267,  speed: 109.485970, pzy: 0, pxy: 0 },
    100: { x: 2117, y: 255, z: -5446, xz: -617,  speed: 109.485970, pzy: 0, pxy: 0 },
    200: { x: 2366, y: 255, z: -5266, xz: -1317, speed: 109.485970, pzy: 0, pxy: 0 },
    300: { x: 2541, y: 254, z: -5011, xz: -2017, speed: 109.485970, pzy: 0, pxy: 0 },
  };

  for (let tick = 1; tick <= 300; tick++) {
    mad.drive(control, contO, trackers, checkPoints);

    if (expectedTicks[tick]) {
      const exp = expectedTicks[tick];
      assert.strictEqual(contO.x, exp.x, `Tick ${tick} x`);
      assert.strictEqual(contO.y, exp.y, `Tick ${tick} y`);
      assert.strictEqual(contO.z, exp.z, `Tick ${tick} z`);
      assert.strictEqual(contO.xz, exp.xz, `Tick ${tick} xz`);
      // zy / xy intentionally omitted -- see the note above the test.
      assert.strictEqual(Math.fround(mad.speed), Math.fround(exp.speed), `Tick ${tick} speed`);
      assert.strictEqual(mad.pzy, exp.pzy, `Tick ${tick} pzy`);
      assert.strictEqual(mad.pxy, exp.pxy, `Tick ${tick} pxy`);
    }
  }
});
