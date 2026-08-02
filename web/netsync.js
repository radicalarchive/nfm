// Lockstep input synchronisation — the transport-independent half.
//
// Nothing in this file touches PeerJS, WebRTC or the DOM, which is the point:
// the part of netplay that can be wrong in a subtle, race-losing way is the
// part that decides which tick may run and what input it runs with, and that
// part is a pure function of the packets received. `netpeer.js` carries bytes;
// this decides what they mean.
//
// The model is classic delayed-input lockstep. At tick T a client sends the
// input it wants applied at tick T + DELAY, so by the time T + DELAY comes
// round the packet has had DELAY ticks (~160ms at 3) to arrive. A tick runs
// only when every player's input for it is known. There is no prediction and
// no rollback, so both machines execute an identical sequence of ticks with
// identical inputs and -- given the determinism work in java.js and trig.js --
// identical results.

/** Ticks between deciding an input and applying it. 3 ≈ 160ms at 18.9Hz. */
export const DEFAULT_DELAY = 3;

/**
 * How many past ticks ride along in every packet.
 *
 * The data channel is unreliable and unordered, so a dropped packet must heal
 * itself: each one repeats the last REDUNDANCY ticks of input, and a gap
 * shorter than that is filled by the next packet to arrive. This is why the
 * channel does not need retransmission -- at 2 bytes per tick, resending eight
 * of them costs less than a TCP ack would.
 */
export const REDUNDANCY = 8;

export const MSG_INPUT = 1;
export const MSG_CHECK = 2;

/**
 * A cheap hash of everything the two clients must agree on.
 *
 * Lockstep gives no feedback by itself: two clients that have silently
 * diverged keep exchanging inputs happily forever, each rendering a different
 * race. Exchanging this every so often turns that into a report. It is FNV-1a
 * over the integer car state, which is exact -- floats are truncated on
 * purpose, since a hash that includes a float would also flag differences too
 * small to matter and there are none of those to find here.
 */
export function worldHash(array2, array3, nplayers) {
  let h = 0x811c9dc5;
  const mix = (v) => {
    h ^= v | 0;
    h = Math.imul(h, 0x01000193) >>> 0;
  };
  for (let i = 0; i < nplayers; i++) {
    const o = array2[i], m = array3[i];
    if (!o || !m) continue;
    mix(o.x); mix(o.y); mix(o.z);
    mix(o.xz); mix(o.xy); mix(o.zy);
    mix(m.speed * 100); mix(m.power * 100); mix(m.hitmag); mix(m.nlaps);
  }
  return h >>> 0;
}

/** Pack a tick's world hash for transmission. */
export function encodeCheck(tick, hash) {
  const buf = new Uint8Array(9);
  const view = new DataView(buf.buffer);
  buf[0] = MSG_CHECK;
  view.setUint32(1, tick, true);
  view.setUint32(5, hash, true);
  return buf;
}

/** @returns {{tick:number, hash:number}|null} */
export function decodeCheck(bytes) {
  const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (buf.length !== 9 || buf[0] !== MSG_CHECK) return null;
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  return { tick: view.getUint32(1, true), hash: view.getUint32(5, true) };
}

// Bit positions for the boolean half of a Control. Order is arbitrary but
// frozen: both ends must agree, and a mismatch shows up as a car that steers
// when the other player brakes.
const BITS = ['up', 'down', 'left', 'right', 'handb', 'enter', 'exit'];

/**
 * A Control's input state as two bytes: seven booleans and a quantised steer.
 *
 * `steer` is the analog touch axis, a float in [-1,1]. It is quantised to a
 * signed byte HERE, and the quantised value is what both ends simulate -- the
 * sender must apply exactly what it transmits, or the host runs a marginally
 * different steering angle from the guest and the cars drift apart. That is
 * the classic lockstep trap: it is not the packet that has to be identical,
 * it is the input the simulation sees.
 */
export function packInput(u) {
  let bits = 0;
  for (let i = 0; i < BITS.length; i++) if (u[BITS[i]]) bits |= 1 << i;
  if (u.lookback) bits |= 1 << 7;
  let steer = Math.round((u.steer || 0) * 127);
  if (steer > 127) steer = 127;
  if (steer < -127) steer = -127;
  return [bits, steer];
}

/** Apply a packed input to a Control. Inverse of packInput. */
export function applyInput(u, packed) {
  const [bits, steer] = packed;
  for (let i = 0; i < BITS.length; i++) u[BITS[i]] = (bits & (1 << i)) !== 0;
  u.lookback = (bits & (1 << 7)) !== 0 ? 1 : 0;
  u.steer = steer / 127;
}

/** The input a player is assumed to have held when nothing is known yet. */
export function neutralInput() {
  return [0, 0];
}

/**
 * Per-player input timelines plus the rule for when a tick may run.
 *
 * Ticks are absolute and start at 0 on both machines: the race begins when
 * both peers have exchanged their start message, so tick N means the same
 * moment to both of them without any clock synchronisation.
 */
export class InputSync {
  /**
   * @param localIndex  this client's player slot (host 0, guest 1)
   * @param peers       every slot driven by a human, including localIndex
   */
  constructor(localIndex, peers, delay = DEFAULT_DELAY) {
    this.localIndex = localIndex;
    this.peers = peers.slice().sort((a, b) => a - b);
    this.delay = delay;
    // slot -> Map<tick, [bits, steer]>. A Map rather than a ring because a
    // stall must not silently overwrite input that has not been consumed yet;
    // memory is 2 bytes a tick and a race is a few thousand ticks.
    this.timeline = new Map(this.peers.map((p) => [p, new Map()]));
    // The first `delay` ticks have no decided input on either side, so seed
    // them neutral -- otherwise both clients wait for packets that by
    // definition were never sent, and the race never starts.
    for (const p of this.peers) {
      for (let t = 0; t < delay; t++) this.timeline.get(p).set(t, neutralInput());
    }
    this.lastSent = -1;
  }

  /** Record the local player's input for the tick it will apply to. */
  setLocal(tick, packed) {
    this.timeline.get(this.localIndex).set(tick, packed);
  }

  /** True when every human's input for `tick` is known. */
  ready(tick) {
    for (const p of this.peers) if (!this.timeline.get(p).has(tick)) return false;
    return true;
  }

  /** Which slots are still missing input for `tick`. For diagnostics. */
  missing(tick) {
    return this.peers.filter((p) => !this.timeline.get(p).has(tick));
  }

  get(slot, tick) {
    return this.timeline.get(slot).get(tick) || neutralInput();
  }

  /**
   * Build the packet to send after deciding input for `tick`.
   *
   * Carries this tick and the REDUNDANCY-1 before it, so any single gap in
   * delivery is covered by the packets that follow.
   */
  encode(tick) {
    const first = Math.max(0, tick - REDUNDANCY + 1);
    const count = tick - first + 1;
    const buf = new Uint8Array(6 + count * 2);
    const view = new DataView(buf.buffer);
    buf[0] = MSG_INPUT;
    buf[1] = this.localIndex;
    view.setUint32(2, first, true);
    const mine = this.timeline.get(this.localIndex);
    for (let i = 0; i < count; i++) {
      const p = mine.get(first + i) || neutralInput();
      buf[6 + i * 2] = p[0];
      // A signed byte through a Uint8Array: & 0xff on the way out, sign back
      // on the way in. Skipping this turns a left turn into a hard right.
      buf[6 + i * 2 + 1] = p[1] & 0xff;
    }
    return buf;
  }

  /**
   * Absorb a peer's packet. Late duplicates are ignored rather than applied:
   * an unordered channel WILL deliver an older redundant copy after a newer
   * one, and overwriting would rewind an input the sim has already run.
   *
   * @returns the highest tick now known for that peer, or -1 if not an input
   *   packet or if it came from our own slot (loopback).
   */
  decode(bytes) {
    const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    if (buf.length < 6 || buf[0] !== MSG_INPUT) return -1;
    const slot = buf[1];
    if (slot === this.localIndex || !this.timeline.has(slot)) return -1;
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const first = view.getUint32(2, true);
    const count = (buf.length - 6) >> 1;
    const line = this.timeline.get(slot);
    let highest = -1;
    for (let i = 0; i < count; i++) {
      const tick = first + i;
      if (!line.has(tick)) {
        const raw = buf[6 + i * 2 + 1];
        line.set(tick, [buf[6 + i * 2], raw > 127 ? raw - 256 : raw]);
      }
      if (tick > highest) highest = tick;
    }
    return highest;
  }

  /** Drop timeline entries the simulation can no longer need. */
  forget(beforeTick) {
    for (const line of this.timeline.values()) {
      for (const t of line.keys()) if (t < beforeTick) line.delete(t);
    }
  }
}
