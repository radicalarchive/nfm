// Transpiled from java-src/Record.java, line by line.

import { idiv, trunc, fr, i32, intArray, floatArray, objArray, HSBtoRGB } from './java.js';
import { ContO } from './ContO.js';

function int2(a, b) {
  const o = objArray(a);
  for (let i = 0; i < a; i++) o[i] = intArray(b);
  return o;
}

function int3(a, b, c) {
  const o = objArray(a);
  for (let i = 0; i < a; i++) o[i] = int2(b, c);
  return o;
}

function float2(a, b) {
  const o = objArray(a);
  for (let i = 0; i < a; i++) o[i] = floatArray(b);
  return o;
}

function float3(a, b, c) {
  const o = objArray(a);
  for (let i = 0; i < a; i++) o[i] = float2(b, c);
  return o;
}

function bool2(a, b) {
  const o = objArray(a);
  for (let i = 0; i < a; i++) o[i] = new Array(b).fill(false);
  return o;
}

export class Record {
  constructor(m) {
    this.caught = 0;
    this.hcaught = false;
    this.prepit = true;
    this.ocar = objArray(8);
    this.cntf = 50;
    this.car = objArray(6);
    for (let i = 0; i < 6; i++) {
      this.car[i] = objArray(8);
    }
    this.squash = int2(6, 8);
    this.fix = intArray(8);
    this.dest = intArray(8);
    this.x = int2(300, 8);
    this.y = int2(300, 8);
    this.z = int2(300, 8);
    this.xy = int2(300, 8);
    this.zy = int2(300, 8);
    this.xz = int2(300, 8);
    this.wxz = int2(300, 8);
    this.wzy = int2(300, 8);
    this.ns = int2(8, 20);
    this.sspark = int3(8, 20, 30);
    this.sx = int3(8, 20, 30);
    this.sy = int3(8, 20, 30);
    this.sz = int3(8, 20, 30);
    this.smag = float3(8, 20, 30);
    this.scx = int3(8, 20, 30);
    this.scz = int3(8, 20, 30);
    this.nr = intArray(8);
    this.rspark = int2(8, 200);
    this.sprk = int2(8, 200);
    this.srx = int2(8, 200);
    this.sry = int2(8, 200);
    this.srz = int2(8, 200);
    this.rcx = float2(8, 200);
    this.rcy = float2(8, 200);
    this.rcz = float2(8, 200);
    this.nry = int2(8, 4);
    this.ry = int3(8, 4, 7);
    this.magy = int3(8, 4, 7);
    this.mtouch = bool2(8, 7);
    this.nrx = int2(8, 4);
    this.rx = int3(8, 4, 7);
    this.magx = int3(8, 4, 7);
    this.nrz = int2(8, 4);
    this.rz = int3(8, 4, 7);
    this.magz = int3(8, 4, 7);
    this.checkpoint = intArray(300);
    this.lastcheck = new Array(300).fill(false);
    this.wasted = 0;
    this.whenwasted = 0;
    this.powered = 0;
    this.closefinish = 0;
    this.starcar = objArray(8);
    this.hsquash = intArray(8);
    this.hfix = Int32Array.from([-1, -1, -1, -1, -1, -1, -1, -1]);
    this.hdest = Int32Array.from([-1, -1, -1, -1, -1, -1, -1, -1]);
    this.hx = int2(300, 8);
    this.hy = int2(300, 8);
    this.hz = int2(300, 8);
    this.hxy = int2(300, 8);
    this.hzy = int2(300, 8);
    this.hxz = int2(300, 8);
    this.hwxz = int2(300, 8);
    this.hwzy = int2(300, 8);
    this.hsspark = int3(8, 20, 30);
    this.hsx = int3(8, 20, 30);
    this.hsy = int3(8, 20, 30);
    this.hsz = int3(8, 20, 30);
    this.hsmag = float3(8, 20, 30);
    this.hscx = int3(8, 20, 30);
    this.hscz = int3(8, 20, 30);
    this.hrspark = int2(8, 200);
    this.hsprk = int2(8, 200);
    this.hsrx = int2(8, 200);
    this.hsry = int2(8, 200);
    this.hsrz = int2(8, 200);
    this.hrcx = float2(8, 200);
    this.hrcy = float2(8, 200);
    this.hrcz = float2(8, 200);
    this.hry = int3(8, 4, 7);
    this.hmagy = int3(8, 4, 7);
    this.hrx = int3(8, 4, 7);
    this.hmagx = int3(8, 4, 7);
    this.hrz = int3(8, 4, 7);
    this.hmagz = int3(8, 4, 7);
    this.hmtouch = bool2(8, 7);
    this.hcheckpoint = intArray(300);
    this.hlastcheck = new Array(300).fill(false);
    this.cntdest = intArray(8);
    this.lastfr = 0;
    this.m = m;
    this.cotchinow(this.caught = 0);
  }

  reset(array) {
    this.caught = 0;
    this.hcaught = false;
    this.wasted = 0;
    this.whenwasted = 0;
    this.closefinish = 0;
    this.powered = 0;
    for (let i = 0; i < 8; ++i) {
      if (this.prepit) {
        this.starcar[i] = new ContO(array[i], 0, 0, 0, 0);
      }
      this.fix[i] = -1;
      this.dest[i] = -1;
      this.cntdest[i] = 0;
    }
    for (let j = 0; j < 6; ++j) {
      for (let k = 0; k < 8; ++k) {
        this.car[j][k] = new ContO(array[k], 0, 0, 0, 0);
        this.squash[j][k] = 0;
      }
    }
    for (let l = 0; l < 8; ++l) {
      this.nr[l] = 0;
      for (let n = 0; n < 200; ++n) {
        this.rspark[l][n] = -1;
      }
      for (let n2 = 0; n2 < 20; ++n2) {
        this.ns[l][n2] = 0;
        for (let n3 = 0; n3 < 30; ++n3) {
          this.sspark[l][n2][n3] = -1;
        }
      }
      for (let n4 = 0; n4 < 4; ++n4) {
        this.nry[l][n4] = 0;
        this.nrx[l][n4] = 0;
        this.nrz[l][n4] = 0;
        for (let n5 = 0; n5 < 7; ++n5) {
          this.ry[l][n4][n5] = -1;
          this.rx[l][n4][n5] = -1;
          this.rz[l][n4][n5] = -1;
        }
      }
    }
    this.prepit = false;
  }

  cotchinow(wasted) {
    if (this.caught >= 300) {
      this.wasted = wasted;
      for (let i = 0; i < 8; ++i) {
        this.starcar[i] = new ContO(this.car[0][i], 0, 0, 0, 0);
        this.hsquash[i] = this.squash[0][i];
        this.hfix[i] = this.fix[i];
        this.hdest[i] = this.dest[i];
      }
      for (let j = 0; j < 300; ++j) {
        for (let k = 0; k < 8; ++k) {
          this.hx[j][k] = this.x[j][k];
          this.hy[j][k] = this.y[j][k];
          this.hz[j][k] = this.z[j][k];
          this.hxy[j][k] = this.xy[j][k];
          this.hzy[j][k] = this.zy[j][k];
          this.hxz[j][k] = this.xz[j][k];
          this.hwxz[j][k] = this.wxz[j][k];
          this.hwzy[j][k] = this.wzy[j][k];
        }
        this.hcheckpoint[j] = this.checkpoint[j];
        this.hlastcheck[j] = this.lastcheck[j];
      }
      for (let l = 0; l < 8; ++l) {
        for (let n = 0; n < 20; ++n) {
          for (let n2 = 0; n2 < 30; ++n2) {
            this.hsspark[l][n][n2] = this.sspark[l][n][n2];
            this.hsx[l][n][n2] = this.sx[l][n][n2];
            this.hsy[l][n][n2] = this.sy[l][n][n2];
            this.hsz[l][n][n2] = this.sz[l][n][n2];
            this.hsmag[l][n][n2] = this.smag[l][n][n2];
            this.hscx[l][n][n2] = this.scx[l][n][n2];
            this.hscz[l][n][n2] = this.scz[l][n][n2];
          }
        }
        for (let n3 = 0; n3 < 200; ++n3) {
          this.hrspark[l][n3] = this.rspark[l][n3];
          this.hsprk[l][n3] = this.sprk[l][n3];
          this.hsrx[l][n3] = this.srx[l][n3];
          this.hsry[l][n3] = this.sry[l][n3];
          this.hsrz[l][n3] = this.srz[l][n3];
          this.hrcx[l][n3] = this.rcx[l][n3];
          this.hrcy[l][n3] = this.rcy[l][n3];
          this.hrcz[l][n3] = this.rcz[l][n3];
        }
      }
      for (let n4 = 0; n4 < 8; ++n4) {
        for (let n5 = 0; n5 < 4; ++n5) {
          for (let n6 = 0; n6 < 7; ++n6) {
            this.hry[n4][n5][n6] = this.ry[n4][n5][n6];
            this.hmagy[n4][n5][n6] = this.magy[n4][n5][n6];
            this.hrx[n4][n5][n6] = this.rx[n4][n5][n6];
            this.hmagx[n4][n5][n6] = this.magx[n4][n5][n6];
            this.hrz[n4][n5][n6] = this.rz[n4][n5][n6];
            this.hmagz[n4][n5][n6] = this.magz[n4][n5][n6];
          }
        }
      }
      for (let n7 = 0; n7 < 8; ++n7) {
        for (let n8 = 0; n8 < 7; ++n8) {
          this.hmtouch[n7][n8] = this.mtouch[n7][n8];
        }
      }
      this.hcaught = true;
    }
  }

  rec(contO, n, n2, n3, n4, n5) {
    if (n === n5) {
      ++this.caught;
    }
    if (this.cntf === 50) {
      for (let i = 0; i < 5; ++i) {
        this.car[i][n] = new ContO(this.car[i + 1][n], 0, 0, 0, 0);
        this.squash[i][n] = this.squash[i + 1][n];
      }
      this.car[5][n] = new ContO(contO, 0, 0, 0, 0);
      this.squash[5][n] = n2;
      this.cntf = 0;
    } else {
      ++this.cntf;
    }
    const fix = this.fix;
    --fix[n];
    if (n4 !== 0) {
      const dest = this.dest;
      --dest[n];
    }
    if (this.dest[n] === 230) {
      if (n === n5) {
        this.cotchinow(n5);
        this.whenwasted = 229;
      } else if (n3 !== 0) {
        this.cotchinow(n);
        this.whenwasted = 165 + n3;
      }
    }
    for (let j = 0; j < 299; ++j) {
      this.x[j][n] = this.x[j + 1][n];
      this.y[j][n] = this.y[j + 1][n];
      this.z[j][n] = this.z[j + 1][n];
      this.zy[j][n] = this.zy[j + 1][n];
      this.xy[j][n] = this.xy[j + 1][n];
      this.xz[j][n] = this.xz[j + 1][n];
      this.wxz[j][n] = this.wxz[j + 1][n];
      this.wzy[j][n] = this.wzy[j + 1][n];
    }
    this.x[299][n] = contO.x;
    this.y[299][n] = contO.y;
    this.z[299][n] = contO.z;
    this.xy[299][n] = contO.xy;
    this.zy[299][n] = contO.zy;
    this.xz[299][n] = contO.xz;
    this.wxz[299][n] = contO.wxz;
    this.wzy[299][n] = contO.wzy;
    if (n === n5) {
      for (let k = 0; k < 299; ++k) {
        this.checkpoint[k] = this.checkpoint[k + 1];
        this.lastcheck[k] = this.lastcheck[k + 1];
      }
      this.checkpoint[299] = contO.m.checkpoint;
      this.lastcheck[299] = contO.m.lastcheck;
    }
    for (let l = 0; l < 20; ++l) {
      if (contO.stg[l] === 1) {
        this.sspark[n][l][this.ns[n][l]] = 300;
        this.sx[n][l][this.ns[n][l]] = contO.sx[l];
        this.sy[n][l][this.ns[n][l]] = contO.sy[l];
        this.sz[n][l][this.ns[n][l]] = contO.sz[l];
        this.smag[n][l][this.ns[n][l]] = contO.osmag[l];
        this.scx[n][l][this.ns[n][l]] = contO.scx[l];
        this.scz[n][l][this.ns[n][l]] = contO.scz[l];
        const array = this.ns[n];
        const n6 = l;
        ++array[n6];
        if (this.ns[n][l] === 30) {
          this.ns[n][l] = 0;
        }
      }
      for (let n7 = 0; n7 < 30; ++n7) {
        const array2 = this.sspark[n][l];
        const n8 = n7;
        --array2[n8];
      }
    }
    if (contO.sprk !== 0) {
      this.rspark[n][this.nr[n]] = 300;
      this.sprk[n][this.nr[n]] = contO.sprk;
      this.srx[n][this.nr[n]] = contO.srx;
      this.sry[n][this.nr[n]] = contO.sry;
      this.srz[n][this.nr[n]] = contO.srz;
      this.rcx[n][this.nr[n]] = contO.rcx;
      this.rcy[n][this.nr[n]] = contO.rcy;
      this.rcz[n][this.nr[n]] = contO.rcz;
      const nr = this.nr;
      ++nr[n];
      if (this.nr[n] === 200) {
        this.nr[n] = 0;
      }
    }
    for (let n9 = 0; n9 < 200; ++n9) {
      const array3 = this.rspark[n];
      const n10 = n9;
      --array3[n10];
    }
    for (let n11 = 0; n11 < 4; ++n11) {
      for (let n12 = 0; n12 < 7; ++n12) {
        const array4 = this.ry[n][n11];
        const n13 = n12;
        --array4[n13];
        const array5 = this.rx[n][n11];
        const n14 = n12;
        --array5[n14];
        const array6 = this.rz[n][n11];
        const n15 = n12;
        --array6[n15];
      }
    }
  }

  play(contO, mad, n, n2) {
    contO.x = this.x[n2][n];
    contO.y = this.y[n2][n];
    contO.z = this.z[n2][n];
    contO.zy = this.zy[n2][n];
    contO.xy = this.xy[n2][n];
    contO.xz = this.xz[n2][n];
    contO.wxz = this.wxz[n2][n];
    contO.wzy = this.wzy[n2][n];
    if (n === 0) {
      contO.m.checkpoint = this.checkpoint[n2];
      contO.m.lastcheck = this.lastcheck[n2];
    }
    if (n2 === 0) {
      this.cntdest[n] = 0;
    }
    if (this.dest[n] === n2) {
      this.cntdest[n] = 7;
    }
    if (n2 === 0 && this.dest[n] < -1) {
      for (let i = 0; i < contO.npl; ++i) {
        if (contO.p[i].wz === 0 || contO.p[i].gr === -17 || contO.p[i].gr === -16) {
          contO.p[i].embos = 13;
        }
      }
    }
    if (this.cntdest[n] !== 0) {
      for (let j = 0; j < contO.npl; ++j) {
        if (contO.p[j].wz === 0 || contO.p[j].gr === -17 || contO.p[j].gr === -16) {
          contO.p[j].embos = 1;
        }
      }
      const cntdest = this.cntdest;
      --cntdest[n];
    }
    for (let k = 0; k < 20; ++k) {
      for (let l = 0; l < 30; ++l) {
        if (this.sspark[n][k][l] === n2) {
          contO.stg[k] = 1;
          contO.sx[k] = this.sx[n][k][l];
          contO.sy[k] = this.sy[n][k][l];
          contO.sz[k] = this.sz[n][k][l];
          contO.osmag[k] = this.smag[n][k][l];
          contO.scx[k] = this.scx[n][k][l];
          contO.scz[k] = this.scz[n][k][l];
        }
      }
    }
    for (let n3 = 0; n3 < 200; ++n3) {
      if (this.rspark[n][n3] === n2) {
        contO.sprk = this.sprk[n][n3];
        contO.srx = this.srx[n][n3];
        contO.sry = this.sry[n][n3];
        contO.srz = this.srz[n][n3];
        contO.rcx = this.rcx[n][n3];
        contO.rcy = this.rcy[n][n3];
        contO.rcz = this.rcz[n][n3];
      }
    }
    for (let n4 = 0; n4 < 4; ++n4) {
      for (let n5 = 0; n5 < 7; ++n5) {
        if (this.ry[n][n4][n5] === n2) {
          this.regy(n4, this.magy[n][n4][n5], this.mtouch[n][n5], contO, mad);
        }
        if (this.rx[n][n4][n5] === n2) {
          this.regx(n4, this.magx[n][n4][n5], contO, mad);
        }
        if (this.rz[n][n4][n5] === n2) {
          this.regz(n4, this.magz[n][n4][n5], contO, mad);
        }
      }
    }
  }

  playh(contO, mad, n, lastfr, n2) {
    contO.x = this.hx[lastfr][n];
    contO.y = this.hy[lastfr][n];
    contO.z = this.hz[lastfr][n];
    contO.zy = this.hzy[lastfr][n];
    contO.xy = this.hxy[lastfr][n];
    contO.xz = this.hxz[lastfr][n];
    contO.wxz = this.hwxz[lastfr][n];
    contO.wzy = this.hwzy[lastfr][n];
    if (n === n2) {
      contO.m.checkpoint = this.hcheckpoint[lastfr];
      contO.m.lastcheck = this.hlastcheck[lastfr];
    }
    if (lastfr === 0) {
      this.cntdest[n] = 0;
    }
    if (this.hdest[n] === lastfr) {
      this.cntdest[n] = 7;
    }
    if (lastfr === 0 && this.hdest[n] < -1) {
      for (let i = 0; i < contO.npl; ++i) {
        if (contO.p[i].wz === 0 || contO.p[i].gr === -17 || contO.p[i].gr === -16) {
          contO.p[i].embos = 13;
        }
      }
    }
    if (this.cntdest[n] !== 0) {
      for (let j = 0; j < contO.npl; ++j) {
        if (contO.p[j].wz === 0 || contO.p[j].gr === -17 || contO.p[j].gr === -16) {
          contO.p[j].embos = 1;
        }
      }
      const cntdest = this.cntdest;
      --cntdest[n];
    }
    for (let k = 0; k < 20; ++k) {
      for (let l = 0; l < 30; ++l) {
        if (this.hsspark[n][k][l] === lastfr) {
          contO.stg[k] = 1;
          contO.sx[k] = this.hsx[n][k][l];
          contO.sy[k] = this.hsy[n][k][l];
          contO.sz[k] = this.hsz[n][k][l];
          contO.osmag[k] = this.hsmag[n][k][l];
          contO.scx[k] = this.hscx[n][k][l];
          contO.scz[k] = this.hscz[n][k][l];
        }
      }
    }
    for (let n3 = 0; n3 < 200; ++n3) {
      if (this.hrspark[n][n3] === lastfr) {
        contO.sprk = this.hsprk[n][n3];
        contO.srx = this.hsrx[n][n3];
        contO.sry = this.hsry[n][n3];
        contO.srz = this.hsrz[n][n3];
        contO.rcx = this.hrcx[n][n3];
        contO.rcy = this.hrcy[n][n3];
        contO.rcz = this.hrcz[n][n3];
      }
    }
    for (let n4 = 0; n4 < 4; ++n4) {
      for (let n5 = 0; n5 < 7; ++n5) {
        if (this.hry[n][n4][n5] === lastfr && this.lastfr !== lastfr) {
          this.regy(n4, this.hmagy[n][n4][n5], this.hmtouch[n][n5], contO, mad);
        }
        if (this.hrx[n][n4][n5] === lastfr) {
          if (this.lastfr !== lastfr) {
            this.regx(n4, this.hmagx[n][n4][n5], contO, mad);
          } else {
            this.chipx(n4, this.hmagx[n][n4][n5], contO, mad);
          }
        }
        if (this.hrz[n][n4][n5] === lastfr) {
          if (this.lastfr !== lastfr) {
            this.regz(n4, this.hmagz[n][n4][n5], contO, mad);
          } else {
            this.chipz(n4, this.hmagz[n][n4][n5], contO, mad);
          }
        }
      }
    }
    this.lastfr = lastfr;
  }

  recy(n, n2, b, n3) {
    this.ry[n3][n][this.nry[n3][n]] = 300;
    this.magy[n3][n][this.nry[n3][n]] = trunc(n2);
    this.mtouch[n3][this.nry[n3][n]] = b;
    const array = this.nry[n3];
    ++array[n];
    if (this.nry[n3][n] === 7) {
      this.nry[n3][n] = 0;
    }
  }

  recx(n, n2, n3) {
    // Note: uses nry per original Java bytecode/decompilation (game bug preserved)
    this.rx[n3][n][this.nry[n3][n]] = 300;
    this.magx[n3][n][this.nry[n3][n]] = trunc(n2);
    const array = this.nrx[n3];
    ++array[n];
    if (this.nrx[n3][n] === 7) {
      this.nrx[n3][n] = 0;
    }
  }

  recz(n, n2, n3) {
    // Note: uses nry per original Java bytecode/decompilation (game bug preserved)
    this.rz[n3][n][this.nry[n3][n]] = 300;
    this.magz[n3][n][this.nry[n3][n]] = trunc(n2);
    const array = this.nrz[n3];
    ++array[n];
    if (this.nrz[n3][n] === 7) {
      this.nrz[n3][n] = 0;
    }
  }

  regy(n, n2, b, contO, mad) {
    if (n2 > 100.0) {
      n2 = fr(n2 - 100.0);
      let n3 = 0;
      let n4 = 0;
      let i = contO.zy;
      let j = contO.xy;
      while (i < 360) {
        i = i32(i + 360);
      }
      while (i > 360) {
        i = i32(i - 360);
      }
      if (i < 210 && i > 150) {
        n3 = -1;
      }
      if (i > 330 || i < 30) {
        n3 = 1;
      }
      while (j < 360) {
        j = i32(j + 360);
      }
      while (j > 360) {
        j = i32(j - 360);
      }
      if (j < 210 && j > 150) {
        n4 = -1;
      }
      if (j > 330 || j < 30) {
        n4 = 1;
      }
      if (Math.imul(n4, n3) === 0 || b) {
        for (let k = 0; k < contO.npl; ++k) {
          let n5 = 0.0;
          for (let l = 0; l < contO.p[k].n; ++l) {
            if (contO.p[k].wz === 0 && this.py(contO.keyx[n], contO.p[k].ox[l], contO.keyz[n], contO.p[k].oz[l]) < mad.cd.clrad[mad.cn]) {
              n5 = fr(fr(n2 / 20.0) * this.m.random());
              const oz = contO.p[k].oz;
              const n6 = l;
              oz[n6] = trunc(fr(oz[n6] + fr(n5 * this.m.sin(i))));
              const ox = contO.p[k].ox;
              const n7 = l;
              ox[n7] = trunc(fr(ox[n7] - fr(n5 * this.m.sin(j))));
            }
          }
          if (n5 !== 0.0) {
            if (Math.abs(n5) >= 1.0) {
              contO.p[k].chip = 1;
              contO.p[k].ctmag = n5;
            }
            if (!contO.p[k].nocol && contO.p[k].glass !== 1) {
              if (contO.p[k].bfase > 20 && contO.p[k].hsb[1] > 0.2) {
                contO.p[k].hsb[1] = 0.2;
              }
              if (contO.p[k].bfase > 30) {
                if (contO.p[k].hsb[2] < 0.5) {
                  contO.p[k].hsb[2] = 0.5;
                }
                if (contO.p[k].hsb[1] > 0.1) {
                  contO.p[k].hsb[1] = 0.1;
                }
              }
              if (contO.p[k].bfase > 40) {
                contO.p[k].hsb[1] = 0.05;
              }
              if (contO.p[k].bfase > 50) {
                if (contO.p[k].hsb[2] > 0.8) {
                  contO.p[k].hsb[2] = 0.8;
                }
                contO.p[k].hsb[0] = 0.075;
                contO.p[k].hsb[1] = 0.05;
              }
              if (contO.p[k].bfase > 60) {
                contO.p[k].hsb[0] = 0.05;
              }
              const plane = contO.p[k];
              plane.bfase = trunc(fr(plane.bfase + n5));
              const hsbColor = HSBtoRGB(contO.p[k].hsb[0], contO.p[k].hsb[1], contO.p[k].hsb[2]);
              contO.p[k].c[0] = (hsbColor >> 16) & 0xFF;
              contO.p[k].c[1] = (hsbColor >> 8) & 0xFF;
              contO.p[k].c[2] = hsbColor & 0xFF;
            }
            if (contO.p[k].glass === 1) {
              const plane2 = contO.p[k];
              plane2.gr = trunc(plane2.gr + Math.abs(n5 * 1.5));
            }
          }
        }
      }
      if (Math.imul(n4, n3) === -1) {
        let n8 = 0;
        let n9 = 1;
        for (let n10 = 0; n10 < contO.npl; ++n10) {
          let n11 = 0.0;
          for (let n12 = 0; n12 < contO.p[n10].n; ++n12) {
            if (contO.p[n10].wz === 0) {
              n11 = fr(fr(n2 / 15.0) * this.m.random());
              if ((Math.abs(contO.p[n10].oy[n12] - mad.cd.flipy[mad.cn] - this.squash[0][mad.im]) < mad.cd.msquash[mad.cn] * 3 || contO.p[n10].oy[n12] < mad.cd.flipy[mad.cn] + this.squash[0][mad.im]) && this.squash[0][mad.im] < mad.cd.msquash[mad.cn]) {
                const oy = contO.p[n10].oy;
                const n13 = n12;
                oy[n13] = trunc(fr(oy[n13] + n11));
                n8 = trunc(fr(n8 + n11));
                ++n9;
              }
            }
          }
          if (contO.p[n10].glass === 1) {
            const plane3 = contO.p[n10];
            plane3.gr = i32(plane3.gr + 5);
          } else if (n11 !== 0.0) {
            const plane4 = contO.p[n10];
            plane4.bfase = trunc(fr(plane4.bfase + n11));
          }
          if (Math.abs(n11) >= 1.0) {
            contO.p[n10].chip = 1;
            contO.p[n10].ctmag = n11;
          }
        }
        const array = this.squash[0];
        const im = mad.im;
        array[im] = i32(array[im] + idiv(n8, n9));
      }
    }
  }

  regx(n, a, contO, mad) {
    if (Math.abs(a) > 100.0) {
      if (a > 100.0) {
        a = fr(a - 100.0);
      }
      if (a < -100.0) {
        a = fr(a + 100.0);
      }
      for (let i = 0; i < contO.npl; ++i) {
        let a2 = 0.0;
        for (let j = 0; j < contO.p[i].n; ++j) {
          if (contO.p[i].wz === 0 && this.py(contO.keyx[n], contO.p[i].ox[j], contO.keyz[n], contO.p[i].oz[j]) < mad.cd.clrad[mad.cn]) {
            a2 = fr(fr(a / 20.0) * this.m.random());
            const oz = contO.p[i].oz;
            const n2 = j;
            oz[n2] = trunc(fr(oz[n2] - fr(fr(a2 * this.m.sin(contO.xz)) * this.m.cos(contO.zy))));
            const ox = contO.p[i].ox;
            const n3 = j;
            ox[n3] = trunc(fr(ox[n3] + fr(fr(a2 * this.m.cos(contO.xz)) * this.m.cos(contO.xy))));
          }
        }
        if (a2 !== 0.0) {
          if (Math.abs(a2) >= 1.0) {
            contO.p[i].chip = 1;
            contO.p[i].ctmag = a2;
          }
          if (!contO.p[i].nocol && contO.p[i].glass !== 1) {
            if (contO.p[i].bfase > 20 && contO.p[i].hsb[1] > 0.2) {
              contO.p[i].hsb[1] = 0.2;
            }
            if (contO.p[i].bfase > 30) {
              if (contO.p[i].hsb[2] < 0.5) {
                contO.p[i].hsb[2] = 0.5;
              }
              if (contO.p[i].hsb[1] > 0.1) {
                contO.p[i].hsb[1] = 0.1;
              }
            }
            if (contO.p[i].bfase > 40) {
              contO.p[i].hsb[1] = 0.05;
            }
            if (contO.p[i].bfase > 50) {
              if (contO.p[i].hsb[2] > 0.8) {
                contO.p[i].hsb[2] = 0.8;
              }
              contO.p[i].hsb[0] = 0.075;
              contO.p[i].hsb[1] = 0.05;
            }
            if (contO.p[i].bfase > 60) {
              contO.p[i].hsb[0] = 0.05;
            }
            const plane = contO.p[i];
            plane.bfase = trunc(fr(plane.bfase + Math.abs(a2)));
            const hsbColor = HSBtoRGB(contO.p[i].hsb[0], contO.p[i].hsb[1], contO.p[i].hsb[2]);
            contO.p[i].c[0] = (hsbColor >> 16) & 0xFF;
            contO.p[i].c[1] = (hsbColor >> 8) & 0xFF;
            contO.p[i].c[2] = hsbColor & 0xFF;
          }
          if (contO.p[i].glass === 1) {
            const plane2 = contO.p[i];
            plane2.gr = trunc(plane2.gr + Math.abs(a2 * 1.5));
          }
        }
      }
    }
  }

  regz(n, a, contO, mad) {
    if (Math.abs(a) > 100.0) {
      if (a > 100.0) {
        a = fr(a - 100.0);
      }
      if (a < -100.0) {
        a = fr(a + 100.0);
      }
      for (let i = 0; i < contO.npl; ++i) {
        let a2 = 0.0;
        for (let j = 0; j < contO.p[i].n; ++j) {
          if (contO.p[i].wz === 0 && this.py(contO.keyx[n], contO.p[i].ox[j], contO.keyz[n], contO.p[i].oz[j]) < mad.cd.clrad[mad.cn]) {
            a2 = fr(fr(a / 20.0) * this.m.random());
            const oz = contO.p[i].oz;
            const n2 = j;
            oz[n2] = trunc(fr(oz[n2] + fr(fr(a2 * this.m.cos(contO.xz)) * this.m.cos(contO.zy))));
            const ox = contO.p[i].ox;
            const n3 = j;
            ox[n3] = trunc(fr(ox[n3] + fr(fr(a2 * this.m.sin(contO.xz)) * this.m.cos(contO.xy))));
          }
        }
        if (a2 !== 0.0) {
          if (Math.abs(a2) >= 1.0) {
            contO.p[i].chip = 1;
            contO.p[i].ctmag = a2;
          }
          if (!contO.p[i].nocol && contO.p[i].glass !== 1) {
            if (contO.p[i].bfase > 20 && contO.p[i].hsb[1] > 0.2) {
              contO.p[i].hsb[1] = 0.2;
            }
            if (contO.p[i].bfase > 30) {
              if (contO.p[i].hsb[2] < 0.5) {
                contO.p[i].hsb[2] = 0.5;
              }
              if (contO.p[i].hsb[1] > 0.1) {
                contO.p[i].hsb[1] = 0.1;
              }
            }
            if (contO.p[i].bfase > 40) {
              contO.p[i].hsb[1] = 0.05;
            }
            if (contO.p[i].bfase > 50) {
              if (contO.p[i].hsb[2] > 0.8) {
                contO.p[i].hsb[2] = 0.8;
              }
              contO.p[i].hsb[0] = 0.075;
              contO.p[i].hsb[1] = 0.05;
            }
            if (contO.p[i].bfase > 60) {
              contO.p[i].hsb[0] = 0.05;
            }
            const plane = contO.p[i];
            plane.bfase = trunc(fr(plane.bfase + Math.abs(a2)));
            const hsbColor = HSBtoRGB(contO.p[i].hsb[0], contO.p[i].hsb[1], contO.p[i].hsb[2]);
            contO.p[i].c[0] = (hsbColor >> 16) & 0xFF;
            contO.p[i].c[1] = (hsbColor >> 8) & 0xFF;
            contO.p[i].c[2] = hsbColor & 0xFF;
          }
          if (contO.p[i].glass === 1) {
            const plane2 = contO.p[i];
            plane2.gr = trunc(plane2.gr + Math.abs(a2 * 1.5));
          }
        }
      }
    }
  }

  chipx(n, a, contO, mad) {
    if (Math.abs(a) > 100.0) {
      if (a > 100.0) {
        a = fr(a - 100.0);
      }
      if (a < -100.0) {
        a = fr(a + 100.0);
      }
      for (let i = 0; i < contO.npl; ++i) {
        let n2 = 0.0;
        for (let j = 0; j < contO.p[i].n; ++j) {
          if (contO.p[i].wz === 0 && this.py(contO.keyx[n], contO.p[i].ox[j], contO.keyz[n], contO.p[i].oz[j]) < mad.cd.clrad[mad.cn]) {
            n2 = fr(fr(a / 20.0) * this.m.random());
          }
        }
        if (n2 !== 0.0 && Math.abs(n2) >= 1.0) {
          contO.p[i].chip = 1;
          contO.p[i].ctmag = n2;
        }
      }
    }
  }

  chipz(n, a, contO, mad) {
    if (Math.abs(a) > 100.0) {
      if (a > 100.0) {
        a = fr(a - 100.0);
      }
      if (a < -100.0) {
        a = fr(a + 100.0);
      }
      for (let i = 0; i < contO.npl; ++i) {
        let n2 = 0.0;
        for (let j = 0; j < contO.p[i].n; ++j) {
          if (contO.p[i].wz === 0 && this.py(contO.keyx[n], contO.p[i].ox[j], contO.keyz[n], contO.p[i].oz[j]) < mad.cd.clrad[mad.cn]) {
            n2 = fr(fr(a / 20.0) * this.m.random());
          }
        }
        if (n2 !== 0.0 && Math.abs(n2) >= 1.0) {
          contO.p[i].chip = 1;
          contO.p[i].ctmag = n2;
        }
      }
    }
  }

  py(n, n2, n3, n4) {
    return i32(Math.imul(n - n2, n - n2) + Math.imul(n3 - n4, n3 - n4));
  }
}
