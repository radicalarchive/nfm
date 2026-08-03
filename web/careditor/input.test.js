import test from 'node:test';
import assert from 'node:assert/strict';
import {
  paint,
  update,
  mouseUp,
  mouseDown,
  mouseMove,
  mouseDrag,
  lostFocus,
  gotFocus,
  keyDown,
  keyUp,
  actionPerformed,
  Cursor,
} from './input.js';
import { Madness } from '../Madness.js';

// Expected values produced by tools/InputProbe.java driving real CarMaker class by reflection.

test('paint and update calculate apx and apy and draw offImage', () => {
  let drawn = false;
  let drawnArgs = null;
  const mockGraphics = {
    drawImage(img, x, y, observer) {
      drawn = true;
      drawnArgs = { img, x, y, observer };
    },
  };

  const cm = {
    apx: 0,
    apy: 0,
    offImage: 'dummy_image',
    getWidth() {
      return 1600;
    },
    getHeight() {
      return 1200;
    },
  };

  paint(cm, mockGraphics);
  // Probe printed: apx=450, apy=325
  assert.strictEqual(cm.apx, 450);
  assert.strictEqual(cm.apy, 325);
  assert.strictEqual(drawn, true);
  assert.strictEqual(drawnArgs.x, 450);
  assert.strictEqual(drawnArgs.y, 325);

  // Overflow test via update
  cm.getWidth = () => -2000000000;
  cm.getHeight = () => -2000000000;

  update(cm, mockGraphics);
  // Probe printed: apx=-1000000350, apy=-1000000275
  assert.strictEqual(cm.apx, -1000000350);
  assert.strictEqual(cm.apy, -1000000275);
});

test('mouseUp updates xm/ym, handles waso and mouses state', () => {
  const cm = {
    apx: 450,
    apy: 325,
    xm: 0,
    ym: 0,
    waso: true,
    mouses: 0,
    mousdr: true,
    onbtgame: false,
  };

  const ret1 = mouseUp(cm, null, 500, 400);
  // Probe printed: xm=50, ym=75, waso=false, mouses=0, mousdr=false, ret=false
  assert.strictEqual(ret1, false);
  assert.strictEqual(cm.xm, 50);
  assert.strictEqual(cm.ym, 75);
  assert.strictEqual(cm.waso, false);
  assert.strictEqual(cm.mouses, 0);
  assert.strictEqual(cm.mousdr, false);

  // When waso is false, mouses becomes -1
  const ret2 = mouseUp(cm, null, -1000000000, -1000000000);
  // Probe printed: xm=-1000000450, ym=-1000000325, waso=false, mouses=-1, mousdr=false, ret=false
  assert.strictEqual(ret2, false);
  assert.strictEqual(cm.xm, -1000000450);
  assert.strictEqual(cm.ym, -1000000325);
  assert.strictEqual(cm.mouses, -1);
  assert.strictEqual(cm.mousdr, false);
});

test('mouseDown sets mouses, mousdr, and requests focus if not tab 1', () => {
  let requestedFocus = false;
  const cm = {
    apx: 100,
    apy: 50,
    xm: 0,
    ym: 0,
    mouses: 0,
    mousdr: false,
    tab: 0,
    requestFocus() {
      requestedFocus = true;
    },
  };

  const ret = mouseDown(cm, null, 250, 350);
  // Probe printed: xm=150, ym=300, mouses=1, mousdr=true, ret=false
  assert.strictEqual(ret, false);
  assert.strictEqual(cm.xm, 150);
  assert.strictEqual(cm.ym, 300);
  assert.strictEqual(cm.mouses, 1);
  assert.strictEqual(cm.mousdr, true);
  assert.strictEqual(requestedFocus, true);
});

test('mouseMove updates onbtgame and cursor state', () => {
  let currentCursor = null;
  const cm = {
    apx: 0,
    apy: 0,
    xm: 0,
    ym: 0,
    onbtgame: false,
    setCursor(c) {
      currentCursor = c;
    },
  };

  // Move inside button area (xm: 521..673, ym: 1..22)
  const ret1 = mouseMove(cm, null, 600, 10);
  // Probe printed: onbtgame=true, ret=false
  assert.strictEqual(ret1, false);
  assert.strictEqual(cm.onbtgame, true);
  assert.strictEqual(currentCursor instanceof Cursor, true);
  assert.strictEqual(currentCursor.type, 12);

  // Move outside button area
  const ret2 = mouseMove(cm, null, 100, 100);
  // Probe printed: onbtgame=false, ret=false
  assert.strictEqual(ret2, false);
  assert.strictEqual(cm.onbtgame, false);
  assert.strictEqual(currentCursor.type, 0);
});

test('mouseDrag updates mousdr and xm/ym coordinates', () => {
  const cm = {
    apx: 10,
    apy: 20,
    xm: 0,
    ym: 0,
    mousdr: false,
  };

  const ret = mouseDrag(cm, null, -2000000000, 2000000000);
  // Probe printed: xm=-2000000010, ym=1999999980, mousdr=true, ret=false
  assert.strictEqual(ret, false);
  assert.strictEqual(cm.mousdr, true);
  assert.strictEqual(cm.xm, -2000000010);
  assert.strictEqual(cm.ym, 1999999980);
});

test('lostFocus and gotFocus update focuson state', () => {
  const cm = { focuson: true };

  const retLost = lostFocus(cm, null, null);
  // Probe printed: focuson=false, ret=false
  assert.strictEqual(cm.focuson, false);
  assert.strictEqual(retLost, false);

  const retGot = gotFocus(cm, null, null);
  // Probe printed: focuson=true, ret=false
  assert.strictEqual(cm.focuson, true);
  assert.strictEqual(retGot, false);
});

test('keyDown and keyUp handle key codes and preserve game bug on keyUp 97 vs 87', () => {
  const cm = {
    focuson: true,
    rotr: false,
    rotl: false,
    plus: false,
    minus: false,
    in: false,
    out: false,
    left: false,
    right: false,
    down: false,
    up: false,
  };

  keyDown(cm, null, 87); // 'W' key -> in = true
  keyDown(cm, null, 1006); // LEFT arrow -> left = true
  // Probe printed: in=true, left=true
  assert.strictEqual(cm.in, true);
  assert.strictEqual(cm.left, true);

  // KeyUp with 97 ('a' key) clears 'in' in Java source
  keyUp(cm, null, 97);
  keyUp(cm, null, 1006);
  // Probe printed: in=false, left=false
  assert.strictEqual(cm.in, false);
  assert.strictEqual(cm.left, false);

  // KeyUp with 87 ('W' key) does NOT clear 'in' (game bug preserved verbatim)
  cm.in = true;
  keyUp(cm, null, 87);
  // Probe printed: in=true
  assert.strictEqual(cm.in, true);
});

function createMockTextComp(initialText = '') {
  let text = initialText;
  let selStart = 0;
  let selEnd = 0;
  return {
    getText() {
      return text;
    },
    setText(t) {
      text = t;
    },
    getSelectedText() {
      return text.substring(selStart, selEnd);
    },
    getSelectionStart() {
      return selStart;
    },
    getSelectionEnd() {
      return selEnd;
    },
    select(start, end) {
      selStart = start;
      selEnd = end;
    },
    selectAll() {
      selStart = 0;
      selEnd = text.length;
    },
    replaceText(s, start, end) {
      text = text.substring(0, start) + s + text.substring(end);
      selStart = start + s.length;
      selEnd = start + s.length;
    },
  };
}

test('actionPerformed handles Cut, Copy, Paste, Select All', () => {
  const wv0 = createMockTextComp('Hello World');
  wv0.select(0, 5); // "Hello" selected

  const editorComp = createMockTextComp('Line1\nLine2\nLine3');

  const cm = {
    wv: [wv0],
    srch: createMockTextComp(''),
    rplc: createMockTextComp(''),
    editor: editorComp,
  };

  Madness.textid = 0;

  // Cut on wv[0]
  actionPerformed(cm, { getActionCommand: () => 'Cut' });
  // Probe printed: wv[0]= World
  assert.strictEqual(wv0.getText(), ' World');

  // Paste into wv[0] at offset 0
  wv0.select(0, 0);
  actionPerformed(cm, { getActionCommand: () => 'Paste' });
  // Probe printed: wv[0]=Hello World
  assert.strictEqual(wv0.getText(), 'Hello World');

  // Select All on wv[0]
  actionPerformed(cm, { getActionCommand: () => 'Select All' });
  // Probe printed: selStart=0, selEnd=11
  assert.strictEqual(wv0.getSelectionStart(), 0);
  assert.strictEqual(wv0.getSelectionEnd(), 11);

  // Test editor with textid = 18
  Madness.textid = 18;
  editorComp.select(6, 11); // "Line2" selected

  actionPerformed(cm, { getActionCommand: () => 'Cut' });
  // Probe printed: editor=Line1\n\nLine3
  assert.strictEqual(editorComp.getText(), 'Line1\n\nLine3');

  editorComp.select(6, 6);
  actionPerformed(cm, { getActionCommand: () => 'Paste' });
  // Probe printed: editor=Line1\nLine2\nLine3
  assert.strictEqual(editorComp.getText(), 'Line1\nLine2\nLine3');
});
