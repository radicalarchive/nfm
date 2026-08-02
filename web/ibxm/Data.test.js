// Differential test for ibxm/Data against the real Java class.
//
// Every expected value below was printed by `tools.DataProbe`, which drives
// the REAL ibxm.Data out of java/Game.jar by reflection over the same bytes:
//   javac -cp <jar_dir> -d /tmp/probe tools/DataProbe.java
//   java -cp /tmp/probe:<jar_dir> tools.DataProbe
//
// Strings are asserted as CODE POINTS. The probe's first version printed them
// as text, and the literals came back into this file as UTF-8 for a different
// character -- a Cp850 high byte does not survive a terminal plus an editor.
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { parseZip } from '../vfs.js';
import { Data } from './Data.js';

// Through the repo's own zip reader, the same way the game will load it --
// not a shell-out to `unzip`, which needs the binary and assumes the cwd.
const R = new URL('../../', import.meta.url);
const zip = await parseZip(new Uint8Array(readFileSync(new URL('music/stage1.zip', R))));
const modBytes = zip.get('stage1.mod');
const OFFSETS = [0, 10, 100, 1000, 5000, 10000, modBytes.length - 10];

const codes = (s) => Array.from(s, (c) => c.charCodeAt(0));

test('scalar readers match the Java exactly', () => {
  const data = new Data(modBytes);

  const sByteExpected = [83, 0, 0, 0, 0, 0, -126];
  OFFSETS.forEach((off, i) => assert.strictEqual(data.sByte(off), sByteExpected[i]));

  const uByteExpected = [83, 0, 0, 0, 0, 0, 130];
  OFFSETS.forEach((off, i) => assert.strictEqual(data.uByte(off), uByteExpected[i]));

  const ubeShortExpected = [21364, 0, 0, 0, 214, 0, 33410];
  OFFSETS.forEach((off, i) => assert.strictEqual(data.ubeShort(off), ubeShortExpected[i]));

  const uleShortExpected = [29779, 0, 0, 0, 54784, 0, 33410];
  OFFSETS.forEach((off, i) => assert.strictEqual(data.uleShort(off), uleShortExpected[i]));

  // Note uleInt masks the top byte with 0x7F, not 0xFF -- the Java does that,
  // so the port does too (spec §3).
  const uleIntExpected = [1734440019, 0, 520814592, 0, 5297664, 0, 42107522];
  OFFSETS.forEach((off, i) => assert.strictEqual(data.uleInt(off), uleIntExpected[i]));
});

test('strLatin1 matches the Java exactly', () => {
  const data = new Data(modBytes);
  const expected = [
    [83, 116, 97, 103, 101, 49, 32, 32],
    [32, 32, 32, 32, 32, 32, 32, 32],
    [32, 32, 32, 32, 32, 32, 32, 32],
    [32, 32, 32, 32, 32, 32, 32, 32],
    [32, 214, 80, 32, 32, 32, 32, 32],
    [32, 32, 32, 32, 32, 208, 32, 32],
    [130, 130, 130, 130, 130, 130, 130, 130],
  ];
  OFFSETS.forEach((off, i) =>
    assert.deepStrictEqual(codes(data.strLatin1(off, 8)), expected[i]));
});

test('strCp850 matches the Java exactly', () => {
  // Node's TextDecoder has no 'Cp850' label, so Data.js carries the table the
  // JVM itself printed. The Java only falls back to Latin-1 when the charset
  // is genuinely missing, which on a normal JVM never happens -- taking that
  // fallback here would be a divergence, not a port of it. Byte 0xD6 -> 205
  // and 0x82 -> 233 below are exactly where Latin-1 and Cp850 differ, so this
  // fails if anyone reinstates the fallback.
  const data = new Data(modBytes);
  const expected = [
    [83, 116, 97, 103, 101, 49, 32, 32],
    [32, 32, 32, 32, 32, 32, 32, 32],
    [32, 32, 32, 32, 32, 32, 32, 32],
    [32, 32, 32, 32, 32, 32, 32, 32],
    [32, 205, 80, 32, 32, 32, 32, 32],
    [32, 32, 32, 32, 32, 240, 32, 32],
    [233, 233, 233, 233, 233, 233, 233, 233],
  ];
  OFFSETS.forEach((off, i) =>
    assert.deepStrictEqual(codes(data.strCp850(off, 8)), expected[i]));
});

test('sample decoders match the Java exactly', () => {
  const data = new Data(modBytes);

  const samS8Expected = [
    [21248, 29696, 24832, 26368],
    [0, 0, 0, 0],
    [0, 0, 2816, 7936],
    [0, 0, 0, 0],
    [0, -10752, 20480, 0],
    [0, 0, 0, 0],
    [-32256, -32256, -32256, -32256],
  ];
  OFFSETS.forEach((off, i) =>
    assert.deepStrictEqual(Array.from(data.samS8(off, 4)), samS8Expected[i]));

  const samS8DExpected = [
    [21248, -14592, 10240, -28928],
    [0, 0, 0, 0],
    [0, 0, 2816, 10752],
    [0, 0, 0, 0],
    [0, -10752, 9728, 9728],
    [0, 0, 0, 0],
    [-32256, 1024, -31232, 2048],
  ];
  OFFSETS.forEach((off, i) =>
    assert.deepStrictEqual(Array.from(data.samS8D(off, 4)), samS8DExpected[i]));

  const samU8Expected = [
    [-11520, -3072, -7936, -6400],
    [-32768, -32768, -32768, -32768],
    [-32768, -32768, -29952, -24832],
    [-32768, -32768, -32768, -32768],
    [-32768, 22016, -12288, -32768],
    [-32768, -32768, -32768, -32768],
    [512, 512, 512, 512],
  ];
  OFFSETS.forEach((off, i) =>
    assert.deepStrictEqual(Array.from(data.samU8(off, 4)), samU8Expected[i]));

  const samS16Expected = [
    [29779, 26465, 12645, 0],
    [0, 0, 0, 0],
    [0, 7947, 7680, 0],
    [0, 0, 0, 0],
    [-10752, 80, 0, 0],
    [0, 0, -12286, 4124],
    [-32126, -32126, -32126, -32126],
  ];
  OFFSETS.forEach((off, i) =>
    assert.deepStrictEqual(Array.from(data.samS16(off, 4)), samS16Expected[i]));

  const samS16DExpected = [
    [29779, -9292, 3353, 3353],
    [0, 0, 0, 0],
    [0, 7947, 15627, 15627],
    [0, 0, 0, 0],
    [-10752, -10672, -10672, -10672],
    [0, 0, -12286, -8162],
    [-32126, 1284, -30842, 2568],
  ];
  OFFSETS.forEach((off, i) =>
    assert.deepStrictEqual(Array.from(data.samS16D(off, 4)), samS16DExpected[i]));

  const samU16Expected = [
    [-2989, -6303, -20123, -32768],
    [-32768, -32768, -32768, -32768],
    [-32768, -24821, -25088, -32768],
    [-32768, -32768, -32768, -32768],
    [22016, -32688, -32768, -32768],
    [-32768, -32768, 20482, -28644],
    [642, 642, 642, 642],
  ];
  OFFSETS.forEach((off, i) =>
    assert.deepStrictEqual(Array.from(data.samU16(off, 4)), samU16Expected[i]));
});

test('a Uint8Array buffer reads identically to a signed one', () => {
  // Java's byte[] is signed and this class depends on it: sByte() returns the
  // raw element, so an unsigned view read 130 where Java reads -126. vfs.js's
  // zip reader hands out Uint8Array, which is exactly what the module loader
  // will pass, so this is the realistic call -- not a hypothetical one.
  // In ibxm that value is a sample's finetune: the symptom would have been a
  // detuned note, with nothing throwing.
  const signed = new Int8Array(modBytes.buffer, modBytes.byteOffset, modBytes.byteLength);
  const a = new Data(modBytes);          // Uint8Array, as vfs.js returns it
  const b = new Data(signed);
  for (const off of OFFSETS) {
    assert.strictEqual(a.sByte(off), b.sByte(off), `sByte disagreed at ${off}`);
    assert.deepStrictEqual(Array.from(a.samS8D(off, 4)), Array.from(b.samS8D(off, 4)));
    assert.deepStrictEqual(Array.from(a.samS16(off, 4)), Array.from(b.samS16(off, 4)));
  }
  assert.strictEqual(a.sByte(modBytes.length - 10), -126, 'signedness lost');
});
