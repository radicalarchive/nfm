// Transpiled from java-src/Wheels.java, line by line.
//
// Wheel geometry builder: setrims() sets rim colour/size/depth, make() emits
// 20 Plane objects forming a wheel's hub face + 6 spoke triangles + 12 tyre
// side-panels. Called once per wheel at car-load time.
//
// Numeric conventions:
//   trunc(x)   every Java (int) cast of a float or double
//   fr(x)      every float-typed intermediate (the +-*/ with float literals)
// The expressions `8.66 * this.size` use DOUBLE arithmetic in the bytecode
// (i2d, f2d, dmul, dadd/dsub, d2i) because 8.66 is a double literal, so no
// fr() is needed there.
//
// No compound-assignment hazards (§2): grep found zero `+= (int)(` sites.

import { trunc, fr } from './java.js';
import { Plane } from './Plane.js';

export class Wheels {
  constructor() {
    this.ground = 0;
    this.mast = 0;
    this.sparkat = 0;
    this.rc = new Int32Array([120, 120, 120]);
    this.size = 2.0;
    this.depth = 3.0;
    this.sparkat = 0;
    this.ground = 0;
  }

  setrims(n, n2, n3, n4, n5) {
    this.rc[0] = n;
    this.rc[1] = n2;
    this.rc[2] = n3;
    this.size = fr(n4 / 10.0);
    if (this.size < 0.0) {
      this.size = 0.0;
    }
    this.depth = fr(n5 / 10.0);
    if (fr(this.depth / this.size) > 41.0) {
      this.depth = fr(this.size * 41.0);
    }
    if (fr(this.depth / this.size) < -25.0) {
      this.depth = -(fr(this.size * 25.0));
    }
  }

  make(medium, trackers, array, n, n2, n3, n4, n5, n6, n7, n8) {
    const array2 = new Int32Array(20);
    const array3 = new Int32Array(20);
    const array4 = new Int32Array(20);
    const array5 = new Int32Array([45, 45, 45]);
    let n9 = 0;
    const n10 = fr(n6 / 10.0);
    const n11 = fr(n7 / 10.0);
    if (n5 === 11) {
      n9 = trunc(fr(n2 + fr(4.0 * n10)));
    }
    this.sparkat = trunc(fr(n11 * 24.0));
    this.ground = trunc(fr(n3 + fr(13.0 * n11)));
    let n12 = -1;
    if (n2 < 0) {
      n12 = 1;
    }
    for (let i = 0; i < 20; ++i) {
      array2[i] = trunc(fr(n2 - fr(4.0 * n10)));
    }
    array3[0] = trunc(fr(n3 - fr(9.1923 * n11)));
    array4[0] = trunc(fr(n4 + fr(9.1923 * n11)));
    array3[1] = trunc(fr(n3 - fr(12.557 * n11)));
    array4[1] = trunc(fr(n4 + fr(3.3646 * n11)));
    array3[2] = trunc(fr(n3 - fr(12.557 * n11)));
    array4[2] = trunc(fr(n4 - fr(3.3646 * n11)));
    array3[3] = trunc(fr(n3 - fr(9.1923 * n11)));
    array4[3] = trunc(fr(n4 - fr(9.1923 * n11)));
    array3[4] = trunc(fr(n3 - fr(3.3646 * n11)));
    array4[4] = trunc(fr(n4 - fr(12.557 * n11)));
    array3[5] = trunc(fr(n3 + fr(3.3646 * n11)));
    array4[5] = trunc(fr(n4 - fr(12.557 * n11)));
    array3[6] = trunc(fr(n3 + fr(9.1923 * n11)));
    array4[6] = trunc(fr(n4 - fr(9.1923 * n11)));
    array3[7] = trunc(fr(n3 + fr(12.557 * n11)));
    array4[7] = trunc(fr(n4 - fr(3.3646 * n11)));
    array3[8] = trunc(fr(n3 + fr(12.557 * n11)));
    array4[8] = trunc(fr(n4 + fr(3.3646 * n11)));
    array3[9] = trunc(fr(n3 + fr(9.1923 * n11)));
    array4[9] = trunc(fr(n4 + fr(9.1923 * n11)));
    array3[10] = trunc(fr(n3 + fr(3.3646 * n11)));
    array4[10] = trunc(fr(n4 + fr(12.557 * n11)));
    array3[11] = trunc(fr(n3 - fr(3.3646 * n11)));
    array4[11] = trunc(fr(n4 + fr(12.557 * n11)));
    array3[12] = n3;
    array4[12] = trunc(fr(n4 + fr(10.0 * this.size)));
    array3[13] = trunc(n3 + 8.66 * this.size);
    array4[13] = trunc(fr(n4 + fr(5.0 * this.size)));
    array3[14] = trunc(n3 + 8.66 * this.size);
    array4[14] = trunc(fr(n4 - fr(5.0 * this.size)));
    array3[15] = n3;
    array4[15] = trunc(fr(n4 - fr(10.0 * this.size)));
    array3[16] = trunc(n3 - 8.66 * this.size);
    array4[16] = trunc(fr(n4 - fr(5.0 * this.size)));
    array3[17] = trunc(n3 - 8.66 * this.size);
    array4[17] = trunc(fr(n4 + fr(5.0 * this.size)));
    array3[18] = n3;
    array4[18] = trunc(fr(n4 + fr(10.0 * this.size)));
    array3[19] = trunc(fr(n3 - fr(3.3646 * n11)));
    array4[19] = trunc(fr(n4 + fr(12.557 * n11)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 20, array5, 0, n8, 0, n9, n3, n4, 7, 0, false, 0, false);
    array[n].master = 1;
    ++n;
    array2[2] = trunc(fr(n2 - fr(this.depth * n10)));
    array3[2] = n3;
    array4[2] = n4;
    let n13 = trunc(fr(n8 - fr(fr(this.depth / this.size) * 4.0)));
    if (n13 < -16) {
      n13 = -16;
    }
    array3[0] = n3;
    array4[0] = trunc(fr(n4 + fr(10.0 * this.size)));
    array3[1] = trunc(n3 + 8.66 * this.size);
    array4[1] = trunc(fr(n4 + fr(5.0 * this.size)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 3, this.rc, 0, n13, 0, n9, n3, n4, 7, 0, false, 0, false);
    if (fr(this.depth / this.size) < 7.0) {
      array[n].master = 2;
    }
    ++n;
    array3[0] = trunc(n3 + 8.66 * this.size);
    array4[0] = trunc(fr(n4 + fr(5.0 * this.size)));
    array3[1] = trunc(n3 + 8.66 * this.size);
    array4[1] = trunc(fr(n4 - fr(5.0 * this.size)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 3, this.rc, 0, n13, 0, n9, n3, n4, 7, 0, false, 0, false);
    if (fr(this.depth / this.size) < 7.0) {
      array[n].master = 2;
    }
    ++n;
    array3[0] = trunc(n3 + 8.66 * this.size);
    array4[0] = trunc(fr(n4 - fr(5.0 * this.size)));
    array3[1] = n3;
    array4[1] = trunc(fr(n4 - fr(10.0 * this.size)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 3, this.rc, 0, n13, 0, n9, n3, n4, 7, 0, false, 0, false);
    if (fr(this.depth / this.size) < 7.0) {
      array[n].master = 2;
    }
    ++n;
    array3[0] = n3;
    array4[0] = trunc(fr(n4 - fr(10.0 * this.size)));
    array3[1] = trunc(n3 - 8.66 * this.size);
    array4[1] = trunc(fr(n4 - fr(5.0 * this.size)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 3, this.rc, 0, n13, 0, n9, n3, n4, 7, 0, false, 0, false);
    if (fr(this.depth / this.size) < 7.0) {
      array[n].master = 2;
    }
    ++n;
    array3[0] = trunc(n3 - 8.66 * this.size);
    array4[0] = trunc(fr(n4 - fr(5.0 * this.size)));
    array3[1] = trunc(n3 - 8.66 * this.size);
    array4[1] = trunc(fr(n4 + fr(5.0 * this.size)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 3, this.rc, 0, n13, 0, n9, n3, n4, 7, 0, false, 0, false);
    if (fr(this.depth / this.size) < 7.0) {
      array[n].master = 2;
    }
    ++n;
    array3[0] = trunc(n3 - 8.66 * this.size);
    array4[0] = trunc(fr(n4 + fr(5.0 * this.size)));
    array3[1] = n3;
    array4[1] = trunc(fr(n4 + fr(10.0 * this.size)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 3, this.rc, 0, n13, 0, n9, n3, n4, 7, 0, false, 0, false);
    if (fr(this.depth / this.size) < 7.0) {
      array[n].master = 2;
    }
    ++n;
    array2[0] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[0] = trunc(fr(n3 - fr(12.557 * n11)));
    array4[0] = trunc(fr(n4 + fr(3.3646 * n11)));
    array2[1] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[1] = trunc(fr(n3 - fr(12.557 * n11)));
    array4[1] = trunc(fr(n4 - fr(3.3646 * n11)));
    array2[2] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[2] = trunc(fr(n3 - fr(12.557 * n11)));
    array4[2] = trunc(fr(n4 - fr(3.3646 * n11)));
    array2[3] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[3] = trunc(fr(n3 - fr(12.557 * n11)));
    array4[3] = trunc(fr(n4 + fr(3.3646 * n11)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 4, array5, 0, n8, -1 * n12, n9, n3, n4, 7, 0, false, 0, true);
    ++n;
    array2[0] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[0] = trunc(fr(n3 - fr(9.1923 * n11)));
    array4[0] = trunc(fr(n4 - fr(9.1923 * n11)));
    array2[1] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[1] = trunc(fr(n3 - fr(12.557 * n11)));
    array4[1] = trunc(fr(n4 - fr(3.3646 * n11)));
    array2[2] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[2] = trunc(fr(n3 - fr(12.557 * n11)));
    array4[2] = trunc(fr(n4 - fr(3.3646 * n11)));
    array2[3] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[3] = trunc(fr(n3 - fr(9.1923 * n11)));
    array4[3] = trunc(fr(n4 - fr(9.1923 * n11)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 4, array5, 0, n8, 1 * n12, n9, n3, n4, 7, 0, false, 0, true);
    ++n;
    array2[0] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[0] = trunc(fr(n3 - fr(9.1923 * n11)));
    array4[0] = trunc(fr(n4 - fr(9.1923 * n11)));
    array2[1] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[1] = trunc(fr(n3 - fr(3.3646 * n11)));
    array4[1] = trunc(fr(n4 - fr(12.557 * n11)));
    array2[2] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[2] = trunc(fr(n3 - fr(3.3646 * n11)));
    array4[2] = trunc(fr(n4 - fr(12.557 * n11)));
    array2[3] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[3] = trunc(fr(n3 - fr(9.1923 * n11)));
    array4[3] = trunc(fr(n4 - fr(9.1923 * n11)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 4, array5, 0, n8, 1 * n12, n9, n3, n4, 7, 0, false, 0, true);
    ++n;
    array2[0] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[0] = trunc(fr(n3 - fr(3.3646 * n11)));
    array4[0] = trunc(fr(n4 - fr(12.557 * n11)));
    array2[1] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[1] = trunc(fr(n3 + fr(3.3646 * n11)));
    array4[1] = trunc(fr(n4 - fr(12.557 * n11)));
    array2[2] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[2] = trunc(fr(n3 + fr(3.3646 * n11)));
    array4[2] = trunc(fr(n4 - fr(12.557 * n11)));
    array2[3] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[3] = trunc(fr(n3 - fr(3.3646 * n11)));
    array4[3] = trunc(fr(n4 - fr(12.557 * n11)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 4, array5, 0, n8, -1 * n12, n9, n3, n4, 7, 0, false, 0, true);
    ++n;
    array2[0] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[0] = trunc(fr(n3 + fr(9.1923 * n11)));
    array4[0] = trunc(fr(n4 - fr(9.1923 * n11)));
    array2[1] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[1] = trunc(fr(n3 + fr(3.3646 * n11)));
    array4[1] = trunc(fr(n4 - fr(12.557 * n11)));
    array2[2] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[2] = trunc(fr(n3 + fr(3.3646 * n11)));
    array4[2] = trunc(fr(n4 - fr(12.557 * n11)));
    array2[3] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[3] = trunc(fr(n3 + fr(9.1923 * n11)));
    array4[3] = trunc(fr(n4 - fr(9.1923 * n11)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 4, array5, 0, n8, 1 * n12, n9, n3, n4, 7, 0, false, 0, true);
    ++n;
    array2[0] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[0] = trunc(fr(n3 + fr(9.1923 * n11)));
    array4[0] = trunc(fr(n4 - fr(9.1923 * n11)));
    array2[1] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[1] = trunc(fr(n3 + fr(12.557 * n11)));
    array4[1] = trunc(fr(n4 - fr(3.3646 * n11)));
    array2[2] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[2] = trunc(fr(n3 + fr(12.557 * n11)));
    array4[2] = trunc(fr(n4 - fr(3.3646 * n11)));
    array2[3] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[3] = trunc(fr(n3 + fr(9.1923 * n11)));
    array4[3] = trunc(fr(n4 - fr(9.1923 * n11)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 4, array5, 0, n8, 1 * n12, n9, n3, n4, 7, 0, false, 0, true);
    ++n;
    array2[0] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[0] = trunc(fr(n3 + fr(12.557 * n11)));
    array4[0] = trunc(fr(n4 - fr(3.3646 * n11)));
    array2[1] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[1] = trunc(fr(n3 + fr(12.557 * n11)));
    array4[1] = trunc(fr(n4 + fr(3.3646 * n11)));
    array2[2] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[2] = trunc(fr(n3 + fr(12.557 * n11)));
    array4[2] = trunc(fr(n4 + fr(3.3646 * n11)));
    array2[3] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[3] = trunc(fr(n3 + fr(12.557 * n11)));
    array4[3] = trunc(fr(n4 - fr(3.3646 * n11)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 4, array5, 0, n8, -1 * n12, n9, n3, n4, 7, 0, false, 0, true);
    ++n;
    array2[0] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[0] = trunc(fr(n3 + fr(9.1923 * n11)));
    array4[0] = trunc(fr(n4 + fr(9.1923 * n11)));
    array2[1] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[1] = trunc(fr(n3 + fr(12.557 * n11)));
    array4[1] = trunc(fr(n4 + fr(3.3646 * n11)));
    array2[2] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[2] = trunc(fr(n3 + fr(12.557 * n11)));
    array4[2] = trunc(fr(n4 + fr(3.3646 * n11)));
    array2[3] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[3] = trunc(fr(n3 + fr(9.1923 * n11)));
    array4[3] = trunc(fr(n4 + fr(9.1923 * n11)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 4, array5, 0, n8, 1 * n12, n9, n3, n4, 7, 0, false, 0, true);
    ++n;
    array2[0] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[0] = trunc(fr(n3 + fr(9.1923 * n11)));
    array4[0] = trunc(fr(n4 + fr(9.1923 * n11)));
    array2[1] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[1] = trunc(fr(n3 + fr(3.3646 * n11)));
    array4[1] = trunc(fr(n4 + fr(12.557 * n11)));
    array2[2] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[2] = trunc(fr(n3 + fr(3.3646 * n11)));
    array4[2] = trunc(fr(n4 + fr(12.557 * n11)));
    array2[3] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[3] = trunc(fr(n3 + fr(9.1923 * n11)));
    array4[3] = trunc(fr(n4 + fr(9.1923 * n11)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 4, array5, 0, n8, 1 * n12, n9, n3, n4, 7, 0, false, 0, true);
    ++n;
    array2[0] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[0] = trunc(fr(n3 + fr(3.3646 * n11)));
    array4[0] = trunc(fr(n4 + fr(12.557 * n11)));
    array2[1] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[1] = trunc(fr(n3 - fr(3.3646 * n11)));
    array4[1] = trunc(fr(n4 + fr(12.557 * n11)));
    array2[2] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[2] = trunc(fr(n3 - fr(3.3646 * n11)));
    array4[2] = trunc(fr(n4 + fr(12.557 * n11)));
    array2[3] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[3] = trunc(fr(n3 + fr(3.3646 * n11)));
    array4[3] = trunc(fr(n4 + fr(12.557 * n11)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 4, array5, 0, n8, -1 * n12, n9, n3, n4, 7, 0, false, 0, true);
    ++n;
    array2[0] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[0] = trunc(fr(n3 - fr(9.1923 * n11)));
    array4[0] = trunc(fr(n4 + fr(9.1923 * n11)));
    array2[1] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[1] = trunc(fr(n3 - fr(3.3646 * n11)));
    array4[1] = trunc(fr(n4 + fr(12.557 * n11)));
    array2[2] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[2] = trunc(fr(n3 - fr(3.3646 * n11)));
    array4[2] = trunc(fr(n4 + fr(12.557 * n11)));
    array2[3] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[3] = trunc(fr(n3 - fr(9.1923 * n11)));
    array4[3] = trunc(fr(n4 + fr(9.1923 * n11)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 4, array5, 0, n8, 1 * n12, n9, n3, n4, 7, 0, false, 0, true);
    ++n;
    array2[0] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[0] = trunc(fr(n3 - fr(9.1923 * n11)));
    array4[0] = trunc(fr(n4 + fr(9.1923 * n11)));
    array2[1] = trunc(fr(n2 - fr(4.0 * n10)));
    array3[1] = trunc(fr(n3 - fr(12.557 * n11)));
    array4[1] = trunc(fr(n4 + fr(3.3646 * n11)));
    array2[2] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[2] = trunc(fr(n3 - fr(12.557 * n11)));
    array4[2] = trunc(fr(n4 + fr(3.3646 * n11)));
    array2[3] = trunc(fr(n2 + fr(4.0 * n10)));
    array3[3] = trunc(fr(n3 - fr(9.1923 * n11)));
    array4[3] = trunc(fr(n4 + fr(9.1923 * n11)));
    array[n] = new Plane(medium, trackers, array2, array4, array3, 4, array5, 0, n8, 1 * n12, n9, n3, n4, 7, 0, false, 0, true);
    ++n;
  }
}
