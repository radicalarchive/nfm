// The tests that matter here are about ORDER, not appearance. The renderer has
// no depth buffer, so "later vertices appear later in the buffer" is the
// correctness property that keeps cars from drawing through walls.
import test from 'node:test';
import assert from 'node:assert';
import { Graphics2D } from './graphics.js';

const headless = () => new Graphics2D(null, null, 800, 450);

/** Read back the colours of each vertex, in buffer order. */
function colours(g) {
  const out = [];
  for (let i = 0; i < g.vertexCount; i++) {
    out.push(g.colorAt(i).slice(0, 3));
  }
  return out;
}

test('a convex quad fans into two triangles', () => {
  const g = headless();
  g.begin();
  g.setColor(10, 20, 30);
  g.fillPolygon([0, 10, 10, 0], [0, 0, 10, 10], 4);
  assert.equal(g.vertexCount, 6);
  // Fan is (0,1,2) then (0,2,3).
  const xy = (i) => g.vertexAt(i);
  assert.deepEqual(xy(0), [0, 0]);
  assert.deepEqual(xy(1), [10, 0]);
  assert.deepEqual(xy(2), [10, 10]);
  assert.deepEqual(xy(3), [0, 0]);
  assert.deepEqual(xy(4), [10, 10]);
  assert.deepEqual(xy(5), [0, 10]);
});

test('colour is per-vertex, so state changes never split the batch', () => {
  const g = headless();
  g.begin();
  g.setColor(255, 0, 0);
  g.fillPolygon([0, 1, 1], [0, 0, 1], 3);
  g.setColor(0, 255, 0);
  g.fillPolygon([0, 1, 1], [0, 0, 1], 3);
  assert.equal(g.vertexCount, 6);
  assert.deepEqual(colours(g), [
    [255, 0, 0], [255, 0, 0], [255, 0, 0],
    [0, 255, 0], [0, 255, 0], [0, 255, 0],
  ]);
});

test('submission order is preserved across mixed primitive types', () => {
  // This is the load-bearing test. A fill, an outline, a line and a rect are
  // four different GL primitives in a naive implementation; batching or
  // reordering any of them would break the painter's algorithm. All four must
  // land in one buffer in the order they were called.
  const g = headless();
  g.begin();
  g.setColor(1, 0, 0);   g.fillPolygon([0, 9, 9], [0, 0, 9], 3);   // fill  first
  g.setColor(2, 0, 0);   g.drawLine(0, 0, 10, 0);                  // line  second
  g.setColor(3, 0, 0);   g.fillRect(0, 0, 5, 5);                   // rect  third
  g.setColor(4, 0, 0);   g.drawPolygon([0, 9, 9], [0, 0, 9], 3);   // outline last

  const seq = colours(g).map((c) => c[0]);
  // Strictly non-decreasing, and every stage present exactly once as a run.
  const runs = seq.filter((v, i) => i === 0 || v !== seq[i - 1]);
  assert.deepEqual(runs, [1, 2, 3, 4], `got sequence ${seq.join(',')}`);
});

test('outlines are triangles, not a second primitive type', () => {
  // If drawPolygon ever emitted GL_LINES it would need its own draw call, and
  // that draw call could not be interleaved with the fills.
  const g = headless();
  g.begin();
  g.drawPolygon([0, 10, 10], [0, 0, 10], 3);
  assert.equal(g.vertexCount, 3 * 6);   // 3 edges x 2 triangles x 3 verts
});

test('zero-length segments are dropped rather than producing NaN', () => {
  const g = headless();
  g.begin();
  g.drawLine(5, 5, 5, 5);
  assert.equal(g.vertexCount, 0);
  assert.ok(g.f32.every((v) => !Number.isNaN(v)));
});

test('begin() resets the buffer and the composite alpha', () => {
  const g = headless();
  g.begin();
  g.setComposite(0.25);
  g.fillRect(0, 0, 1, 1);
  assert.equal(g.vertexCount, 6);
  // Alpha is quantised to 8 bits by the packed vertex format: 0.25 * 255
  // rounds to 64. The framebuffer is 8-bit anyway, so nothing visible changes.
  assert.equal(g.colorAt(0)[3], 64);
  g.begin();
  assert.equal(g.vertexCount, 0);
  assert.equal(g.a, 1);
});

test('the buffer grows without losing already-written vertices', () => {
  const g = headless();
  g.begin();
  const initial = g.capacity;
  g.setColor(255, 0, 0);
  g.fillPolygon([0, 1, 1], [0, 0, 1], 3);
  while (g.capacity === initial) g.fillRect(0, 0, 1, 1);
  // The very first triangle must survive the reallocation intact.
  assert.deepEqual(colours(g)[0], [255, 0, 0]);
  assert.deepEqual(g.vertexAt(0), [0, 0]);
});

test('a convex polygon still takes the fast fan path', () => {
  const g = headless();
  g.begin();
  g.fillPolygon([0, 10, 10, 0], [0, 0, 10, 10], 4);
  assert.equal(g.vertexCount, 6);   // 2 triangles, unchanged
});

test('a concave polygon is triangulated, not fanned', () => {
  // An L-shape. A fan from vertex 0 covers area OUTSIDE the polygon; this is
  // the bug that put a stray triangle over every letter of the in-game
  // checkpoint text (the glyphs are 12-28 vertex concave outlines).
  const xs = [0, 30, 30, 10, 10, 0];
  const ys = [0, 0, 10, 10, 30, 30];
  const g = headless();
  g.begin();
  g.fillPolygon(xs, ys, 6);
  assert.equal(g.vertexCount, (6 - 2) * 3, 'expected n-2 triangles');

  // No emitted triangle may have its centroid outside the L.
  const inL = (x, y) => (x >= 0 && x <= 30 && y >= 0 && y <= 10) ||
                        (x >= 0 && x <= 10 && y >= 0 && y <= 30);
  for (let t = 0; t < g.vertexCount; t += 3) {
    let cx = 0, cy = 0;
    for (let k = 0; k < 3; k++) { const [x, y] = g.vertexAt(t + k); cx += x; cy += y; }
    cx /= 3; cy /= 3;
    assert.ok(inL(cx, cy), `triangle ${t / 3} centroid (${cx},${cy}) lies outside the polygon`);
  }
});

test('triangulated area equals the polygon area', () => {
  const xs = [0, 30, 30, 10, 10, 0];
  const ys = [0, 0, 10, 10, 30, 30];
  const g = headless();
  g.begin();
  g.fillPolygon(xs, ys, 6);
  let area = 0;
  for (let t = 0; t < g.vertexCount; t += 3) {
    const p = (k, o) => g.vertexAt(t + k)[o];
    area += Math.abs((p(1, 0) - p(0, 0)) * (p(2, 1) - p(0, 1)) -
                     (p(2, 0) - p(0, 0)) * (p(1, 1) - p(0, 1))) / 2;
  }
  assert.equal(area, 500);   // L-shape: 30x10 + 10x20
});

test('concave triangles stay contiguous, preserving draw order', () => {
  const g = headless();
  g.begin();
  g.setColor(1, 0, 0);
  g.fillPolygon([0, 30, 30, 10, 10, 0], [0, 0, 10, 10, 30, 30], 6);
  g.setColor(2, 0, 0);
  g.fillPolygon([0, 5, 5], [0, 0, 5], 3);
  const seq = [];
  for (let i = 0; i < g.vertexCount; i++) seq.push(g.colorAt(i)[0]);
  const runs = seq.filter((v, i) => i === 0 || v !== seq[i - 1]);
  assert.deepEqual(runs, [1, 2], 'polygon triangles must not interleave');
});

// ---------------------------------------------------------------------------
// Glyph fill, checked against java.awt.Graphics2D itself.
//
// Expected pixel counts come from js/tools/GlyphFill.java, which rasterizes the
// same polygons with the real JDK and counts filled pixels. Nothing here is
// derived by hand -- an earlier version of these tests used a shoelace area as
// the oracle and was WRONG for the "O": when a keyhole's inner loop winds the
// same way as its outer, the shoelace ADDS the hole (A+H) while an even-odd
// fill gives A-H.
// ---------------------------------------------------------------------------

/** Real "O" from data/models.zip:checkpoint.rad, projected to screen space. */
const GLYPH_O_X = [368,422,398,320,302,320,302,266,188,116,98,116,158,236,320,398,410,392,362,314,182,92,50,20,44,92,158,248];
const GLYPH_O_Y = [50,104,116,158,170,224,302,350,374,338,266,182,134,110,158,116,188,290,350,404,452,428,386,272,158,86,38,20];

/** Real "R", same source. */
const GLYPH_R_X = [116,20,56,98,134,200,296,320,284,188,212,200,134,110,98,224,320,374,398,374,326,248,158];
const GLYPH_R_Y = [428,446,314,200,116,116,110,146,182,194,134,116,116,122,32,20,38,68,128,194,236,260,266];

/** Total area of the triangles the batcher emitted. */
function emittedArea(g) {
  let a = 0;
  for (let t = 0; t < g.vertexCount; t += 3) {
    const p = (k, o) => g.vertexAt(t + k)[o];
    a += Math.abs((p(1, 0) - p(0, 0)) * (p(2, 1) - p(0, 1)) -
                  (p(2, 0) - p(0, 0)) * (p(1, 1) - p(0, 1))) / 2;
  }
  return a;
}

function fillGlyph(xs, ys) {
  const g = new Graphics2D(null, null, 1200, 1200);
  g.begin();
  g.fillPolygon(xs, ys, xs.length);
  return g;
}

test('the O keeps its counter, matching java.awt pixel-for-pixel', () => {
  // Java: 86067 filled pixels. Ear clipping filled the hole in and gave far
  // more; this is the regression that guards it.
  const area = emittedArea(fillGlyph(GLYPH_O_X, GLYPH_O_Y));
  assert.ok(Math.abs(area - 86067) / 86067 < 0.01,
    `emitted ${area.toFixed(0)} vs java.awt 86067 -- the O's hole is wrong`);
});

test('the R keeps its counter, matching java.awt', () => {
  const area = emittedArea(fillGlyph(GLYPH_R_X, GLYPH_R_Y));
  assert.ok(Math.abs(area - 68484) / 68484 < 0.01,
    `emitted ${area.toFixed(0)} vs java.awt 68484`);
});

test('glyph fill is stable under camera motion', () => {
  // Projected coords are integers, so camera motion snaps vertices to
  // different pixels. Scanline fill is deterministic, so the area must track
  // smoothly rather than popping -- the "twitchy letters" regression.
  let worstJump = 0;
  let prev = null;
  for (let s = 0; s < 120; s++) {
    const dx = (s * 0.37) % 5;
    const dy = (s * 0.61) % 5;
    const xs = GLYPH_O_X.map((v) => Math.round(v + dx));
    const ys = GLYPH_O_Y.map((v) => Math.round(v + dy));
    const area = emittedArea(fillGlyph(xs, ys));
    if (prev !== null) worstJump = Math.max(worstJump, Math.abs(area - prev) / prev);
    prev = area;
  }
  assert.ok(worstJump < 0.02,
    `area jumped ${(worstJump * 100).toFixed(1)}% between adjacent camera offsets`);
});

// --- concave / self-intersecting fill ---------------------------------------
//
// The trapezoid fill replaced a per-pixel-row scanline fill. Both are exact
// even-odd fills, so both are checked against a ground-truth point-in-polygon
// test rather than against each other -- comparing the two implementations
// would only prove they agree, not that either is right.

/** Even-odd point-in-polygon, the rule java.awt.fillPolygon uses. */
function insideEvenOdd(xs, ys, n, px, py) {
  let inside = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    if ((ys[i] > py) !== (ys[j] > py) &&
        px < xs[j] + ((py - ys[j]) / (ys[i] - ys[j])) * (xs[i] - xs[j])) {
      inside = !inside;
    }
  }
  return inside;
}

/** Rasterise everything the batcher emitted onto a w*h pixel grid. */
function rasterise(g, w, h) {
  const grid = new Uint8Array(w * h);
  for (let t = 0; t + 2 < g.vertexCount; t += 3) {
    const [x0, y0] = g.vertexAt(t);
    const [x1, y1] = g.vertexAt(t + 1);
    const [x2, y2] = g.vertexAt(t + 2);
    const det = (y1 - y2) * (x0 - x2) + (x2 - x1) * (y0 - y2);
    if (det === 0) continue;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const px = x + 0.5, py = y + 0.5;
        const a = ((y1 - y2) * (px - x2) + (x2 - x1) * (py - y2)) / det;
        const b = ((y2 - y0) * (px - x2) + (x0 - x2) * (py - y2)) / det;
        if (a >= 0 && b >= 0 && a + b <= 1) grid[y * w + x] = 1;
      }
    }
  }
  return grid;
}

const FILL_CASES = {
  // The backdrop hands fillPolygon quads ordered TL, TR, BL, BR. Those are
  // self-intersecting, and java.awt fills them as an hourglass -- a triangle
  // fan would fill the bounding quad instead, which is why this matters.
  'bowtie quad': [[20, 60, 18, 20], [10, 8, 45, 45]],
  'concave arrow': [[10, 40, 70, 40, 10], [10, 30, 10, 50, 50]],
  // Checkpoint glyphs: an outer ring bridged to an inner counter and back.
  'keyhole glyph': [[10, 60, 60, 10, 10, 20, 50, 50, 20, 10],
                    [10, 10, 50, 50, 10, 20, 20, 40, 40, 20]],
};

for (const [name, [xs, ys]] of Object.entries(FILL_CASES)) {
  test(`even-odd fill is exact: ${name}`, () => {
    const W = 80, H = 60, n = xs.length;
    const g = new Graphics2D(null, null, W, H);
    g.begin();
    g.fillPolygon(xs, ys, n);
    const got = rasterise(g, W, H);
    let wrong = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const want = insideEvenOdd(xs, ys, n, x + 0.5, y + 0.5) ? 1 : 0;
        if (got[y * W + x] !== want) wrong++;
      }
    }
    assert.equal(wrong, 0, `${wrong} pixels differ from the even-odd truth`);
  });
}

test('the trapezoid fill emits far less than the scanline fill it replaced', () => {
  const [xs, ys] = FILL_CASES['bowtie quad'];
  const trap = new Graphics2D(null, null, 80, 60);
  const scan = new Graphics2D(null, null, 80, 60, { fill: 'scan' });
  trap.begin(); trap.fillPolygon(xs, ys, 4);
  scan.begin(); scan.fillPolygon(xs, ys, 4);
  // Trapezoids are O(vertices); the scanline fill was O(polygon height).
  assert.ok(trap.vertexCount * 4 < scan.vertexCount,
            `trap ${trap.vertexCount} vs scan ${scan.vertexCount}`);
});

// setFont takes both shapes: the HUD's CSS string and the transpiled editor's
// java.awt.Font. The editor call sites say `rd.setFont(new Font("Arial", 1, 12))`
// because that is what CarMaker.java says, and §0 forbids rewriting them --
// so the conversion has to live here. Before this, three call styles were in
// the tree and none of them reached the canvas correctly.
test('setFont accepts a CSS string, a Font object and three arguments', () => {
  const rd = new Graphics2D(null, null, 800, 450);
  const seen = [];
  rd.text = { set font(v) { seen.push(v); } };

  rd.setFont('bold 12px Arial');
  rd.setFont({ name: 'Arial', style: 1, size: 13 });
  rd.setFont('Arial', 0, 12);
  rd.setFont('Arial', 3, 10);          // BOLD | ITALIC

  assert.deepStrictEqual(seen, [
    'bold 12px Arial',
    'bold 13px "Arial"',
    '12px "Arial"',
    'italic bold 10px "Arial"',
  ]);
});
