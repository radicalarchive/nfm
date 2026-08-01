// Tests for Record.js verified against real Java via RecordProbe.java.
// Every expected value below is copied from the output of js/tools/RecordProbe.java.

import test from 'node:test';
import assert from 'node:assert';
import { Record } from './Record.js';
import { intArray, floatArray } from './java.js';

function stubMedium() {
  const tcos = floatArray(360);
  const tsin = floatArray(360);
  for (let i = 0; i < 360; ++i) {
    tcos[i] = Math.cos(i * 0.017453292519943295);
    tsin[i] = Math.sin(i * 0.017453292519943295);
  }
  return {
    tcos,
    tsin,
    rand: intArray(3),
    diup: new Array(3).fill(false),
    cntrn: 0,
    trn: 0,
    checkpoint: 5,
    lastcheck: true,
    cos(i) {
      while (i >= 360) i -= 360;
      while (i < 0) i += 360;
      return this.tcos[i];
    },
    sin(i) {
      while (i >= 360) i -= 360;
      while (i < 0) i += 360;
      return this.tsin[i];
    },
    random() {
      return 0.6; // Matches Medium.random() return in RecordProbe.java
    },
  };
}

test('Record.py matches Java int32 overflow & negative outputs', () => {
  const m = stubMedium();
  const r = new Record(m);

  // Literal values from RecordProbe.java
  assert.strictEqual(r.py(50000, 0, 50000, 0), 705032704);
  assert.strictEqual(r.py(-40000, 40000, -30000, 50000), -84901888);
  assert.strictEqual(r.py(-2147483648, 1, 1000, -5000), 36000001);
});

test('Record.recy, recx, recz match Java (including nry index preservation)', () => {
  const m = stubMedium();
  const r = new Record(m);

  r.recy(0, -123.45, true, 1);
  r.recx(0, 678.9, 1);
  r.recz(0, -999.5, 1);

  // Values from RecordProbe.java
  assert.strictEqual(r.ry[1][0][0], 300);
  assert.strictEqual(r.magy[1][0][0], -123);
  assert.strictEqual(r.mtouch[1][0], true);
  assert.strictEqual(r.nry[1][0], 1);

  assert.strictEqual(r.rx[1][0][1], 300);
  assert.strictEqual(r.magx[1][0][1], 678);
  assert.strictEqual(r.nrx[1][0], 1);

  assert.strictEqual(r.rz[1][0][1], 300);
  assert.strictEqual(r.magz[1][0][1], -999);
  assert.strictEqual(r.nrz[1][0], 1);
});

test('Record.rec matches Java state updates', () => {
  const m = stubMedium();
  const r = new Record(m);

  const contO = {
    x: 12345,
    y: -67890,
    z: 999999,
    xy: 45,
    zy: 180,
    xz: 90,
    wxz: 12,
    wzy: 34,
    stg: intArray(20),
    sx: intArray(20),
    sy: intArray(20),
    sz: intArray(20),
    osmag: floatArray(20),
    scx: intArray(20),
    scz: intArray(20),
    sprk: 0,
    srx: 0,
    sry: 0,
    srz: 0,
    rcx: 0,
    rcy: 0,
    rcz: 0,
    m: {
      checkpoint: 5,
      lastcheck: true,
    },
  };

  r.cntf = 49;
  r.fix[0] = 10;
  r.dest[0] = 231;

  r.rec(contO, 0, 15, 1, 1, 0);

  // Values from RecordProbe.java
  assert.strictEqual(r.caught, 1);
  assert.strictEqual(r.cntf, 50);
  assert.strictEqual(r.fix[0], 9);
  assert.strictEqual(r.dest[0], 230);
  assert.strictEqual(r.whenwasted, 229);
  assert.strictEqual(r.x[299][0], 12345);
  assert.strictEqual(r.y[299][0], -67890);
  assert.strictEqual(r.z[299][0], 999999);
});

test('Record.regy matches Java geometry deformation & color update', () => {
  const m = stubMedium();
  const r = new Record(m);

  const plane = {
    n: 2,
    ox: intArray(2),
    oz: intArray(2),
    oy: intArray(2),
    c: intArray(3),
    hsb: floatArray(3),
    bfase: 35,
    wz: 0,
    nocol: false,
    glass: 0,
    chip: 0,
    ctmag: 0,
  };
  plane.ox[0] = 105; plane.ox[1] = 150;
  plane.oz[0] = 505; plane.oz[1] = 550;
  plane.oy[0] = 10; plane.oy[1] = 20;
  plane.c[0] = 200; plane.c[1] = 100; plane.c[2] = 50;
  plane.hsb[0] = 0.1; plane.hsb[1] = 0.5; plane.hsb[2] = 0.8;

  const contO = {
    zy: 180,
    xy: 45,
    xz: 0,
    npl: 1,
    p: [plane],
    keyx: intArray(4),
    keyz: intArray(4),
  };
  contO.keyx[0] = 100; contO.keyx[1] = 200; contO.keyx[2] = 300; contO.keyx[3] = 400;
  contO.keyz[0] = 500; contO.keyz[1] = 600; contO.keyz[2] = 700; contO.keyz[3] = 800;

  const mad = {
    cd: {
      clrad: intArray([1000000]),
      flipy: intArray([0]),
      msquash: intArray([100]),
    },
    cn: 0,
    im: 0,
  };

  r.regy(0, 150.0, true, contO, mad);

  // Values from RecordProbe.java
  assert.strictEqual(plane.ox[0], 103);
  assert.strictEqual(plane.oz[0], 505);
  assert.strictEqual(plane.bfase, 36);
  assert.strictEqual(plane.c[0], 204);
  assert.strictEqual(plane.c[1], 196);
  assert.strictEqual(plane.c[2], 184);
});

test('Record.play & playh match Java position restore', () => {
  const m = stubMedium();
  const r = new Record(m);

  r.x[299][0] = 12345;
  r.y[299][0] = -67890;
  r.z[299][0] = 999999;

  const plane = { n: 0, wz: 0, gr: 0, embos: 0 };
  const contO = {
    x: 0,
    y: 0,
    z: 0,
    zy: 0,
    xy: 0,
    xz: 0,
    wxz: 0,
    wzy: 0,
    npl: 0,
    p: [],
    stg: intArray(20),
    sx: intArray(20),
    sy: intArray(20),
    sz: intArray(20),
    osmag: floatArray(20),
    scx: intArray(20),
    scz: intArray(20),
    m: { checkpoint: 0, lastcheck: false },
  };

  const mad = {
    cd: {
      clrad: intArray([1000000]),
      flipy: intArray([0]),
      msquash: intArray([100]),
    },
    cn: 0,
    im: 0,
  };

  r.play(contO, mad, 0, 299);

  assert.strictEqual(contO.x, 12345);
  assert.strictEqual(contO.y, -67890);
  assert.strictEqual(contO.z, 999999);

  r.playh(contO, mad, 0, 0, 0);

  assert.strictEqual(r.lastfr, 0);
});
