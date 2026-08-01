// Virtual filesystem.
//
// Madness.fpath is a single static string prefixing all ~117 file accesses in
// the Java, so one base URL covers the whole game's reads. Everything is
// fetched from the repo root, exactly as the desktop game and the CheerpJ
// build read it — data/ stays byte-identical and unmodified.
//
// Writes (data/user.data, mycars/, mystages/) are not implemented; the
// race-only spike does not persist anything.

/** Equivalent of Madness.fpath. */
export let fpath = '../';

export function setFpath(p) {
  fpath = p;
}

const textCache = new Map();
const bytesCache = new Map();

/** Fetch a file as bytes. Throws on a missing file rather than failing silently. */
export async function readBytes(path) {
  if (bytesCache.has(path)) return bytesCache.get(path);
  const res = await fetch(fpath + path);
  if (!res.ok) throw new Error(`VFS: ${path} -> HTTP ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  bytesCache.set(path, buf);
  return buf;
}

/** Fetch a file as text. */
export async function readText(path) {
  if (textCache.has(path)) return textCache.get(path);
  const res = await fetch(fpath + path);
  if (!res.ok) throw new Error(`VFS: ${path} -> HTTP ${res.status}`);
  const txt = await res.text();
  textCache.set(path, txt);
  return txt;
}

/**
 * Split text into lines the way DataInputStream.readLine() does: on \n, \r, or
 * \r\n, with no trailing empty line for a file ending in a newline.
 *
 * The stage parser depends on this — it does `line.trim()` then `startsWith`,
 * so a spurious final empty line is harmless, but a wrong split is not.
 */
export function readLines(text) {
  const lines = text.split(/\r\n|\n|\r/);
  if (lines.length && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

// --- ZIP ---------------------------------------------------------------------
//
// All three game zips are Defl:N (method 8, deflate), so DecompressionStream
// handles them with no library. Entries are located via the End of Central
// Directory record rather than by scanning local headers, because local
// headers may carry zero sizes with a trailing data descriptor.

const EOCD_SIG = 0x06054b50;
const CD_SIG = 0x02014b50;

/**
 * Read a zip into a Map of name -> Uint8Array.
 * Preserves central-directory order in the Map, which is the order
 * ZipInputStream would have yielded — loadbase() maps entries to slots by
 * filename, so order does not actually matter, but matching it costs nothing.
 */
export async function readZip(path) {
  return parseZip(await readBytes(path));
}

/** The zip decoder proper, split out so it is testable outside a browser. */
export async function parseZip(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);

  // Locate the EOCD: scan backwards over the maximum comment length.
  let eocd = -1;
  const minEocd = Math.max(0, buf.length - 22 - 0xffff);
  for (let i = buf.length - 22; i >= minEocd; i--) {
    if (dv.getUint32(i, true) === EOCD_SIG) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error(`VFS: not a zip (no EOCD)`);

  const count = dv.getUint16(eocd + 10, true);
  let p = dv.getUint32(eocd + 16, true);   // central directory offset

  const out = new Map();
  const jobs = [];
  for (let i = 0; i < count; i++) {
    if (dv.getUint32(p, true) !== CD_SIG) {
      throw new Error(`VFS: bad central directory at entry ${i}`);
    }
    const method = dv.getUint16(p + 10, true);
    const compSize = dv.getUint32(p + 20, true);
    const nameLen = dv.getUint16(p + 28, true);
    const extraLen = dv.getUint16(p + 30, true);
    const commentLen = dv.getUint16(p + 32, true);
    const localOff = dv.getUint32(p + 42, true);
    const name = new TextDecoder().decode(buf.subarray(p + 46, p + 46 + nameLen));
    p += 46 + nameLen + extraLen + commentLen;

    // The local header's own name/extra lengths give the true data offset;
    // the central directory's extra field length often differs from it.
    const lNameLen = dv.getUint16(localOff + 26, true);
    const lExtraLen = dv.getUint16(localOff + 28, true);
    const dataOff = localOff + 30 + lNameLen + lExtraLen;
    const raw = buf.subarray(dataOff, dataOff + compSize);

    if (method === 0) {
      out.set(name, raw);
    } else if (method === 8) {
      out.set(name, null);                       // reserve slot, keep order
      jobs.push(inflate(raw).then((b) => out.set(name, b)));
    } else {
      throw new Error(`VFS: ${name} unsupported compression method ${method}`);
    }
  }
  await Promise.all(jobs);
  return out;
}

async function inflate(raw) {
  const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Decode a zip entry as text, for the .rad model files. */
export function entryText(bytes) {
  return new TextDecoder('iso-8859-1').decode(bytes);
}
