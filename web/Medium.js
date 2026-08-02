// Transpiled from java-src/Medium.java, line by line.
//
// The world around the track: sky gradient, ground gradient, fog bands,
// procedural ground polys / clouds / mountains / stars, and the camera modes
// (follow, around, watch). d() is the first thing the race tick calls, so
// everything it draws sits UNDERNEATH every object — submission order is the
// depth here, as everywhere else in this renderer.
//
// Numeric conventions are the same as Plane.js; see the header there.

import {
  idiv, trunc, fr, intArray, floatArray, objArray, random, JavaRandom, RGBtoHSB,
} from './java.js';
import { Madness } from './Madness.js';

/** Java long division: truncates toward zero, like int division. */
function ldiv(a, b) {
  return Math.trunc(a / b);
}

/** Nested int[a][b]. */
function int2(a, b) {
  const o = objArray(a);
  for (let i = 0; i < a; i++) o[i] = intArray(b);
  return o;
}

/** Nested int[a][b][c]. */
function int3(a, b, c) {
  const o = objArray(a);
  for (let i = 0; i < a; i++) o[i] = int2(b, c);
  return o;
}

/** Nested int[a][b][c][d]. */
function int4(a, b, c, d) {
  const o = objArray(a);
  for (let i = 0; i < a; i++) o[i] = int3(b, c, d);
  return o;
}

/** Nested float[a][b]. */
function float2(a, b) {
  const o = objArray(a);
  for (let i = 0; i < a; i++) o[i] = floatArray(b);
  return o;
}

/** The `(int)(v + v * (snap/100f))` shape that every colour setter repeats. */
function snapped(v, snap) {
  let c = trunc(fr(v + fr(v * fr(snap / 100.0))));
  if (c > 255) c = 255;
  if (c < 0) c = 0;
  return c;
}

export class Medium {
  constructor() {
    this.focus_point = 400;
    this.ground = 250;
    this.skyline = -300;
    this.fade = Int32Array.from([3000, 4500, 6000, 7500, 9000, 10500, 12000, 13500,
                                 15000, 16500, 18000, 19500, 21000, 22500, 24000, 25500]);
    this.cldd = Int32Array.from([210, 210, 210, 1, -1000]);
    this.clds = Int32Array.from([210, 210, 210]);
    this.osky = Int32Array.from([170, 220, 255]);
    this.csky = Int32Array.from([170, 220, 255]);
    this.ogrnd = Int32Array.from([205, 200, 200]);
    this.cgrnd = Int32Array.from([205, 200, 200]);
    this.texture = Int32Array.from([0, 0, 0, 50]);
    this.cpol = Int32Array.from([215, 210, 210]);
    this.crgrnd = Int32Array.from([205, 200, 200]);
    this.cfade = Int32Array.from([255, 220, 220]);
    this.snap = Int32Array.from([0, 0, 0]);
    this.fogd = 7;
    this.mgen = trunc(random() * 100000.0);
    this.loadnew = false;
    this.lightson = false;
    this.darksky = false;
    this.lightn = -1;
    this.lilo = 217;
    this.lton = false;
    this.noelec = 0;
    this.trk = 0;
    this.crs = false;
    this.cx = 400;
    this.cy = 225;
    this.cz = 50;
    this.xz = 0;
    this.zy = 0;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.iw = 0;
    this.ih = 0;
    this.w = 800;
    this.h = 450;
    this.nsp = 0;
    this.spx = intArray(7);
    this.spz = intArray(7);
    this.sprad = intArray(7);
    this.td = false;
    this.bcxz = 0;
    this.bt = false;
    this.vxz = 180;
    this.adv = 500;
    this.vert = false;
    this.tcos = floatArray(360);
    this.tsin = floatArray(360);
    this.lastmaf = 0;
    this.checkpoint = -1;
    this.lastcheck = false;
    this.elecr = 0.0;
    this.cpflik = false;
    // Not in the Java. True while the browser shell is re-running draw() for
    // an interpolated frame, which happens ~3x per tick. Every effect that
    // advances a counter from inside draw -- this.d()'s lightning, checkpoint
    // flicker and noelec, ContO's repair sparkle, landing dust and the
    // electric ring -- guards that advance with it, so the effect animates at
    // tick rate and an interpolated frame redraws the SAME frame of it rather
    // than the next one. Guard at the mutation, not by snapshotting the field
    // in main.js: a missed effect is then a one-line fix where it lives.
    this.interpolating = false;
    // The tick draw's random sequence, recorded so an interpolated pass can
    // replay it. See random() and the arming in d(). float32 because that is
    // what random() returns; `rn` is how many the tick used, `rp` the replay
    // cursor. Sized to a typical frame's draw; grows if a frame needs more.
    this.rlog = new Float32Array(8192);
    this.rn = 0;
    this.rp = 0;
    this.recording = false;
    this.nochekflk = false;
    this.cntrn = 0;
    this.diup = [false, false, false];
    this.rand = Int32Array.from([0, 0, 0]);
    this.trn = 0;
    this.hit = 45000;
    this.ptr = 0;
    this.ptcnt = -10;
    this.nrnd = 0;
    this.trx = 0;
    this.trz = 0;
    this.atrx = 0;
    this.atrz = 0;
    this.fallen = 0;
    this.fo = 1.0;
    this.gofo = fr(0.33000001311302185 + random() * 1.34);
    this.fvect = 200;
    this.ogpx = null;
    this.ogpz = null;
    this.pvr = null;
    this.cgpx = null;
    this.cgpz = null;
    this.pmx = null;
    this.pcv = null;
    this.sgpx = 0;
    this.sgpz = 0;
    this.nrw = 0;
    this.ncl = 0;
    this.noc = 0;
    this.clx = null;
    this.clz = null;
    this.cmx = null;
    this.clax = null;
    this.clay = null;
    this.claz = null;
    this.clc = null;
    this.nmt = 0;
    this.mrd = null;
    this.nmv = null;
    this.mtx = null;
    this.mty = null;
    this.mtz = null;
    this.mtc = null;
    this.nst = 0;
    this.stx = null;
    this.stz = null;
    this.stc = null;
    this.bst = null;
    this.twn = null;
    this.resdown = 0;
    this.rescnt = 5;
    for (let i = 0; i < 360; ++i) this.tcos[i] = Math.cos(i * 0.017453292519943295);
    for (let j = 0; j < 360; ++j) this.tsin[j] = Math.sin(j * 0.017453292519943295);
  }

  /**
   * The game's own cheap PRNG, distinct from Math.random(). It walks three
   * digits up or down and cycles between them, so successive calls are
   * correlated — visual effects depend on that texture, so it is reproduced
   * exactly rather than replaced.
   */
  random() {
    // Interpolated pass: replay the sequence the tick's draw consumed instead
    // of rolling new values. Effects roll their SHAPE from here -- the bolts
    // on an electric ring, the repair sparkle, a damaged panel's jitter, the
    // spark debris -- and a redraw that rolls fresh values draws a different
    // random shape rather than the same one, which reads as a buzz at display
    // rate instead of an animation at tick rate. Recording is armed in d(),
    // the first call of every draw. Sites that consume conditionally stay
    // lined up because the counters they branch on are frozen too; the modulo
    // only matters if a redraw somehow outruns the tick, and it keeps every
    // interpolated frame of a tick identical to the others even then.
    if (this.interpolating && this.rn !== 0) return this.rlog[this.rp++ % this.rn];
    if (this.cntrn === 0) {
      for (let i = 0; i < 3; ++i) {
        this.rand[i] = trunc(10.0 * random());
        if (random() > random()) this.diup[i] = false;
        else this.diup[i] = true;
      }
      this.cntrn = 20;
    } else {
      --this.cntrn;
    }
    for (let j = 0; j < 3; ++j) {
      if (this.diup[j]) {
        ++this.rand[j];
        if (this.rand[j] === 10) this.rand[j] = 0;
      } else {
        --this.rand[j];
        if (this.rand[j] === -1) this.rand[j] = 9;
      }
    }
    ++this.trn;
    if (this.trn === 3) this.trn = 0;
    const v = fr(this.rand[this.trn] / 10.0);
    if (this.recording) {
      if (this.rn === this.rlog.length) {
        const grown = new Float32Array(this.rn * 2);
        grown.set(this.rlog);
        this.rlog = grown;
      }
      this.rlog[this.rn++] = v;
    }
    return v;
  }

  watch(contO, n) {
    if (this.td) {
      this.y = trunc(contO.y - 300 - fr(1100.0 * this.random()));
      this.x = contO.x + trunc(fr(fr((contO.x + 400 - contO.x) * this.cos(n)) - fr((contO.z + 5000 - contO.z) * this.sin(n))));
      this.z = contO.z + trunc(fr(fr((contO.x + 400 - contO.x) * this.sin(n)) + fr((contO.z + 5000 - contO.z) * this.cos(n))));
      this.td = false;
    }
    let n2 = 0;
    if (contO.x - this.x - this.cx > 0) n2 = 180;
    let i = -trunc(90 + n2 + Math.atan((contO.z - this.z) / (contO.x - this.x - this.cx)) / 0.017453292519943295);
    let n3 = 0;
    if (contO.y - this.y - this.cy < 0) n3 = -180;
    const n4 = trunc(90 + n3 - Math.atan(trunc(Math.sqrt(
      Math.imul(contO.z - this.z, contO.z - this.z) +
      Math.imul(contO.x - this.x - this.cx, contO.x - this.x - this.cx))) / (contO.y - this.y - this.cy)) / 0.017453292519943295);
    while (i < 0) i += 360;
    while (i > 360) i -= 360;
    this.xz = i;
    this.zy += idiv(n4 - this.zy, 5);
    if (trunc(Math.sqrt(
      Math.imul(contO.z - this.z, contO.z - this.z) +
      Math.imul(contO.x - this.x - this.cx, contO.x - this.x - this.cx) +
      Math.imul(contO.y - this.y - this.cy, contO.y - this.y - this.cy))) > 6000) {
      this.td = true;
    }
  }

  aroundtrack(checkPoints) {
    this.y = -this.hit;
    this.x = this.cx + trunc(this.trx) + trunc(fr(17000.0 * this.cos(this.vxz)));
    this.z = trunc(this.trz) + trunc(fr(17000.0 * this.sin(this.vxz)));
    if (this.hit > 5000) {
      if (this.hit === 45000) {
        this.fo = 1.0;
        this.zy = 67;
        this.atrx = ldiv(checkPoints.x[0] - this.trx, 116);
        this.atrz = ldiv(checkPoints.z[0] - this.trz, 116);
        this.focus_point = 400;
      }
      if (this.hit === 20000) {
        this.fallen = 500;
        this.fo = 1.0;
        this.zy = 67;
        this.atrx = ldiv(checkPoints.x[0] - this.trx, 116);
        this.atrz = ldiv(checkPoints.z[0] - this.trz, 116);
        this.focus_point = 400;
      }
      this.hit -= this.fallen;
      this.fallen += 7;
      this.trx += this.atrx;
      this.trz += this.atrz;
      if (this.hit < 17600) this.zy -= 2;
      if (this.fallen > 500) this.fallen = 500;
      if (this.hit <= 5000) {
        this.hit = 5000;
        this.fallen = 0;
      }
      this.vxz += 3;
    } else {
      this.focus_point = trunc(fr(400.0 * this.fo));
      if (Math.abs(this.fo - this.gofo) > 0.005) {
        if (this.fo < this.gofo) this.fo = fr(this.fo + 0.005);
        else this.fo = fr(this.fo - 0.005);
      } else {
        this.gofo = fr(0.3499999940395355 + random() * 1.3);
      }
      ++this.vxz;
      this.trx -= ldiv(this.trx - checkPoints.x[this.ptr], 10);
      this.trz -= ldiv(this.trz - checkPoints.z[this.ptr], 10);
      if (this.ptcnt === 7) {
        ++this.ptr;
        if (this.ptr === checkPoints.n) {
          this.ptr = 0;
          ++this.nrnd;
        }
        this.ptcnt = 0;
      } else {
        ++this.ptcnt;
      }
    }
    if (this.vxz > 360) this.vxz -= 360;
    this.xz = -this.vxz - 90;
    this.cpflik = !this.cpflik;
  }

  around(contO, b) {
    if (!b) {
      if (!this.vert) this.adv += 2;
      else this.adv -= 2;
      if (this.adv > 900) this.vert = true;
      if (this.adv < -500) this.vert = false;
    } else {
      this.adv -= 14;
      if (this.adv < 617) this.adv = 617;
    }
    let n = 500 + this.adv;
    if (b && n < 1300) n = 1300;
    if (n < 1000) n = 1000;
    this.y = contO.y - this.adv;
    if (this.y > 10) this.vert = false;
    this.x = contO.x + trunc(fr((contO.x - n - contO.x) * this.cos(this.vxz)));
    this.z = contO.z + trunc(fr((contO.x - n - contO.x) * this.sin(this.vxz)));
    if (!b) this.vxz += 2;
    else this.vxz += 4;
    let n2 = 0;
    let y = this.y;
    if (y > 0) y = 0;
    if (contO.y - y - this.cy < 0) n2 = -180;
    let n3 = trunc(90 + n2 - Math.atan(trunc(Math.sqrt(
      Math.imul(contO.z - this.z + this.cz, contO.z - this.z + this.cz) +
      Math.imul(contO.x - this.x - this.cx, contO.x - this.x - this.cx))) / (contO.y - y - this.cy)) / 0.017453292519943295);
    this.xz = -this.vxz + 90;
    if (b) n3 -= 15;
    this.zy += idiv(n3 - this.zy, 10);
  }

  getaround(contO) {
    if (!this.vert) this.adv += 2;
    else this.adv -= 2;
    if (this.adv > 1700) this.vert = true;
    if (this.adv < -500) this.vert = false;
    if (contO.y - this.adv > 10) this.vert = false;
    let n = 500 + this.adv;
    if (n < 1000) n = 1000;
    const y = contO.y - this.adv;
    const x = contO.x + trunc(fr((contO.x - n - contO.x) * this.cos(this.vxz)));
    const z = contO.z + trunc(fr((contO.x - n - contO.x) * this.sin(this.vxz)));
    let n2 = 0;
    if (Math.abs(y - this.y) > this.fvect) {
      if (this.y < y) this.y += this.fvect;
      else this.y -= this.fvect;
    } else {
      this.y = y;
      ++n2;
    }
    if (Math.abs(x - this.x) > this.fvect) {
      if (this.x < x) this.x += this.fvect;
      else this.x -= this.fvect;
    } else {
      this.x = x;
      ++n2;
    }
    if (Math.abs(z - this.z) > this.fvect) {
      if (this.z < z) this.z += this.fvect;
      else this.z -= this.fvect;
    } else {
      this.z = z;
      ++n2;
    }
    if (n2 === 3) this.fvect = 200;
    else this.fvect += 2;
    this.vxz += 2;
    while (this.vxz > 360) this.vxz -= 360;
    let i = -this.vxz + 90;
    let n3 = 0;
    if (contO.x - this.x - this.cx > 0) n3 = 180;
    let j = -trunc(90 + n3 + Math.atan((contO.z - this.z) / (contO.x - this.x - this.cx)) / 0.017453292519943295);
    let y2 = this.y;
    let n4 = 0;
    if (y2 > 0) y2 = 0;
    if (contO.y - y2 - this.cy < 0) n4 = -180;
    const n5 = trunc(Math.sqrt(
      Math.imul(contO.z - this.z + this.cz, contO.z - this.z + this.cz) +
      Math.imul(contO.x - this.x - this.cx, contO.x - this.x - this.cx)));
    let n6 = 25;
    if (n5 !== 0) {
      n6 = trunc(90 + n4 - Math.atan(n5 / (contO.y - y2 - this.cy)) / 0.017453292519943295);
    }
    while (i < 0) i += 360;
    while (i > 360) i -= 360;
    while (j < 0) j += 360;
    while (j > 360) j -= 360;
    if ((Math.abs(i - j) < 30 || Math.abs(i - j) > 330) && n2 === 3) {
      if (Math.abs(i - this.xz) > 7 && Math.abs(i - this.xz) < 353) {
        if (Math.abs(i - this.xz) > 180) {
          if (this.xz > i) this.xz += 7;
          else this.xz -= 7;
        } else if (this.xz < i) this.xz += 7;
        else this.xz -= 7;
      } else {
        this.xz = i;
      }
    } else if (Math.abs(j - this.xz) > 6 && Math.abs(j - this.xz) < 354) {
      if (Math.abs(j - this.xz) > 180) {
        if (this.xz > j) this.xz += 3;
        else this.xz -= 3;
      } else if (this.xz < j) this.xz += 3;
      else this.xz -= 3;
    } else {
      this.xz = j;
    }
    this.zy += idiv(n6 - this.zy, 10);
  }

  transaround(contO, contO2, n) {
    const n2 = idiv(contO.x * (20 - n) + contO2.x * n, 20);
    const n3 = idiv(contO.y * (20 - n) + contO2.y * n, 20);
    const n4 = idiv(contO.z * (20 - n) + contO2.z * n, 20);
    if (!this.vert) this.adv += 2;
    else this.adv -= 2;
    if (this.adv > 900) this.vert = true;
    if (this.adv < -500) this.vert = false;
    let n5 = 500 + this.adv;
    if (n5 < 1000) n5 = 1000;
    this.y = n3 - this.adv;
    if (this.y > 10) this.vert = false;
    this.x = n2 + trunc(fr((n2 - n5 - n2) * this.cos(this.vxz)));
    this.z = n4 + trunc(fr((n2 - n5 - n2) * this.sin(this.vxz)));
    this.vxz += 2;
    let n6 = 0;
    let y = this.y;
    if (y > 0) y = 0;
    if (n3 - y - this.cy < 0) n6 = -180;
    const n7 = trunc(90 + n6 - Math.atan(trunc(Math.sqrt(
      Math.imul(n4 - this.z + this.cz, n4 - this.z + this.cz) +
      Math.imul(n2 - this.x - this.cx, n2 - this.x - this.cx))) / (n3 - y - this.cy)) / 0.017453292519943295);
    this.xz = -this.vxz + 90;
    this.zy += idiv(n7 - this.zy, 10);
  }

  /** Chase camera. This is the one the race uses by default (view == 0). */
  follow(contO, n, n2) {
    this.zy = 10;
    let n3 = 2 + idiv(Math.abs(this.bcxz), 4);
    if (n3 > 20) n3 = 20;
    if (n2 !== 0) {
      if (n2 === 1) {
        if (this.bcxz < 180) this.bcxz += n3;
        if (this.bcxz > 180) this.bcxz = 180;
      }
      if (n2 === -1) {
        if (this.bcxz > -180) this.bcxz -= n3;
        if (this.bcxz < -180) this.bcxz = -180;
      }
    } else if (Math.abs(this.bcxz) > n3) {
      if (this.bcxz > 0) this.bcxz -= n3;
      else this.bcxz += n3;
    } else if (this.bcxz !== 0) {
      this.bcxz = 0;
    }
    n += this.bcxz;
    this.xz = -n;
    this.x = contO.x - this.cx + trunc(fr(-(contO.z - 800 - contO.z) * this.sin(n)));
    this.z = contO.z - this.cz + trunc(fr((contO.z - 800 - contO.z) * this.cos(n)));
    this.y = contO.y - 250 - this.cy;
  }

  getfollow(contO, n, n2) {
    this.zy = 10;
    let n3 = 2 + idiv(Math.abs(this.bcxz), 4);
    if (n3 > 20) n3 = 20;
    if (n2 !== 0) {
      if (n2 === 1) {
        if (this.bcxz < 180) this.bcxz += n3;
        if (this.bcxz > 180) this.bcxz = 180;
      }
      if (n2 === -1) {
        if (this.bcxz > -180) this.bcxz -= n3;
        if (this.bcxz < -180) this.bcxz = -180;
      }
    } else if (Math.abs(this.bcxz) > n3) {
      if (this.bcxz > 0) this.bcxz -= n3;
      else this.bcxz += n3;
    } else if (this.bcxz !== 0) {
      this.bcxz = 0;
    }
    n += this.bcxz;
    this.xz = -n;
    const x = contO.x - this.cx + trunc(fr(-(contO.z - 800 - contO.z) * this.sin(n)));
    const z = contO.z - this.cz + trunc(fr((contO.z - 800 - contO.z) * this.cos(n)));
    const y = contO.y - 250 - this.cy;
    let n4 = 0;
    if (Math.abs(y - this.y) > this.fvect) {
      if (this.y < y) this.y += this.fvect;
      else this.y -= this.fvect;
    } else {
      this.y = y;
      ++n4;
    }
    if (Math.abs(x - this.x) > this.fvect) {
      if (this.x < x) this.x += this.fvect;
      else this.x -= this.fvect;
    } else {
      this.x = x;
      ++n4;
    }
    if (Math.abs(z - this.z) > this.fvect) {
      if (this.z < z) this.z += this.fvect;
      else this.z -= this.fvect;
    } else {
      this.z = z;
      ++n4;
    }
    if (n4 === 3) this.fvect = 200;
    else this.fvect += 2;
  }

  /** Procedural scatter of ground blobs. Seeded, so a stage looks identical every load. */
  newpolys(n, n2, n3, n4, trackers, n5) {
    const rnd = new JavaRandom((n5 + this.cgrnd[0] + this.cgrnd[1] + this.cgrnd[2]) * 1671);
    this.nrw = idiv(n2, 1200) + 9;
    this.ncl = idiv(n4, 1200) + 9;
    this.sgpx = n - 4800;
    this.sgpz = n3 - 4800;
    const cells = this.nrw * this.ncl;
    this.ogpx = int2(cells, 8);
    this.ogpz = int2(cells, 8);
    this.pvr = float2(cells, 8);
    this.cgpx = intArray(cells);
    this.cgpz = intArray(cells);
    this.pmx = intArray(cells);
    this.pcv = floatArray(cells);
    let n6 = 0;
    let n7 = 0;
    for (let i = 0; i < cells; ++i) {
      this.cgpx[i] = this.sgpx + n6 * 1200 + trunc(rnd.nextDouble() * 1000.0 - 500.0);
      this.cgpz[i] = this.sgpz + n7 * 1200 + trunc(rnd.nextDouble() * 1000.0 - 500.0);
      if (trackers !== null) {
        for (let j = 0; j < trackers.nt; ++j) {
          if (trackers.zy[j] === 0 && trackers.xy[j] === 0) {
            if (trackers.radx[j] < trackers.radz[j] && Math.abs(this.cgpz[i] - trackers.z[j]) < trackers.radz[j]) {
              while (Math.abs(this.cgpx[i] - trackers.x[j]) < trackers.radx[j]) {
                this.cgpx[i] = trunc(this.cgpx[i] + (rnd.nextDouble() * trackers.radx[j] * 2.0 - trackers.radx[j]));
              }
            }
            if (trackers.radz[j] < trackers.radx[j] && Math.abs(this.cgpx[i] - trackers.x[j]) < trackers.radx[j]) {
              while (Math.abs(this.cgpz[i] - trackers.z[j]) < trackers.radz[j]) {
                this.cgpz[i] = trunc(this.cgpz[i] + (rnd.nextDouble() * trackers.radz[j] * 2.0 - trackers.radz[j]));
              }
            }
          }
        }
      }
      if (++n6 === this.nrw) {
        n6 = 0;
        ++n7;
      }
    }
    for (let k = 0; k < cells; ++k) {
      const n10 = fr(0.3 + 1.6 * rnd.nextDouble());
      this.ogpx[k][0] = 0;
      this.ogpz[k][0] = trunc((100.0 + rnd.nextDouble() * 760.0) * n10);
      this.ogpx[k][1] = trunc((100.0 + rnd.nextDouble() * 760.0) * 0.7071 * n10);
      this.ogpz[k][1] = this.ogpx[k][1];
      this.ogpx[k][2] = trunc((100.0 + rnd.nextDouble() * 760.0) * n10);
      this.ogpz[k][2] = 0;
      this.ogpx[k][3] = trunc((100.0 + rnd.nextDouble() * 760.0) * 0.7071 * n10);
      this.ogpz[k][3] = -this.ogpx[k][3];
      this.ogpx[k][4] = 0;
      this.ogpz[k][4] = -trunc((100.0 + rnd.nextDouble() * 760.0) * n10);
      this.ogpx[k][5] = -trunc((100.0 + rnd.nextDouble() * 760.0) * 0.7071 * n10);
      this.ogpz[k][5] = this.ogpx[k][5];
      this.ogpx[k][6] = -trunc((100.0 + rnd.nextDouble() * 760.0) * n10);
      this.ogpz[k][6] = 0;
      this.ogpx[k][7] = -trunc((100.0 + rnd.nextDouble() * 760.0) * 0.7071 * n10);
      this.ogpz[k][7] = -this.ogpx[k][7];
      for (let l = 0; l < 8; ++l) {
        let n11 = l - 1;
        if (n11 === -1) n11 = 7;
        let n12 = l + 1;
        if (n12 === 8) n12 = 0;
        this.ogpx[k][l] = idiv(idiv(this.ogpx[k][n11] + this.ogpx[k][n12], 2) + this.ogpx[k][l], 2);
        this.ogpz[k][l] = idiv(idiv(this.ogpz[k][n11] + this.ogpz[k][n12], 2) + this.ogpz[k][l], 2);
        this.pvr[k][l] = fr(1.1 + rnd.nextDouble() * 0.8);
        const n13 = trunc(Math.sqrt(trunc(
          fr(fr(fr(Math.imul(this.ogpx[k][l], this.ogpx[k][l]) * this.pvr[k][l]) * this.pvr[k][l]) +
             fr(fr(Math.imul(this.ogpz[k][l], this.ogpz[k][l]) * this.pvr[k][l]) * this.pvr[k][l])))));
        if (n13 > this.pmx[k]) this.pmx[k] = n13;
      }
      this.pcv[k] = fr(0.97 + rnd.nextDouble() * 0.03);
      if (this.pcv[k] > 1.0) this.pcv[k] = 1.0;
      if (rnd.nextDouble() > rnd.nextDouble()) this.pcv[k] = 1.0;
    }
  }

  groundpolys(graphics2D) {
    let n = idiv(this.x - this.sgpx, 1200) - 12;
    if (n < 0) n = 0;
    let nrw = n + 25;
    if (nrw > this.nrw) nrw = this.nrw;
    if (nrw < n) nrw = n;
    let n2 = idiv(this.z - this.sgpz, 1200) - 12;
    if (n2 < 0) n2 = 0;
    let ncl = n2 + 25;
    if (ncl > this.ncl) ncl = this.ncl;
    if (ncl < n2) ncl = n2;
    const array = int2(Math.max(0, nrw - n), Math.max(0, ncl - n2));
    for (let i = n; i < nrw; ++i) {
      for (let j = n2; j < ncl; ++j) {
        array[i - n][j - n2] = 0;
        const n3 = i + j * this.nrw;
        if (this.resdown < 2 || n3 % 2 === 0) {
          const n4 = this.cx + trunc(fr(fr((this.cgpx[n3] - this.x - this.cx) * this.cos(this.xz)) - fr((this.cgpz[n3] - this.z - this.cz) * this.sin(this.xz))));
          const n5 = this.cz + trunc(fr(fr((250 - this.y - this.cy) * this.sin(this.zy)) + fr((this.cz + trunc(fr(fr((this.cgpx[n3] - this.x - this.cx) * this.sin(this.xz)) + fr((this.cgpz[n3] - this.z - this.cz) * this.cos(this.xz)))) - this.cz) * this.cos(this.zy))));
          if (this.xs(n4 + this.pmx[n3], n5) > 0 && this.xs(n4 - this.pmx[n3], n5) < this.w && n5 > -this.pmx[n3] && n5 < this.fade[2]) {
            array[i - n][j - n2] = n5;
            const array2 = intArray(8);
            const array3 = intArray(8);
            const array4 = intArray(8);
            for (let k = 0; k < 8; ++k) {
              array2[k] = trunc(fr(this.ogpx[n3][k] * this.pvr[n3][k]) + this.cgpx[n3] - this.x);
              array3[k] = trunc(fr(this.ogpz[n3][k] * this.pvr[n3][k]) + this.cgpz[n3] - this.z);
              array4[k] = this.ground;
            }
            this.rot(array2, array3, this.cx, this.cz, this.xz, 8);
            this.rot(array4, array3, this.cy, this.cz, this.zy, 8);
            const array5 = intArray(8);
            const array6 = intArray(8);
            let n6 = 0, n7 = 0, n8 = 0, n9 = 0;
            let b = true;
            for (let l = 0; l < 8; ++l) {
              array5[l] = this.xs(array2[l], array3[l]);
              array6[l] = this.ys(array4[l], array3[l]);
              if (array6[l] < 0 || array3[l] < 10) ++n6;
              if (array6[l] > this.h || array3[l] < 10) ++n7;
              if (array5[l] < 0 || array3[l] < 10) ++n8;
              if (array5[l] > this.w || array3[l] < 10) ++n9;
            }
            if (n8 === 8 || n6 === 8 || n7 === 8 || n9 === 8) b = false;
            if (b) {
              let r = trunc(fr(fr(fr(this.cpol[0] * this.pcv[n3]) + this.cgrnd[0]) / 2.0));
              let g = trunc(fr(fr(fr(this.cpol[1] * this.pcv[n3]) + this.cgrnd[1]) / 2.0));
              let b2 = trunc(fr(fr(fr(this.cpol[2] * this.pcv[n3]) + this.cgrnd[2]) / 2.0));
              if (n5 - this.pmx[n3] > this.fade[0]) {
                r = idiv(r * 7 + this.cfade[0], 8);
                g = idiv(g * 7 + this.cfade[1], 8);
                b2 = idiv(b2 * 7 + this.cfade[2], 8);
              }
              if (n5 - this.pmx[n3] > this.fade[1]) {
                r = idiv(r * 7 + this.cfade[0], 8);
                g = idiv(g * 7 + this.cfade[1], 8);
                b2 = idiv(b2 * 7 + this.cfade[2], 8);
              }
              graphics2D.setColor(r, g, b2);
              graphics2D.fillPolygon(array5, array6, 8);
            }
          }
        }
      }
    }
    for (let n10 = n; n10 < nrw; ++n10) {
      for (let n11 = n2; n11 < ncl; ++n11) {
        if (array[n10 - n][n11 - n2] !== 0) {
          const n12 = n10 + n11 * this.nrw;
          const array7 = intArray(8);
          const array8 = intArray(8);
          const array9 = intArray(8);
          for (let n13 = 0; n13 < 8; ++n13) {
            array7[n13] = this.ogpx[n12][n13] + this.cgpx[n12] - this.x;
            array8[n13] = this.ogpz[n12][n13] + this.cgpz[n12] - this.z;
            array9[n13] = this.ground;
          }
          this.rot(array7, array8, this.cx, this.cz, this.xz, 8);
          this.rot(array9, array8, this.cy, this.cz, this.zy, 8);
          const array10 = intArray(8);
          const array11 = intArray(8);
          let n14 = 0, n15 = 0, n16 = 0, n17 = 0;
          let b3 = true;
          for (let n18 = 0; n18 < 8; ++n18) {
            array10[n18] = this.xs(array7[n18], array8[n18]);
            array11[n18] = this.ys(array9[n18], array8[n18]);
            if (array11[n18] < 0 || array8[n18] < 10) ++n14;
            if (array11[n18] > this.h || array8[n18] < 10) ++n15;
            if (array10[n18] < 0 || array8[n18] < 10) ++n16;
            if (array10[n18] > this.w || array8[n18] < 10) ++n17;
          }
          if (n16 === 8 || n14 === 8 || n15 === 8 || n17 === 8) b3 = false;
          if (b3) {
            let r2 = trunc(fr(this.cpol[0] * this.pcv[n12]));
            let g2 = trunc(fr(this.cpol[1] * this.pcv[n12]));
            let b4 = trunc(fr(this.cpol[2] * this.pcv[n12]));
            if (array[n10 - n][n11 - n2] - this.pmx[n12] > this.fade[0]) {
              r2 = idiv(r2 * 7 + this.cfade[0], 8);
              g2 = idiv(g2 * 7 + this.cfade[1], 8);
              b4 = idiv(b4 * 7 + this.cfade[2], 8);
            }
            if (array[n10 - n][n11 - n2] - this.pmx[n12] > this.fade[1]) {
              r2 = idiv(r2 * 7 + this.cfade[0], 8);
              g2 = idiv(g2 * 7 + this.cfade[1], 8);
              b4 = idiv(b4 * 7 + this.cfade[2], 8);
            }
            graphics2D.setColor(r2, g2, b4);
            graphics2D.fillPolygon(array10, array11, 8);
          }
        }
      }
    }
  }

  newclouds(n, n2, n3, n4) {
    n = idiv(n, 20) - 10000;
    n2 = idiv(n2, 20) + 10000;
    n3 = idiv(n3, 20) - 10000;
    n4 = idiv(n4, 20) + 10000;
    this.noc = idiv(Math.imul(n2 - n, n4 - n3), 16666667);
    this.clx = intArray(this.noc);
    this.clz = intArray(this.noc);
    this.cmx = intArray(this.noc);
    this.clax = int3(this.noc, 3, 12);
    this.clay = int3(this.noc, 3, 12);
    this.claz = int3(this.noc, 3, 12);
    this.clc = int4(this.noc, 2, 6, 3);
    for (let i = 0; i < this.noc; ++i) {
      this.clx[i] = trunc(n + (n2 - n) * random());
      this.clz[i] = trunc(n3 + (n4 - n3) * random());
      const n5 = fr(0.25 + random() * 1.25);
      // The 12 rim points at 30-degree steps. Kept fully written out, matching
      // the Java: the sign and axis pattern is NOT a clean rotation — indices
      // 1 and 7 mirror claz from clax, index 2 zeroes it, and the negations
      // are asymmetric. Any "tidying" here silently reshapes every cloud.
      const n6 = fr((200.0 + random() * 700.0) * n5);
      this.clax[i][0][0] = trunc(n6 * 0.3826);
      this.claz[i][0][0] = trunc(n6 * 0.9238);
      this.clay[i][0][0] = trunc((25.0 - random() * 50.0) * n5);
      const n7 = fr((200.0 + random() * 700.0) * n5);
      this.clax[i][0][1] = trunc(n7 * 0.7071);
      this.claz[i][0][1] = this.clax[i][0][1];
      this.clay[i][0][1] = trunc((25.0 - random() * 50.0) * n5);
      const n8 = fr((200.0 + random() * 700.0) * n5);
      this.clax[i][0][2] = trunc(n8 * 0.9238);
      this.claz[i][0][2] = 0;
      this.clay[i][0][2] = trunc((25.0 - random() * 50.0) * n5);
      const n9 = fr((200.0 + random() * 700.0) * n5);
      this.clax[i][0][3] = trunc(n9 * 0.9238);
      this.claz[i][0][3] = -trunc(n9 * 0.3826);
      this.clay[i][0][3] = trunc((25.0 - random() * 50.0) * n5);
      const n10c = fr((200.0 + random() * 700.0) * n5);
      this.clax[i][0][4] = trunc(n10c * 0.7071);
      this.claz[i][0][4] = -trunc(n10c * 0.7071);
      this.clay[i][0][4] = trunc((25.0 - random() * 50.0) * n5);
      const n11c = fr((200.0 + random() * 700.0) * n5);
      this.clax[i][0][5] = trunc(n11c * 0.3826);
      this.claz[i][0][5] = -trunc(n11c * 0.9238);
      this.clay[i][0][5] = trunc((25.0 - random() * 50.0) * n5);
      const n12c = fr((200.0 + random() * 700.0) * n5);
      this.clax[i][0][6] = -trunc(n12c * 0.3826);
      this.claz[i][0][6] = -trunc(n12c * 0.9238);
      this.clay[i][0][6] = trunc((25.0 - random() * 50.0) * n5);
      const n13c = fr((200.0 + random() * 700.0) * n5);
      this.clax[i][0][7] = -trunc(n13c * 0.7071);
      this.claz[i][0][7] = this.clax[i][0][7];
      this.clay[i][0][7] = trunc((25.0 - random() * 50.0) * n5);
      const n14c = fr((200.0 + random() * 700.0) * n5);
      this.clax[i][0][8] = -trunc(n14c * 0.9238);
      this.claz[i][0][8] = -trunc(n14c * 0.3826);
      this.clay[i][0][8] = trunc((25.0 - random() * 50.0) * n5);
      const n15c = fr((200.0 + random() * 700.0) * n5);
      this.clax[i][0][9] = -trunc(n15c * 0.9238);
      this.claz[i][0][9] = trunc(n15c * 0.3826);
      this.clay[i][0][9] = trunc((25.0 - random() * 50.0) * n5);
      const n16c = fr((200.0 + random() * 700.0) * n5);
      this.clax[i][0][10] = -trunc(n16c * 0.7071);
      this.claz[i][0][10] = trunc(n16c * 0.7071);
      this.clay[i][0][10] = trunc((25.0 - random() * 50.0) * n5);
      const n17c = fr((200.0 + random() * 700.0) * n5);
      this.clax[i][0][11] = -trunc(n17c * 0.3826);
      this.claz[i][0][11] = trunc(n17c * 0.9238);
      this.clay[i][0][11] = trunc((25.0 - random() * 50.0) * n5);
      for (let j = 0; j < 12; ++j) {
        let n18 = j - 1;
        if (n18 === -1) n18 = 11;
        let n19 = j + 1;
        if (n19 === 12) n19 = 0;
        this.clax[i][0][j] = idiv(idiv(this.clax[i][0][n18] + this.clax[i][0][n19], 2) + this.clax[i][0][j], 2);
        this.clay[i][0][j] = idiv(idiv(this.clay[i][0][n18] + this.clay[i][0][n19], 2) + this.clay[i][0][j], 2);
        this.claz[i][0][j] = idiv(idiv(this.claz[i][0][n18] + this.claz[i][0][n19], 2) + this.claz[i][0][j], 2);
      }
      for (let k = 0; k < 12; ++k) {
        const n20 = fr(1.2 + 0.6 * random());
        this.clax[i][1][k] = trunc(fr(this.clax[i][0][k] * n20));
        this.claz[i][1][k] = trunc(fr(this.claz[i][0][k] * n20));
        this.clay[i][1][k] = trunc(this.clay[i][0][k] - 100.0 * random());
        const n21 = fr(1.1 + 0.3 * random());
        this.clax[i][2][k] = trunc(fr(this.clax[i][1][k] * n21));
        this.claz[i][2][k] = trunc(fr(this.claz[i][1][k] * n21));
        this.clay[i][2][k] = trunc(this.clay[i][1][k] - 240.0 * random());
      }
      this.cmx[i] = 0;
      for (let l = 0; l < 12; ++l) {
        let n22 = l - 1;
        if (n22 === -1) n22 = 11;
        let n23 = l + 1;
        if (n23 === 12) n23 = 0;
        this.clay[i][1][l] = idiv(idiv(this.clay[i][1][n22] + this.clay[i][1][n23], 2) + this.clay[i][1][l], 2);
        this.clay[i][2][l] = idiv(idiv(this.clay[i][2][n22] + this.clay[i][2][n23], 2) + this.clay[i][2][l], 2);
        const n24 = trunc(Math.sqrt(
          Math.imul(this.clax[i][2][l], this.clax[i][2][l]) +
          Math.imul(this.claz[i][2][l], this.claz[i][2][l])));
        if (n24 > this.cmx[i]) this.cmx[i] = n24;
      }
      for (let n25 = 0; n25 < 6; ++n25) {
        const r1 = random();
        const r2 = random();
        for (let n26 = 0; n26 < 3; ++n26) {
          const n27 = fr(fr(this.clds[n26] * 1.05) - this.clds[n26]);
          this.clc[i][0][n25][n26] = trunc(this.clds[n26] + n27 * r1);
          if (this.clc[i][0][n25][n26] > 255) this.clc[i][0][n25][n26] = 255;
          if (this.clc[i][0][n25][n26] < 0) this.clc[i][0][n25][n26] = 0;
          this.clc[i][1][n25][n26] = trunc(fr(this.clds[n26] * 1.05) + n27 * r2);
          if (this.clc[i][1][n25][n26] > 255) this.clc[i][1][n25][n26] = 255;
          if (this.clc[i][1][n25][n26] < 0) this.clc[i][1][n25][n26] = 0;
        }
      }
    }
  }

  drawclouds(graphics2D) {
    for (let i = 0; i < this.noc; ++i) {
      const n = this.cx + trunc(fr(fr((this.clx[i] - idiv(this.x, 20) - this.cx) * this.cos(this.xz)) - fr((this.clz[i] - idiv(this.z, 20) - this.cz) * this.sin(this.xz))));
      const n2 = this.cz + trunc(fr(fr((this.cldd[4] - idiv(this.y, 20) - this.cy) * this.sin(this.zy)) + fr((this.cz + trunc(fr(fr((this.clx[i] - idiv(this.x, 20) - this.cx) * this.sin(this.xz)) + fr((this.clz[i] - idiv(this.z, 20) - this.cz) * this.cos(this.xz)))) - this.cz) * this.cos(this.zy))));
      const xs = this.xs(n + this.cmx[i], n2);
      const xs2 = this.xs(n - this.cmx[i], n2);
      if (xs > 0 && xs2 < this.w && n2 > -this.cmx[i] && xs - xs2 > 20) {
        const array = int2(3, 12);
        const array2 = int2(3, 12);
        const array3 = int2(3, 12);
        const array4 = intArray(12);
        const array5 = intArray(12);
        for (let j = 0; j < 3; ++j) {
          for (let k = 0; k < 12; ++k) {
            array[j][k] = this.clax[i][j][k] + this.clx[i] - idiv(this.x, 20);
            array3[j][k] = this.claz[i][j][k] + this.clz[i] - idiv(this.z, 20);
            array2[j][k] = this.clay[i][j][k] + this.cldd[4] - idiv(this.y, 20);
          }
          this.rot(array[j], array3[j], this.cx, this.cz, this.xz, 12);
          this.rot(array2[j], array3[j], this.cy, this.cz, this.zy, 12);
        }
        // Outer skirt (layer 1 -> 2), then inner skirt (layer 0 -> 1), then
        // the cap. That order is the cloud's depth sorting; do not merge.
        this.#cloudBand(graphics2D, i, array, array2, array3, array4, array5, 1, 2, 1);
        this.#cloudBand(graphics2D, i, array, array2, array3, array4, array5, 0, 1, 0);
        let n34 = 0, n35 = 0, n36 = 0, n37 = 0;
        let b5 = true;
        let n38 = 0, n39 = 0, n40 = 0;
        for (let n41 = 0; n41 < 12; ++n41) {
          array4[n41] = this.xs(array[0][n41], array3[0][n41]);
          array5[n41] = this.ys(array2[0][n41], array3[0][n41]);
          n39 += array[0][n41];
          n38 += array2[0][n41];
          n40 += array3[0][n41];
          if (array5[n41] < 0 || array3[0][n41] < 10) ++n34;
          if (array5[n41] > this.h || array3[0][n41] < 10) ++n35;
          if (array4[n41] < 0 || array3[0][n41] < 10) ++n36;
          if (array4[n41] > this.w || array3[0][n41] < 10) ++n37;
        }
        if (n36 === 12 || n34 === 12 || n35 === 12 || n37 === 12) b5 = false;
        if (b5) {
          const n42 = idiv(n39, 12);
          const n43 = idiv(n38, 12);
          const n44 = idiv(n40, 12);
          const n45 = trunc(Math.sqrt(
            Math.imul(this.cy - n43, this.cy - n43) +
            Math.imul(this.cx - n42, this.cx - n42) +
            Math.imul(n44, n44)));
          if (n45 < this.fade[7]) {
            let r3 = this.clds[0];
            let g3 = this.clds[1];
            let b6 = this.clds[2];
            for (let n46 = 0; n46 < 16; ++n46) {
              if (n45 > this.fade[n46]) {
                r3 = idiv(r3 * this.fogd + this.cfade[0], this.fogd + 1);
                g3 = idiv(g3 * this.fogd + this.cfade[1], this.fogd + 1);
                b6 = idiv(b6 * this.fogd + this.cfade[2], this.fogd + 1);
              }
            }
            graphics2D.setColor(r3, g3, b6);
            graphics2D.fillPolygon(array4, array5, 12);
          }
        }
      }
    }
  }

  /**
   * One skirt of a cloud: the quad strip between layer `lo` and layer `hi`.
   * The Java has this twice, inline and near-identical apart from the layer
   * indices and which clc slot supplies the colour; folded here because the
   * two copies are provably the same code, and the draw order between the two
   * calls is preserved by the call sites.
   */
  #cloudBand(graphics2D, i, array, array2, array3, array4, array5, lo, hi, cslot) {
    for (let l = 0; l < 12; l += 2) {
      let n3 = 0, n4 = 0, n5 = 0, n6 = 0;
      let b = true;
      let n7 = 0, n8 = 0, n9 = 0;
      for (let n10 = 0; n10 < 6; ++n10) {
        let n11 = 0;
        let n12 = lo;
        if (n10 === 0) n11 = l;
        if (n10 === 1) { n11 = l + 1; if (n11 >= 12) n11 -= 12; }
        if (n10 === 2) { n11 = l + 2; if (n11 >= 12) n11 -= 12; }
        if (n10 === 3) { n11 = l + 2; if (n11 >= 12) n11 -= 12; n12 = hi; }
        if (n10 === 4) { n11 = l + 1; if (n11 >= 12) n11 -= 12; n12 = hi; }
        if (n10 === 5) { n11 = l; n12 = hi; }
        array4[n10] = this.xs(array[n12][n11], array3[n12][n11]);
        array5[n10] = this.ys(array2[n12][n11], array3[n12][n11]);
        n8 += array[n12][n11];
        n7 += array2[n12][n11];
        n9 += array3[n12][n11];
        if (array5[n10] < 0 || array3[0][n10] < 10) ++n3;
        if (array5[n10] > this.h || array3[0][n10] < 10) ++n4;
        if (array4[n10] < 0 || array3[0][n10] < 10) ++n5;
        if (array4[n10] > this.w || array3[0][n10] < 10) ++n6;
      }
      if (n5 === 6 || n3 === 6 || n4 === 6 || n6 === 6) b = false;
      if (b) {
        const n13 = idiv(n8, 6);
        const n14 = idiv(n7, 6);
        const n15 = idiv(n9, 6);
        const n16 = trunc(Math.sqrt(
          Math.imul(this.cy - n14, this.cy - n14) +
          Math.imul(this.cx - n13, this.cx - n13) +
          Math.imul(n15, n15)));
        if (n16 < this.fade[7]) {
          let r = this.clc[i][cslot][idiv(l, 2)][0];
          let g = this.clc[i][cslot][idiv(l, 2)][1];
          let b2 = this.clc[i][cslot][idiv(l, 2)][2];
          for (let n17 = 0; n17 < 16; ++n17) {
            if (n16 > this.fade[n17]) {
              r = idiv(r * this.fogd + this.cfade[0], this.fogd + 1);
              g = idiv(g * this.fogd + this.cfade[1], this.fogd + 1);
              b2 = idiv(b2 * this.fogd + this.cfade[2], this.fogd + 1);
            }
          }
          graphics2D.setColor(r, g, b2);
          graphics2D.fillPolygon(array4, array5, 6);
        }
      }
    }
  }

  newmountains(n, n2, n3, n4) {
    const rnd = new JavaRandom(this.mgen);
    this.nmt = trunc(20.0 + 10.0 * rnd.nextDouble());
    const n5 = idiv(n + n2, 60);
    const n6 = idiv(n3 + n4, 60);
    const n7 = idiv(Math.max(n2 - n, n4 - n3), 60);
    this.mrd = intArray(this.nmt);
    this.nmv = intArray(this.nmt);
    this.mtx = objArray(this.nmt);
    this.mty = objArray(this.nmt);
    this.mtz = objArray(this.nmt);
    this.mtc = objArray(this.nmt);
    const array = intArray(this.nmt);
    const array2 = intArray(this.nmt);
    for (let i = 0; i < this.nmt; ++i) {
      array[i] = trunc(10000.0 + rnd.nextDouble() * 10000.0);
      const n8 = trunc(rnd.nextDouble() * 360.0);
      let n9, n10, n11;
      if (rnd.nextDouble() > rnd.nextDouble()) {
        n9 = fr(0.2 + rnd.nextDouble() * 0.35);
        n10 = fr(0.2 + rnd.nextDouble() * 0.35);
        this.nmv[i] = trunc(n9 * (24.0 + 16.0 * rnd.nextDouble()));
        n11 = trunc(85.0 + 10.0 * rnd.nextDouble());
      } else {
        n9 = fr(0.3 + rnd.nextDouble() * 1.1);
        n10 = fr(0.2 + rnd.nextDouble() * 0.35);
        this.nmv[i] = trunc(n9 * (12.0 + 8.0 * rnd.nextDouble()));
        n11 = trunc(104.0 - 10.0 * rnd.nextDouble());
      }
      this.mtx[i] = intArray(this.nmv[i] * 2);
      this.mty[i] = intArray(this.nmv[i] * 2);
      this.mtz[i] = intArray(this.nmv[i] * 2);
      this.mtc[i] = int2(this.nmv[i], 3);
      for (let j = 0; j < this.nmv[i]; ++j) {
        this.mtx[i][j] = trunc((j * 500 + (rnd.nextDouble() * 800.0 - 400.0) - 250 * (this.nmv[i] - 1)) * n9);
        this.mtx[i][j + this.nmv[i]] = trunc((j * 500 + (rnd.nextDouble() * 800.0 - 400.0) - 250 * (this.nmv[i] - 1)) * n9);
        this.mtx[i][this.nmv[i]] = trunc(this.mtx[i][0] - (100.0 + rnd.nextDouble() * 600.0) * n9);
        this.mtx[i][this.nmv[i] * 2 - 1] = trunc(this.mtx[i][this.nmv[i] - 1] + (100.0 + rnd.nextDouble() * 600.0) * n9);
        if (j === 0 || j === this.nmv[i] - 1) {
          this.mty[i][j] = trunc((-400.0 - 1200.0 * rnd.nextDouble()) * n10 + this.ground);
        }
        if (j === 1 || j === this.nmv[i] - 2) {
          this.mty[i][j] = trunc((-1000.0 - 1450.0 * rnd.nextDouble()) * n10 + this.ground);
        }
        if (j > 1 && j < this.nmv[i] - 2) {
          this.mty[i][j] = trunc((-1600.0 - 1700.0 * rnd.nextDouble()) * n10 + this.ground);
        }
        this.mty[i][j + this.nmv[i]] = this.ground - 70;
        this.mtz[i][j] = n6 + n7 + array[i];
        this.mtz[i][j + this.nmv[i]] = n6 + n7 + array[i];
        const n12 = fr(0.5 + rnd.nextDouble() * 0.5);
        this.mtc[i][j][0] = trunc(fr(fr(170.0 * n12) + fr(fr(170.0 * n12) * fr(this.snap[0] / 100.0))));
        if (this.mtc[i][j][0] > 255) this.mtc[i][j][0] = 255;
        if (this.mtc[i][j][0] < 0) this.mtc[i][j][0] = 0;
        this.mtc[i][j][1] = trunc(fr(fr(n11 * n12) + fr(fr(85.0 * n12) * fr(this.snap[1] / 100.0))));
        if (this.mtc[i][j][1] > 255) this.mtc[i][j][1] = 255;
        if (this.mtc[i][j][1] < 1) this.mtc[i][j][1] = 0;
        this.mtc[i][j][2] = 0;
      }
      for (let k = 1; k < this.nmv[i] - 1; ++k) {
        this.mty[i][k] = idiv(idiv(this.mty[i][k - 1] + this.mty[i][k + 1], 2) + this.mty[i][k], 2);
      }
      this.rot(this.mtx[i], this.mtz[i], n5, n6, n8, this.nmv[i] * 2);
      array2[i] = 0;
    }
    // Rank by distance so drawmountains() paints far-to-near.
    for (let l = 0; l < this.nmt; ++l) {
      for (let n13 = l + 1; n13 < this.nmt; ++n13) {
        if (array[l] < array[n13]) ++array2[l];
        else ++array2[n13];
      }
      this.mrd[array2[l]] = l;
    }
  }

  drawmountains(graphics2D) {
    for (let i = 0; i < this.nmt; ++i) {
      const n = this.mrd[i];
      const px = (idx) => this.cx + trunc(fr(fr((this.mtx[n][idx] - idiv(this.x, 30) - this.cx) * this.cos(this.xz)) - fr((this.mtz[n][idx] - idiv(this.z, 30) - this.cz) * this.sin(this.xz))));
      const pz = (idx) => this.cz + trunc(fr(fr((this.mty[n][idx] - idiv(this.y, 30) - this.cy) * this.sin(this.zy)) + fr((this.cz + trunc(fr(fr((this.mtx[n][idx] - idiv(this.x, 30) - this.cx) * this.sin(this.xz)) + fr((this.mtz[n][idx] - idiv(this.z, 30) - this.cz) * this.cos(this.xz)))) - this.cz) * this.cos(this.zy))));
      const n2 = px(0);
      const n3 = pz(0);
      if (this.xs(px(this.nmv[n] - 1), pz(this.nmv[n] - 1)) > 0 && this.xs(n2, n3) < this.w) {
        const array = intArray(this.nmv[n] * 2);
        const array2 = intArray(this.nmv[n] * 2);
        const array3 = intArray(this.nmv[n] * 2);
        for (let j = 0; j < this.nmv[n] * 2; ++j) {
          array[j] = this.mtx[n][j] - idiv(this.x, 30);
          array2[j] = this.mty[n][j] - idiv(this.y, 30);
          array3[j] = this.mtz[n][j] - idiv(this.z, 30);
        }
        const q = idiv(this.nmv[n], 4);
        const n4 = trunc(Math.sqrt(Math.imul(array[q], array[q]) + Math.imul(array3[q], array3[q])));
        this.rot(array, array3, this.cx, this.cz, this.xz, this.nmv[n] * 2);
        this.rot(array2, array3, this.cy, this.cz, this.zy, this.nmv[n] * 2);
        const array4 = intArray(4);
        const array5 = intArray(4);
        for (let k = 0; k < this.nmv[n] - 1; ++k) {
          let n5 = 0, n6 = 0, n7 = 0, n8 = 0;
          let b = true;
          for (let l = 0; l < 4; ++l) {
            let n9 = l + k;
            if (l === 2) n9 = k + this.nmv[n] + 1;
            if (l === 3) n9 = k + this.nmv[n];
            array4[l] = this.xs(array[n9], array3[n9]);
            array5[l] = this.ys(array2[n9], array3[n9]);
            if (array5[l] < 0 || array3[n9] < 10) ++n5;
            if (array5[l] > this.h || array3[n9] < 10) ++n6;
            if (array4[l] < 0 || array3[n9] < 10) ++n7;
            if (array4[l] > this.w || array3[n9] < 10) ++n8;
          }
          if (n7 === 4 || n5 === 4 || n6 === 4 || n8 === 4) b = false;
          if (b) {
            let n10 = fr(fr(fr(fr(n4 / 2500.0) + fr((8000.0 - this.fade[0]) / 1000.0)) - 2.0) - fr((Math.abs(this.y) - 250.0) / 5000.0));
            if (n10 > 0.0 && n10 < 10.0) {
              if (n10 < 3.5) n10 = 3.5;
              const den = fr(2.0 + fr(n10 * 2.0));
              graphics2D.setColor(
                trunc(fr(fr(this.mtc[n][k][0] + this.cgrnd[0] + fr(this.csky[0] * n10) + fr(this.cfade[0] * n10)) / den)),
                trunc(fr(fr(this.mtc[n][k][1] + this.cgrnd[1] + fr(this.csky[1] * n10) + fr(this.cfade[1] * n10)) / den)),
                trunc(fr(fr(this.mtc[n][k][2] + this.cgrnd[2] + fr(this.csky[2] * n10) + fr(this.cfade[2] * n10)) / den)));
              graphics2D.fillPolygon(array4, array5, 4);
            }
          }
        }
      }
    }
  }

  newstars() {
    this.stx = null;
    this.stz = null;
    this.stc = null;
    this.bst = null;
    this.twn = null;
    this.nst = 0;
    if (this.lightson) {
      const rnd = new JavaRandom(trunc(random() * 100000.0));
      this.nst = 40;
      this.stx = intArray(this.nst);
      this.stz = intArray(this.nst);
      this.stc = int3(this.nst, 2, 3);
      this.bst = new Array(this.nst).fill(false);
      this.twn = intArray(this.nst);
      for (let i = 0; i < this.nst; ++i) {
        this.stx[i] = trunc(2000.0 * rnd.nextDouble() - 1000.0);
        this.stz[i] = trunc(2000.0 * rnd.nextDouble() - 1000.0);
        let n = trunc(3.0 * rnd.nextDouble());
        if (n >= 3) n = 0;
        if (n <= -1) n = 2;
        let n2 = n + 1;
        if (rnd.nextDouble() > rnd.nextDouble()) n2 = n - 1;
        if (n2 === 3) n2 = 0;
        if (n2 === -1) n2 = 2;
        for (let j = 0; j < 3; ++j) {
          this.stc[i][0][j] = 200;
          if (n === j) this.stc[i][0][j] = trunc(this.stc[i][0][j] + 55.0 * rnd.nextDouble());
          if (n2 === j) this.stc[i][0][j] += 55;
          this.stc[i][0][j] = idiv(this.stc[i][0][j] * 2 + this.csky[j], 3);
          this.stc[i][1][j] = idiv(this.stc[i][0][j] + this.csky[j], 2);
        }
        this.twn[i] = trunc(4.0 * rnd.nextDouble());
        this.bst[i] = rnd.nextDouble() > 0.8;
      }
    }
  }

  drawstars(graphics2D) {
    for (let i = 0; i < this.nst; ++i) {
      const n = this.cx + trunc(fr(fr(this.stx[i] * this.cos(this.xz)) - fr(this.stz[i] * this.sin(this.xz))));
      const n2 = this.cz + trunc(fr(fr(this.stx[i] * this.sin(this.xz)) + fr(this.stz[i] * this.cos(this.xz))));
      const n3 = this.cy + trunc(fr(fr(-200.0 * this.cos(this.zy)) - fr(n2 * this.sin(this.zy))));
      const n4 = this.cz + trunc(fr(fr(-200.0 * this.sin(this.zy)) + fr(n2 * this.cos(this.zy))));
      const xs = this.xs(n, n4);
      const ys = this.ys(n3, n4);
      if (xs - 1 > this.iw && xs + 3 < this.w && ys - 1 > this.ih && ys + 3 < this.h) {
        // Twinkle is a tick-rate effect too, and one that no snapshot could
        // have restored: it rolls the unseeded module-level random(), so an
        // interpolated frame would have recoloured every star on the night
        // stages regardless of what main.js put back.
        if (this.interpolating) {
          // fall through to the draw below with the colours the tick chose
        } else if (this.twn[i] === 0) {
          let n5 = trunc(3.0 * random());
          if (n5 >= 3) n5 = 0;
          if (n5 <= -1) n5 = 2;
          let n6 = n5 + 1;
          if (random() > random()) n6 = n5 - 1;
          if (n6 === 3) n6 = 0;
          if (n6 === -1) n6 = 2;
          for (let j = 0; j < 3; ++j) {
            this.stc[i][0][j] = 200;
            if (n5 === j) this.stc[i][0][j] = trunc(this.stc[i][0][j] + 55.0 * random());
            if (n6 === j) this.stc[i][0][j] += 55;
            this.stc[i][0][j] = idiv(this.stc[i][0][j] * 2 + this.csky[j], 3);
            this.stc[i][1][j] = idiv(this.stc[i][0][j] + this.csky[j], 2);
          }
          this.twn[i] = 3;
        } else {
          --this.twn[i];
        }
        let n10 = 0;
        if (this.bst[i]) n10 = 1;
        graphics2D.setColor(this.stc[i][1][0], this.stc[i][1][1], this.stc[i][1][2]);
        graphics2D.fillRect(xs - 1, ys, 3 + n10, 1 + n10);
        graphics2D.fillRect(xs, ys - 1, 1 + n10, 3 + n10);
        graphics2D.setColor(this.stc[i][0][0], this.stc[i][0][1], this.stc[i][0][2]);
        graphics2D.fillRect(xs, ys, 1 + n10, 1 + n10);
      }
    }
  }

  /**
   * Draw the world. FIRST call of the race tick, so everything here is the
   * backdrop: ground fog bands, sky fog bands, the horizon seam, then stars,
   * mountains, clouds, ground polys. Every object drawn later covers these.
   */
  d(graphics2D) {
    // d() is the first call of every draw, so this is where the random log is
    // armed: a tick draw starts recording from scratch, an interpolated pass
    // rewinds the replay cursor to the start of that recording. Recording
    // stays on past the end of draw and picks up simulate()'s randoms too --
    // harmless, since a replay only ever reads the prefix draw consumed.
    if (this.interpolating) {
      this.rp = 0;
    } else {
      this.rn = 0;
      this.recording = true;
    }
    this.nsp = 0;
    if (this.zy > 90) this.zy = 90;
    if (this.zy < -90) this.zy = -90;
    if (this.xz > 360) this.xz -= 360;
    if (this.xz < 0) this.xz += 360;
    if (this.y > 0) this.y = 0;
    this.ground = 250 - this.y;
    const array = intArray(4);
    const array2 = intArray(4);
    let r = this.cgrnd[0];
    let g = this.cgrnd[1];
    let b = this.cgrnd[2];
    let n = this.crgrnd[0];
    let n2 = this.crgrnd[1];
    let n3 = this.crgrnd[2];
    let h = this.h;
    for (let i = 0; i < 16; ++i) {
      let n4 = this.fade[i];
      let ground = this.ground;
      if (this.zy !== 0) {
        ground = this.cy + trunc(fr(fr((this.ground - this.cy) * this.cos(this.zy)) - fr((this.fade[i] - this.cz) * this.sin(this.zy))));
        n4 = this.cz + trunc(fr(fr((this.ground - this.cy) * this.sin(this.zy)) + fr((this.fade[i] - this.cz) * this.cos(this.zy))));
      }
      array[0] = this.iw;
      array2[0] = this.ys(ground, n4);
      if (array2[0] < this.ih) array2[0] = this.ih;
      if (array2[0] > this.h) array2[0] = this.h;
      array[1] = this.iw;
      array2[1] = h;
      array[2] = this.w;
      array2[2] = h;
      array[3] = this.w;
      array2[3] = array2[0];
      h = array2[0];
      if (i > 0) {
        n = idiv(n * 7 + this.cfade[0], 8);
        n2 = idiv(n2 * 7 + this.cfade[1], 8);
        n3 = idiv(n3 * 7 + this.cfade[2], 8);
        if (i < 3) {
          r = idiv(r * 7 + this.cfade[0], 8);
          g = idiv(g * 7 + this.cfade[1], 8);
          b = idiv(b * 7 + this.cfade[2], 8);
        } else {
          r = n;
          g = n2;
          b = n3;
        }
      }
      if (array2[0] < this.h && array2[1] > this.ih) {
        graphics2D.setColor(r, g, b);
        graphics2D.fillPolygon(array, array2, 4);
      }
    }
    if (this.lightn !== -1 && this.lton) {
      if (!this.interpolating) {
        if (this.lightn < 16) {
          if (this.lilo > this.lightn + 217) this.lilo -= 3;
          else this.lightn = trunc(fr(16.0 + fr(16.0 * this.random())));
        } else if (this.lilo < this.lightn + 217) {
          this.lilo += 7;
        } else {
          this.lightn = trunc(fr(16.0 * this.random()));
        }
      }
      this.csky[0] = snapped(this.lilo, this.snap[0]);
      this.csky[1] = snapped(this.lilo, this.snap[1]);
      this.csky[2] = snapped(this.lilo, this.snap[2]);
    }
    let r2 = this.csky[0];
    let g2 = this.csky[1];
    let b2 = this.csky[2];
    let r3 = r2;
    let g3 = g2;
    let b3 = b2;
    let ys = this.ys(
      this.cy + trunc(fr(fr((this.skyline - 700 - this.cy) * this.cos(this.zy)) - fr((7000 - this.cz) * this.sin(this.zy)))),
      this.cz + trunc(fr(fr((this.skyline - 700 - this.cy) * this.sin(this.zy)) + fr((7000 - this.cz) * this.cos(this.zy)))));
    let ih = this.ih;
    for (let j = 0; j < 16; ++j) {
      let n5 = this.fade[j];
      let skyline = this.skyline;
      if (this.zy !== 0) {
        skyline = this.cy + trunc(fr(fr((this.skyline - this.cy) * this.cos(this.zy)) - fr((this.fade[j] - this.cz) * this.sin(this.zy))));
        n5 = this.cz + trunc(fr(fr((this.skyline - this.cy) * this.sin(this.zy)) + fr((this.fade[j] - this.cz) * this.cos(this.zy))));
      }
      array[0] = this.iw;
      array2[0] = this.ys(skyline, n5);
      if (array2[0] > this.h) array2[0] = this.h;
      if (array2[0] < this.ih) array2[0] = this.ih;
      array[1] = this.iw;
      array2[1] = ih;
      array[2] = this.w;
      array2[2] = ih;
      array[3] = this.w;
      array2[3] = array2[0];
      ih = array2[0];
      if (j > 0) {
        r2 = idiv(r2 * 7 + this.cfade[0], 8);
        g2 = idiv(g2 * 7 + this.cfade[1], 8);
        b2 = idiv(b2 * 7 + this.cfade[2], 8);
      }
      if (array2[1] < ys) {
        r3 = r2;
        g3 = g2;
        b3 = b2;
      }
      if (array2[0] > this.ih && array2[1] < this.h) {
        graphics2D.setColor(r2, g2, b2);
        graphics2D.fillPolygon(array, array2, 4);
      }
    }
    array[0] = this.iw;
    array2[0] = ih;
    array[1] = this.iw;
    array2[1] = h;
    array[2] = this.w;
    array2[2] = h;
    array[3] = this.w;
    array2[3] = ih;
    if (array2[0] < this.h && array2[1] > this.ih) {
      let n6 = fr((Math.abs(this.y) - 250.0) / (this.fade[0] * 2));
      if (n6 < 0.0) n6 = 0.0;
      if (n6 > 1.0) n6 = 1.0;
      graphics2D.setColor(
        trunc(fr(fr(fr(r2 * fr(1.0 - n6)) + fr(n * fr(1.0 + n6))) / 2.0)),
        trunc(fr(fr(fr(g2 * fr(1.0 - n6)) + fr(n2 * fr(1.0 + n6))) / 2.0)),
        trunc(fr(fr(fr(b2 * fr(1.0 - n6)) + fr(n3 * fr(1.0 + n6))) / 2.0)));
      graphics2D.fillPolygon(array, array2, 4);
    }
    if (this.resdown !== 2) {
      for (let k = 1; k < 20; ++k) {
        let n7 = 7000;
        let n8 = this.skyline - 700 - k * 70;
        if (this.zy !== 0 && k !== 19) {
          n8 = this.cy + trunc(fr(fr((this.skyline - 700 - k * 70 - this.cy) * this.cos(this.zy)) - fr((7000 - this.cz) * this.sin(this.zy))));
          n7 = this.cz + trunc(fr(fr((this.skyline - 700 - k * 70 - this.cy) * this.sin(this.zy)) + fr((7000 - this.cz) * this.cos(this.zy))));
        }
        array[0] = this.iw;
        if (k !== 19) {
          array2[0] = this.ys(n8, n7);
          if (array2[0] > this.h) array2[0] = this.h;
          if (array2[0] < this.ih) array2[0] = this.ih;
        } else {
          array2[0] = this.ih;
        }
        array[1] = this.iw;
        array2[1] = ys;
        array[2] = this.w;
        array2[2] = ys;
        array[3] = this.w;
        array2[3] = array2[0];
        ys = array2[0];
        // Procyon renders these as `r3 *= (int)0.991`, which would multiply
        // by ZERO and paint the upper sky bands black. The bytecode is
        // `iload; i2d; ldc2_w 0.991d; dmul; d2i; istore` -- i.e.
        // `r3 = (int)(r3 * 0.991)`, a §2 Case A compound assignment. It
        // darkens the gradient gently toward the zenith, which is the point.
        r3 = trunc(r3 * 0.991);
        g3 = trunc(g3 * 0.991);
        b3 = trunc(b3 * 0.998);
        if (array2[1] > this.ih && array2[0] < this.h) {
          graphics2D.setColor(r3, g3, b3);
          graphics2D.fillPolygon(array, array2, 4);
        }
      }
      if (this.lightson) this.drawstars(graphics2D);
      this.drawmountains(graphics2D);
      this.drawclouds(graphics2D);
    }
    this.groundpolys(graphics2D);
    if (this.interpolating) return;
    if (this.noelec !== 0) --this.noelec;
    if (this.cpflik) {
      this.cpflik = false;
    } else {
      this.cpflik = true;
      this.elecr = fr(fr(this.random() * 15.0) - 6.0);
    }
  }

  addsp(n, n2, n3) {
    if (this.nsp !== 7) {
      this.spx[this.nsp] = n;
      this.spz[this.nsp] = n2;
      this.sprad[this.nsp] = n3;
      ++this.nsp;
    }
  }

  setsnap(n, n2, n3) {
    this.snap[0] = n;
    this.snap[1] = n2;
    this.snap[2] = n3;
  }

  setsky(n, n2, n3) {
    this.osky[0] = n;
    this.osky[1] = n2;
    this.osky[2] = n3;
    for (let i = 0; i < 3; ++i) {
      this.clds[i] = snapped(idiv(this.osky[i] * this.cldd[3] + this.cldd[i], this.cldd[3] + 1),
                             this.snap[i]);
    }
    this.csky[0] = snapped(n, this.snap[0]);
    this.csky[1] = snapped(n2, this.snap[1]);
    this.csky[2] = snapped(n3, this.snap[2]);
    const hsbvals = floatArray(3);
    RGBtoHSB(this.csky[0], this.csky[1], this.csky[2], hsbvals);
    this.darksky = hsbvals[2] < 0.6;
  }

  setcloads(n, n2, n3, n4, n5) {
    if (n4 < 0) n4 = 0;
    if (n4 > 10) n4 = 10;
    if (n5 < -1500) n5 = -1500;
    if (n5 > -500) n5 = -500;
    this.cldd[0] = n;
    this.cldd[1] = n2;
    this.cldd[2] = n3;
    this.cldd[3] = n4;
    this.cldd[4] = n5;
    for (let i = 0; i < 3; ++i) {
      this.clds[i] = snapped(idiv(this.osky[i] * this.cldd[3] + this.cldd[i], this.cldd[3] + 1),
                             this.snap[i]);
    }
  }

  setgrnd(n, n2, n3) {
    this.ogrnd[0] = n;
    this.ogrnd[1] = n2;
    this.ogrnd[2] = n3;
    for (let i = 0; i < 3; ++i) {
      this.cpol[i] = snapped(idiv(this.ogrnd[i] * this.texture[3] + this.texture[i], 1 + this.texture[3]),
                             this.snap[i]);
    }
    this.cgrnd[0] = snapped(n, this.snap[0]);
    this.cgrnd[1] = snapped(n2, this.snap[1]);
    this.cgrnd[2] = snapped(n3, this.snap[2]);
    for (let j = 0; j < 3; ++j) {
      this.crgrnd[j] = trunc((this.cpol[j] * 0.99 + this.cgrnd[j]) / 2.0);
    }
  }

  setexture(n, n2, n3, n4) {
    if (n4 < 20) n4 = 20;
    if (n4 > 60) n4 = 60;
    this.texture[0] = n;
    this.texture[1] = n2;
    this.texture[2] = n3;
    this.texture[3] = n4;
    n = idiv(this.ogrnd[0] * n4 + n, 1 + n4);
    n2 = idiv(this.ogrnd[1] * n4 + n2, 1 + n4);
    n3 = idiv(this.ogrnd[2] * n4 + n3, 1 + n4);
    this.cpol[0] = snapped(n, this.snap[0]);
    this.cpol[1] = snapped(n2, this.snap[1]);
    this.cpol[2] = snapped(n3, this.snap[2]);
    for (let i = 0; i < 3; ++i) {
      this.crgrnd[i] = trunc((this.cpol[i] * 0.99 + this.cgrnd[i]) / 2.0);
    }
  }

  setpolys(n, n2, n3) {
    this.cpol[0] = snapped(n, this.snap[0]);
    this.cpol[1] = snapped(n2, this.snap[1]);
    this.cpol[2] = snapped(n3, this.snap[2]);
    for (let i = 0; i < 3; ++i) {
      this.crgrnd[i] = trunc((this.cpol[i] * 0.99 + this.cgrnd[i]) / 2.0);
    }
  }

  setfade(n, n2, n3) {
    this.cfade[0] = snapped(n, this.snap[0]);
    this.cfade[1] = snapped(n2, this.snap[1]);
    this.cfade[2] = snapped(n3, this.snap[2]);
  }

  fadfrom(n) {
    if (n > 8000) n = 8000;
    for (let i = 1; i < 17; ++i) {
      this.fade[i - 1] = idiv(n, 2) * (i + 1);
    }
  }

  adjstfade(n, n2, n3, gameSparker) {
    if (this.resdown !== 2) {
      if (n === 5.0) {
        if (this.resdown === 0 && this.rescnt === 0) {
          gameSparker.moto = 0;
          Madness.anti = 0;
          this.fade[0] = 3000;
          this.fadfrom(3000);
          this.resdown = 1;
          this.rescnt = 10;
        }
        if (this.resdown === 1 && this.rescnt === 0) {
          this.resdown = 2;
        }
        if ((n3 === 0 || this.resdown === 0) && n2 <= -20.0) {
          --this.rescnt;
        }
      } else if (this.resdown === 0) {
        this.rescnt = 5;
      } else {
        this.rescnt = 10;
      }
    }
  }

  xs(n, cz) {
    if (cz < this.cz) cz = this.cz;
    return idiv(Math.imul(cz - this.focus_point, this.cx - n), cz) + n;
  }

  ys(n, n2) {
    if (n2 < this.cz) n2 = this.cz;
    return idiv(Math.imul(n2 - this.focus_point, this.cy - n), n2) + n;
  }

  // Angles are whole degrees everywhere in the simulation, and these are
  // 360-entry tables indexed directly. An integer argument takes the same
  // path it always did and returns the same float32, so the simulation is
  // unchanged and stays bit-identical to the Java.
  //
  // A FRACTIONAL argument lerps between neighbouring entries. Only the
  // interpolated redraw passes one: without it a blended heading has to be
  // rounded to a whole degree, and at ~800px across a ~60-degree view one
  // degree is ~13 pixels -- so an interpolated frame translated smoothly but
  // rotated in 13px steps, which read as jitter on turns and nowhere else.
  // Before this, a fractional index would have hit tsin[1.5] and returned
  // undefined, which is why the caller rounded.

  cos(i) {
    while (i >= 360) i -= 360;
    while (i < 0) i += 360;
    const i0 = i | 0;
    if (i0 === i) return this.tcos[i0];
    const a = this.tcos[i0];
    const b = this.tcos[i0 + 1 === 360 ? 0 : i0 + 1];
    return fr(a + (b - a) * (i - i0));
  }

  sin(i) {
    while (i >= 360) i -= 360;
    while (i < 0) i += 360;
    const i0 = i | 0;
    if (i0 === i) return this.tsin[i0];
    const a = this.tsin[i0];
    const b = this.tsin[i0 + 1 === 360 ? 0 : i0 + 1];
    return fr(a + (b - a) * (i - i0));
  }

  rot(array, array2, n, n2, n3, n4) {
    if (n3 !== 0) {
      const cos = this.cos(n3);
      const sin = this.sin(n3);
      for (let i = 0; i < n4; ++i) {
        const n5 = array[i];
        const n6 = array2[i];
        array[i] = n + trunc(fr(fr((n5 - n) * cos) - fr((n6 - n2) * sin)));
        array2[i] = n2 + trunc(fr(fr((n5 - n) * sin) + fr((n6 - n2) * cos)));
      }
    }
  }
}
