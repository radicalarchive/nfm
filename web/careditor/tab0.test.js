// Differential test of careditor/tab0.js against the real Java (Tab0Probe.java).
//
// tab0 is the car file management pane (CarMaker.java:430-691). It is inline in
// run() and cannot be called through reflection as a named method, so the probe
// drives the same pure state-mutation arithmetic that the JS executes and prints
// the results. All expected values below came from Tab0Probe.java run against
// the real Game.jar under java -Djava.awt.headless=true.
//
// Drawing calls (drawLine, drawString, drawRect, etc.) are exercised by the
// mock rd but their OUTPUT is not checked — no test could check AWT pixel state.
// What IS checked: the pure control-flow mutations of cm fields and the n return.
import test from 'node:test';
import assert from 'node:assert/strict';
import { TextArea } from './widgets.js';
import { tab0 } from './tab0.js';
import { Smenu } from '../Smenu.js';

// ---- mock helpers -----------------------------------------------------------

/** Minimal no-op rd that records setColor/drawString calls but does nothing. */
function makeMockRd() {
  return {
    setColor() {},
    setFont() {},
    drawLine() {},
    drawString() {},
    drawRect() {},
    fillRect() {},
    fillPolygon() {},
    fillOval() {},
    fill3DRect() {},
    drawRoundRect() {},
    fillRoundRect() {},
    drawImage() {},
    getFontMetrics() {
      return { stringWidth: (s) => s.length * 7, getHeight: () => 12 };
    },
  };
}

/** Minimal no-op srch TextField. */
function makeSrch() {
  return {
    _text: '',
    getText() { return this._text; },
    setText(t) { this._text = t; },
    isShowing() { return true; },
    show() {},
    requestFocus() {},
  };
}

/** Minimal no-op editor. */
// The real widget, not a select()-only stub: tab0 sets the code pane's text
// when you pick a car, and a stub that answers only the methods the test
// author noticed hides that call.
function makeEditor() {
  return new TextArea();
}

/** Build a minimal cm with enough state to exercise tab0. */
function makeCm(overrides = {}) {
  const slcar = new Smenu(2000);
  return {
    // Default: the shell holds no source for this car, which is what a missing
    // mycars/<name>.rad does in the Java -- loadedfile stays false.
    carsrc: () => '',
    tab: 0,
    tabed: 0,       // tabed == tab so the init block is skipped by default
    tutok: false,
    sfase: 0,
    mouseon: -1,
    mouses: 0,
    xm: 0,
    ym: 0,
    openm: false,
    flk: 0,
    carname: '',
    tomany: false,
    tested: false,
    slcar,
    srch: makeSrch(),
    editor: makeEditor(),
    rd: makeMockRd(),
    ftm: { stringWidth: (s) => s.length * 7, getHeight: () => 12 },
    // stringbutton()/ovbutton() record every button they draw into these; the
    // stubs this test used to pass instead of the real ui.js functions hid
    // that they are part of the state, not optional.
    btn: 0,
    bx: new Int32Array(24), by: new Int32Array(24), bw: new Int32Array(24),
    pessd: new Array(24).fill(false),
    logo: null,
    mycarslist: null,   // IO seam: null = no files listed
    // shell-supplied methods
    setCursor() {},
    requestFocus() {},
    // other-chunk methods: no-ops for these tests
    loadfile() {},
    stringbutton() {},
    movefield() {},
    fixtext() {},
    openhlink() {},
    openlink() {},
    openelink() {},
    openurl() {},   // Madness.openurl, supplied by the shell
    ...overrides,
  };
}

// ---- flk cycling (CarMaker.java:479-484) ------------------------------------
//
// Expected values from Tab0Probe.java (probe output lines 2-5):
//   flk step1 from 0:  -1
//   flk step2 from -1:  1
//   flk step3 from 1:   2
//   flk step4 from 2:   0
//
// Conditions: tutok=false, mouseon!=-1 would suppress the block, so we set
// mouseon to something != 1 but force the path by using mouseon=-1.
// Actually the guard is `!cm.tutok && cm.mouseon !== 1 && n === 0`.

test('flk cycles: 0 -> -1 -> 1 -> 2 -> 0 (from Java Tab0Probe)', () => {
  // step 1: flk=0 -> takes flk<=0 branch -> --flk = -1; -1 != -2 -> stays -1
  {
    const cm = makeCm({ flk: 0, tutok: false, mouseon: -1 });
    tab0(cm, 0);
    // expected from probe: flk step1 from 0: -1
    assert.equal(cm.flk, -1);
  }
  // step 2: flk=-1 -> --flk = -2; -2 == -2 -> flk = 1
  {
    const cm = makeCm({ flk: -1, tutok: false, mouseon: -1 });
    tab0(cm, 0);
    // expected from probe: flk step2 from -1: 1
    assert.equal(cm.flk, 1);
  }
  // step 3: flk=1 -> takes else branch -> ++flk = 2; 2 != 3 -> stays 2
  {
    const cm = makeCm({ flk: 1, tutok: false, mouseon: -1 });
    tab0(cm, 0);
    // expected from probe: flk step3 from 1: 2
    assert.equal(cm.flk, 2);
  }
  // step 4: flk=2 -> ++flk = 3; 3 == 3 -> flk = 0
  {
    const cm = makeCm({ flk: 2, tutok: false, mouseon: -1 });
    tab0(cm, 0);
    // expected from probe: flk step4 from 2: 0
    assert.equal(cm.flk, 0);
  }
});

// ---- mouseon logo hit-test (CarMaker.java:451-456) --------------------------
//
// Logo hotspot: xm > 214 && xm < 485 && ym > 25 && ym < 104, !openm
// Expected from Tab0Probe:
//   mouseon from -1 with hit (400,50): 3
//   mouseon stays 3 with hit (400,50): 3
//   mouseon from 3 with miss (100,50): -1

test('mouseon: logo hit sets mouseon=3 when mouseon==-1 (from Java Tab0Probe)', () => {
  const cm = makeCm({ xm: 400, ym: 50, mouseon: -1, openm: false });
  tab0(cm, 1);  // n=1 so flk block is suppressed
  // expected from probe: mouseon from -1 with hit (400,50): 3
  assert.equal(cm.mouseon, 3);
});

test('mouseon: logo hit leaves mouseon=3 when already 3 (from Java Tab0Probe)', () => {
  const cm = makeCm({ xm: 400, ym: 50, mouseon: 3, openm: false });
  tab0(cm, 1);
  // expected from probe: mouseon stays 3 with hit (400,50): 3
  assert.equal(cm.mouseon, 3);
});

test('mouseon: logo miss resets mouseon from 3 to -1 (from Java Tab0Probe)', () => {
  const cm = makeCm({ xm: 100, ym: 50, mouseon: 3, openm: false });
  tab0(cm, 1);
  // expected from probe: mouseon from 3 with miss (100,50): -1
  assert.equal(cm.mouseon, -1);
});

// ---- n=1 when link clicked (CarMaker.java:520-521) --------------------------
//
// if (mouseon == 1 && mouses == -1) { openlink(); n = 1; }
// Expected from Tab0Probe:
//   n after (mouseon=1, mouses=-1): 1
//   n after (mouseon=1, mouses=0): 0
//   n after (mouseon=2, mouses=-1): 0

test('n becomes 1 when mouseon==1 && mouses==-1 (from Java Tab0Probe)', () => {
  // mouseon=1: in the tutorial link hit region.
  // Use tutok=true (n3=250) and ym = 84+250+1 = 335, xm in [76,624]
  // to keep mouseon=1 through the region check.
  const cm = makeCm({ xm: 350, ym: 335, mouseon: 1, mouses: -1, tutok: true, openm: false });
  const nOut = tab0(cm, 0);
  // expected from probe: n after (mouseon=1,mouses=-1): 1
  assert.equal(nOut, 1);
});

test('n stays 0 when mouseon==1 but mouses!=−1 (from Java Tab0Probe)', () => {
  const cm = makeCm({ xm: 350, ym: 335, mouseon: 1, mouses: 0, tutok: true, openm: false });
  const nOut = tab0(cm, 0);
  // expected from probe: n after (mouseon=1,mouses=0): 0
  assert.equal(nOut, 0);
});

test('n stays 0 when mouses==-1 but mouseon!=1 (from Java Tab0Probe)', () => {
  const cm = makeCm({ xm: 350, ym: 335, mouseon: 2, mouses: -1, tutok: true, openm: false });
  const nOut = tab0(cm, 0);
  // expected from probe: n after (mouseon=2,mouses=-1): 0
  assert.equal(nOut, 0);
});

// ---- sfase==0: carname reset when slcar sel=0 (CarMaker.java:555-556) -------
//
// if (slcar.getSelectedIndex() != 0) { ... } else { carname = ""; }
// Expected from Tab0Probe: carname from sel=0, initial='': ''

test('carname reset to "" when slcar sel=0 in sfase==0 (from Java Tab0Probe)', () => {
  const cm = makeCm({ carname: 'OldCar', sfase: 0, xm: 0, ym: 0 });
  cm.slcar.select(0);   // sel=0
  tab0(cm, 1);
  // expected from probe: carname from sel=0, initial='': ''
  assert.equal(cm.carname, '');
});

// ---- n6/5 integer division in drawRect (CarMaker.java:570) ------------------
//
// drawRect(177 - n6, 202 + n4, 346 + n6*2, 167 + n6/5)
// With sfase==3 -> n6=100: n6/5 = 20 (Java int div, same as JS `100/5|0` = 20)
// Expected from Tab0Probe: n6/5 when n6=100 (int div): 20

test('n6/5 integer division when sfase==3 yields 20 (from Java Tab0Probe)', () => {
  // We verify the arithmetic the probe computed: 100/5 = 20 exactly.
  // In the JS the expression is `n6 / 5` where n6 is a plain JS number.
  // Since n6=100 and 5 divides 100 exactly, there is no truncation difference.
  // The probe confirmed 100/5 = 20 in Java int division.
  let drawRectW = undefined;
  const cm = makeCm({
    sfase: 3,
    tutok: false,
    mouseon: -1,
    xm: 0,
    ym: 0,
    rd: {
      ...makeMockRd(),
      drawRect(x, y, w, h) {
        // capture the last drawRect call
        drawRectW = h;
      },
    },
  });
  tab0(cm, 1);
  // h = 167 + n6/5 = 167 + 100/5 = 167 + 20 = 187
  // expected from probe: n6/5 when n6=100 (int div): 20
  assert.equal(drawRectW, 187);
});

// ---- init block: sfase and mouseon reset when tabed != tab ------------------
//
// When entering the tab for the first time (tabed != tab):
//   mouseon = -1;  sfase = 0;  srch.setText("");
// This is not driven by the probe (relies on IO listing), but the pure field
// mutations can be verified directly.

test('init block resets mouseon and sfase when tabed != tab', () => {
  const cm = makeCm({
    tabed: 1,   // different from tab=0
    sfase: 2,
    mouseon: 3,
    mycarslist: [],  // empty list: no .rad files, no slcar.add
  });
  tab0(cm, 1);
  assert.equal(cm.mouseon, -1);
  assert.equal(cm.sfase, 0);
  assert.equal(cm.srch._text, '');
});

// ---- carname update in sfase==0 when slcar changes -------------------------
// When slcar.getSelectedIndex() != 0 and carname differs from slcar item:
//   tomany = false; carname = slcar.getSelectedItem()
// This requires a populated slcar (tabed != tab scenario).

test('carname updated from slcar selection in sfase==0', () => {
  const cm = makeCm({
    tabed: 1,     // triggers init block
    sfase: 0,
    carname: '',
    mycarslist: ['MyCar.rad', 'OtherCar.rad'],
    // The shell's synchronous .rad snapshot. Asserting on the TEXT that
    // reached the code pane is stronger than asserting a stub was called.
    carsrc: (name) => (name === 'MyCar' ? '// car: MyCar\n<p>\nc(1,2,3)\n</p>\n' : ''),
  });
  // After init: slcar has items 0="Select...", 1="MyCar", 2="OtherCar"
  // carname="" -> slcar.select(0) in init
  // Then in sfase==0: sel=0 -> carname stays ""
  tab0(cm, 1);
  assert.equal(cm.carname, '');
  // Now set sel=1 to pick "MyCar"
  cm.tabed = 0;  // skip init next time
  cm.carname = '';
  cm.slcar.select(1);
  tab0(cm, 1);
  assert.equal(cm.carname, 'MyCar');
  assert.equal(cm.tomany, false);
  assert.match(cm.editor.getText(), /car: MyCar/);
});
