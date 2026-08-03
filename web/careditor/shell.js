// The Car Maker shell: the browser around the transpiled chunks.
//
// The applet's own shell is CarMaker.init()/run() -- an AWT frame, a
// double-buffered Image, a Thread, and four tab panes. Those are the chunks
// still in flight (see decompilation/CAREDITOR_PORT_SPEC.md). What is wired
// here is everything below them that is already ported and verified: the state
// object (state.js), the .rad parse and IO seam (files.js), the AWT text
// widget (widgets.js), and the game's real renderer for the preview.
//
// The rule from the spec holds here: nothing in this file reaches into a
// transpiled method, and no transpiled method reaches into storage. `savefile`
// hands back .rad text and carstore takes it from there -- which is also what
// makes a future "open a PR against nfm_contrib" button a sink for the same
// string rather than a new code path.

import { newCarMaker } from './state.js';
import { setupo, loadfile, savefile, newcar, checko } from './files.js';
import { listAll, listStored, readCar, writeCar, deleteCar } from '../carstore.js';
import { detectFpath } from '../vfs.js';
import { Graphics2D } from '../graphics.js';

const $ = (id) => document.getElementById(id);
const code = $('code'), pick = $('pick'), status = $('status'), err = $('err');

let cm = null;
let rd = null;
let angle = 210, spinning = true, raf = 0;
let current = null;             // the name being edited, or null for an unsaved car
let stored = [];

// ---- the editor state -------------------------------------------------------

/**
 * `cm.editor` is the AWT TextArea the transpiled chunks read 57 times. Here it
 * is the page's own <textarea>: rather than keep two copies in sync, the
 * widget interface is implemented directly over the DOM element, so
 * `cm.editor.getText()` inside a ported method reads exactly what you typed.
 */
function bindEditor(el) {
  return {
    getText: () => el.value,
    setText: (s) => { el.value = s ?? ''; },
    insertText(s, pos) { const t = el.value; el.value = t.slice(0, pos) + s + t.slice(pos); },
    replaceText(s, a, b) { const t = el.value; el.value = t.slice(0, a) + s + t.slice(b); },
    select: (a, b) => el.setSelectionRange(a, b),
    getSelectionStart: () => el.selectionStart,
    getSelectionEnd: () => el.selectionEnd,
    getSelectedText: () => el.value.substring(el.selectionStart, el.selectionEnd),
    requestFocus: () => el.focus(),
    show() {}, hide() {}, isShowing: () => true,
    enable() {}, disable() {},
    setFont() {}, setForeground() {}, setBackground() {},
    addMouseListener: (fn) => el.addEventListener('mousedown', fn),
  };
}

// ---- preview ----------------------------------------------------------------

/**
 * The car-maker's own camera, from run() (java-src/CarMaker.java:360-370): a
 * 700-wide view, centre at x=350, camera above and behind, focus 800, and the
 * pale fog it fades the model into. The car itself sits at (ox, oy, oz) =
 * (335, 40, 800), which setupo() copies onto the model.
 */
function camera() {
  const m = cm.m;
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
  // Not from run(): the applet's frame supplies these through AWT.
  m.h = 450;
  m.cy = 225;
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
  // ContO reports its own parse errors the way the editor shows them; `errd`
  // with a "Wheels Error:" prefix is the not-yet-placed-wheels case, which is
  // normal while you are still building the body.
  err.textContent = o.errd ? o.err : '';
  const ready = o.colok >= 2 && o.npl > 60 && !o.errd;
  $('ready').innerHTML = ready
    ? '<b style="color:#7ddc9a">ready to race</b>'
    : `<span style="color:#8b93a7">not raceable yet</span>`;
  $('drive').disabled = !ready || !current;
}

function draw() {
  if (!cm.o) return;
  camera();
  const o = cm.o;
  o.x = cm.ox;
  o.y = cm.oy;
  o.z = cm.oz;
  o.xz = Math.round(angle) % 360;
  o.xy = 0;
  o.zy = 0;
  o.wzy = (o.wzy - 10) % 360;
  const hadShadow = o.shadow;
  o.shadow = false;              // nothing to cast one onto in a bare preview
  try {
    rd.begin();
    o.d(rd);
    rd.end();
  } finally {
    o.shadow = hadShadow;
  }
}

function frame() {
  if (spinning) angle = (angle + 0.6) % 360;
  draw();
  raf = requestAnimationFrame(frame);
}

// ---- car list ---------------------------------------------------------------

async function refreshList(select = current) {
  const all = await listAll();
  stored = await listStored();
  pick.innerHTML = '';
  for (const name of all) {
    const o = new Option(stored.includes(name) ? name : `${name} (shipped)`, name);
    pick.add(o);
  }
  if (select && all.includes(select)) pick.value = select;
  $('del').disabled = !stored.includes(pick.value);
}

async function open(name) {
  const text = await readCar(name);
  if (text === null) { status.textContent = `no such car: ${name}`; return; }
  current = name;
  loadfile(cm, text);            // the ported IO seam: text in, editor set
  await refreshList(name);
  reparse();
  status.textContent = `editing ${name}`;
}

/** Save whatever is in the pane under `name`. savefile() returns the text. */
async function save(name) {
  const text = savefile(cm);
  if (text === null) { status.textContent = 'nothing to save'; return; }
  await writeCar(name, text);
  current = name;
  await refreshList(name);
  reparse();
  status.textContent = `saved ${name}`;
}

// ---- wiring -----------------------------------------------------------------

code.addEventListener('input', () => {
  cm.changed = true;
  clearTimeout(code._t);
  code._t = setTimeout(reparse, 250);   // parsing every keystroke is wasteful
});

pick.onchange = () => open(pick.value);

$('new').onclick = async () => {
  const name = prompt('Name for the new car:');
  if (!name) return;
  const res = newcar(cm, name);          // the ported template
  if (!res.ok) { status.textContent = 'could not create that car'; return; }
  code.value = res.text;
  await save(name);
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
  const text = code.value;
  const name = (current || 'car') + '.rad';
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

$('drive').onclick = async () => {
  if (!current) return;
  // checko() is the game's own readiness test, and it is what the desktop Test
  // Drive runs before handing the car to the race. Same gate here.
  if (!checko(cm, 'Test Drive', code.value)) return;
  await save(current);
  location.href = `./main.html?mycar=${encodeURIComponent(current)}`;
};

$('spin').onclick = () => {
  spinning = !spinning;
  $('spin').textContent = spinning ? 'Pause spin' : 'Spin';
};

// Drag to rotate, the way the editor's own arrow keys do.
{
  const view = $('view');
  let dragging = false, lastX = 0;
  view.addEventListener('pointerdown', (e) => {
    dragging = true; lastX = e.clientX; spinning = false;
    $('spin').textContent = 'Spin';
    view.setPointerCapture(e.pointerId);
  });
  view.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    angle = (angle + (e.clientX - lastX) * 0.7 + 360) % 360;
    lastX = e.clientX;
  });
  view.addEventListener('pointerup', () => { dragging = false; });
}

// ---- boot -------------------------------------------------------------------

(async () => {
  try {
    await detectFpath();
    cm = newCarMaker();
    cm.editor = bindEditor(code);
    // JOptionPane, the one widget the ported flows genuinely branch on.
    cm.showMessageDialog = (parent, msg) => alert(msg);
    cm.showConfirmDialog = (parent, msg) => (confirm(msg) ? 0 : 1);

    const overlay = document.createElement('canvas');
    overlay.width = 800; overlay.height = 450;
    rd = new Graphics2D($('view'), overlay, 800, 450);

    await refreshList();
    const wanted = new URLSearchParams(location.search).get('car');
    await open(wanted || pick.value);
    frame();
    status.textContent = '';
  } catch (e) {
    status.textContent = 'failed to start: ' + e.message;
    console.error(e);
  }
})();
