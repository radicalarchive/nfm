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

let _seed = 0x2545f491;

export function setSeed(s) {
  _seed = s >>> 0 || 1;
}

/** Uniform in [0,1), matching the contract of java.lang.Math.random(). */
export function random() {
  // xorshift32
  let x = _seed;
  x ^= x << 13; x >>>= 0;
  x ^= x >>> 17;
  x ^= x << 5;  x >>>= 0;
  _seed = x;
  return x / 4294967296;
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
