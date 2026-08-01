// HUD image assets: decode from images.zip and apply the game's recolour.
//
// xtGraphics keeps two copies of each HUD graphic: an `o`-prefixed original
// decoded straight from the zip (`odmg`, `orank[]`, ...) and a processed one
// used for drawing (`dmg`, `rank[]`, ...). The processing step is
// `loadsnap()`, which does two different things per pixel:
//
//   - COLOURED pixels (r != g && g != b) are tinted by Medium.snap[], the
//     same per-stage palette shift that biases the sky and track colours, and
//     forced opaque.
//   - GREY pixels (r == g || g == b) become BLACK with an alpha taken from
//     how far they sit below a reference white. This is how the original gets
//     antialiased edges out of a GIF with no alpha channel: the grey ramp
//     around each glyph is reinterpreted as coverage.
//
// The reference white is the BOTTOM-RIGHT pixel (`array[w*h-1]`), which in
// every one of these assets is the background. Read it from the source data,
// not from a constant -- a couple of the gifs are off-white.
//
// Java did this with PixelGrabber + BufferedImage.setRGB. Here it is
// getImageData/putImageData on an OffscreenCanvas, which produces a canvas
// that ctx.drawImage accepts directly.

/** Zip entry name -> field on XtGraphics. Single images. */
const SINGLE = {
  'damage.gif': 'odmg',
  'power.gif': 'opwr',
  'position.gif': 'opos',
  'speed.gif': 'osped',
  'wasted.gif': 'owas',
  'lap.gif': 'olap',
  'wgame.gif': 'owgame',
};

/** Zip entry name -> [field, index]. Indexed images. */
const INDEXED = {
  '1.gif': ['orank', 0], '2.gif': ['orank', 1], '3.gif': ['orank', 2],
  '4.gif': ['orank', 3], '5.gif': ['orank', 4], '6.gif': ['orank', 5],
  '7.gif': ['orank', 6], '8.gif': ['orank', 7],
  '0c.gif': ['ocntdn', 0], '1c.gif': ['ocntdn', 1],
  '2c.gif': ['ocntdn', 2], '3c.gif': ['ocntdn', 3],
};

/** MIME type for createImageBitmap's Blob. Only two formats appear here. */
function mimeOf(name) {
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.jpg')) return 'image/jpeg';
  return 'image/gif';
}

/** Decode one zip entry to an ImageBitmap. */
async function decode(bytes, name) {
  const blob = new Blob([bytes], { type: mimeOf(name) });
  return createImageBitmap(blob);
}

/** Draw a decoded bitmap into a canvas and hand back its pixels. */
function pixelsOf(bitmap) {
  const w = bitmap.width, h = bitmap.height;
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0);
  return { canvas, ctx, data: ctx.getImageData(0, 0, w, h), w, h };
}

/**
 * xtGraphics.loadsnap() — recolour + alpha-key one HUD image.
 *
 * @param {ImageBitmap} bitmap decoded original
 * @param {Int32Array}  snap   Medium.snap, three percentages (may be all 0)
 * @returns {OffscreenCanvas}  drawable, with alpha
 */
export function loadsnap(bitmap, snap) {
  const { canvas, ctx, data, w, h } = pixelsOf(bitmap);
  const px = data.data;

  // Reference background: bottom-right pixel, as the Java reads
  // array[width * height - 1] on every iteration of the loop.
  //
  // These assets are NOT uniform. 5.gif and position.gif have an opaque
  // 192-grey background; 8.gif (and the other later re-draws) use GIF index
  // transparency instead. Java didn't notice the difference: PixelGrabber
  // hands back the palette RGB even for the transparent index, so its
  // reference was 192 either way. Canvas zeroes the colour under transparent
  // pixels, so reading the corner directly gives 0 there -- which makes the
  // coverage term (0 - r)/0 collapse and erases every grey pixel in the
  // image. That is what dropped the "TH" off the rank badge while leaving the
  // blue numeral, which takes the coloured branch.
  //
  // So: when the corner is transparent, fall back to the 192 that the rest of
  // the family uses, and honour the source alpha directly.
  const cornerOpaque = px[(w * h - 1) * 4 + 3] !== 0;
  const refR = cornerOpaque ? px[(w * h - 1) * 4] : 192;

  for (let i = 0; i < w * h; i++) {
    const o = i * 4;
    const r = px[o], g = px[o + 1], b = px[o + 2];
    if (px[o + 3] === 0) {
      continue;                       // already transparent; leave it be
    }
    if (r !== g && g !== b) {
      // Coloured: tint and force opaque. Truncation matches the Java cast.
      px[o]     = clamp255(r + r * (snap[0] / 100.0));
      px[o + 1] = clamp255(g + g * (snap[1] / 100.0));
      px[o + 2] = clamp255(b + b * (snap[2] / 100.0));
      px[o + 3] = 255;
    } else {
      // Grey: black, with coverage from the distance below the reference.
      const a = clamp255(((refR - r) / refR) * 255.0);
      px[o] = 0; px[o + 1] = 0; px[o + 2] = 0; px[o + 3] = a;
    }
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

function clamp255(v) {
  const n = Math.trunc(v);
  return n > 255 ? 255 : (n < 0 ? 0 : n);
}

/**
 * Decode every HUD asset from images.zip and install it on `xt`, both the
 * `o`-prefixed originals and the recoloured drawables.
 *
 * Missing entries are skipped rather than thrown on: the null guards at the
 * draw sites stay meaningful, so an incomplete zip degrades to the
 * vector-only HUD instead of taking the whole race down.
 */
export async function loadHudImages(xt, zip, medium) {
  const snap = medium.snap;
  const jobs = [];

  for (const [entry, field] of Object.entries(SINGLE)) {
    const bytes = zip.get(entry);
    if (!bytes) continue;
    jobs.push(decode(bytes, entry).then((bm) => {
      xt[field] = bm;
      xt[field.slice(1)] = loadsnap(bm, snap);   // odmg -> dmg
    }));
  }

  for (const [entry, [field, idx]] of Object.entries(INDEXED)) {
    const bytes = zip.get(entry);
    if (!bytes) continue;
    jobs.push(decode(bytes, entry).then((bm) => {
      if (!xt[field]) xt[field] = [];
      xt[field][idx] = bm;
      const target = field.slice(1);             // orank -> rank
      if (!xt[target]) xt[target] = [];
      xt[target][idx] = loadsnap(bm, snap);
    }));
  }

  await Promise.all(jobs);
  return jobs.length;
}
