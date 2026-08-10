// Java numeric + library semantics for the transpiled game code.
//
// The three hazards from PORT_SPEC, made explicit:
//   idiv() - Java int division truncates toward zero; JS `/` yields a float.
//   i32()  - Java int wraps at 32 bits; JS numbers are doubles.
//   fr()   - Java float is 32-bit; JS has only doubles, so physics drifts
//            silently without rounding at each step.
//
// Field arrays are declared as Int32Array / Float32Array wherever the Java
// declared int[] / float[]. That buys wrapping and float32 rounding on every
// store for free, and is the reason most transpiled code needs no explicit
// call to these helpers.

/** Java `(int)` cast of an already-int expression, or wrap after arithmetic. */
export function i32(x) {
  return x | 0;
}

/** Java int division: truncates toward zero. `-7/2 === -3`. */
export function idiv(a, b) {
  return (a / b) | 0;
}

/**
 * Java `(int)` cast applied to a float/double.
 * Truncates toward zero, maps NaN to 0, and *saturates* at the int32 bounds
 * rather than wrapping — this is the one place `| 0` would be wrong.
 */
export function trunc(x) {
  if (Number.isNaN(x)) return 0;
  if (x >= 2147483647) return 2147483647;
  if (x <= -2147483648) return -2147483648;
  return Math.trunc(x);
}

/** Java 32-bit float rounding. */
export const fr = Math.fround;

/** Java `Math.round(float)` -> int: floor(x + 0.5). */
export function jround(x) {
  return Math.floor(x + 0.5) | 0;
}

/** Allocate the Java `new int[n]` — zero-filled, wrapping on store. */
export function intArray(n) {
  return new Int32Array(n);
}

/** Allocate the Java `new float[n]` — zero-filled, float32 on store. */
export function floatArray(n) {
  return new Float32Array(n);
}

/** Java `new T[n]` for object arrays, null-filled. */
export function objArray(n) {
  return new Array(n).fill(null);
}

// --- Deterministic PRNG -----------------------------------------------------
//
// Replaces Math.random(). Seeded so a run is reproducible, which is what makes
// the spot-check tests meaningful and leaves the door open to a full
// differential harness later.

// TWO streams, and the split is a hard requirement for lockstep netplay.
// Drawing consumes randoms (Plane.s() rolls ~30 per face for panel jitter and
// flame shapes; every effect rolls its own geometry), and a client draws a
// variable number of interpolated frames per tick depending on its refresh
// rate and load. Sharing one stream therefore advances the sequence a
// different number of times on each machine, and the next SIM call reads a
// different value -- a desync caused purely by one player's monitor.
//
// The sim stream is advanced only by simulation code, so it stays in step
// across clients as long as the ticks and inputs do. The draw stream drifts
// freely and affects nothing but pixels.
let _seed = 0x2545f491;
let _drawSeed = 0x9e3779b9;
let _drawPhase = false;

export function setSeed(s) {
  _seed = s >>> 0 || 1;
  // Deliberately NOT the same value: identical seeds would make the two
  // streams return identical sequences, and a stream-crossing bug would then
  // be invisible until the counts diverged.
  _drawSeed = (_seed ^ 0x9e3779b9) >>> 0 || 1;
}

/**
 * Mark the draw phase. Everything reached from GameSparker.draw() -- which is
 * where the interpolated redraw lives -- must run inside it.
 */
export function setDrawPhase(on) {
  _drawPhase = on;
}

export function inDrawPhase() {
  return _drawPhase;
}

/** Uniform in [0,1), matching the contract of java.lang.Math.random(). */
export function random() {
  // xorshift32
  let x = _drawPhase ? _drawSeed : _seed;
  x ^= x << 13; x >>>= 0;
  x ^= x >>> 17;
  x ^= x << 5;  x >>>= 0;
  if (_drawPhase) _drawSeed = x; else _seed = x;
  return x / 4294967296;
}

// --- java.util.Random -------------------------------------------------------
//
// Medium.newpolys/newclouds/newmountains seed a java.util.Random from the
// stage's `mountains(N)` value so terrain is identical every load. That means
// the LCG has to match the JDK bit for bit, not merely "be random".
//
// The 48-bit state is held as a BigInt: the multiply overflows 2^53, so plain
// numbers silently lose low bits — which is precisely the part next() keeps.

const MULT = 0x5deece66dn;
const ADDEND = 0xbn;
const MASK = (1n << 48n) - 1n;

export class JavaRandom {
  constructor(seed) {
    this.setSeed(seed);
  }

  setSeed(seed) {
    this.seed = (BigInt(seed) ^ MULT) & MASK;
  }

  /** Returns the top `bits` bits of the next state, as a signed int. */
  next(bits) {
    this.seed = (this.seed * MULT + ADDEND) & MASK;
    return Number(BigInt.asIntN(32, this.seed >> BigInt(48 - bits)));
  }

  nextInt(bound) {
    if (bound === undefined) return this.next(32);
    if ((bound & -bound) === bound) {
      return Number((BigInt(bound) * BigInt(this.next(31))) >> 31n);
    }
    let bits, val;
    do {
      bits = this.next(31);
      val = bits % bound;
    } while (bits - val + (bound - 1) < 0);
    return val;
  }

  nextDouble() {
    return (this.next(26) * 134217728 + this.next(27)) / 9007199254740992;
  }

  nextFloat() {
    return fr(this.next(24) / (1 << 24));
  }

  nextBoolean() {
    return this.next(1) !== 0;
  }
}

// --- java.awt.Color ---------------------------------------------------------

/**
 * java.awt.Color.RGBtoHSB. Writes h,s,b into `out` (a Float32Array of 3) and
 * returns it. Transcribed from the JDK implementation, which the renderer's
 * per-face lighting depends on exactly.
 */
export function RGBtoHSB(r, g, b, out) {
  let hue, saturation, brightness;
  let cmax = r > g ? r : g;
  if (b > cmax) cmax = b;
  let cmin = r < g ? r : g;
  if (b < cmin) cmin = b;

  brightness = cmax / 255.0;
  saturation = cmax !== 0 ? (cmax - cmin) / cmax : 0.0;

  if (saturation === 0) {
    hue = 0;
  } else {
    const redc = (cmax - r) / (cmax - cmin);
    const greenc = (cmax - g) / (cmax - cmin);
    const bluec = (cmax - b) / (cmax - cmin);
    if (r === cmax) hue = bluec - greenc;
    else if (g === cmax) hue = 2.0 + redc - bluec;
    else hue = 4.0 + greenc - redc;
    hue = hue / 6.0;
    if (hue < 0) hue = hue + 1.0;
  }

  out[0] = hue;
  out[1] = saturation;
  out[2] = brightness;
  return out;
}

/**
 * java.awt.Color.getHSBtoRGB. Returns a packed 0xRRGGBB int (the alpha byte of
 * the JDK's return value is dropped; no call site here reads it).
 */
export function HSBtoRGB(hue, saturation, brightness) {
  let r = 0, g = 0, b = 0;
  if (saturation === 0) {
    r = g = b = (brightness * 255.0 + 0.5) | 0;
  } else {
    const h = (hue - Math.floor(hue)) * 6.0;
    const f = h - Math.floor(h);
    const p = brightness * (1.0 - saturation);
    const q = brightness * (1.0 - saturation * f);
    const t = brightness * (1.0 - saturation * (1.0 - f));
    switch (h | 0) {
      case 0: r = (brightness * 255.0 + 0.5) | 0; g = (t * 255.0 + 0.5) | 0; b = (p * 255.0 + 0.5) | 0; break;
      case 1: r = (q * 255.0 + 0.5) | 0; g = (brightness * 255.0 + 0.5) | 0; b = (p * 255.0 + 0.5) | 0; break;
      case 2: r = (p * 255.0 + 0.5) | 0; g = (brightness * 255.0 + 0.5) | 0; b = (t * 255.0 + 0.5) | 0; break;
      case 3: r = (p * 255.0 + 0.5) | 0; g = (q * 255.0 + 0.5) | 0; b = (brightness * 255.0 + 0.5) | 0; break;
      case 4: r = (t * 255.0 + 0.5) | 0; g = (p * 255.0 + 0.5) | 0; b = (brightness * 255.0 + 0.5) | 0; break;
      case 5: r = (brightness * 255.0 + 0.5) | 0; g = (p * 255.0 + 0.5) | 0; b = (q * 255.0 + 0.5) | 0; break;
    }
  }
  return (r << 16) | (g << 8) | b;
}
