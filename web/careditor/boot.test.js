// Differential test of careditor/boot.js against the real Java.
//
// EVERY expected value below was printed by web/tools/BootProbe.java, driving
// the real CarMaker out of java/Game.jar:
//
//   javac -cp <jar> -d <probe> web/tools/BootProbe.java
//   xvfb-run -a java -cp <probe>:<jar> tools.BootProbe
//
// (xvfb, not -Djava.awt.headless=true: init() constructs java.awt.TextField,
// whose constructor throws HeadlessException.)
//
// WHAT IS NOT ASSERTED, and why:
//   - Smenu.w, and any drawString x derived from a real string width. `w` is
//     computed from FontMetrics.stringWidth inside Smenu.add(); AWT's metrics
//     for "Arial" bold 12 on this machine (a fontconfig substitution) are not
//     the browser's for the same request, so no expected value exists that
//     both sides can produce. The run-tail test instead feeds the JS the
//     stringWidths the probe measured (21, 60, 45, 46) and checks the
//     ARITHMETIC around them, which is where the integer division lives.
//   - anything drawn: fillRect/drawImage/fillPolygon output. The mock rd
//     records the calls; no test can check AWT pixels.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { newCarMaker } from './state.js';
import { parseZip } from '../vfs.js';
import { Madness } from '../Madness.js';
import { runHead, runTail, init, loadsounds, loadbase, getImage } from './boot.js';

const load = (p) => new Uint8Array(readFileSync(new URL(p, import.meta.url)));

/**
 * Recording rd. `stringWidth` is a table when one is supplied, so the run-tail
 * test can replay the widths the real AWT FontMetrics measured in the probe.
 */
function makeRd(widths = {}) {
  const calls = [];
  return {
    calls,
    setRenderingHint() {},
    setColor(...a) { calls.push(['setColor', ...a]); },
    setFont(f) { this.font = f; calls.push(['setFont', f]); },
    fillRect(...a) { calls.push(['fillRect', ...a]); },
    drawImage(...a) { calls.push(['drawImage', ...a]); },
    drawString(...a) { calls.push(['drawString', ...a]); },
    fillPolygon(xs, ys, n) { calls.push(['fillPolygon', [...xs], [...ys], n]); },
    getFontMetrics() {
      return {
        stringWidth: (s) => (s in widths ? widths[s] : s.length * 7),
        getHeight: () => 12,
      };
    },
  };
}

/** A cm as the shell has it just before init(): state.js plus the shell's seams. */
function makeCm(rd) {
  const cm = newCarMaker();
  cm.rd = rd;
  cm.dialogs = [];
  cm.showMessageDialog = (parent, msg, title, type) => cm.dialogs.push([msg, title, type]);
  cm.carsrc = (name) => cm.sources[name] ?? null;
  cm.sources = {};
  return cm;
}

// ---- init() -- CarMaker.java:4998-5157 --------------------------------------

/** Item lists, in order, exactly as BootProbe read them back off each Smenu. */
const MENUS = {
  slcar: ['Select a Car...         '],
  fontsel: ['Arial', 'Dialog', 'DialogInput', 'Monospaced', 'Serif', 'SansSerif', 'Verdana'],
  ctheme: ['Default', 'Author', 'Dos', 'Green', 'The Matrix', 'Ice Age', 'Fire', 'Ocean'],
  compcar: ['Compare Car...', 'Tornado Shark', 'Formula 7', 'Wow Caninaro', 'La Vita Crab',
    'Nimi', 'MAX Revenge', 'Lead Oxide', 'Kool Kat', 'Drifter X', 'Sword of Justice',
    'High Rider', 'EL KING', 'Mighty Eight', 'M A S H E E N', 'Radical One', 'DR Monstaa',
    ' -  None  - '],
  cls: ['Class A', 'Class A & B', 'Class B', 'Class B & C', 'Class C'],
  simcar: ['Tornado Shark', 'Formula 7', 'Wow Caninaro', 'La Vita Crab', 'Nimi',
    'MAX Revenge', 'Lead Oxide', 'Kool Kat', 'Drifter X', 'Sword of Justice',
    'High Rider', 'EL KING', 'Mighty Eight', 'M A S H E E N', 'Radical One', 'DR Monstaa'],
  witho: ['With other cars', 'Alone'],
  engine: ['Normal Engine', 'V8 Engine', 'Retro Engine', 'Power Engine', 'Diesel Engine'],
  pubtyp: ['Private', 'Public', 'Super Public'],
  pubitem: ['Account Cars'],
};

/** font/bcol/fcol per menu, from the probe's `font=` / `bcol=` / `fcol=` fields. */
const MENU_STYLE = {
  slcar: ['Arial', 1, 13, [209, 217, 230], [63, 80, 110]],
  fontsel: ['Arial', 1, 12, [63, 80, 110], [209, 217, 230]],
  ctheme: ['Arial', 1, 12, [63, 80, 110], [209, 217, 230]],
  compcar: ['Arial', 1, 12, [63, 80, 110], [209, 217, 230]],
  cls: ['Arial', 1, 12, [63, 80, 110], [209, 217, 230]],
  simcar: ['Arial', 1, 12, [63, 80, 110], [209, 217, 230]],
  witho: ['Arial', 1, 12, [63, 80, 110], [209, 217, 230]],
  engine: ['Arial', 1, 12, [63, 80, 110], [209, 217, 230]],
  pubtyp: ['Arial', 1, 13, [63, 80, 110], [209, 217, 230]],
  pubitem: ['Arial', 1, 13, [209, 217, 230], [63, 80, 110]],
};

test('init fills every Smenu with the Java item list, in order', () => {
  const cm = makeCm(makeRd());
  init(cm);
  for (const [name, items] of Object.entries(MENUS)) {
    const sm = cm[name];
    assert.equal(sm.no, items.length, `${name}.no`);
    for (let i = 0; i < items.length; i++) {
      assert.equal(sm.opts[i], items[i], `${name}.opts[${i}]`);
      // maxl is 0 for all ten at init time, so sopts is opts untruncated.
      assert.equal(sm.sopts[i], items[i], `${name}.sopts[${i}]`);
    }
    assert.equal(sm.sel, 0, `${name}.sel`);
    assert.equal(sm.maxl, 0, `${name}.maxl`);
  }
});

test('init sets the Java font and colours on every Smenu', () => {
  const cm = makeCm(makeRd());
  init(cm);
  for (const [name, [fname, style, size, bcol, fcol]] of Object.entries(MENU_STYLE)) {
    const sm = cm[name];
    assert.equal(sm.font.name, fname, `${name}.font.name`);
    assert.equal(sm.font.style, style, `${name}.font.style`);
    assert.equal(sm.font.size, size, `${name}.font.size`);
    assert.deepEqual([sm.bcol.getRed(), sm.bcol.getGreen(), sm.bcol.getBlue()], bcol, `${name}.bcol`);
    assert.deepEqual([sm.fcol.getRed(), sm.fcol.getGreen(), sm.fcol.getBlue()], fcol, `${name}.fcol`);
  }
});

test('init builds the 16 wv fields with cfont bold 14, black on white', () => {
  const cm = makeCm(makeRd());
  init(cm);
  for (let i = 0; i < 16; i++) {
    const w = cm.wv[i];
    assert.ok(w, `wv[${i}] built`);
    assert.equal(w.getText(), '');
    // probe: "text wv[i] font=Monospaced/1/14 fg=0,0,0 bg=255,255,255"
    assert.equal(w.font.name, 'Monospaced');
    assert.equal(w.font.style, 1);
    assert.equal(w.font.size, 14);
    assert.equal(w.fg, 'rgb(0,0,0)');
    assert.equal(w.bg, 'rgb(255,255,255)');
  }
});

test('init styles the text fields and sets defb/deff', () => {
  const cm = makeCm(makeRd());
  init(cm);
  // probe: tnick/tpass font=Arial/1/13 fg=0,0,0 bg=255,255,255
  for (const name of ['tnick', 'tpass']) {
    assert.equal(cm[name].font.name, 'Arial');
    assert.equal(cm[name].font.style, 1);
    assert.equal(cm[name].font.size, 13);
    assert.equal(cm[name].fg, 'rgb(0,0,0)');
    assert.equal(cm[name].bg, 'rgb(255,255,255)');
  }
  // probe: srch/rplc font=null (init never sets one -- run() does) fg=0,0,0 bg=255,255,255
  for (const name of ['srch', 'rplc']) {
    assert.equal(cm[name].font, undefined);
    assert.equal(cm[name].fg, 'rgb(0,0,0)');
    assert.equal(cm[name].bg, 'rgb(255,255,255)');
  }
  // probe: editor font=null fg=null bg=0,0,0 -- both inherited from the applet,
  // i.e. init sets neither. The editor's colours come from setheme() later.
  assert.equal(cm.editor.font, undefined);
  assert.equal(cm.editor.fg, undefined);
  // probe: defb=255,255,255 deff=0,0,0
  assert.deepEqual(cm.defb, [255, 255, 255]);
  assert.deepEqual(cm.deff, [0, 0, 0]);
});

test('init ends with hidefields: nothing is showing', () => {
  const cm = makeCm(makeRd());
  init(cm);
  // probe: every Smenu came back show=false and every text field visible=false.
  for (const name of Object.keys(MENUS)) assert.equal(cm[name].isShowing(), false, name);
  for (const name of ['tnick', 'tpass', 'srch', 'rplc', 'editor']) {
    assert.equal(cm[name].isShowing(), false, name);
  }
  for (let i = 0; i < 16; i++) assert.equal(cm.wv[i].isShowing(), false, `wv[${i}]`);
});

// ---- run() head -- CarMaker.java:355-429 ------------------------------------

test('runHead sets the car-maker camera and fade table', () => {
  const cm = makeCm(makeRd());
  init(cm);
  runHead(cm);
  // probe: m.w=700 m.cx=350 m.y=-240 m.z=-400 m.zy=4 m.focus_point=800
  assert.equal(cm.m.w, 700);
  assert.equal(cm.m.cx, 350);
  assert.equal(cm.m.y, -240);
  assert.equal(cm.m.z, -400);
  assert.equal(cm.m.zy, 4);
  assert.equal(cm.m.focus_point, 800);
  // probe: m.fade after fadfrom(8000)
  assert.deepEqual([...cm.m.fade], [8000, 12000, 16000, 20000, 24000, 28000, 32000,
    36000, 40000, 44000, 48000, 52000, 56000, 60000, 64000, 68000]);
  // probe: cfade=187,210,227
  assert.deepEqual([cm.m.cfade[0], cm.m.cfade[1], cm.m.cfade[2]], [187, 210, 227]);
  assert.equal(cm.m.loadnew, true);
});

test('runHead applies cfont bold 14 to the editor, srch, rplc and all 16 wv', () => {
  const cm = makeCm(makeRd());
  init(cm);
  cm.cfont = 'Arial';           // as loadsettings() would have left it
  runHead(cm);
  for (const w of [cm.editor, cm.srch, cm.rplc, ...cm.wv]) {
    assert.equal(w.font.name, 'Arial');
    assert.equal(w.font.style, 1);
    assert.equal(w.font.size, 14);
  }
});

test('runHead returns n, the tutorial flag crossing into the tab blocks', () => {
  // probe: headn carname=<> n=0 tutok=false / carname=<Simple Car> n=1 tutok=true
  const empty = makeCm(makeRd());
  init(empty);
  assert.equal(runHead(empty), 0);
  assert.equal(empty.tutok, false);

  const named = makeCm(makeRd());
  init(named);
  named.carname = 'Simple Car';
  assert.equal(runHead(named), 1);
  assert.equal(named.tutok, true);
});

test('runHead: Test Drive of an unsaved car reports the failure and loads nothing', () => {
  const cm = makeCm(makeRd());
  init(cm);
  Madness.testdrive = 2;
  Madness.testcar = 'Failx12';
  try {
    runHead(cm);
  } finally {
    Madness.testdrive = 0;
    Madness.testcar = '';
  }
  assert.deepEqual(cm.dialogs, [[
    'Failed to load car! Please make sure car is saved before Test Drive.',
    'Car Maker', 1]]);
  assert.equal(cm.carname, '');
  assert.equal(cm.tested, false);
  assert.equal(cm.tab, 0);
  // Madness.testcar/testdrive are cleared only on the ELSE path in the Java;
  // the Failx12 branch falls through to the same two lines, so both are reset.
  assert.equal(Madness.testcar, '');
  assert.equal(Madness.testdrive, 0);
});

test('runHead: Test Drive of a real car opens tab 2, dtab 6 and selects witho', () => {
  const cm = makeCm(makeRd());
  init(cm);
  cm.sources['Simple Car'] = '<p>\nc(1,2,3)\np(0,0,0)\n</p>\n';
  Madness.testdrive = 2;
  Madness.testcar = 'Simple Car';
  try {
    runHead(cm);
  } finally {
    Madness.testdrive = 0;
    Madness.testcar = '';
  }
  assert.equal(cm.carname, 'Simple Car');
  assert.equal(cm.loadedfile, true);
  assert.equal(cm.tested, true);
  assert.equal(cm.tab, 2);
  assert.equal(cm.dtab, 6);
  assert.equal(cm.witho.getSelectedIndex(), 1);   // Madness.testdrive - 1
  assert.deepEqual(cm.dialogs, []);
});

// ---- run() tail -- CarMaker.java:2859-2903 ----------------------------------

// The real AWT FontMetrics widths the probe measured for Font("Arial", 1, 13).
const TAB_WIDTHS = { 'Car': 21, 'Code Edit': 60, '3D Edit': 45, 'Publish': 46 };

/** Set up a cm mid-frame, the way run() reaches line 2859. */
function tailCm({ tab, tabed, carname, loadedfile, sfase, xm, ym, mouses }) {
  const cm = makeCm(makeRd(TAB_WIDTHS));
  init(cm);
  cm.btgame = ['btgame0', 'btgame1'];
  Object.assign(cm, { tab, tabed, carname, loadedfile, sfase, xm, ym, mouses });
  cm.editor.setText('// a car\n');    // so savefile() has something to hand back
  cm.rd.calls.length = 0;
  return cm;
}

const drawn = (cm, kind) => cm.rd.calls.filter((c) => c[0] === kind);

test('runTail: clicking tab 0 from tab 2 switches without saving', () => {
  // probe: tail in=[2,1,1,0,40,10,-1] n123=4 tab=0 tabed=2 savefile=false
  //        poly[0,0,100,90]@35 poly[100,100,200,190]@115
  //        poly[200,200,300,290]@223 poly[300,300,400,390]@322
  const cm = tailCm({ tab: 2, tabed: 1, carname: 'Simple Car', loadedfile: true,
    sfase: 0, xm: 40, ym: 10, mouses: -1 });
  runTail(cm);
  assert.equal(cm.tab, 0);
  assert.equal(cm.tabed, 2);
  assert.equal(cm.lastedo, '');            // savefile() never ran
  assert.deepEqual(drawn(cm, 'fillPolygon').map((c) => c[1]), [
    [0, 0, 100, 90], [100, 100, 200, 190], [200, 200, 300, 290], [300, 300, 400, 390]]);
  assert.deepEqual(drawn(cm, 'drawString'), [
    ['drawString', 'Car', 35, 17], ['drawString', 'Code Edit', 115, 17],
    ['drawString', '3D Edit', 223, 17], ['drawString', 'Publish', 322, 17]]);
});

test('runTail: leaving the code pane for tab 3 saves first', () => {
  // probe: tail in=[1,1,1,0,340,10,-1] n123=4 tab=3 tabed=1 savefile=true
  const cm = tailCm({ tab: 1, tabed: 1, carname: 'Simple Car', loadedfile: true,
    sfase: 0, xm: 340, ym: 10, mouses: -1 });
  runTail(cm);
  assert.equal(cm.tab, 3);
  assert.equal(cm.tabed, 1);
  // savefile() is void in the Java; here it is the IO seam, and what proves it
  // ran is the state it commits: the pane's text becomes lastedo.
  assert.equal(cm.lastedo, '// a car\n');
  assert.equal(cm.changed, false);
});

test('runTail: with no car loaded only the Car tab is drawn', () => {
  // probe: tail in=[0,0,0,0,40,10,-1] n123=1 tab=0 tabed=0 poly[0,0,100,90]@35
  const cm = tailCm({ tab: 0, tabed: 0, carname: '', loadedfile: false,
    sfase: 0, xm: 40, ym: 10, mouses: -1 });
  runTail(cm);
  assert.equal(cm.tab, 0);
  assert.equal(cm.tabed, 0);
  assert.deepEqual(drawn(cm, 'fillPolygon').map((c) => c[1]), [[0, 0, 100, 90]]);
  assert.deepEqual(drawn(cm, 'drawString'), [['drawString', 'Car', 35, 17]]);
});

test('runTail: sfase != 0 forces tab 0 even from tab 3', () => {
  // probe: tail in=[3,3,1,2,140,10,1] n123=1 tab=0 tabed=3
  const cm = tailCm({ tab: 3, tabed: 3, carname: 'Simple Car', loadedfile: true,
    sfase: 2, xm: 140, ym: 10, mouses: 1 });
  runTail(cm);
  assert.equal(cm.tab, 0);
  assert.equal(cm.tabed, 3);
  assert.deepEqual(drawn(cm, 'fillPolygon').map((c) => c[1]), [[0, 0, 100, 90]]);
});

test('runTail draws the back-to-game button according to onbtgame', () => {
  const cm = tailCm({ tab: 0, tabed: 0, carname: '', loadedfile: false,
    sfase: 0, xm: 0, ym: 0, mouses: 0 });
  runTail(cm);
  assert.deepEqual(drawn(cm, 'drawImage'), [['drawImage', 'btgame0', 520, 0]]);
  cm.onbtgame = true;
  cm.rd.calls.length = 0;
  runTail(cm);
  assert.deepEqual(drawn(cm, 'drawImage'), [['drawImage', 'btgame1', 520, 0]]);
});

// ---- loadsounds() -- CarMaker.java:5399-5439 --------------------------------

test('loadsounds fills every engs/crashs/lowcrashs slot from sounds.zip', async () => {
  const cm = makeCm(makeRd());
  loadsounds(cm, await parseZip(load('../../data/sounds.zip')));
  // probe: engs=1111111111111111111111111 crashs=111 lowcrashs=111
  let grid = '';
  for (let k = 0; k < 5; k++) for (let j = 0; j < 5; j++) grid += cm.engs[k][j] ? '1' : '0';
  assert.equal(grid, '1'.repeat(25));
  assert.equal(cm.crashs.map((c) => (c ? '1' : '0')).join(''), '111');
  assert.equal(cm.lowcrashs.map((c) => (c ? '1' : '0')).join(''), '111');
});

test('loadsounds binds each clip to its own zip entry', async () => {
  const cm = makeCm(makeRd());
  const played = [];
  cm.snd = { play: (n) => played.push(n), loop() {}, stop() {}, stopLoop() {} };
  loadsounds(cm, await parseZip(load('../../data/sounds.zip')));
  // Java's name is "" + k + "" + j + ".wav", so engs[3][1] is "31.wav": the
  // FIRST index is the engine signature and the second the rev slot.
  cm.engs[3][1].play();
  cm.crashs[2].play();
  cm.lowcrashs[0].play();
  assert.deepEqual(played, ['31.wav', 'crash3.wav', 'lowcrash1.wav']);
});

// ---- loadbase() -- CarMaker.java:5440-5472 ----------------------------------

test('loadbase builds the 16 base cars, shadowless and unlined', async () => {
  const cm = makeCm(makeRd());
  loadbase(cm, await parseZip(load('../../data/models.zip')));
  // probe: compo[i] npl / maxR, with shadow=false noline=true disline=14 on all.
  const expected = [
    [131, 239], [186, 181], [176, 224], [144, 182], [139, 129], [169, 209],
    [166, 237], [223, 222], [150, 187], [198, 226], [200, 209], [183, 268],
    [166, 184], [280, 391], [149, 258], [202, 223],
  ];
  for (let i = 0; i < 16; i++) {
    assert.ok(cm.compo[i], `compo[${i}]`);
    assert.equal(cm.compo[i].npl, expected[i][0], `compo[${i}].npl`);
    assert.equal(cm.compo[i].maxR, expected[i][1], `compo[${i}].maxR`);
    assert.equal(cm.compo[i].shadow, false, `compo[${i}].shadow`);
    assert.equal(cm.compo[i].noline, true, `compo[${i}].noline`);
    assert.equal(cm.compo[i].disline, 14, `compo[${i}].disline`);
  }
});

test('loadbase ignores an entry matching no car name', async () => {
  const cm = makeCm(makeRd());
  const zip = await parseZip(load('../../data/models.zip'));
  zip.set('road.rad', zip.get('nimi.rad'));
  loadbase(cm, zip);
  // `n` starts at -1 and the entry is skipped -- unlike GameSparker.loadbase,
  // whose `n2` starts at 0 and would drop this into slot 0.
  assert.equal(cm.compo[0].npl, 131);
});

// ---- getImage() -- CarMaker.java:5634-5644 ----------------------------------

test('getImage hands back the image the shell decoded', () => {
  const cm = makeCm(makeRd());
  const img = { width: 180, height: 25 };
  assert.equal(getImage(cm, img), img);
});
