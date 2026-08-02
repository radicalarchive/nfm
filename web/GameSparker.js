// Transpiled from java-src/GameSparker.java — the race subset only.
//
// Ported: loadbase(), loadstage(), getint(), getstring(), and the fase == 0
// race tick (GameSparker.java:891-1030). Everything else in that class is
// applet plumbing, menus, mouse handling, cookies and multiplayer, all of
// which the port replaces or drops.
//
// The IO seam is the one deliberate change: Java opens streams inline, the
// browser cannot, so loadbase/loadstage take already-fetched bytes/text.
// Everything else is line-for-line.

import { idiv, trunc, intArray, objArray } from './java.js';
import { ContO } from './ContO.js';
import { readLines, entryText } from './vfs.js';

/** Base-model names, in the slot order loadbase() assigns. */
export const CAR_NAMES = [
  '2000tornados', 'formula7', 'canyenaro', 'lescrab', 'nimi', 'maxrevenge',
  'leadoxide', 'koolkat', 'drifter', 'policecops', 'mustang', 'king',
  'audir8', 'masheen', 'radicalone', 'drmonster',
];

export const TRACK_NAMES = [
  'road', 'froad', 'twister2', 'twister1', 'turn', 'offroad', 'bumproad',
  'offturn', 'nroad', 'nturn', 'roblend', 'noblend', 'rnblend', 'roadend',
  'offroadend', 'hpground', 'ramp30', 'cramp35', 'dramp15', 'dhilo15',
  'slide10', 'takeoff', 'sramp22', 'offbump', 'offramp', 'sofframp',
  'halfpipe', 'spikes', 'rail', 'thewall', 'checkpoint', 'fixpoint',
  'offcheckpoint', 'sideoff', 'bsideoff', 'uprise', 'riseroad', 'sroad',
  'soffroad', 'tside', 'launchpad', 'thenet', 'speedramp', 'offhill',
  'slider', 'uphill', 'roll1', 'roll2', 'roll3', 'roll4', 'roll5', 'roll6',
  'opile1', 'opile2', 'aircheckpoint', 'tree1', 'tree2', 'tree3', 'tree4',
  'tree5', 'tree6', 'tree7', 'tree8', 'cac1', 'cac2', 'cac3', '8sroad',
  '8soffroad',
];

export class GameSparker {
  constructor() {
    this.mload = 1;
    this.nob = 0;
    this.notb = 0;
    this.view = 0;
    this.mvect = 100;
    this.lmxz = 0;
    this.shaka = 0;
    this.u = objArray(8);          // Control[8], filled by the caller
    this.baseModels = null;        // ContO[124] from loadbase; the tick needs
                                   // it to rebuild a car when Mad.newcar fires
  }

  /**
   * loadbase — models.zip -> ContO[124].
   *
   * `zip` is a Map<name, Uint8Array> from vfs.readZip(). Java streamed the
   * archive; that is the only difference.
   */
  loadbase(array, medium, trackers, zip) {
    this.baseModels = array;
    let n = 0;
    for (const [name, bytes] of zip) {
      let n2 = 0;
      for (let i = 0; i < 16; ++i) {
        if (name.startsWith(CAR_NAMES[i])) n2 = i;
      }
      for (let j = 0; j < 68; ++j) {
        if (name.startsWith(TRACK_NAMES[j])) n2 = j + 56;
      }
      n += bytes.length;
      array[n2] = new ContO(bytes, medium, trackers);
      // Slot index, carried onto every instance built from this model. Used
      // only by the launcher's minimap to classify ground vs track.
      array[n2].baseIndex = n2;
    }
    // Java compares the summed uncompressed size against this exact constant
    // to flag a tampered/short models.zip.
    if (this.mload !== -1 && n !== 615671) {
      this.mload = 2;
    }
  }

  /**
   * loadstage — parse stages/<n>.txt and populate the world.
   *
   * `text` is the already-fetched file contents. Parameter names follow the
   * Java: `array` is the placed objects (ContO[610]), `array2` the base
   * models (ContO[124]).
   */
  loadstage(array, array2, medium, trackers, checkPoints, xtGraphics, array3, record, text) {
    if (xtGraphics.gmode === 1) {
      xtGraphics.nplayers = 5;
      xtGraphics.xstart[4] = 0;
      xtGraphics.zstart[4] = 760;
    }
    trackers.nt = 0;
    this.nob = xtGraphics.nplayers;
    this.notb = 0;
    checkPoints.n = 0;
    checkPoints.nsp = 0;
    checkPoints.fn = 0;
    checkPoints.trackname = '';
    checkPoints.haltall = false;
    checkPoints.wasted = 0;
    checkPoints.catchfin = 0;
    medium.resdown = 0;
    medium.rescnt = 5;
    medium.lightson = false;
    medium.noelec = 0;
    medium.ground = 250;
    medium.trk = 0;
    this.view = 0;
    let getint = 0;
    let getint2 = 100;
    let getint3 = 0;
    let getint4 = 100;
    xtGraphics.newparts = false;
    let string = '';
    try {
      for (const line of readLines(text)) {
        string = '' + line.trim();
        if (string.startsWith('snap')) {
          medium.setsnap(this.getint('snap', string, 0), this.getint('snap', string, 1), this.getint('snap', string, 2));
        }
        if (string.startsWith('sky')) {
          medium.setsky(this.getint('sky', string, 0), this.getint('sky', string, 1), this.getint('sky', string, 2));
          xtGraphics.snap(checkPoints.stage);
        }
        if (string.startsWith('ground')) {
          medium.setgrnd(this.getint('ground', string, 0), this.getint('ground', string, 1), this.getint('ground', string, 2));
        }
        if (string.startsWith('polys')) {
          medium.setpolys(this.getint('polys', string, 0), this.getint('polys', string, 1), this.getint('polys', string, 2));
        }
        if (string.startsWith('fog')) {
          medium.setfade(this.getint('fog', string, 0), this.getint('fog', string, 1), this.getint('fog', string, 2));
        }
        if (string.startsWith('texture')) {
          medium.setexture(this.getint('texture', string, 0), this.getint('texture', string, 1), this.getint('texture', string, 2), this.getint('texture', string, 3));
        }
        if (string.startsWith('clouds')) {
          medium.setcloads(this.getint('clouds', string, 0), this.getint('clouds', string, 1), this.getint('clouds', string, 2), this.getint('clouds', string, 3), this.getint('clouds', string, 4));
        }
        if (string.startsWith('density')) {
          medium.fogd = (this.getint('density', string, 0) + 1) * 2 - 1;
          if (medium.fogd < 1) medium.fogd = 1;
          if (medium.fogd > 30) medium.fogd = 30;
        }
        if (string.startsWith('fadefrom')) {
          medium.fadfrom(this.getint('fadefrom', string, 0));
        }
        if (string.startsWith('lightson')) {
          medium.lightson = true;
        }
        if (string.startsWith('mountains')) {
          medium.mgen = this.getint('mountains', string, 0);
        }
        if (string.startsWith('set')) {
          let getint5 = this.getint('set', string, 0);
          if (xtGraphics.nplayers === 8) {
            if (getint5 === 47) getint5 = 76;
            if (getint5 === 48) getint5 = 77;
          }
          let b = true;
          if (getint5 >= 65 && getint5 <= 75 && checkPoints.notb) b = false;
          if (b) {
            if (getint5 === 49 || getint5 === 64 || (getint5 >= 56 && getint5 <= 61)) {
              xtGraphics.newparts = true;
            }
            if ((checkPoints.stage < 0 || checkPoints.stage >= 28) && getint5 >= 10 && getint5 <= 25) {
              medium.loadnew = true;
            }
            getint5 += 46;
            array[this.nob] = new ContO(array2[getint5], this.getint('set', string, 1),
              medium.ground - array2[getint5].grat, this.getint('set', string, 2), this.getint('set', string, 3));
            if (string.indexOf(')p') !== -1) {
              checkPoints.x[checkPoints.n] = this.getint('set', string, 1);
              checkPoints.z[checkPoints.n] = this.getint('set', string, 2);
              checkPoints.y[checkPoints.n] = 0;
              checkPoints.typ[checkPoints.n] = 0;
              if (string.indexOf(')pt') !== -1) checkPoints.typ[checkPoints.n] = -1;
              if (string.indexOf(')pr') !== -1) checkPoints.typ[checkPoints.n] = -2;
              if (string.indexOf(')po') !== -1) checkPoints.typ[checkPoints.n] = -3;
              if (string.indexOf(')ph') !== -1) checkPoints.typ[checkPoints.n] = -4;
              ++checkPoints.n;
              this.notb = this.nob + 1;
            }
            ++this.nob;
            if (medium.loadnew) medium.loadnew = false;
          }
        }
        if (string.startsWith('chk')) {
          let getint6 = this.getint('chk', string, 0);
          getint6 += 46;
          let getint7 = medium.ground - array2[getint6].grat;
          if (getint6 === 110) getint7 = this.getint('chk', string, 4);
          array[this.nob] = new ContO(array2[getint6], this.getint('chk', string, 1), getint7,
            this.getint('chk', string, 2), this.getint('chk', string, 3));
          checkPoints.x[checkPoints.n] = this.getint('chk', string, 1);
          checkPoints.z[checkPoints.n] = this.getint('chk', string, 2);
          checkPoints.y[checkPoints.n] = getint7;
          if (this.getint('chk', string, 3) === 0) checkPoints.typ[checkPoints.n] = 1;
          else checkPoints.typ[checkPoints.n] = 2;
          checkPoints.pcs = checkPoints.n;
          ++checkPoints.n;
          array[this.nob].checkpoint = checkPoints.nsp + 1;
          ++checkPoints.nsp;
          ++this.nob;
          this.notb = this.nob;
        }
        if (checkPoints.nfix !== 5 && string.startsWith('fix')) {
          let getint8 = this.getint('fix', string, 0);
          getint8 += 46;
          array[this.nob] = new ContO(array2[getint8], this.getint('fix', string, 1),
            this.getint('fix', string, 3), this.getint('fix', string, 2), this.getint('fix', string, 4));
          checkPoints.fx[checkPoints.fn] = this.getint('fix', string, 1);
          checkPoints.fz[checkPoints.fn] = this.getint('fix', string, 2);
          checkPoints.fy[checkPoints.fn] = this.getint('fix', string, 3);
          array[this.nob].elec = true;
          if (this.getint('fix', string, 4) !== 0) {
            checkPoints.roted[checkPoints.fn] = true;
            array[this.nob].roted = true;
          } else {
            checkPoints.roted[checkPoints.fn] = false;
          }
          checkPoints.special[checkPoints.fn] = string.indexOf(')s') !== -1;
          ++checkPoints.fn;
          ++this.nob;
          this.notb = this.nob;
        }
        if (!checkPoints.notb && string.startsWith('pile')) {
          array[this.nob] = new ContO(this.getint('pile', string, 0), this.getint('pile', string, 1),
            this.getint('pile', string, 2), medium, trackers, this.getint('pile', string, 3),
            this.getint('pile', string, 4), medium.ground);
          ++this.nob;
        }
        if (xtGraphics.multion === 0 && string.startsWith('nlaps')) {
          checkPoints.nlaps = this.getint('nlaps', string, 0);
          if (checkPoints.nlaps < 1) checkPoints.nlaps = 1;
          if (checkPoints.nlaps > 15) checkPoints.nlaps = 15;
        }
        if (checkPoints.stage > 0 && string.startsWith('name')) {
          checkPoints.name = this.getstring('name', string, 0).replace(/\|/g, ',');
        }
        if (string.startsWith('soundtrack')) {
          checkPoints.trackname = this.getstring('soundtrack', string, 0);
          checkPoints.trackvol = this.getint('soundtrack', string, 1);
          if (checkPoints.trackvol < 50) checkPoints.trackvol = 50;
          if (checkPoints.trackvol > 300) checkPoints.trackvol = 300;
          xtGraphics.sndsize[32] = this.getint('soundtrack', string, 2);
        }
        // maxr / maxl / maxt / maxb: the four boundary walls. Each emits a run
        // of rail models plus one big tracker with dam == 167, which
        // devidetrackers() puts into the edge cells only.
        if (string.startsWith('maxr')) {
          const getint9 = this.getint('maxr', string, 0);
          const n2 = (getint = this.getint('maxr', string, 1));
          const getint10 = this.getint('maxr', string, 2);
          for (let k = 0; k < getint9; ++k) {
            array[this.nob] = new ContO(array2[85], n2, medium.ground - array2[85].grat, k * 4800 + getint10, 0);
            ++this.nob;
          }
          this.#wall(trackers, -5000, 7100, n2 + 500, 600,
            idiv(getint9 * 4800, 2) + getint10 - 2400, idiv(getint9 * 4800, 2), 90, 0);
        }
        if (string.startsWith('maxl')) {
          const getint11 = this.getint('maxl', string, 0);
          const n3 = (getint2 = this.getint('maxl', string, 1));
          const getint12 = this.getint('maxl', string, 2);
          for (let l = 0; l < getint11; ++l) {
            array[this.nob] = new ContO(array2[85], n3, medium.ground - array2[85].grat, l * 4800 + getint12, 180);
            ++this.nob;
          }
          this.#wall(trackers, -5000, 7100, n3 - 500, 600,
            idiv(getint11 * 4800, 2) + getint12 - 2400, idiv(getint11 * 4800, 2), -90, 0);
        }
        if (string.startsWith('maxt')) {
          const getint13 = this.getint('maxt', string, 0);
          const n4 = (getint3 = this.getint('maxt', string, 1));
          const getint14 = this.getint('maxt', string, 2);
          for (let n5 = 0; n5 < getint13; ++n5) {
            array[this.nob] = new ContO(array2[85], n5 * 4800 + getint14, medium.ground - array2[85].grat, n4, 90);
            ++this.nob;
          }
          this.#wallZ(trackers, -5000, 7100, n4 + 500, 600,
            idiv(getint13 * 4800, 2) + getint14 - 2400, idiv(getint13 * 4800, 2), 90, 0);
        }
        if (string.startsWith('maxb')) {
          const getint15 = this.getint('maxb', string, 0);
          const n6 = (getint4 = this.getint('maxb', string, 1));
          const getint16 = this.getint('maxb', string, 2);
          for (let n7 = 0; n7 < getint15; ++n7) {
            array[this.nob] = new ContO(array2[85], n7 * 4800 + getint16, medium.ground - array2[85].grat, n6, -90);
            ++this.nob;
          }
          this.#wallZ(trackers, -5000, 7100, n6 - 500, 600,
            idiv(getint15 * 4800, 2) + getint16 - 2400, idiv(getint15 * 4800, 2), -90, 0);
        }
      }
      medium.newpolys(getint2, getint - getint2, getint4, getint3 - getint4, trackers, this.notb);
      medium.newclouds(getint2, getint, getint4, getint3);
      medium.newmountains(getint2, getint, getint4, getint3);
      medium.newstars();
      trackers.devidetrackers(getint2, getint - getint2, getint4, getint3 - getint4);
    } catch (obj) {
      checkPoints.stage = -3;
      console.log('Error in stage ' + checkPoints.stage);
      console.log('' + obj);
      console.log('At line: ' + string);
    }
    if (checkPoints.nsp < 2) checkPoints.stage = -3;
    if (medium.nrw * medium.ncl >= 16000) checkPoints.stage = -3;
    if (checkPoints.stage !== -3) {
      checkPoints.top20 = Math.abs(checkPoints.top20);
      if (checkPoints.stage === 26) medium.lightn = 0;
      else medium.lightn = -1;
      medium.nochekflk = !(checkPoints.stage === 1 || checkPoints.stage === 11);
      for (let n8 = 0; n8 < xtGraphics.nplayers; ++n8) {
        this.u[n8].reset(checkPoints, xtGraphics.sc[n8]);
      }
      xtGraphics.resetstat(checkPoints.stage, checkPoints.trackvol);
      checkPoints.calprox();
      for (let n9 = 0; n9 < xtGraphics.nplayers; ++n9) {
        array[n9] = new ContO(array2[xtGraphics.sc[n9]], xtGraphics.xstart[n9],
          250 - array2[xtGraphics.sc[n9]].grat, xtGraphics.zstart[n9], 0);
        array3[n9].reseto(xtGraphics.sc[n9], array[n9], checkPoints);
      }
      record.reset(array);
    }
  }

  /** One boundary wall tracker, x-aligned (maxr / maxl). */
  #wall(t, y, rady, x, radx, z, radz, xy, zy) {
    t.y[t.nt] = y;
    t.rady[t.nt] = rady;
    t.x[t.nt] = x;
    t.radx[t.nt] = radx;
    t.z[t.nt] = z;
    t.radz[t.nt] = radz;
    t.xy[t.nt] = xy;
    t.zy[t.nt] = zy;
    t.dam[t.nt] = 167;
    t.decor[t.nt] = false;
    t.skd[t.nt] = 0;
    ++t.nt;
  }

  /** One boundary wall tracker, z-aligned (maxt / maxb). */
  #wallZ(t, y, rady, z, radz, x, radx, zy, xy) {
    t.y[t.nt] = y;
    t.rady[t.nt] = rady;
    t.z[t.nt] = z;
    t.radz[t.nt] = radz;
    t.x[t.nt] = x;
    t.radx[t.nt] = radx;
    t.zy[t.nt] = zy;
    t.xy[t.nt] = xy;
    t.dam[t.nt] = 167;
    t.decor[t.nt] = false;
    t.skd[t.nt] = 0;
    ++t.nt;
  }

  /**
   * THE RACE TICK — GameSparker.java:891-1030, fase == 0.
   *
   * ============================ ORDERING ============================
   * The depth sort below is the painter's algorithm. There is no depth
   * buffer: objects are drawn far-to-near and that is the ONLY thing
   * producing correct occlusion.
   *
   * medium.d() paints the backdrop first, then dist==0 objects, then the
   * sorted remainder. Do not reorder, do not batch, do not hoist. The
   * selection-sort below is O(n^2) and looks eminently "improvable" -- it
   * also produces a specific tie-breaking order that the original depends on.
   * Leave it exactly as it is.
   * ==================================================================
   */
  tick(rd, medium, trackers, checkPoints, xtGraphics, record, array2, array3) {
    this.draw(rd, medium, xtGraphics, array2, array3);
    this.simulate(rd, medium, trackers, checkPoints, xtGraphics, record, array2, array3);
  }

  /**
   * The DRAWING half of the race tick, split out so the render loop can
   * re-run it at display rate against interpolated transforms while physics
   * stays at the game's native 18.9Hz. Reads state and writes geometry; the
   * only state it mutates is ContO.dist (set by d(), consumed by next frame's
   * sort, exactly as in the Java).
   */
  draw(rd, medium, xtGraphics, array2, array3) {
    for (let n33 = 0; n33 < xtGraphics.nplayers; ++n33) {
      if (array3[n33].newcar) {
        const xz = array2[n33].xz;
        const xy = array2[n33].xy;
        const zy = array2[n33].zy;
        array2[n33] = new ContO(this.baseModels[array3[n33].cn], array2[n33].x, array2[n33].y, array2[n33].z, 0);
        array2[n33].xz = xz;
        array2[n33].xy = xy;
        array2[n33].zy = zy;
        array3[n33].newcar = false;
      }
    }
    medium.d(rd);
    let n34 = 0;
    const array16 = intArray(200);
    for (let n35 = 0; n35 < this.nob; ++n35) {
      if (array2[n35].dist !== 0) {
        array16[n34] = n35;
        ++n34;
      } else {
        array2[n35].d(rd);
      }
    }
    const array17 = intArray(n34);
    const array18 = intArray(n34);
    for (let n36 = 0; n36 < n34; ++n36) array17[n36] = 0;
    for (let n37 = 0; n37 < n34; ++n37) {
      for (let n38 = n37 + 1; n38 < n34; ++n38) {
        if (array2[array16[n37]].dist < array2[array16[n38]].dist) ++array17[n37];
        else ++array17[n38];
      }
      array18[array17[n37]] = n37;
    }
    for (let n41 = 0; n41 < n34; ++n41) {
      array2[array16[array18[n41]]].d(rd);
    }
  }

  /**
   * The SIMULATION half: collisions, driving, recording, checkpoints, AI, and
   * the camera. Never called more than once per TICK_MS, whatever the display
   * refresh rate -- every constant in Mad.drive() is per-tick.
   */
  simulate(rd, medium, trackers, checkPoints, xtGraphics, record, array2, array3) {
    if (xtGraphics.starcnt === 0) {
      for (let n42 = 0; n42 < xtGraphics.nplayers; ++n42) {
        for (let n43 = 0; n43 < xtGraphics.nplayers; ++n43) {
          if (n43 !== n42) {
            array3[n42].colide(array2[n42], array3[n43], array2[n43]);
          }
        }
      }
      for (let n44 = 0; n44 < xtGraphics.nplayers; ++n44) {
        array3[n44].drive(this.u[n44], array2[n44], trackers, checkPoints);
      }
      for (let n45 = 0; n45 < xtGraphics.nplayers; ++n45) {
        record.rec(array2[n45], n45, array3[n45].squash, array3[n45].lastcolido, array3[n45].cntdest, 0);
      }
      checkPoints.checkstat(array3, array2, record, xtGraphics.nplayers, xtGraphics.im, 0);
      for (let n46 = 1; n46 < xtGraphics.nplayers; ++n46) {
        this.u[n46].preform(array3[n46], array2[n46], checkPoints, trackers);
      }
    } else {
      if (xtGraphics.starcnt === 130) {
        medium.adv = 1900;
        medium.zy = 40;
        medium.vxz = 70;
        rd.setColor(255, 255, 255);
        rd.fillRect(0, 0, 800, 450);
      }
      if (xtGraphics.starcnt !== 0) --xtGraphics.starcnt;
    }
    if (xtGraphics.starcnt < 38) {
      if (this.view === 0) {
        medium.follow(array2[0], array3[0].cxz, this.u[0].lookback);
        xtGraphics.stat(array3[0], array2[0], checkPoints, this.u[0], true);
        if (array3[0].outshakedam > 0) {
          this.shaka = idiv(array3[0].outshakedam, 20);
          if (this.shaka > 25) this.shaka = 25;
        }
        this.mvect = 65 + idiv(Math.abs(this.lmxz - medium.xz), 5) * 100;
        if (this.mvect > 90) this.mvect = 90;
        this.lmxz = medium.xz;
      }
      if (this.view === 1) {
        medium.around(array2[0], false);
        xtGraphics.stat(array3[0], array2[0], checkPoints, this.u[0], false);
        this.mvect = 80;
      }
      if (this.view === 2) {
        medium.watch(array2[0], array3[0].mxz);
        xtGraphics.stat(array3[0], array2[0], checkPoints, this.u[0], false);
        this.mvect = 65 + idiv(Math.abs(this.lmxz - medium.xz), 5) * 100;
        if (this.mvect > 90) this.mvect = 90;
        this.lmxz = medium.xz;
      }
    } else {
      // The intro camera orbits car 3. The Java only ever gets here with 7
      // players or 1, so it hardcodes those two cases; `?players=2` and 3 are
      // this port's own settings and would index an empty grid slot.
      let n47 = 3;
      if (xtGraphics.nplayers === 1) n47 = 0;
      if (n47 >= xtGraphics.nplayers) n47 = xtGraphics.nplayers - 1;
      medium.around(array2[n47], true);
      this.mvect = 80;
      if (this.u[0].enter || this.u[0].handb) {
        xtGraphics.starcnt = 38;
        this.u[0].enter = false;
        this.u[0].handb = false;
      }
      if (xtGraphics.starcnt === 38) {
        medium.vert = false;
        medium.adv = 900;
        medium.vxz = 180;
        checkPoints.checkstat(array3, array2, record, xtGraphics.nplayers, xtGraphics.im, 0);
        medium.follow(array2[0], array3[0].cxz, 0);
        xtGraphics.stat(array3[0], array2[0], checkPoints, this.u[0], true);
        rd.setColor(255, 255, 255);
        rd.fillRect(0, 0, 800, 450);
      }
    }
    // GameSparker.java:1698-1705. Once per TICK -- it is the pump that
    // decrements every bfXXX debounce counter and switches the engine loops,
    // so at display rate the engine would chatter and every debounce would
    // clear ~3x too fast. Interpolated frames redraw, they do not simulate,
    // so being here in simulate() is exactly right.
    if (xtGraphics.im > -1 && xtGraphics.im < 8) {
      // TODO not ported: the multion==2/3 branch, which mirrors player 0's
      // mute flags onto the remote player's control before pumping.
      xtGraphics.playsounds(array3[xtGraphics.im], this.u[0], checkPoints.stage);
    }
  }

  /** Extract the nth comma-separated int from `key(a,b,c)`. */
  getint(s, s2, n) {
    let n2 = 0;
    let string = '';
    for (let i = s.length + 1; i < s2.length; ++i) {
      const string2 = '' + s2.charAt(i);
      if (string2 === ',' || string2 === ')') {
        ++n2;
        ++i;
      }
      if (n2 === n) string += s2.charAt(i);
    }
    return parseInt(string, 10);
  }

  /** Extract the nth comma-separated string from `key(a,b,c)`. */
  getstring(s, s2, n) {
    let n2 = 0;
    let string = '';
    for (let i = s.length + 1; i < s2.length; ++i) {
      const string2 = '' + s2.charAt(i);
      if (string2 === ',' || string2 === ')') {
        ++n2;
        ++i;
      }
      if (n2 === n) string += s2.charAt(i);
    }
    return string;
  }
}
