// The Car Maker shell: HTML around the transpiled chunks.
//
// The editor's UI is HTML, not canvas. Only the 3D preview is drawn, and it is
// drawn by the game's own renderer.
//
// What is NOT thrown away is the behaviour. Clicking "Scale X +" here runs the
// ported tab2 code -- the same 1,600 lines the desktop editor runs, checked
// against the real Java by a reflection probe -- with drawing switched off.
// web/careditor/headless.js explains the bridge: the original's hit testing IS
// its drawing pass, so a pane can be run for its button rects and then re-run
// with the mouse placed on one of them.
//
// The rule from CAREDITOR_PORT_SPEC holds: nothing here reaches into a
// transpiled method, and no transpiled method reaches into storage. savefile()
// hands back .rad text and carstore takes it from there, which is what makes a
// future "submit to nfm_contrib" button a sink for the same string.

import { newCarMaker } from './state.js';
import { setupo, loadfile, savefile, newcar, checko } from './files.js';
import { setheme } from './shape.js';
import { init } from './boot.js';
import { tab1 } from './tab1.js';
import { tab2 } from './tab2.js';
import { rows, act, tick, Recorder } from './headless.js';
import { ctachm } from './ctachm.js';
import { listAll, listStored, readCar, writeCar, deleteCar } from '../carstore.js';
import { detectFpath } from '../vfs.js';
import { Graphics2D } from '../graphics.js';

const $ = (id) => document.getElementById(id);
const code = $('code'), pick = $('pick'), status = $('status'), err = $('err');

let cm = null;
let rd = null;
let current = null;
let stored = [];

// ---- preview ----------------------------------------------------------------
//
// Turntable: drag turns (yaw) and tilts (pitch), the wheel dollies in and out.
// The model's own xz/zy are what the game rotates, so the camera never moves --
// the same trick the car-select screen uses.

const view = { yaw: 210, pitch: 12, dist: 800, spinning: true };
const DIST_MIN = 320, DIST_MAX = 2600;

function camera() {
  const m = cm.m;
  // From run() (java-src/CarMaker.java:360-370): the editor's own 700x550 view.
  m.w = 700;
  m.cx = 350;
  m.y = -240;
  m.z = -400;
  m.zy = 4;
  m.focus_point = 800;
  m.fadfrom(8000);
  m.cfade[0] = 187;
  m.cfade[1] = 210;
  m.cfade[2] = 227;
  // Supplied by the applet's frame in the original, so not in the chunk.
  m.h = 550;
  m.cy = 275;
  m.cz = 50;
  m.x = 0;
  m.xz = 0;
  m.ground = 495;
  m.ih = 0;
  m.iw = 0;
  m.trk = 0;
  m.crs = false;
}

/** Re-parse the text into a ContO. This is `setupo()`, unchanged. */
function reparse() {
  cm.m.loadnew = true;
  try {
    setupo(cm);
  } catch (e) {
    err.textContent = String(e.message || e);
    return;
  }
  const o = cm.o;
  $('npolys').textContent = o.npl;
  $('wheels').textContent = o.wh;
  err.textContent = o.errd ? o.err : '';
  const ready = o.colok >= 2 && o.npl > 60 && !o.errd;
  $('ready').innerHTML = ready
    ? '<b style="color:#7ddc9a">ready to race</b>'
    : '<span style="color:#8b93a7">not raceable yet</span>';
  $('drive').disabled = !ready || !current;
  syncPanes();
}

function draw() {
  if (!cm.o) return;
  camera();
  const o = cm.o;
  o.x = cm.ox;
  o.y = cm.oy;
  o.z = view.dist;
  o.xz = Math.round(view.yaw) % 360;
  o.zy = Math.round(view.pitch) % 360;
  o.xy = 0;
  o.wzy = (o.wzy - 10) % 360;
  const hadShadow = o.shadow;
  o.shadow = false;               // nothing to cast one onto in a bare preview
  try {
    rd.begin();
    o.d(rd);
    rd.end();
  } finally {
    o.shadow = hadShadow;
  }
}

function frame() {
  if (view.spinning) view.yaw = (view.yaw + 0.6) % 360;
  draw();
  requestAnimationFrame(frame);
}

// ---- driving the transpiled panes -------------------------------------------

/**
 * Run a pane's per-frame pass with nothing clickable. Panes recompute from the
 * source text on entry -- tab2 reads ScaleX/ScaleY/ScaleZ back out of it, tab1
 * counts polygons -- so this is what keeps the HTML in step with typing.
 */
function refreshPane(tabFn) {
  cm.rd = new Recorder();
  tick(cm, tabFn);
}

/**
 * Enter one of tab2's sub-panes the way clicking its tab does.
 *
 * `dtabed` is the pane the chunk last initialised. Setting it to something
 * else is what makes the chunk re-read the source on the next run -- that is
 * where ScaleX/ScaleY/ScaleZ, the stats and the physics values come back out
 * of the .rad text. Enter with dtabed == dtab and the pane keeps whatever was
 * in cm.scale from last time, which is how the first cut of this showed 100
 * for a car scaled to 145.
 */
function enterPane(dtab) {
  cm.tab = 2;
  cm.tabed = 2;
  cm.dtab = dtab;
  cm.dtabed = -1;
  refreshPane(tab2);
}

/**
 * The pane draws floats straight from a float32 field, so a scale of 1.45
 * arrives as "1.4500000476837158". That is the Java's own value and the
 * transpilation is right -- it is only unreadable, so trim it for display.
 */
function shortNumber(s) {
  const n = Number(s);
  return Number.isFinite(n) ? String(Math.round(n * 1000) / 1000) : s;
}

/** Render one sub-pane's buttons as HTML, grouped into the rows it drew them in. */
function renderRows(host, dtab, filter) {
  const tabFn = tab2;
  enterPane(dtab);
  cm.rd = new Recorder();
  const laid = rows(cm, tabFn).filter(filter || (() => true));
  host.innerHTML = '';
  for (const row of laid) {
    const div = document.createElement('div');
    div.className = 'stat-row';
    div.style.gridTemplateColumns = '11rem auto';
    const cap = document.createElement('span');
    cap.textContent = row.caption;
    div.appendChild(cap);
    if (row.value && row.value !== row.caption) {
      const val = document.createElement('span');
      val.textContent = shortNumber(row.value);
      val.style.cssText = 'color:#e6e8ee;font-variant-numeric:tabular-nums;margin-right:.6rem';
      div.appendChild(val);
      div.style.gridTemplateColumns = '9rem 4rem auto';
    }
    const group = document.createElement('span');
    for (const b of row.buttons) {
      const el = document.createElement('button');
      el.type = 'button';
      el.textContent = b.label.trim() || '·';
      el.style.marginRight = '.3rem';
      el.onclick = () => {
        // Re-enter the sub-pane this button was harvested from: another pane
        // may have been rendered since, and the chunk dispatches on dtab.
        cm.tab = 2;
        cm.tabed = 2;
        cm.dtab = dtab;
        cm.dtabed = dtab;
        act(cm, tabFn, ctachm, b);
        reparse();
      };
      group.appendChild(el);
    }
    div.appendChild(group);
    host.appendChild(div);
  }
}

/** The 3D Edit pane: tab2's scale/align controls and its wheel controls. */
function syncEditPane() {
  renderRows($('scale-buttons'), 2);
  renderRows($('wheel-fields'), 3);
}

/** The Stats pane: tab2's dtab 4 (stats and class) and 5 (physics). */
function syncStatsPane() {
  renderRows($('stat-rows'), 4);
  renderRows($('phys-rows'), 5);
}

function syncPanes() {
  const pane = document.querySelector('.tabs button[aria-selected=true]')?.dataset.pane;
  try {
    if (pane === 'edit') syncEditPane();
    else if (pane === 'stats') syncStatsPane();
  } catch (e) {
    // A pane that throws must not take the preview down with it.
    console.warn('pane refresh failed:', e);
  }
}

// ---- what the HTML replaces -------------------------------------------------
//
// Commented out rather than deleted, because the code behind them is still
// live -- these are the CANVAS entry points, not the behaviour:
//
//   import { tab0 } from './tab0.js';     // the car-file pane -> the Files tab
//   import { tab3 } from './tab3.js';     // the stats/publish pane -> Stats
//   import { input } from './input.js';   // mouse/key handlers -> DOM events
//   import { drawms, hidefields } from './ui.js';   // the canvas cursor and
//                                                   // AWT show/hide dance
//   runHead(cm); ... ctachm(cm); repaint();          // the applet frame loop
//
// tab0's list and tab3's rows are HTML now, and the panes that ARE still run
// (tab1, tab2) are run for their state, with `Recorder` swallowing the draw
// calls. ctachm stays, because it is not drawing -- it is the hit-test
// dispatch that every button in this file goes through.
//
// The two dropped panes keep their tests and their probes; if the HTML ever
// needs what they know (tab3's publish rows, tab0's rename/delete flow), the
// bridge in headless.js can drive them exactly as it drives tab2.

// ---- car list ---------------------------------------------------------------

async function refreshList(select = current) {
  const all = await listAll();
  stored = await listStored();
  pick.innerHTML = '';
  for (const name of all) {
    pick.add(new Option(stored.includes(name) ? name : `${name} (shipped)`, name));
  }
  if (select && all.includes(select)) pick.value = select;
  $('del').disabled = !stored.includes(pick.value);
  // The two seams tab0 reads: the directory listing and the source text.
  cm.mycarslist = all.map((n) => `${n}.rad`);
  cm.carsrc = (name) => (name === current ? code.value : '');
}

async function open(name) {
  const text = await readCar(name);
  if (text === null) { status.textContent = `no such car: ${name}`; return; }
  current = name;
  loadfile(cm, text);
  await refreshList(name);
  reparse();
  status.textContent = `editing ${name}`;
}

async function save(name) {
  const text = savefile(cm);
  if (text === null) { status.textContent = 'nothing to save'; return; }
  await writeCar(name, text);
  current = name;
  await refreshList(name);
  status.textContent = `saved ${name}`;
}

// ---- code pane: theme and font ----------------------------------------------

/**
 * setheme() is ported (shape.js) and sets AWT colours on cm.editor -- which
 * here IS the page's textarea, so the original's eight themes land on the real
 * thing rather than on a canvas imitation of one.
 */
function applyTheme() {
  cm.cthm = parseInt($('theme').value, 10);
  cm.deff = [220, 220, 220];      // theme 0 is "whatever the applet defaults to"
  cm.defb = [11, 13, 19];
  setheme(cm);
}

function applyFont() {
  cm.cfont = $('font').value;
  code.style.fontFamily = `"${cm.cfont}", ui-monospace, monospace`;
}

// ---- wiring -----------------------------------------------------------------

code.addEventListener('input', () => {
  cm.changed = true;
  clearTimeout(code._t);
  code._t = setTimeout(reparse, 250);
});

for (const tab of document.querySelectorAll('.tabs button')) {
  tab.onclick = () => {
    for (const t of document.querySelectorAll('.tabs button')) {
      t.setAttribute('aria-selected', String(t === tab));
      $('pane-' + t.dataset.pane).hidden = t !== tab;
    }
    syncPanes();
  };
}

pick.onchange = () => open(pick.value);
$('theme').onchange = applyTheme;
$('font').onchange = applyFont;

$('replace').onclick = () => {
  const find = $('find').value;
  if (!find) return;
  cm.srch.setText(find);
  cm.rplc.setText($('repl').value);
  cm.editor.setText(code.value.split(find).join($('repl').value));
  reparse();
  status.textContent = 'replaced';
};

$('mirror').onclick = () => {
  // The mirror lives in tab1's selection scan, and it reads the selection
  // through cm.editor -- which is the textarea, so the page's own selection is
  // the one it mirrors.
  cm.editor.select(code.selectionStart, code.selectionEnd);
  cm.tab = 1;
  cm.tabed = 1;
  cm.mirror = true;
  refreshPane(tab1);
  reparse();
};

$('new').onclick = async () => {
  const name = prompt('Name for the new car:');
  if (!name) return;
  const res = newcar(cm, name);
  if (!res.ok) { status.textContent = 'could not create that car'; return; }
  cm.editor.setText(res.text);
  await save(name);
  reparse();
};

$('save').onclick = async () => {
  if (!current) return $('saveas').onclick();
  await save(current);
};

$('saveas').onclick = async () => {
  const name = prompt('Save as:', current ? `${current} copy` : 'My Car');
  if (!name) return;
  await save(name);
};

$('del').onclick = async () => {
  const name = pick.value;
  if (!stored.includes(name)) return;
  if (!confirm(`Delete "${name}"? A shipped car of the same name comes back.`)) return;
  await deleteCar(name);
  current = null;
  await refreshList();
  status.textContent = `deleted ${name}`;
};

$('importbtn').onclick = () => $('file').click();

$('file').onchange = async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const name = f.name.replace(/\.rad$/i, '');
  await writeCar(name, await f.text());
  e.target.value = '';
  await open(name);
};

$('export').onclick = () => {
  const url = URL.createObjectURL(new Blob([code.value], { type: 'text/plain' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = (current || 'car') + '.rad';
  a.click();
  URL.revokeObjectURL(url);
};

$('drive').onclick = async () => {
  if (!current) return;
  // checko() is the game's own readiness test, the same gate the desktop Test
  // Drive runs before handing the car to the race.
  if (!checko(cm, 'Test Drive', code.value)) return;
  await save(current);
  location.href = `./main.html?mycar=${encodeURIComponent(current)}`;
};

$('spin').onclick = () => {
  view.spinning = !view.spinning;
  $('spin').textContent = view.spinning ? 'Pause spin' : 'Spin';
};

$('resetview').onclick = () => {
  view.yaw = 210; view.pitch = 12; view.dist = 800;
};

$('applycol').onclick = () => {
  // 1stColor/2ndColor are single lines in the source. tab2's own picker is a
  // hue/brightness canvas -- an <input type=color> writes the same two lines.
  const hex = (id) => $(id).value.match(/\w\w/g).map((h) => parseInt(h, 16));
  const [r1, g1, b1] = hex('col1');
  const [r2, g2, b2] = hex('col2');
  cm.editor.setText(code.value
    .replace(/1stColor\([^)]*\)/, `1stColor(${r1},${g1},${b1})`)
    .replace(/2ndColor\([^)]*\)/, `2ndColor(${r2},${g2},${b2})`));
  reparse();
};

$('applystats').onclick = () => {
  reparse();
  status.textContent = 'stats written to the source';
};

// turntable
{
  const box = $('viewbox');
  let dragging = false, lastX = 0, lastY = 0;
  box.addEventListener('pointerdown', (e) => {
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    view.spinning = false;
    $('spin').textContent = 'Spin';
    box.classList.add('dragging');
    box.setPointerCapture(e.pointerId);
  });
  box.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    view.yaw = (view.yaw + (e.clientX - lastX) * 0.7 + 360) % 360;
    // Tilt is clamped: past vertical the model is upside down and there is no
    // depth buffer to make sense of it.
    view.pitch = Math.max(-85, Math.min(85, view.pitch + (e.clientY - lastY) * 0.5));
    lastX = e.clientX; lastY = e.clientY;
  });
  const end = () => { dragging = false; box.classList.remove('dragging'); };
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', end);
  box.addEventListener('wheel', (e) => {
    e.preventDefault();
    view.dist = Math.max(DIST_MIN, Math.min(DIST_MAX, view.dist * Math.exp(e.deltaY * 0.0012)));
  }, { passive: false });
}

// ---- boot -------------------------------------------------------------------

(async () => {
  try {
    await detectFpath();
    cm = newCarMaker();
    // cm.editor is the AWT TextArea the chunks read 57 times. Here it is the
    // page's <textarea>, so a ported method sees exactly what you typed.
    cm.editor = {
      getText: () => code.value,
      setText: (s) => { code.value = s ?? ''; },
      insertText(s, p) { code.value = code.value.slice(0, p) + s + code.value.slice(p); },
      replaceText(s, a, b) { code.value = code.value.slice(0, a) + s + code.value.slice(b); },
      select: (a, b) => code.setSelectionRange(a, b),
      getSelectionStart: () => code.selectionStart,
      getSelectionEnd: () => code.selectionEnd,
      getSelectedText: () => code.value.substring(code.selectionStart, code.selectionEnd),
      requestFocus: () => code.focus(),
      show() {}, hide() {}, isShowing: () => true, enable() {}, disable() {},
      setFont(f) { code.style.fontFamily = `"${f.name}", ui-monospace, monospace`; },
      setForeground(c) { code.style.color = `rgb(${c[0]},${c[1]},${c[2]})`; },
      setBackground(c) { code.style.background = `rgb(${c[0]},${c[1]},${c[2]})`; },
      addMouseListener(fn) { code.addEventListener('mousedown', fn); },
      setBounds() {}, getX: () => 0, getY: () => 0, getWidth: () => 0, getHeight: () => 0,
      hasFocus: () => document.activeElement === code,
    };
    // The applet methods the chunks call on `cm`, supplied by the shell.
    cm.showMessageDialog = (parent, msg) => alert(msg);
    cm.showConfirmDialog = (parent, msg) => (confirm(msg) ? 0 : 1);
    cm.openurl = (u) => window.open(u, '_blank', 'noopener');
    cm.repaint = () => {};
    cm.setCursor = () => {};
    cm.requestFocus = () => {};
    cm.carsrc = () => '';

    // init() is the ported CarMaker.init(): fonts, colours and bounds on the
    // widgets state.js allocated, and the 16 wheel-value TextFields. The panes
    // call movefield() on those, so they cannot stay null.
    cm.rd = new Recorder();
    init(cm);

    const overlay = document.createElement('canvas');
    overlay.width = 700; overlay.height = 550;
    rd = new Graphics2D($('view'), overlay, 700, 550);

    // ?debug=1 exposes the editor state so a headless run can assert on what a
    // control actually did to it, rather than on what the page looks like.
    if (new URLSearchParams(location.search).get('debug')) window.cm = cm;

    await refreshList();
    const wanted = new URLSearchParams(location.search).get('car');
    await open(wanted || pick.value);
    applyTheme();
    applyFont();
    frame();
    status.textContent = '';
  } catch (e) {
    status.textContent = 'failed to start: ' + e.message;
    console.error(e);
  }
})();
