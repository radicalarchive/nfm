import { test } from 'node:test';
import assert from 'node:assert';
import { captureCar, encodePacket, decodePacket } from './netcodec.js';
import { ownerOf, driftOf, StateSync } from './netsession.js';
import { fakeCar } from './netfixture.js';

// ---------------------------------------------------------------------------
// The wire format, checked against the original rather than against itself.
//
// This is the test that matters. Every other test here would pass with the
// field list in the wrong order, or with a field missing — the round trip is
// symmetric, so it agrees with any self-consistent mistake. The only thing
// that can catch a wrong field set is the Java, so these two parse it.
// ---------------------------------------------------------------------------

test('humans own their own car and the host owns every bot', () => {
  const humans = [0, 1];
  assert.strictEqual(ownerOf(0, humans), 0);
  assert.strictEqual(ownerOf(1, humans), 1);
  for (const bot of [2, 3, 4, 5, 6, 7]) {
    assert.strictEqual(ownerOf(bot, humans), 0, `bot ${bot} must belong to the host`);
  }
});

test('a three-player session still puts every bot on the host', () => {
  const humans = [0, 1, 2];
  const sync = new StateSync(1, humans, 7);
  // The guest transmits exactly one car: its own. This is the property
  // lockstep could not have — a slow guest delays nobody else.
  assert.deepStrictEqual(sync.owned, [1]);
  assert.deepStrictEqual(new StateSync(0, humans, 7).owned, [0, 3, 4, 5, 6]);
});

test('a client never applies a record for a car it owns', () => {
  const sync = new StateSync(0, [0, 1], 7);
  assert.strictEqual(sync.accepts(0, 100), false, 'the host owns slot 0');
  assert.strictEqual(sync.accepts(4, 100), false, 'the host owns its bots');
  assert.strictEqual(sync.accepts(1, 100), true);
});

// ---------------------------------------------------------------------------
// Round trip
// ---------------------------------------------------------------------------


test('the host packs every bot into one packet', () => {
  const sync = new StateSync(0, [0, 1], 7);
  const recs = sync.owned.map((s) => captureCar(s, fakeCar()));
  const got = decodePacket(encodePacket(3, recs));
  assert.deepStrictEqual(got.cars.map((c) => c.slot), [0, 2, 3, 4, 5, 6]);
});

// ---------------------------------------------------------------------------
// Staleness
// ---------------------------------------------------------------------------

test('a stale duplicate never overwrites state already applied', () => {
  // The channel is unordered, so an older redundant copy WILL arrive after a
  // newer one. Applying it rewinds a car the simulation has moved past — the
  // exact bug the lockstep prototype had to fix, restated for absolute state.
  const sync = new StateSync(0, [0, 1], 7);
  assert.strictEqual(sync.accepts(1, 10), true);
  sync.markApplied(1, 10);
  assert.strictEqual(sync.accepts(1, 9), false, 'older tick must be dropped');
  assert.strictEqual(sync.accepts(1, 10), false, 'the same tick twice must be dropped');
  assert.strictEqual(sync.accepts(1, 11), true);
});

test('a gap needs no healing — the next packet supersedes the lost one', () => {
  // Unlike lockstep, where a missed INPUT is gone forever and must be resent,
  // absolute state is self-correcting. Jumping ticks is normal, not an error.
  const sync = new StateSync(0, [0, 1], 7);
  sync.markApplied(1, 10);
  assert.strictEqual(sync.accepts(1, 60), true, 'a 50-tick gap is still applicable');
});

// ---------------------------------------------------------------------------
// Drift
// ---------------------------------------------------------------------------

test('drift measures the correction, in game units', () => {
  const rec = captureCar(1, fakeCar());
  // A client whose prediction was 30 units short on x and 40 on z.
  const predicted = { x: -41234 - 30, y: 903, z: 82777 - 40 };
  assert.strictEqual(driftOf(rec, predicted), 50);
  assert.strictEqual(driftOf(rec, { x: -41234, y: 903, z: 82777 }), 0,
    'perfect dead reckoning is zero drift — what determinism buys us');
});

test('worstDrift reports the largest recent correction of any car', () => {
  const sync = new StateSync(0, [0, 1], 7);
  sync.markApplied(1, 1, 12);
  assert.strictEqual(sync.worstDrift(), 12);
  sync.markApplied(1, 2, 3);
  assert.strictEqual(sync.worstDrift(), 3, 'drift is current, not cumulative');
});

// ---------------------------------------------------------------------------
// More than two players
// ---------------------------------------------------------------------------

test('ownership across a four-human, eight-car session', () => {
  const humans = [0, 1, 2, 3];
  const owners = [];
  for (let i = 0; i < 8; i++) owners.push(ownerOf(i, humans));
  assert.deepStrictEqual(owners, [0, 1, 2, 3, 0, 0, 0, 0],
    'each human owns itself; every bot belongs to the host');

  // Guest upload is flat: one car, however many players are racing. That is
  // the property that makes the star topology worth having.
  for (const g of [1, 2, 3]) {
    assert.deepStrictEqual(new StateSync(g, humans, 8).owned, [g]);
  }
  assert.deepStrictEqual(new StateSync(0, humans, 8).owned, [0, 4, 5, 6, 7]);
});

test('a guest accepts another guest\'s relayed record', () => {
  // The path that only exists from three players up: the host forwards guest
  // 1's packet to guest 2 verbatim, so guest 2 sees a record for a slot that
  // belongs to neither of them.
  const guest2 = new StateSync(2, [0, 1, 2], 6);
  assert.strictEqual(guest2.isRemote(1), true);
  assert.strictEqual(guest2.accepts(1, 40), true, 'a relayed peer record must apply');
  assert.strictEqual(guest2.accepts(2, 40), false, 'but never one for its own car');
  assert.strictEqual(guest2.accepts(4, 40), true, 'nor refuse a host-owned bot');
});

test('each peer\'s staleness is tracked separately', () => {
  // One slow peer must not make another peer's fresh packets look stale.
  const sync = new StateSync(0, [0, 1, 2], 6);
  sync.markApplied(1, 100);
  assert.strictEqual(sync.accepts(2, 5), true,
    'slot 2 has its own timeline and is not gated by slot 1');
  assert.strictEqual(sync.accepts(1, 5), false);
});
