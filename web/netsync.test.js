// The lockstep rules, tested without a network.
//
// Every failure mode here is one that would otherwise present as "the cars
// desynced sometimes", which is close to undebuggable once a real connection
// is in the loop.
import test from 'node:test';
import assert from 'node:assert';
import { InputSync, packInput, applyInput, neutralInput, REDUNDANCY, DEFAULT_DELAY } from './netsync.js';
import { Control } from './Control.js';
import { Medium } from './Medium.js';

const ctrl = () => new Control(new Medium());

test('packing and applying an input round-trips every field', () => {
  const a = ctrl();
  a.up = true; a.left = true; a.handb = true; a.lookback = 1; a.steer = -0.5;
  const b = ctrl();
  applyInput(b, packInput(a));
  assert.equal(b.up, true);
  assert.equal(b.left, true);
  assert.equal(b.down, false);
  assert.equal(b.right, false);
  assert.equal(b.handb, true);
  assert.equal(b.lookback, 1);
  // Quantised to a signed byte, so exactness is to 1/127 and no better.
  assert.ok(Math.abs(b.steer - (-0.5)) < 1 / 127);
});

test('the sender simulates the value it transmits, not the one it read', () => {
  // The lockstep trap: quantisation must happen before the local sim sees the
  // input, or the host steers by 0.5 while the guest steers by 63/127 and the
  // cars drift apart with no packet ever being lost.
  const local = ctrl();
  local.steer = 0.5;
  const packed = packInput(local);
  applyInput(local, packed);
  const remote = ctrl();
  applyInput(remote, packed);
  assert.equal(local.steer, remote.steer);
});

test('steer survives the wire as a signed value', () => {
  // A negative steer written into a Uint8Array and read back without sign
  // extension becomes a hard turn the other way.
  const s = new InputSync(0, [0, 1]);
  const other = new InputSync(1, [0, 1]);
  const u = ctrl();
  u.steer = -1;
  s.setLocal(10, packInput(u));
  other.decode(s.encode(10));
  const got = ctrl();
  applyInput(got, other.get(0, 10));
  assert.ok(got.steer < -0.9, `steer came back as ${got.steer}`);
});

test('a tick waits for every human and no one else', () => {
  const s = new InputSync(0, [0, 1], 2);
  // The first `delay` ticks are seeded neutral or the race can never start.
  assert.equal(s.ready(0), true);
  assert.equal(s.ready(1), true);
  assert.equal(s.ready(2), false);

  s.setLocal(2, [1, 0]);
  assert.equal(s.ready(2), false, 'ran a tick without the remote input');
  assert.deepEqual(s.missing(2), [1]);

  const remote = new InputSync(1, [0, 1], 2);
  remote.setLocal(2, [2, 0]);
  s.decode(remote.encode(2));
  assert.equal(s.ready(2), true);
  assert.deepEqual(s.missing(2), []);
});

test('a dropped packet heals from the next one', () => {
  const local = new InputSync(0, [0, 1]);
  const remote = new InputSync(1, [0, 1]);
  const sent = [];
  for (let t = DEFAULT_DELAY; t < DEFAULT_DELAY + 6; t++) {
    local.setLocal(t, [0, 0]);          // our own half of every tick
    remote.setLocal(t, [t & 0xff, 0]);
    sent.push(remote.encode(t));
  }
  // Deliver only the last packet: everything before it was lost.
  local.decode(sent[sent.length - 1]);
  for (let t = DEFAULT_DELAY; t < DEFAULT_DELAY + 6; t++) {
    assert.equal(local.ready(t), true, `tick ${t} never healed`);
    assert.deepEqual(local.get(1, t), [t & 0xff, 0], `tick ${t} healed wrong`);
  }
});

test('a gap longer than the redundancy window does NOT heal', () => {
  // Documents the actual limit rather than assuming it is generous: losing
  // more than REDUNDANCY consecutive packets stalls until a later one covers
  // the gap, which for a gap this size never happens.
  const local = new InputSync(0, [0, 1]);
  const remote = new InputSync(1, [0, 1]);
  for (let t = DEFAULT_DELAY; t < DEFAULT_DELAY + 40; t++) {
    local.setLocal(t, [0, 0]);
    remote.setLocal(t, [1, 0]);
  }
  local.decode(remote.encode(DEFAULT_DELAY + 39));
  assert.equal(local.ready(DEFAULT_DELAY + 39), true);
  const stillMissing = DEFAULT_DELAY + 39 - REDUNDANCY;
  assert.equal(local.ready(stillMissing), false,
    'a gap wider than the redundancy window healed, which it cannot');
});

test('an out-of-order duplicate never rewinds a known input', () => {
  // Unreliable channels reorder. Applying an older redundant copy over a
  // newer one would change an input the simulation has already run, which is
  // a desync that only shows up under packet reordering.
  const local = new InputSync(0, [0, 1]);
  const remote = new InputSync(1, [0, 1]);
  remote.setLocal(5, [0b101, 0]);
  const fresh = remote.encode(5);
  // A stale packet that also covers tick 5, carrying what the peer had then.
  const stale = remote.encode(5);
  stale[6 + (5 - Math.max(0, 5 - REDUNDANCY + 1)) * 2] = 0b010;

  local.decode(fresh);
  assert.deepEqual(local.get(1, 5), [0b101, 0]);
  local.decode(stale);
  assert.deepEqual(local.get(1, 5), [0b101, 0], 'a stale duplicate overwrote a run tick');
});

test('a packet from our own slot is ignored', () => {
  // Loopback or a mis-set index would otherwise let a client satisfy its own
  // wait and run ahead of the peer entirely.
  const s = new InputSync(0, [0, 1]);
  s.setLocal(9, [1, 0]);
  assert.equal(s.decode(s.encode(9)), -1);
  assert.equal(s.ready(9), false);
});

test('forget frees consumed ticks and leaves the live ones', () => {
  const s = new InputSync(0, [0, 1]);
  for (let t = 0; t < 50; t++) s.setLocal(t, [1, 0]);
  s.forget(40);
  assert.equal(s.timeline.get(0).has(39), false);
  assert.equal(s.timeline.get(0).has(40), true);
});

test('a three-player session waits for both remotes', () => {
  const s = new InputSync(1, [0, 1, 2], 1);
  s.setLocal(5, [1, 0]);
  const a = new InputSync(0, [0, 1, 2], 1);
  a.setLocal(5, [1, 0]);
  s.decode(a.encode(5));
  assert.equal(s.ready(5), false, 'ran with only one of two remotes');
  const c = new InputSync(2, [0, 1, 2], 1);
  c.setLocal(5, [1, 0]);
  s.decode(c.encode(5));
  assert.equal(s.ready(5), true);
});

test('the world hash notices a difference the size of one unit', async () => {
  // A desync detector that only fires on large differences is worse than
  // none: it reports success right up until the race is unwatchable.
  const { worldHash, encodeCheck, decodeCheck } = await import('./netsync.js');
  const mk = () => ({
    a: [{ x: 10, y: 20, z: 30, xz: 1, xy: 2, zy: 3 }, { x: 5, y: 5, z: 5, xz: 0, xy: 0, zy: 0 }],
    b: [{ speed: 1.5, power: 50, hitmag: 0, nlaps: 0 }, { speed: 0, power: 50, hitmag: 0, nlaps: 0 }],
  });
  const w1 = mk(), w2 = mk();
  assert.equal(worldHash(w1.a, w1.b, 2), worldHash(w2.a, w2.b, 2));
  w2.a[1].z += 1;
  assert.notEqual(worldHash(w1.a, w1.b, 2), worldHash(w2.a, w2.b, 2), 'one unit of drift went unnoticed');

  const round = decodeCheck(encodeCheck(1234, worldHash(w1.a, w1.b, 2)));
  assert.equal(round.tick, 1234);
  assert.equal(round.hash, worldHash(w1.a, w1.b, 2));
});

test('an input packet is not mistaken for a check packet, or the reverse', async () => {
  const { encodeCheck, decodeCheck } = await import('./netsync.js');
  const s = new InputSync(0, [0, 1]);
  s.setLocal(3, [1, 0]);
  assert.equal(decodeCheck(s.encode(3)), null, 'an input packet parsed as a checksum');
  const other = new InputSync(1, [0, 1]);
  assert.equal(other.decode(encodeCheck(3, 99)), -1, 'a checksum parsed as input');
});
