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
import { objArray, setSeed } from './java.js';
import { readZip, readText, detectFpath } from './vfs.js';

const log = (msg) => {
  console.log(msg);
  const el = document.getElementById('log');
  if (el) el.textContent = msg;
};

async function boot() {
  const params = new URLSearchParams(location.search);
  const stage = parseInt(params.get('stage') || '1', 10);
  const car = parseInt(params.get('car') || '1', 10);        // 1 = formula7
  const players = parseInt(params.get('players') || '7', 10);
  const base = await detectFpath(params.get('path'));
  setSeed(parseInt(params.get('seed') || '12345', 10));

  const glCanvas = document.getElementById('gl');
  const textCanvas = document.getElementById('overlay');
  const rd = new Graphics2D(glCanvas, textCanvas, 800, 450);

  log(`assets at ${base} -- loading models.zip...`);
  const zip = await readZip('data/models.zip');

  const medium = new Medium();
  const trackers = new Trackers();
  const checkPoints = new CheckPoints();
  const array = objArray(124);                 // base models
  const gs = new GameSparker();
  const xt = new XtGraphics();
  const carDefine = new CarDefine(array, medium, trackers, gs);
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
  for (let i = 0; i < 8; ++i) xt.sc[i] = car;
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

  log(`stage "${checkPoints.name}"  objects=${gs.nob}  checkpoints=${checkPoints.nsp}  laps=${checkPoints.nlaps}`);
  installInput(gs.u[0]);

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

  let acc = 0;
  let last = performance.now();
  let frames = 0;
  let ticks = 0;
  let lastFpsAt = last;

  function frame(now) {
    acc += now - last;
    last = now;
    if (acc > TICK_MS * MAX_CATCHUP) acc = TICK_MS * MAX_CATCHUP;

    // rd.begin() lives inside the loop: each tick rebuilds the frame's vertex
    // buffer, and on a catch-up only the last one is presented.
    while (acc >= TICK_MS) {
      rd.begin();
      gs.tick(rd, medium, trackers, checkPoints, xt, record, array2, array3);
      acc -= TICK_MS;
      ticks++;
    }
    // Always present. If no tick ran this frame the buffer still holds the
    // previous frame's geometry, so this just re-issues the same draw call.
    rd.end();

    if (++frames >= 60) {
      const dt = now - lastFpsAt;
      const fps = (frames * 1000) / dt;
      const tps = (ticks * 1000) / dt;
      log(`${fps.toFixed(0)} fps  ${tps.toFixed(1)} tick/s  ${rd.vertexCount} verts  `
        + `x=${array2[0].x} z=${array2[0].z} spd=${array3[0].speed.toFixed(1)}`);
      frames = 0;
      ticks = 0;
      lastFpsAt = now;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/** Keyboard -> Control, matching GameSparker.keyDown/keyUp. */
function installInput(u) {
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
  addEventListener('keydown', (e) => set(e, true));
  addEventListener('keyup', (e) => set(e, false));
}

boot().catch((e) => {
  log('BOOT FAILED: ' + e.message);
  console.error(e);
});
