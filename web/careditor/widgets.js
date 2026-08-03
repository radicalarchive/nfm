// The AWT text widgets the car editor is built on, over DOM.
//
// CarMaker's code pane is a `java.awt.TextArea` and its 19 numeric inputs are
// `java.awt.TextField`s. Unlike the rest of the game these are NOT drawn by
// the renderer -- AWT draws them, and the editor reads them back
// (`editor.getText()` appears 57 times) and drives their selection. So they
// are the one part of the port that has to become real DOM rather than
// polygons, and this module is that seam.
//
// The surface is exactly what CarMaker calls, no more: getText, setText,
// insertText, replaceText, select, getSelectionStart/End, getSelectedText,
// requestFocus, show/hide/isShowing, enable/disable, setFont,
// setForeground/setBackground. `insertText` and `replaceText` are AWT's old
// names and their semantics, not the DOM's.
//
// Every method works with no `document` at all, backed by a plain string, so
// the transpiled chunks are testable under `node --test`. That is why the
// element is created lazily.

/** Java's Color-ish tuple to a CSS colour. Accepts [r,g,b] or three numbers. */
function css(c) {
  const [r, g, b] = Array.isArray(c) ? c : arguments;
  return `rgb(${r},${g},${b})`;
}

class TextWidget {
  /** @param tag 'textarea' or 'input' */
  constructor(tag) {
    this.tag = tag;
    this.el = null;          // created by attach(); null means headless
    this._text = '';
    this._start = 0;
    this._end = 0;
    this._showing = true;
    this._enabled = true;
    this.bounds = { x: 0, y: 0, w: 0, h: 0 };
  }

  /** Put this widget into the page. Until then it is a string in memory. */
  attach(parent) {
    if (this.el) return this.el;
    const el = document.createElement(this.tag);
    if (this.tag === 'input') el.type = 'text';
    el.value = this._text;
    el.className = 'awt-' + this.tag;
    el.style.display = this._showing ? '' : 'none';
    el.disabled = !this._enabled;
    parent.appendChild(el);
    this.el = el;
    return el;
  }

  getText() {
    return this.el ? this.el.value : this._text;
  }

  setText(s) {
    s = s ?? '';
    if (this.el) this.el.value = s;
    else this._text = s;
  }

  /** AWT: insert `str` at character position `pos`. */
  insertText(str, pos) {
    const t = this.getText();
    this.setText(t.slice(0, pos) + str + t.slice(pos));
  }

  /** AWT: replace the characters in [start, end) with `str`. */
  replaceText(str, start, end) {
    const t = this.getText();
    this.setText(t.slice(0, start) + str + t.slice(end));
  }

  select(start, end) {
    this._start = start;
    this._end = end;
    if (this.el) this.el.setSelectionRange(start, end);
  }

  getSelectionStart() {
    return this.el ? this.el.selectionStart : this._start;
  }

  getSelectionEnd() {
    return this.el ? this.el.selectionEnd : this._end;
  }

  getSelectedText() {
    return this.getText().substring(this.getSelectionStart(), this.getSelectionEnd());
  }

  requestFocus() {
    if (this.el) this.el.focus();
  }

  // AWT's Component methods. The editor calls hide()/show() to swap panes and
  // isShowing() to decide whether a keystroke belongs to the code pane, so
  // these are load-bearing, not decoration.
  show() { this._showing = true; if (this.el) this.el.style.display = ''; }
  hide() { this._showing = false; if (this.el) this.el.style.display = 'none'; }
  isShowing() { return this._showing; }
  enable() { this._enabled = true; if (this.el) this.el.disabled = false; }
  disable() { this._enabled = false; if (this.el) this.el.disabled = true; }

  /** `new Font(name, style, size)`: style 1 is bold, as in java.awt.Font. */
  setFont(font) {
    this.font = font;
    if (this.el) {
      this.el.style.font =
        `${font.style === 1 ? 'bold ' : ''}${font.size}px "${font.name}", monospace`;
    }
  }

  setForeground(...c) { this.fg = css(...c); if (this.el) this.el.style.color = this.fg; }
  setBackground(...c) { this.bg = css(...c); if (this.el) this.el.style.background = this.bg; }

  /** The editor installs a mouse listener to close its popup. */
  addMouseListener(fn) {
    this.mouseListener = fn;
    if (this.el) this.el.addEventListener('mousedown', fn);
  }

  // movefield() compares the current bounds before setting them, so these
  // four have to answer even before the widget is in the page.
  getX() { return this.bounds.x; }
  getY() { return this.bounds.y; }
  getWidth() { return this.bounds.w; }
  getHeight() { return this.bounds.h; }
  hasFocus() { return !!this.el && document.activeElement === this.el; }

  /** Place the widget the way CarMaker.movefield() does, in game pixels. */
  setBounds(x, y, w, h) {
    this.bounds = { x, y, w, h };
    if (this.el) {
      Object.assign(this.el.style, {
        position: 'absolute', left: `${x}px`, top: `${y}px`,
        width: `${w}px`, height: `${h}px`,
      });
    }
  }
}

export class TextArea extends TextWidget {
  constructor() { super('textarea'); }
}

export class TextField extends TextWidget {
  constructor(text = '') { super('input'); this._text = text; }
}
