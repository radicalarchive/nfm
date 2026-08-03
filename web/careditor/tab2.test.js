import test from 'node:test';
import assert from 'node:assert/strict';
import { tab2 } from './tab2.js';
import { TextArea, TextField } from './widgets.js';
import { Smenu } from '../Smenu.js';

// Real widgets, not mocks. tab2 calls the ported movefield/stringbutton, which
// ask a component for its bounds and its focus -- a mock that answers only the
// methods the test author noticed is a mock that hides the rest of the call.
const newField = () => new TextField('');


// Helper mock factory for CarMaker editor state `cm`
function createMockCm() {
  const dummySmenu = {
    sel: 0,
    getSelectedIndex() { return this.sel; },
    select(i) { this.sel = i; },
    getItem(i) { return `Item ${i}`; },
    getItemCount() { return 10; },
    remove(item) {},
    move(x, y, w, h) {},
    isShowing() { return true; },
    hasFocus() { return false; }
  };

  const dummyTextField = {
    text: '',
    getText() { return this.text; },
    setText(t) { this.text = t; },
    move(x, y, w, h) {},
    isShowing() { return true; },
    hasFocus() { return false; }
  };

  const dummyTextArea = {
    text: '',
    getText() { return this.text; },
    setText(t) { this.text = t; },
    isShowing() { return true; },
    hasFocus() { return false; }
  };

  const dummyContO = {
    x: 0, y: 0, z: 0,
    xz: 0, xy: 0, zy: 0,
    colok: 0,
    fcol: [100, 150, 200],
    scol: [50, 75, 100],
    keyx: [-100, 100, -100, 100],
    keyz: [-100, -100, 100, 100],
    stat: [0, 0, 0, 0, 0],
    d(g) {}
  };

  const dummyMedium = {
    x: 0, y: 0, z: 0,
    xz: 0, xy: 0, zy: 0,
    d(g) {}
  };

  const dummyFontMetrics = {
    stringWidth(s) { return 50; },
    getHeight() { return 12; }
  };

  const dummyGraphics = {
    setColor(c) {},
    fillRect(x, y, w, h) {},
    drawRect(x, y, w, h) {},
    drawString(str, x, y) {},
    setFont(f) {},
    drawLine(x1, y1, x2, y2) {},
    fillPolygon(x, y, n) {},
    getFontMetrics() { return dummyFontMetrics; }
  };

  const wv = [];
  for (let i = 0; i < 16; i++) {
    wv.push(newField());
  }

  const compo = [];
  for (let i = 0; i < 16; i++) {
    compo.push({ ...dummyContO });
  }

  return {
    rd: dummyGraphics,
    ftm: dummyFontMetrics,
    apx: 0, apy: 0,
    // stringbutton()/ovbutton() record every button they draw here; without
    // them the ported hit test writes into undefined.
    btn: 0,
    bx: new Int32Array(24), by: new Int32Array(24), bw: new Int32Array(24),
    pessd: new Array(24).fill(false),
    focuson: 0,
    tab: 2, tabed: 2,
    dtab: 0, dtabed: 0,
    carname: 'testcar',
    flk: 0, changed: false, changed2: false,
    lastedo: '',
    editor: new TextArea(),
    srch: newField(), rplc: newField(),
    cntpls: 0, npolys: 0, tomany: false,
    ox: 0, oy: 0, oz: 0, oxz: 0, oxy: 0, ozy: 0,
    m: dummyMedium,
    o: dummyContO,
    compo,
    right: false, left: false, up: false, down: false,
    rotl: false, rotr: false, plus: false, minus: false,
    in: false, out: false, pflk: false,
    breakbond: false, polynum: 0, prflk: false, bfo: 0,
    mouseon: false,
    fcol: [100, 150, 200], ofcol: [100, 150, 200],
    scol: [50, 75, 100], oscol: [50, 75, 100],
    fhsb: [0, 0, 0], shsb: [0, 0, 0],
    scale: [100, 100, 100], oscale: [100, 100, 100],
    compcar: new Smenu(40), compsel: 0,
    adna: [0, 0, 0, 0, 0, 0],
    wv, defnow: false,
    aply1: false, aply2: false, aplyd1: false, aplyd2: false,
    forwheels: false,
    cls: new Smenu(40), clsel: 0,
    simcar: new Smenu(40), carsel: 0,
    stat: [0, 0, 0, 0, 0], rstat: [0, 0, 0, 0, 0],
    carstat: Array.from({ length: 16 }, (_, i) => [100 + i * 5, 120 + i * 2, 110 + i * 3, 130 - i * 2, 140 + i]),
    statdef: false,
    pfase: 0,
    phys: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    rphys: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    crash: [0, 0, 0], rcrash: [0, 0, 0],
    pname: Array.from({ length: 15 }, (_, i) => `P${i}`),
    pnx: Array.from({ length: 15 }, (_, i) => 100 + i * 10),
    usage: Array.from({ length: 15 }, (_, i) => `Usage ${i}`),
    hitmag: 0, actmag: 0, crashok: false, crashleft: 0,
    engine: new Smenu(40), engs: Array.from({ length: 5 }, () => Array(5).fill(null)),
    engsel: 0, engon: false,
    witho: new Smenu(40),
    tested: false, rateh: 0, handling: 0,
    mouses: 0, xm: 0, ym: 0,
    thredo: null,
    setCursor(c) {},
    requestFocus() {}
  };
}

test('tab2 executes cleanly for 3D controls subtab (dtab = 2)', () => {
  const cm = createMockCm();
  cm.dtab = 2;
  cm.dtabed = 2;
  cm.xm = 500;
  cm.ym = 450;
  cm.adna = [10, -20, 30, -40, 50, -60];

  assert.doesNotThrow(() => tab2(cm));
  assert.deepStrictEqual(cm.adna, [0, 0, 20, 0, 40, 0]);
});

test('tab2 executes cleanly for Color Edit subtab (dtab = 1)', () => {
  const cm = createMockCm();
  cm.dtab = 1;
  cm.dtabed = 1;
  cm.o.colok = 2;

  assert.doesNotThrow(() => tab2(cm));
  assert.strictEqual(cm.fcol, '(51,51,51)');
});

test('tab2 handles movement key controls (rotr, up, plus)', () => {
  const cm = createMockCm();
  cm.dtab = 0;
  cm.dtabed = 0;
  cm.o.xz = 45;
  cm.o.zy = 180;
  cm.o.y = -500;

  cm.rotr = true;
  cm.up = true;
  cm.plus = true;

  tab2(cm);

  assert.strictEqual(cm.o.xz, 40);
  assert.strictEqual(cm.o.zy, 175);
});

test('tab2 executes Stats & Class subtab (dtab = 4)', () => {
  const cm = createMockCm();
  cm.dtab = 4;
  cm.dtabed = 4;

  assert.doesNotThrow(() => tab2(cm));
});

test('tab2 executes Physics subtab (dtab = 5)', () => {
  const cm = createMockCm();
  cm.dtab = 5;
  cm.dtabed = 5;

  assert.doesNotThrow(() => tab2(cm));
});
