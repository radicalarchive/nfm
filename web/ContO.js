// Transpiled from java-src/ContO.java, line by line.
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
//   Math.imul    int multiplies that can exceed 2^31
//   i32(x)       wrap after int additions/subtractions that can exceed 2^31
//
// PAINTER'S ALGORITHM: polygons and sub-components are rendered strictly in
// submission order. Never reorder, batch, or hoist draw calls.

import { idiv, trunc, fr, i32, intArray, floatArray, objArray, RGBtoHSB, HSBtoRGB, JavaRandom } from './java.js';
import { Plane } from './Plane.js';
import { Wheels } from './Wheels.js';
import { readLines } from './vfs.js';

/** Nested int[a][b]. */
function int2(a, b) {
  const o = objArray(a);
  for (let i = 0; i < a; i++) o[i] = intArray(b);
  return o;
}

/** Nested float[a][b]. */
function float2(a, b) {
  const o = objArray(a);
  for (let i = 0; i < a; i++) o[i] = floatArray(b);
  return o;
}

export class ContO {
  constructor(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
    this.npl = 0;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.xz = 0;
    this.xy = 0;
    this.zy = 0;
    this.wxz = 0;
    this.wzy = 0;
    this.dist = 0;
    this.maxR = 0;
    this.disp = 0;
    this.disline = 14;
    this.shadow = false;
    this.noline = false;
    this.decor = false;
    this.grounded = 1.0;
    this.grat = 0;
    this.keyx = intArray(4);
    this.keyz = intArray(4);
    this.sprkat = 0;
    this.txy = null;
    this.tzy = null;
    this.tc = null;
    this.tradx = null;
    this.tradz = null;
    this.trady = null;
    this.tx = null;
    this.ty = null;
    this.tz = null;
    this.skd = null;
    this.dam = null;
    this.notwall = null;
    this.tnt = 0;
    this.stg = null;
    this.sx = null;
    this.sy = null;
    this.sz = null;
    this.scx = null;
    this.scz = null;
    this.osmag = null;
    this.sav = null;
    this.smag = null;
    this.srgb = null;
    this.sbln = null;
    this.ust = 0;
    this.srx = 0;
    this.sry = 0;
    this.srz = 0;
    this.rcx = 0.0;
    this.rcy = 0.0;
    this.rcz = 0.0;
    this.sprk_ = 0; // Renamed to avoid collision with method sprk()
    this.rtg = null;
    this.rbef = null;
    this.rx = null;
    this.ry = null;
    this.rz = null;
    this.vrx = null;
    this.vry = null;
    this.vrz = null;
    this.elec = false;
    this.roted = false;
    this.edl = intArray(4);
    this.edr = intArray(4);
    this.elc = Int32Array.from([0, 0, 0, 0]);
    this.fix = false;
    this.fcnt = 0;
    this.checkpoint = 0;
    this.fcol = Int32Array.from([0, 0, 0]);
    this.scol = Int32Array.from([0, 0, 0]);
    this.colok = 0;
    this.errd = false;
    this.err = '';
    this.roofat = 0;
    this.wh = 0;

    if (arg1 instanceof ContO) {
      this.#initCopy(arg1, arg2, arg3, arg4, arg5);
    } else if (typeof arg1 === 'number') {
      this.#initModel(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
    } else if (arg1) {
      this.#initBuf(arg1, arg2, arg3);
    }
  }

  #initBuf(buf, m, t) {
    this.m = m;
    this.t = t;
    this.p = objArray(286);
    const array = intArray(286);
    for (let i = 0; i < 286; ++i) {
      array[i] = 0;
    }
    if (this.m.loadnew) {
      for (let j = 0; j < 4; ++j) {
        this.keyz[j] = 0;
      }
      this.shadow = true;
    }
    let string = '';
    let n = 0;
    let n2 = 0;
    let n3 = 0;
    let n4 = 1.0;
    let n5 = 1.0;
    const array2 = floatArray([1.0, 1.0, 1.0]);
    const array3 = intArray(100);
    const array4 = intArray(100);
    const array5 = intArray(100);
    const array6 = intArray([0, 0, 0]);
    let b = false;
    const wheels = new Wheels();
    let b2 = false;
    let n6 = 0;
    let getvalue = 1;
    let getvalue2 = 0;
    let getvalue3 = 0;
    let n7 = 0;
    let n8 = 0;
    let b3 = false;
    let n9 = 0;
    try {
      const text = typeof buf === 'string' ? buf : new TextDecoder('latin1').decode(buf);
      const lines = readLines(text);
      for (const line of lines) {
        string = '' + line.trim();
        if (this.npl < 210) {
          if (string.startsWith('<p>')) {
            n = 1;
            n3 = 0;
            getvalue = 0;
            getvalue2 = 0;
            n7 = 0;
            array[this.npl] = 1;
            if (n9 === 0) {
              b3 = false;
            }
          }
          if (n !== 0) {
            if (string.startsWith('gr(')) {
              getvalue = this.getvalue('gr', string, 0);
            }
            if (string.startsWith('fs(')) {
              getvalue2 = this.getvalue('fs', string, 0);
              array[this.npl] = 2;
            }
            if (string.startsWith('c(')) {
              n8 = 0;
              array6[0] = this.getvalue('c', string, 0);
              array6[1] = this.getvalue('c', string, 1);
              array6[2] = this.getvalue('c', string, 2);
            }
            if (string.startsWith('glass')) {
              n8 = 1;
            }
            if (string.startsWith('gshadow')) {
              n8 = 2;
            }
            if (string.startsWith('lightF')) {
              n7 = 1;
            }
            if (string.startsWith('light')) {
              n7 = 1;
            }
            if (string.startsWith('lightB')) {
              n7 = 2;
            }
            if (string.startsWith('noOutline')) {
              b3 = true;
            }
            if (string.startsWith('p(')) {
              array3[n3] = trunc(fr(fr(this.getvalue('p', string, 0) * n4) * n5 * array2[0]));
              array4[n3] = trunc(fr(this.getvalue('p', string, 1) * n4) * array2[1]);
              array5[n3] = trunc(fr(this.getvalue('p', string, 2) * n4) * array2[2]);
              const maxR = trunc(Math.sqrt(array3[n3] * array3[n3] + array4[n3] * array4[n3] + array5[n3] * array5[n3]));
              if (maxR > this.maxR) {
                this.maxR = maxR;
              }
              ++n3;
            }
          }
          if (string.startsWith('</p>')) {
            this.p[this.npl] = new Plane(this.m, this.t, array3, array5, array4, n3, array6, n8, getvalue, getvalue2, 0, 0, 0, this.disline, 0, b, n7, b3);
            if (array6[0] === this.fcol[0] && array6[1] === this.fcol[1] && array6[2] === this.fcol[2] && n8 === 0) {
              this.p[this.npl].colnum = 1;
            }
            if (array6[0] === this.scol[0] && array6[1] === this.scol[1] && array6[2] === this.scol[2] && n8 === 0) {
              this.p[this.npl].colnum = 2;
            }
            ++this.npl;
            n = 0;
          }
        }
        if (string.startsWith('rims(')) {
          wheels.setrims(this.getvalue('rims', string, 0), this.getvalue('rims', string, 1), this.getvalue('rims', string, 2), this.getvalue('rims', string, 3), this.getvalue('rims', string, 4));
        }
        if (string.startsWith('w(') && n6 < 4) {
          this.keyx[n6] = trunc(fr(this.getvalue('w', string, 0) * n4) * array2[0]);
          this.keyz[n6] = trunc(fr(this.getvalue('w', string, 2) * n4) * array2[2]);
          wheels.make(this.m, this.t, this.p, this.npl, trunc(fr(fr(this.getvalue('w', string, 0) * n4) * n5 * array2[0])), trunc(fr(this.getvalue('w', string, 1) * n4) * array2[1]), trunc(fr(this.getvalue('w', string, 2) * n4) * array2[2]), this.getvalue('w', string, 3), trunc(fr(fr(this.getvalue('w', string, 4) * n4) * n5)), trunc(this.getvalue('w', string, 5) * n4), getvalue3);
          this.npl += 19;
          if (this.m.loadnew) {
            // Bytecode showed f2i before iadd (Case B explicit cast): this.wh += (int)(this.getvalue("w", string, 5) * n4)
            this.wh += trunc(this.getvalue('w', string, 5) * n4);
            if (wheels.ground > 140) {
              let s = 'FRONT';
              if (this.keyz[n6] < 0) {
                s = 'BACK';
              }
              this.err = 'Wheels Error:\n' + s + ' Wheels floor is too far below the center of Y Axis of the car!    \n\nPlease decrease the Y value of the ' + s + ' Wheels or decrease its height.     \n \n';
              this.errd = true;
              this.keyz[n6] = 0;
              this.keyx[n6] = 0;
            }
            if (wheels.ground < -100) {
              let s2 = 'FRONT';
              if (this.keyz[n6] < 0) {
                s2 = 'BACK';
              }
              this.err = 'Wheels Error:\n' + s2 + ' Wheels floor is too far above the center of Y Axis of the car!    \n\nPlease increase the Y value of the ' + s2 + ' Wheels or increase its height.     \n \n';
              this.errd = true;
              this.keyz[n6] = 0;
              this.keyx[n6] = 0;
            }
            if (Math.abs(this.keyx[n6]) > 400) {
              let s3 = 'FRONT';
              if (this.keyz[n6] < 0) {
                s3 = 'BACK';
              }
              this.err = 'Wheels Error:\n' + s3 + ' Wheels are too far apart!    \n\nPlease decrease the ±X value of the ' + s3 + ' Wheels.     \n \n';
              this.errd = true;
              this.keyz[n6] = 0;
              this.keyx[n6] = 0;
            }
            if (Math.abs(this.keyz[n6]) > 700) {
              if (this.keyz[n6] < 0) {
                this.err = 'Wheels Error:\nBACK Wheels are too far backwards from the center of the Z Axis!    \n\nPlease increase the -Z value of the BACK Wheels.     \n \n';
              } else {
                this.err = 'Wheels Error:\nFRONT Wheels are too far forwards from the center of the Z Axis!    \n\nPlease decrease the +Z value of the FRONT Wheels.     \n \n';
              }
              this.errd = true;
              this.keyz[n6] = 0;
              this.keyx[n6] = 0;
            }
            if (trunc(fr(fr(this.getvalue('w', string, 4) * n4) * n5)) > 300) {
              let s4 = 'FRONT';
              if (this.keyz[n6] < 0) {
                s4 = 'BACK';
              }
              this.err = 'Wheels Error:\nWidth of the ' + s4 + ' Wheels is too large!    \n\nPlease decrease the width of the ' + s4 + ' Wheels.     \n \n';
              this.errd = true;
              this.keyz[n6] = 0;
              this.keyx[n6] = 0;
            }
          }
          ++n6;
        }
        if (string.startsWith('tracks')) {
          const getvalue4 = this.getvalue('tracks', string, 0);
          this.txy = intArray(getvalue4);
          this.tzy = intArray(getvalue4);
          this.tc = int2(getvalue4, 3);
          this.tradx = intArray(getvalue4);
          this.tradz = intArray(getvalue4);
          this.trady = intArray(getvalue4);
          this.tx = intArray(getvalue4);
          this.ty = intArray(getvalue4);
          this.tz = intArray(getvalue4);
          this.skd = intArray(getvalue4);
          this.dam = intArray(getvalue4);
          this.notwall = new Array(getvalue4).fill(false);
          b2 = true;
        }
        if (b2) {
          if (string.startsWith('<track>')) {
            n2 = 1;
            this.notwall[this.tnt] = false;
            this.dam[this.tnt] = 1;
            this.skd[this.tnt] = 0;
            this.ty[this.tnt] = 0;
            this.tx[this.tnt] = 0;
            this.tz[this.tnt] = 0;
            this.txy[this.tnt] = 0;
            this.tzy[this.tnt] = 0;
            this.trady[this.tnt] = 0;
            this.tradx[this.tnt] = 0;
            this.tradz[this.tnt] = 0;
            this.tc[this.tnt][0] = 0;
            this.tc[this.tnt][1] = 0;
            this.tc[this.tnt][2] = 0;
          }
          if (n2 !== 0) {
            if (string.startsWith('c')) {
              this.tc[this.tnt][0] = this.getvalue('c', string, 0);
              this.tc[this.tnt][1] = this.getvalue('c', string, 1);
              this.tc[this.tnt][2] = this.getvalue('c', string, 2);
            }
            if (string.startsWith('xy')) {
              this.txy[this.tnt] = this.getvalue('xy', string, 0);
            }
            if (string.startsWith('zy')) {
              this.tzy[this.tnt] = this.getvalue('zy', string, 0);
            }
            if (string.startsWith('radx')) {
              this.tradx[this.tnt] = trunc(this.getvalue('radx', string, 0) * n4);
            }
            if (string.startsWith('rady')) {
              this.trady[this.tnt] = trunc(this.getvalue('rady', string, 0) * n4);
            }
            if (string.startsWith('radz')) {
              this.tradz[this.tnt] = trunc(this.getvalue('radz', string, 0) * n4);
            }
            if (string.startsWith('ty')) {
              this.ty[this.tnt] = trunc(this.getvalue('ty', string, 0) * n4);
            }
            if (string.startsWith('tx')) {
              this.tx[this.tnt] = trunc(this.getvalue('tx', string, 0) * n4);
            }
            if (string.startsWith('tz')) {
              this.tz[this.tnt] = trunc(this.getvalue('tz', string, 0) * n4);
            }
            if (string.startsWith('skid')) {
              this.skd[this.tnt] = this.getvalue('skid', string, 0);
            }
            if (string.startsWith('dam')) {
              this.dam[this.tnt] = 3;
            }
            if (string.startsWith('notwall')) {
              this.notwall[this.tnt] = true;
            }
          }
          if (string.startsWith('</track>')) {
            n2 = 0;
            ++this.tnt;
          }
        }
        if (string.startsWith('disp(')) {
          this.disp = this.getvalue('disp', string, 0);
        }
        if (string.startsWith('disline(')) {
          this.disline = this.getvalue('disline', string, 0) * 2;
        }
        if (string.startsWith('shadow')) {
          this.shadow = true;
        }
        if (string.startsWith('stonecold')) {
          this.noline = true;
        }
        if (string.startsWith('newstone')) {
          this.noline = true;
          b3 = true;
          n9 = 1;
        }
        if (string.startsWith('decorative')) {
          this.decor = true;
        }
        if (string.startsWith('road')) {
          b = true;
        }
        if (string.startsWith('notroad')) {
          b = false;
        }
        if (string.startsWith('grounded(')) {
          this.grounded = fr(this.getvalue('grounded', string, 0) / 100.0);
        }
        if (string.startsWith('div(')) {
          n4 = fr(this.getvalue('div', string, 0) / 10.0);
        }
        if (string.startsWith('idiv(')) {
          n4 = fr(this.getvalue('idiv', string, 0) / 100.0);
        }
        if (string.startsWith('iwid(')) {
          n5 = fr(this.getvalue('iwid', string, 0) / 100.0);
        }
        if (string.startsWith('ScaleX(')) {
          array2[0] = fr(this.getvalue('ScaleX', string, 0) / 100.0);
        }
        if (string.startsWith('ScaleY(')) {
          array2[1] = fr(this.getvalue('ScaleY', string, 0) / 100.0);
        }
        if (string.startsWith('ScaleZ(')) {
          array2[2] = fr(this.getvalue('ScaleZ', string, 0) / 100.0);
        }
        if (string.startsWith('gwgr(')) {
          getvalue3 = this.getvalue('gwgr', string, 0);
          if (this.m.loadnew) {
            if (getvalue3 > 40) {
              getvalue3 = 40;
            }
            if (getvalue3 < 0 && getvalue3 >= -15) {
              getvalue3 = -16;
            }
            if (getvalue3 < -40) {
              getvalue3 = -40;
            }
          }
        }
        if (string.startsWith('1stColor(')) {
          this.fcol[0] = this.getvalue('1stColor', string, 0);
          this.fcol[1] = this.getvalue('1stColor', string, 1);
          this.fcol[2] = this.getvalue('1stColor', string, 2);
          ++this.colok;
        }
        if (string.startsWith('2ndColor(')) {
          this.scol[0] = this.getvalue('2ndColor', string, 0);
          this.scol[1] = this.getvalue('2ndColor', string, 1);
          this.scol[2] = this.getvalue('2ndColor', string, 2);
          ++this.colok;
        }
      }
    } catch (obj) {
      if (!this.errd) {
        this.err = 'Error While Loading 3D Model\n\nLine:     ' + string + '\n\nError Detail:\n' + obj + '           \n \n';
        this.errd = true;
      }
    }
    this.grat = wheels.ground;
    this.sprkat = wheels.sparkat;
    if (this.shadow) {
      this.stg = intArray(20);
      this.rtg = intArray(100);
      for (let k = 0; k < 20; ++k) {
        this.stg[k] = 0;
      }
      for (let l = 0; l < 100; ++l) {
        this.rtg[l] = 0;
      }
    }
    if (this.m.loadnew) {
      if (n6 !== 0) {
        this.wh = idiv(this.wh, n6);
      }
      let n10 = 0;
      for (let n11 = 0; n11 < this.npl; ++n11) {
        let n12 = 0;
        let n13 = this.p[n11].ox[0];
        let n14 = this.p[n11].ox[0];
        let n15 = this.p[n11].oy[0];
        let n16 = this.p[n11].oy[0];
        let n17 = this.p[n11].oz[0];
        let n18 = this.p[n11].oz[0];
        for (let n19 = 0; n19 < this.p[n11].n; ++n19) {
          if (this.p[n11].ox[n19] > n13) {
            n13 = this.p[n11].ox[n19];
          }
          if (this.p[n11].ox[n19] < n14) {
            n14 = this.p[n11].ox[n19];
          }
          if (this.p[n11].oy[n19] > n15) {
            n15 = this.p[n11].oy[n19];
          }
          if (this.p[n11].oy[n19] < n16) {
            n16 = this.p[n11].oy[n19];
          }
          if (this.p[n11].oz[n19] > n17) {
            n17 = this.p[n11].oz[n19];
          }
          if (this.p[n11].oz[n19] < n18) {
            n18 = this.p[n11].oz[n19];
          }
        }
        if (Math.abs(n13 - n14) <= Math.abs(n15 - n16) && Math.abs(n13 - n14) <= Math.abs(n17 - n18)) {
          n12 = 1;
        }
        if (Math.abs(n15 - n16) <= Math.abs(n13 - n14) && Math.abs(n15 - n16) <= Math.abs(n17 - n18)) {
          n12 = 2;
        }
        if (Math.abs(n17 - n18) <= Math.abs(n13 - n14) && Math.abs(n17 - n18) <= Math.abs(n15 - n16)) {
          n12 = 3;
        }
        if (n12 === 2 && (n10 === 0 || idiv(n15 + n16, 2) < this.roofat)) {
          this.roofat = idiv(n15 + n16, 2);
          n10 = 1;
        }
        if (array[n11] === 1) {
          let n20 = 1000;
          let n21 = 0;
          for (let n22 = 0; n22 < this.p[n11].n; ++n22) {
            let n23 = n22 + 1;
            if (n23 >= this.p[n11].n) {
              n23 -= this.p[n11].n;
            }
            let n24 = n22 + 2;
            if (n24 >= this.p[n11].n) {
              n24 -= this.p[n11].n;
            }
            if (n12 === 1) {
              let abs = Math.abs(trunc(Math.atan((this.p[n11].oz[n22] - this.p[n11].oz[n23]) / (this.p[n11].oy[n22] - this.p[n11].oy[n23])) / 0.017453292519943295));
              let abs2 = Math.abs(trunc(Math.atan((this.p[n11].oz[n24] - this.p[n11].oz[n23]) / (this.p[n11].oy[n24] - this.p[n11].oy[n23])) / 0.017453292519943295));
              if (abs > 45) {
                abs = 90 - abs;
              } else {
                abs2 = 90 - abs2;
              }
              if (abs + abs2 < n20) {
                n20 = abs + abs2;
                n21 = n22;
              }
            }
            if (n12 === 2) {
              let abs3 = Math.abs(trunc(Math.atan((this.p[n11].oz[n22] - this.p[n11].oz[n23]) / (this.p[n11].ox[n22] - this.p[n11].ox[n23])) / 0.017453292519943295));
              let abs4 = Math.abs(trunc(Math.atan((this.p[n11].oz[n24] - this.p[n11].oz[n23]) / (this.p[n11].ox[n24] - this.p[n11].ox[n23])) / 0.017453292519943295));
              if (abs3 > 45) {
                abs3 = 90 - abs3;
              } else {
                abs4 = 90 - abs4;
              }
              if (abs3 + abs4 < n20) {
                n20 = abs3 + abs4;
                n21 = n22;
              }
            }
            if (n12 === 3) {
              let abs5 = Math.abs(trunc(Math.atan((this.p[n11].oy[n22] - this.p[n11].oy[n23]) / (this.p[n11].ox[n22] - this.p[n11].ox[n23])) / 0.017453292519943295));
              let abs6 = Math.abs(trunc(Math.atan((this.p[n11].oy[n24] - this.p[n11].oy[n23]) / (this.p[n11].ox[n24] - this.p[n11].ox[n23])) / 0.017453292519943295));
              if (abs5 > 45) {
                abs5 = 90 - abs5;
              } else {
                abs6 = 90 - abs6;
              }
              if (abs5 + abs6 < n20) {
                n20 = abs5 + abs6;
                n21 = n22;
              }
            }
          }
          if (n21 !== 0) {
            const array7 = intArray(this.p[n11].n);
            const array8 = intArray(this.p[n11].n);
            const array9 = intArray(this.p[n11].n);
            for (let n25 = 0; n25 < this.p[n11].n; ++n25) {
              array7[n25] = this.p[n11].ox[n25];
              array8[n25] = this.p[n11].oy[n25];
              array9[n25] = this.p[n11].oz[n25];
            }
            for (let n26 = 0; n26 < this.p[n11].n; ++n26) {
              let n27 = n26 + n21;
              if (n27 >= this.p[n11].n) {
                n27 -= this.p[n11].n;
              }
              this.p[n11].ox[n26] = array7[n27];
              this.p[n11].oy[n26] = array8[n27];
              this.p[n11].oz[n26] = array9[n27];
            }
          }
          if (n12 === 1) {
            if (Math.abs(this.p[n11].oz[0] - this.p[n11].oz[1]) > Math.abs(this.p[n11].oy[0] - this.p[n11].oy[1])) {
              if (this.p[n11].oz[0] > this.p[n11].oz[1]) {
                if (this.p[n11].oy[1] > this.p[n11].oy[2]) {
                  this.p[n11].fs = 1;
                } else {
                  this.p[n11].fs = -1;
                }
              } else if (this.p[n11].oy[1] > this.p[n11].oy[2]) {
                this.p[n11].fs = -1;
              } else {
                this.p[n11].fs = 1;
              }
            } else if (this.p[n11].oy[0] > this.p[n11].oy[1]) {
              if (this.p[n11].oz[1] > this.p[n11].oz[2]) {
                this.p[n11].fs = -1;
              } else {
                this.p[n11].fs = 1;
              }
            } else if (this.p[n11].oz[1] > this.p[n11].oz[2]) {
              this.p[n11].fs = 1;
            } else {
              this.p[n11].fs = -1;
            }
          }
          if (n12 === 2) {
            if (Math.abs(this.p[n11].oz[0] - this.p[n11].oz[1]) > Math.abs(this.p[n11].ox[0] - this.p[n11].ox[1])) {
              if (this.p[n11].oz[0] > this.p[n11].oz[1]) {
                if (this.p[n11].ox[1] > this.p[n11].ox[2]) {
                  this.p[n11].fs = -1;
                } else {
                  this.p[n11].fs = 1;
                }
              } else if (this.p[n11].ox[1] > this.p[n11].ox[2]) {
                this.p[n11].fs = 1;
              } else {
                this.p[n11].fs = -1;
              }
            } else if (this.p[n11].ox[0] > this.p[n11].ox[1]) {
              if (this.p[n11].oz[1] > this.p[n11].oz[2]) {
                this.p[n11].fs = 1;
              } else {
                this.p[n11].fs = -1;
              }
            } else if (this.p[n11].oz[1] > this.p[n11].oz[2]) {
              this.p[n11].fs = -1;
            } else {
              this.p[n11].fs = 1;
            }
          }
          if (n12 === 3) {
            if (Math.abs(this.p[n11].oy[0] - this.p[n11].oy[1]) > Math.abs(this.p[n11].ox[0] - this.p[n11].ox[1])) {
              if (this.p[n11].oy[0] > this.p[n11].oy[1]) {
                if (this.p[n11].ox[1] > this.p[n11].ox[2]) {
                  this.p[n11].fs = 1;
                } else {
                  this.p[n11].fs = -1;
                }
              } else if (this.p[n11].ox[1] > this.p[n11].ox[2]) {
                this.p[n11].fs = -1;
              } else {
                this.p[n11].fs = 1;
              }
            } else if (this.p[n11].ox[0] > this.p[n11].ox[1]) {
              if (this.p[n11].oy[1] > this.p[n11].oy[2]) {
                this.p[n11].fs = -1;
              } else {
                this.p[n11].fs = 1;
              }
            } else if (this.p[n11].oy[1] > this.p[n11].oy[2]) {
              this.p[n11].fs = 1;
            } else {
              this.p[n11].fs = -1;
            }
          }
          let b4 = false;
          let b5 = false;
          for (let n28 = 0; n28 < this.npl; ++n28) {
            if (n28 !== n11 && array[n28] !== 0) {
              let n29 = this.p[n28].ox[0];
              let n30 = this.p[n28].ox[0];
              let n31 = this.p[n28].oy[0];
              let n32 = this.p[n28].oy[0];
              let n33 = this.p[n28].oz[0];
              let n34 = this.p[n28].oz[0];
              for (let n35 = 0; n35 < this.p[n28].n; ++n35) {
                if (this.p[n28].ox[n35] > n29) {
                  n29 = this.p[n28].ox[n35];
                }
                if (this.p[n28].ox[n35] < n30) {
                  n30 = this.p[n28].ox[n35];
                }
                if (this.p[n28].oy[n35] > n31) {
                  n31 = this.p[n28].oy[n35];
                }
                if (this.p[n28].oy[n35] < n32) {
                  n32 = this.p[n28].oy[n35];
                }
                if (this.p[n28].oz[n35] > n33) {
                  n33 = this.p[n28].oz[n35];
                }
                if (this.p[n28].oz[n35] < n34) {
                  n34 = this.p[n28].oz[n35];
                }
              }
              const n36 = idiv(n29 + n30, 2);
              const n37 = idiv(n31 + n32, 2);
              const n38 = idiv(n33 + n34, 2);
              const n39 = idiv(n13 + n14, 2);
              const n40 = idiv(n15 + n16, 2);
              const n41 = idiv(n17 + n18, 2);
              if (n12 === 1 && ((n37 <= n15 && n37 >= n16 && n38 <= n17 && n38 >= n18) || (n40 <= n31 && n40 >= n32 && n41 <= n33 && n41 >= n34))) {
                if (n29 < n14) {
                  b4 = true;
                }
                if (n30 > n13) {
                  b5 = true;
                }
              }
              if (n12 === 2 && ((n36 <= n13 && n36 >= n14 && n38 <= n17 && n38 >= n18) || (n39 <= n29 && n39 >= n30 && n41 <= n33 && n41 >= n34))) {
                if (n31 < n16) {
                  b4 = true;
                }
                if (n32 > n15) {
                  b5 = true;
                }
              }
              if (n12 === 3 && ((n36 <= n13 && n36 >= n14 && n37 <= n15 && n37 >= n16) || (n39 <= n29 && n39 >= n30 && n40 <= n31 && n40 >= n32))) {
                if (n33 < n18) {
                  b4 = true;
                }
                if (n34 > n17) {
                  b5 = true;
                }
              }
            }
            if (b4 && b5) {
              break;
            }
          }
          let b6 = false;
          if (b4 && !b5) {
            b6 = true;
          }
          if (b5 && !b4) {
            const plane = this.p[n11];
            plane.fs *= -1;
            b6 = true;
          }
          if (b4 && b5) {
            this.p[n11].fs = 0;
            this.p[n11].gr = 40;
            b6 = true;
          }
          if (!b6) {
            let n42 = 0;
            let n43 = 0;
            if (n12 === 1) {
              n42 = (n43 = idiv(n13 + n14, 2));
            }
            if (n12 === 2) {
              n42 = (n43 = idiv(n15 + n16, 2));
            }
            if (n12 === 3) {
              n42 = (n43 = idiv(n17 + n18, 2));
            }
            for (let n44 = 0; n44 < this.npl; ++n44) {
              if (n44 !== n11) {
                let b7 = false;
                const array10 = new Array(this.p[n44].n).fill(false);
                for (let n45 = 0; n45 < this.p[n44].n; ++n45) {
                  array10[n45] = false;
                  for (let n46 = 0; n46 < this.p[n11].n; ++n46) {
                    if (this.p[n11].ox[n46] === this.p[n44].ox[n45] && this.p[n11].oy[n46] === this.p[n44].oy[n45] && this.p[n11].oz[n46] === this.p[n44].oz[n45]) {
                      array10[n45] = true;
                      b7 = true;
                    }
                  }
                }
                if (b7) {
                  for (let n47 = 0; n47 < this.p[n44].n; ++n47) {
                    if (!array10[n47]) {
                      if (n12 === 1) {
                        if (this.p[n44].ox[n47] > n42) {
                          n42 = this.p[n44].ox[n47];
                        }
                        if (this.p[n44].ox[n47] < n43) {
                          n43 = this.p[n44].ox[n47];
                        }
                      }
                      if (n12 === 2) {
                        if (this.p[n44].oy[n47] > n42) {
                          n42 = this.p[n44].oy[n47];
                        }
                        if (this.p[n44].oy[n47] < n43) {
                          n43 = this.p[n44].oy[n47];
                        }
                      }
                      if (n12 === 3) {
                        if (this.p[n44].oz[n47] > n42) {
                          n42 = this.p[n44].oz[n47];
                        }
                        if (this.p[n44].oz[n47] < n43) {
                          n43 = this.p[n44].oz[n47];
                        }
                      }
                    }
                  }
                }
              }
            }
            if (n12 === 1) {
              if (idiv(n42 + n43, 2) > idiv(n13 + n14, 2)) {
                const plane2 = this.p[n11];
                plane2.fs *= -1;
              } else if (idiv(n42 + n43, 2) === idiv(n13 + n14, 2) && idiv(n13 + n14, 2) < 0) {
                const plane3 = this.p[n11];
                plane3.fs *= -1;
              }
            }
            if (n12 === 2) {
              if (idiv(n42 + n43, 2) > idiv(n15 + n16, 2)) {
                const plane4 = this.p[n11];
                plane4.fs *= -1;
              } else if (idiv(n42 + n43, 2) === idiv(n15 + n16, 2) && idiv(n15 + n16, 2) < 0) {
                const plane5 = this.p[n11];
                plane5.fs *= -1;
              }
            }
            if (n12 === 3) {
              if (idiv(n42 + n43, 2) > idiv(n17 + n18, 2)) {
                const plane6 = this.p[n11];
                plane6.fs *= -1;
              } else if (idiv(n42 + n43, 2) === idiv(n17 + n18, 2) && idiv(n17 + n18, 2) < 0) {
                const plane7 = this.p[n11];
                plane7.fs *= -1;
              }
            }
          }
          this.p[n11].deltafntyp();
        }
      }
    }
  }

  #initCopy(contO, x, y, z, a) {
    this.m = contO.m;
    this.t = contO.t;
    // Not game state: the launcher's minimap needs to tell a ground tile from
    // a track piece, and the base model index is the only thing that does.
    // loadbase tags the base models; instances inherit the tag.
    this.baseIndex = contO.baseIndex;
    this.npl = contO.npl;
    this.maxR = contO.maxR;
    this.disp = contO.disp;
    this.disline = contO.disline;
    this.noline = contO.noline;
    this.shadow = contO.shadow;
    this.grounded = contO.grounded;
    this.decor = contO.decor;
    if (this.m.loadnew && (a === 90 || a === -90)) {
      this.grounded = fr(this.grounded + 10000.0);
    }
    this.grat = contO.grat;
    this.sprkat = contO.sprkat;
    this.p = objArray(contO.npl);
    for (let i = 0; i < this.npl; ++i) {
      if (contO.p[i].master === 1) {
        contO.p[i].n = 20;
      }
      this.p[i] = new Plane(this.m, this.t, contO.p[i].ox, contO.p[i].oz, contO.p[i].oy, contO.p[i].n, contO.p[i].oc, contO.p[i].glass, contO.p[i].gr, contO.p[i].fs, contO.p[i].wx, contO.p[i].wy, contO.p[i].wz, contO.disline, contO.p[i].bfase, contO.p[i].road, contO.p[i].light, contO.p[i].solo);
    }
    this.x = x;
    this.y = y;
    this.z = z;
    this.xz = 0;
    this.xy = 0;
    this.zy = 0;
    for (let j = 0; j < this.npl; ++j) {
      this.p[j].colnum = contO.p[j].colnum;
      this.p[j].master = contO.p[j].master;
      this.p[j].rot(this.p[j].ox, this.p[j].oz, 0, 0, a, this.p[j].n);
      this.p[j].loadprojf();
    }
    if (contO.tnt !== 0) {
      for (let k = 0; k < contO.tnt; ++k) {
        this.t.xy[this.t.nt] = trunc(fr(fr(contO.txy[k] * this.m.cos(a)) - fr(contO.tzy[k] * this.m.sin(a))));
        this.t.zy[this.t.nt] = trunc(fr(fr(contO.tzy[k] * this.m.cos(a)) + fr(contO.txy[k] * this.m.sin(a))));
        for (let l = 0; l < 3; ++l) {
          this.t.c[this.t.nt][l] = trunc(fr(contO.tc[k][l] + fr(contO.tc[k][l] * fr(this.m.snap[l] / 100.0))));
          if (this.t.c[this.t.nt][l] > 255) {
            this.t.c[this.t.nt][l] = 255;
          }
          if (this.t.c[this.t.nt][l] < 0) {
            this.t.c[this.t.nt][l] = 0;
          }
        }
        this.t.x[this.t.nt] = trunc(this.x + fr(fr(contO.tx[k] * this.m.cos(a)) - fr(contO.tz[k] * this.m.sin(a))));
        this.t.z[this.t.nt] = trunc(this.z + fr(fr(contO.tz[k] * this.m.cos(a)) + fr(contO.tx[k] * this.m.sin(a))));
        this.t.y[this.t.nt] = i32(this.y + contO.ty[k]);
        this.t.skd[this.t.nt] = contO.skd[k];
        this.t.dam[this.t.nt] = contO.dam[k];
        this.t.notwall[this.t.nt] = contO.notwall[k];
        if (this.decor) {
          this.t.decor[this.t.nt] = true;
        } else {
          this.t.decor[this.t.nt] = false;
        }
        let abs = Math.abs(a);
        if (abs === 180) {
          abs = 0;
        }
        this.t.radx[this.t.nt] = trunc(Math.abs(fr(fr(contO.tradx[k] * this.m.cos(abs)) + fr(contO.tradz[k] * this.m.sin(abs)))));
        this.t.radz[this.t.nt] = trunc(Math.abs(fr(fr(contO.tradx[k] * this.m.sin(abs)) + fr(contO.tradz[k] * this.m.cos(abs)))));
        this.t.rady[this.t.nt] = contO.trady[k];
        const t = this.t;
        ++t.nt;
      }
    }
    for (let n = 0; n < 4; ++n) {
      this.keyx[n] = contO.keyx[n];
      this.keyz[n] = contO.keyz[n];
    }
    if (this.shadow) {
      this.stg = intArray(20);
      this.sx = intArray(20);
      this.sy = intArray(20);
      this.sz = intArray(20);
      this.scx = intArray(20);
      this.scz = intArray(20);
      this.osmag = floatArray(20);
      this.sav = intArray(20);
      this.smag = float2(20, 8);
      this.srgb = int2(20, 3);
      this.sbln = floatArray(20);
      this.ust = 0;
      for (let n2 = 0; n2 < 20; ++n2) {
        this.stg[n2] = 0;
      }
      this.rtg = intArray(100);
      this.rbef = new Array(100).fill(false);
      this.rx = intArray(100);
      this.ry = intArray(100);
      this.rz = intArray(100);
      this.vrx = floatArray(100);
      this.vry = floatArray(100);
      this.vrz = floatArray(100);
      for (let n3 = 0; n3 < 100; ++n3) {
        this.rtg[n3] = 0;
      }
    }
  }

  #initModel(n, n2, n3, m, t, x, z, y) {
    this.m = m;
    this.t = t;
    this.x = x;
    this.z = z;
    this.y = y;
    this.xz = 0;
    this.xy = 0;
    this.zy = 0;
    this.grat = 0;
    this.sprkat = 0;
    this.disline = 4;
    this.noline = true;
    this.shadow = false;
    this.grounded = 115.0;
    this.decor = true;
    this.npl = 5;
    this.p = objArray(5);
    const random = new JavaRandom(n);
    const array = intArray(8);
    const array2 = intArray(8);
    const array3 = intArray(8);
    const array4 = intArray(8);
    const array5 = intArray(8);
    let n4 = fr(n2);
    let n5 = fr(n3);
    if (n5 < 2.0) {
      n5 = 2.0;
    }
    if (n5 > 6.0) {
      n5 = 6.0;
    }
    if (n4 < 2.0) {
      n4 = 2.0;
    }
    if (n4 > 6.0) {
      n4 = 6.0;
    }
    const n6 = fr(n4 / 1.5);
    const n7 = fr(fr(n5 / 1.5) * fr(1.0 + fr(fr(n6 - 2.0) * 0.1786)));
    const n8 = fr(50.0 + 100.0 * random.nextDouble());
    array[0] = -trunc(fr(fr(n8 * n6) * 0.7071));
    array2[0] = trunc(fr(fr(n8 * n6) * 0.7071));
    const n9 = fr(50.0 + 100.0 * random.nextDouble());
    array[1] = 0;
    array2[1] = trunc(n9 * n6);
    const n10 = fr(50.0 + 100.0 * random.nextDouble());
    array[2] = trunc(n10 * n6 * 0.7071);
    array2[2] = trunc(n10 * n6 * 0.7071);
    array[3] = trunc(fr(fr(50.0 + 100.0 * random.nextDouble()) * n6));
    array2[3] = 0;
    const n11 = fr(50.0 + 100.0 * random.nextDouble());
    array[4] = trunc(n11 * n6 * 0.7071);
    array2[4] = -trunc(n11 * n6 * 0.7071);
    const n12 = fr(50.0 + 100.0 * random.nextDouble());
    array[5] = 0;
    array2[5] = -trunc(n12 * n6);
    const n13 = fr(50.0 + 100.0 * random.nextDouble());
    array[6] = -trunc(n13 * n6 * 0.7071);
    array2[6] = -trunc(n13 * n6 * 0.7071);
    array[7] = -trunc(fr(fr(50.0 + 100.0 * random.nextDouble()) * n6));
    array2[7] = 0;
    for (let i = 0; i < 8; ++i) {
      array3[i] = trunc(array[i] * (0.2 + 0.4 * random.nextDouble()));
      array4[i] = trunc(array2[i] * (0.2 + 0.4 * random.nextDouble()));
      array5[i] = -trunc(fr((10.0 + 15.0 * random.nextDouble()) * n7));
    }
    this.maxR = 0;
    for (let j = 0; j < 8; ++j) {
      let n14 = j - 1;
      if (n14 === -1) {
        n14 = 7;
      }
      let n15 = j + 1;
      if (n15 === 8) {
        n15 = 0;
      }
      array[j] = idiv(idiv(array[n14] + array[n15], 2) + array[j], 2);
      array2[j] = idiv(idiv(array2[n14] + array2[n15], 2) + array2[j], 2);
      array3[j] = idiv(idiv(array3[n14] + array3[n15], 2) + array3[j], 2);
      array4[j] = idiv(idiv(array4[n14] + array4[n15], 2) + array4[j], 2);
      array5[j] = idiv(idiv(array5[n14] + array5[n15], 2) + array5[j], 2);
      const maxR = trunc(Math.sqrt(array[j] * array[j] + array2[j] * array2[j]));
      if (maxR > this.maxR) {
        this.maxR = maxR;
      }
      const maxR2 = trunc(Math.sqrt(array3[j] * array3[j] + array5[j] * array5[j] + array4[j] * array4[j]));
      if (maxR2 > this.maxR) {
        this.maxR = maxR2;
      }
    }
    this.disp = idiv(this.maxR, 17);
    const array6 = intArray(3);
    let n16 = -1.0;
    let n17 = fr(fr(n6 / n7 - 0.33) / 33.4);
    if (n17 < 0.005) {
      n17 = 0.0;
    }
    if (n17 > 0.057) {
      n17 = 0.057;
    }
    for (let k = 0; k < 4; ++k) {
      const n18 = k * 2;
      let n19 = n18 + 2;
      if (n19 === 8) {
        n19 = 0;
      }
      const array7 = intArray(6);
      const array8 = intArray(6);
      const array9 = intArray(6);
      array7[0] = array[n18];
      array7[1] = array[n18 + 1];
      array7[2] = array[n19];
      array7[5] = array3[n18];
      array7[4] = array3[n18 + 1];
      array7[3] = array3[n19];
      array9[0] = array2[n18];
      array9[1] = array2[n18 + 1];
      array9[2] = array2[n19];
      array9[5] = array4[n18];
      array9[4] = array4[n18 + 1];
      array9[3] = array4[n19];
      array8[0] = 0;
      array8[2] = (array8[1] = 0);
      array8[5] = array5[n18];
      array8[4] = array5[n18 + 1];
      array8[3] = array5[n19];
      let n20;
      for (n20 = fr(fr(0.17 - n17) * random.nextDouble()); Math.abs(n16 - n20) < 0.03 - n17 * 0.176; n20 = fr(fr(0.17 - n17) * random.nextDouble())) {}
      n16 = n20;
      for (let l = 0; l < 3; ++l) {
        if (this.m.trk === 2) {
          array6[l] = trunc(390.0 / (2.2 + n20 - n17));
        } else {
          array6[l] = trunc((this.m.cpol[l] + this.m.cgrnd[l]) / (2.2 + n20 - n17));
        }
      }
      this.p[k] = new Plane(this.m, this.t, array7, array9, array8, 6, array6, 3, -8, 0, 0, 0, 0, this.disline, 0, true, 0, false);
    }
    const n21 = fr(0.02 * random.nextDouble());
    for (let n22 = 0; n22 < 3; ++n22) {
      if (this.m.trk === 2) {
        array6[n22] = trunc(390.0 / (2.15 + n21));
      } else {
        array6[n22] = trunc((this.m.cpol[n22] + this.m.cgrnd[n22]) / (2.15 + n21));
      }
    }
    this.p[4] = new Plane(this.m, this.t, array3, array4, array5, 8, array6, 3, -8, 0, 0, 0, 0, this.disline, 0, true, 0, false);
    const array10 = intArray(2);
    const array11 = intArray(2);
    for (let n23 = 0; n23 < 4; ++n23) {
      const n24 = n23 * 2 + 1;
      this.t.y[this.t.nt] = idiv(array5[n24], 2);
      this.t.rady[this.t.nt] = Math.abs(idiv(array5[n24], 2));
      if (n23 === 0 || n23 === 2) {
        this.t.z[this.t.nt] = idiv(array2[n24] + array4[n24], 2);
        this.t.radz[this.t.nt] = Math.abs(this.t.z[this.t.nt] - array2[n24]);
        let n25 = n23 * 2 + 2;
        if (n25 === 8) {
          n25 = 0;
        }
        this.t.x[this.t.nt] = idiv(array[n23 * 2] + array[n25], 2);
        this.t.radx[this.t.nt] = Math.abs(this.t.x[this.t.nt] - array[n23 * 2]);
      } else {
        this.t.x[this.t.nt] = idiv(array[n24] + array3[n24], 2);
        this.t.radx[this.t.nt] = Math.abs(this.t.x[this.t.nt] - array[n24]);
        let n26 = n23 * 2 + 2;
        if (n26 === 8) {
          n26 = 0;
        }
        this.t.z[this.t.nt] = idiv(array2[n23 * 2] + array2[n26], 2);
        this.t.radz[this.t.nt] = Math.abs(this.t.z[this.t.nt] - array2[n23 * 2]);
      }
      if (n23 === 0) {
        array11[0] = this.t.z[this.t.nt] - this.t.radz[this.t.nt];
        this.t.zy[this.t.nt] = trunc(Math.atan(this.t.rady[this.t.nt] / this.t.radz[this.t.nt]) / 0.017453292519943295);
        if (this.t.zy[this.t.nt] > 40) {
          this.t.zy[this.t.nt] = 40;
        }
        this.t.xy[this.t.nt] = 0;
      }
      if (n23 === 1) {
        array10[0] = this.t.x[this.t.nt] - this.t.radx[this.t.nt];
        this.t.xy[this.t.nt] = trunc(Math.atan(this.t.rady[this.t.nt] / this.t.radx[this.t.nt]) / 0.017453292519943295);
        if (this.t.xy[this.t.nt] > 40) {
          this.t.xy[this.t.nt] = 40;
        }
        this.t.zy[this.t.nt] = 0;
      }
      if (n23 === 2) {
        array11[1] = this.t.z[this.t.nt] + this.t.radz[this.t.nt];
        this.t.zy[this.t.nt] = -trunc(Math.atan(this.t.rady[this.t.nt] / this.t.radz[this.t.nt]) / 0.017453292519943295);
        if (this.t.zy[this.t.nt] < -40) {
          this.t.zy[this.t.nt] = -40;
        }
        this.t.xy[this.t.nt] = 0;
      }
      if (n23 === 3) {
        array10[1] = this.t.x[this.t.nt] + this.t.radx[this.t.nt];
        this.t.xy[this.t.nt] = -trunc(Math.atan(this.t.rady[this.t.nt] / this.t.radx[this.t.nt]) / 0.017453292519943295);
        if (this.t.xy[this.t.nt] < -40) {
          this.t.xy[this.t.nt] = -40;
        }
        this.t.zy[this.t.nt] = 0;
      }
      const x2 = this.t.x;
      const nt = this.t.nt;
      x2[nt] = i32(x2[nt] + this.x);
      const z2 = this.t.z;
      const nt2 = this.t.nt;
      z2[nt2] = i32(z2[nt2] + this.z);
      const y2 = this.t.y;
      const nt3 = this.t.nt;
      y2[nt3] = i32(y2[nt3] + this.y);
      for (let n27 = 0; n27 < 3; ++n27) {
        this.t.c[this.t.nt][n27] = this.p[n23].oc[n27];
      }
      this.t.skd[this.t.nt] = 2;
      this.t.dam[this.t.nt] = 1;
      this.t.notwall[this.t.nt] = false;
      this.t.decor[this.t.nt] = true;
      const rady = this.t.rady;
      const nt4 = this.t.nt;
      rady[nt4] = i32(rady[nt4] + 10);
      const t2 = this.t;
      ++t2.nt;
    }
    this.t.y[this.t.nt] = 0;
    for (let n28 = 0; n28 < 8; ++n28) {
      const y3 = this.t.y;
      const nt5 = this.t.nt;
      y3[nt5] = i32(y3[nt5] + array5[n28]);
    }
    this.t.y[this.t.nt] = idiv(this.t.y[this.t.nt], 8);
    const y4 = this.t.y;
    const nt6 = this.t.nt;
    y4[nt6] = i32(y4[nt6] + this.y);
    this.t.rady[this.t.nt] = 200;
    this.t.radx[this.t.nt] = array10[0] - array10[1];
    this.t.radz[this.t.nt] = array11[0] - array11[1];
    this.t.x[this.t.nt] = i32(idiv(array10[0] + array10[1], 2) + this.x);
    this.t.z[this.t.nt] = i32(idiv(array11[0] + array11[1], 2) + this.z);
    this.t.zy[this.t.nt] = 0;
    this.t.xy[this.t.nt] = 0;
    for (let n29 = 0; n29 < 3; ++n29) {
      this.t.c[this.t.nt][n29] = this.p[4].oc[n29];
    }
    this.t.skd[this.t.nt] = 4;
    this.t.dam[this.t.nt] = 1;
    this.t.notwall[this.t.nt] = false;
    this.t.decor[this.t.nt] = true;
    const t3 = this.t;
    ++t3.nt;
  }

  d(graphics2D) {
    ++graphics2D.objCalls;        // scene-shape counter; see graphics.js
    if (this.dist !== 0) {
      this.dist = 0;
    }
    const n = this.m.cx + trunc(fr(fr((this.x - this.m.x - this.m.cx) * this.m.cos(this.m.xz)) - fr((this.z - this.m.z - this.m.cz) * this.m.sin(this.m.xz))));
    const n2 = this.m.cz + trunc(fr(fr((this.x - this.m.x - this.m.cx) * this.m.sin(this.m.xz)) + fr((this.z - this.m.z - this.m.cz) * this.m.cos(this.m.xz))));
    const n3 = this.m.cz + trunc(fr(fr((this.y - this.m.y - this.m.cy) * this.m.sin(this.m.zy)) + fr((n2 - this.m.cz) * this.m.cos(this.m.zy))));
    let n4 = this.xs(n + this.maxR, n3) - this.xs(n - this.maxR, n3);
    if (this.xs(n + this.maxR * 2, n3) > this.m.iw && this.xs(n - this.maxR * 2, n3) < this.m.w && n3 > -this.maxR && (n3 < this.m.fade[this.disline] + this.maxR || this.m.trk !== 0) && (n4 > this.disp || this.m.trk !== 0) && (!this.decor || (this.m.resdown !== 2 && this.m.trk !== 1))) {
      ++graphics2D.objDrawn;
      if (this.shadow) {
        if (!this.m.crs) {
          if (n3 < 2000) {
            let b = false;
            if (this.t.ncx !== 0 || this.t.ncz !== 0) {
              let ncx = idiv(this.x - this.t.sx, 3000);
              if (ncx > this.t.ncx) {
                ncx = this.t.ncx;
              }
              if (ncx < 0) {
                ncx = 0;
              }
              let ncz = idiv(this.z - this.t.sz, 3000);
              if (ncz > this.t.ncz) {
                ncz = this.t.ncz;
              }
              if (ncz < 0) {
                ncz = 0;
              }
              for (let i = this.t.sect[ncx][ncz].length - 1; i >= 0; --i) {
                const n5 = this.t.sect[ncx][ncz][i];
                if (Math.abs(this.t.zy[n5]) !== 90 && Math.abs(this.t.xy[n5]) !== 90 && Math.abs(this.x - this.t.x[n5]) < this.t.radx[n5] + this.maxR && Math.abs(this.z - this.t.z[n5]) < this.t.radz[n5] + this.maxR && (!this.t.decor[n5] || this.m.resdown !== 2)) {
                  b = true;
                  break;
                }
              }
            }
            if (b) {
              for (let j = 0; j < this.npl; ++j) {
                this.p[j].s(graphics2D, this.x - this.m.x, this.y - this.m.y, this.z - this.m.z, this.xz, this.xy, this.zy, 0);
              }
            } else {
              const n6 = this.m.cy + trunc(fr(fr((this.m.ground - this.m.cy) * this.m.cos(this.m.zy)) - fr((n2 - this.m.cz) * this.m.sin(this.m.zy))));
              const n7 = this.m.cz + trunc(fr(fr((this.m.ground - this.m.cy) * this.m.sin(this.m.zy)) + fr((n2 - this.m.cz) * this.m.cos(this.m.zy))));
              if (this.ys(n6 + this.maxR, n7) > 0 && this.ys(n6 - this.maxR, n7) < this.m.h) {
                for (let k = 0; k < this.npl; ++k) {
                  this.p[k].s(graphics2D, this.x - this.m.x, this.y - this.m.y, this.z - this.m.z, this.xz, this.xy, this.zy, 1);
                }
              }
            }
            this.m.addsp(this.x - this.m.x, this.z - this.m.z, trunc(this.maxR * 0.8));
          } else {
            this.lowshadow(graphics2D, n3);
          }
        } else {
          for (let l = 0; l < this.npl; ++l) {
            this.p[l].s(graphics2D, this.x - this.m.x, this.y - this.m.y, this.z - this.m.z, this.xz, this.xy, this.zy, 2);
          }
        }
      }
      const n8 = this.m.cy + trunc(fr(fr((this.y - this.m.y - this.m.cy) * this.m.cos(this.m.zy)) - fr((n2 - this.m.cz) * this.m.sin(this.m.zy))));
      if (this.ys(n8 + this.maxR, n3) > this.m.ih && this.ys(n8 - this.maxR, n3) < this.m.h) {
        if (this.elec && this.m.noelec === 0) {
          this.electrify(graphics2D);
        }
        if (this.fix) {
          this.fixit(graphics2D);
        }
        if (this.checkpoint !== 0 && this.checkpoint - 1 === this.m.checkpoint) {
          n4 = -1;
        }
        if (this.shadow) {
          // Bytecode showed iadd for sum of squares; wrapped with i32() per §2b
          this.dist = trunc(Math.sqrt(i32(
            Math.imul(this.m.x + this.m.cx - this.x, this.m.x + this.m.cx - this.x) +
            Math.imul(this.m.z - this.z, this.m.z - this.z) +
            Math.imul(this.m.y + this.m.cy - this.y, this.m.y + this.m.cy - this.y)
          )));
          for (let n9 = 0; n9 < 20; ++n9) {
            if (this.stg[n9] !== 0) {
              this.pdust(n9, graphics2D, true);
            }
          }
          this.dsprk(graphics2D, true);
        }
        const array = intArray(this.npl);
        const array2 = intArray(this.npl);
        for (let n10 = 0; n10 < this.npl; ++n10) {
          array[n10] = 0;
        }
        for (let n11 = 0; n11 < this.npl; ++n11) {
          for (let n12 = n11 + 1; n12 < this.npl; ++n12) {
            if (this.p[n11].av !== this.p[n12].av) {
              if (this.p[n11].av < this.p[n12].av) {
                const array3 = array;
                const n13 = n11;
                ++array3[n13];
              } else {
                const array4 = array;
                const n14 = n12;
                ++array4[n14];
              }
            } else if (n11 > n12) {
              const array5 = array;
              const n15 = n11;
              ++array5[n15];
            } else {
              const array6 = array;
              const n16 = n12;
              ++array6[n16];
            }
          }
          array2[array[n11]] = n11;
        }
        for (let n17 = 0; n17 < this.npl; ++n17) {
          this.p[array2[n17]].d(graphics2D, this.x - this.m.x, this.y - this.m.y, this.z - this.m.z, this.xz, this.xy, this.zy, this.wxz, this.wzy, this.noline, n4);
        }
        if (this.shadow) {
          for (let n18 = 0; n18 < 20; ++n18) {
            if (this.stg[n18] !== 0) {
              this.pdust(n18, graphics2D, false);
            }
          }
          this.dsprk(graphics2D, false);
        }
        // Bytecode showed iadd for sum of squares; wrapped with i32() per §2b
        this.dist = trunc(Math.sqrt(trunc(Math.sqrt(i32(
          Math.imul(this.m.x + this.m.cx - this.x, this.m.x + this.m.cx - this.x) +
          Math.imul(this.m.z - this.z, this.m.z - this.z) +
          Math.imul(this.m.y + this.m.cy - this.y, this.m.y + this.m.cy - this.y)
        )))) * this.grounded);
      }
    }
    if (this.shadow && this.dist === 0) {
      for (let n19 = 0; n19 < 20; ++n19) {
        if (this.stg[n19] !== 0) {
          this.stg[n19] = 0;
        }
      }
      for (let n20 = 0; n20 < 100; ++n20) {
        if (this.rtg[n20] !== 0) {
          this.rtg[n20] = 0;
        }
      }
      if (this.sprk_ !== 0) {
        this.sprk_ = 0;
      }
    }
  }

  lowshadow(graphics2D, n) {
    const array = intArray(4);
    const array2 = intArray(4);
    const array3 = intArray(4);
    let n2 = 1;
    let i;
    for (i = Math.abs(this.zy); i > 270; i -= 360) {}
    if (Math.abs(i) > 90) {
      n2 = -1;
    }
    array[0] = trunc(this.keyx[0] * 1.2 + this.x - this.m.x);
    array3[0] = trunc((this.keyz[0] + 30) * n2 * 1.2 + this.z - this.m.z);
    array[1] = trunc(this.keyx[1] * 1.2 + this.x - this.m.x);
    array3[1] = trunc((this.keyz[1] + 30) * n2 * 1.2 + this.z - this.m.z);
    array[2] = trunc(this.keyx[3] * 1.2 + this.x - this.m.x);
    array3[2] = trunc((this.keyz[3] - 30) * n2 * 1.2 + this.z - this.m.z);
    array[3] = trunc(this.keyx[2] * 1.2 + this.x - this.m.x);
    array3[3] = trunc((this.keyz[2] - 30) * n2 * 1.2 + this.z - this.m.z);
    this.rot(array, array3, this.x - this.m.x, this.z - this.m.z, this.xz, 4);
    let r = idiv(this.m.crgrnd[0], 1.5);
    let g = idiv(this.m.crgrnd[1], 1.5);
    let b = idiv(this.m.crgrnd[2], 1.5);
    for (let j = 0; j < 4; ++j) {
      array2[j] = this.m.ground;
    }
    if (this.t.ncx !== 0 || this.t.ncz !== 0) {
      let ncx = idiv(this.x - this.t.sx, 3000);
      if (ncx > this.t.ncx) {
        ncx = this.t.ncx;
      }
      if (ncx < 0) {
        ncx = 0;
      }
      let ncz = idiv(this.z - this.t.sz, 3000);
      if (ncz > this.t.ncz) {
        ncz = this.t.ncz;
      }
      if (ncz < 0) {
        ncz = 0;
      }
      for (let k = this.t.sect[ncx][ncz].length - 1; k >= 0; --k) {
        const n3 = this.t.sect[ncx][ncz][k];
        let n4 = 0;
        for (let l = 0; l < 4; ++l) {
          if (Math.abs(this.t.zy[n3]) !== 90 && Math.abs(this.t.xy[n3]) !== 90 && this.t.rady[n3] !== 801 && Math.abs(array[l] - (this.t.x[n3] - this.m.x)) < this.t.radx[n3] && Math.abs(array3[l] - (this.t.z[n3] - this.m.z)) < this.t.radz[n3] && (!this.t.decor[n3] || this.m.resdown !== 2)) {
            ++n4;
          }
        }
        if (n4 > 2) {
          for (let n5 = 0; n5 < 4; ++n5) {
            array2[n5] = this.t.y[n3] - this.m.y;
            if (this.t.zy[n3] !== 0) {
              // Compound assignment rewrite per §2: array4[n6] += (int)(...)
              array2[n5] = trunc(array2[n5] + fr(fr((array3[n5] - (this.t.z[n3] - this.m.z - this.t.radz[n3])) * this.m.sin(this.t.zy[n3]) / this.m.sin(90 - this.t.zy[n3])) - fr(this.t.radz[n3] * this.m.sin(this.t.zy[n3]) / this.m.sin(90 - this.t.zy[n3]))));
            }
            if (this.t.xy[n3] !== 0) {
              // Compound assignment rewrite per §2: array5[n7] += (int)(...)
              array2[n5] = trunc(array2[n5] + fr(fr((array[n5] - (this.t.x[n3] - this.m.x - this.t.radx[n3])) * this.m.sin(this.t.xy[n3]) / this.m.sin(90 - this.t.xy[n3])) - fr(this.t.radx[n3] * this.m.sin(this.t.xy[n3]) / this.m.sin(90 - this.t.xy[n3]))));
            }
          }
          r = idiv(this.t.c[n3][0], 1.5);
          g = idiv(this.t.c[n3][1], 1.5);
          b = idiv(this.t.c[n3][2], 1.5);
          break;
        }
      }
    }
    this.rot(array, array3, this.m.cx, this.m.cz, this.m.xz, 4);
    this.rot(array2, array3, this.m.cy, this.m.cz, this.m.zy, 4);
    let b2 = true;
    let n8 = 0;
    let n9 = 0;
    let n10 = 0;
    let n11 = 0;
    for (let n12 = 0; n12 < 4; ++n12) {
      array[n12] = this.xs(array[n12], array3[n12]);
      array2[n12] = this.ys(array2[n12], array3[n12]);
      if (array2[n12] < this.m.ih || array3[n12] < 10) {
        ++n8;
      }
      if (array2[n12] > this.m.h || array3[n12] < 10) {
        ++n9;
      }
      if (array[n12] < this.m.iw || array3[n12] < 10) {
        ++n10;
      }
      if (array[n12] > this.m.w || array3[n12] < 10) {
        ++n11;
      }
    }
    if (n10 === 4 || n8 === 4 || n9 === 4 || n11 === 4) {
      b2 = false;
    }
    if (b2) {
      for (let n13 = 0; n13 < 16; ++n13) {
        if (n > this.m.fade[n13]) {
          r = idiv(r * this.m.fogd + this.m.cfade[0], this.m.fogd + 1);
          g = idiv(g * this.m.fogd + this.m.cfade[1], this.m.fogd + 1);
          b = idiv(b * this.m.fogd + this.m.cfade[2], this.m.fogd + 1);
        }
      }
      graphics2D.setColor(r, g, b);
      graphics2D.fillPolygon(array, array2, 4);
    }
  }

  fixit(graphics2D) {
    if (this.fcnt === 1) {
      for (let i = 0; i < this.npl; ++i) {
        this.p[i].hsb[0] = 0.57;
        this.p[i].hsb[2] = 0.8;
        this.p[i].hsb[1] = 0.8;
        const rgb = HSBtoRGB(this.p[i].hsb[0], this.p[i].hsb[1], this.p[i].hsb[2]);
        let r = trunc((rgb >> 16 & 0xFF) + (rgb >> 16 & 0xFF) * (this.m.snap[0] / 100.0));
        if (r > 255) {
          r = 255;
        }
        if (r < 0) {
          r = 0;
        }
        let g = trunc((rgb >> 8 & 0xFF) + (rgb >> 8 & 0xFF) * (this.m.snap[1] / 100.0));
        if (g > 255) {
          g = 255;
        }
        if (g < 0) {
          g = 0;
        }
        let b = trunc((rgb & 0xFF) + (rgb & 0xFF) * (this.m.snap[2] / 100.0));
        if (b > 255) {
          b = 255;
        }
        if (b < 0) {
          b = 0;
        }
        RGBtoHSB(r, g, b, this.p[i].hsb);
        this.p[i].flx = 1;
      }
    }
    if (this.fcnt === 2) {
      for (let j = 0; j < this.npl; ++j) {
        this.p[j].flx = 1;
      }
    }
    if (this.fcnt === 4) {
      for (let k = 0; k < this.npl; ++k) {
        this.p[k].flx = 3;
      }
    }
    if ((this.fcnt === 1 || this.fcnt > 2) && this.fcnt !== 9) {
      const array = intArray(8);
      const array2 = intArray(8);
      const array3 = intArray(4);
      for (let l = 0; l < 4; ++l) {
        array[l] = this.keyx[l] + this.x - this.m.x;
        array2[l] = this.grat + this.y - this.m.y;
        array3[l] = this.keyz[l] + this.z - this.m.z;
      }
      this.rot(array, array2, this.x - this.m.x, this.y - this.m.y, this.xy, 4);
      this.rot(array2, array3, this.y - this.m.y, this.z - this.m.y, this.zy, 4);
      this.rot(array, array3, this.x - this.m.x, this.z - this.m.z, this.xz, 4);
      this.rot(array, array3, this.m.cx, this.m.cz, this.m.xz, 4);
      this.rot(array2, array3, this.m.cy, this.m.cz, this.m.zy, 4);
      let abs = 0;
      let abs2 = 0;
      let py = 0;
      for (let n = 0; n < 4; ++n) {
        for (let n2 = 0; n2 < 4; ++n2) {
          if (Math.abs(array[n] - array[n2]) > abs) {
            abs = Math.abs(array[n] - array[n2]);
          }
          if (Math.abs(array2[n] - array2[n2]) > abs2) {
            abs2 = Math.abs(array2[n] - array2[n2]);
          }
          if (this.py(array[n], array[n2], array2[n], array2[n2]) > py) {
            py = this.py(array[n], array[n2], array2[n], array2[n2]);
          }
        }
      }
      const n3 = trunc(Math.sqrt(py) / 1.5);
      if (abs < n3) {
        abs = n3;
      }
      if (abs2 < n3) {
        abs2 = n3;
      }
      const n4 = this.m.cx + trunc(fr(fr((this.x - this.m.x - this.m.cx) * this.m.cos(this.m.xz)) - fr((this.z - this.m.z - this.m.cz) * this.m.sin(this.m.xz))));
      const n5 = this.m.cz + trunc(fr(fr((this.x - this.m.x - this.m.cx) * this.m.sin(this.m.xz)) + fr((this.z - this.m.z - this.m.cz) * this.m.cos(this.m.xz))));
      const n6 = this.m.cy + trunc(fr(fr((this.y - this.m.y - this.m.cy) * this.m.cos(this.m.zy)) - fr((n5 - this.m.cz) * this.m.sin(this.m.zy))));
      const n7 = this.m.cz + trunc(fr(fr((this.y - this.m.y - this.m.cy) * this.m.sin(this.m.zy)) + fr((n5 - this.m.cz) * this.m.cos(this.m.zy))));
      array[0] = this.xs(trunc(n4 - abs / 0.8 - this.m.random() * (abs / 2.4)), n7);
      array2[0] = this.ys(trunc(n6 - abs2 / 1.92 - this.m.random() * (abs2 / 5.67)), n7);
      array[1] = this.xs(trunc(n4 - abs / 0.8 - this.m.random() * (abs / 2.4)), n7);
      array2[1] = this.ys(trunc(n6 + abs2 / 1.92 + this.m.random() * (abs2 / 5.67)), n7);
      array[2] = this.xs(trunc(n4 - abs / 1.92 - this.m.random() * (abs / 5.67)), n7);
      array2[2] = this.ys(trunc(n6 + abs2 / 0.8 + this.m.random() * (abs2 / 2.4)), n7);
      array[3] = this.xs(trunc(n4 + abs / 1.92 + this.m.random() * (abs / 5.67)), n7);
      array2[3] = this.ys(trunc(n6 + abs2 / 0.8 + this.m.random() * (abs2 / 2.4)), n7);
      array[4] = this.xs(trunc(n4 + abs / 0.8 + this.m.random() * (abs / 2.4)), n7);
      array2[4] = this.ys(trunc(n6 + abs2 / 1.92 + this.m.random() * (abs2 / 5.67)), n7);
      array[5] = this.xs(trunc(n4 + abs / 0.8 + this.m.random() * (abs / 2.4)), n7);
      array2[5] = this.ys(trunc(n6 - abs2 / 1.92 - this.m.random() * (abs2 / 5.67)), n7);
      array[6] = this.xs(trunc(n4 + abs / 1.92 + this.m.random() * (abs / 5.67)), n7);
      array2[6] = this.ys(trunc(n6 - abs2 / 0.8 - this.m.random() * (abs2 / 2.4)), n7);
      array[7] = this.xs(trunc(n4 - abs / 1.92 - this.m.random() * (abs / 5.67)), n7);
      array2[7] = this.ys(trunc(n6 - abs2 / 0.8 - this.m.random() * (abs2 / 2.4)), n7);
      if (this.fcnt === 3) {
        this.rot(array, array2, this.xs(n4, n7), this.ys(n6, n7), 22, 8);
      }
      if (this.fcnt === 4) {
        this.rot(array, array2, this.xs(n4, n7), this.ys(n6, n7), 22, 8);
      }
      if (this.fcnt === 5) {
        this.rot(array, array2, this.xs(n4, n7), this.ys(n6, n7), 0, 8);
      }
      if (this.fcnt === 6) {
        this.rot(array, array2, this.xs(n4, n7), this.ys(n6, n7), -22, 8);
      }
      if (this.fcnt === 7) {
        this.rot(array, array2, this.xs(n4, n7), this.ys(n6, n7), -22, 8);
      }
      let r2 = trunc(fr(191.0 + 191.0 * fr(this.m.snap[0] / 350.0)));
      if (r2 > 255) {
        r2 = 255;
      }
      if (r2 < 0) {
        r2 = 0;
      }
      let g2 = trunc(fr(232.0 + 232.0 * fr(this.m.snap[1] / 350.0)));
      if (g2 > 255) {
        g2 = 255;
      }
      if (g2 < 0) {
        g2 = 0;
      }
      let b2 = trunc(fr(255.0 + 255.0 * fr(this.m.snap[2] / 350.0)));
      if (b2 > 255) {
        b2 = 255;
      }
      if (b2 < 0) {
        b2 = 0;
      }
      graphics2D.setColor(r2, g2, b2);
      graphics2D.fillPolygon(array, array2, 8);
      array[0] = this.xs(trunc(n4 - abs - this.m.random() * (abs / 4)), n7);
      array2[0] = this.ys(trunc(n6 - abs2 / 2.4 - this.m.random() * (abs2 / 9.6)), n7);
      array[1] = this.xs(trunc(n4 - abs - this.m.random() * (abs / 4)), n7);
      array2[1] = this.ys(trunc(n6 + abs2 / 2.4 + this.m.random() * (abs2 / 9.6)), n7);
      array[2] = this.xs(trunc(n4 - abs / 2.4 - this.m.random() * (abs / 9.6)), n7);
      array2[2] = this.ys(trunc(n6 + abs2 + this.m.random() * (abs2 / 4)), n7);
      array[3] = this.xs(trunc(n4 + abs / 2.4 + this.m.random() * (abs / 9.6)), n7);
      array2[3] = this.ys(trunc(n6 + abs2 + this.m.random() * (abs2 / 4)), n7);
      array[4] = this.xs(trunc(n4 + abs + this.m.random() * (abs / 4)), n7);
      array2[4] = this.ys(trunc(n6 + abs2 / 2.4 + this.m.random() * (abs2 / 9.6)), n7);
      array[5] = this.xs(trunc(n4 + abs + this.m.random() * (abs / 4)), n7);
      array2[5] = this.ys(trunc(n6 - abs2 / 2.4 - this.m.random() * (abs2 / 9.6)), n7);
      array[6] = this.xs(trunc(n4 + abs / 2.4 + this.m.random() * (abs / 9.6)), n7);
      array2[6] = this.ys(trunc(n6 - abs2 - this.m.random() * (abs2 / 4)), n7);
      array[7] = this.xs(trunc(n4 - abs / 2.4 - this.m.random() * (abs / 9.6)), n7);
      array2[7] = this.ys(trunc(n6 - abs2 - this.m.random() * (abs2 / 4)), n7);
      let r3 = trunc(fr(213.0 + 213.0 * fr(this.m.snap[0] / 350.0)));
      if (r3 > 255) {
        r3 = 255;
      }
      if (r3 < 0) {
        r3 = 0;
      }
      let g3 = trunc(fr(239.0 + 239.0 * fr(this.m.snap[1] / 350.0)));
      if (g3 > 255) {
        g3 = 255;
      }
      if (g3 < 0) {
        g3 = 0;
      }
      let b3 = trunc(fr(255.0 + 255.0 * fr(this.m.snap[2] / 350.0)));
      if (b3 > 255) {
        b3 = 255;
      }
      if (b3 < 0) {
        b3 = 0;
      }
      graphics2D.setColor(r3, g3, b3);
      graphics2D.fillPolygon(array, array2, 8);
    }
    // Tick-rate advance: an interpolated frame redraws this stage of the
    // sparkle, it does not step to the next one. Stepping at display rate ran
    // the sparkle ~3x fast and could skip the frame that clears `fix`.
    if (this.m.interpolating) return;
    if (this.fcnt > 7) {
      this.fcnt = 0;
      this.fix = false;
    } else {
      ++this.fcnt;
    }
  }

  electrify(graphics2D) {
    for (let i = 0; i < 4; ++i) {
      // The bolt's shape comes straight out of random(). It stays put across
      // an interpolated frame because Medium.random() replays the tick's
      // sequence, not because anything is cached here -- see Medium.random().
      if (this.elc[i] === 0 && !this.m.interpolating) {
        this.edl[i] = trunc(fr(380.0 - fr(this.m.random() * 760.0)));
        this.edr[i] = trunc(fr(380.0 - fr(this.m.random() * 760.0)));
        this.elc[i] = 1;
      }
      const n = trunc(fr(this.edl[i] + fr(190.0 - fr(this.m.random() * 380.0))));
      const n2 = trunc(fr(this.edr[i] + fr(190.0 - fr(this.m.random() * 380.0))));
      const n3 = trunc(this.m.random() * 126.0);
      const n4 = trunc(this.m.random() * 126.0);
      const array = intArray(8);
      const array2 = intArray(8);
      const array3 = intArray(8);
      for (let j = 0; j < 8; ++j) {
        array3[j] = this.z - this.m.z;
      }
      array[0] = this.x - this.m.x - 504;
      array2[0] = trunc(this.y - this.m.y - this.edl[i] - 5 - trunc(this.m.random() * 5.0));
      array[1] = this.x - this.m.x - 252 + n4;
      array2[1] = trunc(this.y - this.m.y - n - 5 - trunc(this.m.random() * 5.0));
      array[2] = this.x - this.m.x + 252 - n3;
      array2[2] = trunc(this.y - this.m.y - n2 - 5 - trunc(this.m.random() * 5.0));
      array[3] = this.x - this.m.x + 504;
      array2[3] = trunc(this.y - this.m.y - this.edr[i] - 5 - trunc(this.m.random() * 5.0));
      array[4] = this.x - this.m.x + 504;
      array2[4] = trunc(this.y - this.m.y - this.edr[i] + 5 + trunc(this.m.random() * 5.0));
      array[5] = this.x - this.m.x + 252 - n3;
      array2[5] = trunc(this.y - this.m.y - n2 + 5 + trunc(this.m.random() * 5.0));
      array[6] = this.x - this.m.x - 252 + n4;
      array2[6] = trunc(this.y - this.m.y - n + 5 + trunc(this.m.random() * 5.0));
      array[7] = this.x - this.m.x - 504;
      array2[7] = trunc(this.y - this.m.y - this.edl[i] + 5 + trunc(this.m.random() * 5.0));
      if (this.roted) {
        this.rot(array, array3, this.x - this.m.x, this.z - this.m.z, 90, 8);
      }
      this.rot(array, array3, this.m.cx, this.m.cz, this.m.xz, 8);
      this.rot(array2, array3, this.m.cy, this.m.cz, this.m.zy, 8);
      let b = true;
      let n5 = 0;
      let n6 = 0;
      let n7 = 0;
      let n8 = 0;
      const array4 = intArray(8);
      const array5 = intArray(8);
      for (let k = 0; k < 8; ++k) {
        array4[k] = this.xs(array[k], array3[k]);
        array5[k] = this.ys(array2[k], array3[k]);
        if (array5[k] < this.m.ih || array3[k] < 10) {
          ++n5;
        }
        if (array5[k] > this.m.h || array3[k] < 10) {
          ++n6;
        }
        if (array4[k] < this.m.iw || array3[k] < 10) {
          ++n7;
        }
        if (array4[k] > this.m.w || array3[k] < 10) {
          ++n8;
        }
      }
      if (n7 === 8 || n5 === 8 || n6 === 8 || n8 === 8) {
        b = false;
      }
      if (b) {
        let n9 = trunc(fr(160.0 + 160.0 * fr(this.m.snap[0] / 500.0)));
        if (n9 > 255) {
          n9 = 255;
        }
        if (n9 < 0) {
          n9 = 0;
        }
        let n10 = trunc(fr(238.0 + 238.0 * fr(this.m.snap[1] / 500.0)));
        if (n10 > 255) {
          n10 = 255;
        }
        if (n10 < 0) {
          n10 = 0;
        }
        let b2 = trunc(fr(255.0 + 255.0 * fr(this.m.snap[2] / 500.0)));
        if (b2 > 255) {
          b2 = 255;
        }
        if (b2 < 0) {
          b2 = 0;
        }
        let r = idiv(n9 * 2 + 214 * (this.elc[i] - 1), this.elc[i] + 1);
        let g = idiv(n10 * 2 + 236 * (this.elc[i] - 1), this.elc[i] + 1);
        if (this.m.trk === 1) {
          r = 255;
          g = 128;
          b2 = 0;
        }
        graphics2D.setColor(r, g, b2);
        graphics2D.fillPolygon(array4, array5, 8);
        if (array3[0] < 4000) {
          let r2 = trunc(fr(150.0 + 150.0 * fr(this.m.snap[0] / 500.0)));
          if (r2 > 255) {
            r2 = 255;
          }
          if (r2 < 0) {
            r2 = 0;
          }
          let g2 = trunc(fr(227.0 + 227.0 * fr(this.m.snap[1] / 500.0)));
          if (g2 > 255) {
            g2 = 255;
          }
          if (g2 < 0) {
            g2 = 0;
          }
          let b3 = trunc(fr(255.0 + 255.0 * fr(this.m.snap[2] / 500.0)));
          if (b3 > 255) {
            b3 = 255;
          }
          if (b3 < 0) {
            b3 = 0;
          }
          graphics2D.setColor(r2, g2, b3);
          graphics2D.drawPolygon(array4, array5, 8);
        }
      }
      if (!this.m.interpolating) {
        if (this.elc[i] > fr(this.m.random() * 60.0)) {
          this.elc[i] = 0;
        } else {
          const elc = this.elc;
          const n11 = i;
          ++elc[n11];
        }
      }
    }
    if (this.m.interpolating) return;
    if (!this.roted || this.xz !== 0) {
      this.xy += 11;
      if (this.xy > 360) {
        this.xy -= 360;
      }
    } else {
      this.zy += 11;
      if (this.zy > 360) {
        this.zy -= 360;
      }
    }
  }

  dust(n, n2, n3, n4, n5, n6, n7, n8, b) {
    let b2 = false;
    if (n8 > 5 && (n === 0 || n === 2)) {
      b2 = true;
    }
    if (n8 < -5 && (n === 1 || n === 3)) {
      b2 = true;
    }
    let n9 = fr(fr(Math.sqrt(n5 * n5 + n6 * n6) - 40.0) / 160.0);
    if (n9 > 1.0) {
      n9 = 1.0;
    }
    if (n9 > 0.2 && !b2) {
      ++this.ust;
      if (this.ust === 20) {
        this.ust = 0;
      }
      if (!b) {
        const random = this.m.random();
        this.sx[this.ust] = trunc(fr(n2 + fr(this.x * random)) / fr(1.0 + random));
        this.sz[this.ust] = trunc(fr(n4 + fr(this.z * random)) / fr(1.0 + random));
        this.sy[this.ust] = trunc(fr(n3 + fr(this.y * random)) / fr(1.0 + random));
      } else {
        this.sx[this.ust] = trunc(fr(n2 + (this.x + n5)) / 2.0);
        this.sz[this.ust] = trunc(fr(n4 + (this.z + n6)) / 2.0);
        this.sy[this.ust] = trunc(n3);
      }
      if (this.sy[n] > 250) {
        this.sy[n] = 250;
      }
      this.osmag[this.ust] = fr(n7 * n9);
      this.scx[this.ust] = n5;
      this.scz[this.ust] = n6;
      this.stg[this.ust] = 1;
    }
  }

  pdust(n, graphics2D, b) {
    // Stage 1 rolls the puff's colour, drift and lobe magnitudes and then
    // moves it to stage 2 in the same call, so only a tick ever sees it. An
    // interpolated frame must not re-roll it -- that shimmered the puff at
    // display rate.
    if (this.stg[n] === 1 && !this.m.interpolating) {
      let b2 = false;
      const array = intArray(3);
      if (this.t.ncx !== 0 || this.t.ncz !== 0) {
        let ncx = idiv(this.sx[n] - this.t.sx, 3000);
        if (ncx > this.t.ncx) {
          ncx = this.t.ncx;
        }
        if (ncx < 0) {
          ncx = 0;
        }
        let ncz = idiv(this.sz[n] - this.t.sz, 3000);
        if (ncz > this.t.ncz) {
          ncz = this.t.ncz;
        }
        if (ncz < 0) {
          ncz = 0;
        }
        for (let i = this.t.sect[ncx][ncz].length - 1; i >= 0; --i) {
          const n2 = this.t.sect[ncx][ncz][i];
          if (Math.abs(this.t.zy[n2]) !== 90 && Math.abs(this.t.xy[n2]) !== 90 && Math.abs(this.sx[n] - (this.t.x[n2] - this.m.x)) < this.t.radx[n2] && Math.abs(this.sz[n] - (this.t.z[n2] - this.m.z)) < this.t.radz[n2]) {
            if (this.t.skd[n2] === 1) {
              this.sbln[n] = 0.25;
            }
            if (this.t.skd[n2] === 2) {
              this.sbln[n] = 0.45;
            }
            for (let k = 0; k < 3; ++k) {
              this.srgb[n][k] = idiv(this.t.c[n2][k] + array[k], 2);
            }
            b2 = true;
          }
        }
      }
      if (!b2) {
        for (let l = 0; l < 3; ++l) {
          this.srgb[n][l] = idiv(this.m.crgrnd[l] + array[l], 2);
        }
      }
      let n3 = fr(0.1 + this.m.random());
      if (n3 > 1.0) {
        n3 = 1.0;
      }
      // Preserve §3 bug verbatim: (int) cast of float <= 1.0 yields 0
      // bytecode: iaload; i2f; fmul; f2i; iastore -> §2 Case A, not `*= (int)n3`
      this.scx[n] = trunc(fr(this.scx[n] * n3));
      this.scz[n] = trunc(this.scx[n] * n3);
      for (let n4 = 0; n4 < 8; ++n4) {
        this.smag[n][n4] = fr(fr(this.osmag[n] * this.m.random()) * 50.0);
      }
      for (let n5 = 0; n5 < 8; ++n5) {
        let n6 = n5 - 1;
        if (n6 === -1) {
          n6 = 7;
        }
        let n7 = n5 + 1;
        if (n7 === 8) {
          n7 = 0;
        }
        this.smag[n][n5] = fr(fr(fr(this.smag[n][n6] + this.smag[n][n7]) / 2.0 + this.smag[n][n5]) / 2.0);
      }
      this.stg[n] = 2;
    }
    if (this.stg[n] >= 2) {
      const array2 = intArray(8);
      const array3 = intArray(8);
      const array4 = intArray(8);
      const array5 = intArray(8);
      const array6 = intArray(8);
      let b3 = false;
      // Bytecode showed iadd for sum of squares; wrapped with i32() per §2b
      if (this.dist < Math.sqrt(i32(
        Math.imul(this.m.x + this.m.cx - this.sx[n], this.m.x + this.m.cx - this.sx[n]) +
        Math.imul(this.m.y + this.m.cy - this.sy[n], this.m.y + this.m.cy - this.sy[n]) +
        Math.imul(this.m.z - this.sz[n], this.m.z - this.sz[n])
      ))) {
        b3 = true;
      }
      if ((b3 && b) || (!b3 && !b)) {
        // The drift is a per-tick step. Skipping it on an interpolated frame
        // draws the puff where the tick left it, which is the point.
        if (!this.m.interpolating) {
          const sx = this.sx;
          sx[n] = i32(sx[n] + idiv(this.scx[n], this.stg[n] + 1));
          const sz = this.sz;
          sz[n] = i32(sz[n] + idiv(this.scz[n], this.stg[n] + 1));
        }
        array4[0] = trunc(this.sx[n] - this.smag[n][0] * 0.7071);
        array6[0] = trunc(this.sz[n] + this.smag[n][0] * 0.7071);
        array4[1] = this.sx[n];
        array6[1] = trunc(this.sz[n] + this.smag[n][1]);
        array4[2] = trunc(this.sx[n] + this.smag[n][2] * 0.7071);
        array6[2] = trunc(this.sz[n] + this.smag[n][2] * 0.7071);
        array4[3] = trunc(this.sx[n] + this.smag[n][3]);
        array6[3] = this.sz[n];
        array4[4] = trunc(this.sx[n] + this.smag[n][4] * 0.7071);
        array6[4] = trunc(this.sz[n] - this.smag[n][4] * 0.7071);
        array4[5] = this.sx[n];
        array6[5] = trunc(this.sz[n] - this.smag[n][5]);
        array4[6] = trunc(this.sx[n] - this.smag[n][6] * 0.7071);
        array6[6] = trunc(this.sz[n] - this.smag[n][6] * 0.7071);
        array4[7] = trunc(this.sx[n] - this.smag[n][7]);
        array6[7] = this.sz[n];
        for (let i2 = 0; i2 < 8; ++i2) {
          array5[i2] = this.sy[n];
        }

        this.rot(array4, array6, this.m.cx, this.m.cz, this.m.xz, 8);
        this.rot(array5, array6, this.m.cy, this.m.cz, this.m.zy, 8);
        let b4 = true;
        let n8 = 0;
        let n9 = 0;
        let n10 = 0;
        let n11 = 0;
        for (let j2 = 0; j2 < 8; ++j2) {
          array2[j2] = this.xs(array4[j2], array6[j2]);
          array3[j2] = this.ys(array5[j2], array6[j2]);
          if (array3[j2] < this.m.ih || array6[j2] < 10) {
            ++n8;
          }
          if (array3[j2] > this.m.h || array6[j2] < 10) {
            ++n9;
          }
          if (array2[j2] < this.m.iw || array6[j2] < 10) {
            ++n10;
          }
          if (array2[j2] > this.m.w || array6[j2] < 10) {
            ++n11;
          }
        }
        if (n10 === 8 || n8 === 8 || n9 === 8 || n11 === 8) {
          b4 = false;
        }
        if (b4) {
          let r = this.srgb[n][0];
          let g = this.srgb[n][1];
          let b5 = this.srgb[n][2];
          for (let k2 = 0; k2 < 16; ++k2) {
            if (array6[0] > this.m.fade[k2]) {
              r = idiv(r * this.m.fogd + this.m.cfade[0], this.m.fogd + 1);
              g = idiv(g * this.m.fogd + this.m.cfade[1], this.m.fogd + 1);
              b5 = idiv(b5 * this.m.fogd + this.m.cfade[2], this.m.fogd + 1);
            }
          }
          graphics2D.setColor(r, g, b5);
          graphics2D.fillPolygon(array2, array3, 8);
        }
        if (!this.m.interpolating) {
          const smag = this.smag[n];
          for (let n12 = 0; n12 < 8; ++n12) {
            smag[n12] = fr(smag[n12] + 0.5 + 5.0 * this.m.random());
          }
          if (this.stg[n] === 10) {
            this.stg[n] = 0;
          } else {
            const stg = this.stg;
            const n13 = n;
            ++stg[n13];
          }
        }
      }
    }
  }

  sprk(n, n2, n3, rcx, rcy, rcz, n4) {
    if (n4 !== 1) {
      this.srx = trunc(n - fr(this.sprkat * this.m.sin(this.xz)));
      this.sry = trunc(n2 - fr(fr(this.sprkat * this.m.cos(this.zy)) * this.m.cos(this.xy)));
      this.srz = trunc(n3 + fr(this.sprkat * this.m.cos(this.xz)));
      this.sprk_ = 1;
    } else {
      ++this.sprk_;
      if (this.sprk_ === 4) {
        this.srx = trunc(this.x + rcx);
        this.sry = trunc(n2);
        this.srz = trunc(this.z + rcz);
        this.sprk_ = 5;
      } else {
        this.srx = trunc(n);
        this.sry = trunc(n2);
        this.srz = trunc(n3);
      }
    }
    if (n4 === 2) {
      this.sprk_ = 6;
    }
    this.rcx = fr(rcx);
    this.rcy = fr(rcy);
    this.rcz = fr(rcz);
  }

  dsprk(graphics2D, b) {
    if (b && this.sprk_ !== 0) {
      let n = idiv(trunc(Math.sqrt(this.rcx * this.rcx + this.rcy * this.rcy + this.rcz * this.rcz)), 10);
      if (n > 5) {
        let b2 = false;
        // Bytecode showed iadd for sum of squares; wrapped with i32() per §2b
        if (this.dist < Math.sqrt(i32(
          Math.imul(this.m.x + this.m.cx - this.srx, this.m.x + this.m.cx - this.srx) +
          Math.imul(this.m.y + this.m.cy - this.sry, this.m.y + this.m.cy - this.sry) +
          Math.imul(this.m.z - this.srz, this.m.z - this.srz)
        ))) {
          b2 = true;
        }
        if (n > 33) {
          n = 33;
        }
        // Spawning is once per tick. Left unguarded, every interpolated frame
        // seeded another n sparks from the same crash.
        let n2 = this.m.interpolating ? n : 0;
        for (let i = 0; i < 100 && n2 !== n; ++i) {
          if (this.rtg[i] === 0) {
            this.rtg[i] = 1;
            this.rbef[i] = b2;
            ++n2;
          }
          if (n2 === n) {
            break;
          }
        }
      }
    }
    for (let j = 0; j < 100; ++j) {
      if (this.rtg[j] !== 0 && ((this.rbef[j] && b) || (!this.rbef[j] && !b))) {
        // Same shape as pdust's stage 1: rolled once, on the tick that
        // advances the spark off stage 1.
        if (this.rtg[j] === 1 && !this.m.interpolating) {
          if (this.sprk_ < 5) {
            this.rx[j] = trunc(this.srx + 3 - fr(this.m.random() * 6.7));
            this.ry[j] = trunc(this.sry + 3 - fr(this.m.random() * 6.7));
            this.rz[j] = trunc(this.srz + 3 - fr(this.m.random() * 6.7));
          } else {
            this.rx[j] = trunc(this.srx + 10 - fr(this.m.random() * 20.0));
            this.ry[j] = trunc(this.sry - fr(this.m.random() * 4.0));
            this.rz[j] = trunc(this.srz + 10 - fr(this.m.random() * 20.0));
          }
          const n3 = trunc(Math.sqrt(this.rcx * this.rcx + this.rcy * this.rcy + this.rcz * this.rcz));
          const n4 = fr(0.2 + 0.4 * this.m.random());
          const n5 = fr(fr(this.m.random() * this.m.random()) * this.m.random());
          let n6 = 1.0;
          if (this.m.random() > this.m.random()) {
            if (this.m.random() > this.m.random()) {
              n6 *= -1.0;
            }
            this.vrx[j] = -fr(fr(this.rcx + fr(fr(n3 * (1.0 - this.rcx / n3)) * n5 * n6)) * n4);
          }
          if (this.m.random() > this.m.random()) {
            if (this.m.random() > this.m.random()) {
              n6 *= -1.0;
            }
            if (this.sprk_ === 5) {
              n6 = 1.0;
            }
            this.vry[j] = -fr(fr(this.rcy + fr(fr(n3 * (1.0 - this.rcy / n3)) * n5 * n6)) * n4);
          }
          if (this.m.random() > this.m.random()) {
            if (this.m.random() > this.m.random()) {
              n6 *= -1.0;
            }
            this.vrz[j] = -fr(fr(this.rcz + fr(fr(n3 * (1.0 - this.rcz / n3)) * n5 * n6)) * n4);
          }
        }
        // Compound assignment rewrites per §2: rx[n7] += (int)this.vrx[j], etc.
        if (!this.m.interpolating) {
          this.rx[j] = trunc(this.rx[j] + this.vrx[j]);
          this.ry[j] = trunc(this.ry[j] + this.vry[j]);
          this.rz[j] = trunc(this.rz[j] + this.vrz[j]);
        }

        const n10 = this.m.cx + trunc(fr(fr((this.rx[j] - this.m.x - this.m.cx) * this.m.cos(this.m.xz)) - fr((this.rz[j] - this.m.z - this.m.cz) * this.m.sin(this.m.xz))));
        const n11 = this.m.cz + trunc(fr(fr((this.rx[j] - this.m.x - this.m.cx) * this.m.sin(this.m.xz)) + fr((this.rz[j] - this.m.z - this.m.cz) * this.m.cos(this.m.xz))));
        const n12 = this.m.cy + trunc(fr(fr((this.ry[j] - this.m.y - this.m.cy) * this.m.cos(this.m.zy)) - fr((n11 - this.m.cz) * this.m.sin(this.m.zy))));
        const n13 = this.m.cz + trunc(fr(fr((this.ry[j] - this.m.y - this.m.cy) * this.m.sin(this.m.zy)) + fr((n11 - this.m.cz) * this.m.cos(this.m.zy))));
        const n14 = this.m.cx + trunc(fr(fr((this.rx[j] - this.m.x - this.m.cx + this.vrx[j]) * this.m.cos(this.m.xz)) - fr((this.rz[j] - this.m.z - this.m.cz + this.vrz[j]) * this.m.sin(this.m.xz))));
        const n15 = this.m.cz + trunc(fr(fr((this.rx[j] - this.m.x - this.m.cx + this.vrx[j]) * this.m.sin(this.m.xz)) + fr((this.rz[j] - this.m.z - this.m.cz + this.vrz[j]) * this.m.cos(this.m.xz))));
        const n16 = this.m.cy + trunc(fr(fr((this.ry[j] - this.m.y - this.m.cy + this.vry[j]) * this.m.cos(this.m.zy)) - fr((n15 - this.m.cz) * this.m.sin(this.m.zy))));
        const n17 = this.m.cz + trunc(fr(fr((this.ry[j] - this.m.y - this.m.cy + this.vry[j]) * this.m.sin(this.m.zy)) + fr((n15 - this.m.cz) * this.m.cos(this.m.zy))));
        const xs = this.xs(n10, n13);
        const ys = this.ys(n12, n13);
        const xs2 = this.xs(n14, n17);
        const ys2 = this.ys(n16, n17);
        if (xs < this.m.iw && xs2 < this.m.iw) {
          this.rtg[j] = 0;
        }
        if (xs > this.m.w && xs2 > this.m.w) {
          this.rtg[j] = 0;
        }
        if (ys < this.m.ih && ys2 < this.m.ih) {
          this.rtg[j] = 0;
        }
        if (ys > this.m.h && ys2 > this.m.h) {
          this.rtg[j] = 0;
        }
        if (this.ry[j] > 250) {
          this.rtg[j] = 0;
        }
        if (this.rtg[j] !== 0) {
          let r = 255;
          let g = 197 - 30 * this.rtg[j];
          let b3 = 0;
          for (let k = 0; k < 16; ++k) {
            if (n13 > this.m.fade[k]) {
              r = idiv(r * this.m.fogd + this.m.cfade[0], this.m.fogd + 1);
              g = idiv(g * this.m.fogd + this.m.cfade[1], this.m.fogd + 1);
              b3 = idiv(b3 * this.m.fogd + this.m.cfade[2], this.m.fogd + 1);
            }
          }
          graphics2D.setColor(r, g, b3);
          graphics2D.drawLine(xs, ys, xs2, ys2);
          if (!this.m.interpolating) {
            this.vrx[j] = fr(this.vrx[j] * 0.8);
            this.vry[j] = fr(this.vry[j] * 0.8);
            this.vrz[j] = fr(this.vrz[j] * 0.8);
            if (this.rtg[j] === 3) {
              this.rtg[j] = 0;
            } else {
              const rtg = this.rtg;
              const n18 = j;
              ++rtg[n18];
            }
          }
        }
      }
    }
    if (this.sprk_ !== 0) {
      this.sprk_ = 0;
    }
  }

  xs(n, n2) {
    if (n2 < 50) {
      n2 = 50;
    }
    return i32(idiv(Math.imul(n2 - this.m.focus_point, this.m.cx - n), n2) + n);
  }

  ys(n, n2) {
    if (n2 < 50) {
      n2 = 50;
    }
    return i32(idiv(Math.imul(n2 - this.m.focus_point, this.m.cy - n), n2) + n);
  }

  getvalue(s, s2, n) {
    let n2 = 0;
    let string = '';
    for (let i = s.length + 1; i < s2.length; ++i) {
      const string2 = '' + s2[i];
      if (string2 === ',' || string2 === ')') {
        ++n2;
        ++i;
      }
      if (n2 === n) {
        string += s2[i];
      }
    }
    return trunc(parseFloat(string));
  }

  getpy(n, n2, n3) {
    const dx = idiv(n - this.x, 10);
    const dy = idiv(n2 - this.y, 10);
    const dz = idiv(n3 - this.z, 10);
    return i32(i32(Math.imul(dx, dx) + Math.imul(dy, dy)) + Math.imul(dz, dz));
  }

  py(n, n2, n3, n4) {
    return i32(Math.imul(n - n2, n - n2) + Math.imul(n3 - n4, n3 - n4));
  }

  rot(array, array2, n, n2, n3, n4) {
    if (n3 !== 0) {
      for (let i = 0; i < n4; ++i) {
        const n5 = array[i];
        const n6 = array2[i];
        array[i] = n + trunc(fr(fr((n5 - n) * this.m.cos(n3)) - fr((n6 - n2) * this.m.sin(n3))));
        array2[i] = n2 + trunc(fr(fr((n5 - n) * this.m.sin(n3)) + fr((n6 - n2) * this.m.cos(n3))));
      }
    }
  }
}
