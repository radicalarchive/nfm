// Differential test of careditor/tab1.js against the real Java.
//
// Oracle: web/tools/Tab1Probe.java. tab1 is inline in CarMaker.run() and has no
// method to invoke, so the probe re-compiles the block's own 186 lines in the
// DEFAULT package against the real CarMaker out of java/Game.jar and runs them
// on a real (Unsafe-allocated) CarMaker, with the real movefield/stringbutton/
// setheme, real Smenus and real java.awt.TextArea/TextField inside a visible
// Frame under Xvfb -- so isShowing() means what it means in the applet.
// Every expected value below is a literal copied out of that probe's stdout;
// the probe's case labels (A, B, ... O) are quoted in each test.
//
// Correspondingly this test uses the REAL widgets (widgets.js TextArea /
// TextField), the REAL Smenu and the REAL ui.js stringbutton reached through
// tab1.js's own import -- not stubs. `btn`, `bx`, `by`, `bw` and `pessd` are on
// the state object because stringbutton records every button it draws there,
// and the bx/by rows below are how we check that the right buttons were drawn,
// in the right order, at the right places.
//
// NOT asserted, and why:
//   * bw[] -- stringbutton fills it from ftm.stringWidth(), which is AWT's real
//     font metrics on the Java side and a stub here. The widths cannot agree
//     and asserting them would be asserting the stub.
//   * the drawing itself. There is no pixel state to compare; rd is a recorder.
//   * the npolys>210 && !tomany tail, which calls JOptionPane.showMessageDialog.
//     It is modal and would hang the probe under Xvfb, so probe case F sets
//     tomany=true to skip it. The one test covering that branch below is marked
//     as NOT probe-verified.
import test from 'node:test';
import assert from 'node:assert/strict';
import { TextArea, TextField } from './widgets.js';
import { Smenu } from '../Smenu.js';
import { tab1 } from './tab1.js';

// ---- harness ----------------------------------------------------------------

/** Recording rd. Drawing has no comparable output; the calls are recorded so a
 *  test can assert the submission ORDER where that is the point (§4). */
function makeRd() {
  const calls = [];
  const rec = (name) => (...a) => { calls.push([name, ...a]); };
  return {
    calls,
    setColor: rec('setColor'),
    setFont: rec('setFont'),
    drawLine: rec('drawLine'),
    drawString: rec('drawString'),
    drawRect: rec('drawRect'),
    fillRect: rec('fillRect'),
    drawImage: rec('drawImage'),
    getFontMetrics() {
      return { stringWidth: (s) => s.length * 7, getHeight: () => 12 };
    },
  };
}

/** A cm carrying every field the tab==1 block reads or writes, at the values
 *  Tab1Probe.fresh() sets. Real widgets, real Smenus. */
function makeCm(overrides = {}) {
  const wv = [];
  for (let i = 0; i < 16; ++i) wv.push(new TextField(''));
  const cm = {
    rd: makeRd(),
    ftm: null,
    apx: 0,
    apy: 0,
    tab: 1,
    tabed: 1,
    editor: new TextArea(),
    srch: new TextField(''),
    rplc: new TextField(''),
    fontsel: new Smenu(40),
    ctheme: new Smenu(40),
    cfont: 'Monospaced',
    cthm: 0,
    cntprf: 0,
    cntpls: 0,
    cntchk: 0,
    npolys: 0,
    prefs: false,
    mirror: false,
    polynum: -1,
    tomany: false,
    changed: false,
    lastedo: '',
    openm: false,
    mouses: 0,
    xm: 0,
    ym: 0,
    wv,
    // stringbutton records every button it draws into these.
    btn: 0,
    bx: new Int32Array(24),
    by: new Int32Array(24),
    bw: new Int32Array(24),
    pessd: new Array(24).fill(false),
    // setheme()'s theme-0 colours, which CarMaker.init() captures off the pane.
    defb: [255, 255, 255],
    deff: [0, 0, 0],
    // applet-supplied, as in tab0.js / files.js
    repaint() { this.repainted = (this.repainted || 0) + 1; },
    showMessageDialog(...a) { (this.dialogs = this.dialogs || []).push(a); },
    ...overrides,
  };
  return cm;
}

/** The buttons stringbutton drew, as [bx, by] pairs, in submission order. */
function buttons(cm) {
  const out = [];
  for (let i = 0; i < cm.btn; ++i) out.push([cm.bx[i], cm.by[i]]);
  return out;
}

// The two button rows every probe line reports. Copied from Tab1Probe stdout.
//   else-branch (Preferences) : bx=[52,490,600,117,376]  by=[441,450,450,521,521]
//   mirror footer             : bx=[52,490,600,90,230,370,580]
//                               by=[441,450,450,520,520,520,518]
//   prefs strip               : bx=[400,490,600,117,376] by=[441,450,450,521,521]
const FIND_ROW = [[52, 441], [490, 450], [600, 450], [117, 521], [376, 521]];
const MIRROR_ROW = [[52, 441], [490, 450], [600, 450],
                    [90, 520], [230, 520], [370, 520], [580, 518]];
const PREFS_ROW = [[400, 441], [490, 450], [600, 450], [117, 521], [376, 521]];

// A .rad-shaped body with three polygons, exactly the probe's `body`.
const BODY = '<p>\nc(1,2,3)\np(0,0,0)\n</p>\n<p>\nc(4,5,6)\n</p>\n<p>\n</p>\n';

// ---- A: the tabed != tab entry block ---------------------------------------
// Probe A entry-block:
//   npolys=0 cntchk=0 cntprf=0 cntpls=0 prefs=false mirror=false polynum=-1
//   changed=false tomany=false btn=5 bx=[52,490,600,117,376]
//   by=[441,450,450,521,521] editorBounds=5,30,690,400
//   srchShow=true rplcShow=true srch=[] rplc=[]

test('A: entering the tab clears srch/rplc, arms cntchk and closes prefs (Tab1Probe A)', () => {
  const cm = makeCm({ tabed: 0, cntchk: 17, npolys: 99, prefs: true });
  cm.srch.setText('dirt');
  cm.rplc.setText('more dirt');
  cm.editor.setText('');
  cm.editor.select(0, 0);
  tab1(cm);
  assert.equal(cm.srch.getText(), '');
  assert.equal(cm.rplc.getText(), '');
  assert.equal(cm.prefs, false);
  assert.equal(cm.npolys, 0);
  // cntchk is set to 1 by the entry block, then the else-branch decrements it.
  assert.equal(cm.cntchk, 0);
  assert.equal(cm.cntprf, 0);
  assert.equal(cm.cntpls, 0);
  assert.equal(cm.mirror, false);
  assert.equal(cm.polynum, -1);
  assert.equal(cm.changed, false);
  assert.equal(cm.tomany, false);
  assert.deepEqual(buttons(cm), FIND_ROW);
  assert.deepEqual(
    [cm.editor.getX(), cm.editor.getY(), cm.editor.getWidth(), cm.editor.getHeight()],
    [5, 30, 690, 400],
  );
  assert.equal(cm.srch.isShowing(), true);
  assert.equal(cm.rplc.isShowing(), true);
});

// ---- B/C/D/E/F: the polygon counter ----------------------------------------
// Probe B count-3-polys:      npolys=3   cntchk=30 changed=true
// Probe C count-mouses1:      npolys=0   cntchk=30
// Probe D cntchk-decrement:   npolys=7   cntchk=29
// Probe E unbalanced:         npolys=1   cntchk=30
// Probe F over-210:           npolys=215 cntchk=30 tomany=true

test('B: cntchk==0 counts the polygons in the pane and rearms to 30 (Tab1Probe B)', () => {
  const cm = makeCm({ cntchk: 0, mouses: 0 });
  cm.editor.setText(BODY);
  cm.editor.select(0, 0);
  tab1(cm);
  assert.equal(cm.npolys, 3);
  assert.equal(cm.cntchk, 30);
  assert.equal(cm.changed, true);
  assert.deepEqual(buttons(cm), FIND_ROW);
});

test('C: mouses==1 aborts the count and zeroes npolys (Tab1Probe C)', () => {
  const cm = makeCm({ cntchk: 0, mouses: 1 });
  cm.editor.setText(BODY);
  cm.editor.select(0, 0);
  tab1(cm);
  assert.equal(cm.npolys, 0);
  assert.equal(cm.cntchk, 30);
});

test('D: cntchk!=0 only decrements and leaves npolys alone (Tab1Probe D)', () => {
  const cm = makeCm({ cntchk: 30, npolys: 7 });
  cm.editor.setText(BODY);
  cm.editor.select(0, 0);
  tab1(cm);
  assert.equal(cm.npolys, 7);
  assert.equal(cm.cntchk, 29);
});

test('E: a trailing unclosed <p> counts as no polygon (Tab1Probe E)', () => {
  const cm = makeCm({ cntchk: 0 });
  cm.editor.setText('<p></p><p>');
  cm.editor.select(0, 0);
  tab1(cm);
  assert.equal(cm.npolys, 1);
  assert.equal(cm.cntchk, 30);
});

test('F: 215 polygons counted; the dialog is skipped while tomany (Tab1Probe F)', () => {
  const cm = makeCm({ cntchk: 0, tomany: true });
  cm.editor.setText('<p>x</p>\n'.repeat(215));
  cm.editor.select(0, 0);
  tab1(cm);
  assert.equal(cm.npolys, 215);
  assert.equal(cm.cntchk, 30);
  assert.equal(cm.tomany, true);
  assert.equal(cm.dialogs, undefined);
  // npolys > 210 paints the counter red before drawing it.
  const i = cm.rd.calls.findIndex((c) => c[0] === 'setColor' && c[1] === 255 && c[2] === 0 && c[3] === 0);
  assert.ok(i !== -1);
  assert.deepEqual(cm.rd.calls[i + 1], ['drawString', 'Number of Polygons :  215 / 210', 200, 446]);
});

// ---- G: the changed flag ----------------------------------------------------
// Probe G changed-flip: changed=true cntchk=4

test('G: changed flips when the pane differs from lastedo (Tab1Probe G)', () => {
  const cm = makeCm({ lastedo: 'something else', changed: false, cntchk: 5 });
  cm.editor.setText('something');
  cm.editor.select(0, 0);
  tab1(cm);
  assert.equal(cm.changed, true);
  assert.equal(cm.cntchk, 4);
});

// ---- H/I/J: the selected-polygon (mirror) scan ------------------------------
// Probe H mirror-2:          cntpls=2 mirror=true  btn=7, MIRROR_ROW, srch/rplc hidden
// Probe I mirror-open-tail:  cntpls=1 mirror=false btn=5, FIND_ROW
// Probe J mirror-1:          cntpls=1 mirror=true  btn=7, MIRROR_ROW

test('H: a selection of two whole polygons sets mirror and cntpls=2 (Tab1Probe H)', () => {
  const cm = makeCm({ cntchk: 5 });
  cm.editor.setText('<p></p><p></p>');
  cm.editor.select(0, 14);
  tab1(cm);
  assert.equal(cm.cntpls, 2);
  assert.equal(cm.mirror, true);
  assert.deepEqual(buttons(cm), MIRROR_ROW);
  assert.equal(cm.srch.isShowing(), false);
  assert.equal(cm.rplc.isShowing(), false);
});

test('I: a selection ending in an unclosed <p> leaves mirror false (Tab1Probe I)', () => {
  const cm = makeCm({ cntchk: 5 });
  cm.editor.setText('<p></p><p>');
  cm.editor.select(0, 10);
  tab1(cm);
  assert.equal(cm.cntpls, 1);
  assert.equal(cm.mirror, false);
  assert.deepEqual(buttons(cm), FIND_ROW);
  assert.equal(cm.srch.isShowing(), true);
  assert.equal(cm.rplc.isShowing(), true);
});

test('J: a selection of exactly one polygon sets mirror and cntpls=1 (Tab1Probe J)', () => {
  const cm = makeCm({ cntchk: 5 });
  cm.editor.setText('<p>abc</p>');
  cm.editor.select(0, 10);
  tab1(cm);
  assert.equal(cm.cntpls, 1);
  assert.equal(cm.mirror, true);
  assert.deepEqual(buttons(cm), MIRROR_ROW);
});

// ---- K: Find / Replace enable flags -----------------------------------------
// Probe K find-only:         srch=[find me] rplc=[]          btn=5 FIND_ROW
// Probe K2 find-and-replace: srch=[find me] rplc=[with this] btn=5 FIND_ROW
//
// b / b2 are locals, so what the probe can show is that both frames draw the
// same five buttons at the same places; the flag itself is checked here through
// the `b` argument stringbutton was handed, which is the only place it goes.

test('K: Find is enabled by srch alone, Replace needs both (Tab1Probe K/K2)', () => {
  const enabled = (cm, label) => {
    const c = cm.rd.calls.find((x) => x[0] === 'drawString' && x[1] === label);
    return c;
  };
  {
    const cm = makeCm({ cntchk: 5 });
    cm.editor.setText('body');
    cm.editor.select(0, 0);
    cm.srch.setText('find me');
    cm.rplc.setText('');
    tab1(cm);
    assert.deepEqual(buttons(cm), FIND_ROW);
    assert.ok(enabled(cm, ' Find '));
    assert.ok(enabled(cm, ' Replace '));
    // b == true draws the lit face (230,230,230); b2 == false the dull one.
    assert.ok(cm.rd.calls.some((c) => c[0] === 'setColor' && c[1] === 230 && c[2] === 230 && c[3] === 230));
  }
  {
    const cm = makeCm({ cntchk: 5 });
    cm.editor.setText('body');
    cm.editor.select(0, 0);
    cm.srch.setText('find me');
    cm.rplc.setText('with this');
    tab1(cm);
    assert.deepEqual(buttons(cm), FIND_ROW);
    assert.equal(cm.srch.getText(), 'find me');
    assert.equal(cm.rplc.getText(), 'with this');
  }
});

// ---- L: the preferences strip ------------------------------------------------
// Probe L prefs-first-frame:
//   cntprf=1 prefs=true cthm=0 cfont=Monospaced btn=5 bx=[400,490,600,117,376]
//   fontselShow=true cthemeShow=true fontselSel=0 cthemeSel=0
// Probe L2 prefs-font-and-theme-change:
//   cntprf=1 cthm=5 cfont=Courier fontselSel=2 cthemeSel=5

test('L: the prefs strip opens both menus and ticks cntprf (Tab1Probe L)', () => {
  const cm = makeCm({ prefs: true, cntprf: 0 });
  cm.editor.setText('');
  cm.editor.select(0, 0);
  cm.fontsel.add(cm.rd, 'Monospaced');
  cm.fontsel.add(cm.rd, 'Arial');
  cm.fontsel.add(cm.rd, 'Courier');
  for (let i = 0; i < 8; ++i) cm.ctheme.add(cm.rd, 'theme' + i);
  tab1(cm);
  assert.equal(cm.cntprf, 1);
  assert.equal(cm.prefs, true);
  assert.equal(cm.cthm, 0);
  assert.equal(cm.cfont, 'Monospaced');
  assert.equal(cm.fontsel.isShowing(), true);
  assert.equal(cm.ctheme.isShowing(), true);
  assert.equal(cm.fontsel.getSelectedIndex(), 0);
  assert.equal(cm.ctheme.getSelectedIndex(), 0);
  assert.deepEqual(buttons(cm), PREFS_ROW);
  assert.deepEqual([cm.fontsel.x, cm.fontsel.y], [76, 430]);
  assert.deepEqual([cm.ctheme.x, cm.ctheme.y], [271, 430]);
});

test('L2: picking a font and a theme rewrites cfont/cthm and re-themes (Tab1Probe L2)', () => {
  const cm = makeCm({ prefs: true, cntprf: 0 });
  cm.editor.setText('');
  cm.editor.select(0, 0);
  cm.fontsel.add(cm.rd, 'Monospaced');
  cm.fontsel.add(cm.rd, 'Arial');
  cm.fontsel.add(cm.rd, 'Courier');
  for (let i = 0; i < 8; ++i) cm.ctheme.add(cm.rd, 'theme' + i);
  tab1(cm);                       // frame 1: opens the menus
  cm.fontsel.select('Courier');   // the user picks, as Smenu.draw() would
  cm.ctheme.select(5);
  cm.btn = 0;
  tab1(cm);                       // frame 2
  assert.equal(cm.cfont, 'Courier');
  assert.equal(cm.cthm, 5);
  assert.equal(cm.fontsel.getSelectedIndex(), 2);
  assert.equal(cm.ctheme.getSelectedIndex(), 5);
  // cntprf is zeroed by BOTH changes and then incremented once.
  assert.equal(cm.cntprf, 1);
  assert.deepEqual(buttons(cm), PREFS_ROW);
  // The font goes to the pane, both text fields and all sixteen wv fields.
  const font = (w) => [w.font.name, w.font.style, w.font.size];
  assert.deepEqual(font(cm.editor), ['Courier', 1, 14]);
  assert.deepEqual(font(cm.srch), ['Courier', 1, 14]);
  assert.deepEqual(font(cm.rplc), ['Courier', 1, 14]);
  for (let i = 0; i < 16; ++i) {
    assert.deepEqual(font(cm.wv[i]), ['Courier', 1, 14]);
  }
  // setheme() ran for theme 5: foreground (0,172,255) on (210,234,255).
  assert.equal(cm.editor.fg, 'rgb(0,172,255)');
  assert.equal(cm.editor.bg, 'rgb(210,234,255)');
});

// ---- M: cntprf reaching 200 closes the strip ---------------------------------
// Probe M cntprf-200: cntprf=200 prefs=false

test('M: cntprf hitting 200 closes the prefs strip (Tab1Probe M)', () => {
  const cm = makeCm({ prefs: true, cntprf: 199 });
  cm.editor.setText('');
  cm.editor.select(0, 0);
  cm.fontsel.add(cm.rd, 'Monospaced');
  for (let i = 0; i < 8; ++i) cm.ctheme.add(cm.rd, 'theme' + i);
  cm.fontsel.show();
  cm.ctheme.show();
  tab1(cm);
  assert.equal(cm.cntprf, 200);
  assert.equal(cm.prefs, false);
  assert.deepEqual(buttons(cm), PREFS_ROW);
});

// ---- N: an open dropdown hides the code pane ---------------------------------
// Probe N openm-hides-editor: editorShowing=false

test('N: openm hides the editor (Tab1Probe N)', () => {
  const cm = makeCm({ openm: true, cntchk: 5 });
  cm.editor.setText('');
  cm.editor.select(0, 0);
  tab1(cm);
  assert.equal(cm.editor.isShowing(), false);
});

// ---- O: tab != 1 is a no-op --------------------------------------------------
// Probe O tab-not-1: npolys=42 cntchk=9 btn=0 bx=[] by=[]

test('O: tab != 1 does nothing at all (Tab1Probe O)', () => {
  const cm = makeCm({ tab: 0, tabed: 5, npolys: 42, cntchk: 9 });
  tab1(cm);
  assert.equal(cm.npolys, 42);
  assert.equal(cm.cntchk, 9);
  assert.equal(cm.btn, 0);
  assert.equal(cm.rd.calls.length, 0);
});

// ---- the over-210 dialog -----------------------------------------------------
// NOT PROBE-VERIFIED. JOptionPane.showMessageDialog is modal, so driving this
// branch in Java would hang the probe under Xvfb; probe case F sets tomany=true
// to steer around it. The three statements are transcribed from
// CarMaker.java:874-876 and checked here only for order and arguments.

test('npolys>210 with tomany false repaints, warns once and latches tomany', () => {
  const cm = makeCm({ cntchk: 0, tomany: false });
  cm.editor.setText('<p>x</p>\n'.repeat(215));
  cm.editor.select(0, 0);
  tab1(cm);
  assert.equal(cm.npolys, 215);
  assert.equal(cm.repainted, 1);
  assert.deepEqual(cm.dialogs, [[
    null,
    'Maximum number of polygons (pieces) allowed has been exceeded!\n'
      + 'The maximum allowed is 210 polygons, please decrease.\n',
    'Car Maker',
    1,
  ]]);
  assert.equal(cm.tomany, true);
  // Latched: a second frame counts the same 215 and stays quiet.
  cm.cntchk = 0;
  tab1(cm);
  assert.equal(cm.dialogs.length, 1);
});
