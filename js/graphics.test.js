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
    const o = i * 6;
    out.push([
      Math.round(g.verts[o + 2] * 255),
      Math.round(g.verts[o + 3] * 255),
      Math.round(g.verts[o + 4] * 255),
    ]);
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
  const xy = (i) => [g.verts[i * 6], g.verts[i * 6 + 1]];
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
  assert.ok(g.verts.every((v) => !Number.isNaN(v)));
});

test('begin() resets the buffer and the composite alpha', () => {
  const g = headless();
  g.begin();
  g.setComposite(0.25);
  g.fillRect(0, 0, 1, 1);
  assert.equal(g.vertexCount, 6);
  assert.equal(g.verts[5], 0.25);
  g.begin();
  assert.equal(g.vertexCount, 0);
  assert.equal(g.a, 1);
});

test('the buffer grows without losing already-written vertices', () => {
  const g = headless();
  g.begin();
  const initial = g.verts.length;
  g.setColor(255, 0, 0);
  g.fillPolygon([0, 1, 1], [0, 0, 1], 3);
  while (g.verts.length === initial) g.fillRect(0, 0, 1, 1);
  // The very first triangle must survive the reallocation intact.
  assert.deepEqual(colours(g)[0], [255, 0, 0]);
  assert.deepEqual([g.verts[0], g.verts[1]], [0, 0]);
});
