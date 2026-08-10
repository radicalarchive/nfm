// The launcher: menus, the multiplayer browser, the lobby, and the hand-off
// into a race.
//
// KEYBOARD FIRST, POINTER SECOND. Arrows move, Enter fires, Esc goes back, and
// left/right changes a value in place -- the original game's menus work that
// way and so does this. Clicking and hovering are wired to the same two verbs
// rather than to a parallel set of handlers, so there is exactly one place
// where a row's behaviour lives.
//
// ONE PAGE. A lobby holds a live WebRTC connection and a navigation would tear
// it down, so the race runs here rather than at another URL. `web/main.html`
// still exists as the URL-driven entry for the tools and for shared links; it
// imports the same `boot()`.
//
// WHAT THE HOST DECIDES. Seed, stage, grid and slot assignment, all of it
// shipped verbatim to the guests, because `sortcars()` consumes randoms and a
// client that regenerated any of it would diverge before the lights went out.
// See netlobby.js.

import { initPreview, carNames, carStats, drawCar, loadStage, stageName,
         faceURL, drawStage3D, drawMinimap, CAR_COUNT, loadCustomCars } from './preview.js';
import { NetPeer, makeRoomCode } from './netpeer.js';
import { Lobby, MAX_PLAYERS } from './netlobby.js';
import { Directory } from './netdirectory.js';

const $ = (id) => document.getElementById(id);
const STAGE_COUNT = 32;

/* ---- persisted settings ------------------------------------------------
 * Cars are remembered by NAME, never by slot: a custom car's slot is its
 * position in the storage listing, so saving another one silently renumbers
 * every slot above it and a remembered number would race a different car. */
const STORE_KEY = 'nfm.launcher';
const DEFAULTS = {
  name: '', car: 'Formula 7', stage: 1, players: 7, opponents: 'stage',
  sfxvol: 100, musicvol: 100, res: 2, interp: true, visibility: 'public',
};
let S = { ...DEFAULTS };
try { S = { ...S, ...JSON.parse(localStorage.getItem(STORE_KEY) || '{}') }; } catch { /* first run */ }
const save = () => {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch { /* private mode */ }
};

/* ---- value registry -----------------------------------------------------
 * Every left/right row on every page, in one place. `get`/`set` read and write
 * the settings object directly, so a row and the thing it configures cannot
 * drift apart. */
let CARS = [];        // [{ slot, name, custom }]
let STAGES = [];      // [{ n, name }]

const V = {
  car: {
    list: () => CARS,
    get: () => Math.max(0, CARS.findIndex((c) => c.name === S.car)),
    set: (i) => { S.car = CARS[i].name; save(); onCarChanged(); },
    text: () => CARS[V.car.get()]?.name || '…',
  },
  stage: {
    list: () => STAGES,
    get: () => Math.max(0, STAGES.findIndex((s) => s.n === S.stage)),
    set: (i) => { S.stage = STAGES[i].n; save(); onStageChanged(); },
    text: () => { const s = STAGES[V.stage.get()]; return s ? `${s.n}. ${s.name}` : '…'; },
  },
  players: {
    list: () => [2, 3, 4, 5, 6, 7, 8],
    get: () => V.players.list().indexOf(S.players),
    set: (i) => { S.players = V.players.list()[i]; save(); onLobbyEdit(); },
    text: () => `${S.players} cars`,
  },
  opponents: {
    list: () => ['stage', 'same'],
    get: () => V.opponents.list().indexOf(S.opponents),
    set: (i) => { S.opponents = V.opponents.list()[i]; save(); },
    text: () => (S.opponents === 'same' ? 'same as mine' : 'chosen by stage'),
  },
  visibility: {
    list: () => ['public', 'private'],
    get: () => V.visibility.list().indexOf(S.visibility),
    set: (i) => { S.visibility = V.visibility.list()[i]; save(); },
    text: () => (S.visibility === 'public' ? 'public — listed' : 'private — code only'),
  },
  sfxvol: {
    list: () => [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    get: () => V.sfxvol.list().indexOf(S.sfxvol),
    set: (i) => { S.sfxvol = V.sfxvol.list()[i]; save(); },
    text: () => (S.sfxvol ? `${S.sfxvol}%` : 'off'),
  },
  musicvol: {
    list: () => [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    get: () => V.musicvol.list().indexOf(S.musicvol),
    set: (i) => { S.musicvol = V.musicvol.list()[i]; save(); },
    text: () => (S.musicvol ? `${S.musicvol}%` : 'off'),
  },
  res: {
    list: () => [1, 1.5, 2, 3],
    get: () => V.res.list().indexOf(S.res),
    set: (i) => { S.res = V.res.list()[i]; save(); },
    text: () => `${S.res}x${S.res > 2 ? ' — heavy' : S.res === 1 ? ' — fastest' : ''}`,
  },
  interp: {
    list: () => [false, true],
    get: () => (S.interp ? 1 : 0),
    set: (i) => { S.interp = !!i; save(); },
    text: () => (S.interp ? 'on — display rate' : 'off — 18.9 fps'),
  },
};

/* ---- pages -------------------------------------------------------------- */
const MENU = ['Single Player', 'Multiplayer', 'Car Maker', 'Settings'];
const OPT_ROWS = [['players', 'Cars on track'], ['opponents', 'Opponents']];
const SET_ROWS = [['sfxvol', 'Sound'], ['musicvol', 'Music'],
                  ['res', 'Resolution'], ['interp', 'Smooth frames']];

const valueBits = (k) =>
  `<span class="pvalue"><b class="ar l">◂</b><span class="val" data-val="${k}"></span><b class="ar r">▸</b></span>`;

$('menu').innerHTML = MENU.map((t, i) =>
  `<li class="item" role="menuitem" data-act="menu:${i}"><span class="label">${t}</span></li>`).join('');
$('opt-rows').innerHTML = OPT_ROWS.map(([k, label]) =>
  `<li class="item orow" data-row="${k}"><span class="slabel">${label}</span>${valueBits(k)}</li>`).join('')
  + `<li class="item orow" data-act="back" style="justify-content:center"><span class="label" style="flex:none">Done</span></li>`;
$('set-rows').innerHTML =
  `<li class="item orow namerow" data-act="name"><span class="slabel">Your name</span>
     <span class="pvalue"><span class="val" id="setname"></span></span>
     <span class="rhint">Enter to change</span></li>`
  + SET_ROWS.map(([k, label]) =>
    `<li class="item orow" data-row="${k}"><span class="slabel">${label}</span>${valueBits(k)}</li>`).join('')
  + `<li class="item orow" data-act="back" style="justify-content:center"><span class="label" style="flex:none">Done</span></li>`;

const PAGE_IDS = ['menu', 'sp', 'opts', 'mp', 'lobby', 'set'];
const BACK = { sp: 'menu', opts: 'sp', mp: 'menu', lobby: 'mp', set: 'menu' };
const PAGES = {};
for (const id of PAGE_IDS) refreshItems(id);

/** Re-read a page's selectable rows. Needed wherever a list is rebuilt. */
function refreshItems(id) {
  const root = $('page-' + id);
  const prev = PAGES[id]?.sel || 0;
  PAGES[id] = { root, items: [...root.querySelectorAll('.item')], sel: prev };
  PAGES[id].sel = Math.min(prev, Math.max(0, PAGES[id].items.length - 1));
}
const pageName = () => document.body.dataset.page;
const page = () => PAGES[pageName()];

const HINTS = {
  menu:  '<kbd>↑</kbd><kbd>↓</kbd> move · <kbd>Enter</kbd> select',
  sp:    '<kbd>↑</kbd><kbd>↓</kbd> move · <kbd>←</kbd><kbd>→</kbd> change · <kbd>Enter</kbd> open / start · <kbd>Esc</kbd> back',
  opts:  '<kbd>↑</kbd><kbd>↓</kbd> move · <kbd>←</kbd><kbd>→</kbd> change · <kbd>Esc</kbd> back',
  mp:    '<kbd>↑</kbd><kbd>↓</kbd> move · <kbd>Enter</kbd> join / host · <kbd>←</kbd><kbd>→</kbd> public–private · <kbd>Esc</kbd> back',
  lobby: '<kbd>↑</kbd><kbd>↓</kbd> move · <kbd>←</kbd><kbd>→</kbd> change · <kbd>Enter</kbd> chat / start · <kbd>Esc</kbd> leave',
  set:   '<kbd>↑</kbd><kbd>↓</kbd> move · <kbd>←</kbd><kbd>→</kbd> change · <kbd>Esc</kbd> back',
};

function draw() {
  const p = page();
  if (!p) return;
  for (const q of Object.values(PAGES)) {
    q.items.forEach((el, i) => {
      const on = q === p && i === q.sel;
      el.classList.toggle('is-sel', on);
      el.setAttribute('aria-selected', String(on));
    });
  }
  $('hint').innerHTML = HINTS[pageName()] || '';
}

function move(d) {
  const p = page();
  if (!p || !p.items.length) return;
  // Wraps, like the game's own menus. Rows that are inert for this client
  // (a guest cannot change the stage) are skipped rather than selectable, so
  // the selection never lands somewhere that does nothing.
  let i = p.sel;
  for (let n = 0; n < p.items.length; n++) {
    i = (i + d + p.items.length) % p.items.length;
    if (!p.items[i].classList.contains('off')) break;
  }
  p.sel = i;
  draw();
  p.items[p.sel].scrollIntoView({ block: 'nearest' });
}

function goPage(name) {
  const prev = pageName();
  document.body.dataset.page = name;
  if (prev !== name) {
    if (name === 'mp') startBrowsing(); else if (prev === 'mp') stopBrowsing();
    if (name === 'sp') startSpin(); else stopSpin();
  }
  paintValues();
  draw();
}

let sayTimer;
/**
 * A transient line at the bottom of the screen.
 *
 * `sticky` keeps it up until something replaces it, which matters more than it
 * sounds: opening or joining a room is a tracker rendezvous that can take ten
 * seconds or more, and a toast that faded after two left the player looking at
 * an unchanged screen with no evidence anything was happening.
 */
function say(msg, sticky = false) {
  const el = $('say');
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(sayTimer);
  if (!sticky) sayTimer = setTimeout(() => el.classList.remove('on'), 2200);
}
const unsay = () => { clearTimeout(sayTimer); $('say').classList.remove('on'); };

/* An inline single-field editor, so naming yourself or typing a room code
 * never leaves the keyboard. */
function editInline(host, initial, done, { prefix, placeholder, upper } = {}) {
  const slot = host.querySelector('.pvalue') || host;
  const old = slot.innerHTML;
  slot.innerHTML = (prefix ? `<span class="slabel">${prefix}</span>` : '')
    + `<input class="editbox" value="${initial}" placeholder="${placeholder || ''}">`;
  const input = slot.querySelector('input');
  input.focus();
  input.select();
  let finished = false;
  const finish = (commit) => {
    if (finished) return;
    finished = true;
    const v = upper ? input.value.trim().toUpperCase() : input.value.trim();
    slot.innerHTML = old;
    paintValues();
    if (commit && v) done(v);
  };
  input.addEventListener('keydown', (e) => {
    e.stopPropagation();                    // the page's own keys must not fire
    if (e.key === 'Enter') finish(true);
    if (e.key === 'Escape') finish(false);
  });
  input.addEventListener('blur', () => finish(false));
}

/* ---- painting ----------------------------------------------------------- */
function paintValues() {
  for (const el of document.querySelectorAll('[data-val]')) {
    const k = el.dataset.val;
    if (V[k]) el.textContent = V[k].text();
  }
  $('nameval').textContent = S.name || '(unnamed)';
  $('setname').textContent = S.name || '(unnamed)';
  $('optsum').textContent = `${S.players} cars · ${V.opponents.text()}`;
  const car = CARS[V.car.get()];
  const meta = $('page-sp').querySelector('[data-meta="car"]');
  if (car && meta) {
    const { cls, bars } = carStats(car.slot);
    meta.textContent = (cls ? `Class ${cls}` : '') + (car.custom ? ' · my car' : '');
    $('carbars').innerHTML = bars.map(([n, v]) =>
      `<span class="pstat"><span>${n}</span><span class="track"><i style="--v:${v}%"></i></span></span>`).join('');
  }
  if (lobby) paintLobby();
}

/* ---- car and stage previews --------------------------------------------- */
let angle = 210, spinning = 0;
function spin() {
  angle = (angle + 0.6) % 360;
  const car = CARS[V.car.get()];
  if (car) drawCar($('carview'), car.slot, angle);
  spinning = requestAnimationFrame(spin);
}
function startSpin() { if (!spinning) spinning = requestAnimationFrame(spin); }
function stopSpin() { cancelAnimationFrame(spinning); spinning = 0; }

function onCarChanged() {
  const car = CARS[V.car.get()];
  if (car) drawCar($('carview'), car.slot, angle);
  paintValues();
  if (lobby) lobby.setCar(car.slot);
}

/**
 * A stage changed: the name and the lobby update now, the picture shortly.
 *
 * A preview costs a real `loadstage` plus a renderer pass, and preview.js runs
 * them one at a time, so holding a key down queued one build per stage passed
 * and the picture arrived several stages behind the player. Only the stage
 * they come to rest on is worth building; the wait is short enough that a
 * single keypress still feels immediate.
 */
let stageTimer = 0;
function onStageChanged() {
  paintValues();
  if (lobby) onLobbyEdit();
  clearTimeout(stageTimer);
  stageTimer = setTimeout(drawStagePreview, 130);
  $('page-sp').querySelector('.thumb-map').classList.add('busy');
}

let stageToken = 0;
async function drawStagePreview() {
  const n = S.stage;
  const mine = ++stageToken;
  const meta = $('page-sp').querySelector('[data-meta="stage"]');
  try {
    const s = await loadStage(n);
    if (mine !== stageToken) return;                 // superseded by a faster key
    // Must follow loadStage immediately: it reuses one placed-object array.
    // Every stage renders now, so the flat map is only a safety net for one
    // that comes back empty.
    const empty = drawStage3D($('mapview'), s) < 200;
    $('mapview').hidden = empty;
    $('mapflat').hidden = !empty;
    if (empty) drawMinimap($('mapflat'), s);
    if (meta) meta.textContent = `${s.laps} laps · ${s.checkpoints} checkpoints`;
  } catch {
    if (meta) meta.textContent = 'could not load this stage';
  }
  if (mine === stageToken) {
    $('page-sp').querySelector('.thumb-map').classList.remove('busy');
  }
}

/* ---- the race ------------------------------------------------------------
 * Settings become a URLSearchParams because that is already the port's one
 * configuration surface: main.html, the benchmark and every deep link read the
 * same keys, so the menu adds no second way to configure a race. */
function raceParams(extra = {}) {
  const p = new URLSearchParams();
  const car = CARS[V.car.get()];
  if (car?.custom) p.set('mycar', car.name);
  else if (car) p.set('car', String(car.slot));
  p.set('stage', String(S.stage));
  p.set('players', String(S.players));
  if (S.opponents === 'same') p.set('cars', 'same');
  p.set('sfxvol', String(S.sfxvol));
  p.set('musicvol', String(S.musicvol));
  p.set('res', String(S.res));
  if (!S.interp) p.set('interp', '0');
  for (const [k, v] of Object.entries(extra)) p.set(k, String(v));
  return p;
}

/**
 * Scale the 800x450 stage to fill the window.
 *
 * A GPU-composited transform, free per frame, and independent of RENDER
 * resolution (?res= sets the backing store). Conflating display size with
 * render scale is what made the old CheerpJ build fill-bound.
 */
function fitStage() {
  const s = Math.min(innerWidth / 800, innerHeight / 450);
  $('stage').style.transform = `scale(${s})`;
}
addEventListener('resize', () => { if (racing) fitStage(); });

let racing = false;
async function startRace(session) {
  if (racing) return;
  racing = true;
  stopSpin();
  stopBrowsing({ force: true });
  document.body.dataset.page = 'race';
  fitStage();
  $('log').textContent = 'loading…';
  try {
    const { boot } = await import('./main.js');
    await boot({
      params: raceParams(),
      session,
      // The race ends by coming back here. A reload is the honest way to do
      // it: boot() installs input listeners, an rAF loop, audio and a music
      // mixer, and unwinding all of that by hand to reach a menu we can
      // rebuild from localStorage in a few hundred milliseconds would be a
      // large amount of teardown nobody would ever exercise.
      onExit: () => location.reload(),
    });
  } catch (e) {
    racing = false;
    document.body.dataset.page = 'menu';
    say('could not start: ' + e.message);
    console.error(e);
  }
}

/* ---- multiplayer: the directory ----------------------------------------- */
let directory = null;

async function startBrowsing() {
  paintGames([]);
  if (!directory) {
    directory = new Directory({ onChange: paintGames });
    try {
      await directory.start();
    } catch (e) {
      $('gcount').textContent = 'no tracker — use a code';
      console.warn(e);
      return;
    }
  }
  if (lobby?.isHost) announceRoom();
  paintGames(directory.list());
}

function stopBrowsing({ force = false } = {}) {
  // The directory is kept alive while hosting: the whole point of the listing
  // is that other people can still see the room after we stop looking at the
  // list ourselves. A race is the exception -- the room is not open any more,
  // and `lock()` has already dropped everyone we could have told.
  if (!directory || (lobby?.isHost && !force)) return;
  directory.stop();
  directory = null;
}

function paintGames(games) {
  const list = $('gamelist');
  if (!games.length) {
    list.innerHTML = `<li class="empty">No games listed. Someone has to host one —
      or use <b>Join by code</b> if you were given a code.</li>`;
    $('gcount').textContent = directory ? 'nobody hosting' : 'looking…';
  } else {
    list.innerHTML = games.map((g) => `
      <li class="item grow" data-act="join:${g.code}">
        <span class="gname">${escapeHTML(g.name)}</span>
        <span class="gcell w12">${escapeHTML(stageLabel(g.stage))}</span>
        <span class="gcell w6">${g.players}/${g.max}</span>
        <span class="gcell w6">${g.ping === undefined ? '—' : g.ping + 'ms'}</span>
      </li>`).join('');
    $('gcount').textContent = `${games.length} game${games.length > 1 ? 's' : ''} · Enter to join`;
  }
  refreshItems('mp');
  if (pageName() === 'mp') draw();
}

const escapeHTML = (s) => String(s).replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const stageLabel = (n) => {
  const s = STAGES.find((x) => x.n === n);
  return s ? `${s.n}. ${s.name}` : `Stage ${n}`;
};

/* ---- multiplayer: the lobby --------------------------------------------- */
let net = null, lobby = null;

function announceRoom() {
  if (!directory || !lobby?.isHost || S.visibility !== 'public') return;
  directory.announce({
    code: net.code,
    name: `${S.name || 'somebody'}'s game`,
    stage: lobby.stage,
    players: lobby.roster.length,
    max: Math.min(lobby.players, MAX_PLAYERS),
  });
}

/** Host or guest: put the lobby screen in front of a live session. */
function enterLobby(isHost, code) {
  $('lobby-code').textContent = code;
  $('lobby-name').textContent = isHost ? `${S.name || 'your'}'s game` : `room ${code}`;
  lobby.onRoster = () => { syncFromLobby(); paintLobby(); announceRoom(); };
  lobby.onChat = () => paintLobby();
  // The host closing its tab is the one departure a guest cannot sit through:
  // nobody else can seat players or start the race, so say so and go back to
  // the list rather than leave them looking at a lobby that will never move.
  lobby.onHostGone = () => {
    leaveLobby();
    say('the host left the game');
  };
  lobby.ready.then((cfg) => startRace({ net, cfg }));
  syncFromLobby();
  goPage('lobby');
  PAGES.lobby.sel = 0;
  draw();
}

/** The host's stage/car/player choices ARE the lobby's; keep the two in step. */
function syncFromLobby() {
  if (!lobby) return;
  if (!lobby.isHost) { S.stage = lobby.stage; S.players = lobby.players; }
  const me = lobby.me;
  if (me) {
    const c = CARS.find((x) => x.slot === me.car);
    if (c) S.car = c.name;
  }
  // A guest cannot change the stage or the grid size, so those rows are inert
  // for it -- shown, because they are information, but never selectable.
  for (const el of $('lobby-rows').querySelectorAll('[data-host]')) {
    el.classList.toggle('off', !lobby.isHost);
  }
  const startRow = $('lobby-rows').querySelector('[data-act="start"]');
  startRow.classList.toggle('off', !lobby.isHost);
  $('startlabel').textContent = lobby.isHost
    ? `Start Race — ${lobby.roster.length} player${lobby.roster.length > 1 ? 's' : ''}`
    : 'Waiting for the host…';
  refreshItems('lobby');
}

function onLobbyEdit() {
  if (!lobby?.isHost) return;
  lobby.setStage(S.stage);
  lobby.setPlayers(S.players);
  announceRoom();
}

function paintLobby() {
  if (!lobby) return;
  $('plist').innerHTML = lobby.roster.map((p) => {
    const car = CARS.find((c) => c.slot === p.car);
    const me = p.slot === (lobby.localIndex < 0 ? 0 : lobby.localIndex);
    return `<li class="prow${me ? ' me' : ''}">
      <span class="pn">${p.slot === 0 ? '★ ' : ''}${escapeHTML(p.name)}${me ? ' (you)' : ''}</span>
      <span class="pcar">${escapeHTML(car?.name || 'car ' + p.car)}</span></li>`;
  }).join('');
  $('pcount').textContent = `${lobby.roster.length} / ${Math.min(lobby.players, MAX_PLAYERS)}`;
  $('chatlog').innerHTML = lobby.chat.map(([who, msg]) =>
    `<div><b>${escapeHTML(who)}:</b> ${escapeHTML(msg)}</div>`).join('');
  const log = $('chatlog');
  log.scrollTop = log.scrollHeight;
}

async function hostGame(reuseCode = null) {
  if (!S.name) { say('give yourself a name first'); return; }
  // A rematch reopens the SAME code, so guests coming back from the race find
  // the room they left rather than a new one.
  const code = reuseCode || makeRoomCode();
  net = new NetPeer({ onStatus: (m) => say(m, true) });
  try {
    // Local: opening a room is registering a label, not a rendezvous. The only
    // wait is joining the swarm, which the multiplayer screen already did.
    await net.openRoom(code);
  } catch (e) {
    net = null;
    say('could not open a room: ' + e.message);
    return;
  }
  lobby = new Lobby({
    net, isHost: true, name: S.name, car: CARS[V.car.get()].slot,
    seed: (Math.random() * 1e9) | 0, stage: S.stage, players: S.players,
  });
  unsay();
  enterLobby(true, code);
  if (!directory) await startBrowsing();
  announceRoom();
}

async function joinGame(code) {
  if (!S.name) { say('give yourself a name first'); return; }
  // A game we can see in the list is a peer we are already connected to, so
  // joining it is a message and completes immediately. A typed code has to be
  // asked about, which is the only part of joining that waits for anything.
  const host = directory?.games.get(code)?.from || null;
  if (!host) say(`looking for room ${code}…`, true);
  net = new NetPeer({ onStatus: (m) => say(m, true) });
  try {
    await net.join(code, host);
  } catch (e) {
    net = null;
    say(e.message);
    return;
  }
  unsay();
  lobby = new Lobby({ net, isHost: false, name: S.name, car: CARS[V.car.get()].slot });
  enterLobby(false, code);
}

function leaveLobby() {
  directory?.withdraw();
  lobby?.leave();
  lobby = null;
  try { net?.close(); } catch { /* already gone */ }
  net = null;
  goPage('mp');
}

/* ---- input --------------------------------------------------------------- */
function fire() {
  const p = page();
  const el = p?.items[p.sel];
  if (!el || el.classList.contains('off')) return;
  const act = el.dataset.act;
  if (!act) return;                  // value rows: left/right is the whole thing
  const [cmd, arg] = act.split(':');
  switch (cmd) {
    case 'menu':
      if (+arg === 0) return goPage('sp');
      if (+arg === 1) return goPage('mp');
      if (+arg === 2) return void (location.href = './web/careditor.html');
      return goPage('set');
    case 'opts':  return goPage('opts');
    case 'back':  return goPage(BACK[pageName()]);
    case 'go':    return void startRace(null);
    case 'name':  return editInline(el, S.name, (v) => {
      S.name = v.slice(0, 12); save(); paintValues();
    }, { placeholder: 'your name' });
    case 'host':  return void hostGame();
    case 'joincode': return editInline(el, '', (v) => joinGame(v),
      { prefix: 'Room code', placeholder: 'ABC123', upper: true });
    case 'join':  return void joinGame(arg);
    case 'chat':  return editInline(el, '', (v) => lobby?.say(v),
      { prefix: 'Say', placeholder: 'hello' });
    case 'start': return void lobby?.start();
    default:
  }
}

function sideways(d) {
  const p = page();
  const el = p?.items[p.sel];
  const k = el?.dataset.row;
  if (!k || !V[k] || el.classList.contains('off')) return;
  const list = V[k].list();
  if (!list.length) return;
  V[k].set((V[k].get() + d + list.length) % list.length);
  paintValues();
}

addEventListener('keydown', (e) => {
  if (racing) return;                        // the race owns the keyboard
  if (e.target.tagName === 'INPUT') return;  // an inline editor is open
  switch (e.key) {
    case 'ArrowUp':    move(-1); break;
    case 'ArrowDown':  move(+1); break;
    case 'ArrowLeft':  sideways(-1); break;
    case 'ArrowRight': sideways(+1); break;
    case 'Enter':      fire(); break;
    case 'Escape': {
      const back = BACK[pageName()];
      if (pageName() === 'lobby') leaveLobby();
      else if (back) goPage(back);
      break;
    }
    default: return;
  }
  e.preventDefault();
});

// Pointer support routes into the same two verbs rather than a parallel set of
// handlers: hovering moves the selection, clicking fires it, and clicking an
// arrow changes the value the way the arrow key would.
document.addEventListener('pointermove', (e) => {
  if (racing) return;
  const el = e.target.closest?.('.item');
  const p = page();
  if (!el || !p || el.classList.contains('off')) return;
  const i = p.items.indexOf(el);
  if (i >= 0 && i !== p.sel) { p.sel = i; draw(); }
});
document.addEventListener('click', (e) => {
  if (racing) return;
  const el = e.target.closest?.('.item');
  const p = page();
  if (!el || !p || el.classList.contains('off')) return;
  // Re-index if we do not recognise the row. The games list rebuilds itself
  // every few seconds as the directory hears from hosts, so a row clicked
  // moments after a rebuild is a DIFFERENT element from the one in `items` --
  // and looking it up by index alone silently dropped the click, which reads
  // as the game being unjoinable.
  let i = p.items.indexOf(el);
  if (i < 0) {
    refreshItems(pageName());
    i = page().items.indexOf(el);
    if (i < 0) return;
  }
  page().sel = i;
  draw();
  const arrow = e.target.closest('.ar');
  if (arrow) sideways(arrow.classList.contains('l') ? -1 : +1);
  else fire();
});

/**
 * Come back to the room after a race.
 *
 * The race ends by reloading this page — `boot()` installs input listeners, an
 * rAF loop, an audio graph and a music mixer, and unwinding all of that by
 * hand would be teardown nobody ever exercises — so the room survives as a
 * note in sessionStorage and is re-entered here. The host reopens the same
 * code and the guests ask for it again; on one swarm that is a message and a
 * `find`, not a rendezvous, which is what makes this cheap enough to do.
 *
 * Read once and cleared immediately: a reload that fails to rejoin must land
 * you on the menu, not in a loop trying to re-enter a room nobody is hosting.
 */
async function resumeRoom() {
  let back = null;
  try {
    back = JSON.parse(sessionStorage.getItem('nfm.rejoin') || 'null');
    sessionStorage.removeItem('nfm.rejoin');
  } catch { return; }
  if (!back?.code) return;
  if (back.stage) S.stage = back.stage;
  if (back.players) S.players = back.players;
  goPage('mp');
  await startBrowsing();
  if (back.isHost) await hostGame(back.code);
  else await joinGame(back.code);
}

/* ---- boot ---------------------------------------------------------------- */
(async () => {
  $('brandsub').textContent = 'loading…';
  try {
    await initPreview();
    // Decorative: a missing images.zip must not stop you racing.
    faceURL().then((u) => { $('face').src = u; }).catch(() => {});

    CARS = carNames().map((name, slot) => ({ slot, name, custom: false }));
    const custom = await loadCustomCars();
    custom.forEach((name, i) => CARS.push({ slot: CAR_COUNT + i, name, custom: true }));
    if (!CARS.some((c) => c.name === S.car)) S.car = DEFAULTS.car;

    const names = await Promise.all(
      Array.from({ length: STAGE_COUNT }, (_, i) => stageName(i + 1)));
    STAGES = names.map((name, i) => ({ n: i + 1, name: name || `Stage ${i + 1}` }))
                  .filter((s, i) => names[i]);
    if (!STAGES.some((s) => s.n === S.stage)) S.stage = STAGES[0]?.n ?? 1;

    $('brandsub').textContent = 'press enter to race';
    paintValues();
    onCarChanged();
    await drawStagePreview();
    draw();
    await resumeRoom();
  } catch (e) {
    $('brandsub').textContent = 'failed to load game data';
    say(e.message);
    console.error(e);
  }
})();
