// Transpiled from java-src/CheckPoints.java, line by line.
//
// Local names are kept as procyon emitted them (array, array2, n6, ...) even
// though they are ugly: the point is that this file diffs against the Java
// side by side. Do not rename or restructure.
//
// §2 compound-assignment audit: ZERO instances of `+= (int)(` or `-= (int)(`
// found in CheckPoints.java.  No decompiler rewrite needed.

import { i32, idiv, trunc, fr, intArray, floatArray, random } from './java.js';

export class CheckPoints {
  constructor() {
    this.x = intArray(140);
    this.z = intArray(140);
    this.y = intArray(140);
    this.typ = intArray(140);
    this.pcs = 0;
    this.nsp = 0;
    this.n = 0;
    this.fx = intArray(5);
    this.fz = intArray(5);
    this.fy = intArray(5);
    this.roted = new Array(5).fill(false);
    this.special = new Array(5).fill(false);
    this.fn = 0;
    this.stage = trunc(random() * 27.0) + 1;
    this.nlaps = 0;
    this.nfix = 0;
    this.notb = false;
    this.name = "hogan rewish";
    this.maker = "";
    this.pubt = 0;
    this.trackname = "";
    this.trackvol = 200;
    this.top20 = 0;
    this.nto = 0;
    this.pos = Int32Array.from([7, 7, 7, 7, 7, 7, 7, 7]);
    this.clear = Int32Array.from([0, 0, 0, 0, 0, 0, 0, 0]);
    this.dested = Int32Array.from([0, 0, 0, 0, 0, 0, 0, 0]);
    this.magperc = Float32Array.from([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
    this.wasted = 0;
    this.haltall = false;
    this.pcleared = 0;
    this.opx = intArray(8);
    this.opz = intArray(8);
    this.onscreen = intArray(8);
    this.omxz = intArray(8);
    this.catchfin = 0;
    this.postwo = 0;
    this.prox = 0.0;
  }

  checkstat(array, array2, record, n, n2, n3) {
    if (!this.haltall) {
      this.pcleared = array[n2].pcleared;
      for (let i = 0; i < n; ++i) {
        this.magperc[i] = array[i].hitmag / array[i].cd.maxmag[array[i].cn];
        if (this.magperc[i] > 1.0) {
          this.magperc[i] = 1.0;
        }
        this.pos[i] = 0;
        this.onscreen[i] = array2[i].dist;
        this.opx[i] = array2[i].x;
        this.opz[i] = array2[i].z;
        this.omxz[i] = array[i].mxz;
        if (this.dested[i] === 0) {
          this.clear[i] = array[i].clear;
        }
        else {
          this.clear[i] = -1;
        }
        array[i].outshakedam = array[i].shakedam;
        array[i].shakedam = 0;
      }
      for (let j = 0; j < n; ++j) {
        for (let k = j + 1; k < n; ++k) {
          if (this.clear[j] !== this.clear[k]) {
            if (this.clear[j] < this.clear[k]) {
              const pos = this.pos;
              const n4 = j;
              ++pos[n4];
            }
            else {
              const pos2 = this.pos;
              const n5 = k;
              ++pos2[n5];
            }
          }
          else {
            let n6 = array[j].pcleared + 1;
            if (n6 >= this.n) {
              n6 = 0;
            }
            while (this.typ[n6] <= 0) {
              if (++n6 >= this.n) {
                n6 = 0;
              }
            }
            if (this.py(idiv(array2[j].x, 100), idiv(this.x[n6], 100), idiv(array2[j].z, 100), idiv(this.z[n6], 100)) > this.py(idiv(array2[k].x, 100), idiv(this.x[n6], 100), idiv(array2[k].z, 100), idiv(this.z[n6], 100))) {
              const pos3 = this.pos;
              const n7 = j;
              ++pos3[n7];
            }
            else {
              const pos4 = this.pos;
              const n8 = k;
              ++pos4[n8];
            }
          }
        }
      }
      if (this.stage > 2) {
        for (let l = 0; l < n; ++l) {
          if (this.clear[l] === this.nlaps * this.nsp && this.pos[l] === 0) {
            if (l === n2) {
              for (let postwo = 0; postwo < n; ++postwo) {
                if (this.pos[postwo] === 1) {
                  this.postwo = postwo;
                }
              }
              if (this.py(idiv(this.opx[n2], 100), idiv(this.opx[this.postwo], 100), idiv(this.opz[n2], 100), idiv(this.opz[this.postwo], 100)) < 14000 && this.clear[n2] - this.clear[this.postwo] === 1) {
                this.catchfin = 30;
              }
            }
            else if (this.pos[n2] === 1 && this.py(idiv(this.opx[n2], 100), idiv(this.opx[l], 100), idiv(this.opz[n2], 100), idiv(this.opz[l], 100)) < 14000 && this.clear[l] - this.clear[n2] === 1) {
              this.catchfin = 30;
              this.postwo = l;
            }
          }
        }
      }
    }
    this.wasted = 0;
    for (let n9 = 0; n9 < n; ++n9) {
      if ((n2 !== n9 || n3 >= 2) && array[n9].dest) {
        ++this.wasted;
      }
    }
    if (this.catchfin !== 0 && n3 < 2) {
      --this.catchfin;
      if (this.catchfin === 0) {
        record.cotchinow(this.postwo);
        record.closefinish = this.pos[n2] + 1;
      }
    }
  }

  calprox() {
    let n = 0;
    for (let i = 0; i < this.n - 1; ++i) {
      for (let j = i + 1; j < this.n; ++j) {
        if (Math.abs(this.x[i] - this.x[j]) > n) {
          n = Math.abs(this.x[i] - this.x[j]);
        }
        if (Math.abs(this.z[i] - this.z[j]) > n) {
          n = Math.abs(this.z[i] - this.z[j]);
        }
      }
    }
    this.prox = fr(n / 90.0);
  }

  py(n, n2, n3, n4) {
    // imul, imul, iadd -- the ADDITION wraps at 32 bits too. See Trackers.py.
    return i32(Math.imul(n - n2, n - n2) + Math.imul(n3 - n4, n3 - n4));
  }
}
