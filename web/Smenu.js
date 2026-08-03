// Transpiled from java-src/Smenu.java, line by line.
//
// Local names are kept as procyon emitted them. Do not rename or restructure.

import { idiv, trunc, fr, i32, intArray, objArray } from './java.js';

export class Color {
  constructor(r, g, b) {
    this.r = r | 0;
    this.g = g | 0;
    this.b = b | 0;
  }

  getRed() {
    return this.r;
  }

  getGreen() {
    return this.g;
  }

  getBlue() {
    return this.b;
  }
}

export class Font {
  constructor(name, style, size) {
    this.name = name;
    this.style = style;
    this.size = size;
  }
}

export class Smenu {
  constructor(n) {
    this.sel = 0;
    this.opts = objArray(n);
    this.sopts = objArray(n);
    this.no = 0;
    this.x = 0;
    this.y = 0;
    this.font = new Font("Arial", 1, 13);
    this.bcol = new Color(255, 255, 255);
    this.fcol = new Color(0, 0, 0);
    this.w = 0;
    this.h = 0;
    this.ftm = null;
    this.shown = false;
    this.open = false;
    this.dis = false;
    this.maxl = 0;
    this.rooms = false;
    this.iroom = null;
    this.kmoused = 0;
    this.alphad = false;
    this.revup = false;
    this.carsel = false;
    this.flksel = false;
    this.om = false;
    this.onsc = false;
    this.scro = 0;
    this.scra = 0;
  }

  add(graphics2D, str) {
    graphics2D.setFont(this.font);
    this.ftm = graphics2D.getFontMetrics();
    if ((!this.rooms || this.no === 0) && this.ftm.stringWidth(str) + 30 > this.w) {
      this.w = this.ftm.stringWidth(str) + 30;
    }
    if (this.rooms) {
      this.iroom = intArray(7);
      for (let i = 0; i < 7; ++i) {
        this.iroom[i] = 0;
      }
    }
    this.opts[this.no] = str;
    if (this.maxl !== 0) {
      let length;
      for (length = str.length; this.ftm.stringWidth(str.substring(0, length)) + 30 > this.maxl; --length) {}
      if (length !== str.length) {
        str = str.substring(0, length - 3);
        str += "...";
      }
    }
    this.sopts[this.no] = str;
    if (this.no < this.opts.length - 1) {
      ++this.no;
    }
  }

  addw(s, s2) {
    this.w = 300;
    this.opts[this.no] = s2;
    this.sopts[this.no] = s;
    if (this.no < this.opts.length - 1) {
      ++this.no;
    }
  }

  addstg(s) {
    if (this.ftm.stringWidth(s) + 30 > this.w) {
      this.w = this.ftm.stringWidth(s) + 30;
    }
    ++this.no;
    if (this.no > 701) {
      this.no = 701;
    }
    for (let i = this.no - 1; i > 1; --i) {
      this.opts[i] = this.opts[i - 1];
      this.sopts[i] = this.sopts[i - 1];
    }
    this.opts[1] = s;
    this.sopts[1] = s;
  }

  removeAll() {
    this.no = 0;
    this.w = 0;
    this.sel = 0;
  }

  select(sel) {
    if (typeof sel === 'number') {
      if (sel >= 0 && sel < this.no) {
        this.sel = sel;
      }
    } else {
      const anObject = sel;
      for (let i = 0; i < this.no; ++i) {
        if (this.opts[i] === anObject) {
          this.sel = i;
          break;
        }
      }
    }
  }

  getSelectedIndex() {
    return this.sel;
  }

  getSelectedItem() {
    return this.opts[this.sel];
  }

  getItem(n) {
    let s = "";
    if (n >= 0 && n < this.no) {
      s = this.opts[n];
    }
    return s;
  }

  getItemCount() {
    return this.no;
  }

  remove(anObject) {
    for (let i = 0; i < this.no; ++i) {
      if (this.opts[i] === anObject) {
        for (let j = i; j < this.no; ++j) {
          if (j !== this.no - 1) {
            this.opts[j] = this.opts[j + 1];
            this.sopts[j] = this.sopts[j + 1];
          }
        }
        --this.no;
        break;
      }
    }
  }

  setSize(w, h) {
    this.w = w;
    this.h = h;
  }

  getWidth() {
    return this.w;
  }

  setFont(font) {
    this.font = font;
  }

  setBackground(bcol) {
    this.bcol = bcol;
  }

  setForeground(fcol) {
    this.fcol = fcol;
  }

  getBackground() {
    return this.bcol;
  }

  getForeground() {
    return this.fcol;
  }

  hide() {
    this.shown = false;
    this.open = false;
  }

  // Java's `boolean show` field and its `show()` method can coexist; in JS the
  // field assignment would clobber the method, so the FIELD is renamed to
  // `shown` and the method keeps its name -- every caller in CarMaker and
  // xtGraphics calls `show()`, and only xtGraphics assigns the field
  // (xtGraphics.java:5240 etc), which the port writes as `.shown`.
  show() {
    this.shown = true;
  }

  isShowing() {
    return this.shown;
  }

  move(x, y) {
    this.x = x;
    this.y = y;
  }

  hasFocus() {
    return false;
  }

  disable() {
    this.dis = true;
  }

  enable() {
    this.dis = false;
  }

  isEnabled() {
    return !this.dis;
  }

  draw(graphics2D, n, n2, b, n3, b2) {
    let b3 = false;
    if (this.revup) {
      if (b2) {
        b2 = false;
      } else {
        b2 = true;
      }
      this.revup = false;
    }
    if (this.shown) {
      if (this.alphad) {
        graphics2D.setComposite(0.7);
      }
      let n4 = 0;
      if (b) {
        if (!this.om) {
          this.om = true;
          n4 = 1;
        }
      } else if (this.om) {
        this.om = false;
      }
      let b4 = false;
      if (idiv(this.bcol.getRed() + this.bcol.getGreen() + this.bcol.getBlue(), 3) > idiv(this.fcol.getRed() + this.fcol.getGreen() + this.fcol.getBlue(), 3)) {
        b4 = true;
      }
      let b5 = false;
      if (n > this.x && n < this.x + this.w && n2 > this.y + 1 && n2 < this.y + 22 && !this.open && !this.dis) {
        b5 = true;
      }
      if (!this.open && b5 && n4 !== 0 && !this.dis) {
        this.open = true;
        n4 = 0;
      }
      graphics2D.setFont(this.font);
      this.ftm = graphics2D.getFontMetrics();
      if (this.open) {
        const n5 = 4 + (this.ftm.getHeight() + 2) * this.no;
        if (!b2) {
          let n6 = 0;
          graphics2D.setColor(this.bcol.getRed(), this.bcol.getGreen(), this.bcol.getBlue());
          graphics2D.fillRect(this.x, this.y + 23, this.w, n5);
          graphics2D.setColor(idiv(this.fcol.getRed() + this.bcol.getRed(), 2), idiv(this.fcol.getGreen() + this.bcol.getGreen(), 2), idiv(this.fcol.getBlue() + this.bcol.getBlue(), 2));
          graphics2D.drawRect(this.x, this.y + 23, this.w, n5);
          if (this.y + 23 + n5 > n3) {
            graphics2D.drawLine(this.x + this.w - 18, this.y + 17, this.x + this.w - 18, n3);
            if (b4) {
              graphics2D.setColor(idiv(this.bcol.getRed() + 510, 3), idiv(this.bcol.getGreen() + 510, 3), idiv(this.bcol.getBlue() + 510, 3));
            } else {
              graphics2D.setColor(idiv(this.fcol.getRed() + 510, 3), idiv(this.fcol.getGreen() + 510, 3), idiv(this.fcol.getBlue() + 510, 3));
            }
            graphics2D.fillRect(this.x + this.w - 15, this.y + 25 + this.scra, 13, 30);
            graphics2D.setColor(this.fcol.getRed(), this.fcol.getGreen(), this.fcol.getBlue());
            graphics2D.drawRect(this.x + this.w - 15, this.y + 25 + this.scra, 12, 30);
            graphics2D.setColor(0, 0, 0);
            graphics2D.drawLine(this.x + this.w - 12, this.y + 9 + 29 + this.scra, this.x + this.w - 12, this.y + 10 + 29 + this.scra);
            graphics2D.drawLine(this.x + this.w - 11, this.y + 10 + 29 + this.scra, this.x + this.w - 11, this.y + 11 + 29 + this.scra);
            graphics2D.drawLine(this.x + this.w - 10, this.y + 11 + 29 + this.scra, this.x + this.w - 10, this.y + 12 + 29 + this.scra);
            graphics2D.drawLine(this.x + this.w - 9, this.y + 12 + 29 + this.scra, this.x + this.w - 9, this.y + 13 + 29 + this.scra);
            graphics2D.drawLine(this.x + this.w - 8, this.y + 11 + 29 + this.scra, this.x + this.w - 8, this.y + 12 + 29 + this.scra);
            graphics2D.drawLine(this.x + this.w - 7, this.y + 10 + 29 + this.scra, this.x + this.w - 7, this.y + 11 + 29 + this.scra);
            graphics2D.drawLine(this.x + this.w - 6, this.y + 9 + 29 + this.scra, this.x + this.w - 6, this.y + 10 + 29 + this.scra);
            n6 = -18;
            if (b) {
              if (n > this.x + this.w - 18 && n < this.x + this.w && n2 > this.y + 25 && n2 < n3) {
                n4 = 0;
                this.onsc = true;
              }
            } else if (this.onsc) {
              this.onsc = false;
            }
            if (this.onsc) {
              this.scra = n2 - (this.y + 25) - 15;
              if (this.scra < 0) {
                this.scra = 0;
              }
              const scra = n3 - (this.y + 25) - 33;
              if (this.scra > scra) {
                this.scra = scra;
              }
              this.scro = i32(-trunc(fr(this.scra * fr((this.no * (this.ftm.getHeight() + 2) - scra - idiv(this.ftm.getHeight(), 2)) / scra))));
            }
          }
          for (let i = 0; i < this.no; ++i) {
            if (Math.abs(this.scro) < (i + 1) * (this.ftm.getHeight() + 2)) {
              graphics2D.setColor(this.fcol.getRed(), this.fcol.getGreen(), this.fcol.getBlue());
              if (n > this.x && n < this.x + this.w && n2 > this.y + 25 + this.scro + i * (this.ftm.getHeight() + 2) && n2 < this.y + 25 + this.scro + (i + 1) * (this.ftm.getHeight() + 2)) {
                if (b4) {
                  graphics2D.setColor(idiv(this.fcol.getRed() + this.bcol.getRed(), 2), idiv(this.fcol.getGreen() + this.bcol.getGreen(), 2), idiv(this.fcol.getBlue() + this.bcol.getBlue(), 2));
                } else {
                  graphics2D.setColor(this.fcol.getRed(), this.fcol.getGreen(), this.fcol.getBlue());
                }
                graphics2D.fillRect(this.x + 1, this.y + 25 + this.scro + i * (this.ftm.getHeight() + 2), this.w - 1 + n6, this.ftm.getHeight() + 2);
                graphics2D.setColor(this.bcol.getRed(), this.bcol.getGreen(), this.bcol.getBlue());
                if (n4 !== 0) {
                  if (!this.rooms || this.opts[i] !== "full") {
                    this.sel = i;
                    if (this.rooms && i !== 0) {
                      this.sopts[i] = " ";
                    }
                  } else {
                    this.kmoused = 20;
                  }
                  this.open = false;
                }
              }
              if (this.rooms && this.sopts[i] && this.sopts[i].indexOf("10 / 10") !== -1) {
                graphics2D.setColor(255, 0, 0);
              }
              graphics2D.drawString(this.sopts[i], this.x + 4, this.y + 38 + this.scro + i * (this.ftm.getHeight() + 2));
            }
          }
          if (n6 !== 0) {
            graphics2D.setColor(idiv(this.fcol.getRed() + this.bcol.getRed(), 2), idiv(this.fcol.getGreen() + this.bcol.getGreen(), 2), idiv(this.fcol.getBlue() + this.bcol.getBlue(), 2));
            graphics2D.drawLine(this.x, n3 - 1, this.x + this.w, n3 - 1);
          }
        } else {
          let n7 = 0;
          graphics2D.setColor(this.bcol.getRed(), this.bcol.getGreen(), this.bcol.getBlue());
          graphics2D.fillRect(this.x, this.y - n5, this.w, n5);
          graphics2D.setColor(idiv(this.fcol.getRed() + this.bcol.getRed(), 2), idiv(this.fcol.getGreen() + this.bcol.getGreen(), 2), idiv(this.fcol.getBlue() + this.bcol.getBlue(), 2));
          graphics2D.drawRect(this.x, this.y - n5, this.w, n5);
          if (this.y - n5 < 0) {
            graphics2D.drawLine(this.x + this.w - 18, 0, this.x + this.w - 18, this.y);
            if (b4) {
              graphics2D.setColor(idiv(this.bcol.getRed() + 510, 3), idiv(this.bcol.getGreen() + 510, 3), idiv(this.bcol.getBlue() + 510, 3));
            } else {
              graphics2D.setColor(idiv(this.fcol.getRed() + 510, 3), idiv(this.fcol.getGreen() + 510, 3), idiv(this.fcol.getBlue() + 510, 3));
            }
            graphics2D.fillRect(this.x + this.w - 15, this.y - this.scra - 33, 13, 30);
            graphics2D.setColor(this.fcol.getRed(), this.fcol.getGreen(), this.fcol.getBlue());
            graphics2D.drawRect(this.x + this.w - 15, this.y - this.scra - 33, 12, 30);
            graphics2D.setColor(0, 0, 0);
            graphics2D.drawLine(this.x + this.w - 12, this.y + 13 - 29 - this.scra, this.x + this.w - 12, this.y + 12 - 29 - this.scra);
            graphics2D.drawLine(this.x + this.w - 11, this.y + 12 - 29 - this.scra, this.x + this.w - 11, this.y + 11 - 29 - this.scra);
            graphics2D.drawLine(this.x + this.w - 10, this.y + 11 - 29 - this.scra, this.x + this.w - 10, this.y + 10 - 29 - this.scra);
            graphics2D.drawLine(this.x + this.w - 9, this.y + 10 - 29 - this.scra, this.x + this.w - 9, this.y + 9 - 29 - this.scra);
            graphics2D.drawLine(this.x + this.w - 8, this.y + 11 - 29 - this.scra, this.x + this.w - 8, this.y + 10 - 29 - this.scra);
            graphics2D.drawLine(this.x + this.w - 7, this.y + 12 - 29 - this.scra, this.x + this.w - 7, this.y + 11 - 29 - this.scra);
            graphics2D.drawLine(this.x + this.w - 6, this.y + 13 - 29 - this.scra, this.x + this.w - 6, this.y + 12 - 29 - this.scra);
            n7 = -18;
            if (b) {
              if (n > this.x + this.w - 18 && n < this.x + this.w && n2 > 0 && n2 < this.y - 3) {
                n4 = 0;
                this.onsc = true;
              }
            } else if (this.onsc) {
              this.onsc = false;
            }
            if (this.onsc) {
              this.scra = this.y - 3 - 15 - n2;
              if (this.scra < 0) {
                this.scra = 0;
              }
              const scra2 = this.y - 35;
              if (this.scra > scra2) {
                this.scra = scra2;
              }
              this.scro = i32(trunc(fr(this.scra * fr((this.no * (this.ftm.getHeight() + 2) - scra2 - idiv(this.ftm.getHeight(), 2)) / scra2))));
            }
          }
          for (let j = 0; j < this.no; ++j) {
            if (Math.abs(this.scro) < (j + 1) * (this.ftm.getHeight() + 2)) {
              graphics2D.setColor(this.fcol.getRed(), this.fcol.getGreen(), this.fcol.getBlue());
              if (n > this.x && n < this.x + this.w && n2 < this.y - 18 + this.scro - (j - 1) * (this.ftm.getHeight() + 2) && n2 > this.y - 18 + this.scro - j * (this.ftm.getHeight() + 2)) {
                if (b4) {
                  graphics2D.setColor(idiv(this.fcol.getRed() + this.bcol.getRed(), 2), idiv(this.fcol.getGreen() + this.bcol.getGreen(), 2), idiv(this.fcol.getBlue() + this.bcol.getBlue(), 2));
                } else {
                  graphics2D.setColor(this.fcol.getRed(), this.fcol.getGreen(), this.fcol.getBlue());
                }
                graphics2D.fillRect(this.x + 1, this.y - 18 + this.scro - j * (this.ftm.getHeight() + 2), this.w - 1 + n7, this.ftm.getHeight() + 2);
                graphics2D.setColor(this.bcol.getRed(), this.bcol.getGreen(), this.bcol.getBlue());
                if (n4 !== 0) {
                  this.sel = j;
                  this.open = false;
                }
              }
              graphics2D.drawString(this.sopts[j], this.x + 4, this.y - 5 + this.scro - j * (this.ftm.getHeight() + 2));
            }
          }
          if (n7 !== 0) {
            graphics2D.setColor(idiv(this.fcol.getRed() + this.bcol.getRed(), 2), idiv(this.fcol.getGreen() + this.bcol.getGreen(), 2), idiv(this.fcol.getBlue() + this.bcol.getBlue(), 2));
            graphics2D.drawLine(this.x, 0, this.x + this.w, 0);
          }
        }
        b3 = true;
        if (n4 !== 0) {
          this.open = false;
        }
      } else {
        if (this.scro !== 0) {
          this.scro = 0;
        }
        if (this.scra !== 0) {
          this.scra = 0;
        }
      }
      if (b5) {
        if (b4) {
          graphics2D.setColor(idiv(this.fcol.getRed() + this.bcol.getRed(), 2), idiv(this.fcol.getGreen() + this.bcol.getGreen(), 2), idiv(this.fcol.getBlue() + this.bcol.getBlue(), 2));
        } else {
          graphics2D.setColor(this.fcol.getRed(), this.fcol.getGreen(), this.fcol.getBlue());
        }
      } else {
        graphics2D.setColor(this.bcol.getRed(), this.bcol.getGreen(), this.bcol.getBlue());
      }
      graphics2D.fillRect(this.x, this.y + 1, this.w, 21);
      graphics2D.setColor(idiv(this.fcol.getRed() + this.bcol.getRed(), 2), idiv(this.fcol.getGreen() + this.bcol.getGreen(), 2), idiv(this.fcol.getBlue() + this.bcol.getBlue(), 2));
      graphics2D.drawRect(this.x, this.y + 1, this.w, 21);
      if (b4) {
        graphics2D.setColor(idiv(this.bcol.getRed() + 255, 2), idiv(this.bcol.getGreen() + 255, 2), idiv(this.bcol.getBlue() + 255, 2));
      } else {
        graphics2D.setColor(idiv(this.fcol.getRed() + 255, 2), idiv(this.fcol.getGreen() + 255, 2), idiv(this.fcol.getBlue() + 255, 2));
      }
      graphics2D.drawRect(this.x + 1, this.y + 2, this.w - 2, 19);
      graphics2D.drawLine(this.x + this.w - 17, this.y + 3, this.x + this.w - 17, this.y + 20);
      graphics2D.setColor(this.fcol.getRed(), this.fcol.getGreen(), this.fcol.getBlue());
      if (this.dis) {
        graphics2D.setColor(idiv(this.fcol.getRed() + this.bcol.getRed() * 2, 3), idiv(this.fcol.getGreen() + this.bcol.getGreen() * 2, 3), idiv(this.fcol.getBlue() + this.bcol.getBlue() * 2, 3));
      }
      graphics2D.drawRect(this.x + this.w - 16, this.y + 3, 14, 17);
      if (b4) {
        graphics2D.setColor(idiv(this.bcol.getRed() + 510, 3), idiv(this.bcol.getGreen() + 510, 3), idiv(this.bcol.getBlue() + 510, 3));
      } else {
        graphics2D.setColor(idiv(this.fcol.getRed() + 510, 3), idiv(this.fcol.getGreen() + 510, 3), idiv(this.fcol.getBlue() + 510, 3));
      }
      graphics2D.fillRect(this.x + this.w - 15, this.y + 4, 13, 16);
      graphics2D.setColor(0, 0, 0);
      if (this.dis) {
        graphics2D.setColor(idiv(this.fcol.getRed() + this.bcol.getRed() * 2, 3), idiv(this.fcol.getGreen() + this.bcol.getGreen() * 2, 3), idiv(this.fcol.getBlue() + this.bcol.getBlue() * 2, 3));
      }
      graphics2D.drawLine(this.x + this.w - 12, this.y + 9, this.x + this.w - 12, this.y + 10);
      graphics2D.drawLine(this.x + this.w - 11, this.y + 10, this.x + this.w - 11, this.y + 11);
      graphics2D.drawLine(this.x + this.w - 10, this.y + 11, this.x + this.w - 10, this.y + 12);
      graphics2D.drawLine(this.x + this.w - 9, this.y + 12, this.x + this.w - 9, this.y + 13);
      graphics2D.drawLine(this.x + this.w - 8, this.y + 11, this.x + this.w - 8, this.y + 12);
      graphics2D.drawLine(this.x + this.w - 7, this.y + 10, this.x + this.w - 7, this.y + 11);
      graphics2D.drawLine(this.x + this.w - 6, this.y + 9, this.x + this.w - 6, this.y + 10);
      if (b5) {
        graphics2D.setColor(this.bcol.getRed(), this.bcol.getGreen(), this.bcol.getBlue());
      } else {
        graphics2D.setColor(this.fcol.getRed(), this.fcol.getGreen(), this.fcol.getBlue());
      }
      if (this.dis) {
        graphics2D.setColor(idiv(this.fcol.getRed() + this.bcol.getRed() * 2, 3), idiv(this.fcol.getGreen() + this.bcol.getGreen() * 2, 3), idiv(this.fcol.getBlue() + this.bcol.getBlue() * 2, 3));
      }
      if (this.carsel && !b5) {
        if (this.flksel) {
          graphics2D.setColor(240, 240, 240);
          this.flksel = false;
        } else {
          this.flksel = true;
        }
      }
      graphics2D.drawString(this.sopts[this.sel], this.x + 4, this.y + (this.ftm.getHeight() + 2));
      if (this.alphad) {
        graphics2D.setComposite(1.0);
      }
    } else {
      if (this.scro !== 0) {
        this.scro = 0;
      }
      if (this.scra !== 0) {
        this.scra = 0;
      }
    }
    return b3;
  }
}
