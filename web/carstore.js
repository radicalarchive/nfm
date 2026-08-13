// Browser-side `mycars/` — the writable half of the VFS.
//
// vfs.js is read-only by design (see its header): the race-only spike never
// persisted anything. The car editor changes that. A car the editor saves has
// to be raceable, and in a browser there is no directory to save it into and
// no `File.list()` to enumerate it with -- which is exactly what
// CarDefine.loadcarmaker() does in the Java (CarDefine.java:1579).
//
// So: IndexedDB holds `name -> .rad text`, this module supplies the listing
// loadcarmaker() cannot get from the filesystem, and the four cars shipped in
// mycars/ stay readable as before. A stored car with the same name shadows a
// shipped one, which is what makes "edit a shipped car" work without ever
// writing to the asset tree.
//
// The value stored is the .rad text verbatim, so a car moves between the
// browser and the desktop game by copy-paste with no conversion.

import { readText, readZip, entryText } from './vfs.js';
import { CAR_NAMES } from './GameSparker.js';

const DB_NAME = 'nfm';
const DB_VERSION = 1;
const STORE = 'mycars';

/**
 * The cars committed under mycars/. A static list because HTTP has no
 * directory listing: the launcher and the editor both need the names before
 * they can fetch anything, and probing candidate names is worse than keeping
 * this in sync with the directory.
 *
 * It listed four until 2026-08-12, and three of those were wrong. `mycars/` is
 * a RUNTIME directory -- .gitignore keeps only two files out of it -- so
 * `badstat_car` and `custom_formula7` exist on a machine that has run the
 * desktop game and 404 in a clean checkout, which is what made the editor boot
 * on an empty car. `Example, MAX Revenge.rad` is still committed, but only as
 * a fixture two tests read off disk (`careditor/rad.test.js`,
 * `careditor/tab2.test.js`); nothing offers it to a player any more.
 */
export const SHIPPED = [
  'Simple Car',
];

/**
 * The sixteen cars the game itself races, by the name the Car Maker shows.
 *
 * Their .rad files are inside data/models.zip -- they are base models, not
 * files under mycars/ -- so they are readable but not writable, and they are
 * deliberately NOT part of listAll(): that listing is the one loadcarmaker()
 * assigns custom-car slots from, and the base models already have slots 0..15.
 * The editor merges them into its own picker instead.
 *
 * The order is GameSparker's CAR_NAMES, which is loadbase()'s slot order, so
 * the two lists line up index for index -- that is the only thing tying a
 * display name to a zip entry, and it is why this is a zip and not a map
 * literal that could drift out of step.
 */
export const BUILTIN_NAMES = [
  'Tornado Shark', 'Formula 7', 'Wow Caninaro', 'La Vita Crab', 'Nimi',
  'MAX Revenge', 'Lead Oxide', 'Kool Kat', 'Drifter X', 'Sword of Justice',
  'High Rider', 'EL KING', 'Mighty Eight', 'M A S H E E N', 'Radical One',
  'DR Monstaa',
];

export const BUILTIN = Object.fromEntries(
  BUILTIN_NAMES.map((name, i) => [name, CAR_NAMES[i]]),
);

let modelsZip = null;

/** The .rad text of a base model, straight out of data/models.zip. */
export async function readBuiltin(name) {
  const entry = BUILTIN[name];
  if (!entry) return null;
  if (!modelsZip) modelsZip = readZip('data/models.zip');
  const bytes = (await modelsZip).get(`${entry}.rad`);
  return bytes ? entryText(bytes) : null;
}

let dbPromise = null;

/** Open (and on first use create) the database. One store, keyed by car name. */
function open() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'name' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

/** Run one transaction and resolve with the request's result. */
async function tx(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.onabort = t.onerror = () => reject(t.error);
    if (req) {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } else {
      t.oncomplete = () => resolve(undefined);
    }
  });
}

/**
 * The persistence seam. IndexedDB by default; `useBackend` swaps in a plain
 * Map for `node --test`, which has no IndexedDB — the listing, shadowing and
 * slot-assignment logic below is the part worth testing, and it should not
 * need a browser to test it.
 */
let backend = {
  keys: () => tx('readonly', (s) => s.getAllKeys()),
  get: (name) => tx('readonly', (s) => s.get(name)),
  put: (rec) => tx('readwrite', (s) => s.put(rec)),
  del: (name) => tx('readwrite', (s) => s.delete(name)),
};

export function useBackend(b) {
  backend = b;
}

/** A Map-backed backend, for tests. */
export function memoryBackend(map = new Map()) {
  return {
    keys: async () => [...map.keys()],
    get: async (name) => map.get(name),
    put: async (rec) => { map.set(rec.name, rec); },
    del: async (name) => { map.delete(name); },
  };
}

/** Names of cars saved in this browser, sorted the way a directory listing is. */
export async function listStored() {
  const keys = await backend.keys();
  return keys.sort((a, b) => a.localeCompare(b));
}

/**
 * Every car available to the game: shipped plus stored, stored shadowing
 * shipped. This is the listing loadcarmaker() walks; the order it returns is
 * the order the custom cars get slots 16.. in, so it must be stable across
 * reloads or the same car changes slot between sessions.
 */
export async function listAll() {
  const stored = await listStored();
  const names = new Set(stored);
  const merged = [...stored];
  for (const name of SHIPPED) {
    if (!names.has(name)) merged.push(name);
  }
  return merged.sort((a, b) => a.localeCompare(b));
}

/**
 * The .rad text for a car, stored first then shipped. Returns null when the
 * name is unknown -- loadcar() already treats an unreadable car as "skip this
 * slot", so a missing file is not exceptional here.
 */
export async function readCar(name) {
  const rec = await backend.get(name);
  if (rec) return rec.text;
  if (BUILTIN[name]) return readBuiltin(name);
  if (!SHIPPED.includes(name)) return null;
  try {
    return await readText(`mycars/${name}.rad`);
  } catch {
    return null;
  }
}

/** Save (or overwrite) a car. `text` is the .rad file verbatim. */
export async function writeCar(name, text) {
  if (!name) throw new Error('carstore: a car needs a name');
  await backend.put({ name, text, updated: Date.now() });
}

/**
 * Delete a stored car. A shipped car cannot be deleted -- deleting the stored
 * copy just un-shadows the original, which is the useful behaviour: it is how
 * you revert an edit to a shipped car.
 */
export async function deleteCar(name) {
  await backend.del(name);
}

/** Rename, keeping the text. Fails rather than clobbering an existing name. */
export async function renameCar(from, to) {
  if (!to) throw new Error('carstore: a car needs a name');
  const text = await readCar(from);
  if (text === null) throw new Error(`carstore: no such car: ${from}`);
  const existing = await backend.get(to);
  if (existing) throw new Error(`carstore: ${to} already exists`);
  await writeCar(to, text);
  await deleteCar(from);
}

/**
 * Load every available car into CarDefine slots 16.., the way
 * CarDefine.loadcarmaker() does off the filesystem.
 *
 * The Java caps at 56 slots and only counts a car when loadcar() returns the
 * slot it was given -- a malformed or too-small car leaves nlcars untouched
 * and the slot is reused. Both behaviours are preserved; see
 * java-src/CarDefine.java:1579-1586.
 *
 * Returns the names actually loaded, in slot order, so a caller can show the
 * player which car is in which slot.
 */
export async function loadIntoCarDefine(cd, { menu = true } = {}) {
  if (menu) {
    cd.loadcarmaker();
  } else {
    // In a race the stage owns the sky and fog colours, and include[] says
    // which base models the stage loaded. loadcarmaker() resets all three for
    // the car-maker's own backdrop, so racing a custom car must not call it —
    // only the slot counter it sets matters here.
    cd.nlcars = 16;
  }
  const loaded = [];
  for (const name of await listAll()) {
    if (cd.nlcars >= 56) break;
    const text = await readCar(name);
    if (text === null) continue;
    if (cd.loadcar(name, cd.nlcars, text) === cd.nlcars) {
      loaded.push(name);
      ++cd.nlcars;
    }
  }
  if (cd.nlcars > 16) cd.lastload = 1;
  return loaded;
}
