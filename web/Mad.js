// Transpiled from java-src/Mad.java, line by line.
//
// Local names are kept as procyon emitted them.
// Do not rename or restructure.
//
// Numeric conventions used throughout:
//   idiv(a, b)   every Java int / int
//   trunc(x)     every Java (int) cast of a float or double
//   fr(x)        every Java float-typed intermediate; m.sin/m.cos return float,
//                so any expression mixing them is float32 in Java and drifts without this.
//   i32(x)       int wrapping

import { idiv, trunc, fr, i32, intArray, floatArray, objArray, HSBtoRGB, setDrawPhase } from './java.js';

function int2(a, b) {
  const o = objArray(a);
  for (let i = 0; i < a; i++) o[i] = intArray(b);
  return o;
}

export class Mad {
  constructor(cd, m, rpd, xt, im) {
    this.cn = 0;
    this.im = 0;
    this.mxz = 0;
    this.cxz = 0;
    this.dominate = new Array(8).fill(false);
    this.caught = new Array(8).fill(false);
    this.pzy = 0;
    this.pxy = 0;
    this.speed = 0.0;
    this.forca = 0.0;
    this.scy = floatArray(4);
    this.scz = floatArray(4);
    this.scx = floatArray(4);
    this.drag = 0.5;
    this.mtouch = false;
    this.wtouch = false;
    this.cntouch = 0;
    this.capsized = false;
    this.wasTouchTrick = false;
    this.basePzy = 0;
    this.basePxy = 0;
    this.baseXz = 0;
    this.baseTouchX = 0;
    this.baseTouchY = 0;
    this.lastDeltaX = 0;
    this.lastDeltaY = 0;
    this.trickDisableUntilLift = false;
    this.txz = 0;
    this.fxz = 0;
    this.pmlt = 1;
    this.nmlt = 1;
    this.dcnt = 0;
    this.skid = 0;
    this.pushed = false;
    this.gtouch = false;
    this.pl = false;
    this.pr = false;
    this.pd = false;
    this.pu = false;
    this.loop = 0;
    this.ucomp = 0.0;
    this.dcomp = 0.0;
    this.lcomp = 0.0;
    this.rcomp = 0.0;
    this.lxz = 0;
    this.travxy = 0;
    this.travzy = 0;
    this.travxz = 0;
    this.trcnt = 0;
    this.capcnt = 0;
    this.srfcnt = 0;
    this.rtab = false;
    this.ftab = false;
    this.btab = false;
    this.surfer = false;
    this.powerup = 0.0;
    this.xtpower = 0;
    this.tilt = 0.0;
    this.crank = int2(4, 4);
    this.lcrank = int2(4, 4);
    this.squash = 0;
    this.nbsq = 0;
    this.hitmag = 0;
    this.cntdest = 0;
    this.dest = false;
    this.newcar = false;
    this.pan = 0;
    this.pcleared = 0;
    this.clear = 0;
    this.nlaps = 0;
    this.focus = -1;
    this.power = 75.0;
    this.missedcp = 0;
    this.lastcolido = 0;
    this.point = 0;
    this.nofocus = false;
    this.rpdcatch = 0;
    this.newedcar = 0;
    this.fixes = -1;
    this.shakedam = 0;
    this.outshakedam = 0;
    this.colidim = false;
    this.cd = cd;
    this.m = m;
    this.rpd = rpd;
    this.xt = xt;
    this.im = im;
  }

  reseto(cn, contO, checkPoints) {
    this.cn = cn;
    for (let i = 0; i < 8; ++i) {
      this.dominate[i] = false;
      this.caught[i] = false;
    }
    this.mxz = 0;
    this.cxz = 0;
    this.pzy = 0;
    this.pxy = 0;
    this.speed = 0.0;
    for (let j = 0; j < 4; ++j) {
      this.scy[j] = 0.0;
      this.scx[j] = 0.0;
      this.scz[j] = 0.0;
    }
    this.forca = fr(fr((fr(Math.sqrt(contO.keyz[0] * contO.keyz[0] + contO.keyx[0] * contO.keyx[0])) + fr(Math.sqrt(contO.keyz[1] * contO.keyz[1] + contO.keyx[1] * contO.keyx[1])) + fr(Math.sqrt(contO.keyz[2] * contO.keyz[2] + contO.keyx[2] * contO.keyx[2])) + fr(Math.sqrt(contO.keyz[3] * contO.keyz[3] + contO.keyx[3] * contO.keyx[3]))) / 10000.0) * fr(this.cd.bounce[this.cn] - 0.3));
    this.mtouch = false;
    this.wtouch = false;
    this.txz = 0;
    this.fxz = 0;
    this.pmlt = 1;
    this.nmlt = 1;
    this.dcnt = 0;
    this.skid = 0;
    this.pushed = false;
    this.gtouch = false;
    this.pl = false;
    this.pr = false;
    this.pd = false;
    this.pu = false;
    this.loop = 0;
    this.ucomp = 0.0;
    this.dcomp = 0.0;
    this.lcomp = 0.0;
    this.rcomp = 0.0;
    this.lxz = 0;
    this.travxy = 0;
    this.travzy = 0;
    this.travxz = 0;
    this.rtab = false;
    this.ftab = false;
    this.btab = false;
    this.powerup = 0.0;
    this.xtpower = 0;
    this.trcnt = 0;
    this.capcnt = 0;
    this.tilt = 0.0;
    for (let k = 0; k < 4; ++k) {
      for (let l = 0; l < 4; ++l) {
        this.crank[k][l] = 0;
        this.lcrank[k][l] = 0;
      }
    }
    this.pan = 0;
    this.pcleared = checkPoints.pcs;
    this.clear = 0;
    this.nlaps = 0;
    this.focus = -1;
    this.missedcp = 0;
    this.nofocus = false;
    this.power = 98.0;
    this.lastcolido = 0;
    checkPoints.dested[this.im] = 0;
    this.squash = 0;
    this.nbsq = 0;
    this.hitmag = 0;
    this.cntdest = 0;
    this.dest = false;
    this.newcar = false;
    if (this.im === this.xt.im) {
      this.m.checkpoint = -1;
      this.m.lastcheck = false;
    }
    this.rpdcatch = 0;
    this.newedcar = 0;
    this.fixes = -1;
    if (checkPoints.nfix === 1) {
      this.fixes = 4;
    }
    if (checkPoints.nfix === 2) {
      this.fixes = 3;
    }
    if (checkPoints.nfix === 3) {
      this.fixes = 2;
    }
    if (checkPoints.nfix === 4) {
      this.fixes = 1;
    }
  }

  drive(control, contO, trackers, checkPoints) {
    let n = 1;
    let n2 = 1;
    let zyinv = false;
    let b = false;
    let b2 = false;
    this.capsized = false;
    let i;
    for (i = Math.abs(this.pzy); i > 270; i -= 360) {}
    if (Math.abs(i) > 90) {
      zyinv = true;
    }
    let n3 = 0;
    let j;
    for (j = Math.abs(this.pxy); j > 270; j -= 360) {}
    if (Math.abs(j) > 90) {
      n3 = 1;
      n2 = -1;
    }
    let grat = contO.grat;
    if (zyinv) {
      if (n3 !== 0) {
        n3 = 0;
        b = true;
      } else {
        n3 = 1;
        this.capsized = true;
      }
      n = -1;
    } else if (n3 !== 0) {
      this.capsized = true;
    }
    if (this.capsized) {
      grat = i32(this.cd.flipy[this.cn] + this.squash);
    }
    control.zyinv = zyinv;
    let n4 = 0.0;
    let n5 = 0.0;
    let n6 = 0.0;
    if (this.mtouch) {
      this.loop = 0;
    }
    if (this.wtouch) {
      if (this.loop === 2 || this.loop === -1) {
        this.loop = -1;
        if (control.left) {
          this.pl = true;
        }
        if (control.right) {
          this.pr = true;
        }
        if (control.up) {
          this.pu = true;
        }
        if (control.down) {
          this.pd = true;
        }
      }
      this.ucomp = 0.0;
      this.dcomp = 0.0;
      this.lcomp = 0.0;
      this.rcomp = 0.0;
    }
    if (control.handb) {
      if (!this.pushed) {
        if (!this.wtouch) {
          if (this.loop === 0) {
            this.loop = 1;
          }
        } else if (this.gtouch) {
          this.pushed = true;
        }
      }
    } else {
      this.pushed = false;
    }
    if (this.loop === 1) {
      const n7 = fr(fr(fr(fr(this.scy[0] + this.scy[1]) + this.scy[2]) + this.scy[3]) / 4.0);
      for (let k = 0; k < 4; ++k) {
        this.scy[k] = n7;
      }
      this.loop = 2;
    }
    if (!this.dest) {
      if (this.loop === 2) {
        if (control.up) {
          if (this.ucomp === 0.0) {
            this.ucomp = fr(10.0 + fr(fr(this.scy[0] + 50.0) / 20.0));
            if (this.ucomp < 5.0) {
              this.ucomp = 5.0;
            }
            if (this.ucomp > 10.0) {
              this.ucomp = 10.0;
            }
            this.ucomp = fr(this.ucomp * this.cd.airs[this.cn]);
          }
          if (this.ucomp < 20.0) {
            this.ucomp = fr(this.ucomp + fr(0.5 * this.cd.airs[this.cn]));
          }
          n4 = fr(fr(-this.cd.airc[this.cn] * this.m.sin(contO.xz)) * n2);
          n5 = fr(fr(this.cd.airc[this.cn] * this.m.cos(contO.xz)) * n2);
        } else if (this.ucomp !== 0.0 && this.ucomp > -2.0) {
          this.ucomp = fr(this.ucomp - fr(0.5 * this.cd.airs[this.cn]));
        }
        if (control.down) {
          if (this.dcomp === 0.0) {
            this.dcomp = fr(10.0 + fr(fr(this.scy[0] + 50.0) / 20.0));
            if (this.dcomp < 5.0) {
              this.dcomp = 5.0;
            }
            if (this.dcomp > 10.0) {
              this.dcomp = 10.0;
            }
            this.dcomp = fr(this.dcomp * this.cd.airs[this.cn]);
          }
          if (this.dcomp < 20.0) {
            this.dcomp = fr(this.dcomp + fr(0.5 * this.cd.airs[this.cn]));
          }
          n6 = fr(-this.cd.airc[this.cn]);
        } else if (this.dcomp !== 0.0 && this.ucomp > -2.0) {
          this.dcomp = fr(this.dcomp - fr(0.5 * this.cd.airs[this.cn]));
        }
        if (control.left) {
          if (this.lcomp === 0.0) {
            this.lcomp = 5.0;
          }
          if (this.lcomp < 20.0) {
            this.lcomp = fr(this.lcomp + fr(2.0 * this.cd.airs[this.cn]));
          }
          n4 = fr(fr(-this.cd.airc[this.cn] * this.m.cos(contO.xz)) * n);
          n5 = fr(fr(-this.cd.airc[this.cn] * this.m.sin(contO.xz)) * n);
        } else if (this.lcomp > 0.0) {
          this.lcomp = fr(this.lcomp - fr(2.0 * this.cd.airs[this.cn]));
        }
        if (control.right) {
          if (this.rcomp === 0.0) {
            this.rcomp = 5.0;
          }
          if (this.rcomp < 20.0) {
            this.rcomp = fr(this.rcomp + fr(2.0 * this.cd.airs[this.cn]));
          }
          n4 = fr(fr(this.cd.airc[this.cn] * this.m.cos(contO.xz)) * n);
          n5 = fr(fr(this.cd.airc[this.cn] * this.m.sin(contO.xz)) * n);
        } else if (this.rcomp > 0.0) {
          this.rcomp = fr(this.rcomp - fr(2.0 * this.cd.airs[this.cn]));
        }
        // §2 Compound assignments
        this.pzy = trunc(fr(this.pzy + fr(fr(this.dcomp - this.ucomp) * this.m.cos(this.pxy))));
        if (zyinv) {
          contO.xz = trunc(fr(contO.xz + fr(fr(this.dcomp - this.ucomp) * this.m.sin(this.pxy))));
        } else {
          contO.xz = trunc(fr(contO.xz - fr(fr(this.dcomp - this.ucomp) * this.m.sin(this.pxy))));
        }
        this.pxy = trunc(fr(this.pxy + fr(this.rcomp - this.lcomp)));
      } else {
        let power = this.power;
        if (power < 40.0) {
          power = 40.0;
        }
        if (control.down) {
          if (this.speed > 0.0) {
            this.speed = fr(this.speed - fr(this.cd.handb[this.cn] / 2.0));
          } else {
            let n8 = 0;
            for (let l = 0; l < 2; ++l) {
              if (this.speed <= fr(-fr(this.cd.swits[this.cn][l] / 2.0 + fr(power * this.cd.swits[this.cn][l] / 196.0)))) {
                ++n8;
              }
            }
            if (n8 !== 2) {
              this.speed = fr(this.speed - fr(fr(this.cd.acelf[this.cn][n8] / 2.0) + fr(power * this.cd.acelf[this.cn][n8] / 196.0)));
            } else {
              this.speed = fr(-fr(this.cd.swits[this.cn][1] / 2.0 + fr(power * this.cd.swits[this.cn][1] / 196.0)));
            }
          }
        }
        if (control.up) {
          if (this.speed < 0.0) {
            this.speed = fr(this.speed + this.cd.handb[this.cn]);
          } else {
            let n9 = 0;
            for (let n10 = 0; n10 < 3; ++n10) {
              if (this.speed >= fr(this.cd.swits[this.cn][n10] / 2.0 + fr(power * this.cd.swits[this.cn][n10] / 196.0))) {
                ++n9;
              }
            }
            if (n9 !== 3) {
              this.speed = fr(this.speed + fr(fr(this.cd.acelf[this.cn][n9] / 2.0) + fr(power * this.cd.acelf[this.cn][n9] / 196.0)));
            } else {
              this.speed = fr(this.cd.swits[this.cn][2] / 2.0 + fr(power * this.cd.swits[this.cn][2] / 196.0));
            }
          }
        }
        if (control.handb && Math.abs(this.speed) > this.cd.handb[this.cn]) {
          if (this.speed < 0.0) {
            this.speed = fr(this.speed + this.cd.handb[this.cn]);
          } else {
            this.speed = fr(this.speed - this.cd.handb[this.cn]);
          }
        }
        if (this.loop === -1 && contO.y < 100) {
          if (control.left) {
            if (!this.pl) {
              if (this.lcomp === 0.0) {
                this.lcomp = fr(5.0 * this.cd.airs[this.cn]);
              }
              if (this.lcomp < 20.0) {
                this.lcomp = fr(this.lcomp + fr(2.0 * this.cd.airs[this.cn]));
              }
            }
          } else {
            if (this.lcomp > 0.0) {
              this.lcomp = fr(this.lcomp - fr(2.0 * this.cd.airs[this.cn]));
            }
            this.pl = false;
          }
          if (control.right) {
            if (!this.pr) {
              if (this.rcomp === 0.0) {
                this.rcomp = fr(5.0 * this.cd.airs[this.cn]);
              }
              if (this.rcomp < 20.0) {
                this.rcomp = fr(this.rcomp + fr(2.0 * this.cd.airs[this.cn]));
              }
            }
          } else {
            if (this.rcomp > 0.0) {
              this.rcomp = fr(this.rcomp - fr(2.0 * this.cd.airs[this.cn]));
            }
            this.pr = false;
          }
          if (control.up) {
            if (!this.pu) {
              if (this.ucomp === 0.0) {
                this.ucomp = fr(5.0 * this.cd.airs[this.cn]);
              }
              if (this.ucomp < 20.0) {
                this.ucomp = fr(this.ucomp + fr(2.0 * this.cd.airs[this.cn]));
              }
            }
          } else {
            if (this.ucomp > 0.0) {
              this.ucomp = fr(this.ucomp - fr(2.0 * this.cd.airs[this.cn]));
            }
            this.pu = false;
          }
          if (control.down) {
            if (!this.pd) {
              if (this.dcomp === 0.0) {
                this.dcomp = fr(5.0 * this.cd.airs[this.cn]);
              }
              if (this.dcomp < 20.0) {
                this.dcomp = fr(this.dcomp + fr(2.0 * this.cd.airs[this.cn]));
              }
            }
          } else {
            if (this.dcomp > 0.0) {
              this.dcomp = fr(this.dcomp - fr(2.0 * this.cd.airs[this.cn]));
            }
            this.pd = false;
          }
          // §2 Compound assignments
          this.pzy = trunc(fr(this.pzy + fr(fr(this.dcomp - this.ucomp) * this.m.cos(this.pxy))));
          if (zyinv) {
            contO.xz = trunc(fr(contO.xz + fr(fr(this.dcomp - this.ucomp) * this.m.sin(this.pxy))));
          } else {
            contO.xz = trunc(fr(contO.xz - fr(fr(this.dcomp - this.ucomp) * this.m.sin(this.pxy))));
          }
          this.pxy = trunc(fr(this.pxy + fr(this.rcomp - this.lcomp)));
        }
      }
      
      if (control.touchTrick && !this.trickDisableUntilLift) {
        if (!this.wasTouchTrick) {
          this.basePzy = this.pzy;
          this.basePxy = this.pxy;
          this.baseXz  = contO.xz;
          this.baseTouchX = control.touchTrickX;
          this.baseTouchY = control.touchTrickY;
          this.lastDeltaX = 0;
          this.lastDeltaY = 0;
          this.wasTouchTrick = true;
        }
        
        let deltaY = (control.touchTrickY - this.baseTouchY) * 0.8;
        let deltaX = (control.touchTrickX - this.baseTouchX) * 0.8;
        
        // Lock roll to primary axis only
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          deltaY = 0;
        } else {
          deltaX = 0;
        }
        
        let frameDeltaY = deltaY - this.lastDeltaY;
        let frameDeltaX = deltaX - this.lastDeltaX;
        this.lastDeltaY = deltaY;
        this.lastDeltaX = deltaX;
        
        this.pxy = trunc(this.basePxy - deltaX);
        this.pzy = trunc(this.basePzy + deltaY * this.m.cos(this.pxy));
        
        if (zyinv) {
          contO.xz = trunc(this.baseXz + deltaY * this.m.sin(this.pxy));
        } else {
          contO.xz = trunc(this.baseXz - deltaY * this.m.sin(this.pxy));
        }
        
        // Update trick accumulators directly
        this.travxy = trunc(this.travxy - frameDeltaX);
        this.travzy = trunc(this.travzy - frameDeltaY);
        
        // Force trick loop state so it awards points
        this.loop = 2;
        
        // Zero out momentum so it freezes on release
        this.lcomp = 0.0;
        this.rcomp = 0.0;
        this.ucomp = 0.0;
        this.dcomp = 0.0;
      } else {
        this.wasTouchTrick = false;
        if (!control.touchTrick) {
          this.trickDisableUntilLift = false;
        }
      }
    } else {
      this.wasTouchTrick = false;
      if (control.touchTrick) {
        this.trickDisableUntilLift = true;
      } else {
        this.trickDisableUntilLift = false;
      }
    }
    let n11 = fr(fr(20.0 * this.speed) / fr(154.0 * this.cd.simag[this.cn]));
    if (n11 > 20.0) {
      n11 = 20.0;
    }
    contO.wzy = trunc(fr(contO.wzy - n11));
    if (contO.wzy < -30) {
      contO.wzy += 30;
    }
    if (contO.wzy > 30) {
      contO.wzy -= 30;
    }
    if (control.steer !== 0.0) {
      contO.wxz = trunc(-36.0 * control.steer);
    } else {
      if (control.right) {
        contO.wxz -= this.cd.turn[this.cn];
        if (contO.wxz < -36) {
          contO.wxz = -36;
        }
      }
      if (control.left) {
        contO.wxz += this.cd.turn[this.cn];
        if (contO.wxz > 36) {
          contO.wxz = 36;
        }
      }
      if (contO.wxz !== 0 && !control.left && !control.right) {
        if (Math.abs(this.speed) < 10.0) {
          if (Math.abs(contO.wxz) === 1) {
            contO.wxz = 0;
          }
          if (contO.wxz > 0) {
            --contO.wxz;
          }
          if (contO.wxz < 0) {
            ++contO.wxz;
          }
        } else {
          if (Math.abs(contO.wxz) < this.cd.turn[this.cn] * 2) {
            contO.wxz = 0;
          }
          if (contO.wxz > 0) {
            contO.wxz -= this.cd.turn[this.cn] * 2;
          }
          if (contO.wxz < 0) {
            contO.wxz += this.cd.turn[this.cn] * 2;
          }
        }
      }
    }
    let n12 = trunc(3600.0 / (this.speed * this.speed));
    if (n12 < 5) {
      n12 = 5;
    }
    if (this.speed < 0.0) {
      n12 = -n12;
    }
    if (this.wtouch) {
      if (!this.capsized) {
        if (!control.handb) {
          this.fxz = idiv(contO.wxz, n12 * 3);
        } else {
          this.fxz = idiv(contO.wxz, n12);
        }
        contO.xz += idiv(contO.wxz, n12);
      }
      this.wtouch = false;
      this.gtouch = false;
    } else {
      contO.xz += this.fxz;
    }
    if (this.speed > 30.0 || this.speed < -100.0) {
      while (Math.abs(this.mxz - this.cxz) > 180) {
        if (this.cxz > this.mxz) {
          this.cxz -= 360;
        } else {
          if (this.cxz >= this.mxz) {
            continue;
          }
          this.cxz += 360;
        }
      }
      if (Math.abs(this.mxz - this.cxz) < 30) {
        this.cxz = trunc(fr(this.cxz + fr(fr(this.mxz - this.cxz) / 4.0)));
      } else {
        if (this.cxz > this.mxz) {
          this.cxz -= 10;
        }
        if (this.cxz < this.mxz) {
          this.cxz += 10;
        }
      }
    }
    const array = floatArray(4);
    const array2 = floatArray(4);
    const array3 = floatArray(4);
    for (let n13 = 0; n13 < 4; ++n13) {
      array[n13] = fr(contO.keyx[n13] + contO.x);
      array3[n13] = fr(grat + contO.y);
      array2[n13] = fr(contO.z + contO.keyz[n13]);
      this.scy[n13] = fr(this.scy[n13] + 7.0);
    }
    this.rot(array, array3, contO.x, contO.y, this.pxy, 4);
    this.rot(array3, array2, contO.y, contO.z, this.pzy, 4);
    this.rot(array, array2, contO.x, contO.z, contO.xz, 4);
    let b3 = false;
    const n15 = trunc(fr(fr(fr(this.scx[0] + this.scx[1]) + this.scx[2]) + this.scx[3]) / 4.0);
    const n16 = trunc(fr(fr(fr(this.scz[0] + this.scz[1]) + this.scz[2]) + this.scz[3]) / 4.0);
    for (let n17 = 0; n17 < 4; ++n17) {
      if (this.scx[n17] - n15 > 200.0) {
        this.scx[n17] = 200 + n15;
      }
      if (this.scx[n17] - n15 < -200.0) {
        this.scx[n17] = n15 - 200;
      }
      if (this.scz[n17] - n16 > 200.0) {
        this.scz[n17] = 200 + n16;
      }
      if (this.scz[n17] - n16 < -200.0) {
        this.scz[n17] = n16 - 200;
      }
    }
    for (let n18 = 0; n18 < 4; ++n18) {
      array3[n18] = fr(array3[n18] + this.scy[n18]);
      array[n18] = fr(array[n18] + fr(fr(fr(this.scx[0] + this.scx[1]) + this.scx[2]) + this.scx[3]) / 4.0);
      array2[n18] = fr(array2[n18] + fr(fr(fr(this.scz[0] + this.scz[1]) + this.scz[2]) + this.scz[3]) / 4.0);
    }
    let ncx = idiv(contO.x - trackers.sx, 3000);
    if (ncx > trackers.ncx) {
      ncx = trackers.ncx;
    }
    if (ncx < 0) {
      ncx = 0;
    }
    let ncz = idiv(contO.z - trackers.sz, 3000);
    if (ncz > trackers.ncz) {
      ncz = trackers.ncz;
    }
    if (ncz < 0) {
      ncz = 0;
    }
    let n22 = 1;
    for (let n23 = 0; n23 < trackers.sect[ncx][ncz].length; ++n23) {
      const n24 = trackers.sect[ncx][ncz][n23];
      if (Math.abs(trackers.zy[n24]) !== 90 && Math.abs(trackers.xy[n24]) !== 90 && Math.abs(contO.x - trackers.x[n24]) < trackers.radx[n24] && Math.abs(contO.z - trackers.z[n24]) < trackers.radz[n24] && (!trackers.decor[n24] || this.m.resdown !== 2 || this.xt.multion !== 0)) {
        n22 = trackers.skd[n24];
      }
    }
    if (this.mtouch) {
      let n25 = fr(this.cd.grip[this.cn] - fr(fr(Math.abs(this.txz - contO.xz) * this.speed) / 250.0));
      if (control.handb) {
        n25 = fr(n25 - fr(Math.abs(this.txz - contO.xz) * 4.0));
      }
      if (n25 < this.cd.grip[this.cn]) {
        if (this.skid !== 2) {
          this.skid = 1;
        }
        this.speed = fr(this.speed - fr(this.speed / 100.0));
      } else if (this.skid === 1) {
        this.skid = 2;
      }
      if (n22 === 1) {
        n25 = fr(n25 * 0.75);
      }
      if (n22 === 2) {
        n25 = fr(n25 * 0.55);
      }
      let n26 = trunc(fr(-this.speed * fr(this.m.sin(contO.xz) * this.m.cos(this.pzy))));
      let n27 = trunc(fr(this.speed * fr(this.m.cos(contO.xz) * this.m.cos(this.pzy))));
      let n28 = trunc(fr(-this.speed * this.m.sin(this.pzy)));
      if (this.capsized || this.dest || checkPoints.haltall) {
        n26 = 0;
        n27 = 0;
        n28 = 0;
        n25 = fr(this.cd.grip[this.cn] / 5.0);
        if (this.speed > 0.0) {
          this.speed = fr(this.speed - 2.0);
        } else {
          this.speed = fr(this.speed + 2.0);
        }
      }
      if (Math.abs(this.speed) > this.drag) {
        if (this.speed > 0.0) {
          this.speed = fr(this.speed - this.drag);
        } else {
          this.speed = fr(this.speed + this.drag);
        }
      } else {
        this.speed = 0.0;
      }
      if (this.cn === 8 && n25 < 5.0) {
        n25 = 5.0;
      }
      if (n25 < 1.0) {
        n25 = 1.0;
      }
      let n29 = 0.0;
      let n30 = 0.0;
      for (let n31 = 0; n31 < 4; ++n31) {
        if (Math.abs(this.scx[n31] - n26) > n25) {
          if (this.scx[n31] < n26) {
            this.scx[n31] = fr(this.scx[n31] + n25);
          } else {
            this.scx[n31] = fr(this.scx[n31] - n25);
          }
        } else {
          this.scx[n31] = n26;
        }
        if (Math.abs(this.scz[n31] - n27) > n25) {
          if (this.scz[n31] < n27) {
            this.scz[n31] = fr(this.scz[n31] + n25);
          } else {
            this.scz[n31] = fr(this.scz[n31] - n25);
          }
        } else {
          this.scz[n31] = n27;
        }
        if (Math.abs(this.scy[n31] - n28) > n25) {
          if (this.scy[n31] < n28) {
            this.scy[n31] = fr(this.scy[n31] + n25);
          } else {
            this.scy[n31] = fr(this.scy[n31] - n25);
          }
        } else {
          this.scy[n31] = n28;
        }
        if (n25 < this.cd.grip[this.cn]) {
          if (this.txz !== contO.xz) {
            ++this.dcnt;
          } else if (this.dcnt !== 0) {
            this.dcnt = 0;
          }
          if (this.dcnt > fr(40.0 * n25) / this.cd.grip[this.cn] || this.capsized) {
            let n38 = 1.0;
            if (n22 !== 0) {
              n38 = 1.2;
            }
            if (this.m.random() > 0.65) {
              contO.dust(n31, array[n31], array3[n31], array2[n31], trunc(this.scx[n31]), trunc(this.scz[n31]), fr(n38 * this.cd.simag[this.cn]), trunc(this.tilt), this.capsized && this.mtouch);
              if (this.im === this.xt.im && !this.capsized) {
                this.xt.skid(n22, fr(Math.sqrt(this.scx[n31] * this.scx[n31] + this.scz[n31] * this.scz[n31])));
              }
            }
          } else {
            if (n22 === 1 && this.m.random() > 0.8) {
              contO.dust(n31, array[n31], array3[n31], array2[n31], trunc(this.scx[n31]), trunc(this.scz[n31]), fr(1.1 * this.cd.simag[this.cn]), trunc(this.tilt), this.capsized && this.mtouch);
            }
            if ((n22 === 2 || n22 === 3) && this.m.random() > 0.6) {
              contO.dust(n31, array[n31], array3[n31], array2[n31], trunc(this.scx[n31]), trunc(this.scz[n31]), fr(1.15 * this.cd.simag[this.cn]), trunc(this.tilt), this.capsized && this.mtouch);
            }
          }
        } else if (this.dcnt !== 0) {
          this.dcnt -= 2;
          if (this.dcnt < 0) {
            this.dcnt = 0;
          }
        }
        if (n22 === 3) {
          this.scy[trunc(this.m.random() * 4.0)] = fr(-100.0 * fr(fr(this.m.random() * fr(this.speed / this.cd.swits[this.cn][2])) * fr(this.cd.bounce[this.cn] - 0.3)));
        }
        if (n22 === 4) {
          this.scy[trunc(this.m.random() * 4.0)] = fr(-150.0 * fr(fr(this.m.random() * fr(this.speed / this.cd.swits[this.cn][2])) * fr(this.cd.bounce[this.cn] - 0.3)));
        }
        n29 = fr(n29 + this.scx[n31]);
        n30 = fr(n30 + this.scz[n31]);
      }
      this.txz = contO.xz;
      let n39;
      if (n29 > 0.0) {
        n39 = -1;
      } else {
        n39 = 1;
      }
      this.mxz = trunc(fr(fr(Math.acos(n30 / Math.sqrt(n29 * n29 + n30 * n30)) / 0.017453292519943295) * n39));
      if (this.skid === 2) {
        if (!this.capsized) {
          n29 = fr(n29 / 4.0);
          n30 = fr(n30 / 4.0);
          if (b) {
            this.speed = fr(-fr(fr(Math.sqrt(n29 * n29 + n30 * n30)) * this.m.cos(this.mxz - contO.xz)));
          } else {
            this.speed = fr(fr(Math.sqrt(n29 * n29 + n30 * n30)) * this.m.cos(this.mxz - contO.xz));
          }
        }
        this.skid = 0;
      }
      if (this.capsized && n29 === 0.0 && n30 === 0.0) {
        n22 = 0;
      }
      this.mtouch = false;
      b3 = true;
    } else if (this.skid !== 2) {
      this.skid = 2;
    }
    let n40 = 0;
    const array7 = new Array(4).fill(false);
    const array8 = new Array(4).fill(false);
    const array9 = new Array(4).fill(false);
    let n41 = 0.0;
    for (let n42 = 0; n42 < 4; ++n42) {
      array9[n42] = (array8[n42] = false);
      if (array3[n42] > 245.0) {
        ++n40;
        this.wtouch = true;
        this.gtouch = true;
        if (!b3 && this.scy[n42] !== 7.0) {
          let n43 = fr(this.scy[n42] / 333.33);
          if (n43 > 0.3) {
            n43 = 0.3;
          }
          let n44;
          if (n22 === 0) {
            n44 = fr(n43 + 1.1);
          } else {
            n44 = fr(n43 + 1.2);
          }
          contO.dust(n42, array[n42], array3[n42], array2[n42], trunc(this.scx[n42]), trunc(this.scz[n42]), fr(n44 * this.cd.simag[this.cn]), 0, this.capsized && this.mtouch);
        }
        array3[n42] = 250.0;
        array9[n42] = true;
        n41 = fr(n41 + fr(array3[n42] - 250.0));
        let n45 = fr(fr(Math.abs(this.m.sin(this.pxy)) + Math.abs(this.m.sin(this.pzy))) / 3.0);
        if (n45 > 0.4) {
          n45 = 0.4;
        }
        let n46 = fr(n45 + this.cd.bounce[this.cn]);
        if (n46 < 1.1) {
          n46 = 1.1;
        }
        this.regy(n42, Math.abs(fr(this.scy[n42] * n46)), contO);
        if (this.scy[n42] > 0.0) {
          this.scy[n42] = fr(this.scy[n42] - Math.abs(fr(this.scy[n42] * n46)));
        }
        if (this.capsized) {
          array8[n42] = true;
        }
      }
      array7[n42] = false;
    }
    if (n40 !== 0) {
      const n48 = fr(n41 / n40);
      for (let n49 = 0; n49 < 4; ++n49) {
        if (!array9[n49]) {
          array3[n49] = fr(array3[n49] - n48);
        }
      }
    }
    let n51 = 0;
    for (let n52 = 0; n52 < trackers.sect[ncx][ncz].length; ++n52) {
      const n53 = trackers.sect[ncx][ncz][n52];
      let n54 = 0;
      let n55 = 0;
      for (let n56 = 0; n56 < 4; ++n56) {
        if (array8[n56] && (trackers.skd[n53] === 0 || trackers.skd[n53] === 1) && array[n56] > trackers.x[n53] - trackers.radx[n53] && array[n56] < trackers.x[n53] + trackers.radx[n53] && array2[n56] > trackers.z[n53] - trackers.radz[n53] && array2[n56] < trackers.z[n53] + trackers.radz[n53]) {
          contO.sprk(array[n56], array3[n56], array2[n56], this.scx[n56], this.scy[n56], this.scz[n56], 1);
          if (this.im === this.xt.im) {
            this.xt.gscrape(trunc(this.scx[n56]), trunc(this.scy[n56]), trunc(this.scz[n56]));
          }
        }
        if (!array7[n56] && array[n56] > trackers.x[n53] - trackers.radx[n53] && array[n56] < trackers.x[n53] + trackers.radx[n53] && array2[n56] > trackers.z[n53] - trackers.radz[n53] && array2[n56] < trackers.z[n53] + trackers.radz[n53] && array3[n56] > trackers.y[n53] - trackers.rady[n53] && array3[n56] < trackers.y[n53] + trackers.rady[n53] && (!trackers.decor[n53] || this.m.resdown !== 2 || this.xt.multion !== 0)) {
          if (trackers.xy[n53] === 0 && trackers.zy[n53] === 0 && trackers.y[n53] !== 250 && array3[n56] > trackers.y[n53] - 5) {
            ++n55;
            this.wtouch = true;
            this.gtouch = true;
            if (!b3 && this.scy[n56] !== 7.0) {
              let n57 = fr(this.scy[n56] / 333.33);
              if (n57 > 0.3) {
                n57 = 0.3;
              }
              let n58;
              if (n22 === 0) {
                n58 = fr(n57 + 1.1);
              } else {
                n58 = fr(n57 + 1.2);
              }
              contO.dust(n56, array[n56], array3[n56], array2[n56], trunc(this.scx[n56]), trunc(this.scz[n56]), fr(n58 * this.cd.simag[this.cn]), 0, this.capsized && this.mtouch);
            }
            array3[n56] = trackers.y[n53];
            if (this.capsized && (trackers.skd[n53] === 0 || trackers.skd[n53] === 1)) {
              contO.sprk(array[n56], array3[n56], array2[n56], this.scx[n56], this.scy[n56], this.scz[n56], 1);
              if (this.im === this.xt.im) {
                this.xt.gscrape(trunc(this.scx[n56]), trunc(this.scy[n56]), trunc(this.scz[n56]));
              }
            }
            let n59 = fr(fr(Math.abs(this.m.sin(this.pxy)) + Math.abs(this.m.sin(this.pzy))) / 3.0);
            if (n59 > 0.4) {
              n59 = 0.4;
            }
            let n60 = fr(n59 + this.cd.bounce[this.cn]);
            if (n60 < 1.1) {
              n60 = 1.1;
            }
            this.regy(n56, Math.abs(fr(this.scy[n56] * n60)), contO);
            if (this.scy[n56] > 0.0) {
              this.scy[n56] = fr(this.scy[n56] - Math.abs(fr(this.scy[n56] * n60)));
            }
            array7[n56] = true;
          }
          if (trackers.zy[n53] === -90 && array2[n56] < trackers.z[n53] + trackers.radz[n53] && (this.scz[n56] < 0.0 || trackers.radz[n53] === 287)) {
            for (let n62 = 0; n62 < 4; ++n62) {
              if (n56 !== n62 && array2[n62] >= trackers.z[n53] + trackers.radz[n53]) {
                array2[n62] = fr(array2[n62] - fr(array2[n56] - (trackers.z[n53] + trackers.radz[n53])));
              }
            }
            array2[n56] = trackers.z[n53] + trackers.radz[n53];
            if (trackers.skd[n53] !== 2) {
              ++this.crank[0][n56];
            }
            if (trackers.skd[n53] === 5 && this.m.random() > this.m.random()) {
              ++this.crank[0][n56];
            }
            if (this.crank[0][n56] > 1) {
              contO.sprk(array[n56], array3[n56], array2[n56], this.scx[n56], this.scy[n56], this.scz[n56], 0);
              if (this.im === this.xt.im) {
                this.xt.scrape(trunc(this.scx[n56]), trunc(this.scy[n56]), trunc(this.scz[n56]));
              }
            }
            let n66 = fr(fr(Math.abs(this.m.cos(this.pxy)) + Math.abs(this.m.cos(this.pzy))) / 4.0);
            if (n66 > 0.3) {
              n66 = 0.3;
            }
            if (b3) {
              n66 = 0.0;
            }
            let n67 = fr(n66 + fr(this.cd.bounce[this.cn] - 0.2));
            if (n67 < 1.1) {
              n67 = 1.1;
            }
            this.regz(n56, Math.abs(fr(fr(this.scz[n56] * n67) * trackers.dam[n53])), contO);
            this.scz[n56] = fr(this.scz[n56] + Math.abs(fr(this.scz[n56] * n67)));
            this.skid = 2;
            b2 = true;
            array7[n56] = true;
            if (!trackers.notwall[n53]) {
              control.wall = n53;
            }
          }
          if (trackers.zy[n53] === 90 && array2[n56] > trackers.z[n53] - trackers.radz[n53] && (this.scz[n56] > 0.0 || trackers.radz[n53] === 287)) {
            for (let n69 = 0; n69 < 4; ++n69) {
              if (n56 !== n69 && array2[n69] <= trackers.z[n53] - trackers.radz[n53]) {
                array2[n69] = fr(array2[n69] - fr(array2[n56] - (trackers.z[n53] - trackers.radz[n53])));
              }
            }
            array2[n56] = trackers.z[n53] - trackers.radz[n53];
            if (trackers.skd[n53] !== 2) {
              ++this.crank[1][n56];
            }
            if (trackers.skd[n53] === 5 && this.m.random() > this.m.random()) {
              ++this.crank[1][n56];
            }
            if (this.crank[1][n56] > 1) {
              contO.sprk(array[n56], array3[n56], array2[n56], this.scx[n56], this.scy[n56], this.scz[n56], 0);
              if (this.im === this.xt.im) {
                this.xt.scrape(trunc(this.scx[n56]), trunc(this.scy[n56]), trunc(this.scz[n56]));
              }
            }
            let n73 = fr(fr(Math.abs(this.m.cos(this.pxy)) + Math.abs(this.m.cos(this.pzy))) / 4.0);
            if (n73 > 0.3) {
              n73 = 0.3;
            }
            if (b3) {
              n73 = 0.0;
            }
            let n74 = fr(n73 + fr(this.cd.bounce[this.cn] - 0.2));
            if (n74 < 1.1) {
              n74 = 1.1;
            }
            this.regz(n56, -Math.abs(fr(fr(this.scz[n56] * n74) * trackers.dam[n53])), contO);
            this.scz[n56] = fr(this.scz[n56] - Math.abs(fr(this.scz[n56] * n74)));
            this.skid = 2;
            b2 = true;
            array7[n56] = true;
            if (!trackers.notwall[n53]) {
              control.wall = n53;
            }
          }
          if (trackers.xy[n53] === -90 && array[n56] < trackers.x[n53] + trackers.radx[n53] && (this.scx[n56] < 0.0 || trackers.radx[n53] === 287)) {
            for (let n76 = 0; n76 < 4; ++n76) {
              if (n56 !== n76 && array[n76] >= trackers.x[n53] + trackers.radx[n53]) {
                array[n76] = fr(array[n76] - fr(array[n56] - (trackers.x[n53] + trackers.radx[n53])));
              }
            }
            array[n56] = trackers.x[n53] + trackers.radx[n53];
            if (trackers.skd[n53] !== 2) {
              ++this.crank[2][n56];
            }
            if (trackers.skd[n53] === 5 && this.m.random() > this.m.random()) {
              ++this.crank[2][n56];
            }
            if (this.crank[2][n56] > 1) {
              contO.sprk(array[n56], array3[n56], array2[n56], this.scx[n56], this.scy[n56], this.scz[n56], 0);
              if (this.im === this.xt.im) {
                this.xt.scrape(trunc(this.scx[n56]), trunc(this.scy[n56]), trunc(this.scz[n56]));
              }
            }
            let n80 = fr(fr(Math.abs(this.m.cos(this.pxy)) + Math.abs(this.m.cos(this.pzy))) / 4.0);
            if (n80 > 0.3) {
              n80 = 0.3;
            }
            if (b3) {
              n80 = 0.0;
            }
            let n81 = fr(n80 + fr(this.cd.bounce[this.cn] - 0.2));
            if (n81 < 1.1) {
              n81 = 1.1;
            }
            this.regx(n56, Math.abs(fr(fr(this.scx[n56] * n81) * trackers.dam[n53])), contO);
            this.scx[n56] = fr(this.scx[n56] + Math.abs(fr(this.scx[n56] * n81)));
            this.skid = 2;
            b2 = true;
            array7[n56] = true;
            if (!trackers.notwall[n53]) {
              control.wall = n53;
            }
          }
          if (trackers.xy[n53] === 90 && array[n56] > trackers.x[n53] - trackers.radx[n53] && (this.scx[n56] > 0.0 || trackers.radx[n53] === 287)) {
            for (let n83 = 0; n83 < 4; ++n83) {
              if (n56 !== n83 && array[n83] <= trackers.x[n53] - trackers.radx[n53]) {
                array[n83] = fr(array[n83] - fr(array[n56] - (trackers.x[n53] - trackers.radx[n53])));
              }
            }
            array[n56] = trackers.x[n53] - trackers.radx[n53];
            if (trackers.skd[n53] !== 2) {
              ++this.crank[3][n56];
            }
            if (trackers.skd[n53] === 5 && this.m.random() > this.m.random()) {
              ++this.crank[3][n56];
            }
            if (this.crank[3][n56] > 1) {
              contO.sprk(array[n56], array3[n56], array2[n56], this.scx[n56], this.scy[n56], this.scz[n56], 0);
              if (this.im === this.xt.im) {
                this.xt.scrape(trunc(this.scx[n56]), trunc(this.scy[n56]), trunc(this.scz[n56]));
              }
            }
            let n87 = fr(fr(Math.abs(this.m.cos(this.pxy)) + Math.abs(this.m.cos(this.pzy))) / 4.0);
            if (n87 > 0.3) {
              n87 = 0.3;
            }
            if (b3) {
              n87 = 0.0;
            }
            let n88 = fr(n87 + fr(this.cd.bounce[this.cn] - 0.2));
            if (n88 < 1.1) {
              n88 = 1.1;
            }
            this.regx(n56, -Math.abs(fr(fr(this.scx[n56] * n88) * trackers.dam[n53])), contO);
            this.scx[n56] = fr(this.scx[n56] - Math.abs(fr(this.scx[n56] * n88)));
            this.skid = 2;
            b2 = true;
            array7[n56] = true;
            if (!trackers.notwall[n53]) {
              control.wall = n53;
            }
          }
          if (trackers.zy[n53] !== 0 && trackers.zy[n53] !== 90 && trackers.zy[n53] !== -90) {
            const n90 = 90 + trackers.zy[n53];
            let n91 = fr(1.0 + fr(fr(50 - Math.abs(trackers.zy[n53])) / 30.0));
            if (n91 < 1.0) {
              n91 = 1.0;
            }
            const n92 = fr(trackers.y[n53] + fr(fr(fr(array3[n56] - trackers.y[n53]) * this.m.cos(n90)) - fr(fr(array2[n56] - trackers.z[n53]) * this.m.sin(n90))));
            let n93 = fr(trackers.z[n53] + fr(fr(fr(array3[n56] - trackers.y[n53]) * this.m.sin(n90)) + fr(fr(array2[n56] - trackers.z[n53]) * this.m.cos(n90))));
            if (n93 > trackers.z[n53] && n93 < trackers.z[n53] + 200) {
              this.scy[n56] = fr(this.scy[n56] - fr(fr(n93 - trackers.z[n53]) / n91));
              n93 = trackers.z[n53];
            }
            if (n93 > trackers.z[n53] - 30) {
              if (trackers.skd[n53] === 2) {
                ++n54;
              } else {
                ++n51;
              }
              this.wtouch = true;
              this.gtouch = false;
              if (this.capsized && (trackers.skd[n53] === 0 || trackers.skd[n53] === 1)) {
                contO.sprk(array[n56], array3[n56], array2[n56], this.scx[n56], this.scy[n56], this.scz[n56], 1);
                if (this.im === this.xt.im) {
                  this.xt.gscrape(trunc(this.scx[n56]), trunc(this.scy[n56]), trunc(this.scz[n56]));
                }
              }
              if (!b3 && n22 !== 0) {
                contO.dust(n56, array[n56], array3[n56], array2[n56], trunc(this.scx[n56]), trunc(this.scz[n56]), fr(1.4 * this.cd.simag[this.cn]), 0, this.capsized && this.mtouch);
              }
            }
            array3[n56] = fr(trackers.y[n53] + fr(fr(fr(n92 - trackers.y[n53]) * this.m.cos(-n90)) - fr(fr(n93 - trackers.z[n53]) * this.m.sin(-n90))));
            array2[n56] = fr(trackers.z[n53] + fr(fr(fr(n92 - trackers.y[n53]) * this.m.sin(-n90)) + fr(fr(n93 - trackers.z[n53]) * this.m.cos(-n90))));
            array7[n56] = true;
          }
          if (trackers.xy[n53] !== 0 && trackers.xy[n53] !== 90 && trackers.xy[n53] !== -90) {
            const n95 = 90 + trackers.xy[n53];
            let n96 = fr(1.0 + fr(fr(50 - Math.abs(trackers.xy[n53])) / 30.0));
            if (n96 < 1.0) {
              n96 = 1.0;
            }
            const n97 = fr(trackers.y[n53] + fr(fr(fr(array3[n56] - trackers.y[n53]) * this.m.cos(n95)) - fr(fr(array[n56] - trackers.x[n53]) * this.m.sin(n95))));
            let n98 = fr(trackers.x[n53] + fr(fr(fr(array3[n56] - trackers.y[n53]) * this.m.sin(n95)) + fr(fr(array[n56] - trackers.x[n53]) * this.m.cos(n95))));
            if (n98 > trackers.x[n53] && n98 < trackers.x[n53] + 200) {
              this.scy[n56] = fr(this.scy[n56] - fr(fr(n98 - trackers.x[n53]) / n96));
              n98 = trackers.x[n53];
            }
            if (n98 > trackers.x[n53] - 30) {
              if (trackers.skd[n53] === 2) {
                ++n54;
              } else {
                ++n51;
              }
              this.wtouch = true;
              this.gtouch = false;
              if (this.capsized && (trackers.skd[n53] === 0 || trackers.skd[n53] === 1)) {
                contO.sprk(array[n56], array3[n56], array2[n56], this.scx[n56], this.scy[n56], this.scz[n56], 1);
                if (this.im === this.xt.im) {
                  this.xt.gscrape(trunc(this.scx[n56]), trunc(this.scy[n56]), trunc(this.scz[n56]));
                }
              }
              if (!b3 && n22 !== 0) {
                contO.dust(n56, array[n56], array3[n56], array2[n56], trunc(this.scx[n56]), trunc(this.scz[n56]), fr(1.4 * this.cd.simag[this.cn]), 0, this.capsized && this.mtouch);
              }
            }
            array3[n56] = fr(trackers.y[n53] + fr(fr(fr(n97 - trackers.y[n53]) * this.m.cos(-n95)) - fr(fr(n98 - trackers.x[n53]) * this.m.sin(-n95))));
            array[n56] = fr(trackers.x[n53] + fr(fr(fr(n97 - trackers.y[n53]) * this.m.sin(-n95)) + fr(fr(n98 - trackers.x[n53]) * this.m.cos(-n95))));
            array7[n56] = true;
          }
        }
      }
      if (n54 === 4) {
        this.mtouch = true;
      }
      if (n55 === 4) {
        n40 = 4;
      }
    }
    if (n51 === 4) {
      this.mtouch = true;
    }
    for (let n100 = 0; n100 < 4; ++n100) {
      for (let n101 = 0; n101 < 4; ++n101) {
        if (this.crank[n100][n101] === this.lcrank[n100][n101]) {
          this.crank[n100][n101] = 0;
        }
        this.lcrank[n100][n101] = this.crank[n100][n101];
      }
    }
    let a = 0;
    let a2 = 0;
    let a3 = 0;
    let a4 = 0;
    if (this.scy[2] !== this.scy[0]) {
      let n102;
      if (this.scy[2] < this.scy[0]) {
        n102 = -1;
      } else {
        n102 = 1;
      }
      const a5 = Math.sqrt(fr(fr(fr((array2[0] - array2[2]) * (array2[0] - array2[2])) + fr((array3[0] - array3[2]) * (array3[0] - array3[2]))) + fr((array[0] - array[2]) * (array[0] - array[2])))) / (Math.abs(contO.keyz[0]) + Math.abs(contO.keyz[2]));
      if (a5 >= 0.9998) {
        a = n102;
      } else {
        a = trunc(fr(fr(Math.acos(a5) / 0.017453292519943295) * n102));
      }
    }
    if (this.scy[3] !== this.scy[1]) {
      let n103;
      if (this.scy[3] < this.scy[1]) {
        n103 = -1;
      } else {
        n103 = 1;
      }
      const a6 = Math.sqrt(fr(fr(fr((array2[1] - array2[3]) * (array2[1] - array2[3])) + fr((array3[1] - array3[3]) * (array3[1] - array3[3]))) + fr((array[1] - array[3]) * (array[1] - array[3])))) / (Math.abs(contO.keyz[1]) + Math.abs(contO.keyz[3]));
      if (a6 >= 0.9998) {
        a2 = n103;
      } else {
        a2 = trunc(fr(fr(Math.acos(a6) / 0.017453292519943295) * n103));
      }
    }
    if (this.scy[1] !== this.scy[0]) {
      let n104;
      if (this.scy[1] < this.scy[0]) {
        n104 = -1;
      } else {
        n104 = 1;
      }
      const a7 = Math.sqrt(fr(fr(fr((array2[0] - array2[1]) * (array2[0] - array2[1])) + fr((array3[0] - array3[1]) * (array3[0] - array3[1]))) + fr((array[0] - array[1]) * (array[0] - array[1])))) / (Math.abs(contO.keyx[0]) + Math.abs(contO.keyx[1]));
      if (a7 >= 0.9998) {
        a3 = n104;
      } else {
        a3 = trunc(fr(fr(Math.acos(a7) / 0.017453292519943295) * n104));
      }
    }
    if (this.scy[3] !== this.scy[2]) {
      let n105;
      if (this.scy[3] < this.scy[2]) {
        n105 = -1;
      } else {
        n105 = 1;
      }
      const a8 = Math.sqrt(fr(fr(fr((array2[2] - array2[3]) * (array2[2] - array2[3])) + fr((array3[2] - array3[3]) * (array3[2] - array3[3]))) + fr((array[2] - array[3]) * (array[2] - array[3])))) / (Math.abs(contO.keyx[2]) + Math.abs(contO.keyx[3]));
      if (a8 >= 0.9998) {
        a4 = n105;
      } else {
        a4 = trunc(fr(fr(Math.acos(a8) / 0.017453292519943295) * n105));
      }
    }
    if (b2) {
      let abs;
      for (abs = Math.abs(contO.xz + 45); abs > 180; abs -= 360) {}
      if (Math.abs(abs) > 90) {
        this.pmlt = 1;
      } else {
        this.pmlt = -1;
      }
      let abs2;
      for (abs2 = Math.abs(contO.xz - 45); abs2 > 180; abs2 -= 360) {}
      if (Math.abs(abs2) > 90) {
        this.nmlt = 1;
      } else {
        this.nmlt = -1;
      }
    }
    // §2 Compound assignment
    contO.xz = trunc(fr(contO.xz + fr(this.forca * fr(fr(fr(fr(fr(fr(fr(this.scz[0] * this.nmlt - this.scz[1] * this.pmlt) + this.scz[2] * this.pmlt) - this.scz[3] * this.nmlt) + this.scx[0] * this.pmlt) + this.scx[1] * this.nmlt) - this.scx[2] * this.nmlt) - this.scx[3] * this.pmlt))));
    if (Math.abs(a2) > Math.abs(a)) {
      a = a2;
    }
    if (Math.abs(a4) > Math.abs(a3)) {
      a3 = a4;
    }
    if (!zyinv) {
      this.pzy += a;
    } else {
      this.pzy -= a;
    }
    if (n3 === 0) {
      this.pxy += a3;
    } else {
      this.pxy -= a3;
    }
    if (n40 === 4) {
      let n106 = 0;
      while (this.pzy < 360) {
        this.pzy += 360;
        contO.zy += 360;
      }
      while (this.pzy > 360) {
        this.pzy -= 360;
        contO.zy -= 360;
      }
      if (this.pzy < 190 && this.pzy > 170) {
        this.pzy = 180;
        contO.zy = 180;
        ++n106;
      }
      if (this.pzy > 350 || this.pzy < 10) {
        this.pzy = 0;
        contO.zy = 0;
        ++n106;
      }
      while (this.pxy < 360) {
        this.pxy += 360;
        contO.xy += 360;
      }
      while (this.pxy > 360) {
        this.pxy -= 360;
        contO.xy -= 360;
      }
      if (this.pxy < 190 && this.pxy > 170) {
        this.pxy = 180;
        contO.xy = 180;
        ++n106;
      }
      if (this.pxy > 350 || this.pxy < 10) {
        this.pxy = 0;
        contO.xy = 0;
        ++n106;
      }
      if (n106 === 2) {
        this.mtouch = true;
      }
    }
    if (!this.mtouch && this.wtouch) {
      if (this.cntouch === 10) {
        this.mtouch = true;
      } else {
        ++this.cntouch;
      }
    } else {
      this.cntouch = 0;
    }
    const _sumY = fr(fr(fr(array3[0] + array3[1]) + array3[2]) + array3[3]);
    const _avgY = fr(_sumY / 4.0);
    const _gCosZy = fr(grat * this.m.cos(this.pzy));
    const _gCosZyPxy = fr(_gCosZy * this.m.cos(this.pxy));
    const _subY = fr(_avgY - _gCosZyPxy);
    const _yFloat = fr(_subY + n6);
    contO.y = trunc(_yFloat);
    let n107;
    if (zyinv) {
      n107 = -1;
    } else {
      n107 = 1;
    }
    const term0_cos_x = fr(contO.keyx[0] * this.m.cos(contO.xz));
    const t0_x = fr(array[0] - term0_cos_x);
    const term0_sin_mul_x = fr(n107 * contO.keyz[0]);
    const term0_sin_x = fr(term0_sin_mul_x * this.m.sin(contO.xz));
    const t1_x = fr(t0_x + term0_sin_x);
    const t2_x = fr(t1_x + array[1]);
    const term1_cos_x = fr(contO.keyx[1] * this.m.cos(contO.xz));
    const t3_x = fr(t2_x - term1_cos_x);
    const term1_sin_mul_x = fr(n107 * contO.keyz[1]);
    const term1_sin_x = fr(term1_sin_mul_x * this.m.sin(contO.xz));
    const t4_x = fr(t3_x + term1_sin_x);
    const t5_x = fr(t4_x + array[2]);
    const term2_cos_x = fr(contO.keyx[2] * this.m.cos(contO.xz));
    const t6_x = fr(t5_x - term2_cos_x);
    const term2_sin_mul_x = fr(n107 * contO.keyz[2]);
    const term2_sin_x = fr(term2_sin_mul_x * this.m.sin(contO.xz));
    const t7_x = fr(t6_x + term2_sin_x);
    const t8_x = fr(t7_x + array[3]);
    const term3_cos_x = fr(contO.keyx[3] * this.m.cos(contO.xz));
    const t9_x = fr(t8_x - term3_cos_x);
    const term3_sin_mul_x = fr(n107 * contO.keyz[3]);
    const term3_sin_x = fr(term3_sin_mul_x * this.m.sin(contO.xz));
    const numX = fr(t9_x + term3_sin_x);
    const avgX = fr(numX / 4.0);
    const gSinPxy_x = fr(grat * this.m.sin(this.pxy));
    const gSinPxyCosXz = fr(gSinPxy_x * this.m.cos(contO.xz));
    const add1X = fr(avgX + gSinPxyCosXz);
    const gSinPzy_x = fr(grat * this.m.sin(this.pzy));
    const gSinPzySinXz = fr(gSinPzy_x * this.m.sin(contO.xz));
    const sub2X = fr(add1X - gSinPzySinXz);
    const xFloat = fr(sub2X + n4);
    contO.x = trunc(xFloat);

    const tz0_mul = fr(n107 * contO.keyz[0]);
    const tz0 = fr(tz0_mul * this.m.cos(contO.xz));
    const z0 = fr(array2[0] - tz0);
    const tx0 = fr(contO.keyx[0] * this.m.sin(contO.xz));
    const z1 = fr(z0 - tx0);
    const z2 = fr(z1 + array2[1]);
    const tz1_mul = fr(n107 * contO.keyz[1]);
    const tz1 = fr(tz1_mul * this.m.cos(contO.xz));
    const z3 = fr(z2 - tz1);
    const tx1 = fr(contO.keyx[1] * this.m.sin(contO.xz));
    const z4 = fr(z3 - tx1);
    const z5 = fr(z4 + array2[2]);
    const tz2_mul = fr(n107 * contO.keyz[2]);
    const tz2 = fr(tz2_mul * this.m.cos(contO.xz));
    const z6 = fr(z5 - tz2);
    const tx2 = fr(contO.keyx[2] * this.m.sin(contO.xz));
    const z7 = fr(z6 - tx2);
    const z8 = fr(z7 + array2[3]);
    const tz3_mul = fr(n107 * contO.keyz[3]);
    const tz3 = fr(tz3_mul * this.m.cos(contO.xz));
    const z9 = fr(z8 - tz3);
    const tx3 = fr(contO.keyx[3] * this.m.sin(contO.xz));
    const numZ = fr(z9 - tx3);
    const avgZ = fr(numZ / 4.0);
    const gSinPxy_z = fr(grat * this.m.sin(this.pxy));
    const gSinPxySinXz = fr(gSinPxy_z * this.m.sin(contO.xz));
    const add1Z = fr(avgZ + gSinPxySinXz);
    const gSinPzy_z = fr(grat * this.m.sin(this.pzy));
    const gSinPzyCosXz = fr(gSinPzy_z * this.m.cos(contO.xz));
    const sub2Z = fr(add1Z - gSinPzyCosXz);
    const zFloat = fr(sub2Z + n5);
    contO.z = trunc(zFloat);
    if (Math.abs(this.speed) > 10.0 || !this.mtouch) {
      if (Math.abs(this.pxy - contO.xy) >= 4) {
        if (this.pxy > contO.xy) {
          contO.xy += 2 + idiv(this.pxy - contO.xy, 2);
        } else {
          contO.xy -= 2 + idiv(contO.xy - this.pxy, 2);
        }
      } else {
        contO.xy = this.pxy;
      }
      if (Math.abs(this.pzy - contO.zy) >= 4) {
        if (this.pzy > contO.zy) {
          contO.zy += 2 + idiv(this.pzy - contO.zy, 2);
        } else {
          contO.zy -= 2 + idiv(contO.zy - this.pzy, 2);
        }
      } else {
        contO.zy = this.pzy;
      }
    }
    if (this.wtouch && !this.capsized) {
      const n108 = fr(fr(fr(this.speed / this.cd.swits[this.cn][2]) * 14.0) * fr(this.cd.bounce[this.cn] - 0.4));
      if (control.left && this.tilt < n108 && this.tilt >= 0.0) {
        this.tilt = fr(this.tilt + 0.4);
      } else if (control.right && this.tilt > -n108 && this.tilt <= 0.0) {
        this.tilt = fr(this.tilt - 0.4);
      } else if (Math.abs(this.tilt) > fr(3.0 * fr(this.cd.bounce[this.cn] - 0.4))) {
        if (this.tilt > 0.0) {
          this.tilt = fr(this.tilt - fr(3.0 * fr(this.cd.bounce[this.cn] - 0.3)));
        } else {
          this.tilt = fr(this.tilt + fr(3.0 * fr(this.cd.bounce[this.cn] - 0.3)));
        }
      } else {
        this.tilt = 0.0;
      }
      // §2 Compound assignments
      contO.xy = trunc(fr(contO.xy + this.tilt));
      if (this.gtouch) {
        contO.y = trunc(fr(contO.y - fr(this.tilt / 1.5)));
      }
    } else if (this.tilt !== 0.0) {
      this.tilt = 0.0;
    }
    if (this.wtouch && n22 === 2) {
      contO.zy += trunc(fr(fr(fr(this.m.random() * 6.0 * this.speed / this.cd.swits[this.cn][2]) - fr(3.0 * this.speed / this.cd.swits[this.cn][2])) * fr(this.cd.bounce[this.cn] - 0.3)));
      contO.xy += trunc(fr(fr(fr(this.m.random() * 6.0 * this.speed / this.cd.swits[this.cn][2]) - fr(3.0 * this.speed / this.cd.swits[this.cn][2])) * fr(this.cd.bounce[this.cn] - 0.3)));
    }
    if (this.wtouch && n22 === 1) {
      contO.zy += trunc(fr(fr(fr(this.m.random() * 4.0 * this.speed / this.cd.swits[this.cn][2]) - fr(2.0 * this.speed / this.cd.swits[this.cn][2])) * fr(this.cd.bounce[this.cn] - 0.3)));
      contO.xy += trunc(fr(fr(fr(this.m.random() * 4.0 * this.speed / this.cd.swits[this.cn][2]) - fr(2.0 * this.speed / this.cd.swits[this.cn][2])) * fr(this.cd.bounce[this.cn] - 0.3)));
    }
    if (this.hitmag >= this.cd.maxmag[this.cn] && !this.dest) {
      this.distruct(contO);
      if (this.cntdest === 7) {
        this.dest = true;
      } else {
        ++this.cntdest;
      }
      if (this.cntdest === 1) {
        this.rpd.dest[this.im] = 300;
      }
    }
    if (contO.dist === 0) {
      for (let n109 = 0; n109 < contO.npl; ++n109) {
        if (contO.p[n109].chip !== 0) {
          contO.p[n109].chip = 0;
        }
        if (contO.p[n109].embos !== 0) {
          contO.p[n109].embos = 13;
        }
      }
    }
    let focus = 0;
    let n110 = 0;
    let n111 = 0;
    let n112;
    if (this.nofocus) {
      n112 = 1;
    } else {
      n112 = 7;
    }
    for (let n113 = 0; n113 < checkPoints.n; ++n113) {
      if (checkPoints.typ[n113] > 0) {
        ++n111;
        if (checkPoints.typ[n113] === 1) {
          if (this.clear === n111 + this.nlaps * checkPoints.nsp) {
            n112 = 1;
          }
          if (Math.abs(contO.z - checkPoints.z[n113]) < 60.0 + fr(Math.abs(fr(fr(fr(this.scz[0] + this.scz[1]) + this.scz[2]) + this.scz[3])) / 4.0) && Math.abs(contO.x - checkPoints.x[n113]) < 700 && Math.abs(contO.y - checkPoints.y[n113] + 350) < 450 && this.clear === n111 + this.nlaps * checkPoints.nsp - 1) {
            this.clear = n111 + this.nlaps * checkPoints.nsp;
            this.pcleared = n113;
            this.focus = -1;
          }
        }
        if (checkPoints.typ[n113] === 2) {
          if (this.clear === n111 + this.nlaps * checkPoints.nsp) {
            n112 = 1;
          }
          if (Math.abs(contO.x - checkPoints.x[n113]) < 60.0 + fr(Math.abs(fr(fr(fr(this.scx[0] + this.scx[1]) + this.scx[2]) + this.scx[3])) / 4.0) && Math.abs(contO.z - checkPoints.z[n113]) < 700 && Math.abs(contO.y - checkPoints.y[n113] + 350) < 450 && this.clear === n111 + this.nlaps * checkPoints.nsp - 1) {
            this.clear = n111 + this.nlaps * checkPoints.nsp;
            this.pcleared = n113;
            this.focus = -1;
          }
        }
      }
      if (Math.imul(this.py(idiv(contO.x, 100), idiv(checkPoints.x[n113], 100), idiv(contO.z, 100), idiv(checkPoints.z[n113], 100)), n112) < n110 || n110 === 0) {
        focus = n113;
        n110 = Math.imul(this.py(idiv(contO.x, 100), idiv(checkPoints.x[n113], 100), idiv(contO.z, 100), idiv(checkPoints.z[n113], 100)), n112);
      }
    }
    if (this.clear === n111 + this.nlaps * checkPoints.nsp) {
      ++this.nlaps;
      if (this.xt.multion === 1 && this.im === this.xt.im) {
        if (this.xt.laptime < this.xt.fastestlap || this.xt.fastestlap === 0) {
          this.xt.fastestlap = this.xt.laptime;
        }
        this.xt.laptime = 0;
      }
    }
    if (this.im === this.xt.im) {
      if (this.xt.multion === 1 && this.xt.starcnt === 0) {
        ++this.xt.laptime;
      }
      this.m.checkpoint = this.clear;
      while (this.m.checkpoint >= checkPoints.nsp) {
        this.m.checkpoint -= checkPoints.nsp;
      }
      if (this.clear === checkPoints.nlaps * checkPoints.nsp - 1) {
        this.m.lastcheck = true;
      }
      if (checkPoints.haltall) {
        this.m.lastcheck = false;
      }
    }
    if (this.focus === -1) {
      // human(), not "mine": this advances checkpoint focus by a different
      // amount for the player's car, so keyed on `im` each netplay client
      // advanced a different car and the two diverged. Same for every branch
      // below that touches physics rather than sound or the HUD.
      if (this.xt.human(this.im)) {
        focus += 2;
      } else {
        ++focus;
      }
      if (!this.nofocus) {
        let n114 = this.pcleared + 1;
        if (n114 >= checkPoints.n) {
          n114 = 0;
        }
        while (checkPoints.typ[n114] <= 0) {
          if (++n114 >= checkPoints.n) {
            n114 = 0;
          }
        }
        if (focus > n114 && (this.clear !== this.nlaps * checkPoints.nsp || focus < this.pcleared)) {
          focus = n114;
          this.focus = focus;
        }
      }
      if (focus >= checkPoints.n) {
        focus -= checkPoints.n;
      }
      if (checkPoints.typ[focus] === -3) {
        focus = 0;
      }
      if (this.xt.human(this.im)) {
        if (this.missedcp !== -1) {
          this.missedcp = -1;
        }
      } else if (this.missedcp !== 0) {
        this.missedcp = 0;
      }
    } else {
      focus = this.focus;
      if (this.xt.human(this.im)) {
        if (this.missedcp === 0 && this.mtouch && Math.sqrt(this.py(idiv(contO.x, 10), idiv(checkPoints.x[this.focus], 10), idiv(contO.z, 10), idiv(checkPoints.z[this.focus], 10))) > 800.0) {
          this.missedcp = 1;
        }
        if (this.missedcp === -2 && Math.sqrt(this.py(idiv(contO.x, 10), idiv(checkPoints.x[this.focus], 10), idiv(contO.z, 10), idiv(checkPoints.z[this.focus], 10))) < 400.0) {
          this.missedcp = 0;
        }
        if (this.missedcp !== 0 && this.mtouch && Math.sqrt(this.py(idiv(contO.x, 10), idiv(checkPoints.x[this.focus], 10), idiv(contO.z, 10), idiv(checkPoints.z[this.focus], 10))) < 250.0) {
          this.missedcp = 68;
        }
      } else {
        this.missedcp = 1;
      }
      if (this.nofocus) {
        this.focus = -1;
        this.missedcp = 0;
      }
    }
    if (this.nofocus) {
      this.nofocus = false;
    }
    this.point = focus;
    if (this.fixes !== 0) {
      if (this.m.noelec === 0) {
        for (let n115 = 0; n115 < checkPoints.fn; ++n115) {
          if (!checkPoints.roted[n115]) {
            if (Math.abs(contO.z - checkPoints.fz[n115]) < 200 && this.py(idiv(contO.x, 100), idiv(checkPoints.fx[n115], 100), idiv(contO.y, 100), idiv(checkPoints.fy[n115], 100)) < 30) {
              if (contO.dist === 0) {
                contO.fcnt = 8;
              } else {
                if (this.im === this.xt.im && !contO.fix && !this.xt.mutes) {
                  this.xt.carfixed.play();
                }
                contO.fix = true;
              }
              this.rpd.fix[this.im] = 300;
            }
          } else if (Math.abs(contO.x - checkPoints.fx[n115]) < 200 && this.py(idiv(contO.z, 100), idiv(checkPoints.fz[n115], 100), idiv(contO.y, 100), idiv(checkPoints.fy[n115], 100)) < 30) {
            if (contO.dist === 0) {
              contO.fcnt = 8;
            } else {
              if (this.im === this.xt.im && !contO.fix && !this.xt.mutes) {
                this.xt.carfixed.play();
              }
              contO.fix = true;
            }
            this.rpd.fix[this.im] = 300;
          }
        }
      }
    } else {
      for (let n116 = 0; n116 < checkPoints.fn; ++n116) {
        if (this.rpy(fr(idiv(contO.x, 100)), fr(idiv(checkPoints.fx[n116], 100)), fr(idiv(contO.y, 100)), fr(idiv(checkPoints.fy[n116], 100)), fr(idiv(contO.z, 100)), fr(idiv(checkPoints.fz[n116], 100))) < 760) {
          this.m.noelec = 2;
        }
      }
    }
    if (contO.fcnt === 7 || contO.fcnt === 8) {
      this.squash = 0;
      this.nbsq = 0;
      this.hitmag = 0;
      this.cntdest = 0;
      this.dest = false;
      this.newcar = true;
      contO.fcnt = 9;
      if (this.fixes > 0) {
        --this.fixes;
      }
    }
    if (this.newedcar !== 0) {
      --this.newedcar;
      if (this.newedcar === 10) {
        this.newcar = false;
      }
    }
    if (!this.mtouch) {
      if (this.trcnt !== 1) {
        this.trcnt = 1;
        this.lxz = contO.xz;
      }
      if (this.loop === 2 || this.loop === -1) {
        // §2 Compound assignments
        this.travxy = trunc(fr(this.travxy + fr(this.rcomp - this.lcomp)));
        if (Math.abs(this.travxy) > 135) {
          this.rtab = true;
        }
        this.travzy = trunc(fr(this.travzy + fr(this.ucomp - this.dcomp)));
        if (this.travzy > 135) {
          this.ftab = true;
        }
        if (this.travzy < -135) {
          this.btab = true;
        }
      }
      if (this.lxz !== contO.xz) {
        this.travxz += this.lxz - contO.xz;
        this.lxz = contO.xz;
      }
      if (this.srfcnt < 10) {
        if (control.wall !== -1) {
          this.surfer = true;
        }
        ++this.srfcnt;
      }
    } else if (!this.dest) {
      if (!this.capsized) {
        if (this.capcnt !== 0) {
          this.capcnt = 0;
        }
        if (this.gtouch && this.trcnt !== 0) {
          if (this.trcnt === 9) {
            this.powerup = 0.0;
            if (Math.abs(this.travxy) > 90) {
              this.powerup = fr(this.powerup + fr(Math.abs(this.travxy) / 24.0));
            } else if (this.rtab) {
              this.powerup = fr(this.powerup + 30.0);
            }
            if (Math.abs(this.travzy) > 90) {
              this.powerup = fr(this.powerup + fr(Math.abs(this.travzy) / 18.0));
            } else {
              if (this.ftab) {
                this.powerup = fr(this.powerup + 40.0);
              }
              if (this.btab) {
                this.powerup = fr(this.powerup + 40.0);
              }
            }
            if (Math.abs(this.travxz) > 90) {
              this.powerup = fr(this.powerup + fr(Math.abs(this.travxz) / 18.0));
            }
            if (this.surfer) {
              this.powerup = fr(this.powerup + 30.0);
            }
            this.power = fr(this.power + this.powerup);
            if (this.im === this.xt.im && trunc(this.powerup) > this.rpd.powered && this.rpd.wasted === 0 && (this.powerup > 60.0 || checkPoints.stage === 1 || checkPoints.stage === 2)) {
              this.rpdcatch = 30;
              if (this.rpd.hcaught) {
                this.rpd.powered = trunc(this.powerup);
              }
              if (this.xt.multion === 1 && this.powerup > this.xt.beststunt) {
                this.xt.beststunt = trunc(this.powerup);
              }
            }
            if (this.power > 98.0) {
              this.power = 98.0;
              if (this.powerup > 150.0) {
                this.xtpower = 200;
              } else {
                this.xtpower = 100;
              }
            }
          }
          if (this.trcnt === 10) {
            this.travxy = 0;
            this.travzy = 0;
            this.travxz = 0;
            this.ftab = false;
            this.rtab = false;
            this.btab = false;
            this.trcnt = 0;
            this.srfcnt = 0;
            this.surfer = false;
          } else {
            ++this.trcnt;
          }
        }
      } else {
        if (this.trcnt !== 0) {
          this.travxy = 0;
          this.travzy = 0;
          this.travxz = 0;
          this.ftab = false;
          this.rtab = false;
          this.btab = false;
          this.trcnt = 0;
          this.srfcnt = 0;
          this.surfer = false;
        }
        if (this.capcnt === 0) {
          let n117 = 0;
          for (let n118 = 0; n118 < 4; ++n118) {
            if (Math.abs(this.scz[n118]) < 70.0 && Math.abs(this.scx[n118]) < 70.0) {
              ++n117;
            }
          }
          if (n117 === 4) {
            this.capcnt = 1;
          }
        } else {
          ++this.capcnt;
          if (this.capcnt === 30) {
            this.speed = 0.0;
            contO.y += this.cd.flipy[this.cn];
            this.pxy += 180;
            contO.xy += 180;
            this.capcnt = 0;
          }
        }
      }
      if (this.trcnt === 0 && this.speed !== 0.0) {
        if (this.xtpower === 0) {
          if (this.power > 0.0) {
            this.power = fr(this.power - fr(fr(fr(this.power * this.power) * this.power) / this.cd.powerloss[this.cn]));
          } else {
            this.power = 0.0;
          }
        } else {
          --this.xtpower;
        }
      }
    }
    // HUMAN, not "mine". This clears the wall-contact flag every tick for a
    // player-driven car and lets it persist for an AI one, and `wall` feeds
    // `surfer`, which feeds powerup and power. Keyed on `im` it ran on a
    // different car on each netplay client, so the host's car surfed on the
    // guest's machine and not on the host's: a 20-point power difference out
    // of nothing. Single player is unaffected -- human() is `i === im` there.
    if (this.xt.human(this.im)) {
      if (control.wall !== -1) {
        control.wall = -1;
      }
    } else if (this.lastcolido !== 0 && !this.dest) {
      --this.lastcolido;
    }
    if (this.dest) {
      if (checkPoints.dested[this.im] === 0) {
        if (this.lastcolido === 0) {
          checkPoints.dested[this.im] = 1;
        } else {
          checkPoints.dested[this.im] = 2;
        }
      }
    } else if (checkPoints.dested[this.im] !== 0 && checkPoints.dested[this.im] !== 3) {
      checkPoints.dested[this.im] = 0;
    }
    // The record-ghost countdown. Genuinely local-only -- each client tracks
    // its own replay -- so unlike the `wall` clear it cannot be made
    // human-symmetric. That makes its random a PRESENTATION random: taken from
    // the sim stream it advances on a different tick on each netplay client
    // and desyncs everything downstream, which is exactly what it did.
    if (this.im === this.xt.im && this.rpd.wasted === 0 && this.rpdcatch !== 0) {
      --this.rpdcatch;
      if (this.rpdcatch === 0) {
        this.rpd.cotchinow(this.im);
        if (this.rpd.hcaught) {
          setDrawPhase(true);
          try {
            this.rpd.whenwasted = trunc(fr(185.0 + fr(this.m.random() * 20.0)));
          } finally {
            setDrawPhase(false);
          }
        }
      }
    }
  }

  distruct(contO) {
    for (let i = 0; i < contO.npl; ++i) {
      if (contO.p[i].wz === 0 || contO.p[i].gr === -17 || contO.p[i].gr === -16) {
        contO.p[i].embos = 1;
      }
    }
  }

  regy(n, a, contO) {
    let n2 = 0;
    let b = true;
    if (this.xt.multion === 1 && this.xt.im !== this.im) {
      b = false;
    }
    if (this.xt.multion >= 2) {
      b = false;
    }
    if (this.xt.lan && this.xt.multion >= 1 && this.xt.isbot[this.im]) {
      b = true;
    }
    a = fr(a * this.cd.dammult[this.cn]);
    if (a > 100.0) {
      this.rpd.recy(n, a, this.mtouch, this.im);
      a = fr(a - 100.0);
      let n3 = 0;
      let n4 = 0;
      let i = this.contO_zy_norm(contO.zy);
      let j = this.contO_xy_norm(contO.xy);
      if (i < 210 && i > 150) {
        n3 = -1;
      }
      if (i > 330 || i < 30) {
        n3 = 1;
      }
      if (j < 210 && j > 150) {
        n4 = -1;
      }
      if (j > 330 || j < 30) {
        n4 = 1;
      }
      if (Math.imul(n4, n3) === 0) {
        this.shakedam = trunc(fr(fr(Math.abs(a) + this.shakedam) / 2.0));
      }
      if (this.im === this.xt.im || this.colidim) {
        this.xt.crash(a, Math.imul(n4, n3));
      }
      if (Math.imul(n4, n3) === 0 || this.mtouch) {
        for (let k = 0; k < contO.npl; ++k) {
          let n5 = 0.0;
          for (let l = 0; l < contO.p[k].n; ++l) {
            if (contO.p[k].wz === 0 && this.py(contO.keyx[n], contO.p[k].ox[l], contO.keyz[n], contO.p[k].oz[l]) < this.cd.clrad[this.cn]) {
              n5 = fr(fr(a / 20.0) * this.m.random());
              // §2 Compound assignments
              contO.p[k].oz[l] = trunc(fr(contO.p[k].oz[l] + fr(n5 * this.m.sin(i))));
              contO.p[k].ox[l] = trunc(fr(contO.p[k].ox[l] - fr(n5 * this.m.sin(j))));
              if (b) {
                this.hitmag = trunc(fr(this.hitmag + Math.abs(n5)));
                n2 = trunc(fr(n2 + Math.abs(n5)));
              }
            }
          }
          if (n5 !== 0.0) {
            if (Math.abs(n5) >= 1.0) {
              contO.p[k].chip = 1;
              contO.p[k].ctmag = n5;
            }
            if (!contO.p[k].nocol && contO.p[k].glass !== 1) {
              if (contO.p[k].bfase > 20 && contO.p[k].hsb[1] > 0.25) {
                contO.p[k].hsb[1] = 0.25;
              }
              if (contO.p[k].bfase > 25 && contO.p[k].hsb[2] > 0.7) {
                contO.p[k].hsb[2] = 0.7;
              }
              if (contO.p[k].bfase > 30 && contO.p[k].hsb[1] > 0.15) {
                contO.p[k].hsb[1] = 0.15;
              }
              if (contO.p[k].bfase > 35 && contO.p[k].hsb[2] > 0.6) {
                contO.p[k].hsb[2] = 0.6;
              }
              if (contO.p[k].bfase > 40) {
                contO.p[k].hsb[0] = 0.075;
              }
              if (contO.p[k].bfase > 50 && contO.p[k].hsb[2] > 0.5) {
                contO.p[k].hsb[2] = 0.5;
              }
              if (contO.p[k].bfase > 60) {
                contO.p[k].hsb[0] = 0.05;
              }
              contO.p[k].bfase = trunc(fr(contO.p[k].bfase + n5));
              const hsbColor = HSBtoRGB(contO.p[k].hsb[0], contO.p[k].hsb[1], contO.p[k].hsb[2]);
              contO.p[k].c[0] = (hsbColor >> 16) & 255;
              contO.p[k].c[1] = (hsbColor >> 8) & 255;
              contO.p[k].c[2] = hsbColor & 255;
            }
            if (contO.p[k].glass === 1) {
              contO.p[k].gr = trunc(fr(contO.p[k].gr + Math.abs(fr(n5 * 1.5))));
            }
          }
        }
      }
      if (Math.imul(n4, n3) === -1) {
        if (this.nbsq > 0) {
          let n8 = 0;
          let n9 = 1;
          for (let n10 = 0; n10 < contO.npl; ++n10) {
            let n11 = 0.0;
            for (let n12 = 0; n12 < contO.p[n10].n; ++n12) {
              if (contO.p[n10].wz === 0) {
                n11 = fr(fr(a / 15.0) * this.m.random());
                if ((Math.abs(contO.p[n10].oy[n12] - this.cd.flipy[this.cn] - this.squash) < this.cd.msquash[this.cn] * 3 || contO.p[n10].oy[n12] < this.cd.flipy[this.cn] + this.squash) && this.squash < this.cd.msquash[this.cn]) {
                  contO.p[n10].oy[n12] = trunc(fr(contO.p[n10].oy[n12] + n11));
                  n8 = trunc(fr(n8 + n11));
                  ++n9;
                  if (b) {
                    this.hitmag = trunc(fr(this.hitmag + Math.abs(n11)));
                    n2 = trunc(fr(n2 + Math.abs(n11)));
                  }
                }
              }
            }
            if (contO.p[n10].glass === 1) {
              contO.p[n10].gr += 5;
            } else if (n11 !== 0.0) {
              contO.p[n10].bfase = trunc(fr(contO.p[n10].bfase + n11));
            }
            if (Math.abs(n11) >= 1.0) {
              contO.p[n10].chip = 1;
              contO.p[n10].ctmag = n11;
            }
          }
          this.squash += idiv(n8, n9);
          this.nbsq = 0;
        } else {
          ++this.nbsq;
        }
      }
    }
    return n2;
  }

  contO_zy_norm(i) {
    while (i < 360) i += 360;
    while (i > 360) i -= 360;
    return i;
  }

  contO_xy_norm(j) {
    while (j < 360) j += 360;
    while (j > 360) j -= 360;
    return j;
  }

  regx(n, n2, contO) {
    let n3 = 0;
    let b = true;
    if (this.xt.multion === 1 && this.xt.im !== this.im) {
      b = false;
    }
    if (this.xt.multion >= 2) {
      b = false;
    }
    if (this.xt.lan && this.xt.multion >= 1 && this.xt.isbot[this.im]) {
      b = true;
    }
    n2 = fr(n2 * this.cd.dammult[this.cn]);
    if (Math.abs(n2) > 100.0) {
      this.rpd.recx(n, n2, this.im);
      if (n2 > 100.0) {
        n2 = fr(n2 - 100.0);
      }
      if (n2 < -100.0) {
        n2 = fr(n2 + 100.0);
      }
      this.shakedam = trunc(fr(fr(Math.abs(n2) + this.shakedam) / 2.0));
      if (this.im === this.xt.im || this.colidim) {
        this.xt.crash(n2, 0);
      }
      for (let i = 0; i < contO.npl; ++i) {
        let a = 0.0;
        for (let j = 0; j < contO.p[i].n; ++j) {
          if (contO.p[i].wz === 0 && this.py(contO.keyx[n], contO.p[i].ox[j], contO.keyz[n], contO.p[i].oz[j]) < this.cd.clrad[this.cn]) {
            a = fr(fr(n2 / 20.0) * this.m.random());
            // §2 Compound assignments
            contO.p[i].oz[j] = trunc(fr(contO.p[i].oz[j] - fr(fr(a * this.m.sin(contO.xz)) * this.m.cos(contO.zy))));
            contO.p[i].ox[j] = trunc(fr(contO.p[i].ox[j] + fr(fr(a * this.m.cos(contO.xz)) * this.m.cos(contO.xy))));
            if (b) {
              this.hitmag = trunc(fr(this.hitmag + Math.abs(a)));
              n3 = trunc(fr(n3 + Math.abs(a)));
            }
          }
        }
        if (a !== 0.0) {
          if (Math.abs(a) >= 1.0) {
            contO.p[i].chip = 1;
            contO.p[i].ctmag = a;
          }
          if (!contO.p[i].nocol && contO.p[i].glass !== 1) {
            if (contO.p[i].bfase > 20 && contO.p[i].hsb[1] > 0.25) {
              contO.p[i].hsb[1] = 0.25;
            }
            if (contO.p[i].bfase > 25 && contO.p[i].hsb[2] > 0.7) {
              contO.p[i].hsb[2] = 0.7;
            }
            if (contO.p[i].bfase > 30 && contO.p[i].hsb[1] > 0.15) {
              contO.p[i].hsb[1] = 0.15;
            }
            if (contO.p[i].bfase > 35 && contO.p[i].hsb[2] > 0.6) {
              contO.p[i].hsb[2] = 0.6;
            }
            if (contO.p[i].bfase > 40) {
              contO.p[i].hsb[0] = 0.075;
            }
            if (contO.p[i].bfase > 50 && contO.p[i].hsb[2] > 0.5) {
              contO.p[i].hsb[2] = 0.5;
            }
            if (contO.p[i].bfase > 60) {
              contO.p[i].hsb[0] = 0.05;
            }
            contO.p[i].bfase = trunc(fr(contO.p[i].bfase + Math.abs(a)));
            const hsbColor = HSBtoRGB(contO.p[i].hsb[0], contO.p[i].hsb[1], contO.p[i].hsb[2]);
            contO.p[i].c[0] = (hsbColor >> 16) & 255;
            contO.p[i].c[1] = (hsbColor >> 8) & 255;
            contO.p[i].c[2] = hsbColor & 255;
          }
          if (contO.p[i].glass === 1) {
            contO.p[i].gr = trunc(fr(contO.p[i].gr + Math.abs(fr(a * 1.5))));
          }
        }
      }
    }
    return n3;
  }

  regz(n, n2, contO) {
    let n3 = 0;
    let b = true;
    if (this.xt.multion === 1 && this.xt.im !== this.im) {
      b = false;
    }
    if (this.xt.multion >= 2) {
      b = false;
    }
    if (this.xt.lan && this.xt.multion >= 1 && this.xt.isbot[this.im]) {
      b = true;
    }
    n2 = fr(n2 * this.cd.dammult[this.cn]);
    if (Math.abs(n2) > 100.0) {
      this.rpd.recz(n, n2, this.im);
      if (n2 > 100.0) {
        n2 = fr(n2 - 100.0);
      }
      if (n2 < -100.0) {
        n2 = fr(n2 + 100.0);
      }
      this.shakedam = trunc(fr(fr(Math.abs(n2) + this.shakedam) / 2.0));
      if (this.im === this.xt.im || this.colidim) {
        this.xt.crash(n2, 0);
      }
      for (let i = 0; i < contO.npl; ++i) {
        let a = 0.0;
        for (let j = 0; j < contO.p[i].n; ++j) {
          if (contO.p[i].wz === 0 && this.py(contO.keyx[n], contO.p[i].ox[j], contO.keyz[n], contO.p[i].oz[j]) < this.cd.clrad[this.cn]) {
            a = fr(fr(n2 / 20.0) * this.m.random());
            // §2 Compound assignments
            contO.p[i].oz[j] = trunc(fr(contO.p[i].oz[j] + fr(fr(a * this.m.cos(contO.xz)) * this.m.cos(contO.zy))));
            contO.p[i].ox[j] = trunc(fr(contO.p[i].ox[j] + fr(fr(a * this.m.sin(contO.xz)) * this.m.cos(contO.xy))));
            if (b) {
              this.hitmag = trunc(fr(this.hitmag + Math.abs(a)));
              n3 = trunc(fr(n3 + Math.abs(a)));
            }
          }
        }
        if (a !== 0.0) {
          if (Math.abs(a) >= 1.0) {
            contO.p[i].chip = 1;
            contO.p[i].ctmag = a;
          }
          if (!contO.p[i].nocol && contO.p[i].glass !== 1) {
            if (contO.p[i].bfase > 20 && contO.p[i].hsb[1] > 0.25) {
              contO.p[i].hsb[1] = 0.25;
            }
            if (contO.p[i].bfase > 25 && contO.p[i].hsb[2] > 0.7) {
              contO.p[i].hsb[2] = 0.7;
            }
            if (contO.p[i].bfase > 30 && contO.p[i].hsb[1] > 0.15) {
              contO.p[i].hsb[1] = 0.15;
            }
            if (contO.p[i].bfase > 35 && contO.p[i].hsb[2] > 0.6) {
              contO.p[i].hsb[2] = 0.6;
            }
            if (contO.p[i].bfase > 40) {
              contO.p[i].hsb[0] = 0.075;
            }
            if (contO.p[i].bfase > 50 && contO.p[i].hsb[2] > 0.5) {
              contO.p[i].hsb[2] = 0.5;
            }
            if (contO.p[i].bfase > 60) {
              contO.p[i].hsb[0] = 0.05;
            }
            contO.p[i].bfase = trunc(fr(contO.p[i].bfase + Math.abs(a)));
            const hsbColor = HSBtoRGB(contO.p[i].hsb[0], contO.p[i].hsb[1], contO.p[i].hsb[2]);
            contO.p[i].c[0] = (hsbColor >> 16) & 255;
            contO.p[i].c[1] = (hsbColor >> 8) & 255;
            contO.p[i].c[2] = hsbColor & 255;
          }
          if (contO.p[i].glass === 1) {
            contO.p[i].gr = trunc(fr(contO.p[i].gr + Math.abs(fr(a * 1.5))));
          }
        }
      }
    }
    return n3;
  }

  colide(contO, mad, contO2) {
    const array = floatArray(4);
    const array2 = floatArray(4);
    const array3 = floatArray(4);
    const array4 = floatArray(4);
    const array5 = floatArray(4);
    const array6 = floatArray(4);
    for (let i = 0; i < 4; ++i) {
      array[i] = fr(contO.x + contO.keyx[i]);
      if (this.capsized) {
        array2[i] = fr(fr(contO.y + this.cd.flipy[this.cn]) + this.squash);
      } else {
        array2[i] = fr(contO.y + contO.grat);
      }
      array3[i] = fr(contO.z + contO.keyz[i]);
      array4[i] = fr(contO2.x + contO2.keyx[i]);
      if (this.capsized) {
        array5[i] = fr(fr(contO2.y + this.cd.flipy[mad.cn]) + mad.squash);
      } else {
        array5[i] = fr(contO2.y + contO2.grat);
      }
      array6[i] = fr(contO2.z + contO2.keyz[i]);
    }
    this.rot(array, array2, contO.x, contO.y, contO.xy, 4);
    this.rot(array2, array3, contO.y, contO.z, contO.zy, 4);
    this.rot(array, array3, contO.x, contO.z, contO.xz, 4);
    this.rot(array4, array5, contO2.x, contO2.y, contO2.xy, 4);
    this.rot(array5, array6, contO2.y, contO2.z, contO2.zy, 4);
    this.rot(array4, array6, contO2.x, contO2.z, contO2.xz, 4);
    if (this.rpy(contO.x, contO2.x, contO.y, contO2.y, contO.z, contO2.z) < fr(fr(Math.imul(contO.maxR, contO.maxR) + Math.imul(contO2.maxR, contO2.maxR)) * 1.5)) {
      if (!this.caught[mad.im] && (this.speed !== 0.0 || mad.speed !== 0.0)) {
        if (Math.abs(fr(fr(this.power * this.speed) * this.cd.moment[this.cn])) !== Math.abs(fr(fr(mad.power * mad.speed) * this.cd.moment[mad.cn]))) {
          if (Math.abs(fr(fr(this.power * this.speed) * this.cd.moment[this.cn])) > Math.abs(fr(fr(mad.power * mad.speed) * this.cd.moment[mad.cn]))) {
            this.dominate[mad.im] = true;
          } else {
            this.dominate[mad.im] = false;
          }
        } else if (this.cd.moment[this.cn] > this.cd.moment[mad.cn]) {
          this.dominate[mad.im] = true;
        } else {
          this.dominate[mad.im] = false;
        }
        this.caught[mad.im] = true;
      }
    } else if (this.caught[mad.im]) {
      this.caught[mad.im] = false;
    }
    let n = 0;
    let n2 = 0;
    if (this.dominate[mad.im]) {
      const dZ0 = fr(this.scz[0] - mad.scz[0]);
      const dZ1 = fr(dZ0 + fr(this.scz[1] - mad.scz[1]));
      const dZ2 = fr(dZ1 + fr(this.scz[2] - mad.scz[2]));
      const dZ3 = fr(dZ2 + fr(this.scz[3] - mad.scz[3]));
      const dZSq = fr(dZ3 * dZ3);
      const dX0 = fr(this.scx[0] - mad.scx[0]);
      const dX1 = fr(dX0 + fr(this.scx[1] - mad.scx[1]));
      const dX2 = fr(dX1 + fr(this.scx[2] - mad.scx[2]));
      const dX3 = fr(dX2 + fr(this.scx[3] - mad.scx[3]));
      const dXSq = fr(dX3 * dX3);
      const sumSq = fr(dZSq + dXSq);
      const div16 = fr(sumSq / 16.0);
      const n3 = trunc(div16);
      let n4 = 7000;
      let n5 = 1.0;
      if (this.xt.multion !== 0) {
        n4 = 28000;
        n5 = 1.27;
      }
      for (let j = 0; j < 4; ++j) {
        for (let k = 0; k < 4; ++k) {
          // NOT Math.imul: `comprad` is a float[] (0.4 .. 1.5), so this is an
          // int * float multiply in the Java and stays float. Math.imul
          // truncates both operands, which turned the whole threshold into 0
          // for any pair whose comprad sum is below 1 -- formula7 is 0.4, so
          // the default field never collided at all and cars drove through
          // each other.
          if (this.rpy(array[j], array4[k], array2[j], array5[k], array3[j], array6[k]) < fr(i32(n3 + n4) * fr(this.cd.comprad[mad.cn] + this.cd.comprad[this.cn]))) {
            if (Math.abs(fr(this.scx[j] * this.cd.moment[this.cn])) > Math.abs(fr(mad.scx[k] * this.cd.moment[mad.cn]))) {
              let n6 = fr(mad.scx[k] * this.cd.revpush[this.cn]);
              if (n6 > 300.0) {
                n6 = 300.0;
              }
              if (n6 < -300.0) {
                n6 = -300.0;
              }
              let n7 = fr(this.scx[j] * this.cd.push[this.cn]);
              if (n7 > 300.0) {
                n7 = 300.0;
              }
              if (n7 < -300.0) {
                n7 = -300.0;
              }
              mad.scx[k] = fr(mad.scx[k] + n7);
              if (this.xt.human(this.im)) {
                mad.colidim = true;
              }
              const n9 = n + mad.regx(k, fr(fr(n7 * this.cd.moment[this.cn]) * n5), contO2);
              if (mad.colidim) {
                mad.colidim = false;
              }
              this.scx[j] = fr(this.scx[j] - n6);
              n2 += this.regx(j, fr(fr(-n6 * this.cd.moment[this.cn]) * n5), contO);
              this.scy[j] = fr(this.scy[j] - this.cd.revlift[this.cn]);
              if (this.im === this.xt.im) {
                mad.colidim = true;
              }
              n = n9 + mad.regy(k, fr(this.cd.revlift[this.cn] * 7.0), contO2);
              if (mad.colidim) {
                mad.colidim = false;
              }
              if (this.m.random() > this.m.random()) {
                contO2.sprk(fr(fr(array[j] + array4[k]) / 2.0), fr(fr(array2[j] + array5[k]) / 2.0), fr(fr(array3[j] + array6[k]) / 2.0), fr(fr(mad.scx[k] + this.scx[j]) / 4.0), fr(fr(mad.scy[k] + this.scy[j]) / 4.0), fr(fr(mad.scz[k] + this.scz[j]) / 4.0), 2);
              }
            }
            if (Math.abs(fr(this.scz[j] * this.cd.moment[this.cn])) > Math.abs(fr(mad.scz[k] * this.cd.moment[mad.cn]))) {
              let n12 = fr(mad.scz[k] * this.cd.revpush[this.cn]);
              if (n12 > 300.0) {
                n12 = 300.0;
              }
              if (n12 < -300.0) {
                n12 = -300.0;
              }
              let n13 = fr(this.scz[j] * this.cd.push[this.cn]);
              if (n13 > 300.0) {
                n13 = 300.0;
              }
              if (n13 < -300.0) {
                n13 = -300.0;
              }
              mad.scz[k] = fr(mad.scz[k] + n13);
              if (this.im === this.xt.im) {
                mad.colidim = true;
              }
              const n15 = n + mad.regz(k, fr(fr(n13 * this.cd.moment[this.cn]) * n5), contO2);
              if (mad.colidim) {
                mad.colidim = false;
              }
              this.scz[j] = fr(this.scz[j] - n12);
              n2 += this.regz(j, fr(fr(-n12 * this.cd.moment[this.cn]) * n5), contO);
              this.scy[j] = fr(this.scy[j] - this.cd.revlift[this.cn]);
              if (this.im === this.xt.im) {
                mad.colidim = true;
              }
              n = n15 + mad.regy(k, fr(this.cd.revlift[this.cn] * 7.0), contO2);
              if (mad.colidim) {
                mad.colidim = false;
              }
              if (this.m.random() > this.m.random()) {
                contO2.sprk(fr(fr(array[j] + array4[k]) / 2.0), fr(fr(array2[j] + array5[k]) / 2.0), fr(fr(array3[j] + array6[k]) / 2.0), fr(fr(mad.scx[k] + this.scx[j]) / 4.0), fr(fr(mad.scy[k] + this.scy[j]) / 4.0), fr(fr(mad.scz[k] + this.scz[j]) / 4.0), 2);
              }
            }
            if (this.xt.human(this.im)) {
              mad.lastcolido = 70;
            }
            if (this.xt.human(mad.im)) {
              this.lastcolido = 70;
            }
            mad.scy[k] = fr(mad.scy[k] - this.cd.lift[this.cn]);
          }
        }
      }
    }
    if (this.xt.multion === 1) {
      if (mad.im === this.xt.im && n !== 0) {
        this.xt.dcrashes[this.im] += n;
      }
      if (this.im === this.xt.im && n2 !== 0) {
        this.xt.dcrashes[mad.im] += n2;
      }
    }
  }

  rot(array, array2, n, n2, n3, n4) {
    if (n3 !== 0) {
      const cos = this.m.cos(n3);
      const sin = this.m.sin(n3);
      for (let i = 0; i < n4; ++i) {
        const n5 = array[i];
        const n6 = array2[i];
        array[i] = fr(n + fr(fr((n5 - n) * cos) - fr((n6 - n2) * sin)));
        array2[i] = fr(n2 + fr(fr((n5 - n) * sin) + fr((n6 - n2) * cos)));
      }
    }
  }

  rpy(n, n2, n3, n4, n5, n6) {
    return trunc(fr(fr(fr((n - n2) * (n - n2)) + fr((n3 - n4) * (n3 - n4))) + fr((n5 - n6) * (n5 - n6))));
  }

  py(n, n2, n3, n4) {
    return i32(Math.imul(n - n2, n - n2) + Math.imul(n3 - n4, n3 - n4));
  }
}
