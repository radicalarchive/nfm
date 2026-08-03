// Transpiled from CarMaker.java lines 4682-4997 (chunk "shape"), line by line.
//
// Shared state: CarMaker methods receive state object `cm` as first parameter.
// Local names kept as procyon emitted them (n, n2, b, array, array2, ...).

import { idiv, trunc, fr, i32, HSBtoRGB } from '../java.js';

export function regx(cm, n, a, b) {
  cm.hitmag = trunc(fr(cm.hitmag + a));
  if (!b) {
    crash(cm, a);
  }
  a = fr(a * fr(0.3 + fr(cm.crash[1] * 0.005)));
  if (Math.abs(a) > 100.0) {
    let n2 = trunc(i32(Math.imul(cm.crash[0], cm.crash[0])) * 1.5);
    if (n2 < 1000) {
      n2 = 1000;
    }
    if (a > 100.0) {
      a = fr(a - 100.0);
    }
    if (a < -100.0) {
      a = fr(a + 100.0);
    }
    for (let i = 0; i < cm.o.npl; ++i) {
      let n3 = 0.0;
      for (let j = 0; j < cm.o.p[i].n; ++j) {
        if (cm.o.p[i].wz === 0 && py(cm, cm.o.keyx[n], cm.o.p[i].ox[j], cm.o.keyz[n], cm.o.p[i].oz[j]) < n2) {
          n3 = fr(fr(a / 20.0) * cm.m.random());
          const oz = cm.o.p[i].oz;
          const n4 = j;
          oz[n4] = trunc(fr(oz[n4] - fr(fr(n3 * cm.m.sin(cm.o.xz)) * cm.m.cos(cm.o.zy))));
          const ox = cm.o.p[i].ox;
          const n5 = j;
          ox[n5] = trunc(fr(ox[n5] + fr(fr(n3 * cm.m.cos(cm.o.xz)) * cm.m.cos(cm.o.xy))));
          if (b) {
            cm.actmag = trunc(fr(cm.actmag + Math.abs(n3)));
          }
        }
      }
      if (n3 !== 0.0) {
        if (Math.abs(n3) >= 1.0) {
          cm.o.p[i].chip = 1;
          cm.o.p[i].ctmag = n3;
        }
        if (!cm.o.p[i].nocol && cm.o.p[i].glass !== 1) {
          if (cm.o.p[i].bfase > 20 && cm.o.p[i].hsb[1] > 0.25) {
            cm.o.p[i].hsb[1] = 0.25;
          }
          if (cm.o.p[i].bfase > 25 && cm.o.p[i].hsb[2] > 0.7) {
            cm.o.p[i].hsb[2] = 0.7;
          }
          if (cm.o.p[i].bfase > 30 && cm.o.p[i].hsb[1] > 0.15) {
            cm.o.p[i].hsb[1] = 0.15;
          }
          if (cm.o.p[i].bfase > 35 && cm.o.p[i].hsb[2] > 0.6) {
            cm.o.p[i].hsb[2] = 0.6;
          }
          if (cm.o.p[i].bfase > 40) {
            cm.o.p[i].hsb[0] = 0.075;
          }
          if (cm.o.p[i].bfase > 50 && cm.o.p[i].hsb[2] > 0.5) {
            cm.o.p[i].hsb[2] = 0.5;
          }
          if (cm.o.p[i].bfase > 60) {
            cm.o.p[i].hsb[0] = 0.05;
          }
          const plane = cm.o.p[i];
          plane.bfase = trunc(fr(plane.bfase + Math.abs(n3)));
          const hsbColor = HSBtoRGB(cm.o.p[i].hsb[0], cm.o.p[i].hsb[1], cm.o.p[i].hsb[2]);
          cm.o.p[i].c[0] = (hsbColor >> 16) & 0xff;
          cm.o.p[i].c[1] = (hsbColor >> 8) & 0xff;
          cm.o.p[i].c[2] = hsbColor & 0xff;
        }
        if (cm.o.p[i].glass === 1) {
          const plane2 = cm.o.p[i];
          plane2.gr = trunc(plane2.gr + Math.abs(n3 * 1.5));
        }
      }
    }
  }
}

export function regz(cm, n, a, b) {
  cm.hitmag = trunc(fr(cm.hitmag + a));
  if (!b) {
    crash(cm, a);
  }
  a = fr(a * fr(0.3 + fr(cm.crash[1] * 0.005)));
  if (Math.abs(a) > 100.0) {
    let n2 = trunc(i32(Math.imul(cm.crash[0], cm.crash[0])) * 1.5);
    if (n2 < 1000) {
      n2 = 1000;
    }
    if (a > 100.0) {
      a = fr(a - 100.0);
    }
    if (a < -100.0) {
      a = fr(a + 100.0);
    }
    for (let i = 0; i < cm.o.npl; ++i) {
      let n3 = 0.0;
      for (let j = 0; j < cm.o.p[i].n; ++j) {
        if (cm.o.p[i].wz === 0 && py(cm, cm.o.keyx[n], cm.o.p[i].ox[j], cm.o.keyz[n], cm.o.p[i].oz[j]) < n2) {
          n3 = fr(fr(a / 20.0) * cm.m.random());
          const oz = cm.o.p[i].oz;
          const n4 = j;
          oz[n4] = trunc(fr(oz[n4] + fr(fr(n3 * cm.m.cos(cm.o.xz)) * cm.m.cos(cm.o.zy))));
          const ox = cm.o.p[i].ox;
          const n5 = j;
          ox[n5] = trunc(fr(ox[n5] + fr(fr(n3 * cm.m.sin(cm.o.xz)) * cm.m.cos(cm.o.xy))));
          if (b) {
            cm.actmag = trunc(fr(cm.actmag + Math.abs(n3)));
          }
        }
      }
      if (n3 !== 0.0) {
        if (Math.abs(n3) >= 1.0) {
          cm.o.p[i].chip = 1;
          cm.o.p[i].ctmag = n3;
        }
        if (!cm.o.p[i].nocol && cm.o.p[i].glass !== 1) {
          if (cm.o.p[i].bfase > 20 && cm.o.p[i].hsb[1] > 0.25) {
            cm.o.p[i].hsb[1] = 0.25;
          }
          if (cm.o.p[i].bfase > 25 && cm.o.p[i].hsb[2] > 0.7) {
            cm.o.p[i].hsb[2] = 0.7;
          }
          if (cm.o.p[i].bfase > 30 && cm.o.p[i].hsb[1] > 0.15) {
            cm.o.p[i].hsb[1] = 0.15;
          }
          if (cm.o.p[i].bfase > 35 && cm.o.p[i].hsb[2] > 0.6) {
            cm.o.p[i].hsb[2] = 0.6;
          }
          if (cm.o.p[i].bfase > 40) {
            cm.o.p[i].hsb[0] = 0.075;
          }
          if (cm.o.p[i].bfase > 50 && cm.o.p[i].hsb[2] > 0.5) {
            cm.o.p[i].hsb[2] = 0.5;
          }
          if (cm.o.p[i].bfase > 60) {
            cm.o.p[i].hsb[0] = 0.05;
          }
          const plane = cm.o.p[i];
          plane.bfase = trunc(fr(plane.bfase + Math.abs(n3)));
          const hsbColor = HSBtoRGB(cm.o.p[i].hsb[0], cm.o.p[i].hsb[1], cm.o.p[i].hsb[2]);
          cm.o.p[i].c[0] = (hsbColor >> 16) & 0xff;
          cm.o.p[i].c[1] = (hsbColor >> 8) & 0xff;
          cm.o.p[i].c[2] = hsbColor & 0xff;
        }
        if (cm.o.p[i].glass === 1) {
          const plane2 = cm.o.p[i];
          plane2.gr = trunc(plane2.gr + Math.abs(n3 * 1.5));
        }
      }
    }
  }
}

export function roofsqsh(cm, n) {
  if (n > 100.0) {
    crash(cm, n);
    n = fr(n - 100.0);
    const n2 = trunc(2.0 + cm.crash[2] / 7.6);
    let n3 = 0;
    let n4 = 1;
    for (let i = 0; i < cm.o.npl; ++i) {
      let ctmag = 0.0;
      if (Math.random() > 0.9) {
        ctmag = fr(fr(n / 15.0) * cm.m.random());
      }
      for (let j = 0; j < cm.o.p[i].n; ++j) {
        if (cm.o.p[i].wz === 0 && (Math.abs(cm.o.p[i].oy[j] - cm.o.roofat - cm.squash) < n2 * 3 || cm.o.p[i].oy[j] < cm.o.roofat + cm.squash) && cm.squash < n2) {
          ctmag = fr(fr(n / 15.0) * cm.m.random());
          const oy = cm.o.p[i].oy;
          const n5 = j;
          oy[n5] = trunc(fr(oy[n5] + ctmag));
          n3 = trunc(fr(n3 + ctmag));
          ++n4;
          cm.hitmag = trunc(fr(cm.hitmag + Math.abs(ctmag)));
        }
      }
      if (!cm.o.p[i].nocol && cm.o.p[i].glass !== 1) {
        if (ctmag !== 0.0) {
          if (cm.o.p[i].bfase > 20 && cm.o.p[i].hsb[1] > 0.25) {
            cm.o.p[i].hsb[1] = 0.25;
          }
          if (cm.o.p[i].bfase > 25 && cm.o.p[i].hsb[2] > 0.7) {
            cm.o.p[i].hsb[2] = 0.7;
          }
          if (cm.o.p[i].bfase > 30 && cm.o.p[i].hsb[1] > 0.15) {
            cm.o.p[i].hsb[1] = 0.15;
          }
          if (cm.o.p[i].bfase > 35 && cm.o.p[i].hsb[2] > 0.6) {
            cm.o.p[i].hsb[2] = 0.6;
          }
          if (cm.o.p[i].bfase > 40) {
            cm.o.p[i].hsb[0] = 0.075;
          }
          if (cm.o.p[i].bfase > 50 && cm.o.p[i].hsb[2] > 0.5) {
            cm.o.p[i].hsb[2] = 0.5;
          }
          if (cm.o.p[i].bfase > 60) {
            cm.o.p[i].hsb[0] = 0.05;
          }
          const plane = cm.o.p[i];
          plane.bfase = trunc(fr(plane.bfase + ctmag));
          const hsbColor = HSBtoRGB(cm.o.p[i].hsb[0], cm.o.p[i].hsb[1], cm.o.p[i].hsb[2]);
          cm.o.p[i].c[0] = (hsbColor >> 16) & 0xff;
          cm.o.p[i].c[1] = (hsbColor >> 8) & 0xff;
          cm.o.p[i].c[2] = hsbColor & 0xff;
        }
      } else if (cm.o.p[i].glass === 1) {
        const plane2 = cm.o.p[i];
        plane2.gr = i32(plane2.gr + 5);
      }
      if (Math.abs(ctmag) >= 1.0) {
        cm.o.p[i].chip = 1;
        cm.o.p[i].ctmag = ctmag;
      }
    }
    cm.squash = i32(cm.squash + idiv(n3, n4));
  }
}

export function crash(cm, n) {
  if (n > 100.0) {
    n = fr(n - 100.0);
  }
  if (n < -100.0) {
    n = fr(n + 100.0);
  }
  if (Math.abs(n) > 25.0 && Math.abs(n) < 170.0) {
    if (cm.lowcrashs && cm.lowcrashs[cm.crshturn]) {
      cm.lowcrashs[cm.crshturn].play();
    }
  }
  if (Math.abs(n) >= 170.0) {
    if (cm.crashs && cm.crashs[cm.crshturn]) {
      cm.crashs[cm.crshturn].play();
    }
  }
  if (Math.abs(n) > 25.0) {
    if (cm.crashup) {
      cm.crshturn = i32(cm.crshturn - 1);
    } else {
      cm.crshturn = i32(cm.crshturn + 1);
    }
    if (cm.crshturn === -1) {
      cm.crshturn = 2;
    }
    if (cm.crshturn === 3) {
      cm.crshturn = 0;
    }
  }
}

export function setheme(cm) {
  if (cm.cthm === 0) {
    cm.editor.setForeground(cm.deff);
    cm.editor.setBackground(cm.defb);
  }
  if (cm.cthm === 1) {
    cm.editor.setForeground([0, 0, 0]);
    cm.editor.setBackground([192, 192, 192]);
  }
  if (cm.cthm === 2) {
    cm.editor.setForeground([192, 192, 192]);
    cm.editor.setBackground([0, 0, 0]);
  }
  if (cm.cthm === 3) {
    cm.editor.setForeground([0, 0, 0]);
    cm.editor.setBackground([50, 200, 0]);
  }
  if (cm.cthm === 4) {
    cm.editor.setForeground([67, 255, 77]);
    cm.editor.setBackground([0, 0, 0]);
  }
  if (cm.cthm === 5) {
    cm.editor.setForeground([0, 172, 255]);
    cm.editor.setBackground([210, 234, 255]);
  }
  if (cm.cthm === 6) {
    cm.editor.setForeground([255, 230, 0]);
    cm.editor.setBackground([255, 77, 67]);
  }
  if (cm.cthm === 7) {
    cm.editor.setForeground([0, 159, 255]);
    cm.editor.setBackground([9, 47, 104]);
  }
}

export function py(cm, n, n2, n3, n4) {
  // §2b: the subtractions are int arithmetic too, and wrap before the multiply.
  return i32(Math.imul(i32(n - n2), i32(n - n2)) + Math.imul(i32(n3 - n4), i32(n3 - n4)));
}

export function rot(cm, array, array2, n, n2, n3, n4) {
  if (n3 !== 0) {
    for (let i = 0; i < n4; ++i) {
      const n5 = array[i];
      const n6 = array2[i];
      array[i] = i32(n + trunc(fr(fr(i32(n5 - n) * cm.m.cos(n3)) - fr(i32(n6 - n2) * cm.m.sin(n3)))));
      array2[i] = i32(n2 + trunc(fr(fr(i32(n5 - n) * cm.m.sin(n3)) + fr(i32(n6 - n2) * cm.m.cos(n3)))));
    }
  }
}

export function xs(cm, n, cz) {
  if (cz < cm.m.cz) {
    cz = cm.m.cz;
  }
  return i32(idiv(Math.imul(i32(cz - cm.m.focus_point), i32(cm.m.cx - n)), cz) + n);
}

export function ys(cm, n, cz) {
  if (cz < cm.m.cz) {
    cz = cm.m.cz;
  }
  return i32(idiv(Math.imul(i32(cz - cm.m.focus_point), i32(cm.m.cy - n)), cz) + n);
}
