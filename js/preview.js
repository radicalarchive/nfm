// Car and stage previews for the launcher page.
//
// Both are drawn with the game's own renderer rather than with artwork: the
// car is a real ContO rendered through Plane.d, and the stage layout comes
// from running the real loadstage. So neither can drift out of sync with the
// game, and custom cars or stages preview for free.
//
// This is the only place outside main.js that builds a world, and it builds
// exactly one, reused for every preview.

import { Graphics2D } from './graphics.js';
import { Medium } from './Medium.js';
import { Trackers } from './Trackers.js';
import { CheckPoints } from './CheckPoints.js';
import { Control } from './Control.js';
import { Record } from './Record.js';
import { CarDefine } from './CarDefine.js';
import { Mad } from './Mad.js';
import { GameSparker, CAR_NAMES, TRACK_NAMES } from './GameSparker.js';
import { XtGraphics } from './XtGraphics.js';
import { ContO } from './ContO.js';
import { objArray, setSeed } from './java.js';
import { readZip, readText, detectFpath } from './vfs.js';

/** Slot order loadbase() assigns; index here is the `?car=` value. */
export const CAR_COUNT = 16;

/**
 * Base-model names by loadbase slot.
 *
 * Cars occupy 0..15 but track pieces start at **56**, not 16 — see
 * `loadbase`, which places them at `j + 56`. Assuming they were contiguous
 * with the cars mislabelled every object on the map, which is why the ground
 * filter below silently did nothing.
 */
const BASE_NAMES = [];
CAR_NAMES.forEach((name, i) => { BASE_NAMES[i] = name; });
TRACK_NAMES.forEach((name, j) => { BASE_NAMES[j + 56] = name; });

/**
 * Flat filler the stage sits on. It tiles the whole area, so drawing it
 * buries the route in a uniform grid.
 */
const GROUND = new Set(['hpground']);

let world = null;

/** Build the shared preview world. Idempotent. */
export async function initPreview() {
  if (world) return world;
  await detectFpath();
  setSeed(12345);

  const zip = await readZip('data/models.zip');
  const medium = new Medium();
  const trackers = new Trackers();
  const checkPoints = new CheckPoints();
  const models = objArray(124);
  const gs = new GameSparker();
  const cd = new CarDefine(models, medium, trackers, gs);
  const xt = new XtGraphics(medium, cd, null, gs);
  const record = new Record(medium);

  gs.loadbase(models, medium, trackers, zip);

  const placed = objArray(610);
  const mads = objArray(8);
  for (let i = 0; i < 8; i++) {
    mads[i] = new Mad(cd, medium, record, xt, i);
    gs.u[i] = new Control(medium);
  }

  world = { medium, trackers, checkPoints, models, gs, cd, xt, record, placed, mads };
  return world;
}

/** Display names for cars 0..15, as the game shows them. */
export function carNames() {
  return Array.from({ length: CAR_COUNT }, (_, i) => world.cd.names[i] || `car ${i}`);
}

/** Class names, indexed by CarDefine.cclass. */
const CLASSES = ['Beginner', 'Amateur', 'Pro', 'Extreme', 'Bonus'];

/**
 * Four comparable bars per car, taken from the physics tables CarDefine
 * already holds rather than from any menu artwork:
 *
 *   Speed     swits[car][2]  the top gear's switch point
 *   Accel     acelf[car][0]  first-gear acceleration
 *   Grip      grip[car]
 *   Strength  maxmag[car]    damage a car absorbs before it is wasted
 *
 * Each is scaled against the strongest of the 16 stock cars, so the bars are
 * relative to the roster the way the game's own select screen reads.
 */
export function carStats(car) {
  const cd = world.cd;
  const best = (pick) => {
    let hi = 0;
    for (let i = 0; i < CAR_COUNT; i++) hi = Math.max(hi, pick(i));
    return hi || 1;
  };
  const bar = (pick) => Math.round((pick(car) / best(pick)) * 100);
  return {
    cls: CLASSES[cd.cclass[car]] ?? '',
    bars: [
      ['Speed', bar((i) => cd.swits[i][2])],
      ['Accel', bar((i) => cd.acelf[i][0])],
      ['Grip', bar((i) => cd.grip[i])],
      ['Strength', bar((i) => cd.maxmag[i])],
    ],
  };
}

// ---- car preview -----------------------------------------------------------

/**
 * Render one car, using the original's own preview setup.
 *
 * xtGraphics.java:6806 is the car-maker's rotating preview and every constant
 * here comes from it: camera at (-400, 0, -50) looking level, ground at 2470,
 * the car parked at z=1000, `xz += 5` per frame to spin it and `wzy -= 10` to
 * spin the wheels with it. `crs` is the car-select flag, which switches
 * ContO.d to the cheap flat shadow.
 *
 * Two consequences of copying it exactly:
 *   - the canvas must be 800x450 game space, because the projection centre
 *     (cx, cy) and focus_point are absolute screen coordinates. The page
 *     crops and scales the result with CSS instead of changing them.
 *   - the BASE model is drawn, not a new ContO around it, so the spin state
 *     lives on the shared model. That is what the original does.
 */
export function drawCar(canvas, car, angle) {
  const { medium, models } = world;
  if (!canvas._rd) {
    // Graphics2D always wants a 2D overlay for drawString/drawImage. Nothing
    // in a car model uses it, but it has to exist.
    const overlay = document.createElement('canvas');
    overlay.width = canvas.width;
    overlay.height = canvas.height;
    // Game space stays 800x450 whatever the backing store is, exactly as in
    // main.js: the vertex shader divides by u_size.
    canvas._rd = new Graphics2D(canvas, overlay, 800, 450);
  }
  const rd = canvas._rd;

  medium.trk = 0;
  medium.crs = true;
  // Camera from the car-SELECT screen (xtGraphics.java:5058), which looks
  // slightly down at the car. The car-maker preview at :6806 is level with it
  // and shows the underside, which reads badly when the car is the subject.
  // The spin (xz += n, wzy -= 10) is the car-maker's.
  medium.x = -400;
  medium.y = -525;
  medium.z = -50;
  medium.xz = 0;
  medium.zy = 10;
  medium.ground = 495;
  medium.ih = 0;
  medium.iw = 0;
  medium.w = 800;
  medium.h = 450;
  medium.focus_point = 400;
  medium.cx = 400;
  medium.cy = 225;
  medium.cz = 50;

  const o = models[car];
  o.x = 0;
  o.z = 1000;
  o.y = 0;
  o.xz = Math.round(angle) % 360;
  o.zy = 0;
  o.xy = 0;
  o.wzy = (o.wzy - 10) % 360;      // wheels turn with the body

  rd.begin();
  o.d(rd);
  rd.end();
}

// ---- the face --------------------------------------------------------------

/**
 * The NFM face (`d1.png` in images.zip), keyed the way the game keys it.
 *
 * xtGraphics.loadude() does not simply drop the green background: for any
 * greenish pixel it sets the colour to BLACK and the alpha to
 * `255 - (g - (r+b)/2) * 1.5`. Pure green goes fully transparent, while the
 * antialiased green fringe becomes a soft black outline — which is what makes
 * the face read against any background. Copying it exactly is why this is
 * worth 15 lines rather than a plain chroma key.
 *
 * @returns {Promise<string>} a blob: URL suitable for an <img>
 */
export async function faceURL() {
  const zip = await readZip('data/images.zip');
  const bytes = zip.get('d1.png');
  if (!bytes) throw new Error('d1.png missing from images.zip');

  const bmp = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
  const c = new OffscreenCanvas(bmp.width, bmp.height);
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bmp, 0, 0);
  const img = ctx.getImageData(0, 0, bmp.width, bmp.height);
  const px = img.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    if (g > r + 5 && g > b + 5) {
      let a = Math.trunc(255.0 - (g - (r + b) / 2) * 1.5);
      if (a > 255) a = 255;
      if (a < 0) a = 0;
      px[i] = 0; px[i + 1] = 0; px[i + 2] = 0; px[i + 3] = a;
    }
  }
  ctx.putImageData(img, 0, 0);
  const blob = await c.convertToBlob({ type: 'image/png' });
  return URL.createObjectURL(blob);
}

// ---- stage preview ---------------------------------------------------------

const stageCache = new Map();

/**
 * Load a stage and return what the launcher needs to describe and draw it.
 * Runs the real loadstage, so the layout is whatever the game would build.
 */
export async function loadStage(n) {
  if (stageCache.has(n)) return stageCache.get(n);
  const { medium, trackers, checkPoints, models, gs, xt, record, placed, mads } = world;

  const text = await readText(`stages/${n}.txt`);
  checkPoints.stage = n;
  xt.nplayers = 7;
  gs.loadstage(placed, models, medium, trackers, checkPoints, xt, mads, record, text);
  if (checkPoints.stage === -3) throw new Error(`stage ${n} failed to load`);

  // Snapshot only what the minimap needs; `placed` is reused by the next call.
  const objects = [];
  for (let i = 0; i < gs.nob; i++) {
    const o = placed[i];
    if (!o) continue;
    objects.push({
      x: o.x, z: o.z, r: o.maxR,
      cp: o.checkpoint !== 0,
      decor: !!o.decor,
      name: BASE_NAMES[o.baseIndex] || '',
      isCar: o.baseIndex < 16,
      wall: BASE_NAMES[o.baseIndex] === 'thewall',
    });
  }

  const info = {
    n,
    name: (text.match(/name\(([^)]*)\)/) || [, `Stage ${n}`])[1],
    laps: checkPoints.nlaps,
    checkpoints: checkPoints.nsp,
    objects,
    start: { x: xt.xstart[0], z: xt.zstart[0] },
  };
  stageCache.set(n, info);
  return info;
}

/** Just the display name, without building the stage. */
export async function stageName(n) {
  if (stageCache.has(n)) return stageCache.get(n).name;
  try {
    const text = await readText(`stages/${n}.txt`);
    return (text.match(/name\(([^)]*)\)/) || [, `Stage ${n}`])[1];
  } catch {
    return null;               // stage file absent
  }
}

/**
 * Draw the stage from above.
 *
 * Ground tiles (`hpground`) are the flat filler the rest of the stage sits on
 * and they tile the whole area, so drawing them buries the route in a uniform
 * grid. They are skipped entirely. Track pieces read solid, decor is dimmed,
 * checkpoints are picked out because those are what the route threads through.
 */
export function drawMinimap(canvas, stage) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  if (!stage || !stage.objects.length) return;

  // Cars are placed on the start grid by loadstage; they are not scenery and
  // the start marker already shows where they are.
  const shown = stage.objects.filter((o) => !GROUND.has(o.name) && !o.isCar);
  if (!shown.length) return;

  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const o of shown) {
    if (o.x - o.r < minX) minX = o.x - o.r;
    if (o.x + o.r > maxX) maxX = o.x + o.r;
    if (o.z - o.r < minZ) minZ = o.z - o.r;
    if (o.z + o.r > maxZ) maxZ = o.z + o.r;
  }
  const pad = 12;
  const scale = Math.min((W - pad * 2) / Math.max(1, maxX - minX),
                         (H - pad * 2) / Math.max(1, maxZ - minZ));
  // z grows away from the camera in world space; up on the map reads better.
  const px = (x) => pad + (x - minX) * scale + (W - pad * 2 - (maxX - minX) * scale) / 2;
  const py = (z) => H - pad - (z - minZ) * scale - (H - pad * 2 - (maxZ - minZ) * scale) / 2;

  // maxR is a bounding-sphere radius, so a tile's side is about 1.41x it.
  // Track pieces are drawn slightly over that so neighbours abut and the
  // route reads as one path rather than a dotted line; scenery is drawn at
  // its true size, where separate dots are correct.
  const draw = (o, fill, spread = 1.41) => {
    const s = Math.max(2, o.r * scale * spread);
    ctx.fillStyle = fill;
    ctx.fillRect(px(o.x) - s / 2, py(o.z) - s / 2, s, s);
  };
  // Walls fence the arena in; drawing them as solid as the road makes the
  // whole map read as one block, so they get their own dim tone.
  for (const o of shown) if (o.wall) draw(o, 'rgba(90,100,125,.5)', 2.1);
  for (const o of shown) if (o.decor && !o.cp && !o.wall) draw(o, 'rgba(110,140,110,.45)', 1.0);
  for (const o of shown) if (!o.decor && !o.cp && !o.wall) draw(o, 'rgba(160,185,225,.9)', 2.1);
  for (const o of shown) if (o.cp) draw(o, '#ffd24a', 1.6);

  ctx.fillStyle = '#6cf';
  ctx.beginPath();
  ctx.arc(px(stage.start.x), py(stage.start.z), 4.5, 0, Math.PI * 2);
  ctx.fill();
}
