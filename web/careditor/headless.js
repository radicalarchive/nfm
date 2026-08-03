// Run a transpiled tab with nothing painted, and read its buttons back out.
//
// The editor's UI is HTML now, but its BEHAVIOUR still lives in the tab chunks
// — 3,800 lines of it, verified against the real Java. Reimplementing that in
// DOM handlers would throw the verification away and reintroduce every bug the
// probes just caught. So the chunks still run; they just draw into a recorder
// instead of a canvas.
//
// That works because of how the original does hit testing. `stringbutton()`
// writes each button's rect into cm.bx/by/bw as it draws it, and the ported
// code decides "was this clicked" by comparing cm.xm/ym against those rects.
// Drawing and hit testing are the same pass. So:
//
//   1. run the tab with a recorder in cm.rd and cm.mouses = 0  -> harvest()
//      collects every button's label and rect without changing any state,
//   2. to act on a button, put cm.xm/ym at its centre, cm.mouses = -1 and run
//      the tab again  -> the chunk takes the branch it would have taken on a
//      real click, and mutates cm exactly as the desktop game does.
//
// The labels are the pairing: stringbutton() writes bx[btn] and then draws the
// label at `n - stringWidth/2`, so a drawString landing at exactly bx - bw/2
// is that button's text. Nothing in the transpiled code is modified to make
// this work, which is the point — it stays diff-testable against the Java.

import { idiv } from '../java.js';

/**
 * A Graphics2D-shaped sink that paints nothing and remembers the strings.
 *
 * Font metrics still have to answer, because the ported code measures text to
 * place buttons and then hit-tests against those widths. The measurement is
 * the browser's own: an offscreen 2D context, so widths match what the HTML
 * would render if it drew the same font.
 */
export class Recorder {
  constructor() {
    this.strings = [];
    this.font = '';
    this._ctx = typeof document !== 'undefined'
      ? document.createElement('canvas').getContext('2d')
      : null;
    // 7px/char is only the fallback for node --test, where there is no canvas.
    this._measure = (s) => (this._ctx
      ? Math.round(this._ctx.measureText(s).width)
      : s.length * 7);
  }

  setFont(spec, style, size) {
    if (typeof spec !== 'string' || style !== undefined) {
      const f = (typeof spec === 'object' && spec !== null) ? spec : { name: spec, style, size };
      const bits = f.style | 0;
      spec = `${bits & 2 ? 'italic ' : ''}${bits & 1 ? 'bold ' : ''}${f.size}px "${f.name}"`;
    }
    this.font = spec;
    if (this._ctx) this._ctx.font = spec;
  }

  getFontMetrics() {
    const measure = this._measure;
    return { stringWidth: (s) => measure(s), getHeight: () => 12 };
  }

  drawString(str, x, y) { this.strings.push({ str, x, y }); }

  // Everything else the chunks call, all no-ops: the HTML is the picture now.
  setColor() {}
  setComposite() {}
  setRenderingHint() {}
  fillRect() {}
  drawRect() {}
  fill3DRect() {}
  fillOval() {}
  drawOval() {}
  fillRoundRect() {}
  drawRoundRect() {}
  drawLine() {}
  fillPolygon() {}
  drawPolygon() {}
  drawImage() {}
  clearRect() {}
  scale() {}
  dispose() {}
  begin() {}
  end() {}
}

/** Put the state in "mouse over nothing" so a run cannot fire an action. */
function quiesce(cm) {
  const saved = { xm: cm.xm, ym: cm.ym, mouses: cm.mouses };
  cm.xm = -9999;
  cm.ym = -9999;
  cm.mouses = 0;
  return saved;
}

function restore(cm, saved) {
  cm.xm = saved.xm;
  cm.ym = saved.ym;
  cm.mouses = saved.mouses;
}

/**
 * Run `tabFn` once with nothing clickable and collect its buttons.
 *
 * @returns {{label: string, x: number, y: number, w: number}[]} in draw order,
 *   which is also tab order — the original lays its panes out top to bottom.
 */
export function harvest(cm, tabFn, ...args) {
  const rec = new Recorder();
  const rd = cm.rd;
  const saved = quiesce(cm);
  cm.rd = rec;
  cm.btn = 0;
  try {
    tabFn(cm, ...args);
  } finally {
    cm.rd = rd;
    restore(cm, saved);
  }

  const out = [];
  for (let i = 0; i < cm.btn; i++) {
    const x = cm.bx[i], w = cm.bw[i], y = cm.by[i];
    // stringbutton draws the label at (n - bw/2, n2); bx[i] is n and by[i] is
    // n2 - 5. A pressed button draws one pixel right and down, hence the ±1.
    const hit = rec.strings.find((s) =>
      Math.abs(s.x - (x - idiv(w, 2))) <= 1 && Math.abs(s.y - (y + 5)) <= 1);
    out.push({ label: hit ? hit.str : '', x, y, w, index: i });
  }
  return out;
}

/**
 * Click a button by its label and let the chunk do whatever it does.
 *
 * `mouses = -1` is the game's "released this frame" state, which is what every
 * `stringbutton(...)` branch tests. The coordinates are the button's own,
 * harvested from the run just before, so the hit test cannot miss.
 *
 * @returns true if a button with that label existed and was clicked.
 */
export function click(cm, tabFn, label, ...args) {
  const buttons = harvest(cm, tabFn, ...args);
  const target = buttons.find((b) => b.label === label)
              || buttons.find((b) => b.label.trim() === label.trim());
  if (!target) return false;

  const rec = new Recorder();
  const rd = cm.rd;
  cm.rd = rec;
  cm.xm = target.x;
  cm.ym = target.y + 5;
  cm.mouses = -1;
  cm.btn = 0;
  try {
    tabFn(cm, ...args);
  } finally {
    cm.rd = rd;
    cm.mouses = 0;
    cm.xm = -9999;
    cm.ym = -9999;
  }
  return true;
}

/**
 * Click the i'th button of the pane, counted in draw order.
 *
 * Labels are not unique — the scale pane alone draws six buttons labelled
 * " - " and " + " — so anything built from `harvest()` output addresses a
 * button by its index, and `click(label)` is only for the ones that are
 * unique.
 */
export function clickIndex(cm, tabFn, index, ...args) {
  const buttons = harvest(cm, tabFn, ...args);
  const target = buttons[index];
  if (!target) return false;
  return clickRect(cm, tabFn, target, ...args);
}

/** Dispatch at a harvested button's own coordinates. */
export function clickRect(cm, tabFn, target, ...args) {
  const rec = new Recorder();
  const rd = cm.rd;
  cm.rd = rec;
  cm.xm = target.x;
  cm.ym = target.y + 5;
  cm.mouses = -1;
  cm.btn = 0;
  try {
    tabFn(cm, ...args);
  } finally {
    cm.rd = rd;
    cm.mouses = 0;
    cm.xm = -9999;
    cm.ym = -9999;
  }
  return true;
}

/**
 * Press a harvested button and let the editor act on it.
 *
 * The panes only DRAW their buttons; the acting is `ctachm()`, the editor's
 * hit-test pass, which reads back the rects the pane just registered and
 * dispatches on `tab`/`dtab` plus which rect the mouse is in. So a click is
 * two runs, in the order the game's own loop runs them:
 *
 *   layoutFn(cm)   -- registers bx/by/bw for this pane   (tab0/tab1/tab2/tab3)
 *   actionFn(cm)   -- sees mouses == -1 inside one of them and acts  (ctachm)
 *
 * Get this wrong -- press the button against the pane alone -- and everything
 * looks right and nothing happens, which is exactly what the first cut did.
 */
export function act(cm, layoutFn, actionFn, target, ...args) {
  const rec = new Recorder();
  const rd = cm.rd;
  cm.rd = rec;
  cm.btn = 0;
  try {
    const saved = quiesce(cm);
    layoutFn(cm, ...args);          // register the rects, click nothing
    restore(cm, saved);
    cm.xm = target.x;
    cm.ym = target.y + 5;
    cm.mouses = -1;                 // "released this frame"
    actionFn(cm);
  } finally {
    cm.rd = rd;
    cm.mouses = 0;
    cm.xm = -9999;
    cm.ym = -9999;
  }
}

/**
 * Group harvested buttons into rows, and give each row the pane's own label.
 *
 * The original is laid out on a grid: a caption drawn at the left of a row
 * ("Scale X", "BACK Wheels :") and its controls to the right of it on the same
 * baseline. Pairing them back up is what lets the HTML show " - Scale X + "
 * instead of six anonymous minus signs.
 */
export function rows(cm, tabFn, ...args) {
  const rec = new Recorder();
  const rd = cm.rd;
  const saved = quiesce(cm);
  cm.rd = rec;
  cm.btn = 0;
  try {
    tabFn(cm, ...args);
  } finally {
    cm.rd = rd;
    restore(cm, saved);
  }

  const buttons = [];
  for (let i = 0; i < cm.btn; i++) {
    const x = cm.bx[i], w = cm.bw[i], y = cm.by[i];
    const hit = rec.strings.find((s) =>
      Math.abs(s.x - (x - idiv(w, 2))) <= 1 && Math.abs(s.y - (y + 5)) <= 1);
    buttons.push({ label: hit ? hit.str : '', x, y, w, index: i, text: hit });
  }

  const used = new Set(buttons.map((b) => b.text).filter(Boolean));
  const out = [];
  for (const b of buttons) {
    let row = out.find((r) => Math.abs(r.y - b.y) <= 6);
    if (!row) { row = { y: b.y, caption: '', buttons: [] }; out.push(row); }
    row.buttons.push(b);
  }
  for (const row of out) {
    // Everything drawn on this row that is not a button's own label: the
    // caption ("Scale X") and, to the right of it, whatever the pane is
    // showing for it (the current value). The caption is the LEFTMOST of them
    // -- picking the nearest instead gives you the value, because the pane
    // draws the number right up against the buttons.
    const left = Math.min(...row.buttons.map((b) => b.x - idiv(b.w, 2)));
    const texts = rec.strings
      .filter((s) => !used.has(s) && Math.abs(s.y - (row.y + 5)) <= 8 && s.x < left)
      .sort((a, b) => a.x - b.x);
    row.caption = texts.length ? texts[0].str.trim() : '';
    row.value = texts.length > 1 ? texts[texts.length - 1].str.trim() : '';
  }
  out.sort((a, b) => a.y - b.y);
  return out;
}

/**
 * Run a tab purely for its side effects on non-button state — the per-frame
 * bookkeeping a pane does before it draws anything (polygon counting, the
 * mirror scan, `setupo()` rebuilds). Nothing is clickable during it.
 */
export function tick(cm, tabFn, ...args) {
  const rec = new Recorder();
  const rd = cm.rd;
  const saved = quiesce(cm);
  cm.rd = rec;
  cm.btn = 0;
  try {
    return tabFn(cm, ...args);
  } finally {
    cm.rd = rd;
    restore(cm, saved);
  }
}
