// The bridge that lets HTML controls drive the transpiled tabs.
//
// What matters here is that a harvested button's rect really does hit-test:
// if the coordinates are off by more than the ±12px slop in `stringbutton`,
// click() silently does nothing and the editor looks broken with no error.
import test from 'node:test';
import assert from 'node:assert/strict';
import { harvest, click, act, tick, Recorder } from './headless.js';
import { stringbutton } from './ui.js';
import { intArray } from '../java.js';

function state() {
  return {
    rd: new Recorder(),
    ftm: { stringWidth: (s) => s.length * 7, getHeight: () => 12 },
    apx: 0, apy: 0, btn: 0, mouses: 0, xm: 0, ym: 0,
    bx: intArray(24), by: intArray(24), bw: intArray(24),
    pessd: new Array(24).fill(false),
    hits: [],
  };
}

/** A stand-in pane: two buttons, each recording that it was clicked. */
function pane(cm) {
  if (stringbutton(cm, ' Save ', 300, 520, 0, false), hit(cm, 300, 520)) cm.hits.push('save');
  if (stringbutton(cm, ' Delete ', 300, 560, 0, false), hit(cm, 300, 560)) cm.hits.push('delete');
}

// The same test the ported code uses, inlined so this file does not depend on
// which chunk happens to own a pane today.
function hit(cm, n, n2) {
  const half = (cm.bw[cm.btn - 1] / 2) | 0;
  return Math.abs(cm.xm - n) < half + 12 && Math.abs(cm.ym - n2 + 5) < 10 && cm.mouses === -1;
}

test('harvest pairs every button with its label and rect', () => {
  const cm = state();
  const buttons = harvest(cm, pane);
  assert.deepEqual(buttons.map((b) => b.label), [' Save ', ' Delete ']);
  assert.equal(buttons[0].x, 300);
  assert.equal(buttons[0].y, 515);      // stringbutton stores n2 - 5
});

test('harvest fires no action: it must be safe to run every frame', () => {
  const cm = state();
  cm.mouses = -1;                        // as if the user were mid-click
  cm.xm = 300; cm.ym = 520;
  harvest(cm, pane);
  assert.deepEqual(cm.hits, []);
  assert.equal(cm.mouses, -1, 'harvest restores the caller state it borrowed');
  assert.equal(cm.xm, 300);
});

test('click by label takes the branch the desktop game takes', () => {
  const cm = state();
  assert.equal(click(cm, pane, ' Delete '), true);
  assert.deepEqual(cm.hits, ['delete'], 'only the named button fires');
});

test('click tolerates the padding in the labels', () => {
  const cm = state();
  assert.equal(click(cm, pane, 'Save'), true);
  assert.deepEqual(cm.hits, ['save']);
});

test('click reports an unknown label rather than silently doing nothing', () => {
  const cm = state();
  assert.equal(click(cm, pane, 'Publish'), false);
  assert.deepEqual(cm.hits, []);
});

test('click leaves the mouse released, so the next frame cannot re-fire it', () => {
  const cm = state();
  click(cm, pane, ' Save ');
  assert.equal(cm.mouses, 0);
  const again = state();
  Object.assign(again, { mouses: cm.mouses, xm: cm.xm, ym: cm.ym });
  tick(again, pane);
  assert.deepEqual(again.hits, []);
});

// The two-pass dispatch. This is the part that is easy to get wrong quietly:
// pressing a button against the pane alone registers the rect and acts on
// nothing, so the UI looks fine and does nothing at all.
test('act() runs the layout pass first, then the action pass on the button', () => {
  const cm = state();
  const order = [];

  const layout = (c) => {
    order.push(`layout mouses=${c.mouses}`);
    stringbutton(c, ' Save ', 300, 520, 0, false);
  };
  const action = (c) => {
    order.push(`action mouses=${c.mouses} xm=${c.xm}`);
    // What ctachm does: read back the rect the pane just registered.
    if (Math.abs(c.xm - c.bx[0]) < (c.bw[0] / 2 | 0) + 12 && c.mouses === -1) c.hits.push('save');
  };

  const target = harvest(cm, layout)[0];
  order.length = 0;                     // harvest ran layout once to find it
  act(cm, layout, action, target);

  assert.deepEqual(cm.hits, ['save']);
  assert.equal(order[0], 'layout mouses=0', 'the layout pass must not see a click');
  assert.match(order[1], /^action mouses=-1/, 'the action pass sees the release');
  assert.equal(cm.mouses, 0, 'and the click is consumed, so it cannot repeat');
});
