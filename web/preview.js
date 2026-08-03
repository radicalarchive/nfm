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
import { loadIntoCarDefine } from './carstore.js';

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

/**
 * Furthest the overhead view can pull back and still render.
 *
 * The renderer was never asked for a view this wide. The StageMaker's own
 * overhead mode stops at `m.y = -15000` and SCROLLS rather than zooming out,
 * and past a point the geometry simply stops arriving: stage 8 spans 91,000
 * units and emitted 24 vertices for 172 objects that pass every gate I could
 * check by hand. The cause is inside Plane.d's own culling and is NOT
 * understood. This bound is empirical -- stages 1, 3 and 9 render at ~67-81k,
 * stage 8 does not at ~91k -- and anything beyond it falls back to the flat
 * map rather than showing an empty frame.
 */
const MAX_DEPTH = 85000;

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

/**
 * Load the player's own cars (browser storage, then mycars/) into CarDefine
 * slots 16.., exactly as the game does when you pick one to race, and return
 * their names in slot order. `menu: false` because the preview world already
 * has a stage's colours set up and loadcarmaker() would reset them.
 */
export async function loadCustomCars() {
  return loadIntoCarDefine(world.cd, { menu: false });
}

/** Display names for cars 0..15, as the game shows them. */
export function carNames() {
  return Array.from({ length: CAR_COUNT }, (_, i) => world.cd.names[i] || `car ${i}`);
}

/** Class names, indexed by CarDefine.cclass. */
const CLASSES = ['Beginner', 'Amateur', 'Pro', 'Extreme', 'Bonus'];

/**
 * The car-select screen's six stat bars, with the game's own formulas.
 *
 * `xtGraphics.java:6096-6131` draws six 156px bars and then fills the REMAINDER
 * black, so the fraction below is what the bar shows filled. Each is an
 * absolute scale baked into the menu, not a ranking against the other cars —
 * an earlier version here normalised four made-up stats against the roster
 * maximum, which is why the bars disagreed with the game.
 *
 *   Top Speed     (swits[2] - 220) / 90,   floored at 0.2
 *   Acceleration  acelf[1]*acelf[0]*acelf[2]*grip / 7700, capped at 1
 *   Handling      dishandle                (already 0..1)
 *   Stunts        (airc*airs*bounce + 28) / 139, capped at 1
 *   Strength      (moment + 0.5) / 2.6,    capped at 1
 *   Endurance     outdam                   (already 0..1)
 */
export function carStats(car) {
  const cd = world.cd;
  const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  const pct = (v) => Math.round(v * 100);
  return {
    cls: CLASSES[cd.cclass[car]] ?? '',
    bars: [
      ['Top Speed', pct(clamp((cd.swits[car][2] - 220) / 90, 0.2, 1))],
      ['Acceleration', pct(clamp(
        cd.acelf[car][1] * cd.acelf[car][0] * cd.acelf[car][2] * cd.grip[car] / 7700, 0, 1))],
      ['Handling', pct(clamp(cd.dishandle[car], 0, 1))],
      ['Stunts', pct(clamp((cd.airc[car] * cd.airs[car] * cd.bounce[car] + 28) / 139, 0, 1))],
      ['Strength', pct(clamp((cd.moment[car] + 0.5) / 2.6, 0, 1))],
      ['Endurance', pct(clamp(cd.outdam[car], 0, 1))],
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

  // Custom cars are not base models: loadcar() puts them in CarDefine's own
  // bco[] at slot 16 and up.
  const o = car < CAR_COUNT ? models[car] : world.cd.bco[car];
  o.x = 0;
  o.z = 1000;
  o.y = 0;                          // as the car-select screen leaves it
  o.xz = Math.round(angle) % 360;
  o.zy = 0;
  o.xy = 0;
  o.wzy = (o.wzy - 10) % 360;      // wheels turn with the body

  // No shadow. ContO.d's `crs` path projects a flat silhouette that, with the
  // car floating rather than sitting on a track, lands across the middle of
  // the model instead of beneath it. Seating the car on the ground plane
  // (y = ground - grat, as loadstage does) only makes the shadow the whole
  // picture. A preview does not need one, so skip it rather than invent a
  // placement the game never uses.
  const hadShadow = o.shadow;
  o.shadow = false;
  try {
    rd.begin();
    o.d(rd);
    rd.end();
  } finally {
    o.shadow = hadShadow;
  }
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

// Stage metadata, keyed by number. The BUILT stage is not cached: loadstage
// writes into one shared set of arrays, so what is in `placed` is whatever was
// loaded last, and only one stage can exist at a time.
const stageMeta = new Map();

// loadstage mutates the shared world, so two of them must never interleave.
// Without this, clicking through stages quickly corrupted the shared state and
// eventually produced checkPoints.stage === -3 ("could not load this stage").
let stageQueue = Promise.resolve();

/**
 * Build stage `n` into the shared world and return what the launcher needs.
 *
 * Always rebuilds, even on a metadata cache hit: the caller draws from
 * `placed` immediately afterwards, and returning early left the previous
 * stage's geometry in there while the camera moved to the new stage's bounds
 * -- which looked like the map being stuck and sliding around.
 */
export function loadStage(n) {
  const run = stageQueue.then(() => buildStage(n), () => buildStage(n));
  stageQueue = run.catch(() => {});      // a failure must not wedge the queue
  return run;
}

async function buildStage(n) {
  const { medium, trackers, checkPoints, models, gs, xt, record, placed, mads } = world;

  const text = await readText(`stages/${n}.txt`);   // vfs caches the fetch
  checkPoints.stage = n;
  xt.nplayers = 7;
  gs.loadstage(placed, models, medium, trackers, checkPoints, xt, mads, record, text);
  if (checkPoints.stage === -3) throw new Error(`stage ${n} failed to load`);

  if (stageMeta.has(n)) return stageMeta.get(n);

  const objects = [];
  for (let i = 0; i < gs.nob; i++) {
    const o = placed[i];
    if (!o) continue;
    objects.push({
      x: o.x, y: o.y, z: o.z, r: o.maxR,
      cp: o.checkpoint !== 0,
      decor: !!o.decor,
      name: BASE_NAMES[o.baseIndex] || '',
      isCar: o.baseIndex < 16,
      wall: BASE_NAMES[o.baseIndex] === 'thewall',
    });
  }

  // The stage declares its own extent: maxl/maxr/maxt/maxb in the stage file
  // are the four boundary walls, and loadstage feeds exactly those to
  // trackers.devidetrackers(). So the spatial index already holds the game's
  // own idea of where the stage is, in 3000-unit cells -- no need to infer a
  // bounding box from object positions, which outliers skew.
  const minX = trackers.sx;
  const maxX = trackers.sx + trackers.ncx * 3000;
  const minZ = trackers.sz;
  const maxZ = trackers.sz + trackers.ncz * 3000;

  let topY = Infinity;                 // y grows downward: the smallest is highest
  let sumY = 0, nY = 0;
  for (const o of objects) {
    if (o.name === 'hpground' || o.isCar) continue;
    if (o.y - o.r < topY) topY = o.y - o.r;
    sumY += o.y; nY++;
  }
  if (!nY) topY = 0;
  const meanY = nY ? sumY / nY : 0;

  const info = {
    n,
    bounds: { minX, maxX, minZ, maxZ, meanY, topY },
    name: (text.match(/name\(([^)]*)\)/) || [, `Stage ${n}`])[1],
    laps: checkPoints.nlaps,
    checkpoints: checkPoints.nsp,
    objects,
    start: { x: xt.xstart[0], z: xt.zstart[0] },
  };
  stageMeta.set(n, info);
  return info;
}

/** Just the display name, without building the stage. */
export async function stageName(n) {
  if (stageMeta.has(n)) return stageMeta.get(n).name;
  try {
    const text = await readText(`stages/${n}.txt`);
    return (text.match(/name\(([^)]*)\)/) || [, `Stage ${n}`])[1];
  } catch {
    return null;               // stage file absent
  }
}

/**
 * Render the stage from directly overhead with the game's own renderer.
 *
 * The abstract block map this replaced could only ever be coloured rectangles;
 * this draws the actual track geometry, shaded exactly as it is in a race,
 * because it IS the race renderer with the camera pointed straight down.
 *
 * Requires the stage to be the one currently built into `placed` -- loadStage
 * reuses that array -- so it is called immediately after it.
 *
 * `zy = 90` looks straight down and the camera height comes from the stage's
 * own bounds. Returns the vertex count so the caller can tell a stage that
 * rendered from one the renderer could not reach — see MAX_DEPTH.
 */
export function drawStage3D(canvas, stage) {
  const { medium, gs, xt, placed, mads } = world;
  if (!canvas._rd) {
    const overlay = document.createElement('canvas');
    overlay.width = canvas.width;
    overlay.height = canvas.height;
    canvas._rd = new Graphics2D(canvas, overlay, 800, 450);
  }
  const rd = canvas._rd;

  const b = stage.bounds;
  const spanX = Math.max(1, b.maxX - b.minX);
  const spanZ = Math.max(1, b.maxZ - b.minZ);

  // Work the camera height out of the projection rather than guessing it.
  // With xz = 0 and zy = 90 the transform in ContO.d collapses to
  //   screenX = cx + (x - m.x - cx) * focus / depth
  //   screenY = cy - (z - m.z - cz) * focus / depth
  //   depth   = cz + (y - m.y - cy)
  // so fitting spanX into 800 needs depth >= spanX/2, and spanZ into 450
  // needs depth >= spanZ * 400/450. Take the larger, with a margin.
  let depth = Math.max(spanX / 2, spanZ * (400 / 450)) * 1.12;
  // The camera must clear the TALLEST object with room to spare. Framing off
  // the mean height alone leaves tall geometry at or above the camera plane,
  // where depth goes to zero and the projection stretches it across the whole
  // screen -- what stage 9's ramps did. `xs()` clamps the divisor but that
  // only bounds the blow-up, it does not prevent the smear.
  const clearance = (b.meanY - b.topY) * 2 + 2000;
  if (depth < clearance) depth = clearance;
  // The renderer was never asked for a view this wide: the StageMaker's own
  // overhead mode stops at m.y = -15000 and SCROLLS instead. Past roughly that
  // distance, face-level culling inside Plane.d strips the geometry -- stage 8
  // spans 91,000 units and emitted 24 vertices for 172 visible objects.
  // Clamp to the supported range; larger stages show their middle rather than
  // an empty frame.
  if (depth > MAX_DEPTH) return 0;      // caller falls back to the flat map


  // trk = 2 is the StageMaker's overhead editing mode (StageMaker.java:886).
  // It is not cosmetic: ContO.d's distance-fade and minimum-projected-size
  // culls are both written as `... || this.m.trk !== 0`, so at map scale
  // everything is culled without it -- 7 of 190 objects survived at trk = 0.
  // trk = 1 would additionally hide decor; 2 keeps it.
  medium.trk = 2;
  medium.crs = false;
  medium.ih = 0;
  medium.iw = 0;
  medium.w = 800;
  medium.h = 450;
  medium.focus_point = 400;
  medium.cx = 400;
  medium.cy = 225;
  medium.cz = 50;
  medium.xz = 0;
  medium.zy = 90;
  medium.x = (b.minX + b.maxX) / 2 - medium.cx;
  medium.z = (b.minZ + b.maxZ) / 2 - medium.cz;
  medium.y = b.meanY - medium.cy + medium.cz - depth;
  medium.ground = b.meanY;

  // Skip the backdrop: pointed straight down it fills the frame with sky and
  // washes the track out. gs.draw calls it, so stub it for this one call.
  const backdrop = medium.d;
  medium.d = () => {};
  try {
    rd.begin();
    gs.draw(rd, medium, xt, placed, mads);
    rd.end();
  } finally {
    medium.d = backdrop;
  }
  return rd.vertexCount;
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
