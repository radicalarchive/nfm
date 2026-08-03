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

import { readText } from './vfs.js';

const DB_NAME = 'nfm';
const DB_VERSION = 1;
const STORE = 'mycars';

/**
 * The cars committed under mycars/. A static list because HTTP has no
 * directory listing: the launcher and the editor both need the names before
 * they can fetch anything, and probing 40 candidate names is worse than
 * keeping four in sync. Unchanged since the game shipped.
 */
export const SHIPPED = [
  'badstat_car',
  'custom_formula7',
  'Example, MAX Revenge',
  'Simple Car',
];

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
export async function loadIntoCarDefine(cd) {
  cd.loadcarmaker();
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
