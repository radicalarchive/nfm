// The .rad text is the model.
//
// Every control in the editor reads its value out of the source and writes it
// back on input -- there is no parallel copy of the car to keep in sync, and no
// Apply step, because there is nothing to apply. The preview re-parses the text
// with the game's own ContO, so what you see is what the race would load.
//
// This replaces the headless bridge that drove the transpiled panes. The panes
// are still the reference for FORMAT -- every writer below emits exactly the
// bytes ctachm's Save emits, and the readers accept exactly what tab2 accepts --
// but the UI no longer inherits the applet's pagination, its Apply/Save pairs,
// or its habit of keeping state in AWT text fields.

const trunc = (v) => (v < 0 ? Math.ceil(v) : Math.floor(v));

/** A directive's comma-separated arguments, as raw strings. */
export function argsOf(line) {
  const a = line.indexOf('(');
  const b = line.lastIndexOf(')');
  if (a < 0 || b < a) return [];
  return line.slice(a + 1, b).split(',').map((s) => s.trim());
}

const num = (s) => {
  const v = Number(String(s).trim());
  return Number.isFinite(v) ? trunc(v) : 0;
};

/** The first line whose trimmed form starts with `name(`. */
export function findLine(text, name) {
  const ls = text.split('\n');
  for (let i = 0; i < ls.length; ++i) {
    if (ls[i].trim().startsWith(name + '(')) return { index: i, line: ls[i].trim() };
  }
  return null;
}

/**
 * Replace a directive in place, or append it.
 *
 * The original's writers rebuild the whole file -- strip every stat( line, then
 * glue `stat(...)` onto the end. That is fine when you press Save once; it is
 * not fine when a slider fires it sixty times a second, because the line you
 * are dragging keeps jumping to the bottom of the textarea under the cursor.
 * In place, so the source stays where you left it.
 */
export function setLine(text, name, replacement, { beforeGeometry = false } = {}) {
  const ls = text.split('\n');
  for (let i = 0; i < ls.length; ++i) {
    if (ls[i].trim().startsWith(name + '(')) {
      ls[i] = replacement;
      // A second copy of the same directive would shadow this one on re-parse.
      for (let j = ls.length - 1; j > i; --j) {
        if (ls[j].trim().startsWith(name + '(')) ls.splice(j, 1);
      }
      return ls.join('\n');
    }
  }
  // Some directives are order-sensitive: ContO applies the scale to each p()
  // AS IT READS IT (ContO.js:212-214), and decides a polygon's colnum against
  // 1stColor/2ndColor when it closes the block. Appending one of those to the
  // end of a car that did not already have it puts it after every point it was
  // supposed to affect, so the control appears to do nothing at all -- which is
  // exactly what the Scale sliders did on the sixteen base cars, none of which
  // carry a ScaleX line.
  if (beforeGeometry) {
    const at = ls.findIndex((l) => {
      const t = l.trim();
      return t.startsWith('<p>') || t.startsWith('w(') || t.startsWith('rims(');
    });
    if (at > 0) {
      ls.splice(at, 0, replacement, '');
      return ls.join('\n');
    }
  }
  return text.replace(/\s*$/, '') + '\n\n' + replacement + '\n';
}

// ---- stats and class --------------------------------------------------------

export const STAT_NAMES = ['Speed', 'Acceleration', 'Stunts', 'Strength', 'Endurance'];
export const CLASS_NAMES = ['Class A', 'Class A & B', 'Class B', 'Class B & C', 'Class C'];
/** checko() accepts a stat total of exactly one of these, and nothing else. */
export const CLASS_TOTALS = [680, 640, 600, 560, 520];
export const STAT_MIN = 16, STAT_MAX = 200;

export const DEFAULT_STATS = [120, 120, 120, 120, 120];

export function readStats(text) {
  const l = findLine(text, 'stat');
  if (!l) return null;
  const a = argsOf(l.line);
  return a.length === 5 ? a.map(num) : null;
}

export function writeStats(text, stat) {
  return setLine(text, 'stat', `stat(${stat.join(',')})`);
}

/**
 * Move one stat, paying for it out of the other four.
 *
 * This is the rule the applet's +/- buttons enforce (ctachm dtab 4): the total
 * never changes, so the car never leaves its class, and no stat escapes
 * [16,200]. The applet only ever moved 4 at a time because that is what one
 * click was worth; a slider can ask for any jump, and the loop below settles it
 * the same way -- one point at a time, round-robin across the others, stopping
 * early if they are all pinned.
 */
export function setStat(stat, i, value) {
  const out = stat.slice();
  let d = Math.max(STAT_MIN, Math.min(STAT_MAX, trunc(value))) - out[i];
  while (d !== 0) {
    let moved = false;
    for (let j = 0; j < out.length && d !== 0; ++j) {
      if (j === i) continue;
      if (d > 0 && out[j] > STAT_MIN) { out[i]++; out[j]--; d--; moved = true; }
      else if (d < 0 && out[j] < STAT_MAX) { out[i]--; out[j]++; d++; moved = true; }
    }
    if (!moved) break;
  }
  return out;
}

export const statTotal = (stat) => stat.reduce((a, b) => a + b, 0);

/** The class index of a stat line, or -1 if its total is not a legal class. */
export function classOf(stat) {
  return CLASS_TOTALS.indexOf(statTotal(stat));
}

/** Re-budget all five stats to a class total, spreading the difference evenly. */
export function setClass(stat, classIndex) {
  const out = stat.slice();
  let d = CLASS_TOTALS[classIndex] - statTotal(out);
  while (d !== 0) {
    let moved = false;
    for (let j = 0; j < out.length && d !== 0; ++j) {
      if (d > 0 && out[j] < STAT_MAX) { out[j]++; d--; moved = true; }
      else if (d < 0 && out[j] > STAT_MIN) { out[j]--; d++; moved = true; }
    }
    if (!moved) break;
  }
  return out;
}

// ---- physics ----------------------------------------------------------------

// pname from CarMaker.java:303. Slot 4 is "Empty" -- the applet reserves it and
// draws nothing there, so neither do we.
export const PHYS_NAMES = [
  'Handbrake', 'Turning Sensitivity', 'Tire Grip', 'Bouncing', 'Empty',
  'Lifts Others', 'Gets Lifted', 'Pushes Others', 'Gets Pushed',
  'Aerial Rotation Speed', 'Aerial Control/Gliding',
];
export const PHYS_SLOTS = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10];
export const CRASH_NAMES = ['Crash Radius', 'Crash Magnitude', 'Roof Destruction'];
export const ENGINE_NAMES = [
  'Normal Engine', 'V8 Engine', 'Retro Engine', 'Power Engine', 'Diesel Engine',
];
// The one-liners the applet prints under the engine menu (CarMaker.java:2068+).
export const ENGINE_NOTES = [
  "Like Tornado Shark, Sword of Justice or Radical One's engine.",
  "High speed engine like Formula 7, Drifter X or Might Eight's engine.",
  'Like Wow Caninaro, Lead Oxide or Kool Kat’s engine.',
  'Turbo/super charged engine like Max Revenge, High Rider or Dr Monstaa’s engine.',
  'Big diesel powered engine for big cars like EL King or  M A S H E E N .',
];

export const DEFAULT_PHYSICS = {
  phys: [50, 50, 50, 50, 0, 0, 0, 0, 0, 50, 50],
  crash: [50, 50, 50],
  engsel: 0,
  // The crash calibration the Fix button computes. 0 means "not measured yet".
  actmag: 0,
};

export function readPhysics(text) {
  const l = findLine(text, 'physics');
  if (!l) return null;
  const a = argsOf(l.line).map(num);
  if (a.length < 15) return null;
  return {
    phys: a.slice(0, 11),
    crash: a.slice(11, 14),
    engsel: Math.max(0, Math.min(4, a[14])),
    actmag: a.length > 15 ? a[15] : 0,
  };
}

export function writePhysics(text, p) {
  const vals = [...p.phys, ...p.crash, p.engsel, p.actmag];
  return setLine(text, 'physics', `physics(${vals.join(',')})`);
}

// ---- colours ----------------------------------------------------------------

export function readColours(text) {
  const read = (name) => {
    const l = findLine(text, name);
    if (!l) return null;
    const a = argsOf(l.line);
    return a.length >= 3 ? a.slice(0, 3).map(num) : null;
  };
  return { first: read('1stColor'), second: read('2ndColor') };
}

/**
 * Recolour the car.
 *
 * Rewriting 1stColor() alone changes nothing you can see: every polygon carries
 * its own c(r,g,b), and the header line only tells the game which of them count
 * as the car's first and second colour. So the recolour is a text substitution
 * over the whole file -- exactly what the applet's Save does -- and the header
 * follows it.
 */
export function writeColour(text, which, rgb) {
  const name = which === 0 ? '1stColor' : '2ndColor';
  const old = readColours(text)[which === 0 ? 'first' : 'second'];
  let out = text;
  if (old) {
    const from = `(${old[0]},${old[1]},${old[2]})`;
    const to = `(${rgb[0]},${rgb[1]},${rgb[2]})`;
    if (from !== to) out = out.split(from).join(to);
  }
  return setLine(out, name, `${name}(${rgb[0]},${rgb[1]},${rgb[2]})`, { beforeGeometry: true });
}

// ---- wheels -----------------------------------------------------------------

// Each side is one gwgr/rims/w/w block. The two w() lines are mirror images:
// the writer emits -X and +X with the width negated on the second, which is how
// the game knows they are a pair rather than two lone wheels.
export const WHEEL_FIELDS = [
  { key: 'x', caption: '±X', hint: 'How far out to the side each wheel sits — half the width between the two. Always a positive number.' },
  { key: 'y', caption: 'Y', hint: 'How high the wheels sit. Lower numbers raise them into the body, higher numbers drop them below it.' },
  { key: 'z', caption: 'Z', hint: 'How far forward or back the pair sits. The front pair needs a positive number, the back pair a negative one.' },
  { key: 'height', caption: 'Height', hint: 'How big the wheels are. Too big and they poke through the bodywork.' },
  { key: 'width', caption: 'Width', hint: 'How fat the tyres are.' },
  { key: 'rimsSize', caption: 'Rims Size', hint: 'How big the rim is inside the tyre.' },
  { key: 'rimsDepth', caption: 'Rims Depth', hint: 'How far back the rim sits from the outside face of the tyre.' },
  { key: 'hide', caption: 'Hide', hint: 'How far the wheel tucks up inside the bodywork. Anything past 40 is treated as 40.' },
];

const DEFAULT_SIDE = () => ({
  x: 40, y: 0, z: 0, height: 20, width: 10,
  rims: [140, 140, 140], rimsSize: 15, rimsDepth: 20, hide: 0,
});

/**
 * Read both axles back out of the source.
 *
 * The sign of Z picks the axle -- not the tag in the fourth argument, which is
 * the animation group and is 0/11 by convention only. This is tab2's own rule
 * (tab2.js:599), and it is why a car with both axles at z=0 reads as having no
 * back wheels at all.
 */
export function readWheels(text) {
  const out = { back: DEFAULT_SIDE(), front: DEFAULT_SIDE(), count: 0 };
  let rims = [140, 140, 140], rimsSize = 15, rimsDepth = 20, hide = 0;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('rims(')) {
      const a = argsOf(line).map(num);
      if (a.length >= 5) { rims = a.slice(0, 3); rimsSize = a[3]; rimsDepth = a[4]; }
    } else if (line.startsWith('gwgr(')) {
      hide = num(argsOf(line)[0]);
    } else if (line.startsWith('w(')) {
      const a = argsOf(line).map(num);
      if (a.length < 6) continue;
      const side = a[2] > 0 ? out.front : out.back;
      side.x = Math.abs(a[0]);
      side.y = a[1];
      side.z = a[2];
      side.width = Math.abs(a[4]);
      side.height = Math.abs(a[5]);
      side.rims = rims.slice();
      side.rimsSize = rimsSize;
      side.rimsDepth = rimsDepth;
      side.hide = hide;
      out.count++;
    }
  }
  return out;
}

/** True when the source has all four wheels, i.e. two per axle. */
export const hasWheels = (w) => w.count === 4;

function sideBlock(s, tag) {
  const rims = `rims(${s.rims[0]},${s.rims[1]},${s.rims[2]},${s.rimsSize},${s.rimsDepth})`;
  return [
    `gwgr(${s.hide})`,
    rims,
    `w(-${s.x},${s.y},${s.z},${tag},${s.width},${s.height})`,
    `w(${s.x},${s.y},${s.z},${tag},-${s.width},${s.height})`,
  ].join('\n');
}

/**
 * Replace the whole wheel definition, in place.
 *
 * All eight lines move together because they are order-dependent: gwgr() and
 * rims() apply to whatever w() lines follow them, so a rims() left stranded
 * above the new block would repaint the wrong axle.
 */
export function writeWheels(text, w) {
  const ls = text.split('\n');
  const isWheelLine = (s) => {
    const t = s.trim();
    return t.startsWith('w(') || t.startsWith('rims(') || t.startsWith('gwgr(');
  };
  const block = sideBlock(w.front, 11) + '\n\n' + sideBlock(w.back, 0);
  const first = ls.findIndex(isWheelLine);
  if (first === -1) return text.replace(/\s*$/, '') + '\n\n' + block + '\n';
  let last = ls.length - 1;
  while (!isWheelLine(ls[last])) --last;
  // The whole span goes, blank lines and all. Dropping only the wheel lines
  // would leave the separator between the two axles behind, and writing the
  // block back would add another -- so every save would grow the file by a
  // line, which is not what "the text is the model" should mean.
  ls.splice(first, last - first + 1, block);
  return ls.join('\n');
}

// ---- scale and alignment ----------------------------------------------------

export const SCALE_AXES = ['ScaleX', 'ScaleY', 'ScaleZ'];

export function readScale(text) {
  return SCALE_AXES.map((n) => {
    const l = findLine(text, n);
    return l ? num(argsOf(l.line)[0]) : 100;
  });
}

export function writeScale(text, scale) {
  let out = text;
  SCALE_AXES.forEach((n, i) => {
    out = setLine(out, n, `${n}(${scale[i]})`, { beforeGeometry: true });
  });
  return out;
}

/**
 * Rewrite every p(x,y,z) through `fn`, leaving anything trailing on the line
 * (the game allows a comment or a modifier after the point) alone.
 */
export function transformPoints(text, fn, range) {
  const ls = text.split('\n');
  let pos = 0;
  const out = ls.map((raw) => {
    const start = pos;
    pos += raw.length + 1;
    const line = raw.trim();
    if (!line.startsWith('p(')) return raw;
    if (range && (start + raw.length < range[0] || start > range[1])) return raw;
    const a = argsOf(line);
    if (a.length < 3) return raw;
    const [x, y, z] = fn(a.slice(0, 3).map(num));
    const close = line.indexOf(')');
    return `p(${x},${y},${z})` + line.slice(close + 1);
  });
  return out.join('\n');
}

// ---- readiness --------------------------------------------------------------

/**
 * Why the car cannot race yet, as a list of one-liners.
 *
 * Same gates checko() applies (files.js:208). It raised them one modal at a
 * time, in order, so you fixed one thing and only then learned about the next;
 * these are all visible at once, which is the whole reason to show them beside
 * the preview rather than behind a button.
 *
 * The wording is for a PLAYER: each line says what to do, and names a tab if
 * there is one to go to.
 */
export function problems(text, o) {
  const out = [];
  const cols = readColours(text);
  if (!cols.first || !cols.second) out.push('Pick a first and a second colour on the Body tab.');
  const w = readWheels(text);
  if (!hasWheels(w)) out.push('The car needs four wheels — set the front and back pairs on the Wheels tab.');
  else if (w.front.z <= 0 || w.back.z >= 0 || w.front.x <= 0 || w.back.x <= 0) {
    out.push('The wheels are the wrong way round: the front pair needs a positive Z, the back pair a negative one, and both need a positive ±X.');
  }
  if (o) {
    if (o.npl <= 60) out.push('There is barely any car here yet — build more of it before racing.');
    if (o.npl > 286) out.push(`The car has too many pieces (${o.npl}). The game allows up to 286 — simplify it a little.`);
    if (o.maxR > 400) out.push(`The car is too big to race. Scale it down by about ${Math.round((o.maxR / 400 - 1) * 100)}% on the Body tab.`);
    if (o.maxR < 120 && o.maxR > 0) out.push(`The car is too small to race. Scale it up by about ${Math.round((120 / o.maxR - 1) * 100)}% on the Body tab.`);
  }
  const stat = readStats(text);
  if (!stat) out.push('The car has no stats yet — set them on the Stats tab.');
  else if (classOf(stat) === -1) {
    out.push(`The stats add up to ${statTotal(stat)}, which is not a class budget. Pick a class on the Stats tab to fix it.`);
  } else if (stat.some((s) => s < STAT_MIN || s > STAT_MAX)) {
    out.push('One of the stats is outside the allowed range of 16 to 200.');
  }
  const p = readPhysics(text);
  if (!p) out.push('The car has no handling set yet — fill in the Physics tab.');
  else if (p.phys.some((v) => v < 0 || v > 100) || p.crash.some((v) => v < 0)) {
    out.push('One of the Physics settings is outside the allowed range of 0 to 100.');
  }
  return out;
}

// The applet's alignment buttons, as point transforms (ctachm.js:535-567).
export const ALIGN = {
  rotateX: ([x, y, z]) => [x, z, -y],
  rotateY: ([x, y, z]) => [-z, y, x],
  rotateZ: ([x, y, z]) => [y, -x, z],
  nudge: (axis, by) => ([x, y, z]) => (
    axis === 0 ? [x + by, y, z] : axis === 1 ? [x, y + by, z] : [x, y, z + by]
  ),
  mirrorX: ([x, y, z]) => [-x, y, z],
};
