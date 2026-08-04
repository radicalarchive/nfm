import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as rad from './rad.js';

// A real car, not a fixture: the point of a text-is-the-model editor is that it
// reads what the game ships, so the tests read it too.
const MAX = readFileSync(new URL('../../mycars/Example, MAX Revenge.rad', import.meta.url), 'utf8');

test('reads the wheels the desktop editor shows for MAX Revenge', () => {
  const w = rad.readWheels(MAX);
  assert.equal(w.count, 4);
  assert.ok(rad.hasWheels(w));
  assert.deepEqual(
    { x: w.back.x, y: w.back.y, z: w.back.z, height: w.back.height, width: w.back.width },
    { x: 48, y: 6, z: -92, height: 22, width: 26 },
  );
  assert.equal(w.front.z, 50);
  assert.deepEqual(w.front.rims, [49, 105, 212]);
  assert.equal(w.front.rimsSize, 20);
  assert.equal(w.front.rimsDepth, 10);
  assert.equal(w.front.hide, 40);
});

test('rewriting the wheels is a fixed point', () => {
  const w = rad.readWheels(MAX);
  const once = rad.writeWheels(MAX, w);
  assert.deepEqual(rad.readWheels(once), w);
  assert.equal(rad.writeWheels(once, rad.readWheels(once)), once);
});

test('a wheel edit changes only that field', () => {
  const w = rad.readWheels(MAX);
  w.front.height = 30;
  const out = rad.writeWheels(MAX, w);
  const back = rad.readWheels(out);
  assert.equal(back.front.height, 30);
  assert.equal(back.back.height, 22);
  // and nothing outside the wheel block moved
  assert.deepEqual(rad.readStats(out), rad.readStats(MAX));
  assert.equal(rad.readColours(out).first.join(), '71,157,199');
});

test('the wheel block goes where the old one was, not onto the end', () => {
  const w = rad.readWheels(MAX);
  const out = rad.writeWheels(MAX, w).split('\n');
  const first = out.findIndex((l) => l.trim().startsWith('gwgr('));
  const last = out.length - 1 - [...out].reverse().findIndex((l) => l.trim().startsWith('w('));
  assert.ok(first > 0 && last < out.length - 3, 'the block stayed in the body of the file');
});

test('reads stats, class and physics', () => {
  assert.deepEqual(rad.readStats(MAX), [128, 98, 102, 109, 123]);
  assert.equal(rad.statTotal(rad.readStats(MAX)), 560);
  assert.equal(rad.CLASS_NAMES[rad.classOf(rad.readStats(MAX))], 'Class B & C');

  const p = rad.readPhysics(MAX);
  assert.deepEqual(p.phys, [14, 50, 28, 67, 50, 100, 0, 0, 50, 98, 100]);
  assert.deepEqual(p.crash, [56, 80, 16]);
  assert.equal(p.engsel, 3);
  assert.equal(p.actmag, 13086);   // the crash calibration survives a round trip
  assert.equal(rad.readPhysics(rad.writePhysics(MAX, p)).actmag, 13086);
});

test('stats stay on their class budget when one is dragged', () => {
  const stat = rad.readStats(MAX);
  const up = rad.setStat(stat, 0, 200);
  assert.equal(up[0], 200);
  assert.equal(rad.statTotal(up), rad.statTotal(stat), 'the total is the class');
  assert.ok(up.every((v) => v >= rad.STAT_MIN && v <= rad.STAT_MAX));

  const down = rad.setStat(stat, 2, 0);
  assert.equal(down[2], rad.STAT_MIN, 'clamped to the floor, not to zero');
  assert.equal(rad.statTotal(down), rad.statTotal(stat));
});

test('a stat cannot be raised past what the other four can pay', () => {
  // Four stats already on the floor: nothing left to spend.
  const pinned = [200, 16, 16, 16, 16];
  assert.deepEqual(rad.setStat(pinned, 0, 200), pinned);
});

test('changing class re-budgets every stat', () => {
  const stat = rad.readStats(MAX);
  const a = rad.setClass(stat, 0);
  assert.equal(rad.statTotal(a), 680);
  assert.equal(rad.CLASS_NAMES[rad.classOf(a)], 'Class A');
  assert.ok(a.every((v) => v <= rad.STAT_MAX));
  const c = rad.setClass(stat, 4);
  assert.equal(rad.statTotal(c), 520);
});

test('recolouring repaints the polygons, not just the header', () => {
  const before = (MAX.match(/\(71,157,199\)/g) || []).length;
  assert.ok(before > 1, 'the car has faces in its first colour');
  const out = rad.writeColour(MAX, 0, [10, 20, 30]);
  assert.equal(rad.readColours(out).first.join(), '10,20,30');
  assert.equal((out.match(/\(71,157,199\)/g) || []).length, 0);
  assert.equal((out.match(/\(10,20,30\)/g) || []).length, before);
  // the second colour is untouched
  assert.equal(rad.readColours(out).second.join(), '44,97,122');
});

test('scale reads the three axes and writes them back in place', () => {
  assert.deepEqual(rad.readScale(MAX), [145, 145, 145]);
  const out = rad.writeScale(MAX, [100, 120, 145]);
  assert.deepEqual(rad.readScale(out), [100, 120, 145]);
  assert.equal(out.split('\n').filter((l) => l.trim().startsWith('ScaleX(')).length, 1);
});

test('scale defaults to 100 when the car does not say', () => {
  assert.deepEqual(rad.readScale('<p>\np(1,2,3)\n</p>\n'), [100, 100, 100]);
});

test('setLine replaces rather than appends, and drops duplicates', () => {
  const text = 'a\nstat(1,2,3,4,5)\nb\nstat(9,9,9,9,9)\nc\n';
  const out = rad.setLine(text, 'stat', 'stat(7,7,7,7,7)');
  assert.equal(out, 'a\nstat(7,7,7,7,7)\nb\nc\n');
});

test('setLine appends when the directive is absent', () => {
  const out = rad.setLine('<p>\n</p>\n\n\n', 'stat', 'stat(1,1,1,1,1)');
  assert.match(out, /<\/p>\n\nstat\(1,1,1,1,1\)\n$/);
});

test('alignment rotates every point and leaves the rest alone', () => {
  const text = '<p>\nc(1,2,3)\np(10,20,30)\np(-1,-2,-3) // tail\n</p>\n';
  const out = rad.transformPoints(text, rad.ALIGN.rotateX);
  assert.match(out, /p\(10,30,-20\)/);
  assert.match(out, /p\(-1,-3,2\) \/\/ tail/);
  assert.match(out, /c\(1,2,3\)/, 'colours are not points');
});

test('nudge and mirror', () => {
  const text = 'p(5,5,5)\n';
  assert.match(rad.transformPoints(text, rad.ALIGN.nudge(1, -10)), /p\(5,-5,5\)/);
  assert.match(rad.transformPoints(text, rad.ALIGN.mirrorX), /p\(-5,5,5\)/);
});

test('a transform can be limited to a selection', () => {
  const text = 'p(1,1,1)\np(2,2,2)\n';
  const out = rad.transformPoints(text, rad.ALIGN.mirrorX, [9, 17]);
  assert.equal(out, 'p(1,1,1)\np(-2,2,2)\n');
});

test('problems() is quiet about a car the game accepts', () => {
  // No ContO here, so only the text-level gates run; those must all pass.
  assert.deepEqual(rad.problems(MAX, null), []);
});

test('problems() names what is missing', () => {
  const naked = '<p>\np(1,2,3)\n</p>\n';
  const said = rad.problems(naked, { npl: 4, maxR: 50 }).join('\n');
  assert.match(said, /colour/i);
  assert.match(said, /four wheels/i);
  assert.match(said, /stats/i);
  assert.match(said, /handling/i);
  assert.match(said, /too small/i);
  // Player-facing: these say what to do, and never name the code.
  assert.doesNotMatch(said, /ContO|checko|applet|\.rad file|npl|maxR/);
});

test('problems() rejects a stat total that is not a class', () => {
  const bad = rad.writeStats(MAX, [100, 100, 100, 100, 100]);
  assert.match(rad.problems(bad, null).join('\n'), /not a class budget/);
  assert.match(rad.problems(bad, null).join('\n'), /Stats tab/);
});

test('scale is inserted ABOVE the geometry it has to scale', () => {
  // A base model out of models.zip has no ScaleX line. Appending one to the end
  // puts it after every p() it was meant to affect, and ContO applies the scale
  // as it reads each point -- so the slider silently did nothing.
  const car = '// a car\n\n<p>\nc(1,2,3)\np(10,20,30)\n</p>\n\nstat(120,120,120,120,120)\n';
  const out = rad.writeScale(car, [200, 200, 200]).split('\n');
  const scaleAt = out.findIndex((l) => l.trim().startsWith('ScaleX('));
  const geomAt = out.findIndex((l) => l.trim().startsWith('<p>'));
  assert.ok(scaleAt >= 0 && scaleAt < geomAt, `ScaleX at ${scaleAt}, <p> at ${geomAt}`);
  assert.deepEqual(rad.readScale(out.join('\n')), [200, 200, 200]);
});

test('a new colour header lands above the polygons too', () => {
  // colnum is decided against 1stColor when a <p> block closes (ContO.js:224).
  const car = '// a car\n\n<p>\nc(1,2,3)\np(10,20,30)\n</p>\n';
  const out = rad.writeColour(car, 0, [9, 9, 9]).split('\n');
  assert.ok(out.findIndex((l) => l.trim().startsWith('1stColor('))
          < out.findIndex((l) => l.trim().startsWith('<p>')));
});

test('an existing directive is still replaced where it stands', () => {
  const car = 'ScaleX(100)\n\n<p>\np(1,1,1)\n</p>\n';
  assert.equal(rad.writeScale(car, [150, 100, 100]).split('\n')[0], 'ScaleX(150)');
});
