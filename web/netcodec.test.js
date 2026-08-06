import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  FLAGS, NUMS, CAR_BYTES, captureCar, applyCar, encodePacket, decodePacket,
  MSG_STATE,
} from './netcodec.js';
import { fakeCar } from './netfixture.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const UDP = join(HERE, '..', 'decompilation', 'java-src', 'UDPMistro.java');

/** The body of one Java method, from its signature to the next one. */
function methodBody(src, sig) {
  const at = src.indexOf(sig);
  assert.ok(at > 0, `${sig} not found — did UDPMistro.java move?`);
  const rest = src.slice(at + sig.length);
  const end = rest.search(/\n    public \w/);
  return rest.slice(0, end < 0 ? rest.length : end);
}

// ---------------------------------------------------------------------------
// The wire format, checked against the original rather than against itself.
//
// This is the test that matters. Every other test here would pass with the
// field list in the wrong order, or with a field missing — the round trip is
// symmetric, so it agrees with any self-consistent mistake. The only thing
// that can catch a wrong field set is the Java, so these two parse it.
// ---------------------------------------------------------------------------

test('the boolean field set matches setinfo, in order', () => {
  const body = methodBody(readFileSync(UDP, 'utf8'),
    'public void setinfo(final Mad mad, final ContO contO, final Control control,');
  // setinfo appends '1' or '0' per flag, so each flag is one `if (<expr>)` in
  // source order. `b` is the holdit parameter and is the 16th — which is why
  // readinfo asserts a 16-character string for what looks like 15 fields.
  const found = [...body.matchAll(/^\s*if \((control|mad)\.(\w+)\)|^\s*if \((b)\)/gm)]
    .map((m) => (m[3] ? ['holdit', 'holdit'] : [m[1], m[2]]));
  assert.deepStrictEqual(found, FLAGS,
    'FLAGS must match setinfo\'s append order exactly — it IS the wire format');
});

test('the numeric field set matches setinfo, in order', () => {
  const body = methodBody(readFileSync(UDP, 'utf8'),
    'public void setinfo(final Mad mad, final ContO contO, final Control control,');
  // One giant StringBuilder chain: .append(",").append(<field>) repeated.
  const chain = body.match(/\.append\(","\)\.append\(.*?\.toString\(\)/s);
  assert.ok(chain, 'setinfo\'s numeric append chain not found');
  // A balanced-paren scan, not a regex: the arguments contain nested parens
  // (`(int)(mad.speed * 100.0f)`) and a lazy regex stops at the first `)`.
  const args = [];
  for (let i = chain[0].indexOf('.append('); i >= 0; i = chain[0].indexOf('.append(', i + 1)) {
    let depth = 1, j = i + '.append('.length;
    for (; j < chain[0].length && depth > 0; j++) {
      if (chain[0][j] === '(') depth++;
      else if (chain[0][j] === ')') depth--;
    }
    const arg = chain[0].slice(i + '.append('.length, j - 1).trim();
    if (arg !== '","' && arg !== '"|"') args.push(arg);
  }

  const described = NUMS.map((d) => {
    if (d.special === 'magperc') return '(int)(n * 100.0f)';
    if (d.special === 'pos') return 'i';
    if (d.scale) return `(int)(${d.on}.${d.f} * ${d.scale}.0f)`;
    return `${d.on}.${d.f}`;
  });
  assert.deepStrictEqual(args, described,
    'NUMS must match setinfo\'s append order and scaling exactly');
});

test('readinfo folds damage back through maxmag, and we do the same', () => {
  const body = methodBody(readFileSync(UDP, 'utf8'),
    'public void readinfo(final Mad mad, final ContO contO, final Control control,');
  assert.match(body, /mad\.hitmag = \(int\)\(this\.getvalue\(s, 0\) \/ 100\.0f \* mad\.cd\.maxmag\[mad\.cn\]\)/,
    'the magperc fold changed in the Java; applyCar must follow it');
  assert.match(body, /mad\.speed = this\.getvalue\(s, 0\) \/ 100\.0f/);
  assert.match(body, /mad\.power = this\.getvalue\(s, 0\) \/ 100\.0f/);
});

// ---------------------------------------------------------------------------
// Ownership
// ---------------------------------------------------------------------------

test('capture -> encode -> decode -> apply reproduces every field', () => {
  const src = fakeCar();
  const rec = captureCar(1, { ...src, holdit: true, pos: 5, magperc: 0.5 });
  const wire = encodePacket(42, [rec]);

  assert.strictEqual(wire[0], MSG_STATE);
  assert.strictEqual(wire.length, 6 + CAR_BYTES);

  const got = decodePacket(wire);
  assert.strictEqual(got.tick, 42);
  assert.strictEqual(got.cars.length, 1);
  assert.strictEqual(got.cars[0].slot, 1);

  const dst = fakeCar({
    mad: { speed: 0, power: 0, mxz: 0, cn: 1, cd: { maxmag: [7600, 4200, 7200] } },
    contO: { x: 0, y: 0, z: 0 },
    control: { left: false, up: false, handb: false },
  });
  applyCar(got.cars[0], dst);

  for (const [on, f] of FLAGS) {
    if (on === 'holdit') continue;         // not a field on any live object
    assert.strictEqual(dst[on][f], src[on][f], `flag ${on}.${f} did not survive`);
  }
  assert.strictEqual(dst.contO.x, -41234, 'a coordinate past 32k must survive');
  assert.strictEqual(dst.contO.z, 82777);
  assert.strictEqual(dst.mad.mxz, 91);
  assert.strictEqual(dst.mad.nlaps, 4);
  // Fixed point: hundredths, truncated, as the Java does.
  assert.strictEqual(dst.mad.speed, 12.34);
  assert.strictEqual(dst.mad.power, -3.21);
  assert.strictEqual(got.cars[0].pos, 5, 'checkpoint position rides along');
});

test('damage crosses between cars with different ceilings as a percentage', () => {
  // Sender is car 0 (maxmag 7600) at half damage; receiver holds car 1
  // (maxmag 4200). The original transmits the FRACTION, so the receiver must
  // end up at half of ITS ceiling, not at the sender's absolute magnitude.
  const src = fakeCar({ mad: { cn: 0 } });
  const rec = captureCar(1, { ...src, magperc: 0.5 });
  const got = decodePacket(encodePacket(1, [rec]));

  const dst = fakeCar({ mad: { cn: 1, hitmag: 0 } });
  applyCar(got.cars[0], dst);
  assert.strictEqual(dst.mad.hitmag, 2100, 'half of 4200, not half of 7600');
});

test('a truncated or foreign packet decodes to null rather than half a car', () => {
  const wire = encodePacket(7, [captureCar(1, fakeCar())]);
  assert.strictEqual(decodePacket(wire.slice(0, wire.length - 1)), null,
    'a short read must not yield a partial car');
  assert.strictEqual(decodePacket(new Uint8Array([9, 0, 0, 0, 0, 0, 0, 0, 0])), null,
    'a packet of another type is not a state packet');
});

test('relaying preserves the originating client\'s slot and tick', () => {
  // The host forwards raw bytes rather than re-capturing the car from its own
  // world, so what guest 2 decodes must be byte-identical to what guest 1 sent.
  const wire = encodePacket(77, [captureCar(1, fakeCar())]);
  const got = decodePacket(wire);
  assert.strictEqual(got.tick, 77, 'the sender\'s tick, not the relay\'s');
  assert.strictEqual(got.cars[0].slot, 1, 'the sender\'s slot');
});

