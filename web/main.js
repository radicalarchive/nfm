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
import { setFaceSortRank } from './ContO.js';
import { Plane } from './Plane.js';
import { XtGraphics } from './XtGraphics.js';
import { loadIntoCarDefine } from './carstore.js';
import { objArray, setSeed } from './java.js';
import { readZip, readText, detectFpath } from './vfs.js';
import { loadHudImages } from './images.js';
import { Audio } from './audio.js';
import * as music from './music.js';
import { captureCar, applyCar, encodePacket, decodePacket } from './netcodec.js';
import { StateSync, driftOf, ownerOf } from './netsession.js';
import { NetPeer, makeRoomCode } from './netpeer.js';
import { Lobby } from './netlobby.js';

const log = (msg) => {
  console.log(msg);
  const el = document.getElementById('log');
  if (el) el.textContent = msg;
};

/**
 * Agree on the race before either side builds a world, from URL parameters.
 *
 * This is the headless path: `?net=host&humans=N` starts as soon as N people
 * are in, `?net=join&room=CODE` waits to be told. It is what the browser tests
 * drive, and what a shared link does. The LAUNCHER drives the same `Lobby`
 * from its own screen instead, where a person presses Start -- one protocol,
 * two drivers, so the tested path and the shipped path cannot drift apart.
 *
 * The host picks everything and the guest accepts it verbatim -- seed, stage,
 * the whole grid. Nothing is negotiated in the sense of being argued about:
 * two machines that each decided part of the setup would start from different
 * worlds, and while state sync would eventually drag the cars into agreement
 * it cannot fix a guest racing a different STAGE.
 */
async function negotiate(mode, params, cfg, keep) {
  const net = new NetPeer({ onStatus: (m) => log(m) });
  keep(net);
  const name = (params.get('name') || '').slice(0, 12);
  // How many people are racing. The rest of the grid is bots, which the host
  // owns and simulates.
  const humanCount = Math.max(2, Math.min(cfg.players,
    parseInt(params.get('humans') || '2', 10)));

  if (mode === 'host') {
    const code = (params.get('room') || makeRoomCode()).toUpperCase();
    const banner = document.getElementById('room');
    const hint = (joined) => {
      if (!banner) return;
      document.getElementById('roomcode').textContent = code;
      document.getElementById('roomhint').textContent =
        `Give this to the other players — ${joined}/${humanCount - 1} joined.`;
      banner.hidden = false;
    };
    hint(0);
    await net.openRoom(code);
    const lobby = new Lobby({
      net, isHost: true, name: name || 'Host', car: cfg.car, seed: cfg.seed,
      stage: cfg.stage, players: cfg.players, autoStart: humanCount,
    });
    lobby.onRoster = () => hint(lobby.roster.length - 1);
    const start = await lobby.ready;
    if (banner) banner.hidden = true;
    log(`racing ${start.names.slice(1).join(', ')} — room ${code}`);
    return { ...cfg, ...start };
  }

  const code = (params.get('room') || '').toUpperCase();
  if (!code) throw new Error('joining needs ?room=CODE');
  await net.join(code);
  const lobby = new Lobby({ net, isHost: false, name: name || 'Player', car: cfg.car });
  const start = await lobby.ready;
  net.localIndex = start.localIndex;
  log(`joined ${start.names[0]} as slot ${start.localIndex} — room ${code}`);
  return { ...cfg, ...start };
}

/**
 * Build a world and race it.
 *
 * Two callers. `main.html` passes nothing and every setting comes from the
 * query string, which is what the tools and any shared link use. The LAUNCHER
 * passes `params` it built from the menu plus, for a networked race, the
 * `session` its lobby already negotiated -- the peer connection has to survive
 * into the race, so the lobby cannot navigate here and a URL cannot carry it.
 *
 * @param opts.params   URLSearchParams to read settings from
 * @param opts.session  { net, cfg } from an already-agreed lobby
 * @param opts.onExit   called instead of navigating when the race ends
 */
export async function boot(opts = {}) {
  const params = opts.params || new URLSearchParams(location.search);
  const base = await detectFpath(params.get('path'));

  // ---- netplay handshake --------------------------------------------------
  //
  // Done BEFORE the world is built, because the host dictates every input to
  // the world's construction: seed, stage, grid and slot assignment. State
  // sync corrects a car that drifts, but it cannot reconcile two clients that
  // built different WORLDS, so only one machine decides any of it.
  const netMode = params.get('net');                 // 'host' | 'join' | null
  let net = null, sync = null;
  // Packets that have arrived and not yet been folded in. Applied at the tick
  // boundary rather than from the data callback, so a car never moves in the
  // middle of a simulation step.
  const inbox = [];
  let cfg = {
    seed: parseInt(params.get('seed') || '12345', 10),
    stage: parseInt(params.get('stage') || '1', 10),
    car: parseInt(params.get('car') || '1', 10),
    players: parseInt(params.get('players') || '7', 10),
    cars: null,
    localIndex: 0,
  };
  if (opts.session) {
    // The launcher already ran the lobby, on a connection that must not be
    // torn down: everything below treats it exactly as a negotiated race.
    net = opts.session.net;
    cfg = { ...cfg, ...opts.session.cfg };
    sync = new StateSync(cfg.localIndex, cfg.humanSlots, cfg.players);
  } else if (netMode === 'host' || netMode === 'join') {
    cfg = await negotiate(netMode, params, cfg, (n) => { net = n; });
    sync = new StateSync(cfg.localIndex, cfg.humanSlots, cfg.players);
  }
  // Peer id -> slot, from the host's start message. Room indices are private
  // to each client, so this is the only thing that can say WHICH player a
  // dropped connection was.
  const slotOfPeer = new Map();
  for (const [slot, id] of (cfg.ids || []).entries()) if (id) slotOfPeer.set(id, slot);

  // Who has finished building their world. Both clients load their own assets
  // after the lobby says go, and that takes seconds and differs per machine —
  // so without a barrier the faster one runs the countdown alone and starts
  // racing into a car that is still parsing zips. See `waitForEveryone`.
  const worldReady = new Set();
  if (sync) {
    // Chat and lobby traffic. Everyone is connected to everyone, so a line
    // reaches the other players directly and nobody forwards anything.
    net.onMessage = (msg) => {
      if (!msg) return;
      if (msg.t === 'ready') { worldReady.add(msg.slot); return; }
      // Quitting no longer drops the connection -- one swarm, and the peer
      // stays for the room we both return to -- so a player who leaves says
      // so, and it is handled exactly like the connection going away.
      if (msg.t === 'bye') { playerGone(msg.slot); return; }
      if (msg.t !== 'chat') return;
      const who = cfg.names[msg.slot] || `Player ${msg.slot + 1}`;
      log(`${who}: ${String(msg.text).slice(0, 80)}`);
    };
    net.onData = (d) => {
      const msg = decodePacket(d instanceof ArrayBuffer ? new Uint8Array(d) : d);
      if (!msg) return;
      inbox.push(msg);
      // No relay: on a mesh every client already has the packet first-hand,
      // and forwarding one would only deliver a duplicate that
      // `StateSync.accepts()` refuses on the tick rule.
    };
    // A dropped connection is a game event, not just a network one: see
    // `playerGone`.
    net.onClose = (_reason, from) => playerGone(slotOfPeer.get(net.idOf(from)));
  }

  /**
   * A player left, whether by quitting or by their browser going away.
   *
   * Their car is WASTED locally, because a car nobody is transmitting simply
   * dead-reckons forever: it never becomes `dest`, so "everyone else is
   * wasted" can never be satisfied and that race can never end. `dested = 3`
   * is the original's own marker for a disconnect (`Mad` preserves a 3 where
   * it would clear a 1 or 2), and it is what makes `stat()` announce the
   * player as disconnected rather than as wasted by somebody.
   */
  function playerGone(slot) {
    if (slot === undefined || slot === cfg.localIndex || !sync) return;
    if (sync.gone.has(slot)) return;
    sync.markGone(slot);
    log(`${cfg.names?.[slot] || `Player ${slot + 1}`} left the race`);
    // Everything they were driving, not just their own car. The host owns the
    // BOTS, so a host that leaves strands one car per bot: nobody transmits
    // them, they dead-reckon forever, they never become `dest`, and the
    // survivors' "everyone else is wasted" can never be satisfied -- which is
    // exactly how a player was left sitting in a race that could not end.
    // There is no host migration to hand them to (TASKS.md), so they go.
    for (let i = 0; i < cfg.players; i++) {
      if (ownerOf(i, cfg.humanSlots) !== slot) continue;
      if (array3[i]) array3[i].dest = true;
      checkPoints.dested[i] = 3;
    }
  }

  const stage = cfg.stage;
  // ?mycar=<name> races a car out of browser storage (or mycars/) instead of
  // one of the 16 built-in slots. Resolved after loadbase, once CarDefine
  // exists to load it into.
  const myCarName = params.get('mycar');
  let car = cfg.car;
  const players = cfg.players;
  const sameCars = params.get('cars') === 'same';
  setSeed(cfg.seed);

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
  // ?draw=0 skips gs.draw() outright — no projection, no backdrop, no
  // geometry. The simulation still runs at full rate, so the game plays
  // itself blind. Intended for netplay and physics tests, where the renderer
  // is the whole cost and none of the subject: `?raster=0` only stubs the
  // emit path, leaving Plane.d's per-vertex projection and medium.d()'s
  // backdrop to run in full.
  //
  // Safe only because draw()'s one genuine output, ContO.dist, feeds the
  // depth sort and NOTHING in the simulation. That was not always true: the
  // repair mechanic used to branch on it, which made the game ask "is anyone
  // looking at this car" and then change the physics. Re-check this flag if
  // anything in the sim ever reads dist again.
  const DRAW = params.get('draw') !== '0';
  const CATCHUP_DRAW = params.get('catchupdraw') === '1';
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
  setFaceSortRank(params.get('facesort') === 'rank');
  const record = new Record(medium);
  // ?ghost=0 stops the replay's ghost buffer cloning car models every cycle.
  // See the note on Record.ghosts: it is the game's largest allocator by a
  // wide margin, and nothing reads it back until the replay viewer is ported.
  record.ghosts = params.get('ghost') !== '0';

  log('building base models...');
  gs.loadbase(array, medium, trackers, zip);
  if (gs.mload === 2) log('warning: models.zip size mismatch');

  const array2 = objArray(610);                // placed objects
  const array3 = objArray(8);                  // Mad[8]
  for (let i = 0; i < 8; ++i) {
    array3[i] = new Mad(carDefine, medium, record, xt, i);
    gs.u[i] = new Control(medium);
  }

  if (myCarName) {
    const loaded = await loadIntoCarDefine(carDefine, { menu: false });
    const at = loaded.indexOf(myCarName);
    if (at < 0) {
      log(`no such car: ${myCarName} -- racing car ${car} instead`);
    } else {
      car = 16 + at;   // custom cars occupy slots 16.., as loadcarmaker() puts them
      log(`racing custom car "${myCarName}" (slot ${car})`);
    }
  }

  xt.nplayers = players;
  xt.sc[0] = car;
  if (cfg.cars) {
    // Netplay: the grid came off the wire already drawn. Re-running sortcars
    // here would consume randoms and desync the two clients before tick 0.
    for (let i = 0; i < 8; ++i) xt.sc[i] = cfg.cars[i];
    xt.im = cfg.localIndex;
    // Which slots are people. Simulation branches key on this rather than on
    // `im`, so both clients treat both human cars the same way; see
    // XtGraphics.human().
    xt.humans = new Set(cfg.humanSlots);
    // The original's own way of telling a human from a bot: a name containing
    // "MadBot". stat() at :1005 already reads it, so labelling here is enough
    // for the game to treat the remote player as a player.
    for (let i = 0; i < xt.nplayers; ++i) {
      const human = cfg.humanSlots.includes(i);
      xt.isbot[i] = !human;
      xt.plnames[i] = human ? (cfg.names[i] || `Player ${i + 1}`) : `MadBot${i}`;
    }
    // Every other person drives their own car; none of them is ours to steer.
    for (const slot of cfg.humanSlots) {
      if (slot !== cfg.localIndex) gs.u[slot].human = true;
    }
    // Under state sync the host owns the bots, so a guest must not run their
    // AI locally -- it would fight the state arriving on the wire. See the
    // `remote` gate in GameSparker.simulate().
    for (let i = 0; i < 8; ++i) gs.u[i].remote = sync ? sync.isRemote(i) : false;
  } else if (sameCars) {
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
  // A networked race has to LOOK networked to the transcribed game. `fase`
  // 7001 and `lan` are what every multiplayer branch of `stat()` keys on:
  // player names in the wasted announcer instead of car names
  // (XtGraphics:1737), the "(Disconnected)" line, and `exitm = 4` — spectate
  // until the race actually ends — instead of dropping the wasted player
  // straight out (:1106). Racing at fase 0 meant the game believed it was in
  // single player, which is exactly what both of those bugs were.
  xt.fase = sync ? 7001 : 0;
  xt.lan = !!sync;
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
  // ?music=0 stops the tracker ever initialising. musicvol=0 would not: the
  // mixer's ScriptProcessorNode still runs on the main thread at full cost.
  if (params.get('music') === '0' || musicvol === 0) music.disable();

  xt.snd = snd;
  snd.load().catch((e) => console.warn('sound unavailable:', e));

  log(`stage "${checkPoints.name}"  objects=${gs.nob}  checkpoints=${checkPoints.nsp}  laps=${checkPoints.nlaps}`);
  // The keyboard drives the live Control directly, in netplay as in single
  // player: this client is authoritative for its own car, so its input applies
  // the instant it happens and the net layer only ever overwrites cars it does
  // NOT own. Local input latency is therefore zero.
  //
  // Any scheme that rewrites the local Control from the network needs a shadow
  // control instead -- overwriting the live one undoes key RELEASES (the keyup
  // clears a flag, the net layer restores it, no further event ever arrives)
  // and the car accelerates forever.
  const pad = gs.u[cfg.localIndex];
  // INTERIM, and the port of `multistat()` supersedes it -- delete this
  // callback and the `onEscape` parameter when that lands (see TASKS.md,
  // "Port the multiplayer race lifecycle").
  //
  // Single player has a way out through `stat()`'s `fase == 0` branch, but at
  // fase 7001 that branch defers to `exitm`'s confirm menu, which lives in the
  // unported, mouse-driven `multistat()`. Until that exists there is no way to
  // leave a networked race at all. `fase = -2` is the Java's own "leave the
  // race" signal, so this takes the same path the end of a race does.
  //
  // Deliberately unconditional, `holdit` included: a wasted player is
  // SPECTATING there with `exitm == 4` swallowing Enter until the race ends,
  // which is exactly when someone wants out.
  installInput(pad, snd, () => {
    if (sync) xt.fase = -2;
  });

  // Chat send. Deliberately tiny -- the point is that the reliable channel is
  // wired end to end, not that this is the final UI; the real lobby and chat
  // screens are in the unported xtGraphics menus.
  if (sync) {
    window.nfmChat = (text) => {
      const msg = { t: 'chat', slot: cfg.localIndex, text: String(text).slice(0, 80) };
      // A bare sendMessage reaches every peer directly on a mesh, so there
      // is nothing to forward and nobody to forward it.
      net.sendMessage(msg);
      log(`${cfg.names[cfg.localIndex]}: ${msg.text}`);
    };
  }

  let backdropMs = 0;
  // Per-frame slices of draw, for the spike line. The bench report wants the
  // running total; a spike wants to know where THAT frame went, and the two
  // are different accumulators.
  let fBackdrop = 0, fRebuild = 0, fShadowMs = 0, fShadowN = 0;
  let fPlaneMs = 0, fPlaneN = 0;
  if (PROFILE) {
    const inner = medium.d.bind(medium);
    medium.d = (g) => {
      const t = performance.now();
      inner(g);
      const dt = performance.now() - t;
      backdropMs += dt;
      fBackdrop += dt;
    };
    // Rebuilding a wasted car's model runs inside draw() and copy-constructs a
    // whole ContO -- one Plane per face. It is charged to draw and scales with
    // nothing the scene counters measure, which is the signature the spikes
    // have.
    // The ground shadow. ContO.d runs Plane.s for EVERY plane of an object --
    // a car is ~100 -- and each call is three rot()s plus an O(n^2) sweep over
    // the face's own vertices to find its silhouette extremes, then a fill.
    // None of that is counted anywhere: a shadowed face submits its vertices
    // like any other, so the scene counters cannot tell a frame with seven
    // shadowed cars in it from a frame with none.
    // Plane.d itself: calls and total ms per frame. The scene counters say how
    // much geometry a frame had, and the late spikes have counters IDENTICAL
    // to a fast frame, so the question is whether those frames make more calls
    // or slower ones -- which no existing counter separates.
    const planeD = Plane.prototype.d;
    Plane.prototype.d = function (...a) {
      const t = performance.now();
      planeD.apply(this, a);
      fPlaneMs += performance.now() - t;
      fPlaneN++;
    };
    const shadow = Plane.prototype.s;
    Plane.prototype.s = function (...a) {
      const t = performance.now();
      shadow.apply(this, a);
      fShadowMs += performance.now() - t;
      fShadowN++;
    };
    const rebuild = gs.rebuildNewCars.bind(gs);
    gs.rebuildNewCars = (...a) => {
      const t = performance.now();
      rebuild(...a);
      fRebuild += performance.now() - t;
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
  // The DRAW bank of Medium's PRNG (see the note by its constructor). The sim
  // bank is untouched by draw() and must not be snapshotted -- restoring it
  // after an interpolated frame would rewind simulation state.
  const MED_STATE = ['dcntrn', 'dtrn'];
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
    into.rand.set(medium.drand);
    if (!into.diup) into.diup = [];
    for (let i = 0; i < 3; i++) into.diup[i] = medium.ddiup[i];
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
    medium.drand.set(snapCurr.rand);
    for (let i = 0; i < 3; i++) medium.ddiup[i] = snapCurr.diup[i];
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

  // ---- spike attribution --------------------------------------------------
  // `?spike=<ms>` logs every frame whose rAF-to-rAF gap exceeded <ms>, split
  // into where the time went. This exists because "the fps dips" is not a
  // debuggable statement and the averages in ?stats=1 cannot show it: a run
  // that spends 90% of its frames at 25fps and 10% at 3fps reports a mean that
  // matches neither.
  //
  // The buckets are measured on the PREVIOUS frame, because the gap reported
  // at frame N is what frame N-1 cost plus whatever ran between them:
  //
  //   sim   gs.simulate()
  //   draw  gs.draw(), both the tick's and the interpolated pass
  //   gl    rd.end() -- the bufferData upload and the one drawArrays. Timed
  //         separately because it was in no bucket at all, and a driver that
  //         blocks on the previous frame blocks HERE.
  //   othr  the rest of our own callback (blend, capture/restore, netplay)
  //   OUT   gap minus all of the above: time the main thread was not ours.
  //         GC, the music mixer's ScriptProcessorNode (which runs on the main
  //         thread, every 256 samples), compositing, or the browser waiting on
  //         a vsync it missed. A big OUT means the fix is not in the renderer.
  const SPIKE_MS = parseFloat(params.get('spike') || '0');
  let prevRaf = 0, prevSim = 0, prevDraw = 0, prevGl = 0, prevCpu = 0;
  // Scene weight for the same frame the timings above describe. Submitted
  // vertices alone cannot explain a spike -- there are frames costing 20x the
  // steady state at the SAME submitted count -- so the line carries projected
  // (what Plane.d transformed), emitted (what the fill and triangulator
  // produced, the only place polygon AREA shows up) and the object and face
  // counts beside it.
  let prevIn = 0, prevEmit = 0, prevProj = 0, prevObj = 0, prevFace = 0;
  let prevHeap = 0, prevBackdrop = 0, prevRebuild = 0;
  let prevShadowMs = 0, prevShadowN = 0;
  let prevPlaneMs = 0, prevPlaneN = 0;
  let heapAtLastReport = 0, shadowMsTotal = 0;
  let spikeCount = 0;
  // Coarse histogram of every frame gap, so a run reports how BAD the tail is
  // rather than just its mean. Buckets in ms.
  const HIST_EDGES = [20, 33, 50, 100, 200, 400, Infinity];
  const hist = new Array(HIST_EDGES.length).fill(0);
  let outMsTotal = 0, gapMsTotal = 0;
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
    + ` players=${players} stage=${stage}`
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
  async function leaveRace() {
    if (leaving) return;
    leaving = true;
    snd.stopAllLoops();
    music.stop();
    // A networked race returns to the ROOM it came from, not to the main menu.
    // The launcher reloads on the way out -- boot() installs input listeners,
    // an rAF loop, an audio graph and a music mixer, and unwinding all of that
    // by hand is teardown nobody would ever exercise -- so the room has to
    // survive the reload as data. It is cheap to act on now that rejoining is
    // a message rather than a tracker rendezvous.
    if (sync) {
      // Tell the others before the page goes away. A player who quits early is
      // a car nobody will transmit again, and the race has to be able to end
      // without them.
      try {
        net.sendMessage({ t: 'bye', slot: cfg.localIndex });
        // And let it leave. The reload below tears the connection down, and a
        // goodbye still sitting in the DataChannel buffer is a goodbye nobody
        // hears -- which puts the others back in the state this message exists
        // to prevent.
        await net.flush();
      } catch { /* already gone */ }
    }
    if (sync && cfg.room) {
      try {
        sessionStorage.setItem('nfm.rejoin', JSON.stringify({
          code: cfg.room,
          isHost: cfg.localIndex === 0,
          stage: cfg.stage,
          players: cfg.players,
        }));
      } catch { /* private mode, or storage full: we just land on the menu */ }
    }
    net?.close();
    if (opts.onExit) opts.onExit();
    else location.href = '../index.html';
  }

  // ---- state sync ----------------------------------------------------------
  //
  // netTick counts ticks from 0 on both machines, so "tick N" needs no clock
  // agreement: the race starts when both peers have exchanged start, and the
  // count is the shared reference from then on.
  //
  // Every tick this client publishes the absolute state of the cars it owns
  // and folds in whatever has arrived for the ones it does not. Between
  // packets a remote car is dead-reckoned: `Mad.drive` runs for it locally
  // with the last control flags received, exactly as the original does.
  //
  // NOTHING BLOCKS. There is no gate and no stall -- a peer that goes quiet
  // costs accuracy on its own car and nothing else, where lockstep froze the
  // whole race for everyone. That is the property being bought here, and the
  // reason a 3rd player is now a matter of slots rather than of topology.
  let netTick = 0;
  let silentSince = 0;

  /** Fold everything that has arrived, then publish our own cars. */
  function netExchange(now) {
    if (!sync) return;

    // ---- receive. Applied at the tick boundary, before the tick runs, so
    // the simulation steps forward FROM authoritative state rather than
    // having a car teleport mid-step.
    while (inbox.length) {
      const msg = inbox.shift();
      for (const rec of msg.cars) {
        if (!sync.accepts(rec.slot, msg.tick)) continue;   // stale or ours
        // Drift is measured BEFORE the fold: it is how far this client's dead
        // reckoning had wandered from the truth, which is the honest health
        // metric for this topology. Note it needs no round trip and cannot
        // repeat lockstep's checker bug -- there is nothing to wait for,
        // because the packet being compared against has by definition arrived.
        const drift = driftOf(rec, array2[rec.slot]);
        const hold = {};
        applyCar(rec, {
          mad: array3[rec.slot], contO: array2[rec.slot], control: gs.u[rec.slot],
          holdit: hold,
        });
        // The owner's own leaderboard position. `checkstat` recomputes this
        // every tick, but only from data it has; taking the sender's value
        // makes the standings agree immediately instead of after a lap.
        checkPoints.pos[rec.slot] = rec.pos;
        sync.setHolding(rec.slot, hold.holdit);
        sync.markApplied(rec.slot, msg.tick, drift);
      }
      if (msg.cars.length) silentSince = 0;
    }

    // ---- send. One packet carrying every car we own: our own, plus the
    // bots if we are the host.
    const records = sync.owned.map((slot) => captureCar(slot, {
      mad: array3[slot],
      contO: array2[slot],
      control: gs.u[slot],
      holdit: xt.holdit,
      pos: checkPoints.pos[slot],
      magperc: checkPoints.magperc[slot],
    }));
    net.send(encodePacket(netTick, records));

    // A quiet peer is not an error -- we keep racing on dead reckoning -- but
    // it is worth saying so, because the alternative is a player wondering why
    // the other car is driving in a straight line into a wall.
    if (!silentSince) silentSince = now;
    else if (now - silentSince > 3000) {
      // Distinguish the two silences. A player on their end-of-race screen has
      // told us so through `holdit` and is not a network problem; only report
      // the ones we have heard nothing from at all.
      const quiet = (cfg.humanSlots || []).filter((s) => s !== cfg.localIndex
        && !sync.gone.has(s) && !sync.holding.get(s));
      if (quiet.length) {
        log('no packets from the other player -- still racing on prediction');
      }
      silentSince = now;
    }
  }

  // How often the worst recent correction is reported. Under lockstep this was
  // a world-hash comparison, which is meaningless here: the two clients are
  // EXPECTED to disagree between packets, and the useful question is by how
  // much. Drift in game units answers it -- a car is ~200 units across, the
  // stage runs to +/-83000, so single digits are invisible and hundreds are a
  // rubber-band the player can see.
  const DRIFT_EVERY = 60;

  function netReport() {
    if (netTick % DRIFT_EVERY !== 0) return;
    const worst = sync.worstDrift();
    // Naming the slots corrected, not just the worst number: it is the only
    // externally visible evidence of WHICH peers are actually being heard.
    // A guest hearing the host but not the other guests looks identical to a
    // healthy session in a bare drift figure, and a mesh fails exactly that
    // way when one of its links never comes up.
    const slots = [...sync.drift.keys()].sort((a, b) => a - b).join(',');
    console.log(`drift @${netTick}: ${worst.toFixed(1)} units slots=${slots}`);
    if (worst > 400) log(`large correction: ${worst.toFixed(0)} units`);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    // Frozen after the benchmark window: no ticks, no draws, and the result
    // stays on screen. Press R to run another window.
    if (benchDone || leaving) return;

    const frameEntry = performance.now();
    // Heap at the top of the frame. A spike frame that also shows the heap
    // DROPPING collected garbage, i.e. the pause was a GC and the fix is
    // fewer allocations; one that shows the heap merely growing did the work
    // it was charged for. Chrome-only and quantised, which is enough to tell
    // a drop from a rise. Read before frameBody so `heap` is this frame's
    // starting size and `dHeap` the previous frame's net change.
    const heapNow = SPIKE_MS > 0 && performance.memory
      ? performance.memory.usedJSHeapSize : 0;
    if (SPIKE_MS > 0 && prevRaf > 0) {
      const gap = now - prevRaf;
      const out = gap - prevCpu;
      gapMsTotal += gap;
      outMsTotal += Math.max(0, out);
      for (let i = 0; i < HIST_EDGES.length; i++) {
        if (gap < HIST_EDGES[i]) { hist[i]++; break; }
      }
      if (gap >= SPIKE_MS) {
        spikeCount++;
        const othr = prevCpu - prevSim - prevDraw - prevGl;
        console.log(
          `SPIKE t=${(now / 1000).toFixed(1)}s gap=${gap.toFixed(1)}ms`
          + ` sim=${prevSim.toFixed(1)} draw=${prevDraw.toFixed(1)}`
          + ` gl=${prevGl.toFixed(1)} othr=${othr.toFixed(1)}`
          + (PROFILE ? ` bdrop=${prevBackdrop.toFixed(1)} rebld=${prevRebuild.toFixed(1)}`
          + ` shadow=${prevShadowMs.toFixed(1)}ms/${prevShadowN}`
          + ` planeD=${prevPlaneMs.toFixed(1)}ms/${prevPlaneN}` : '')
          + ` OUT=${out.toFixed(1)}`
          + ` obj=${prevObj} face=${prevFace}`
          + ` proj=${prevProj} sub=${prevIn} emit=${prevEmit}`
          + ` heap=${(heapNow / 1048576).toFixed(1)}MB`
          + ` dHeap=${((heapNow - prevHeap) / 1048576).toFixed(2)}MB`);
      }
    }
    prevRaf = now;
    prevHeap = heapNow;

    // frameBody has several early returns (the ?maxfps= gate, "nothing was
    // rendered", end of race). Wrapping it is the only way the cost of EVERY
    // path lands in prevCpu -- and the cheap paths are exactly the ones a
    // spike hides behind.
    frameBody(now);
    prevCpu = performance.now() - frameEntry;
  }

  function frameBody(now) {
    let fSim = 0, fDraw = 0, fGl = 0, ticksThisFrame = 0;
    fBackdrop = 0; fRebuild = 0; fShadowMs = 0; fShadowN = 0;
    fPlaneMs = 0; fPlaneN = 0;

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
      netExchange(now);
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
      // CATCH-UP TICKS DO NOT DRAW. When a frame runs late the loop below
      // steps several ticks, and drawing on each one meant a frame could
      // project and fill the entire scene four times -- 16,348 Plane.d calls
      // against a 4,087-face scene -- while three of those four batches were
      // thrown away by `rd.begin()` on the next iteration or by the
      // interpolated redraw. It is a spiral, not just waste: a late frame
      // earns extra ticks, extra ticks cost extra draws, and the next frame is
      // later still. Measured as THE cause of the 100-330ms frames.
      //
      // The last tick still draws, and that matters: draw() is what advances
      // per-tick visual state (Medium's flicker counters, ContO's dust and
      // repair stages) and what refreshes ContO.dist for the depth sort. One
      // tick draw per frame keeps both, and effects then animate at frame rate
      // rather than tick rate only while the machine is already behind.
      //
      // The respawn is simulation, not rendering, so it runs on every tick
      // either way -- same reason ?draw=0 calls it directly.
      // ?catchupdraw=1 restores drawing on every catch-up tick, for the A/B.
      const lastTick = CATCHUP_DRAW || acc - TICK_MS < TICK_MS;
      if (DRAW && lastTick) gs.draw(rd, medium, xt, array2, array3);
      else gs.rebuildNewCars(medium, xt, array2, array3);
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
      if (sync) {
        netTick++;
        netReport();
      }

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
      if (DRAW) gs.draw(rd, medium, xt, array2, array3);
      rd.replay(hudVerts);       // HUD last, so it stays on top
      medium.interpolating = false;
      restoreCurr();
      fDraw += performance.now() - t1;
    }
    const tGl = performance.now();
    rd.end();
    fGl = performance.now() - tGl;

    prevSim = fSim; prevDraw = fDraw; prevGl = fGl;
    // The scene counters belong to the frame that was just drawn, and the
    // spike line is printed one frame later, so they have to be latched here
    // alongside the timings. Reading them at print time reports the NEXT
    // frame's scene against the previous frame's cost.
    prevBackdrop = fBackdrop; prevRebuild = fRebuild;
    prevShadowMs = fShadowMs; prevShadowN = fShadowN;
    prevPlaneMs = fPlaneMs; prevPlaneN = fPlaneN;
    shadowMsTotal += fShadowMs;
    prevIn = rd.inputVerts; prevEmit = rd.vertexCount;
    prevProj = rd.projVerts; prevObj = rd.objDrawn; prevFace = rd.faceCalls;
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
      let line = `${fps.toFixed(0)} fps  ${tps.toFixed(1)} tick/s  ${rd.inputVerts}/${rd.vertexCount} verts  ${buf}  `
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
          + ` maxfps=${MAX_FPS || 'off'}`
          + ` aa=${AA ? 1 : 0} textres=${textRes}]`;
      }
      if (SPIKE_MS > 0) {
        // Allocation rate and shadow load for a NORMAL second, so the spike
        // lines have something to be compared against. A spike that allocates
        // 3MB says nothing until you know the quiet frames allocate 0.2MB.
        line += `\n  heap ${(prevHeap / 1048576).toFixed(0)}MB`
          + ` +${((prevHeap - heapAtLastReport) / 1048576).toFixed(1)}MB/s`
          + `  shadow ${(shadowMsTotal / Math.max(1, frames)).toFixed(1)}ms/frame`;
        heapAtLastReport = prevHeap;
        shadowMsTotal = 0;
        // Where the frames actually landed, not their mean. Read left to
        // right: <20 <33 <50 <100 <200 <400 400+.
        line += `\n  gaps ${hist.join('/')}  spikes=${spikeCount}`
          + `  offcpu=${(outMsTotal / Math.max(1, gapMsTotal) * 100).toFixed(0)}%`;
      }
      log(line);
      frames = 0;
      ticks = 0;
      simMs = 0;
      drawMs = 0;
      lastFpsAt = now;
    }
  }
  /**
   * Hold the start until every human's world exists.
   *
   * The lobby's `start` message is the decision to race, not the moment to
   * race: each client then loads its own stage, HUD images and sounds, which
   * is seconds and differs per machine. Whoever finished first would otherwise
   * run the 3-2-1 alone and be racing while somebody else's car was still an
   * unparsed zip — and that player takes the hits.
   *
   * Announced repeatedly rather than once, because a `ready` sent while the
   * other client is still in `boot()` arrives before it has replaced the
   * lobby's message handler, and the lobby drops what it does not recognise.
   *
   * The timeout is not a formality: it is what stops one player's broken load
   * from stranding everyone else, so it gives up and races.
   */
  async function waitForEveryone() {
    const humans = (cfg.humanSlots || []).filter((s) => !sync.gone.has(s));
    worldReady.add(cfg.localIndex);
    const deadline = performance.now() + 30000;
    log('waiting for the other players…');
    for (;;) {
      net.sendMessage({ t: 'ready', slot: cfg.localIndex });
      if (humans.every((s) => worldReady.has(s) || sync.gone.has(s))) return;
      if (performance.now() > deadline) {
        log('starting without everyone — someone is still loading');
        return;
      }
      await new Promise((r) => setTimeout(r, 250));
    }
  }

  if (sync) await waitForEveryone();
  requestAnimationFrame(frame);
}

/** Keyboard -> Control, matching GameSparker.keyDown/keyUp. */
function installInput(u, snd, onEscape) {
  const set = (e, v) => {
    switch (e.code) {
      case 'Escape': if (v) onEscape?.(); e.preventDefault(); return true;
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

// Nothing runs on import: `main.html` calls boot() with the query string, and
// the launcher calls it with the config its menu built. A module that raced on
// import could not be imported by a page that is not ready to race yet.
