import test from 'node:test';
import assert from 'node:assert/strict';
import { hidefields, movefield, drawms, openlink, openhlink, stringbutton, ovbutton } from './ui.js';
import { intArray } from '../java.js';

// Expected values produced by tools/UiProbe.java driving real CarMaker class by reflection.

test('movefield updates component bounds with apx and apy', () => {
  const cm = { apx: 15, apy: -30 };
  const comp = {
    x: 0, y: 0, width: 10, height: 10,
    getX() { return this.x; },
    getY() { return this.y; },
    getWidth() { return this.width; },
    getHeight() { return this.height; },
    setBounds(x, y, w, h) { this.x = x; this.y = y; this.width = w; this.height = h; }
  };

  movefield(cm, comp, 100, 200, 50, 25);
  // Probe printed: x=115, y=170, w=50, h=25
  assert.strictEqual(comp.x, 115);
  assert.strictEqual(comp.y, 170);
  assert.strictEqual(comp.width, 50);
  assert.strictEqual(comp.height, 25);
});

test('movefield handles int32 overflow wrapping', () => {
  const cm = { apx: -2000000000, apy: -2000000000 };
  const comp = {
    x: 0, y: 0, width: 10, height: 10,
    getX() { return this.x; },
    getY() { return this.y; },
    getWidth() { return this.width; },
    getHeight() { return this.height; },
    setBounds(x, y, w, h) { this.x = x; this.y = y; this.width = w; this.height = h; }
  };

  movefield(cm, comp, -1000000000, -1000000000, 80, 40);
  // Probe printed: x=1294967296, y=1294967296, w=80, h=40
  assert.strictEqual(comp.x, 1294967296);
  assert.strictEqual(comp.y, 1294967296);
  assert.strictEqual(comp.width, 80);
  assert.strictEqual(comp.height, 40);
});

test('stringbutton records button coordinates and increments btn counter', () => {
  const mockRd = {
    setFont() {},
    getFontMetrics() {
      return { stringWidth(str) { return str.length * 6; } };
    },
    setColor() {},
    fillRect() {},
    drawLine() {},
    drawString() {}
  };

  const cm = {
    rd: mockRd,
    ftm: null,
    btn: 0,
    bx: intArray(100),
    by: intArray(100),
    bw: intArray(100),
    pessd: new Array(100).fill(false)
  };

  // Call 1: "Test Button" length 11 -> width 66
  stringbutton(cm, "Test Button", 100, 200, 4, false);
  // Probe printed: btn=1, bx[0]=100, by[0]=195, bw[0]=66
  assert.strictEqual(cm.btn, 1);
  assert.strictEqual(cm.bx[0], 100);
  assert.strictEqual(cm.by[0], 195);
  assert.strictEqual(cm.bw[0], 66);

  // Call 2: "Publish Car" length 11 -> width 71 (in Java font metrics)
  // Our mock returns 11 * 6 = 66, let's update mock stringWidth to match Java probe output for exact match
  mockRd.getFontMetrics = () => ({
    stringWidth(str) {
      if (str === 'Publish Car') return 71;
      if (str === 'Pressed Btn') return 72;
      return str.length * 6;
    }
  });

  stringbutton(cm, "Publish Car", -500, -300, -10, true);
  // Probe printed: btn=2, bx[1]=-500, by[1]=-305, bw[1]=71
  assert.strictEqual(cm.btn, 2);
  assert.strictEqual(cm.bx[1], -500);
  assert.strictEqual(cm.by[1], -305);
  assert.strictEqual(cm.bw[1], 71);

  // Call 3 (pressed button)
  cm.pessd[2] = true;
  stringbutton(cm, "Pressed Btn", 300, 400, 2, false);
  // Probe printed: btn=3, bx[2]=300, by[2]=395, bw[2]=72
  assert.strictEqual(cm.btn, 3);
  assert.strictEqual(cm.bx[2], 300);
  assert.strictEqual(cm.by[2], 395);
  assert.strictEqual(cm.bw[2], 72);
});

test('ovbutton handles hit testing and mouse click state', () => {
  const mockRd = {
    setFont() {},
    getFontMetrics() {
      return { stringWidth(str) { return str.length * 8; } };
    },
    setColor() {},
    fillRect() {},
    drawLine() {},
    drawString() {}
  };

  const cm = {
    rd: mockRd,
    ftm: null,
    xm: 100,
    ym: 200,
    mouses: 0
  };

  // Probe 1: xm=100, ym=200, mouses=0 -> res=false, mouses=0
  const res1 = ovbutton(cm, "X", 100, 200);
  assert.strictEqual(res1, false);
  assert.strictEqual(cm.mouses, 0);

  // Probe 2: xm=100, ym=195, mouses=-1 -> res=true, mouses=0 (mouse click released)
  cm.xm = 100;
  cm.ym = 195;
  cm.mouses = -1;
  const res2 = ovbutton(cm, "Download", 100, 200);
  assert.strictEqual(res2, true);
  assert.strictEqual(cm.mouses, 0);

  // Probe 3: xm=500, ym=500, mouses=1 -> res=false, mouses=1
  cm.xm = 500;
  cm.ym = 500;
  cm.mouses = 1;
  const res3 = ovbutton(cm, "Cancel", 100, 200);
  assert.strictEqual(res3, false);
  assert.strictEqual(cm.mouses, 1);
});

test('drawms manages menu open state across all menu components', () => {
  const makeMenu = (returnValue) => ({
    draw(rd, xm, ym, mousdr, val, flag) {
      return returnValue;
    }
  });

  const cm = {
    rd: {},
    xm: 0,
    ym: 0,
    mousdr: false,
    openm: false,
    waso: false,
    mouses: 1,
    pubtyp: makeMenu(false),
    pubitem: makeMenu(false),
    fontsel: makeMenu(false),
    ctheme: makeMenu(false),
    compcar: makeMenu(false),
    cls: makeMenu(false),
    simcar: makeMenu(false),
    engine: makeMenu(false),
    witho: makeMenu(false),
    slcar: makeMenu(false)
  };

  drawms(cm);
  // Probe printed: openm=false, waso=false, mouses=1
  assert.strictEqual(cm.openm, false);
  assert.strictEqual(cm.waso, false);
  assert.strictEqual(cm.mouses, 1);

  // If one menu opens:
  cm.ctheme = makeMenu(true);
  drawms(cm);
  assert.strictEqual(cm.openm, true);
  assert.strictEqual(cm.waso, true);
  assert.strictEqual(cm.mouses, 0);
});

test('hidefields invokes hide on all field components', () => {
  let hiddenCount = 0;
  const makeHideable = () => ({ hide() { hiddenCount++; } });

  const cm = {
    pubtyp: makeHideable(),
    pubitem: makeHideable(),
    tpass: makeHideable(),
    tnick: makeHideable(),
    slcar: makeHideable(),
    witho: makeHideable(),
    wv: new Array(16).fill(null).map(() => makeHideable()),
    simcar: makeHideable(),
    engine: makeHideable(),
    cls: makeHideable(),
    compcar: makeHideable(),
    editor: makeHideable(),
    fontsel: makeHideable(),
    ctheme: makeHideable(),
    srch: makeHideable(),
    rplc: makeHideable()
  };

  hidefields(cm);
  // 15 single fields + 16 array elements = 31 components hidden
  assert.strictEqual(hiddenCount, 31);
});

test('openlink and openhlink execute expected URLs', () => {
  const opened = [];
  const cm = {
    openurl(url) {
      opened.push(url);
    }
  };

  openlink(cm);
  openhlink(cm);

  assert.deepStrictEqual(opened, [
    'http://www.needformadness.com/developer/simplecar.html',
    'http://www.needformadness.com/developer/'
  ]);
});
