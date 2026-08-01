// WebGL reimplementation of the java.awt.Graphics2D surface the renderer uses.
//
// ============================================================================
// THE ORDERING CONSTRAINT — read before changing anything in this file.
// ============================================================================
// This renderer has NO DEPTH BUFFER. Occlusion comes entirely from submission
// order (the painter's algorithm). GameSparker's race tick explicitly depth-
// sorts objects by `dist` and then calls d() on them in that order; Plane.d()
// does the same for faces within an object.
//
// Therefore: colour is a VERTEX ATTRIBUTE, every primitive lands in ONE buffer
// in original submission order, and the whole frame is ONE draw call with
// depth testing off.
//
// Do NOT batch by material, texture, or primitive type. Do NOT sort. Do NOT
// split lines and fills into separate passes. Any of those silently scrambles
// depth and draws cars through walls — it will still look plausible in a
// screenshot, which is what makes it dangerous.
//
// This is why outlines (drawPolygon/drawLine) are expanded into triangles here
// rather than issued as GL_LINES: a second primitive type would need a second
// draw call, and that would reorder them relative to the fills.
// ============================================================================

const VERT_SRC = `#version 300 es
in vec2 a_pos;
in vec4 a_color;
uniform vec2 u_size;
out vec4 v_color;
void main() {
  // Game space is 800x450 with y down and origin top-left.
  vec2 clip = vec2(a_pos.x / u_size.x * 2.0 - 1.0,
                   1.0 - a_pos.y / u_size.y * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
  v_color = a_color;
}`;

const FRAG_SRC = `#version 300 es
precision mediump float;
in vec4 v_color;
out vec4 fragColor;
void main() { fragColor = v_color; }`;

// Vertex layout: x, y as float32, then RGBA as four normalized bytes packed
// into one uint32 — 12 bytes, down from 24 when colour was four floats.
// Measured at ~100k verts/frame, so this halves both the per-vertex store
// count and the bytes uploaded each frame.
const WORDS_PER_VERT = 3;           // 32-bit words: x, y, rgba
const BYTES_PER_VERT = WORDS_PER_VERT * 4;
const INITIAL_VERTS = 1 << 16;

export class Graphics2D {
  /**
   * @param {HTMLCanvasElement} glCanvas   WebGL2 canvas for geometry
   * @param {HTMLCanvasElement} textCanvas 2D overlay for drawString/drawImage
   * @param {number} width   game-space width  (800)
   * @param {number} height  game-space height (450)
   */
  constructor(glCanvas, textCanvas, width = 800, height = 450, opts = {}) {
    this.width = width;
    this.height = height;

    // One buffer, two views over the same bytes: positions go through the
    // float view, the packed colour through the uint view.
    this._alloc(INITIAL_VERTS);
    this.count = 0;               // vertices written this frame
    this.inputVerts = 0;          // polygon vertices SUBMITTED this frame --
                                  // counted even when emitting is stubbed out,
                                  // so diagnostic runs stay comparable
    // Scene-shape counters, incremented by ContO.d and Plane.d. Draw cost does
    // NOT track vertex count across sessions, so these exist to say whether it
    // tracks objects or faces instead -- which decides whether a vertex shader
    // is the right fix or an irrelevant one.
    this.objCalls = 0;            // ContO.d entered
    this.objDrawn = 0;            // ...and passed the visibility test
    this.faceCalls = 0;           // Plane.d entered
    this.projVerts = 0;           // vertices PROJECTED (sum of Plane.n), which
                                  // is the work a vertex shader would take on.
                                  // Much larger than inputVerts: a face pays to
                                  // project 12-20 vertices before culling can
                                  // decide whether to submit any of them.

    // Current graphics state, mirroring Graphics2D's mutable state.
    // r/g/b/a stay 0..1 floats because drawString and clearRect read them;
    // `rgba` is the same colour pre-packed for the vertex buffer, recomputed
    // only when the colour changes rather than once per vertex.
    this.r = 0; this.g = 0; this.b = 0; this.a = 1;
    this.rgba = 0xff000000;
    // Concave/self-intersecting fill strategy. Trapezoids by default;
    // ?fill=scan restores the per-pixel-row scanline fill for comparison.
    this._fillConcave = opts.fill === 'scan' ? this._fillEvenOdd : this._fillTrapezoid;
    this.lineWidth = 1;
    this.font = '12px sans-serif';

    // DIAGNOSTIC STUBS. Every draw call is still *made*, so the caller keeps
    // paying for projection, culling and vertex math in Plane.d; only the
    // work behind the call disappears. What is left, timed, isolates a layer.
    //
    // Three separable costs hide inside "draw":
    //
    //   projection   Plane.d's per-vertex rot/xs/ys      -> a vertex shader
    //                                                       could take this
    //   geometry     triangulation + vertex buffer       -> stays on the CPU
    //   overlay      Canvas2D fillText / drawImage       -> unrelated to both
    //
    // `?raster=0` kills the last two together, which is how the first
    // measurement was taken -- and why its 11.5ms was unattributable. `geom`
    // and `overlay` separate them. Note that under node the overlay is
    // ALREADY a no-op via nullContext2D, so node and browser disagree about
    // what `raster=0` removes; that discrepancy is the reason this exists.
    //
    // The screen goes blank or loses its HUD in these modes. That is the
    // point; they are stopwatches, not rendering paths. Installed BEFORE the
    // headless early-return so the same split is measurable under node.
    // The geometry stubs still COUNT their input. Vertex count is the only
    // proxy for how heavy a scene was, and a run that reports zero cannot be
    // compared against a normal one -- which is exactly how the first attempt
    // at this measurement produced "removing work made drawing slower".
    const noop = () => {};
    const countPoly = (xs, ys, n) => { this.inputVerts += n; };
    const GEOMETRY = ['drawLine', 'fillRect', 'drawRect', 'fillOval'];
    const OVERLAY = ['drawString', 'drawImage'];
    if (opts.raster === false || opts.geometry === false) {
      for (const m of GEOMETRY) this[m] = noop;
      this.fillPolygon = countPoly;
      this.drawPolygon = countPoly;
    }
    if (opts.raster === false || opts.overlay === false) {
      for (const m of OVERLAY) this[m] = noop;
    }

    // Headless mode (glCanvas === null) builds vertex data with no GL context,
    // so the submission-order invariant can be unit-tested under node.
    if (glCanvas === null) {
      this.gl = null;
      this.text = nullContext2D();
      this.textCanvas = { width, height };
      return;
    }

    // MSAA on top of a supersampled backing store is paying twice for the same
    // edges: at res=2 the buffer is already 4x the pixels, and MSAA multiplies
    // that again in bandwidth. There is no depth buffer and every triangle is
    // drawn (painter's algorithm), so the scene is heavily overdrawn and this
    // is bandwidth, not geometry. Default: MSAA only at res=1.
    const gl = glCanvas.getContext('webgl2', {
      alpha: false,
      antialias: opts.antialias !== false,
      depth: false,               // there is no depth buffer, by design
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error('WebGL2 is required');
    this.gl = gl;

    this.program = linkProgram(gl, VERT_SRC, FRAG_SRC);
    this.uSize = gl.getUniformLocation(this.program, 'u_size');

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

    const aPos = gl.getAttribLocation(this.program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, BYTES_PER_VERT, 0);
    // normalized:true is what turns the four packed bytes back into the 0..1
    // floats the shader already expects, so VERT_SRC needs no change.
    const aColor = gl.getAttribLocation(this.program, 'a_color');
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 4, gl.UNSIGNED_BYTE, true, BYTES_PER_VERT, 8);
    gl.bindVertexArray(null);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.text = textCanvas.getContext('2d');
    this.textCanvas = textCanvas;
    // The overlay's backing store may be larger than game space (2x by
    // default). Scale its context so drawString/drawImage keep taking
    // 800x450 coordinates like the Java does.
    this.textScaleX = textCanvas.width / width;
    this.textScaleY = textCanvas.height / height;
  }

  // --- state ---------------------------------------------------------------

  /** setColor(new Color(r,g,b)). Accepts 0-255 ints, as the game passes. */
  setColor(r, g, b) {
    this.r = r / 255; this.g = g / 255; this.b = b / 255;
    this._pack();
  }

  /** setComposite(AlphaComposite.getInstance(rule, alpha)). */
  setComposite(alpha) {
    this.a = alpha;
    this._pack();
  }

  /**
   * Pack the current colour into one uint32 in GL byte order.
   *
   * The GPU reads the four bytes at ascending addresses as r,g,b,a, and
   * TypedArray writes are little-endian on every platform WebGL runs on, so
   * red must be the LOW byte. Getting this backwards swaps red and blue and
   * looks like a palette bug, not a packing bug.
   */
  _pack() {
    const r = clampByte(this.r * 255);
    const g = clampByte(this.g * 255);
    const b = clampByte(this.b * 255);
    const a = clampByte(this.a * 255);
    this.rgba = ((a << 24) | (b << 16) | (g << 8) | r) >>> 0;
  }

  /** Grow the vertex store, keeping the float and uint views in sync. */
  _alloc(verts) {
    const bytes = new ArrayBuffer(verts * BYTES_PER_VERT);
    const f32 = new Float32Array(bytes);
    const u32 = new Uint32Array(bytes);
    if (this.u32) u32.set(this.u32);
    this.bytes = bytes;
    this.f32 = f32;
    this.u32 = u32;
    this.capacity = verts;
  }

  /** setRenderingHint is a no-op: WebGL antialiasing is set at context creation. */
  setRenderingHint() {}

  setFont(spec) {
    this.font = spec;
    this.text.font = spec;
  }

  // --- geometry ------------------------------------------------------------

  _vert(x, y) {
    if (this.count >= this.capacity) this._alloc(this.capacity * 2);
    const i = this.count * WORDS_PER_VERT;
    this.f32[i] = x;
    this.f32[i + 1] = y;
    this.u32[i + 2] = this.rgba;
    this.count++;
  }

  _tri(x0, y0, x1, y1, x2, y2) {
    this._vert(x0, y0); this._vert(x1, y1); this._vert(x2, y2);
  }

  /**
   * fillPolygon(xs, ys, n), matching java.awt.Graphics2D.
   *
   * A triangle fan is only correct for CONVEX polygons. Most faces in this
   * game are convex quads, but the checkpoint / fixpoint models spell out
   * words as glyph outlines with 12-28 vertices, and those are concave -- a
   * fan on the letter "S" throws triangles outside the glyph, which reads
   * on screen as a stray polygon over every letter.
   *
   * So: fan when convex (the common, fast path), even-odd scanline fill when
   * not. Either way the triangles for one polygon are emitted contiguously and
   * in place, so submission order -- and therefore depth -- is unchanged.
   */
  fillPolygon(xs, ys, n) {
    this.inputVerts += n;
    if (n < 3) return;
    if (n === 3 || isConvex(xs, ys, n)) {
      for (let i = 1; i + 1 < n; i++) {
        this._tri(xs[0], ys[0], xs[i], ys[i], xs[i + 1], ys[i + 1]);
      }
      return;
    }
    this._fillConcave(xs, ys, n);
  }

  /**
   * Even-odd scanline fill, matching java.awt.Graphics2D.fillPolygon exactly.
   *
   * Ear clipping was the wrong tool here. The checkpoint glyphs are KEYHOLE
   * polygons: the outline walks out to a letter's counter along a bridge,
   * around the hole, and back down the same bridge. Ear clipping can only
   * reproduce that when the inner loop winds opposite to the outer -- true for
   * "R", false for "O", which is why one worked and the other stayed filled.
   * Even-odd is winding-agnostic and also survives self-intersecting outlines,
   * so it handles every glyph without special cases.
   *
   * Because it rasterizes on the same 800x450 integer grid Java does, it is
   * also frame-to-frame stable: no triangulation to flip between as vertices
   * snap to different pixels under camera motion.
   *
   * Vertically adjacent scanlines with identical spans are merged into one
   * quad, so a letter stroke costs a handful of triangles, not one per row.
   */
  /**
   * Even-odd fill of a concave or self-intersecting polygon, as TRAPEZOIDS.
   *
   * The scanline version below emits one quad per pixel ROW, so a polygon 20
   * rows tall costs 20 quads regardless of how simple it is. This version cuts
   * the polygon at every y where the set of crossing edges can change --
   * vertex ys, plus the ys of any proper edge-edge intersection -- and emits
   * one trapezoid per span per band. Cost becomes O(vertices), not O(height).
   *
   * Both are exact even-odd fills; this one is exact in continuous space
   * rather than snapped to pixel rows, so edges land marginally differently.
   *
   * Self-intersection is not hypothetical here: the backdrop hands us quads
   * ordered TL, TR, BL, BR -- bowties -- and java.awt fills those as an
   * hourglass. That is why intersection ys must be events: between two events
   * no two edges may cross, or the left-to-right pairing below is wrong.
   *
   * Submission order is preserved: every triangle for one polygon is emitted
   * contiguously, in place, exactly as the scanline path did.
   */
  _fillTrapezoid(xs, ys, n) {
    const H = this.height;
    let ymin = Infinity, ymax = -Infinity;
    for (let i = 0; i < n; i++) {
      if (ys[i] < ymin) ymin = ys[i];
      if (ys[i] > ymax) ymax = ys[i];
    }
    const top = ymin < 0 ? 0 : ymin;
    const bot = ymax > H ? H : ymax;
    if (bot - top <= 0) return;

    const ev = this._evBuf || (this._evBuf = []);
    ev.length = 0;
    ev.push(top, bot);
    for (let i = 0; i < n; i++) {
      const y = ys[i];
      if (y > top && y < bot) ev.push(y);
    }
    // Proper crossings. O(n^2), but n is 4..28 here and the alternative is a
    // wrong pairing inside the band that contains the crossing.
    for (let i = 0; i < n; i++) {
      const ax = xs[i], ay = ys[i];
      const bx = xs[(i + 1) % n], by = ys[(i + 1) % n];
      for (let j = i + 1; j < n; j++) {
        const cx = xs[j], cy = ys[j];
        const dx = xs[(j + 1) % n], dy = ys[(j + 1) % n];
        const den = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
        if (den === 0) continue;                 // parallel or degenerate
        const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / den;
        if (t <= 0 || t >= 1) continue;
        const u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / den;
        if (u <= 0 || u >= 1) continue;
        const y = ay + t * (by - ay);
        if (y > top && y < bot) ev.push(y);
      }
    }
    ev.sort(ASC);

    const span = this._spanBuf || (this._spanBuf = []);
    for (let e = 0; e + 1 < ev.length; e++) {
      const ya = ev[e], yb = ev[e + 1];
      if (yb - ya < 1e-9) continue;              // duplicate event
      const mid = (ya + yb) * 0.5;
      span.length = 0;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const y1 = ys[j], y2 = ys[i];
        // Half-open crossing test at the band midpoint. Every vertex y is an
        // event, so an edge crossing the midpoint spans the whole band.
        if ((y1 <= mid && y2 > mid) || (y2 <= mid && y1 > mid)) {
          const x1 = xs[j];
          const slope = (xs[i] - x1) / (y2 - y1);
          span.push([x1 + (ya - y1) * slope, x1 + (yb - y1) * slope]);
        }
      }
      if (span.length < 2) continue;
      // No edges cross inside the band, so ordering by the top x is the same
      // ordering as anywhere else in it; the bottom x breaks ties at a shared
      // vertex.
      span.sort(BY_X);
      for (let k = 0; k + 1 < span.length; k += 2) {
        const l = span[k], r = span[k + 1];
        this._tri(l[0], ya, r[0], ya, r[1], yb);
        this._tri(l[0], ya, r[1], yb, l[1], yb);
      }
    }
  }

  _fillEvenOdd(xs, ys, n) {
    let ymin = Infinity;
    let ymax = -Infinity;
    for (let i = 0; i < n; i++) {
      if (ys[i] < ymin) ymin = ys[i];
      if (ys[i] > ymax) ymax = ys[i];
    }
    // Clamp to the viewport: off-screen rows cannot contribute and this is
    // what bounds the work for a polygon with extreme coordinates.
    const y0 = Math.max(0, Math.ceil(ymin));
    const y1 = Math.min(this.height, Math.floor(ymax));
    if (y1 < y0) return;

    const xsAt = [];
    let prev = null;        // spans of the previous row
    let runTop = 0;

    const flush = (rowEnd) => {
      if (!prev) return;
      for (let k = 0; k + 1 < prev.length; k += 2) {
        this._tri(prev[k], runTop, prev[k + 1], runTop, prev[k + 1], rowEnd);
        this._tri(prev[k], runTop, prev[k + 1], rowEnd, prev[k], rowEnd);
      }
    };

    for (let y = y0; y <= y1; y++) {
      const yc = y + 0.5;
      xsAt.length = 0;
      for (let i = 0, j = n - 1; i < n; j = i++) {
        const ya = ys[j];
        const yb = ys[i];
        // Half-open rule: counts a crossing once, so vertices do not
        // double-count and spans stay consistent between rows.
        if ((ya <= yc && yb > yc) || (yb <= yc && ya > yc)) {
          xsAt.push(xs[j] + ((yc - ya) / (yb - ya)) * (xs[i] - xs[j]));
        }
      }
      if (xsAt.length < 2) {
        flush(y);
        prev = null;
        continue;
      }
      xsAt.sort((a, b) => a - b);

      let same = prev !== null && prev.length === xsAt.length;
      if (same) {
        for (let k = 0; k < xsAt.length; k++) {
          if (prev[k] !== xsAt[k]) { same = false; break; }
        }
      }
      if (!same) {
        flush(y);
        prev = xsAt.slice();
        runTop = y;
      }
    }
    flush(y1 + 1);
  }

  /** drawPolygon(xs, ys, n): closed 1px outline, expanded to quads. */
  drawPolygon(xs, ys, n) {
    this.inputVerts += n;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      this._segment(xs[i], ys[i], xs[j], ys[j]);
    }
  }

  drawLine(x0, y0, x1, y1) {
    this._segment(x0, y0, x1, y1);
  }

  /** Expand a line segment to a quad of `lineWidth`, so it stays in-order. */
  _segment(x0, y0, x1, y1) {
    let dx = x1 - x0, dy = y1 - y0;
    const len = Math.hypot(dx, dy);
    if (len < 1e-6) return;
    const h = this.lineWidth / 2;
    const nx = (-dy / len) * h, ny = (dx / len) * h;
    this._tri(x0 + nx, y0 + ny, x1 + nx, y1 + ny, x1 - nx, y1 - ny);
    this._tri(x0 + nx, y0 + ny, x1 - nx, y1 - ny, x0 - nx, y0 - ny);
  }

  fillRect(x, y, w, h) {
    this._tri(x, y, x + w, y, x + w, y + h);
    this._tri(x, y, x + w, y + h, x, y + h);
  }

  drawRect(x, y, w, h) {
    this._segment(x, y, x + w, y);
    this._segment(x + w, y, x + w, y + h);
    this._segment(x + w, y + h, x, y + h);
    this._segment(x, y + h, x, y);
  }

  fillOval(x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2, rx = w / 2, ry = h / 2;
    const steps = Math.max(8, Math.min(64, Math.ceil((rx + ry) * 0.7)));
    for (let i = 0; i < steps; i++) {
      const a0 = (i / steps) * Math.PI * 2;
      const a1 = ((i + 1) / steps) * Math.PI * 2;
      this._tri(cx, cy,
                cx + Math.cos(a0) * rx, cy + Math.sin(a0) * ry,
                cx + Math.cos(a1) * rx, cy + Math.sin(a1) * ry);
    }
  }

  clearRect(x, y, w, h) {
    const [r, g, b, a] = [this.r, this.g, this.b, this.a];
    this.r = this.g = this.b = 0; this.a = 1;
    this.fillRect(x, y, w, h);
    this.r = r; this.g = g; this.b = b; this.a = a;
  }

  // --- text / images (2D overlay) ------------------------------------------
  //
  // Deliberately NOT in WebGL. These always land on top of the geometry, which
  // is correct for the HUD; they are not part of the depth-ordered scene.

  drawString(s, x, y) {
    this.text.fillStyle = `rgba(${this.r * 255 | 0},${this.g * 255 | 0},${this.b * 255 | 0},${this.a})`;
    this.text.fillText(s, x, y);
  }

  drawImage(img, x, y, w, h) {
    if (w === undefined) this.text.drawImage(img, x, y);
    else this.text.drawImage(img, x, y, w, h);
  }

  getFontMetrics() {
    const ctx = this.text;
    ctx.font = this.font;
    return {
      stringWidth: (s) => ctx.measureText(s).width,
      getHeight: () => {
        const m = ctx.measureText('Mg');
        return (m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) || 12;
      },
    };
  }

  // --- frame ---------------------------------------------------------------

  /**
   * Start a frame: drop last frame's geometry and clear the overlay.
   *
   * The clearRect is a CPU-side cost proportional to the overlay's backing
   * store, paid every frame whether or not anything was drawn on it. Sizing
   * the overlay independently of the GL canvas (main.js `?textres=`) keeps it
   * off the res curve.
   */
  /**
   * @param {boolean} keepOverlay leave the 2D overlay alone.
   *
   * The HUD is drawn from simulate(), not draw(), so it lands on the overlay
   * once per TICK. An interpolated frame redraws only the geometry, and
   * clearing the overlay for it wiped the HUD -- which is why the whole HUD
   * vanished with ?interp=1. Interpolated redraws pass true; the overlay then
   * holds the last tick's HUD, which is exactly the rate it updates at.
   */
  begin(keepOverlay = false) {
    this.count = 0;
    this.inputVerts = 0;
    this.objCalls = 0;
    this.objDrawn = 0;
    this.faceCalls = 0;
    this.projVerts = 0;
    this.a = 1;
    this._pack();
    if (keepOverlay) return;
    // Clear in device space, then restore the game-space transform.
    this.text.setTransform(1, 0, 0, 1, 0, 0);
    this.text.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
    this.text.setTransform(this.textScaleX || 1, 0, 0, this.textScaleY || 1, 0, 0);
    this.text.font = this.font;
  }

  /** Upload and issue the single draw call for the whole frame. */
  end() {
    const gl = this.gl;
    if (!gl) return;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    if (this.count === 0) return;

    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER,
                  this.u32.subarray(0, this.count * WORDS_PER_VERT),
                  gl.STREAM_DRAW);
    gl.uniform2f(this.uSize, this.width, this.height);
    gl.drawArrays(gl.TRIANGLES, 0, this.count);
    gl.bindVertexArray(null);
  }

  /** Vertices submitted this frame — for the on-screen debug readout. */
  get vertexCount() {
    return this.count;
  }

  // --- introspection --------------------------------------------------------
  // Read access to the batch for tests and debugging. These exist so nothing
  // outside this file has to know the vertex layout; reaching into the typed
  // arrays directly is what made the format change break every test.

  /** [x, y] of vertex i, in game space. */
  vertexAt(i) {
    const o = i * WORDS_PER_VERT;
    return [this.f32[o], this.f32[o + 1]];
  }

  /** [r, g, b, a] of vertex i, as 0-255 ints. */
  colorAt(i) {
    const c = this.u32[i * WORDS_PER_VERT + 2];
    return [c & 255, (c >>> 8) & 255, (c >>> 16) & 255, (c >>> 24) & 255];
  }
}

const ASC = (a, b) => a - b;
const BY_X = (a, b) => (a[0] - b[0]) || (a[1] - b[1]);

/** Round-and-clamp a 0..255 channel. Colours arrive as ints, alpha as float. */
function clampByte(v) {
  const n = v + 0.5 | 0;
  return n < 0 ? 0 : (n > 255 ? 255 : n);
}

/** True if every turn has the same sign — i.e. the polygon is convex. */
function isConvex(xs, ys, n) {
  let sign = 0;
  for (let i = 0; i < n; i++) {
    const ax = xs[(i + 1) % n] - xs[i];
    const ay = ys[(i + 1) % n] - ys[i];
    const bx = xs[(i + 2) % n] - xs[(i + 1) % n];
    const by = ys[(i + 2) % n] - ys[(i + 1) % n];
    const cross = ax * by - ay * bx;
    if (cross === 0) continue;               // collinear, tells us nothing
    const s = cross > 0 ? 1 : -1;
    if (sign === 0) sign = s;
    else if (s !== sign) return false;
  }
  return true;
}

/** No-op 2D context for headless tests; text is not exercised there. */
function nullContext2D() {
  return {
    clearRect() {}, fillText() {}, drawImage() {}, setTransform() {}, font: '',
    measureText: () => ({ width: 0, actualBoundingBoxAscent: 0, actualBoundingBoxDescent: 0 }),
  };
}

function linkProgram(gl, vs, fs) {
  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error('shader: ' + gl.getShaderInfoLog(s));
    }
    return s;
  };
  const p = gl.createProgram();
  gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error('link: ' + gl.getProgramInfoLog(p));
  }
  return p;
}
