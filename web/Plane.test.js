// Differential check of Plane's numerically risky math against real Java.
// Every expected value below is copied from the output of
// js/tools/PlaneMath.java — nothing here is derived by hand.
import test from 'node:test';
import assert from 'node:assert';
import { Plane } from './Plane.js';
import { intArray, floatArray, trunc, fr, idiv } from './java.js';

/** Medium stub: the real sin/cos tables plus the camera fields Plane reads. */
function stubMedium() {
  const tcos = floatArray(360);
  const tsin = floatArray(360);
  for (let i = 0; i < 360; ++i) tcos[i] = Math.cos(i * 0.017453292519943295);
  for (let j = 0; j < 360; ++j) tsin[j] = Math.sin(j * 0.017453292519943295);
  return {
    tcos, tsin,
    cx: 400, cy: 225, cz: 100, focus_point: 500,
    xz: 0, zy: 0, x: 0, y: 0, z: 0,
    trk: 0, adv: 900, ground: 250, fogd: 7, resdown: 0,
    lightson: false, crs: false, cpflik: false, nochekflk: false,
    lastcheck: false, lastmaf: 0, hit: 0, elecr: 0, nsp: 0,
    iw: 0, ih: 0, w: 800, h: 450,
    snap: intArray(3), csky: intArray(3), cfade: intArray(3),
    crgrnd: intArray(3), fade: intArray(16),
    spx: intArray(1), spz: intArray(1), sprad: intArray(1),
    cos(i) { while (i >= 360) i -= 360; while (i < 0) i += 360; return this.tcos[i]; },
    sin(i) { while (i >= 360) i -= 360; while (i < 0) i += 360; return this.tsin[i]; },
    random: () => 0.5,
  };
}

function makePlane(m, ox, oz, oy) {
  // glass=3 keeps the constructor on the simple colour path.
  return new Plane(m, null, ox, oz, oy, ox.length, intArray(3),
                   3, 0, 0, 0, 0, 0, 7, 0, false, 0, false);
}

const M = stubMedium();
const P = makePlane(M, intArray(4), intArray(4), intArray(4));

test('rot matches Java across angles, including normalisation', () => {
  const expected = {
    37:  ['45,-751,3108,0', '82,558,837,4'],
    90:  ['-50,-910,1190,-16', '70,-280,2970,-13'],
    '-45': ['116,476,1289,33', '-41,814,-2968,-7'],
    405: ['31,-824,2958,-3', '86,446,1259,3'],
    180: ['-80,270,-2980,3', '-80,-940,1160,-46'],
    1:   ['98,-266,3020,16', '41,895,-1147,6'],
    359: ['101,-233,2978,17', '38,904,-1252,5'],
  };
  for (const [ang, [ex, ez]] of Object.entries(expected)) {
    const x = Int32Array.from([100, -250, 3000, 17]);
    const z = Int32Array.from([40, 900, -1200, 6]);
    P.rot(x, z, 10, -20, Number(ang), 4);
    assert.equal(x.join(','), ex, `x at angle ${ang}`);
    assert.equal(z.join(','), ez, `z at angle ${ang}`);
  }
});

test('rot does not drift over 1000 iterations', () => {
  // The float32 rounding in rot() is what this pins. Without fr() the result
  // diverges slowly rather than failing loudly, which is exactly the failure
  // mode PORT_SPEC warns about for physics integrated over frames.
  const x = Int32Array.from([1000, -500]);
  const z = Int32Array.from([750, 250]);
  for (let i = 0; i < 1000; i++) P.rot(x, z, 0, 0, 7, 2);
  assert.equal(x.join(','), '-585,0');
  assert.equal(z.join(','), '-173,0');
});

test('xs / ys projection matches Java, including the int overflow path', () => {
  const cases = [
    [0, 100, -1600, -900],
    [400, 5000, 400, 243],
    [-3000, 12000, 258, 90],
    [800, 50, 2400, 3100],
    [123, 100000, 398, 224],
  ];
  for (const [n, cz, exs, eys] of cases) {
    assert.equal(P.xs(n, cz), exs, `xs(${n},${cz})`);
    assert.equal(P.ys(n, cz), eys, `ys(${n},${cz})`);
  }
});

test('spy matches Java', () => {
  assert.equal(P.spy(0, 0), 400);
  assert.equal(P.spy(9000, 12000), 14763);
  assert.equal(P.spy(-9000, -12000), 15243);
});

test('deltafntyp accumulator matches Java float32 result', () => {
  const p = makePlane(M,
    Int32Array.from([0, 1400, 700, -700]),
    Int32Array.from([-1100, 0, 0, -1100]),
    Int32Array.from([0, 0, 0, 0]));
  assert.equal(p.deltaf, fr(880203.2));
});

test('repeated int fog blend matches Java', () => {
  let red = 177;
  for (let i = 0; i < 5; i++) red = idiv(red * 7 + 198, 8);
  assert.equal(red, 185);
});

test('av distance matches Java, including the negative cube term', () => {
  const av = (n63, n64, n65, gr) => trunc(Math.sqrt(
    Math.imul(M.cy - n63, M.cy - n63) +
    Math.imul(M.cx - n64, M.cx - n64) +
    Math.imul(n65, n65) +
    Math.imul(Math.imul(gr, gr), gr)));
  assert.equal(av(120, 340, 5000, -90), 4928);
  assert.equal(av(120, 340, 5000, 200), 5745);
});
