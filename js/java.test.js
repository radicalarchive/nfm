// Expected values here are produced by js/tools/JavaSemantics.java, not by
// recollection. Regenerate with:  node --test js/  (after running that file).
import test from 'node:test';
import assert from 'node:assert';
import { idiv, i32, trunc, fr, jround, RGBtoHSB, HSBtoRGB } from './java.js';

test('int division truncates toward zero', () => {
  assert.equal(idiv(7, 2), 3);
  assert.equal(idiv(-7, 2), -3);   // Java: -3, NOT floor's -4
  assert.equal(idiv(7, -2), -3);
  assert.equal(idiv(-7, -2), 3);
  // The Plane.java:165 shape: all-int fog blend.
  assert.equal(idiv(207 * 5000 * 2 + 198 * 3000, 5000 * 2 + 3000), 204);
});

test('int arithmetic wraps at 32 bits', () => {
  assert.equal(i32(2147483647 + 1), -2147483648);
  assert.equal(i32(2147483647 * 2), -2);
  assert.equal(i32(-2147483648 - 1), 2147483647);
});

test('(int) cast of a float truncates toward zero and saturates', () => {
  assert.equal(trunc(3.9), 3);
  assert.equal(trunc(-3.9), -3);
  assert.equal(trunc(NaN), 0);
  assert.equal(trunc(1e18), 2147483647);      // Java saturates, does not wrap
  assert.equal(trunc(-1e18), -2147483648);
});

test('Math.round matches Java floor(x+0.5)', () => {
  assert.equal(jround(2.5), 3);
  assert.equal(jround(-2.5), -2);   // Java: -2
  assert.equal(jround(-2.6), -3);
});

test('float32 rounding is applied', () => {
  assert.equal(fr(0.1), 0.10000000149011612);
  assert.notEqual(fr(0.1), 0.1);
});

test('Int32Array gives int semantics on store', () => {
  const a = new Int32Array(2);
  a[0] = 2147483647;
  a[0] += 1;
  assert.equal(a[0], -2147483648);
});

test('Float32Array gives float semantics on store', () => {
  const a = new Float32Array(1);
  a[0] = 0.1;
  assert.equal(a[0], fr(0.1));
});

test('RGBtoHSB matches java.awt.Color', () => {
  const out = new Float32Array(3);
  // Values from Color.RGBtoHSB in JavaSemantics.java.
  RGBtoHSB(177, 171, 160, out);       // hpground.rad's road colour
  assert.ok(Math.abs(out[0] - 0.10784314) < 1e-6, `h=${out[0]}`);
  assert.ok(Math.abs(out[1] - 0.09604520) < 1e-6, `s=${out[1]}`);
  assert.ok(Math.abs(out[2] - 0.69411767) < 1e-6, `b=${out[2]}`);

  RGBtoHSB(0, 0, 0, out);
  assert.deepEqual([out[0], out[1], out[2]], [0, 0, 0]);

  RGBtoHSB(255, 0, 0, out);
  assert.equal(out[0], 0);
  assert.equal(out[1], 1);
  assert.equal(out[2], 1);
});

test('HSBtoRGB round-trips through RGBtoHSB', () => {
  const out = new Float32Array(3);
  for (const [r, g, b] of [[177, 171, 160], [12, 200, 43], [255, 255, 255], [1, 2, 3]]) {
    RGBtoHSB(r, g, b, out);
    const rgb = HSBtoRGB(out[0], out[1], out[2]);
    assert.deepEqual([(rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255], [r, g, b]);
  }
});
