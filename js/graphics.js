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

const FLOATS_PER_VERT = 6;          // x, y, r, g, b, a
const INITIAL_VERTS = 1 << 16;

export class Graphics2D {
  /**
   * @param {HTMLCanvasElement} glCanvas   WebGL2 canvas for geometry
   * @param {HTMLCanvasElement} textCanvas 2D overlay for drawString/drawImage
   * @param {number} width   game-space width  (800)
   * @param {number} height  game-space height (450)
   */
  constructor(glCanvas, textCanvas, width = 800, height = 450) {
    this.width = width;
    this.height = height;

    this.verts = new Float32Array(INITIAL_VERTS * FLOATS_PER_VERT);
    this.count = 0;               // vertices written this frame

    // Current graphics state, mirroring Graphics2D's mutable state.
    this.r = 0; this.g = 0; this.b = 0; this.a = 1;
    this.lineWidth = 1;
    this.font = '12px sans-serif';

    // Headless mode (glCanvas === null) builds vertex data with no GL context,
    // so the submission-order invariant can be unit-tested under node.
    if (glCanvas === null) {
      this.gl = null;
      this.text = nullContext2D();
      this.textCanvas = { width, height };
      return;
    }

    const gl = glCanvas.getContext('webgl2', {
      alpha: false,
      antialias: true,
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

    const stride = FLOATS_PER_VERT * 4;
    const aPos = gl.getAttribLocation(this.program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, stride, 0);
    const aColor = gl.getAttribLocation(this.program, 'a_color');
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 4, gl.FLOAT, false, stride, 8);
    gl.bindVertexArray(null);

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.text = textCanvas.getContext('2d');
    this.textCanvas = textCanvas;
  }

  // --- state ---------------------------------------------------------------

  /** setColor(new Color(r,g,b)). Accepts 0-255 ints, as the game passes. */
  setColor(r, g, b) {
    this.r = r / 255; this.g = g / 255; this.b = b / 255;
  }

  /** setComposite(AlphaComposite.getInstance(rule, alpha)). */
  setComposite(alpha) {
    this.a = alpha;
  }

  /** setRenderingHint is a no-op: WebGL antialiasing is set at context creation. */
  setRenderingHint() {}

  setFont(spec) {
    this.font = spec;
    this.text.font = spec;
  }

  // --- geometry ------------------------------------------------------------

  _vert(x, y) {
    let i = this.count * FLOATS_PER_VERT;
    if (i + FLOATS_PER_VERT > this.verts.length) {
      const bigger = new Float32Array(this.verts.length * 2);
      bigger.set(this.verts);
      this.verts = bigger;
    }
    const v = this.verts;
    v[i] = x; v[i + 1] = y;
    v[i + 2] = this.r; v[i + 3] = this.g; v[i + 4] = this.b; v[i + 5] = this.a;
    this.count++;
  }

  _tri(x0, y0, x1, y1, x2, y2) {
    this._vert(x0, y0); this._vert(x1, y1); this._vert(x2, y2);
  }

  /**
   * fillPolygon(xs, ys, n) as a triangle fan.
   * The game's faces are convex quads and triangles, so a fan is exact.
   */
  fillPolygon(xs, ys, n) {
    for (let i = 1; i + 1 < n; i++) {
      this._tri(xs[0], ys[0], xs[i], ys[i], xs[i + 1], ys[i + 1]);
    }
  }

  /** drawPolygon(xs, ys, n): closed 1px outline, expanded to quads. */
  drawPolygon(xs, ys, n) {
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

  /** Start a frame: drop last frame's geometry and clear the overlay. */
  begin() {
    this.count = 0;
    this.a = 1;
    this.text.clearRect(0, 0, this.textCanvas.width, this.textCanvas.height);
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
                  this.verts.subarray(0, this.count * FLOATS_PER_VERT),
                  gl.STREAM_DRAW);
    gl.uniform2f(this.uSize, this.width, this.height);
    gl.drawArrays(gl.TRIANGLES, 0, this.count);
    gl.bindVertexArray(null);
  }

  /** Vertices submitted this frame — for the on-screen debug readout. */
  get vertexCount() {
    return this.count;
  }
}

/** No-op 2D context for headless tests; text is not exercised there. */
function nullContext2D() {
  return {
    clearRect() {}, fillText() {}, drawImage() {}, font: '',
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
