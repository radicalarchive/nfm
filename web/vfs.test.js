// Verifies the zip reader against the real game assets, cross-checked with
// the `unzip` output for the same archives.
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { parseZip, entryText, readLines } from './vfs.js';

const load = (p) => new Uint8Array(readFileSync(new URL(p, import.meta.url)));

test('models.zip decodes to 84 entries totalling 615671 bytes', async () => {
  const zip = await parseZip(load('../data/models.zip'));
  assert.equal(zip.size, 84);
  // loadbase() compares this exact total against 615671 to set its error flag,
  // so it doubles as a checksum on the whole decode.
  let total = 0;
  for (const b of zip.values()) total += b.length;
  assert.equal(total, 615671);
});

test('a decoded .rad model is intact text', async () => {
  const zip = await parseZip(load('../data/models.zip'));
  const rad = entryText(zip.get('hpground.rad'));
  assert.equal(zip.get('hpground.rad').length, 515);
  const lines = readLines(rad);
  assert.equal(lines[0], 'div(7)');
  assert.equal(lines[1], 'disp(70)');
  assert.equal(lines[2], 'disline(3)');
  assert.ok(rad.includes('<track>'));
  assert.ok(rad.includes('p(1400,0,-1100)'));
});

test('images.zip and sounds.zip decode', async () => {
  assert.equal((await parseZip(load('../data/images.zip'))).size, 139);
  assert.equal((await parseZip(load('../data/sounds.zip'))).size, 56);
});

test('readLines matches DataInputStream.readLine splitting', () => {
  assert.deepEqual(readLines('a\nb\nc'), ['a', 'b', 'c']);
  assert.deepEqual(readLines('a\nb\n'), ['a', 'b']);       // no trailing empty
  assert.deepEqual(readLines('a\r\nb\rc'), ['a', 'b', 'c']);
  assert.deepEqual(readLines('a\n\nb'), ['a', '', 'b']);   // blank line kept
});

test('stage 1 parses into the lines the loader expects', async () => {
  const txt = readFileSync(new URL('../stages/1.txt', import.meta.url), 'latin1');
  const lines = readLines(txt).map((l) => l.trim());
  assert.ok(lines.includes('name(The Introductory Stage)'));
  assert.ok(lines.includes('sky(207,232,255)'));
  assert.ok(lines.includes('nlaps(4)'));
  assert.ok(lines.filter((l) => l.startsWith('set(')).length > 10);
});
