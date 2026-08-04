// The Car Maker page.
//
// One rule holds the whole thing together: THE .rad TEXT IS THE CAR. Every
// control reads its value out of the source when the car loads and writes it
// straight back on input; the preview re-parses that text with the game's own
// ContO. There is nothing to Apply, because there is no second copy to apply
// it to, and the textarea below the inputs shows the file changing under your
// hands as you drag.
//
// What is reused from the port, and only this: ContO (the parser and renderer
// the race itself uses), the crash deformation math in damage.js, and the
// author's help texts. The applet's own panes --
// its dtab pagination, its Apply/Save pairs, its sixteen AWT text fields -- are
// not here, and neither is the headless bridge that used to drive them.
//
// Keyboard: every control is a native focusable element in reading order, so
// Tab walks the page and arrows drive the sliders without any script. The only
// keyboard code below is on the preview canvas, which is not a form control.

import * as rad from './rad.js';
import { crashOnce, roofCrash } from './damage.js';
import { scrubber } from './scrub.js';
import { physicsHelp, crashHelp, crashTestHelp, STAT_HELP, CLASS_HELP,
         SCALE_HELP, ALIGN_HELP, ENGINE_HELP } from './helptext.js';
import { newCarMaker } from './state.js';
import { setupo } from './files.js';
import { listAll, listStored, readCar, writeCar, deleteCar, BUILTIN_NAMES } from '../carstore.js';
import { detectFpath } from '../vfs.js';
import { Graphics2D } from '../graphics.js';

const $ = (id) => document.getElementById(id);
const code = $('code'), pick = $('pick'), status = $('status'), err = $('err');

// The CarMaker state bag. Not a bridge to the applet's UI -- the panes are
// gone. It is here because the ported crash math writes into cm.o, cm.m,
// cm.hitmag and cm.crash[], and because setupo() is the ContO constructor call
// with the editor's own preview flags already set on it.
let cm = null;
let rd = null;
let current = null;
let stored = [];
// True while a control is rewriting the source, so the textarea's own input
// handler does not treat its own update as the user typing.
let writing = false;

// ---- the single write path --------------------------------------------------

const source = () => code.value;

/**
 * Put new text in the source and let everything else follow from it.
 *
 * Everything: the textarea, the ContO the preview draws, the readiness list,
 * and the value of every other control -- a stat slider drags the other four
 * with it, and a colour change repaints half the polygons, so no control can
 * assume its neighbours are still showing the truth.
 */
function setSource(text) {
  writing = true;
  code.value = text;
  writing = false;
  reparse();
  refresh();
  markDirty();
}

/** Re-run the game's parser over the current text. */
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
  $('radius').textContent = o.maxR;

  const issues = rad.problems(code.value, o);
  const parseErr = o.errd ? o.err.trim() : '';
  err.textContent = [parseErr, ...issues].filter(Boolean).join('\n');
  const ready = issues.length === 0 && !o.errd;
  $('ready').innerHTML = ready
    ? '<b style="color:#7ddc9a">ready to race</b>'
    : '<span style="color:#8b93a7">not raceable yet</span>';
  $('drive').disabled = !ready;
}

let dirty = false;
function markDirty() {
  dirty = true;
  $('save').textContent = 'Save •';
}
function markClean() {
  dirty = false;
  $('save').textContent = 'Save';
}

// ---- control builders -------------------------------------------------------

const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};

/**
 * A captioned row with a live readout and a slider.
 *
 * `read` pulls the value out of the source; `write` takes a new value and
 * returns the new source. The row keeps no state of its own, which is what
 * lets refresh() re-point every row at the text after any edit.
 */
function sliderRow(host, { caption, help, min, max, read, write, format }) {
  const div = el('div', 'row');
  const cap = el('span', 'cap', caption);
  if (help) { cap.classList.add('help'); cap.title = help; }
  const val = el('span', 'val');
  const input = el('input');
  input.type = 'range';
  input.min = min; input.max = max; input.step = 1;
  input.setAttribute('aria-label', caption);
  if (help) input.title = help;
  input.oninput = () => setSource(write(Number(input.value)));
  div.append(cap, val, input);
  host.appendChild(div);
  return {
    sync() {
      const v = read();
      input.value = v;
      val.textContent = format ? format(v) : v;
    },
  };
}

/**
 * A captioned row with a scrubber, for values with no natural range.
 *
 * The wheel fields have no meaningful min or max -- a ±X of 48 and a Z of -92
 * are both ordinary -- so a slider has nothing to span. Drag the number, or
 * click it and type.
 */
function numberRow(host, { caption, help, min, max, read, write }) {
  const div = el('div', 'row narrow');
  const cap = el('span', 'cap', caption);
  if (help) { cap.classList.add('help'); cap.title = help; }
  const s = scrubber({
    read, min, max, label: caption, title: help,
    onInput: (v) => setSource(write(v)),
  });
  div.append(cap, s);
  host.appendChild(div);
  return { sync: s.sync };
}

// Rows are built once per car and then re-pointed at the text, so a drag is
// never interrupted by its own section being rebuilt.
let rows = [];
const sync = () => rows.forEach((r) => r.sync());

// ---- sections ---------------------------------------------------------------

function buildWheels() {
  const host = $('pane-wheels');
  host.innerHTML = '';
  for (const side of ['front', 'back']) {
    const sec = el('section');
    sec.appendChild(el('h3', null, side === 'front' ? 'Front wheels' : 'Back wheels'));
    for (const f of rad.WHEEL_FIELDS) {
      rows.push(numberRow(sec, {
        caption: f.caption,
        help: f.hint,
        read: () => rad.readWheels(source())[side][f.key],
        write: (v) => {
          const w = rad.readWheels(source());
          w[side][f.key] = v;
          return rad.writeWheels(source(), w);
        },
      }));
    }
    // The rim colour is a colour, not a number, so it gets a picker rather than
    // three boxes -- the applet stored it as the string "(r,g,b)" in the
    // find/replace fields, which is why it had no home of its own there.
    const bar = el('div', 'bar');
    const lab = el('label', 'field', 'Rims ');
    const col = el('input');
    col.type = 'color';
    col.title = 'Colour of the rims inside the tyres.';
    col.setAttribute('aria-label', `${side} rim colour`);
    col.oninput = () => {
      const w = rad.readWheels(source());
      w[side].rims = hexToRgb(col.value);
      setSource(rad.writeWheels(source(), w));
    };
    lab.appendChild(col);
    bar.appendChild(lab);
    sec.appendChild(bar);
    rows.push({ sync() { col.value = rgbToHex(rad.readWheels(source())[side].rims); } });
    host.appendChild(sec);
  }
  rows.push({
    sync() {
      const w = rad.readWheels(source());
      $('wheels-sub').textContent = rad.hasWheels(w) ? '' : `${w.count}/4 defined`;
    },
  });
}

const rgbToHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
const hexToRgb = (h) => h.match(/\w\w/g).map((x) => parseInt(x, 16));

function buildColours() {
  for (const [which, id] of [[0, 'col1'], [1, 'col2']]) {
    const input = $(id);
    const label = $(id + 'val');
    input.oninput = () => setSource(rad.writeColour(source(), which, hexToRgb(input.value)));
    rows.push({
      sync() {
        const c = rad.readColours(source())[which === 0 ? 'first' : 'second'];
        if (c) { input.value = rgbToHex(c); label.textContent = `(${c.join(',')})`; }
        else label.textContent = 'not set';
      },
    });
  }
  // No badge for an undefined colour: the readiness list under the preview
  // already says so, in the words the game itself uses.
}

function buildStats() {
  const host = $('stat-rows');
  host.innerHTML = '';
  const stats = () => rad.readStats(source()) || rad.DEFAULT_STATS;
  rad.STAT_NAMES.forEach((name, i) => {
    rows.push(sliderRow(host, {
      caption: name,
      help: STAT_HELP[name],
      min: rad.STAT_MIN, max: rad.STAT_MAX,
      read: () => stats()[i],
      // Balanced, not free: raising one stat spends the others down, so the
      // total stays on a class budget. The server rejects anything else.
      write: (v) => rad.writeStats(source(), rad.setStat(stats(), i, v)),
    }));
  });

  const cls = $('class');
  cls.innerHTML = '';
  rad.CLASS_NAMES.forEach((n, i) => cls.add(new Option(`${n} — ${rad.CLASS_TOTALS[i]}`, i)));
  cls.title = CLASS_HELP;
  cls.onchange = () => setSource(rad.writeStats(source(), rad.setClass(stats(), Number(cls.value))));

  const sim = $('simcar');
  sim.innerHTML = '';
  sim.add(new Option('—', -1));
  BUILTIN_NAMES.forEach((n, i) => sim.add(new Option(n, i)));
  sim.title = 'Start from one of the game\'s own cars — copies its stats so you can adjust from there.';
  sim.onchange = () => {
    const i = Number(sim.value);
    if (i < 0) return;
    setSource(rad.writeStats(source(), cm.carstat[i].slice()));
  };

  $('stats-hint').textContent = CLASS_HELP;
  rows.push({
    sync() {
      const s = stats();
      const total = rad.statTotal(s);
      const ci = rad.classOf(s);
      cls.value = ci === -1 ? '' : ci;
      // A base model out of models.zip has no stat() line at all -- the game
      // keeps its stats in CarDefine's tables, not in the .rad -- so say so
      // rather than showing the defaults as if the car had chosen them.
      $('stats-sub').textContent = !rad.readStats(source()) ? 'not set'
        : ci === -1 ? `${total} — no class`
        : `${rad.CLASS_NAMES[ci]} · ${total}`;
      // "Which stock car is this closest to", the applet's own nearest-match.
      let best = -1, bestD = 60;
      cm.carstat.forEach((row, i) => {
        const d = row.reduce((a, v, k) => a + Math.abs(v - s[k]), 0);
        if (d < bestD) { bestD = d; best = i; }
      });
      sim.value = best;
    },
  });
}

function buildPhysics() {
  const host = $('phys-rows');
  host.innerHTML = '';
  const phys = () => rad.readPhysics(source()) || rad.DEFAULT_PHYSICS;
  for (const i of rad.PHYS_SLOTS) {
    rows.push(sliderRow(host, {
      caption: rad.PHYS_NAMES[i],
      help: physicsHelp(i),
      min: 0, max: 100,
      read: () => phys().phys[i],
      write: (v) => {
        const p = phys();
        p.phys = p.phys.slice();
        p.phys[i] = v;
        return rad.writePhysics(source(), p);
      },
    }));
  }

  const eng = $('engine');
  eng.innerHTML = '';
  rad.ENGINE_NAMES.forEach((n, i) => eng.add(new Option(n, i)));
  eng.title = ENGINE_HELP;
  eng.onchange = () => setSource(rad.writePhysics(source(), { ...phys(), engsel: Number(eng.value) }));

  const crashHost = $('crash-rows');
  crashHost.innerHTML = '';
  rad.CRASH_NAMES.forEach((name, i) => {
    rows.push(sliderRow(crashHost, {
      caption: name,
      help: crashHelp(i),
      min: 0, max: 100,
      read: () => phys().crash[i],
      write: (v) => {
        const p = phys();
        p.crash = p.crash.slice();
        p.crash[i] = v;
        return rad.writePhysics(source(), p);
      },
    }));
  });
  $('crash-hint').textContent = crashTestHelp;

  rows.push({
    sync() {
      const p = phys();
      eng.value = p.engsel;
      $('engine-note').textContent = rad.ENGINE_NOTES[p.engsel];
      $('physics-sub').textContent = rad.ENGINE_NAMES[p.engsel];
      $('crash-sub').textContent = p.actmag ? '' : 'not calibrated';
    },
  });
}

/** The source's own selection, or undefined for "the whole car". */
function selection() {
  const { selectionStart: a, selectionEnd: b } = code;
  return b > a ? [a, b] : undefined;
}

function buildScaleAndAlign() {
  const host = $('scale-rows');
  host.innerHTML = '';
  ['X', 'Y', 'Z'].forEach((axis, i) => {
    rows.push(sliderRow(host, {
      caption: `Scale ${axis}`,
      help: SCALE_HELP,
      min: 10, max: 300,
      format: (v) => `${v}%`,
      read: () => rad.readScale(source())[i],
      write: (v) => {
        const s = rad.readScale(source());
        s[i] = v;
        return rad.writeScale(source(), s);
      },
    }));
  });
  $('scale-hint').textContent = SCALE_HELP;
  rows.push({ sync() { $('scale-sub').textContent = rad.readScale(source()).join(' / ') + ' %'; } });

  for (const b of document.querySelectorAll('[data-align]')) {
    b.title = ALIGN_HELP;
    b.onclick = () => setSource(rad.transformPoints(source(), rad.ALIGN[b.dataset.align], selection()));
  }
  // Mirroring half a car onto the other half is the reason the original had a
  // selection tool at all, so the selection stays -- as the textarea's own,
  // rather than as a box you retype the coordinates into.
  document.querySelector('[data-align="mirrorX"]').title =
    'Flip the car left-to-right. Select part of the text below first to flip only that ' +
    'part — which is how you build one side and mirror it onto the other.';
  const bar = $('nudge-bar');
  bar.innerHTML = '';
  ['X', 'Y', 'Z'].forEach((axis, i) => {
    for (const by of [10, -10]) {
      const b = el('button', null, `${axis} ${by > 0 ? '+' : '−'}10`);
      b.type = 'button';
      b.title = ALIGN_HELP;
      b.onclick = () => setSource(rad.transformPoints(source(), rad.ALIGN.nudge(i, by), selection()));
      bar.appendChild(b);
    }
  });
  $('align-hint').textContent = ALIGN_HELP;
}

function buildAll() {
  rows = [];
  buildWheels();
  buildColours();
  buildStats();
  buildPhysics();
  buildScaleAndAlign();
}

const refresh = sync;

// ---- preview ----------------------------------------------------------------
//
// A turntable, done as a real orbit: the MODEL stays at the origin and the
// CAMERA moves on a sphere around it.
//
// Two earlier attempts got this wrong in the same way. Tilting the model
// (o.zy) pitches it about its own axis, so which way "down" went depended on
// where the car happened to be facing. Tilting the camera (m.zy) has the right
// axis -- the renderer applies it last, after the yaw -- but it rotates the
// world about a pivot 50 units in front of the lens, and a model 800 units away
// swings through a huge arc for a small angle. That arc is nearly vertical on
// screen, which is exactly the "Y just translates up and down" you get.
//
// The fix is to put the model AT the pivot's distance: solve for the camera
// position that lands the model dead centre after both rotations, which is the
// ordinary spherical camera. Then m.xz/m.zy are the orbit angles and nothing
// translates.

const view = { yaw: 210, pitch: 14, dist: 900, spinning: true };
const DIST_MIN = 320, DIST_MAX = 2600;
const PITCH_MIN = -80, PITCH_MAX = 85;

function camera() {
  const m = cm.m;
  // The editor's own 700x550 viewport (CarMaker.java:360-370).
  m.w = 700; m.h = 550;
  m.cx = 350; m.cy = 275; m.cz = 50;
  m.focus_point = 800;
  m.fadfrom(8000);
  m.cfade[0] = 187; m.cfade[1] = 210; m.cfade[2] = 227;
  m.ground = 100000;          // far below: nothing should meet the ground here
  m.ih = 0; m.iw = 0; m.trk = 0; m.crs = false;

  const yaw = Math.round(view.yaw) % 360;
  const pitch = Math.round(view.pitch);
  m.xz = yaw;
  m.zy = pitch;
  // Offset from the rotation pivot that the two camera rotations carry to
  // (0, 0, dist) -- i.e. straight ahead, centred. Uses the engine's own sin/cos
  // tables so the result matches what the renderer will actually compute.
  const cp = m.cos(pitch), sp = m.sin(pitch);
  const cy = m.cos(yaw), sy = m.sin(yaw);
  const ux = view.dist * cp * sy;
  const uy = view.dist * sp;
  const uz = view.dist * cp * cy;
  // The model sits at the world origin, so the camera is the negative of where
  // the model has to be relative to it.
  m.x = -Math.round(m.cx + ux);
  m.y = -Math.round(m.cy + uy);
  m.z = -Math.round(m.cz + uz);
}

function draw() {
  if (!cm.o) return;
  camera();
  const o = cm.o;
  o.x = 0; o.y = 0; o.z = 0;
  o.xz = 0; o.zy = 0; o.xy = 0;     // orientation is the camera's job now
  o.wzy = (o.wzy - 10) % 360;       // the wheels still turn
  const hadShadow = o.shadow;
  o.shadow = false;                 // nothing to cast one onto in a bare preview
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

function stopSpin() {
  view.spinning = false;
  $('spin').textContent = 'Spin';
}

// ---- car list and storage ---------------------------------------------------

/**
 * The picker: your cars, then the game's own.
 *
 * The two halves come from different places on purpose. listAll() is the
 * launcher's listing -- stored cars plus the four under mycars/ -- and it is
 * what the race assigns custom slots from. The sixteen base models live in
 * models.zip and already have slots 0..15, so they are readable here but stay
 * out of that listing; saving one writes a copy under whatever name you give
 * it, and the copy is what the game picks up.
 */
async function refreshList(select = current) {
  const all = await listAll();
  stored = await listStored();
  pick.innerHTML = '';
  const group = (label, names, suffix) => {
    const g = document.createElement('optgroup');
    g.label = label;
    for (const name of names) {
      g.appendChild(new Option(stored.includes(name) ? name : `${name}${suffix}`, name));
    }
    pick.appendChild(g);
  };
  group('My cars', all, ' (shipped)');
  group('Default Cars', BUILTIN_NAMES, '');
  if (select) pick.value = select;
  $('del').disabled = !stored.includes(pick.value);
  $('carname').textContent = current || '';
  const readonly = current && !stored.includes(current);
  $('save').title = readonly
    ? 'This is one of the game\'s cars. Saving makes your own copy of it — the original stays as it is.'
    : '';
}

async function open(name) {
  const text = await readCar(name);
  if (text === null) { status.textContent = `no such car: ${name}`; return; }
  current = name;
  writing = true;
  code.value = text;
  writing = false;
  buildAll();
  reparse();
  refresh();
  markClean();
  await refreshList(name);
  status.textContent = '';
}

async function save(name) {
  await writeCar(name, code.value);
  current = name;
  markClean();
  await refreshList(name);
  status.textContent = `saved ${name}`;
}

// ---- wiring -----------------------------------------------------------------

// Typing in the source is an edit like any other -- it just does not write the
// textarea back, because the caret is in it.
code.addEventListener('input', () => {
  if (writing) return;
  markDirty();
  clearTimeout(code._t);
  code._t = setTimeout(() => { reparse(); refresh(); }, 200);
});

pick.onchange = () => open(pick.value);

// ---- tabs -------------------------------------------------------------------
//
// The WAI-ARIA tablist pattern, which is also what the launcher and the in-game
// menus should use: one tab stop for the whole strip, arrows to move between
// tabs, Home/End for the ends. Tab then steps from the strip into the panel
// rather than through four buttons nobody wanted to visit one at a time.

{
  const tabs = [...document.querySelectorAll('.tabs [role=tab]')];
  const select = (tab, focus = true) => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $('pane-' + t.dataset.pane).hidden = !on;
    }
    if (focus) tab.focus();
  };
  tabs.forEach((t) => { t.onclick = () => select(t); });
  document.querySelector('.tabs').addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    const to = { ArrowLeft: i - 1, ArrowRight: i + 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    select(tabs[(to + tabs.length) % tabs.length]);
  });
  select(tabs[0], false);
}

$('save').onclick = async () => {
  if (!current) return $('saveas').onclick();
  await save(current);
};

$('saveas').onclick = async () => {
  const name = prompt('Save as:', current ? `${current} copy` : 'My Car');
  if (!name) return;
  await save(name.trim());
};

$('new').onclick = async () => {
  const name = prompt('Name for the new car:');
  if (!name) return;
  await writeCar(name.trim(), TEMPLATE(name.trim()));
  await open(name.trim());
};

$('del').onclick = async () => {
  const name = pick.value;
  if (!stored.includes(name)) return;
  if (!confirm(`Delete "${name}"? A shipped car of the same name comes back.`)) return;
  await deleteCar(name);
  current = null;
  await refreshList();
  await open(pick.value);
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
  await save(current);
  location.href = `./main.html?mycar=${encodeURIComponent(current)}`;
};

// Damage is not in the file, so these do not touch the source: they beat up the
// loaded model, and Fix throws it away by re-parsing.
$('crash').onclick = () => { stopSpin(); crashOnce(cm); };
$('roof').onclick = () => { stopSpin(); roofCrash(cm); };
$('fix').onclick = () => reparse();

$('spin').onclick = () => {
  view.spinning = !view.spinning;
  $('spin').textContent = view.spinning ? 'Pause spin' : 'Spin';
};

$('resetview').onclick = () => {
  view.yaw = 210; view.pitch = 14; view.dist = 900;
};


// ---- the turntable ----------------------------------------------------------

{
  const box = $('viewbox'), canvas = $('view');
  let dragging = false, lastX = 0, lastY = 0;
  box.addEventListener('pointerdown', (e) => {
    dragging = true; lastX = e.clientX; lastY = e.clientY;
    stopSpin();
    box.classList.add('dragging');
    box.setPointerCapture(e.pointerId);
    canvas.focus();
  });
  box.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    orbit((e.clientX - lastX) * 0.6, (e.clientY - lastY) * 0.4);
    lastX = e.clientX; lastY = e.clientY;
  });
  const end = () => { dragging = false; box.classList.remove('dragging'); };
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', end);
  box.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoom(Math.exp(e.deltaY * 0.0012));
  }, { passive: false });

  // Same gestures from the keyboard. The canvas is not a form control, so this
  // is the one place the page has to spell the bindings out.
  canvas.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 15 : 5;
    const moves = {
      ArrowLeft: () => orbit(-step, 0), ArrowRight: () => orbit(step, 0),
      ArrowUp: () => orbit(0, -step), ArrowDown: () => orbit(0, step),
      '+': () => zoom(0.9), '=': () => zoom(0.9), '-': () => zoom(1.1),
    };
    const move = moves[e.key];
    if (!move) return;
    e.preventDefault();
    stopSpin();
    move();
  });
}

function orbit(dx, dy) {
  view.yaw = (view.yaw + dx + 360) % 360;
  view.pitch = Math.max(PITCH_MIN, Math.min(PITCH_MAX, view.pitch + dy));
}
function zoom(by) {
  view.dist = Math.max(DIST_MIN, Math.min(DIST_MAX, view.dist * by));
}

// The template a new car starts from, from CarMaker.newcar().
const TEMPLATE = (name) => `
// car: ${name}
---------------------

// To start making your car, read the tutorial at:
// http://www.needformadness.com/developer/simplecar.html

<p>
c(100,200,100)

p(-40,-50,80)
p(-40,-50,-70)
p(40,-50,-70)
p(40,-50,80)
</p>

<p>
c(100,150,200)

p(-40,-20,-100)
p(-40,-50,-70)
p(40,-50,-70)
p(40,-20,-100)
</p>

1stColor(100,200,100)
2ndColor(100,150,200)

stat(120,120,120,120,120)
physics(50,50,50,50,0,0,0,0,0,50,50,50,50,50,0,0)
`;

// ---- boot -------------------------------------------------------------------

(async () => {
  try {
    await detectFpath();
    cm = newCarMaker();
    // The ported code reads the car text through cm.editor. Here that is the
    // page's textarea, so setupo() parses exactly what you see.
    cm.editor = {
      getText: () => code.value,
      setText: (s) => { writing = true; code.value = s ?? ''; writing = false; },
      setForeground(c) { code.style.color = `rgb(${c[0]},${c[1]},${c[2]})`; },
      setBackground(c) { code.style.background = `rgb(${c[0]},${c[1]},${c[2]})`; },
      select() {}, requestFocus() {},
    };
    // setupo() raises the applet's modal on a wheels error. There is no modal
    // here; the message belongs on the error line under the preview, which
    // reparse() fills from o.err anyway.
    cm.showMessageDialog = () => {};
    cm.showConfirmDialog = () => 0;

    const overlay = document.createElement('canvas');
    overlay.width = 700; overlay.height = 550;
    rd = new Graphics2D($('view'), overlay, 700, 550);

    if (new URLSearchParams(location.search).get('debug')) {
      window.editor = { cm, rad, view, source, setSource };
    }

    await refreshList();
    const wanted = new URLSearchParams(location.search).get('car');
    await open(wanted || pick.value);
    frame();
  } catch (e) {
    status.textContent = 'failed to start: ' + e.message;
    console.error(e);
  }
})();

window.addEventListener('beforeunload', (e) => {
  if (dirty) { e.preventDefault(); e.returnValue = ''; }
});
