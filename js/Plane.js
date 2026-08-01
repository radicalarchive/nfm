// Transpiled from java-src/Plane.java, line by line.
//
// Local names are kept as procyon emitted them (array, array2, n36, ...) even
// though they are ugly: the point is that this file diffs against the Java
// side by side. Do not rename or restructure.
//
// Numeric conventions used throughout:
//   idiv(a, b)   every Java int / int
//   trunc(x)     every Java (int) cast of a float or double
//   fr(x)        every Java float-typed intermediate; m.sin/m.cos return
//                float, so any expression mixing them is float32 in Java and
//                drifts without this
//   Math.imul    int multiplies that can exceed 2^31 (projection, distances)
//
// PAINTER'S ALGORITHM: faces are submitted in the order this file calls
// fillPolygon/drawPolygon. There is no depth buffer. Never reorder them.

import { idiv, trunc, fr, i32, intArray, floatArray, random, RGBtoHSB, HSBtoRGB } from './java.js';
import { Madness } from './Madness.js';

export class Plane {
  constructor(m, t, array, array2, array3, n, array4, glass, gr, fs, wx, wy, wz, disline, bfase, road, light, solo) {
    this.c = intArray(3);
    this.oc = intArray(3);
    this.hsb = floatArray(3);
    this.glass = 0;
    this.gr = 0;
    this.fs = 0;
    this.disline = 7;
    this.road = false;
    this.solo = false;
    this.light = 0;
    this.master = 0;
    this.wx = 0;
    this.wz = 0;
    this.wy = 0;
    this.deltaf = 1.0;
    this.projf = 1.0;
    this.av = 0;
    this.bfase = 0;
    this.nocol = false;
    this.chip = 0;
    this.ctmag = 0.0;
    this.cxz = 0;
    this.cxy = 0;
    this.czy = 0;
    this.cox = intArray(3);
    this.coz = intArray(3);
    this.coy = intArray(3);
    this.dx = 0;
    this.dy = 0;
    this.dz = 0;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;
    this.embos = 0;
    this.typ = 0;
    this.pa = 0;
    this.pb = 0;
    this.flx = 0;
    this.colnum = 0;
    this.m = m;
    this.t = t;
    this.n = n;
    this.ox = intArray(this.n);
    this.oz = intArray(this.n);
    this.oy = intArray(this.n);
    for (let i = 0; i < this.n; ++i) {
      this.ox[i] = array[i];
      this.oy[i] = array3[i];
      this.oz[i] = array2[i];
    }
    for (let j = 0; j < 3; ++j) {
      this.oc[j] = array4[j];
    }
    if (gr === -15) {
      if (array4[0] === 211) {
        const n2 = trunc(random() * 40.0 - 20.0);
        const n3 = trunc(random() * 40.0 - 20.0);
        for (let k = 0; k < this.n; ++k) {
          this.ox[k] += n2;
          this.oz[k] += n3;
        }
      }
      const n6 = trunc(185.0 + random() * 20.0);
      array4[0] = idiv(217 + n6, 2);
      if (array4[0] === 211) {
        array4[0] = 210;
      }
      array4[1] = idiv(189 + n6, 2);
      array4[2] = idiv(132 + n6, 2);
      for (let l = 0; l < this.n; ++l) {
        if (random() > random()) this.ox[l] = trunc(this.ox[l] + (8.0 * random() - 4.0));
        if (random() > random()) this.oy[l] = trunc(this.oy[l] + (8.0 * random() - 4.0));
        if (random() > random()) this.oz[l] = trunc(this.oz[l] + (8.0 * random() - 4.0));
      }
    }
    if (array4[0] === array4[1] && array4[1] === array4[2]) {
      this.nocol = true;
    }
    if (glass === 0) {
      for (let n10 = 0; n10 < 3; ++n10) {
        this.c[n10] = trunc(array4[n10] + fr(array4[n10] * fr(this.m.snap[n10] / 100.0)));
        if (this.c[n10] > 255) this.c[n10] = 255;
        if (this.c[n10] < 0) this.c[n10] = 0;
      }
    }
    if (glass === 1) {
      for (let n11 = 0; n11 < 3; ++n11) {
        this.c[n11] = idiv(this.m.csky[n11] * this.m.fade[0] * 2 + this.m.cfade[n11] * 3000,
                           this.m.fade[0] * 2 + 3000);
      }
    }
    if (glass === 2) {
      for (let n12 = 0; n12 < 3; ++n12) {
        this.c[n12] = trunc(fr(this.m.crgrnd[n12] * 0.925));
      }
    }
    if (glass === 3) {
      for (let n13 = 0; n13 < 3; ++n13) {
        this.c[n13] = array4[n13];
      }
    }
    this.disline = disline;
    this.bfase = bfase;
    this.glass = glass;
    RGBtoHSB(this.c[0], this.c[1], this.c[2], this.hsb);
    if (glass === 3 && this.m.trk !== 2) {
      this.hsb[1] += 0.05;
      if (this.hsb[1] > 1.0) this.hsb[1] = 1.0;
    }
    if (!this.nocol && this.glass !== 1) {
      if (this.bfase > 20 && this.hsb[1] > 0.25) this.hsb[1] = 0.25;
      if (this.bfase > 25 && this.hsb[2] > 0.7) this.hsb[2] = 0.7;
      if (this.bfase > 30 && this.hsb[1] > 0.15) this.hsb[1] = 0.15;
      if (this.bfase > 35 && this.hsb[2] > 0.6) this.hsb[2] = 0.6;
      if (this.bfase > 40) this.hsb[0] = 0.075;
      if (this.bfase > 50 && this.hsb[2] > 0.5) this.hsb[2] = 0.5;
      if (this.bfase > 60) this.hsb[0] = 0.05;
    }
    this.road = road;
    this.light = light;
    this.solo = solo;
    this.gr = gr;
    this.fs = fs;
    this.wx = wx;
    this.wy = wy;
    this.wz = wz;
    this.deltafntyp();
  }

  deltafntyp() {
    const abs = Math.abs(this.ox[2] - this.ox[1]);
    const abs2 = Math.abs(this.oy[2] - this.oy[1]);
    const abs3 = Math.abs(this.oz[2] - this.oz[1]);
    if (abs2 <= abs && abs2 <= abs3) this.typ = 2;
    if (abs <= abs2 && abs <= abs3) this.typ = 1;
    if (abs3 <= abs && abs3 <= abs2) this.typ = 3;
    this.deltaf = 1.0;
    for (let i = 0; i < 3; ++i) {
      for (let j = 0; j < 3; ++j) {
        if (j !== i) {
          this.deltaf = fr(this.deltaf * fr(Math.sqrt(
            Math.imul(this.ox[j] - this.ox[i], this.ox[j] - this.ox[i]) +
            Math.imul(this.oy[j] - this.oy[i], this.oy[j] - this.oy[i]) +
            Math.imul(this.oz[j] - this.oz[i], this.oz[j] - this.oz[i])) / 100.0));
        }
      }
    }
    this.deltaf = fr(this.deltaf / 3.0);
  }

  loadprojf() {
    this.projf = 1.0;
    for (let i = 0; i < 3; ++i) {
      for (let j = 0; j < 3; ++j) {
        if (j !== i) {
          this.projf = fr(this.projf * fr(Math.sqrt(
            Math.imul(this.ox[i] - this.ox[j], this.ox[i] - this.ox[j]) +
            Math.imul(this.oz[i] - this.oz[j], this.oz[i] - this.oz[j])) / 100.0));
        }
      }
    }
    this.projf = fr(this.projf / 3.0);
  }

  /**
   * Draw one face. Parameter names are procyon's; positionally:
   * (g, x, y, z, cxz, xy, zy, wxRot, wzRot, farAway, objDist).
   */
  d(graphics2D, n, n2, n3, cxz, n4, n5, n6, n7, b, n8) {
    if (this.master === 1) {
      if (this.av > 1500 && !this.m.crs) this.n = 12;
      else this.n = 20;
    }
    const array = intArray(this.n);
    const array2 = intArray(this.n);
    const array3 = intArray(this.n);
    if (this.embos === 0) {
      for (let i = 0; i < this.n; ++i) {
        array[i] = this.ox[i] + n;
        array3[i] = this.oy[i] + n2;
        array2[i] = this.oz[i] + n3;
      }
      if ((this.gr === -11 || this.gr === -12 || this.gr === -13) && this.m.lastmaf === 1) {
        for (let j = 0; j < this.n; ++j) {
          array[j] = -this.ox[j] + n;
          array3[j] = this.oy[j] + n2;
          array2[j] = -this.oz[j] + n3;
        }
      }
    } else {
      if (this.embos <= 11 && this.m.random() > 0.5 && this.glass !== 1) {
        for (let k = 0; k < this.n; ++k) {
          array[k] = trunc(this.ox[k] + n + fr(15.0 - fr(this.m.random() * 30.0)));
          array3[k] = trunc(this.oy[k] + n2 + fr(15.0 - fr(this.m.random() * 30.0)));
          array2[k] = trunc(this.oz[k] + n3 + fr(15.0 - fr(this.m.random() * 30.0)));
        }
        this.rot(array, array3, n, n2, n4, this.n);
        this.rot(array3, array2, n2, n3, n5, this.n);
        this.rot(array, array2, n, n3, cxz, this.n);
        this.rot(array, array2, this.m.cx, this.m.cz, this.m.xz, this.n);
        this.rot(array3, array2, this.m.cy, this.m.cz, this.m.zy, this.n);
        const array4 = intArray(this.n);
        const array5 = intArray(this.n);
        for (let l = 0; l < this.n; ++l) {
          array4[l] = this.xs(array[l], array2[l]);
          array5[l] = this.ys(array3[l], array2[l]);
        }
        graphics2D.setColor(230, 230, 230);
        graphics2D.fillPolygon(array4, array5, this.n);
      }
      let n9 = 1.0;
      if (this.embos <= 4) n9 = fr(1.0 + fr(this.m.random() / 5.0));
      if (this.embos > 4 && this.embos <= 7) n9 = fr(1.0 + fr(this.m.random() / 4.0));
      if (this.embos > 7 && this.embos <= 9) {
        n9 = fr(1.0 + fr(this.m.random() / 3.0));
        if (this.hsb[2] > 0.7) this.hsb[2] = 0.7;
      }
      if (this.embos > 9 && this.embos <= 10) {
        n9 = fr(1.0 + fr(this.m.random() / 2.0));
        if (this.hsb[2] > 0.6) this.hsb[2] = 0.6;
      }
      if (this.embos > 10 && this.embos <= 12) {
        n9 = fr(1.0 + fr(this.m.random() / 1.0));
        if (this.hsb[2] > 0.5) this.hsb[2] = 0.5;
      }
      if (this.embos === 12) {
        this.chip = 1;
        this.ctmag = 2.0;
        this.bfase = -7;
      }
      if (this.embos === 13) {
        this.hsb[1] = 0.2;
        this.hsb[2] = 0.4;
      }
      if (this.embos === 16) {
        this.pa = trunc(this.m.random() * this.n);
        this.pb = trunc(this.m.random() * this.n);
        while (this.pa === this.pb) {
          this.pb = trunc(this.m.random() * this.n);
        }
      }
      if (this.embos >= 16) {
        let n10 = 1;
        let n11 = 1;
        let abs;
        for (abs = Math.abs(n5); abs > 270; abs -= 360) {}
        if (Math.abs(abs) > 90) n10 = -1;
        let abs2;
        for (abs2 = Math.abs(n4); abs2 > 270; abs2 -= 360) {}
        if (Math.abs(abs2) > 90) n11 = -1;
        const array6 = intArray(3);
        const array7 = intArray(3);
        array[0] = this.ox[this.pa] + n;
        array3[0] = this.oy[this.pa] + n2;
        array2[0] = this.oz[this.pa] + n3;
        array[1] = this.ox[this.pb] + n;
        array3[1] = this.oy[this.pb] + n2;
        array2[1] = this.oz[this.pb] + n3;
        while (Math.abs(array[0] - array[1]) > 100) {
          if (array[1] > array[0]) array[1] -= 30;
          else array[1] += 30;
        }
        while (Math.abs(array2[0] - array2[1]) > 100) {
          if (array2[1] > array2[0]) array2[1] -= 30;
          else array2[1] += 30;
        }
        const n16 = trunc(idiv(Math.abs(array[0] - array[1]), 3) * (0.5 - this.m.random()));
        const n17 = trunc(idiv(Math.abs(array2[0] - array2[1]), 3) * (0.5 - this.m.random()));
        array[2] = idiv(array[0] + array[1], 2) + n16;
        array2[2] = idiv(array2[0] + array2[1], 2) + n17;
        const n18 = trunc((Math.abs(array[0] - array[1]) + Math.abs(array2[0] - array2[1])) / 1.5
                          * (fr(this.m.random() / 2.0) + 0.5));
        array3[2] = idiv(array3[0] + array3[1], 2) - Math.imul(Math.imul(n10, n11), n18);
        this.rot(array, array3, n, n2, n4, 3);
        this.rot(array3, array2, n2, n3, n5, 3);
        this.rot(array, array2, n, n3, cxz, 3);
        this.rot(array, array2, this.m.cx, this.m.cz, this.m.xz, 3);
        this.rot(array3, array2, this.m.cy, this.m.cz, this.m.zy, 3);
        for (let n19 = 0; n19 < 3; ++n19) {
          array6[n19] = this.xs(array[n19], array2[n19]);
          array7[n19] = this.ys(array3[n19], array2[n19]);
        }
        let r = trunc(fr(255.0 + fr(255.0 * fr(this.m.snap[0] / 400.0))));
        if (r > 255) r = 255;
        if (r < 0) r = 0;
        let g = trunc(fr(169.0 + fr(169.0 * fr(this.m.snap[1] / 300.0))));
        if (g > 255) g = 255;
        if (g < 0) g = 0;
        let b2 = trunc(fr(89.0 + fr(89.0 * fr(this.m.snap[2] / 200.0))));
        if (b2 > 255) b2 = 255;
        if (b2 < 0) b2 = 0;
        graphics2D.setColor(r, g, b2);
        graphics2D.fillPolygon(array6, array7, 3);
        array[0] = this.ox[this.pa] + n;
        array3[0] = this.oy[this.pa] + n2;
        array2[0] = this.oz[this.pa] + n3;
        array[1] = this.ox[this.pb] + n;
        array3[1] = this.oy[this.pb] + n2;
        array2[1] = this.oz[this.pb] + n3;
        while (Math.abs(array[0] - array[1]) > 100) {
          if (array[1] > array[0]) array[1] -= 30;
          else array[1] += 30;
        }
        while (Math.abs(array2[0] - array2[1]) > 100) {
          if (array2[1] > array2[0]) array2[1] -= 30;
          else array2[1] += 30;
        }
        array[2] = idiv(array[0] + array[1], 2) + n16;
        array2[2] = idiv(array2[0] + array2[1], 2) + n17;
        array3[2] = idiv(array3[0] + array3[1], 2) - Math.imul(Math.imul(n10, n11), trunc(n18 * 0.8));
        this.rot(array, array3, n, n2, n4, 3);
        this.rot(array3, array2, n2, n3, n5, 3);
        this.rot(array, array2, n, n3, cxz, 3);
        this.rot(array, array2, this.m.cx, this.m.cz, this.m.xz, 3);
        this.rot(array3, array2, this.m.cy, this.m.cz, this.m.zy, 3);
        for (let n24 = 0; n24 < 3; ++n24) {
          array6[n24] = this.xs(array[n24], array2[n24]);
          array7[n24] = this.ys(array3[n24], array2[n24]);
        }
        let r2 = trunc(fr(255.0 + fr(255.0 * fr(this.m.snap[0] / 400.0))));
        if (r2 > 255) r2 = 255;
        if (r2 < 0) r2 = 0;
        let g2 = trunc(fr(207.0 + fr(207.0 * fr(this.m.snap[1] / 300.0))));
        if (g2 > 255) g2 = 255;
        if (g2 < 0) g2 = 0;
        let b3 = trunc(fr(136.0 + fr(136.0 * fr(this.m.snap[2] / 200.0))));
        if (b3 > 255) b3 = 255;
        if (b3 < 0) b3 = 0;
        graphics2D.setColor(r2, g2, b3);
        graphics2D.fillPolygon(array6, array7, 3);
      }
      for (let n25 = 0; n25 < this.n; ++n25) {
        if (this.typ === 1) array[n25] = trunc(fr(this.ox[n25] * n9) + n);
        else array[n25] = this.ox[n25] + n;
        if (this.typ === 2) array3[n25] = trunc(fr(this.oy[n25] * n9) + n2);
        else array3[n25] = this.oy[n25] + n2;
        if (this.typ === 3) array2[n25] = trunc(fr(this.oz[n25] * n9) + n3);
        else array2[n25] = this.oz[n25] + n3;
      }
      if (this.embos !== 70) ++this.embos;
      else this.embos = 16;
    }
    if (this.wz !== 0) {
      this.rot(array3, array2, this.wy + n2, this.wz + n3, n7, this.n);
    }
    if (this.wx !== 0) {
      this.rot(array, array2, this.wx + n, this.wz + n3, n6, this.n);
    }
    if (this.chip === 1 && (this.m.random() > 0.6 || this.bfase === 0)) {
      this.chip = 0;
      if (this.bfase === 0 && this.nocol) this.bfase = 1;
    }
    if (this.chip !== 0) {
      if (this.chip === 1) {
        this.cxz = cxz;
        this.cxy = n4;
        this.czy = n5;
        const n26 = trunc(this.m.random() * this.n);
        this.cox[0] = this.ox[n26];
        this.coz[0] = this.oz[n26];
        this.coy[0] = this.oy[n26];
        if (this.ctmag > 3.0) this.ctmag = 3.0;
        if (this.ctmag < -3.0) this.ctmag = -3.0;
        this.cox[1] = trunc(this.cox[0] + fr(this.ctmag * fr(10.0 - fr(this.m.random() * 20.0))));
        this.cox[2] = trunc(this.cox[0] + fr(this.ctmag * fr(10.0 - fr(this.m.random() * 20.0))));
        this.coy[1] = trunc(this.coy[0] + fr(this.ctmag * fr(10.0 - fr(this.m.random() * 20.0))));
        this.coy[2] = trunc(this.coy[0] + fr(this.ctmag * fr(10.0 - fr(this.m.random() * 20.0))));
        this.coz[1] = trunc(this.coz[0] + fr(this.ctmag * fr(10.0 - fr(this.m.random() * 20.0))));
        this.coz[2] = trunc(this.coz[0] + fr(this.ctmag * fr(10.0 - fr(this.m.random() * 20.0))));
        this.dx = 0;
        this.dy = 0;
        this.dz = 0;
        if (this.bfase !== -7) {
          this.vx = trunc(fr(this.ctmag * fr(30.0 - fr(this.m.random() * 60.0))));
          this.vz = trunc(fr(this.ctmag * fr(30.0 - fr(this.m.random() * 60.0))));
          this.vy = trunc(fr(this.ctmag * fr(30.0 - fr(this.m.random() * 60.0))));
        } else {
          this.vx = trunc(fr(this.ctmag * fr(10.0 - fr(this.m.random() * 20.0))));
          this.vz = trunc(fr(this.ctmag * fr(10.0 - fr(this.m.random() * 20.0))));
          this.vy = trunc(fr(this.ctmag * fr(10.0 - fr(this.m.random() * 20.0))));
        }
        this.chip = 2;
      }
      const array16 = intArray(3);
      const array17 = intArray(3);
      const array18 = intArray(3);
      for (let n27 = 0; n27 < 3; ++n27) {
        array16[n27] = this.cox[n27] + n;
        array18[n27] = this.coy[n27] + n2;
        array17[n27] = this.coz[n27] + n3;
      }
      this.rot(array16, array18, n, n2, this.cxy, 3);
      this.rot(array18, array17, n2, n3, this.czy, 3);
      this.rot(array16, array17, n, n3, this.cxz, 3);
      for (let n28 = 0; n28 < 3; ++n28) {
        array16[n28] += this.dx;
        array18[n28] += this.dy;
        array17[n28] += this.dz;
      }
      this.dx = i32(this.dx + this.vx);
      this.dz = i32(this.dz + this.vz);
      this.dy = i32(this.dy + this.vy);
      this.vy = i32(this.vy + 7);
      if (array18[0] > this.m.ground) this.chip = 19;
      this.rot(array16, array17, this.m.cx, this.m.cz, this.m.xz, 3);
      this.rot(array18, array17, this.m.cy, this.m.cz, this.m.zy, 3);
      const array22 = intArray(3);
      const array23 = intArray(3);
      for (let n32 = 0; n32 < 3; ++n32) {
        array22[n32] = this.xs(array16[n32], array17[n32]);
        array23[n32] = this.ys(array18[n32], array17[n32]);
      }
      const n33 = trunc(fr(this.m.random() * 3.0));
      if (this.bfase !== -7) {
        if (n33 === 0) setDarker(graphics2D, this.c[0], this.c[1], this.c[2]);
        if (n33 === 1) graphics2D.setColor(this.c[0], this.c[1], this.c[2]);
        if (n33 === 2) setBrighter(graphics2D, this.c[0], this.c[1], this.c[2]);
      } else {
        setHSB(graphics2D, this.hsb[0], this.hsb[1], this.hsb[2]);
      }
      graphics2D.fillPolygon(array22, array23, 3);
      ++this.chip;
      if (this.chip === 20) this.chip = 0;
    }
    this.rot(array, array3, n, n2, n4, this.n);
    this.rot(array3, array2, n2, n3, n5, this.n);
    this.rot(array, array2, n, n3, cxz, this.n);
    if ((n4 !== 0 || n5 !== 0 || cxz !== 0) && this.m.trk !== 2) {
      this.projf = 1.0;
      for (let n34 = 0; n34 < 3; ++n34) {
        for (let n35 = 0; n35 < 3; ++n35) {
          if (n35 !== n34) {
            this.projf = fr(this.projf * fr(Math.sqrt(
              Math.imul(array[n34] - array[n35], array[n34] - array[n35]) +
              Math.imul(array2[n34] - array2[n35], array2[n34] - array2[n35])) / 100.0));
          }
        }
      }
      this.projf = fr(this.projf / 3.0);
    }
    this.rot(array, array2, this.m.cx, this.m.cz, this.m.xz, this.n);
    let b4 = false;
    const array24 = intArray(this.n);
    const array25 = intArray(this.n);
    let n36 = 500;
    for (let n37 = 0; n37 < this.n; ++n37) {
      array24[n37] = this.xs(array[n37], array2[n37]);
      array25[n37] = this.ys(array3[n37], array2[n37]);
    }
    let n38 = 0;
    let n39 = 1;
    for (let n40 = 0; n40 < this.n; ++n40) {
      for (let n41 = n40; n41 < this.n; ++n41) {
        if (n40 !== n41 && Math.abs(array24[n40] - array24[n41]) - Math.abs(array25[n40] - array25[n41]) < n36) {
          n39 = n40;
          n38 = n41;
          n36 = Math.abs(array24[n40] - array24[n41]) - Math.abs(array25[n40] - array25[n41]);
        }
      }
    }
    if (array25[n38] < array25[n39]) {
      const n42 = n38;
      n38 = n39;
      n39 = n42;
    }
    if (this.spy(array[n38], array2[n38]) > this.spy(array[n39], array2[n39])) {
      b4 = true;
      let n43 = 0;
      for (let n44 = 0; n44 < this.n; ++n44) {
        if (array2[n44] < 50 && array3[n44] > this.m.cy) {
          b4 = false;
        } else if (array3[n44] === array3[0]) {
          ++n43;
        }
      }
      if (n43 === this.n && array3[0] > this.m.cy) {
        b4 = false;
      }
    }
    this.rot(array3, array2, this.m.cy, this.m.cz, this.m.zy, this.n);
    let n45 = 1;
    const array26 = intArray(this.n);
    const array27 = intArray(this.n);
    let n46 = 0;
    let n47 = 0;
    let n48 = 0;
    let n49 = 0;
    let n50 = 0;
    for (let n51 = 0; n51 < this.n; ++n51) {
      array26[n51] = this.xs(array[n51], array2[n51]);
      array27[n51] = this.ys(array3[n51], array2[n51]);
      if (array27[n51] < this.m.ih || array2[n51] < 10) ++n46;
      if (array27[n51] > this.m.h || array2[n51] < 10) ++n47;
      if (array26[n51] < this.m.iw || array2[n51] < 10) ++n48;
      if (array26[n51] > this.m.w || array2[n51] < 10) ++n49;
      if (array2[n51] < 10) ++n50;
    }
    if (n48 === this.n || n46 === this.n || n47 === this.n || n49 === this.n) n45 = 0;
    if ((this.m.trk === 1 || this.m.trk === 4) && (n48 !== 0 || n46 !== 0 || n47 !== 0 || n49 !== 0)) n45 = 0;
    if (this.m.trk === 3 && n50 !== 0) n45 = 0;
    if (n50 !== 0) b = true;
    if (n45 !== 0 && n8 !== -1) {
      let abs3 = 0;
      let abs4 = 0;
      for (let n52 = 0; n52 < this.n; ++n52) {
        for (let n53 = n52; n53 < this.n; ++n53) {
          if (n52 !== n53) {
            if (Math.abs(array26[n52] - array26[n53]) > abs3) abs3 = Math.abs(array26[n52] - array26[n53]);
            if (Math.abs(array27[n52] - array27[n53]) > abs4) abs4 = Math.abs(array27[n52] - array27[n53]);
          }
        }
      }
      if (abs3 === 0 || abs4 === 0) {
        n45 = 0;
      } else if (abs3 < 3 && abs4 < 3 && ((idiv(n8, abs3) > 15 && idiv(n8, abs4) > 15) || b) && (!this.m.lightson || this.light === 0)) {
        n45 = 0;
      }
    }
    if (n45 !== 0) {
      let lastmaf = 1;
      let gr = this.gr;
      if (gr < 0 && gr >= -15) gr = 0;
      if (this.gr === -11) gr = -90;
      if (this.gr === -12) gr = -75;
      if (this.gr === -14 || this.gr === -15) gr = -50;
      if (this.glass === 2) gr = 200;
      if (this.fs !== 0) {
        let n54;
        let n55;
        if (Math.abs(array27[0] - array27[1]) > Math.abs(array27[2] - array27[1])) {
          n54 = 0;
          n55 = 2;
        } else {
          n54 = 2;
          n55 = 0;
          lastmaf *= -1;
        }
        if (array27[1] > array27[n54]) lastmaf *= -1;
        if (array26[1] > array26[n55]) lastmaf *= -1;
        if (this.fs !== 22) {
          lastmaf *= this.fs;
          if (lastmaf === -1) {
            gr += 40;
            lastmaf = -111;
          }
        }
      }
      if (this.m.lightson && this.light === 2) gr -= 40;
      let n56 = array3[0];
      let n57 = array3[0];
      let n58 = array[0];
      let n59 = array[0];
      let n60 = array2[0];
      let n61 = array2[0];
      for (let n62 = 0; n62 < this.n; ++n62) {
        if (array3[n62] > n56) n56 = array3[n62];
        if (array3[n62] < n57) n57 = array3[n62];
        if (array[n62] > n58) n58 = array[n62];
        if (array[n62] < n59) n59 = array[n62];
        if (array2[n62] > n60) n60 = array2[n62];
        if (array2[n62] < n61) n61 = array2[n62];
      }
      const n63 = idiv(n56 + n57, 2);
      const n64 = idiv(n58 + n59, 2);
      const n65 = idiv(n60 + n61, 2);
      this.av = trunc(Math.sqrt(
        Math.imul(this.m.cy - n63, this.m.cy - n63) +
        Math.imul(this.m.cx - n64, this.m.cx - n64) +
        Math.imul(n65, n65) +
        Math.imul(Math.imul(gr, gr), gr)));
      if (this.m.trk === 0 && (this.av > this.m.fade[this.disline] || this.av === 0)) n45 = 0;
      if (lastmaf === -111 && this.av > 4500 && !this.road) n45 = 0;
      if (lastmaf === -111 && this.av > 1500) b = true;
      if (this.av > 3000 && this.m.adv <= 900) b = true;
      if (this.fs === 22 && this.av < 11200) this.m.lastmaf = lastmaf;
      if (this.gr === -13 && (!this.m.lastcheck || n8 !== -1)) n45 = 0;
      if (this.master === 2 && this.av > 1500 && !this.m.crs) n45 = 0;
      if ((this.gr === -14 || this.gr === -15 || this.gr === -12) &&
          (this.av > 11000 || b4 || lastmaf === -111 || this.m.resdown === 2) &&
          this.m.trk !== 2 && this.m.trk !== 3) n45 = 0;
      if (this.gr === -11 && this.av > 11000 && this.m.trk !== 2 && this.m.trk !== 3) n45 = 0;
      if (this.glass === 2 && (this.m.trk !== 0 || this.av > 6700)) n45 = 0;
      if (this.flx !== 0 && this.m.random() > 0.3 && this.flx !== 77) n45 = 0;
    }
    if (n45 !== 0) {
      let n66 = fr(this.projf / this.deltaf + 0.3);
      if (b && !this.solo) {
        let b5 = false;
        if (n66 > 1.0) {
          if (n66 >= 1.27) b5 = true;
          n66 = 1.0;
        }
        if (b5) n66 = fr(n66 * fr(0.89));
        else n66 = fr(n66 * fr(0.86));
        if (n66 < 0.37) n66 = 0.37;
        if (this.gr === -9) n66 = 0.7;
        if (this.gr === -4) n66 = 0.74;
        if (this.gr !== -7 && this.m.trk === 0 && b4) n66 = 0.32;
        if (this.gr === -8 || this.gr === -14 || this.gr === -15) n66 = 1.0;
        if (this.gr === -11 || this.gr === -12) {
          n66 = 0.6;
          if (n8 === -1) {
            if (this.m.cpflik || (this.m.nochekflk && !this.m.lastcheck)) n66 = 1.0;
            else n66 = 0.76;
          }
        }
        if (this.gr === -13 && n8 === -1) {
          if (this.m.cpflik) n66 = 0.0;
          else n66 = 0.76;
        }
        if (this.gr === -6) n66 = 0.62;
        if (this.gr === -5) n66 = 0.55;
      } else {
        if (n66 > 1.0) n66 = 1.0;
        if (n66 < 0.6 || b4) n66 = 0.6;
      }
      n66 = fr(n66);
      let rgb = HSBtoRGB(this.hsb[0], this.hsb[1], fr(this.hsb[2] * n66));
      if (this.m.trk === 1) {
        const hsbvals = floatArray(3);
        RGBtoHSB(this.oc[0], this.oc[1], this.oc[2], hsbvals);
        hsbvals[0] = 0.15;
        hsbvals[1] = 0.3;
        rgb = HSBtoRGB(hsbvals[0], hsbvals[1], fr(fr(hsbvals[2] * n66) + 0.0));
      }
      if (this.m.trk === 3) {
        const hsbvals2 = floatArray(3);
        RGBtoHSB(this.oc[0], this.oc[1], this.oc[2], hsbvals2);
        hsbvals2[0] = 0.6;
        hsbvals2[1] = 0.14;
        rgb = HSBtoRGB(hsbvals2[0], hsbvals2[1], fr(fr(hsbvals2[2] * n66) + 0.0));
      }
      let red = (rgb >> 16) & 255;
      let green = (rgb >> 8) & 255;
      let blue = rgb & 255;
      if (this.m.lightson && (this.light !== 0 || ((this.gr === -11 || this.gr === -12) && n8 === -1))) {
        red = this.oc[0];
        if (red > 255) red = 255;
        if (red < 0) red = 0;
        green = this.oc[1];
        if (green > 255) green = 255;
        if (green < 0) green = 0;
        blue = this.oc[2];
        if (blue > 255) blue = 255;
        if (blue < 0) blue = 0;
      }
      if (this.m.trk === 0) {
        for (let n67 = 0; n67 < 16; ++n67) {
          if (this.av > this.m.fade[n67]) {
            red = idiv(red * this.m.fogd + this.m.cfade[0], this.m.fogd + 1);
            green = idiv(green * this.m.fogd + this.m.cfade[1], this.m.fogd + 1);
            blue = idiv(blue * this.m.fogd + this.m.cfade[2], this.m.fogd + 1);
          }
        }
      }
      // ---- the face itself. Everything below draws ON TOP of it, in order.
      graphics2D.setColor(red, green, blue);
      graphics2D.fillPolygon(array26, array27, this.n);
      if (this.m.trk !== 0 && this.gr === -10) b = false;
      if (!b) {
        if (this.flx === 0) {
          if (!this.solo) {
            let r3 = 0;
            let g3 = 0;
            let b6 = 0;
            if (this.m.lightson && this.light !== 0) {
              r3 = idiv(this.oc[0], 2);
              if (r3 > 255) r3 = 255;
              if (r3 < 0) r3 = 0;
              g3 = idiv(this.oc[1], 2);
              if (g3 > 255) g3 = 255;
              if (g3 < 0) g3 = 0;
              b6 = idiv(this.oc[2], 2);
              if (b6 > 255) b6 = 255;
              if (b6 < 0) b6 = 0;
            }
            if (Madness.anti === 1) graphics2D.setRenderingHint();
            graphics2D.setColor(r3, g3, b6);
            graphics2D.drawPolygon(array26, array27, this.n);
            if (Madness.anti === 1) graphics2D.setRenderingHint();
          }
        } else {
          if (this.flx === 2) {
            graphics2D.setColor(0, 0, 0);
            graphics2D.drawPolygon(array26, array27, this.n);
          }
          if (this.flx === 1) {
            const r4 = 0;
            let g4 = trunc(fr(223.0 + fr(223.0 * fr(this.m.snap[1] / 100.0))));
            if (g4 > 255) g4 = 255;
            if (g4 < 0) g4 = 0;
            let b7 = trunc(fr(255.0 + fr(255.0 * fr(this.m.snap[2] / 100.0))));
            if (b7 > 255) b7 = 255;
            if (b7 < 0) b7 = 0;
            graphics2D.setColor(r4, g4, b7);
            graphics2D.drawPolygon(array26, array27, this.n);
            this.flx = 2;
          }
          if (this.flx === 3) {
            const r5 = 0;
            let g5 = trunc(fr(255.0 + fr(255.0 * fr(this.m.snap[1] / 100.0))));
            if (g5 > 255) g5 = 255;
            if (g5 < 0) g5 = 0;
            let b8 = trunc(fr(223.0 + fr(223.0 * fr(this.m.snap[2] / 100.0))));
            if (b8 > 255) b8 = 255;
            if (b8 < 0) b8 = 0;
            graphics2D.setColor(r5, g5, b8);
            graphics2D.drawPolygon(array26, array27, this.n);
            this.flx = 2;
          }
          if (this.flx === 77) {
            graphics2D.setColor(16, 198, 255);
            graphics2D.drawPolygon(array26, array27, this.n);
            this.flx = 0;
          }
        }
      } else if (this.road && this.av <= 3000 && this.m.trk === 0 && this.m.fade[0] > 4000) {
        red -= 10;
        if (red < 0) red = 0;
        green -= 10;
        if (green < 0) green = 0;
        blue -= 10;
        if (blue < 0) blue = 0;
        graphics2D.setColor(red, green, blue);
        graphics2D.drawPolygon(array26, array27, this.n);
      }
      if (this.gr === -10) {
        if (this.m.trk === 0) {
          let r6 = this.c[0];
          let g6 = this.c[1];
          let b9 = this.c[2];
          if (n8 === -1 && this.m.cpflik) {
            // Procyon renders these as `r6 *= (int)1.6` (a multiply by ONE,
            // i.e. a no-op). The bytecode is `iload; i2d; ldc2_w 1.6d; dmul;
            // d2i; istore` -- `r6 = (int)(r6 * 1.6)`, a §2 Case A compound
            // assignment. The checkpoint marker really does brighten 60% when
            // it flashes.
            r6 = trunc(r6 * 1.6);
            if (r6 > 255) r6 = 255;
            g6 = trunc(g6 * 1.6);
            if (g6 > 255) g6 = 255;
            b9 = trunc(b9 * 1.6);
            if (b9 > 255) b9 = 255;
          }
          for (let n68 = 0; n68 < 16; ++n68) {
            if (this.av > this.m.fade[n68]) {
              r6 = idiv(r6 * this.m.fogd + this.m.cfade[0], this.m.fogd + 1);
              g6 = idiv(g6 * this.m.fogd + this.m.cfade[1], this.m.fogd + 1);
              b9 = idiv(b9 * this.m.fogd + this.m.cfade[2], this.m.fogd + 1);
            }
          }
          graphics2D.setColor(r6, g6, b9);
          graphics2D.drawPolygon(array26, array27, this.n);
        } else if (this.m.cpflik && this.m.hit === 5000) {
          let g7 = trunc(random() * 115.0);
          let r7 = g7 * 2 - 54;
          if (r7 < 0) r7 = 0;
          if (r7 > 255) r7 = 255;
          let b10 = 202 + g7 * 2;
          if (b10 < 0) b10 = 0;
          if (b10 > 255) b10 = 255;
          g7 += 101;
          if (g7 < 0) g7 = 0;
          if (g7 > 255) g7 = 255;
          graphics2D.setColor(r7, g7, b10);
          graphics2D.drawPolygon(array26, array27, this.n);
        }
      }
      if (this.gr === -18 && this.m.trk === 0) {
        let r8 = this.c[0];
        let g8 = this.c[1];
        let b11 = this.c[2];
        if (this.m.cpflik && this.m.elecr >= 0.0) {
          r8 = trunc(fr(25.5 * this.m.elecr));
          if (r8 > 255) r8 = 255;
          g8 = trunc(fr(128.0 + fr(12.8 * this.m.elecr)));
          if (g8 > 255) g8 = 255;
          b11 = 255;
        }
        for (let n69 = 0; n69 < 16; ++n69) {
          if (this.av > this.m.fade[n69]) {
            r8 = idiv(r8 * this.m.fogd + this.m.cfade[0], this.m.fogd + 1);
            g8 = idiv(g8 * this.m.fogd + this.m.cfade[1], this.m.fogd + 1);
            b11 = idiv(b11 * this.m.fogd + this.m.cfade[2], this.m.fogd + 1);
          }
        }
        graphics2D.setColor(r8, g8, b11);
        graphics2D.drawPolygon(array26, array27, this.n);
      }
    }
  }

  /** Shadow projection onto the track. */
  s(graphics2D, n, n2, n3, n4, n5, n6, n7) {
    const array = intArray(this.n);
    const array2 = intArray(this.n);
    const array3 = intArray(this.n);
    for (let i = 0; i < this.n; ++i) {
      array[i] = this.ox[i] + n;
      array3[i] = this.oy[i] + n2;
      array2[i] = this.oz[i] + n3;
    }
    this.rot(array, array3, n, n2, n5, this.n);
    this.rot(array3, array2, n2, n3, n6, this.n);
    this.rot(array, array2, n, n3, n4, this.n);
    let r = trunc(fr(fr(this.m.crgrnd[0]) / 1.5));
    let g = trunc(fr(fr(this.m.crgrnd[1]) / 1.5));
    let b = trunc(fr(fr(this.m.crgrnd[2]) / 1.5));
    for (let j = 0; j < this.n; ++j) {
      array3[j] = this.m.ground;
    }
    if (n7 === 0) {
      let n8 = 0;
      let n9 = 0;
      let n10 = 0;
      let n11 = 0;
      for (let k = 0; k < this.n; ++k) {
        let n12 = 0;
        let n13 = 0;
        let n14 = 0;
        let n15 = 0;
        for (let l = 0; l < this.n; ++l) {
          if (array[k] >= array[l]) ++n12;
          if (array[k] <= array[l]) ++n13;
          if (array2[k] >= array2[l]) ++n14;
          if (array2[k] <= array2[l]) ++n15;
        }
        if (n12 === this.n) n8 = array[k];
        if (n13 === this.n) n9 = array[k];
        if (n14 === this.n) n10 = array2[k];
        if (n15 === this.n) n11 = array2[k];
      }
      const n16 = idiv(n8 + n9, 2);
      const n17 = idiv(n10 + n11, 2);
      let ncx = idiv(n16 - this.t.sx + this.m.x, 3000);
      if (ncx > this.t.ncx) ncx = this.t.ncx;
      if (ncx < 0) ncx = 0;
      let ncz = idiv(n17 - this.t.sz + this.m.z, 3000);
      if (ncz > this.t.ncz) ncz = this.t.ncz;
      if (ncz < 0) ncz = 0;
      for (let n18 = this.t.sect[ncx][ncz].length - 1; n18 >= 0; --n18) {
        const n19 = this.t.sect[ncx][ncz][n18];
        let n20 = 0;
        if (Math.abs(this.t.zy[n19]) !== 90 && Math.abs(this.t.xy[n19]) !== 90 && this.t.rady[n19] !== 801 &&
            Math.abs(n16 - (this.t.x[n19] - this.m.x)) < this.t.radx[n19] &&
            Math.abs(n17 - (this.t.z[n19] - this.m.z)) < this.t.radz[n19] &&
            (!this.t.decor[n19] || this.m.resdown !== 2)) {
          ++n20;
        }
        if (n20 !== 0) {
          for (let n21 = 0; n21 < this.n; ++n21) {
            array3[n21] = this.t.y[n19] - this.m.y;
            if (this.t.zy[n19] !== 0) {
              array3[n21] = trunc(array3[n21] +
                (array2[n21] - (this.t.z[n19] - this.m.z - this.t.radz[n19])) * this.m.sin(this.t.zy[n19]) / this.m.sin(90 - this.t.zy[n19]) -
                this.t.radz[n19] * this.m.sin(this.t.zy[n19]) / this.m.sin(90 - this.t.zy[n19]));
            }
            if (this.t.xy[n19] !== 0) {
              array3[n21] = trunc(array3[n21] +
                (array[n21] - (this.t.x[n19] - this.m.x - this.t.radx[n19])) * this.m.sin(this.t.xy[n19]) / this.m.sin(90 - this.t.xy[n19]) -
                this.t.radx[n19] * this.m.sin(this.t.xy[n19]) / this.m.sin(90 - this.t.xy[n19]));
            }
          }
          r = trunc(fr(fr(this.t.c[n19][0]) / 1.5));
          g = trunc(fr(fr(this.t.c[n19][1]) / 1.5));
          b = trunc(fr(fr(this.t.c[n19][2]) / 1.5));
          break;
        }
      }
    }
    let n24 = 1;
    const array6 = intArray(this.n);
    const array7 = intArray(this.n);
    if (n7 === 2) {
      r = 87;
      g = 85;
      b = 57;
    } else {
      for (let n25 = 0; n25 < this.m.nsp; ++n25) {
        for (let n26 = 0; n26 < this.n; ++n26) {
          if (Math.abs(array[n26] - this.m.spx[n25]) < this.m.sprad[n25] &&
              Math.abs(array2[n26] - this.m.spz[n25]) < this.m.sprad[n25]) {
            n24 = 0;
          }
        }
      }
    }
    if (n24 !== 0) {
      this.rot(array, array2, this.m.cx, this.m.cz, this.m.xz, this.n);
      this.rot(array3, array2, this.m.cy, this.m.cz, this.m.zy, this.n);
      let n27 = 0;
      let n28 = 0;
      let n29 = 0;
      let n30 = 0;
      for (let n31 = 0; n31 < this.n; ++n31) {
        array6[n31] = this.xs(array[n31], array2[n31]);
        array7[n31] = this.ys(array3[n31], array2[n31]);
        if (array7[n31] < this.m.ih || array2[n31] < 10) ++n27;
        if (array7[n31] > this.m.h || array2[n31] < 10) ++n28;
        if (array6[n31] < this.m.iw || array2[n31] < 10) ++n29;
        if (array6[n31] > this.m.w || array2[n31] < 10) ++n30;
      }
      if (n29 === this.n || n27 === this.n || n28 === this.n || n30 === this.n) n24 = 0;
    }
    if (n24 !== 0) {
      for (let n32 = 0; n32 < 16; ++n32) {
        if (this.av > this.m.fade[n32]) {
          r = idiv(r * this.m.fogd + this.m.cfade[0], this.m.fogd + 1);
          g = idiv(g * this.m.fogd + this.m.cfade[1], this.m.fogd + 1);
          b = idiv(b * this.m.fogd + this.m.cfade[2], this.m.fogd + 1);
        }
      }
      graphics2D.setColor(r, g, b);
      graphics2D.fillPolygon(array6, array7, this.n);
    }
  }

  /** Perspective-project x. All-int in Java; the product can exceed 2^31. */
  xs(n, cz) {
    if (cz < this.m.cz) cz = this.m.cz;
    return idiv(Math.imul(cz - this.m.focus_point, this.m.cx - n), cz) + n;
  }

  /** Perspective-project y. */
  ys(n, cz) {
    if (cz < this.m.cz) cz = this.m.cz;
    return idiv(Math.imul(cz - this.m.focus_point, this.m.cy - n), cz) + n;
  }

  /**
   * Rotate a point set about (n, n2) by n3 degrees, in place.
   * m.cos/m.sin return float, so each product and the difference are rounded
   * to float32 before the (int) cast — matching Java exactly matters here
   * because this runs on every vertex of every frame.
   */
  rot(array, array2, n, n2, n3, n4) {
    if (n3 !== 0) {
      const cos = this.m.cos(n3);
      const sin = this.m.sin(n3);
      for (let i = 0; i < n4; ++i) {
        const n5 = array[i];
        const n6 = array2[i];
        array[i] = n + trunc(fr(fr((n5 - n) * cos) - fr((n6 - n2) * sin)));
        array2[i] = n2 + trunc(fr(fr((n5 - n) * sin) + fr((n6 - n2) * cos)));
      }
    }
  }

  spy(n, n2) {
    return trunc(Math.sqrt(Math.imul(n - this.m.cx, n - this.m.cx) + Math.imul(n2, n2)));
  }
}

// java.awt.Color helpers used at the call sites above.

function setHSB(g, h, s, b) {
  const rgb = HSBtoRGB(h, s, b);
  g.setColor((rgb >> 16) & 255, (rgb >> 8) & 255, rgb & 255);
}

const FACTOR = 0.7;

/** java.awt.Color.darker() */
function setDarker(g, r, gg, b) {
  g.setColor(Math.max(trunc(r * FACTOR), 0), Math.max(trunc(gg * FACTOR), 0), Math.max(trunc(b * FACTOR), 0));
}

/** java.awt.Color.brighter() — note the JDK's special case for near-black. */
function setBrighter(g, r, gg, b) {
  const i = trunc(1.0 / (1.0 - FACTOR));
  if (r === 0 && gg === 0 && b === 0) {
    g.setColor(i, i, i);
    return;
  }
  if (r > 0 && r < i) r = i;
  if (gg > 0 && gg < i) gg = i;
  if (b > 0 && b < i) b = i;
  g.setColor(Math.min(trunc(r / FACTOR), 255), Math.min(trunc(gg / FACTOR), 255), Math.min(trunc(b / FACTOR), 255));
}
