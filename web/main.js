// Boot: fetch assets, build the world, run the race tick under rAF.
//
// This is the replacement for GameSparker.run()'s while(true) + Thread.sleep
// pacer. The Java pacer self-tunes toward 10 frames ~= 400ms with a floor of
// n4 (15ms in-race, 30 in menus). PORT_SPEC calls out that the n4 floor caps
// menus at 33fps regardless of render speed and says to drop it; rAF gives us
// vsync pacing instead, so the whole adaptive block goes away.

import { Graphics2D } from './graphics.js';
import { Medium } from './Medium.js';
import { Trackers } from './Trackers.js';
import { CheckPoints } from './CheckPoints.js';
import { Control } from './Control.js';
import { Record } from './Record.js';
import { CarDefine } from './CarDefine.js';
import { Mad } from './Mad.js';
import { GameSparker } from './GameSparker.js';
import { XtGraphics } from './XtGraphics.js';
import { objArray, setSeed, setPooling } from './java.js';
import { readZip, readText, detectFpath } from './vfs.js';
import { loadHudImages } from './images.js';
import { Audio } from './audio.js';
import * as music from './music.js';

const log = (msg) => {
  console.log(msg);
  const el = document.getElementById('log');
  if (el) el.textContent = msg;
};

async function boot() {
  const params = new URLSearchParams(location.search);
  const stage = parseInt(params.get('stage') || '1', 10);
  const car = parseInt(params.get('car') || '1', 10);        // 1 = formula7
  // ?cars=same puts the player's car in every slot, which is what this
  // harness used to do unconditionally.
  const sameCars = params.get('cars') === 'same';
  const players = parseInt(params.get('players') || '7', 10);
  const base = await detectFpath(params.get('path'));
  setSeed(parseInt(params.get('seed') || '12345', 10));

  const glCanvas = document.getElementById('gl');
  const textCanvas = document.getElementById('overlay');
  // Render scale. Game space stays 800x450 -- the vertex shader divides by
  // u_size -- so raising this costs no extra CPU in the *geometry* path and no
  // coordinate anywhere changes.
  //
  // It is NOT free, though, and the earlier claim that it was is wrong
  // (measured on the target machine: lower res is noticeably faster). Two
  // costs scale with it, neither of them vertex work:
  //   - fragment bandwidth. There is no depth buffer, so the painter's
  //     algorithm draws every triangle and the scene is heavily overdrawn.
  //     4x the pixels is 4x the overdraw. MSAA multiplied that again, which is
  //     why `aa` now defaults off above res=1.
  //   - the overlay's per-frame clearRect, a CPU cost proportional to ITS
  //     backing store. That is why `textres` is separate and defaults to 1.
  const res = Math.max(1, Math.min(4, parseFloat(params.get('res') || '2')));
  const textRes = Math.max(1, Math.min(4, parseFloat(params.get('textres') || '1')));
  const AA = params.get('aa') !== null ? params.get('aa') === '1' : res <= 1;
  glCanvas.width = Math.round(800 * res);
  glCanvas.height = Math.round(450 * res);
  textCanvas.width = Math.round(800 * textRes);
  textCanvas.height = Math.round(450 * textRes);
  // Diagnostic stubs; see the block in graphics.js. `raster=0` is both of the
  // other two at once, kept because the first round of measurements used it.
  // ?prof=1: time medium.d() -- the backdrop -- separately from the object
  // loop. This is the honest way to find a per-frame cost that scales with
  // nothing: the within-run regression cannot separate slope from intercept
  // when scene weight varies by too little, and returns a negative fixed cost
  // when pushed.
  const PROFILE = params.get('prof') === '1';
  const RASTER = params.get('raster') !== '0';
  const GEOMETRY = params.get('geom') !== '0';
  const OVERLAY = params.get('overlay') !== '0';
  const rd = new Graphics2D(glCanvas, textCanvas, 800, 450,
                            { antialias: AA, raster: RASTER,
                              geometry: GEOMETRY, overlay: OVERLAY,
                              fill: params.get('fill') || 'trap' });

  log(`assets at ${base} -- loading models.zip...`);
  const zip = await readZip('data/models.zip');

  const medium = new Medium();
  const trackers = new Trackers();
  const checkPoints = new CheckPoints();
  const array = objArray(124);                 // base models
  const gs = new GameSparker();
  const carDefine = new CarDefine(array, medium, trackers, gs);
  const xt = new XtGraphics(medium, carDefine, rd, gs);
  const record = new Record(medium);

  log('building base models...');
  gs.loadbase(array, medium, trackers, zip);
  if (gs.mload === 2) log('warning: models.zip size mismatch');

  const array2 = objArray(610);                // placed objects
  const array3 = objArray(8);                  // Mad[8]
  for (let i = 0; i < 8; ++i) {
    array3[i] = new Mad(carDefine, medium, record, xt, i);
    gs.u[i] = new Control(medium);
  }

  xt.nplayers = players;
  xt.sc[0] = car;
  if (sameCars) {
    for (let i = 1; i < 8; ++i) xt.sc[i] = car;
  } else {
    // The original never races eight identical cars: sortcars() draws the
    // field for this stage, biased toward faster cars as the stages go on,
    // and forces specific opponents in for certain stages. It fills slots
    // 1..6 -- the original grid is seven cars -- so an eighth slot keeps
    // whatever it had.
    xt.sortcars(stage);
    xt.sc[7] = car;
  }
  checkPoints.stage = stage;

  log(`loading stage ${stage}...`);
  const stageText = await readText(`stages/${stage}.txt`);
  gs.loadstage(array2, array, medium, trackers, checkPoints, xt, array3, record, stageText);

  if (checkPoints.stage === -3) {
    log('stage failed to load (checkPoints.stage == -3)');
    return;
  }

  // In-race viewport. loadstage leaves these at the stage-select values.
  medium.trk = 0;
  medium.iw = 0;
  medium.ih = 0;
  medium.w = 800;
  medium.h = 450;
  xt.fase = 0;
  // The Java sets this entering the race from stage select (xtGraphics:2587),
  // not in resetstat: the x of the translucent NFM guy behind the countdown.
  // -1 suppresses him entirely.
  xt.dudo = 150;

  // HUD assets. After loadstage, because loadsnap() tints with medium.snap
  // and the stage file is what sets it. Failure is non-fatal: the draw sites
  // are null-guarded and fall back to the vector-only HUD.
  try {
    const imgZip = await readZip('data/images.zip');
    const n = await loadHudImages(xt, imgZip, medium);
    log(`loaded ${n} HUD images`);
  } catch (e) {
    console.warn('HUD images unavailable, drawing vector HUD only:', e);
  }

  // Sound. Non-fatal: the race runs silently if sounds.zip is missing or the
  // browser has no Web Audio. The context starts suspended, so it is unlocked
  // on the first key press below.
  const snd = new Audio();
  const sfxvol = parseInt(params.get('sfxvol') || '100', 10);
  snd.setVolume(sfxvol / 100.0);
  
  const musicvol = parseInt(params.get('musicvol') || '100', 10);
  music.setVolume(musicvol / 100.0);

  xt.snd = snd;
  snd.load().catch((e) => console.warn('sound unavailable:', e));

  log(`stage "${checkPoints.name}"  objects=${gs.nob}  checkpoints=${checkPoints.nsp}  laps=${checkPoints.nlaps}`);
  installInput(gs.u[0], snd);

  let backdropMs = 0;
  if (PROFILE) {
    const inner = medium.d.bind(medium);
    medium.d = (g) => {
      const t = performance.now();
      inner(g);
      backdropMs += performance.now() - t;
    };
  }

  // ---- pacing -------------------------------------------------------------
  // The game's simulation rate is baked into its constants: every velocity,
  // acceleration and rotation step in Mad.drive() is per-TICK, not per-second.
  // GameSparker.run() paced those ticks with a self-tuning sleep. It has TWO
  // targets and they are easy to confuse:
  //
  //   in-race (fase 0/-1/-3/7001):  n5 = 530  -> 530ms per 10 frames
  //   menus:                        400ms per 10 frames
  //
  // The in-race loop nudges `a` by (530 - elapsed10)/20 every 10 frames, so it
  // settles at 53ms/tick ~= 18.9 ticks/sec. Using the menu figure of 40ms runs
  // the game 1.325x too fast.
  //
  // Fixed timestep with an accumulator restores the rate and makes it
  // independent of the display refresh (rAF alone gave 60-144 ticks/sec).
  const TICK_MS = parseFloat(params.get('tickms') || '53');   // 530ms / 10 frames
  const MAX_CATCHUP = 3;        // don't spiral after a tab-switch stall
  // Default ON. Without it the game draws only on a tick, so the render rate
  // is the tick rate -- 18.9fps by construction. It was off while blended
  // frames jittered on turns; that was Medium.sin/cos quantising headings to
  // whole degrees, and is fixed. ?interp=0 restores tick-rate rendering.
  const INTERPOLATE = params.get('interp') !== '0';
  const MAX_FPS = parseFloat(params.get('maxfps') || '0');   // 0 = uncapped
  const SHOW_STATS = params.get('stats') === '1';
  const POOLING = params.get('pool') === '1';
  setPooling(POOLING);

  // ---- benchmark mode -----------------------------------------------------
  // A rolling 60-frame readout is useless for comparing two builds: whichever
  // 60 frames you happen to be looking at depends on where the car is. Instead
  // average over a fixed window and then FREEZE, so the number on screen is
  // the same number for every run and can be read off at leisure.
  //
  // The first WARMUP_MS are discarded: shader compile, the first texture-free
  // draw, and JIT warmup all land there and are not representative.
  const BENCH_S = parseFloat(params.get('bench') || (SHOW_STATS ? '3' : '0'));
  const WARMUP_MS = parseFloat(params.get('warmup') || '3000');
  const BENCH_MS = BENCH_S * 1000;
  let benchStart = 0;          // set on the first frame past warmup
  let benchDone = false;
  const bench = { frames: 0, ticks: 0, simMs: 0, drawMs: 0, verts: 0,
                  inputVerts: 0, objCalls: 0, objDrawn: 0, faceCalls: 0,
                  worstFrame: 0, lastFrameAt: 0,
                  // Least-squares of draw-ms against PROJECTED vertices, one
                  // point per frame. Scene weight moves with the camera every
                  // frame, so a single run yields hundreds of points across a
                  // wide range -- vastly better leverage than comparing two
                  // runs whose weights differ by 1.7x, where a few percent of
                  // noise swings the intercept by milliseconds. The intercept
                  // is the per-frame cost that scales with nothing.
                  projVerts: 0, n: 0, sx: 0, sy: 0, sxy: 0, sxx: 0, syy: 0,
                  xMin: Infinity, xMax: 0 };

  // ---- interpolation ------------------------------------------------------
  // Physics stays locked at 18.9Hz because every constant in Mad.drive() is
  // per-tick. To get motion at display rate we keep the transform state from
  // the previous and current tick, and re-run only the DRAW half against a
  // blend of the two. Nothing in the simulation sees the blended values --
  // they are written in, drawn, and immediately restored.
  const FIELDS = ['x', 'y', 'z', 'xz', 'xy', 'zy'];
  const CAM = ['x', 'y', 'z', 'xz', 'zy'];
  // Effect state used to be mirrored here field by field -- fcnt/fix for the
  // repair sparkle, stg[]/rtg[] for dust and sparks, cpflik/elecr/noelec/lilo/
  // lightn for the backdrop -- because every effect advances its own counter
  // from inside draw(). That list could only ever be as complete as the last
  // bug report: each effect was added after it visibly broke, and the electric
  // ring's elc/edl/edr never was. It is gone. `medium.interpolating` now marks
  // the pass and each effect guards its own advance at the mutation
  // (`if (!this.m.interpolating)` in ContO and Medium), so a missed effect is
  // a one-line fix where the mutation lives instead of a field forgotten in a
  // list in another file.
  //
  // Randoms are handled the same way but in one place rather than at every
  // call site: an interpolated pass REPLAYS the sequence the tick's draw
  // consumed (Medium.random()), so a bolt or a spark keeps its shape instead
  // of being rolled fresh at display rate. That leaves the PRNG cursor
  // untouched during a redraw; it is still snapshotted below because the very
  // first frame can interpolate before any tick has recorded a sequence.
  //
  // What genuinely has to be snapshotted is draw's one real OUTPUT:
  // ContO.dist, which feeds the NEXT frame's depth sort.
  const MED_STATE = ['cntrn', 'trn'];
  const snapPrev = { obj: [], cam: {} };
  const snapCurr = { obj: [], cam: {} };

  const capture = (into) => {
    for (let i = 0; i < gs.nob; i++) {
      const o = array2[i];
      if (!o) continue;
      let d = into.obj[i];
      if (!d) d = into.obj[i] = {};
      for (const f of FIELDS) d[f] = o[f];
      // dist is a side effect of draw() and feeds the NEXT frame's depth
      // sort. The interpolated redraw would overwrite it with values derived
      // from blended positions, so snapshot it and put it back.
      d.dist = o.dist;
    }
    for (const f of CAM) into.cam[f] = medium[f];
    for (const f of MED_STATE) into.cam[f] = medium[f];
    if (!into.rand) into.rand = new Int32Array(3);
    into.rand.set(medium.rand);
    if (!into.diup) into.diup = [];
    for (let i = 0; i < 3; i++) into.diup[i] = medium.diup[i];
  };

  /** Shortest-path lerp for angles in degrees; plain lerp otherwise. */
  const blend = (a, b, t, isAngle) => {
    if (!isAngle) return a + (b - a) * t;
    let d = b - a;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return a + d * t;
  };

  const applyBlend = (t) => {
    for (let i = 0; i < gs.nob; i++) {
      const o = array2[i];
      const p = snapPrev.obj[i];
      const c = snapCurr.obj[i];
      if (!o || !p || !c) continue;
      // Positions are rounded (they are integers in the game, and a unit is
      // far below a pixel), but ANGLES are left fractional. Medium.sin/cos
      // interpolate between table entries, so a heading no longer has to snap
      // to a whole degree -- which is ~13px of yaw and was the jitter you see
      // on turns and only on turns.
      o.x = Math.round(blend(p.x, c.x, t, false));
      o.y = Math.round(blend(p.y, c.y, t, false));
      o.z = Math.round(blend(p.z, c.z, t, false));
      o.xz = blend(p.xz, c.xz, t, true);
      o.xy = blend(p.xy, c.xy, t, true);
      o.zy = blend(p.zy, c.zy, t, true);
    }
    // The camera is interpolated between its own two tick states, exactly as
    // the objects are and over the same t, so the two cannot disagree.
    //
    // The alternative -- re-running Medium.follow() on the interpolated car --
    // is gone. follow() is a stateful ease, not a function of t: each frame
    // restored the camera to the tick state and applied exactly one ease step,
    // so the camera lurched once per tick however smoothly the cars moved.
    //
    // Same here: the camera's heading is what the whole frame pivots on, so
    // quantising it to a degree moves every pixel on screen.
    medium.x = Math.round(blend(snapPrev.cam.x, snapCurr.cam.x, t, false));
    medium.y = Math.round(blend(snapPrev.cam.y, snapCurr.cam.y, t, false));
    medium.z = Math.round(blend(snapPrev.cam.z, snapCurr.cam.z, t, false));
    medium.xz = blend(snapPrev.cam.xz, snapCurr.cam.xz, t, true);
    medium.zy = blend(snapPrev.cam.zy, snapCurr.cam.zy, t, true);
  };

  const restoreCurr = () => {
    for (let i = 0; i < gs.nob; i++) {
      const o = array2[i];
      const c = snapCurr.obj[i];
      if (!o || !c) continue;
      for (const f of FIELDS) o[f] = c[f];
      o.dist = c.dist;
    }
    for (const f of CAM) medium[f] = snapCurr.cam[f];
    for (const f of MED_STATE) medium[f] = snapCurr.cam[f];
    medium.rand.set(snapCurr.rand);
    for (let i = 0; i < 3; i++) medium.diup[i] = snapCurr.diup[i];
  };

  capture(snapPrev);
  capture(snapCurr);

  let acc = 0;
  let last = performance.now();
  const bootAt = last;
  let frames = 0;
  let ticks = 0;
  let lastFpsAt = last;

  let simMs = 0, drawMs = 0, nextFrameAt = 0;
  // Jitter allowance for the ?maxfps= deadline, in ms. Well under a 60Hz
  // vsync (16.7ms), so it never lets an extra frame through, and far above
  // the sub-ms wobble in rAF timestamps.
  const FRAME_SLOP = 2;
  // Vertices the last tick's simulate() emitted (HUD bars, checkpoint arrow),
  // replayed onto interpolated frames. They update at tick rate, which is the
  // rate they were drawn at anyway.
  let hudVerts = null;

  const config = () =>
    `res=${res} textres=${textRes} aa=${AA ? 1 : 0} interp=${INTERPOLATE ? 1 : 0}`
    + ` players=${players} stage=${stage} pool=${POOLING ? 1 : 0}`
    + `${RASTER ? '' : ' raster=0'}`
    + `${GEOMETRY ? '' : ' geom=0'}`
    + `${OVERLAY ? '' : ' overlay=0'}`
    + ` fill=${params.get('fill') || 'trap'}`
    + `${MAX_FPS ? ` maxfps=${MAX_FPS}` : ''}`;

  /**
   * The frozen end-of-window result. Everything here is a mean over the whole
   * window, so two runs are comparable even though the car is somewhere
   * different in each. ms/tick and ms/frame are the two numbers that matter:
   * they say whether a change moved physics cost or render cost.
   */
  const benchReport = (elapsed) => {
    const fps = (bench.frames * 1000) / elapsed;
    const tps = (bench.ticks * 1000) / elapsed;
    const perTick = bench.simMs / Math.max(1, bench.ticks);
    const perFrame = bench.drawMs / Math.max(1, bench.frames);
    // Share of one core: ms of CPU spent per 1000ms of wall clock.
    const core = ((bench.simMs + bench.drawMs) / elapsed) * 100;
    const buf = rd.gl ? `${rd.gl.drawingBufferWidth}x${rd.gl.drawingBufferHeight}` : '';
    const f = Math.max(1, bench.frames);
    const inPerFrame = bench.inputVerts / f;
    // y = slope*x + intercept, x = projected verts, y = draw ms.
    const den = bench.n * bench.sxx - bench.sx * bench.sx;
    const slope = den === 0 ? 0 : (bench.n * bench.sxy - bench.sx * bench.sy) / den;
    const intercept = bench.n === 0 ? 0 : (bench.sy - slope * bench.sx) / bench.n;
    // Report the spread and R^2 too: an intercept fitted over a narrow range
    // of x is meaningless, and a negative one is the tell.
    const meanY = bench.sy / Math.max(1, bench.n);
    const ssTot = bench.syy - bench.n * meanY * meanY;
    const ssRes = bench.syy - intercept * bench.sy - slope * bench.sxy;
    const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 0;
    const fit = `  fit over ${bench.n} frames: ${(slope * 1000).toFixed(3)} us/projected vert`
      + ` + ${intercept.toFixed(2)} ms fixed`
      + `   (x ${bench.xMin}..${bench.xMax}, R2 ${r2.toFixed(2)})`;
    return [
      `BENCHMARK  ${(elapsed / 1000).toFixed(1)}s window, ${WARMUP_MS / 1000}s warmup discarded  --  PAUSED, press R to rerun`,
      `  ${fps.toFixed(1)} fps avg   ${tps.toFixed(1)} tick/s   worst frame ${bench.worstFrame.toFixed(0)}ms`,
      `  sim ${perTick.toFixed(2)} ms/tick   draw ${perFrame.toFixed(2)} ms/frame   -> ${core.toFixed(0)}% of one core`,
      // ns per submitted vertex is the ONLY figure comparable across runs:
      // scene weight swings ~60% with where the car is, which is larger than
      // any difference being measured here.
      `  ${(perFrame / Math.max(1, inPerFrame) * 1e6).toFixed(0)} ns/vert submitted`
        + `   (${Math.round(inPerFrame)} submitted, ${bench.verts} emitted)`,
      `  per frame: ${Math.round(bench.objDrawn / f)} objs drawn`
        + ` of ${Math.round(bench.objCalls / f)},`
        + ` ${Math.round(bench.faceCalls / f)} faces,`
        + ` ${Math.round(inPerFrame)} verts`
        + `   -> ${(perFrame / Math.max(1, bench.objDrawn / f) * 1000).toFixed(1)} us/obj,`
        + ` ${(perFrame / Math.max(1, bench.faceCalls / f) * 1e6).toFixed(0)} ns/face`,
      fit,
      ...(PROFILE ? [`  backdrop (medium.d) ${(backdropMs / f).toFixed(2)} ms/frame`
        + `   -> objects ${(perFrame - backdropMs / f).toFixed(2)} ms/frame`] : []),
      `  buffer ${buf}   ${config()}`,
    ].join('\n');
  };

  const restartBench = () => {
    bench.frames = 0; bench.ticks = 0; bench.simMs = 0; bench.drawMs = 0;
    bench.verts = 0; bench.inputVerts = 0; bench.worstFrame = 0;
    bench.objCalls = 0; bench.objDrawn = 0; bench.faceCalls = 0;
    backdropMs = 0;
    bench.projVerts = 0; bench.n = 0; bench.sx = 0; bench.sy = 0;
    bench.sxy = 0; bench.sxx = 0; bench.syy = 0;
    bench.xMin = Infinity; bench.xMax = 0;
    benchStart = 0;
    benchDone = false;
    // No second warmup -- it is measured from boot, and by now everything is
    // warm. Drop the accumulated time so the first frame back does not run
    // MAX_CATCHUP ticks at once.
    last = performance.now();
    acc = 0;
  };
  addEventListener('keydown', (e) => {
    if (e.code === 'KeyR' && BENCH_MS > 0) restartBench();
  });

  // Back to the launcher once the race is over. Idempotent: the navigation is
  // asynchronous, so without the flag every remaining frame would fire it
  // again, and the engine loops would be stopped repeatedly on the way out.
  let leaving = false;
  function leaveRace() {
    if (leaving) return;
    leaving = true;
    snd.stopAllLoops();
    music.stop();
    location.href = '../index.html';
  }

  function frame(now) {
    requestAnimationFrame(frame);
    // Frozen after the benchmark window: no ticks, no draws, and the result
    // stays on screen. Press R to run another window.
    if (benchDone || leaving) return;

    let fSim = 0, fDraw = 0, ticksThisFrame = 0;

    // Optional presentation cap. rAF still fires at the display rate; we just
    // skip the work. ?maxfps=30 halves the draw cost without touching physics.
    //
    // The deadline advances by a whole interval from the PREVIOUS deadline,
    // not from `now`. Setting it from `now` folds each frame's overshoot into
    // the next deadline, and on a 60Hz display a 33.3ms cap then lands just
    // past a vsync and waits for the one after -- 20fps for a 30fps cap.
    // FRAME_SLOP absorbs rAF timestamp jitter for the same reason: a deadline
    // missed by a fraction of a millisecond otherwise costs a whole vsync.
    // A cap that does not divide the display rate averages out correctly but
    // is unevenly spaced -- 45 on 60Hz alternates 16.7ms and 33.3ms gaps.
    // That much is inherent to skipping whole frames.
    if (MAX_FPS > 0) {
      const interval = 1000 / MAX_FPS;
      if (now < nextFrameAt - FRAME_SLOP) return;
      nextFrameAt += interval;
      // Behind by more than a frame (tab was hidden, or a long stall): start
      // a fresh cadence rather than running a burst to catch up.
      if (nextFrameAt < now) nextFrameAt = now + interval;
    }

    acc += now - last;
    last = now;
    if (acc > TICK_MS * MAX_CATCHUP) acc = TICK_MS * MAX_CATCHUP;

    let stepped = false;
    while (acc >= TICK_MS) {
      // Snapshot BEFORE the tick, so after the loop snapPrev holds the state
      // entering the most recent tick and snapCurr the state leaving it --
      // correct even when several ticks run to catch up.
      capture(snapPrev);
      // The draw half inside tick() still runs: it refreshes ContO.dist for
      // the next frame's depth sort and advances per-frame visual state. Its
      // geometry is discarded when interpolating, since we redraw below.
      // gs.tick() is exactly draw()-then-simulate(); calling the halves
      // directly changes nothing about order or state, but lets each be timed.
      // Calling tick() as a unit charged the whole cost to "sim" and reported
      // draw as 0.00ms whenever interpolation was off, which is precisely the
      // configuration we care about.
      rd.begin();
      const t0 = performance.now();
      gs.draw(rd, medium, xt, array2, array3);
      const t1 = performance.now();
      // Everything simulate() emits lands after the scene, on top: the HUD's
      // damage and power bars, and the checkpoint arrow. Keep those vertices
      // so an interpolated frame can put them back -- it redraws the scene
      // into a fresh batch and would otherwise drop them, which showed up as
      // the meters reading zero and the arrow disappearing.
      const hudStart = rd.vertexCount;
      gs.simulate(rd, medium, trackers, checkPoints, xt, record, array2, array3);
      hudVerts = rd.snapshotFrom(hudStart);
      fSim += performance.now() - t1;
      fDraw += t1 - t0;
      acc -= TICK_MS;
      ticks++;
      ticksThisFrame++;
      stepped = true;

      // End of race. stat() runs the whole finish sequence itself -- it sets
      // holdit to freeze the field under the win/lose overlay, counts holdcnt
      // up to the hold length, and only then sets fase = -2, the Java's "leave
      // the race" signal. In the Java that lands in the menus; here it goes
      // back to the launcher, which is the closest thing this port has.
      if (xt.fase === -2) { leaveRace(); return; }
    }
    if (stepped) capture(snapCurr);

    if (INTERPOLATE) {
      const t1 = performance.now();
      applyBlend(Math.min(1, acc / TICK_MS));
      // Marks the whole pass as a redraw of the tick's frame. Every effect
      // that steps a counter from inside draw() reads this and holds still;
      // see the note by MED_STATE.
      medium.interpolating = true;
      // keepOverlay: the HUD was drawn on the overlay by simulate() and is
      // not part of the geometry being re-projected here.
      rd.begin(true);
      gs.draw(rd, medium, xt, array2, array3);
      rd.replay(hudVerts);       // HUD last, so it stays on top
      medium.interpolating = false;
      restoreCurr();
      fDraw += performance.now() - t1;
    }
    rd.end();

    simMs += fSim;
    drawMs += fDraw;

    // Count only frames that actually produced an image. With interp off, a
    // rAF that ran no tick draws nothing and leaves the previous frame up, so
    // counting it would report the display rate instead of the render rate.
    const rendered = stepped || INTERPOLATE;

    // ---- benchmark accounting ---------------------------------------------
    if (BENCH_MS > 0) {
      if (benchStart === 0) {
        if (now - bootAt >= WARMUP_MS) {
          benchStart = now;
          bench.lastFrameAt = now;
          backdropMs = 0;      // discard whatever the warmup accumulated
        }
      } else {
        bench.simMs += fSim;
        bench.drawMs += fDraw;
        bench.ticks += ticksThisFrame;
        if (rendered) {
          bench.frames++;
          bench.verts = Math.max(bench.verts, rd.vertexCount);
          bench.inputVerts += rd.inputVerts;
          bench.objCalls += rd.objCalls;
          bench.objDrawn += rd.objDrawn;
          bench.faceCalls += rd.faceCalls;
          bench.projVerts += rd.projVerts;
          const x = rd.projVerts, y = fDraw;
          bench.n++; bench.sx += x; bench.sy += y;
          bench.sxy += x * y; bench.sxx += x * x; bench.syy += y * y;
          if (x < bench.xMin) bench.xMin = x;
          if (x > bench.xMax) bench.xMax = x;
          const gap = now - bench.lastFrameAt;
          if (gap > bench.worstFrame) bench.worstFrame = gap;
          bench.lastFrameAt = now;
        }
        if (now - benchStart >= BENCH_MS) {
          benchDone = true;
          log(benchReport(now - benchStart));
          return;
        }
      }
    }

    if (!rendered) return;

    // Time-based rather than every-60-frames: at 25fps a 60-frame window is
    // 2.4s, which makes the countdown tick over twice in a 5s benchmark.
    if (++frames >= 5 && now - lastFpsAt >= 500) {
      const dt = now - lastFpsAt;
      const fps = (frames * 1000) / dt;
      const tps = (ticks * 1000) / dt;
      const buf = rd.gl ? `${rd.gl.drawingBufferWidth}x${rd.gl.drawingBufferHeight}` : '';
      let line = `${fps.toFixed(0)} fps  ${tps.toFixed(1)} tick/s  ${rd.inputVerts} verts  ${buf}  `
        + `spd=${array3[0].speed.toFixed(1)}`;
      if (BENCH_MS > 0) {
        line += benchStart === 0
          ? `   [warming up ${((WARMUP_MS - (now - bootAt)) / 1000).toFixed(1)}s]`
          : `   [measuring ${((BENCH_MS - (now - benchStart)) / 1000).toFixed(1)}s left]`;
      }
      if (SHOW_STATS) {
        // Per-second CPU cost of each half, and the share of one core.
        const simPer = simMs / dt * 1000;
        const drawPer = drawMs / dt * 1000;
        line += `\n  sim ${(simMs / Math.max(1, ticks)).toFixed(1)}ms/tick`
          + `  draw ${(drawMs / Math.max(1, frames)).toFixed(1)}ms/frame`
          + `  -> ${((simPer + drawPer) / 10).toFixed(0)}% of one core`
          + `  [interp=${INTERPOLATE ? 1 : 0}`
          + ` maxfps=${MAX_FPS || 'off'} pool=${POOLING ? 1 : 0}`
          + ` aa=${AA ? 1 : 0} textres=${textRes}]`;
      }
      log(line);
      frames = 0;
      ticks = 0;
      simMs = 0;
      drawMs = 0;
      lastFpsAt = now;
    }
  }
  requestAnimationFrame(frame);
}

/** Keyboard -> Control, matching GameSparker.keyDown/keyUp. */
function installInput(u, snd) {
  const set = (e, v) => {
    switch (e.code) {
      case 'ArrowUp':    case 'KeyW': u.up = v; break;
      case 'ArrowDown':  case 'KeyS': u.down = v; break;
      case 'ArrowLeft':  case 'KeyA': u.left = v; break;
      case 'ArrowRight': case 'KeyD': u.right = v; break;
      case 'Space':                   u.handb = v; break;
      case 'Enter':                   u.enter = v; break;
      case 'ShiftLeft':  case 'ShiftRight': u.lookback = v ? 1 : 0; break;
      default: return false;
    }
    e.preventDefault();
    return true;
  };
  addEventListener('keydown', (e) => {
    // Two separate AudioContexts need the gesture: web/audio.js's for sound
    // effects, and BassoonTracker's own for the music.
    if (snd) snd.unlock();
    music.unlock();
    set(e, true);
  });
  addEventListener('keyup', (e) => set(e, false));

  // A click unlocks audio too, and drives nothing. Without it the countdown is
  // silent for anyone who does not touch the keyboard first: it runs in the
  // first seven seconds of the race, both contexts start suspended under the
  // autoplay policy, and the gesture that started the race happened on the
  // launcher page, which does not carry over. Unlocking twice is a no-op.
  addEventListener('pointerdown', () => {
    if (snd) snd.unlock();
    music.unlock();
  });

  // Virtual joystick for mobile touch
  let startX = 0, startY = 0;
  const THRESHOLD = 30; // pixels

  addEventListener('touchstart', (e) => {
    if (snd) snd.unlock();
    music.unlock();
    
    // The first touch sets the anchor for the joystick and starts driving
    if (e.touches.length === 1) {
      startX = e.touches[0].pageX;
      startY = e.touches[0].pageY;
      u.up = true;
      u.touchTrick = false;
    } else if (e.touches.length >= 2) {
      u.touchTrick = true;
      const cx = (e.touches[0].pageX + e.touches[1].pageX) / 2;
      const cy = (e.touches[0].pageY + e.touches[1].pageY) / 2;
      startX = cx;
      startY = cy;
      u.touchTrickX = cx;
      u.touchTrickY = cy;
    }
  }, { passive: false });

  addEventListener('touchmove', (e) => {
    e.preventDefault(); // prevent browser scrolling
    if (e.touches.length === 0) return;
    
    let currentX = 0, currentY = 0;
    if (e.touches.length === 1) {
      currentX = e.touches[0].pageX;
      currentY = e.touches[0].pageY;
      u.touchTrick = false;
    } else if (e.touches.length >= 2) {
      u.touchTrick = true;
      currentX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
      currentY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
    }
    
    const dx = currentX - startX;
    const dy = currentY - startY;

    // Analog steering for ground (squared curve for better feel without huge deadzone)
    const STEER_MAX = 130.0;
    let steerNorm = Math.max(-1.0, Math.min(1.0, dx / STEER_MAX));
    u.steer = steerNorm * Math.abs(steerNorm);

    if (u.touchTrick) {
      u.touchTrickX = currentX;
      u.touchTrickY = currentY;
    }

    // Digital keys for braking
    u.left = dx < -THRESHOLD;
    u.right = dx > THRESHOLD;
    u.up = dy <= THRESHOLD;
    u.down = dy > 120; // Much larger deadzone for reverse to avoid accidental triggering
  }, { passive: false });

  const endTouch = (e) => {
    if (e.touches.length === 0) {
      u.up = false;
      u.down = false;
      u.left = false;
      u.right = false;
      u.handb = false;
      u.steer = 0.0;
      u.touchTrick = false;
    } else if (e.touches.length === 1) {
      u.touchTrick = false;
      u.handb = false;
      startX = e.touches[0].pageX;
      startY = e.touches[0].pageY;
    } else if (e.touches.length >= 2) {
      u.touchTrick = true;
      startX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
      startY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
    }
  };
  
  addEventListener('touchend', endTouch);
  addEventListener('touchcancel', endTouch);
}

boot().catch((e) => {
  log('BOOT FAILED: ' + e.message);
  console.error(e);
});
