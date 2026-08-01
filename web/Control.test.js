// Differential check of Control against real Java.
// Every expected value below is copied from the output of
// js/tools/ControlProbe.java — nothing here is derived by hand.

import test from 'node:test';
import assert from 'node:assert';
import { Control } from './Control.js';
import { intArray, floatArray, fr } from './java.js';

function stubMedium() {
  return {
    random: () => 0.5,
  };
}

test('py matches Java including int32 overflow/wrapping', () => {
  const m = stubMedium();
  const c = new Control(m);
  // Expected values from Java reflection probe (ControlProbe.java)
  assert.strictEqual(c.py(0, 0, 0, 0), 0);
  assert.strictEqual(c.py(10, 20, 30, 40), 200);
  assert.strictEqual(c.py(-50, 100, -200, 300), 272500);
  assert.strictEqual(c.py(50000, 0, 50000, 0), 705032704);
  assert.strictEqual(c.py(-100000, 100000, -200000, 200000), -1863462912);
  assert.strictEqual(c.py(83000, -83000, 83000, -83000), -722574848);
});

test('pys matches Java including NaN truncation to 0', () => {
  const m = stubMedium();
  const c = new Control(m);
  // Expected values from Java reflection probe (ControlProbe.java)
  assert.strictEqual(c.pys(0, 0, 0, 0), 0);
  assert.strictEqual(c.pys(10, 20, 30, 40), 14);
  assert.strictEqual(c.pys(-50, 100, -200, 300), 522);
  assert.strictEqual(c.pys(50000, 0, 50000, 0), 26552);
  assert.strictEqual(c.pys(-100000, 100000, -200000, 200000), 0);
  assert.strictEqual(c.pys(83000, -83000, 83000, -83000), 0);
});

test('falseo matches Java state resets across modes', () => {
  const m = stubMedium();
  const c = new Control(m);

  // falseo(0)
  c.left = true; c.right = true; c.up = true; c.down = true; c.handb = true;
  c.lookback = 5; c.enter = true; c.exit = true; c.radar = true; c.arrace = true;
  c.chatup = 3; c.multion = 2; c.mutem = true; c.mutes = true;
  c.falseo(0);
  assert.strictEqual(c.left, false);
  assert.strictEqual(c.right, false);
  assert.strictEqual(c.up, false);
  assert.strictEqual(c.down, false);
  assert.strictEqual(c.handb, false);
  assert.strictEqual(c.lookback, 0);
  assert.strictEqual(c.enter, false);
  assert.strictEqual(c.exit, false);
  assert.strictEqual(c.radar, false);
  assert.strictEqual(c.arrace, false);
  assert.strictEqual(c.chatup, 0);
  assert.strictEqual(c.multion, 0);
  assert.strictEqual(c.mutem, false);
  assert.strictEqual(c.mutes, false);

  // falseo(1) preserves radar, arrace, chatup, multion, mutem, mutes
  c.left = true; c.right = true; c.up = true; c.down = true; c.handb = true;
  c.lookback = 5; c.enter = true; c.exit = true; c.radar = true; c.arrace = true;
  c.chatup = 3; c.multion = 2; c.mutem = true; c.mutes = true;
  c.falseo(1);
  assert.strictEqual(c.radar, true);
  assert.strictEqual(c.arrace, true);
  assert.strictEqual(c.chatup, 3);
  assert.strictEqual(c.multion, 2);
  assert.strictEqual(c.mutem, true);
  assert.strictEqual(c.mutes, true);

  // falseo(2) clears radar/arrace/chatup/mutem/mutes but keeps multion
  c.radar = true; c.arrace = true; c.chatup = 3; c.multion = 2; c.mutem = true; c.mutes = true;
  c.falseo(2);
  assert.strictEqual(c.radar, false);
  assert.strictEqual(c.arrace, false);
  assert.strictEqual(c.chatup, 0);
  assert.strictEqual(c.multion, 2);
  assert.strictEqual(c.mutem, false);
  assert.strictEqual(c.mutes, false);

  // falseo(3) clears radar/arrace/chatup/multion but keeps mutem/mutes
  c.radar = true; c.arrace = true; c.chatup = 3; c.multion = 2; c.mutem = true; c.mutes = true;
  c.falseo(3);
  assert.strictEqual(c.radar, false);
  assert.strictEqual(c.arrace, false);
  assert.strictEqual(c.chatup, 0);
  assert.strictEqual(c.multion, 0);
  assert.strictEqual(c.mutem, true);
  assert.strictEqual(c.mutes, true);
});

test('reset matches Java for stage settings', () => {
  const m = stubMedium();
  const c = new Control(m);
  const cp = {
    stage: 1,
    fn: 2,
    n: 10,
    nsp: 4,
    fx: intArray([1000, 2000]),
    fz: intArray([3000, 4000]),
    x: intArray([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]),
    z: intArray([150, 250, 350, 450, 550, 650, 750, 850, 950, 1050]),
  };

  // Stage 1
  c.reset(cp, 0);
  assert.strictEqual(c.hold, 0);
  assert.strictEqual(c.revstart, 0);
  assert.deepStrictEqual(Array.from(c.fpnt), [5, 5, 0, 0, 0]);

  // Stage 16
  cp.stage = 16;
  c.reset(cp, 0);
  assert.strictEqual(c.hold, 50);

  // Stage 21
  cp.stage = 21;
  c.reset(cp, 0);
  assert.strictEqual(c.hold, 35);
  assert.strictEqual(c.revstart, 25);

  // Stage 24
  cp.stage = 24;
  c.reset(cp, 0);
  assert.strictEqual(c.hold, 30);
  assert.strictEqual(c.revstart, 1);

  // Stage 25
  cp.stage = 25;
  c.reset(cp, 0);
  assert.strictEqual(c.hold, 40);

  // Stage 26
  cp.stage = 26;
  c.reset(cp, 0);
  assert.strictEqual(c.hold, 20);
  assert.strictEqual(c.fpnt[3], 39);
});

test('preform main work method matches Java probe state', () => {
  const m = stubMedium();
  const c = new Control(m);

  const mad = {
    dest: false,
    mtouch: true,
    im: 1,
    power: 90.0,
    point: 0,
    scy: floatArray(4),
    cd: {
      maxmag: intArray(16),
      swits: Array.from({ length: 16 }, () => intArray(16)),
    },
  };

  const contO = { x: 500, z: 500, xz: 45 };

  const cp = {
    stage: 1,
    pos: intArray([0, 1, 2, 3, 4, 5, 6]),
    clear: intArray([0, 0, 0, 0, 0, 0, 0]),
    opx: intArray([0, 1000, 2000, 3000, 4000, 5000, 6000]),
    opz: intArray([0, 1000, 2000, 3000, 4000, 5000, 6000]),
    typ: intArray([1, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    fn: 2,
    n: 10,
    nsp: 4,
    fx: intArray([1000, 2000]),
    fz: intArray([3000, 4000]),
    x: intArray([100, 200, 300, 400, 500, 600, 700, 800, 900, 1000]),
    z: intArray([150, 250, 350, 450, 550, 650, 750, 850, 950, 1050]),
  };

  const trackers = {};

  c.stcnt = 10;
  c.statusque = 5;

  c.preform(mad, contO, cp, trackers);

  // Verified against Java probe output (with m.random() = 0.5):
  // left=false, right=true, up=true, down=false, handb=false, acuracy=0, upwait=20, skiplev=0.9 (fr), saftey=3, mustland=0.0, pan=0
  assert.strictEqual(c.up, true);
  assert.strictEqual(c.down, false);
  assert.strictEqual(c.left, false);
  assert.strictEqual(c.right, true);
  assert.strictEqual(c.handb, false);
  assert.strictEqual(c.acuracy, 0);
  assert.strictEqual(c.upwait, 20);
  assert.strictEqual(c.skiplev, fr(0.9));
  assert.strictEqual(c.saftey, 3);
  assert.strictEqual(c.mustland, 0.0);
  assert.strictEqual(c.pan, 0);
});
