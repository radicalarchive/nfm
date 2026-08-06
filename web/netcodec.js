// The netplay wire format — one car's authoritative state, to bytes and back.
//
// This half is a TRANSCRIPTION, not a design. Which fields are authoritative
// per car and how they are scaled comes from `UDPMistro.setinfo`
// (UDPMistro.java:658) and `readinfo` (:403) in the original game: 16 booleans
// and 20 numbers. It changes when the Java says so and at no other time, which
// is why it is separated from the session rules in `netsession.js` — those
// change whenever the topology does.
//
// Adding a field is safe; dropping one means a car whose state silently drifts
// in a way no round-trip test can see, because a round-trip agrees with any
// self-consistent mistake. `netcodec.test.js` pins the list against the Java
// source itself.

export const MSG_STATE = 3;

/**
 * The boolean half of a car's authoritative state, in `setinfo`'s order.
 *
 * The order is the wire format and must never be reordered — the original
 * packs these as a 16-character string of '0'/'1' and `readinfo` reads them
 * back by index. `holdit` is the pause flag and is the 16th, which is why the
 * original asserts `svalue.length() == 16` for a 15-field-looking record.
 *
 * The first five are the driver's Control; the rest are Mad's contact and
 * destruction flags. All of them are simulation state on the receiving end,
 * NOT presentation: `mtouch`/`wtouch`/`gtouch` drive collision response and
 * `dest` is what checkstat() counts to end a race.
 */
export const FLAGS = [
  ['control', 'left'], ['control', 'right'], ['control', 'up'],
  ['control', 'down'], ['control', 'handb'],
  ['mad', 'newcar'], ['mad', 'mtouch'], ['mad', 'wtouch'], ['mad', 'pushed'],
  ['mad', 'gtouch'], ['mad', 'pl'], ['mad', 'pr'], ['mad', 'pd'],
  ['mad', 'pu'], ['mad', 'dest'],
  ['holdit', 'holdit'],
];

/**
 * The numeric half, in `setinfo`'s order.
 *
 * `scale` is the fixed-point factor the original applies on the way out and
 * undoes on the way in — it transmits ints only, so `speed` and `power` ride
 * as hundredths. `magperc` is stranger: it goes out as a fraction of the car's
 * own max damage and `readinfo` multiplies it back by `maxmag[cn]`, so two
 * players in different cars exchange damage as a PERCENTAGE. That is
 * deliberate in the original and is kept: it is what lets a car whose damage
 * ceiling differs still show the right bar.
 */
export const NUMS = [
  { on: 'contO', f: 'x' },      { on: 'contO', f: 'y' },
  { on: 'contO', f: 'z' },      { on: 'contO', f: 'xz' },
  { on: 'contO', f: 'xy' },     { on: 'contO', f: 'zy' },
  { on: 'mad', f: 'speed', scale: 100 },
  { on: 'mad', f: 'power', scale: 100 },
  { on: 'mad', f: 'mxz' },      { on: 'mad', f: 'pzy' },
  { on: 'mad', f: 'pxy' },      { on: 'mad', f: 'txz' },
  { on: 'mad', f: 'loop' },     { on: 'contO', f: 'wxz' },
  { on: 'mad', f: 'pcleared' }, { on: 'mad', f: 'clear' },
  { on: 'mad', f: 'nlaps' },
  // Damage as a percentage of this car's own ceiling; folded back through
  // maxmag on receipt. Handled out of band in readState/readCar.
  { on: 'mad', f: 'magperc', special: 'magperc' },
  // checkPoints.pos[i]. The original transmits it and readinfo never reads it
  // (the receiver recomputes position from checkstat), but it is the one
  // number that makes a remote client's leaderboard agree without waiting a
  // lap, so it is carried and applied here.
  { on: 'pos', f: 'pos', special: 'pos' },
];

/** Bytes per car record: slot(1) + flags(2) + NUMS * int32. */
export const CAR_BYTES = 3 + NUMS.length * 4;

/** Read one car's authoritative state out of the live objects. */
export function captureCar(slot, { mad, contO, control, holdit = false, pos = 0, magperc = 0 }) {
  let flags = 0;
  const src = { mad, contO, control, holdit: { holdit } };
  for (let i = 0; i < FLAGS.length; i++) {
    const [on, f] = FLAGS[i];
    if (src[on] && src[on][f]) flags |= 1 << i;
  }
  const nums = new Int32Array(NUMS.length);
  for (let i = 0; i < NUMS.length; i++) {
    const d = NUMS[i];
    if (d.special === 'magperc') nums[i] = Math.trunc(magperc * 100);
    else if (d.special === 'pos') nums[i] = pos | 0;
    else nums[i] = Math.trunc((d.on === 'mad' ? mad : contO)[d.f] * (d.scale || 1));
  }
  return { slot, flags, nums };
}

/**
 * Fold a received record into the live objects.
 *
 * Straight assignment, as `readinfo` does — there is no smoothing here on
 * purpose. Interpolating a correction is a presentation choice and belongs
 * above this layer; doing it here would mean the simulation and the wire
 * disagree about where a car is, which is the bug state sync exists to avoid.
 */
export function applyCar(rec, { mad, contO, control }) {
  const dst = { mad, contO, control, holdit: {} };
  for (let i = 0; i < FLAGS.length; i++) {
    const [on, f] = FLAGS[i];
    if (dst[on]) dst[on][f] = (rec.flags & (1 << i)) !== 0;
  }
  for (let i = 0; i < NUMS.length; i++) {
    const d = NUMS[i];
    const v = rec.nums[i];
    if (d.special === 'magperc') {
      // The original's own folding: a fraction of the sender's ceiling becomes
      // an absolute magnitude against the RECEIVER's copy of the same car.
      mad.hitmag = Math.trunc(v / 100 * mad.cd.maxmag[mad.cn]);
    } else if (d.special === 'pos') {
      rec.pos = v;
    } else if (d.scale) {
      (d.on === 'mad' ? mad : contO)[d.f] = v / d.scale;
    } else {
      (d.on === 'mad' ? mad : contO)[d.f] = v;
    }
  }
}

/**
 * Pack a tick's worth of car records.
 *
 * One packet carries the current tick only. Unlike an INPUT protocol, a lost
 * packet needs no healing and no retransmission: absolute state is
 * self-superseding, so the next packet replaces this one entirely and a resend
 * would only deliver stale data late.
 */
export function encodePacket(tick, records) {
  const buf = new Uint8Array(6 + records.length * CAR_BYTES);
  const view = new DataView(buf.buffer);
  buf[0] = MSG_STATE;
  buf[1] = records.length;
  view.setUint32(2, tick, true);
  let at = 6;
  for (const rec of records) {
    buf[at] = rec.slot;
    view.setUint16(at + 1, rec.flags, true);
    for (let i = 0; i < NUMS.length; i++) {
      view.setInt32(at + 3 + i * 4, rec.nums[i], true);
    }
    at += CAR_BYTES;
  }
  return buf;
}

/**
 * Unpack a state packet.
 *
 * @returns {{tick:number, cars:Array}|null} null for anything that is not a
 *   well-formed state packet, including a short read — a partial car record is
 *   never returned, since half-applied state is worse than none.
 */
export function decodePacket(bytes) {
  const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (buf.length < 6 || buf[0] !== MSG_STATE) return null;
  const count = buf[1];
  if (buf.length !== 6 + count * CAR_BYTES) return null;
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const tick = view.getUint32(2, true);
  const cars = [];
  let at = 6;
  for (let c = 0; c < count; c++) {
    const nums = new Int32Array(NUMS.length);
    for (let i = 0; i < NUMS.length; i++) nums[i] = view.getInt32(at + 3 + i * 4, true);
    cars.push({ slot: buf[at], flags: view.getUint16(at + 1, true), nums });
    at += CAR_BYTES;
  }
  return { tick, cars };
}
