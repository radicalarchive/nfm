// newCarMaker() is the stitching contract between the transpiled chunks, so
// what is tested is that it matches the Java constructor field for field --
// read out of java-src/CarMaker.java here rather than copied, so the test
// fails if the two drift.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { newCarMaker } from './state.js';

const CTOR = readFileSync(new URL('../../decompilation/java-src/CarMaker.java', import.meta.url), 'utf8')
  .split('\n').slice(208, 352);                    // lines 209-352, the constructor

test('every field the Java constructor assigns exists', () => {
  const cm = newCarMaker();
  const assigned = CTOR
    .map((l) => /^\s*this\.(\w+) = /.exec(l))
    .filter(Boolean)
    .map((m) => m[1]);
  assert.equal(assigned.length, 142);
  const missing = assigned.filter((f) => !(f in cm));
  assert.deepEqual(missing, []);
});

test('the values the editor branches on come out of the constructor', () => {
  const cm = newCarMaker();
  assert.equal(cm.tab, 0);
  assert.equal(cm.tabed, -1);          // forces the first tab switch
  assert.equal(cm.focuson, true);
  assert.equal(cm.cfont, 'Monospaced');
  assert.equal(cm.carname, '');
  assert.equal(cm.ox, 335);
  assert.equal(cm.oz, 800);
  assert.equal(cm.oxz, -90);
  assert.deepEqual([...cm.scale], [100, 100, 100]);
  assert.deepEqual([...cm.stat], [100, 100, 100, 100, 100]);
  assert.deepEqual([...cm.phys], new Array(11).fill(50));
});

test('array fields are the right shape and the right kind', () => {
  const cm = newCarMaker();
  assert.equal(cm.bx.length, 24);
  assert.equal(cm.pessd.length, 24);
  assert.equal(cm.wv.length, 16);
  assert.equal(cm.carstat.length, 16);
  assert.equal(cm.carstat[0].length, 5);
  assert.equal(cm.engs.length, 5);
  assert.equal(cm.engs[0].length, 5);
  assert.equal(cm.addeda.length, 20);
  assert.equal(cm.addeda[0].length, 5000);
  assert.equal(cm.usage.length, 15);   // the help texts, one per adjustable
});

test('two editors do not share state', () => {
  const a = newCarMaker(), b = newCarMaker();
  a.scale[0] = 999;
  a.editor.setText('p(1,2,3)');
  assert.equal(b.scale[0], 100);
  assert.equal(b.editor.getText(), '');
});
