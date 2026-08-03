// carstore: the listing and slot-assignment rules loadcarmaker() gets from the
// filesystem in Java and cannot get from a browser.
//
// The IndexedDB half is not tested here — node has no IndexedDB, and it is a
// thin wrapper. What is tested is everything that decides WHICH car ends up in
// WHICH slot, because a car changing slot between sessions changes what you
// race, and because a stored car failing to shadow a shipped one would make
// "edit a shipped car" silently edit nothing.
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import {
  SHIPPED, useBackend, memoryBackend, listAll, listStored,
  readCar, writeCar, deleteCar, renameCar, loadIntoCarDefine,
} from './carstore.js';
import { CarDefine } from './CarDefine.js';
import { Medium } from './Medium.js';
import { Trackers } from './Trackers.js';
import { ContO } from './ContO.js';

const repo = (p) => readFileSync(new URL(p, new URL('../', import.meta.url)), 'utf8');

function fresh(entries = []) {
  const map = new Map();
  for (const [name, text] of entries) map.set(name, { name, text, updated: 0 });
  useBackend(memoryBackend(map));
  return map;
}

test('listAll merges shipped and stored, with stored shadowing shipped', async () => {
  fresh([['Simple Car', 'edited'], ['My Car', 'new']]);
  const all = await listAll();
  // 4 shipped + 1 new; 'Simple Car' appears once, not twice.
  assert.strictEqual(all.length, SHIPPED.length + 1);
  assert.strictEqual(all.filter((n) => n === 'Simple Car').length, 1);
  assert.deepStrictEqual(all, [...all].sort((a, b) => a.localeCompare(b)));
});

test('readCar prefers the stored copy over the shipped file', async () => {
  fresh([['Simple Car', 'stored text']]);
  assert.strictEqual(await readCar('Simple Car'), 'stored text');
});

test('readCar returns null for an unknown car rather than throwing', async () => {
  fresh();
  assert.strictEqual(await readCar('no such car'), null);
});

test('deleting a stored copy un-shadows the shipped car', async () => {
  fresh([['Simple Car', 'stored text']]);
  await deleteCar('Simple Car');
  assert.deepStrictEqual(await listStored(), []);
  // Still listed: the shipped file is untouched by a delete.
  assert.ok((await listAll()).includes('Simple Car'));
});

test('renameCar moves the text and refuses to clobber', async () => {
  fresh([['a', 'text a'], ['b', 'text b']]);
  await renameCar('a', 'c');
  assert.strictEqual(await readCar('c'), 'text a');
  assert.strictEqual(await readCar('a'), null);
  await assert.rejects(() => renameCar('c', 'b'), /already exists/);
  assert.strictEqual(await readCar('c'), 'text a');   // failed rename kept it
});

test('writeCar rejects an empty name', async () => {
  fresh();
  await assert.rejects(() => writeCar('', 'x'), /needs a name/);
});

test('loadIntoCarDefine fills slots 16.. and skips cars loadcar rejects', async () => {
  // The real .rad off disk, so this exercises ContO's parser, not a stub.
  const good = repo('mycars/custom_formula7.rad');
  fresh([['aaa good', good], ['bbb bad', 'not a car at all'], ['ccc good', good]]);

  const cd = new CarDefine(new Array(56).fill(null), new Medium(), new Trackers(), null);
  const loaded = await loadIntoCarDefine(cd);

  // 'bbb bad' consumes no slot: loadcar returns -1 and nlcars is untouched,
  // so the next good car reuses slot 17 (CarDefine.java:1579-1586).
  assert.deepStrictEqual(loaded, ['aaa good', 'ccc good']);
  assert.strictEqual(cd.nlcars, 18);
  assert.ok(cd.bco[16] instanceof ContO);
  assert.ok(cd.bco[17] instanceof ContO);
  assert.strictEqual(cd.lastload, 1);
});

test('loadIntoCarDefine leaves nlcars at 16 and lastload alone when nothing loads', async () => {
  fresh([['junk', 'not a car at all']]);
  useBackend(memoryBackend(new Map([['junk', { name: 'junk', text: 'not a car' }]])));
  const cd = new CarDefine(new Array(56).fill(null), new Medium(), new Trackers(), null);
  cd.lastload = 0;
  const loaded = await loadIntoCarDefine(cd);
  assert.deepStrictEqual(loaded, []);
  assert.strictEqual(cd.nlcars, 16);
  assert.strictEqual(cd.lastload, 0);
});
