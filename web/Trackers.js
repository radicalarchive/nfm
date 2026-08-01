// Transpiled from java-src/Trackers.java, line by line.
//
// Spatial index over the track's collision volumes: devidetrackers() buckets
// every tracker into a 3000-unit grid so Plane.s() and the physics only test
// nearby ones.

import { i32, idiv, intArray, objArray } from './java.js';

const MAX = 6700;

export class Trackers {
  constructor() {
    this.x = intArray(MAX);
    this.y = intArray(MAX);
    this.z = intArray(MAX);
    this.xy = intArray(MAX);
    this.zy = intArray(MAX);
    this.skd = intArray(MAX);
    this.dam = intArray(MAX);
    this.notwall = new Array(MAX).fill(false);
    this.decor = new Array(MAX).fill(false);
    this.c = objArray(MAX);
    for (let i = 0; i < MAX; ++i) this.c[i] = intArray(3);
    this.radx = intArray(MAX);
    this.radz = intArray(MAX);
    this.rady = intArray(MAX);
    this.nt = 0;
    this.sx = 0;
    this.sz = 0;
    this.ncx = 0;
    this.ncz = 0;
    this.sect = null;
  }

  devidetrackers(sx, n, sz, n2) {
    this.sect = null;
    this.sx = sx;
    this.sz = sz;
    this.ncx = idiv(n, 3000);
    if (this.ncx <= 0) this.ncx = 1;
    this.ncz = idiv(n2, 3000);
    if (this.ncz <= 0) this.ncz = 1;
    this.sect = objArray(this.ncx);
    for (let i = 0; i < this.ncx; ++i) {
      this.sect[i] = objArray(this.ncz);
    }
    for (let i = 0; i < this.ncx; ++i) {
      for (let j = 0; j < this.ncz; ++j) {
        const n3 = this.sx + i * 3000 + 1500;
        const n4 = this.sz + j * 3000 + 1500;
        const array = intArray(MAX);
        let n5 = 0;
        for (let k = 0; k < this.nt; ++k) {
          const py = this.py(n3, this.x[k], n4, this.z[k]);
          if (py < 20250000 && py > 0 && this.dam[k] !== 167) {
            array[n5] = k;
            ++n5;
          }
        }
        // dam == 167 marks the always-present boundary walls; they go into the
        // edge cells only.
        if (i === 0 || j === 0 || i === this.ncx - 1 || j === this.ncz - 1) {
          for (let l = 0; l < this.nt; ++l) {
            if (this.dam[l] === 167) {
              array[n5] = l;
              ++n5;
            }
          }
        }
        if (n5 === 0) {
          array[n5] = 0;
          ++n5;
        }
        this.sect[i][j] = intArray(n5);
        for (let n6 = 0; n6 < n5; ++n6) {
          this.sect[i][j][n6] = array[n6];
        }
      }
    }
    for (let n7 = 0; n7 < this.nt; ++n7) {
      if (this.dam[n7] === 167) this.dam[n7] = 1;
    }
    --this.ncx;
    --this.ncz;
  }

  /**
   * Squared planar distance, all-int in Java.
   *
   * Both the multiplies AND the addition wrap at 32 bits (imul, imul, iadd).
   * This is NOT academic: stage coordinates run to +-83000, so a far pair
   * squares well past 2^31 and the wrapped result can land back inside the
   * `py < 20250000 && py > 0` guard in devidetrackers() -- putting a distant
   * tracker into a sector, exactly as the original game does. Dropping the
   * outer i32() silently changes which trackers a sector contains, and with
   * it the collision behaviour.
   */
  py(n, n2, n3, n4) {
    return i32(Math.imul(n - n2, n - n2) + Math.imul(n3 - n4, n3 - n4));
  }
}
