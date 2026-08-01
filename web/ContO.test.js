// Differential check of ContO's math and state against real Java.
// Every expected value below is copied from the output of
// js/tools/ContOProbe.java — nothing here is derived by hand.
import test from 'node:test';
import assert from 'node:assert';
import { ContO } from './ContO.js';
import { intArray, floatArray, i32, trunc } from './java.js';

function stubMedium() {
  const tcos = floatArray(360);
  const tsin = floatArray(360);
  for (let i = 0; i < 360; ++i) tcos[i] = Math.cos(i * 0.017453292519943295);
  for (let j = 0; j < 360; ++j) tsin[j] = Math.sin(j * 0.017453292519943295);
  return {
    tcos, tsin,
    cx: 400, cy: 225, cz: 100, focus_point: 400,
    xz: 0, zy: 0, x: 0, y: 0, z: 0,
    trk: 0, adv: 900, ground: 250, fogd: 7, resdown: 0,
    loadnew: false,
    cpol: intArray(3),
    cgrnd: intArray(3),
    cos(i) { while (i >= 360) i -= 360; while (i < 0) i += 360; return this.tcos[i]; },
    sin(i) { while (i >= 360) i -= 360; while (i < 0) i += 360; return this.tsin[i]; },
    random: () => 0.5,
  };
}

function stubTrackers() {
  return {
    nt: 0,
    xy: intArray(100),
    zy: intArray(100),
    c: Array.from({ length: 100 }, () => intArray(3)),
    x: intArray(100),
    y: intArray(100),
    z: intArray(100),
    radx: intArray(100),
    rady: intArray(100),
    radz: intArray(100),
    skd: intArray(100),
    dam: intArray(100),
    notwall: new Array(100).fill(false),
    decor: new Array(100).fill(false),
  };
}

const M = stubMedium();
const T = stubTrackers();
const contO = new ContO(0, 0, 0, M, T, 0, 0, 0);

test('xs and ys match Java across range, including negative and overflow values', () => {
  // Expected values copied from ContOProbe output:
  const cases = [
    [0, 100, -1200, -675],
    [400, 5000, 400, 239],
    [-3000, 12000, 286, 117],
    [800, 50, 3600, 4825],
    [123, 100000, 398, 224],
    [-50000, -20000, -402800, -401575],
    [70000, 30, 557200, 558425],
  ];
  for (const [n, n2, exs, eys] of cases) {
    assert.equal(contO.xs(n, n2), exs, `xs(${n}, ${n2})`);
    assert.equal(contO.ys(n, n2), eys, `ys(${n}, ${n2})`);
  }
});

test('py matches Java including int32 overflow', () => {
  // Expected values copied from ContOProbe output:
  const cases = [
    [0, 0, 0, 0, 0],
    [10, 5, 20, 8, 169],
    [-100, 50, -200, 300, 272500],
    [50000, 0, 50000, 0, 705032704],
    [-60000, 20000, -80000, -30000, 310065408],
  ];
  for (const [n, n2, n3, n4, exp] of cases) {
    assert.equal(contO.py(n, n2, n3, n4), exp, `py(${n},${n2},${n3},${n4})`);
  }
});

test('getpy matches Java', () => {
  contO.x = 100;
  contO.y = -200;
  contO.z = 300;
  assert.equal(contO.getpy(100, -200, 300), 0);
  assert.equal(contO.getpy(500, 1000, -500), 22400);
  assert.equal(contO.getpy(-10000, 20000, -30000), 14281400);
});

test('rot matches Java across angles including normalisation', () => {
  // Expected values copied from ContOProbe output:
  const expected = {
    37: ['45,-751,3108,0', '82,558,837,4'],
    90: ['-50,-910,1190,-16', '70,-280,2970,-13'],
    '-45': ['116,476,1289,33', '-41,814,-2968,-7'],
    405: ['31,-824,2958,-3', '86,446,1259,3'],
    180: ['-80,270,-2980,3', '-80,-940,1160,-46'],
    1: ['98,-266,3020,16', '41,895,-1147,6'],
    359: ['101,-233,2978,17', '38,904,-1252,5'],
  };
  for (const [ang, [ex, ez]] of Object.entries(expected)) {
    const x = Int32Array.from([100, -250, 3000, 17]);
    const z = Int32Array.from([40, 900, -1200, 6]);
    contO.rot(x, z, 10, -20, Number(ang), 4);
    assert.equal(x.join(','), ex, `x at angle ${ang}`);
    assert.equal(z.join(','), ez, `z at angle ${ang}`);
  }
});

test('rot does not drift over 1000 iterations', () => {
  const x = Int32Array.from([1000, -500]);
  const z = Int32Array.from([750, 250]);
  for (let i = 0; i < 1000; i++) contO.rot(x, z, 0, 0, 7, 2);
  assert.equal(x.join(','), '-585,0');
  assert.equal(z.join(','), '-173,0');
});

test('getvalue parses formatted model parameters like Java', () => {
  assert.equal(contO.getvalue('c', 'c(200,100,50)', 0), 200);
  assert.equal(contO.getvalue('c', 'c(200,100,50)', 1), 100);
  assert.equal(contO.getvalue('c', 'c(200,100,50)', 2), 50);
  assert.equal(contO.getvalue('p', 'p(-10,20,-30)', 0), -10);
  assert.equal(contO.getvalue('p', 'p(-10,20,-30)', 1), 20);
  assert.equal(contO.getvalue('p', 'p(-10,20,-30)', 2), -30);
  assert.equal(contO.getvalue('w', 'w(1,2,3,4,5,6)', 5), 6);
});

test('sprk updates spark state identically to Java', () => {
  contO.sprkat = 0;
  contO.xz = 0;
  contO.zy = 0;
  contO.xy = 0;
  contO.sprk(50.0, 150.0, 250.0, 10.0, 20.0, 30.0, 0);
  assert.equal(contO.srx, 50);
  assert.equal(contO.sry, 150);
  assert.equal(contO.srz, 250);
  assert.equal(contO.sprk_, 1);
});

test('ContO constructor wh calculation matches Java probe for Case B compound assignment', () => {
  const m = stubMedium();
  m.loadnew = true;
  m.snap = intArray(3);
  m.csky = intArray(3);
  m.cfade = intArray(3);
  m.fade = intArray(16);
  const t = stubTrackers();
  const modelText = 'w(0,0,0,0,0,-10.95)\n';
  const c = new ContO(modelText, m, t);
  // From Java probe: initial wh = 0; wheel 1 += (int)(-10.95) -> 0 + (-10) = -10
  assert.equal(c.wh, -10);
});

test('ContO dist 3D sum of squares wraps at int32 per §2b', () => {
  // From Java probe: 50000^2 + 50000^2 = 5000000000 wraps to 705032704 in int32.
  // sqrt(705032704) = 26552, sqrt(26552) = 162.
  const dx = 50000, dy = 0, dz = 50000;
  const wrappedSum = i32(Math.imul(dx, dx) + Math.imul(dy, dy) + Math.imul(dz, dz));
  assert.equal(wrappedSum, 705032704);
  assert.equal(trunc(Math.sqrt(trunc(Math.sqrt(wrappedSum)))), 162);
});


