import test from 'node:test';
import assert from 'node:assert';
import { Medium } from './Medium.js';

test('interpolated random() rolls live values once the tick log is exhausted', () => {
  const m = new Medium();
  m.interpolating = false;
  m.rn = 0;
  m.recording = true;
  const recorded = m.random();
  m.interpolating = true;
  m.rp = 0;
  assert.strictEqual(m.random(), recorded);
  // Plane's embos == 16 branch rejection-samples a second vertex index from
  // here; a replay that cycles a one-entry log returns `recorded` forever.
  const seen = new Set();
  for (let i = 0; i < 200; i++) seen.add(m.random());
  assert.ok(seen.size > 1, `replay stuck on ${[...seen]}`);
  assert.strictEqual(m.rn, 1, 'a redraw must not extend the tick log');
});
