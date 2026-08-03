// Transpiled from CarMaker.java lines 878-2477 (chunk "tab2"), line by line.
//
// Shared state: CarMaker methods receive state object `cm` as first parameter.
// Local names kept as procyon emitted them (n, n2, b, array, array2, ...).

import { idiv, trunc, fr, i32, HSBtoRGB, RGBtoHSB, random } from '../java.js';
import { movefield, stringbutton, hidefields } from './ui.js';
import { setupo, savefile, getvalue } from './files.js';
import { regx, regz, rot, xs, ys } from './shape.js';

export function tab2(cm) {
  if (cm.tab === 2) {
    if (cm.tabed !== cm.tab) {
      setupo(cm);
      cm.dtabed = -1;
    }
    cm.m.d(cm.rd);
    cm.o.d(cm.rd);
    if (cm.dtab === 2) {
      if (cm.compsel > 0 && cm.compsel <= 16) {
        cm.compo[cm.compsel - 1].x = cm.o.x;
        cm.compo[cm.compsel - 1].y = cm.o.y;
        cm.compo[cm.compsel - 1].z = cm.o.z;
        cm.compo[cm.compsel - 1].xz = cm.o.xz;
        cm.compo[cm.compsel - 1].xy = cm.o.xy;
        cm.compo[cm.compsel - 1].zy = cm.o.zy;
        cm.rd.setComposite(0.4);
        cm.compo[cm.compsel - 1].d(cm.rd);
        cm.rd.setComposite(1.0);
      }
      if (cm.xm > 420 && cm.xm < 690 && cm.ym > 425 && cm.ym < 540) {
        const array = new Int32Array([i32(50 + cm.adna[0]), i32(-50 - cm.adna[1]), 0, 0, 0, 0]);
        const array2 = new Int32Array([0, 0, i32(50 + cm.adna[2]), i32(-50 - cm.adna[3]), 0, 0]);
        const array3 = new Int32Array([0, 0, 0, 0, i32(50 + cm.adna[4]), i32(-50 - cm.adna[5])]);
        for (let l = 0; l < 6; ++l) {
          const array4 = array;
          const n10 = l;
          array4[n10] = i32(array4[n10] + (cm.o.x - cm.m.x));
          const array5 = array2;
          const n11 = l;
          array5[n11] = i32(array5[n11] + (cm.o.y - cm.m.y));
          const array6 = array3;
          const n12 = l;
          array6[n12] = i32(array6[n12] + (cm.o.z - cm.m.z));
        }
        rot(cm, array, array2, cm.o.x - cm.m.x, cm.o.y - cm.m.y, cm.o.xy, 6);
        rot(cm, array2, array3, cm.o.y - cm.m.y, cm.o.z - cm.m.z, cm.o.zy, 6);
        rot(cm, array, array3, cm.o.x - cm.m.x, cm.o.z - cm.m.z, cm.o.xz, 6);
        rot(cm, array, array3, cm.m.cx, cm.m.cz, cm.m.xz, 6);
        rot(cm, array2, array3, cm.m.cy, cm.m.cz, cm.m.zy, 6);
        const array7 = new Int32Array(6);
        const array8 = new Int32Array(6);
        for (let n13 = 0; n13 < 6; ++n13) {
          array7[n13] = xs(cm, array[n13], array3[n13]);
          array8[n13] = ys(cm, array2[n13], array3[n13]);
        }
        cm.rd.setColor(0, 150, 0);
        cm.rd.drawString("X+", array7[0] - 7, array8[0] + 4);
        cm.rd.drawString("-X", array7[1] - 5, array8[1] + 4);
        cm.rd.drawLine(array7[0], array8[0], array7[1], array8[1]);
        cm.rd.setColor(150, 0, 0);
        cm.rd.drawString("Y+", array7[2] - 7, array8[2] + 4);
        cm.rd.drawString("-Y", array7[3] - 5, array8[3] + 4);
        cm.rd.drawLine(array7[2], array8[2], array7[3], array8[3]);
        cm.rd.setColor(0, 0, 150);
        cm.rd.drawString("Z+", array7[4] - 7, array8[4] + 4);
        cm.rd.drawString("-Z", array7[5] - 5, array8[5] + 4);
        cm.rd.drawLine(array7[4], array8[4], array7[5], array8[5]);
        for (let n14 = 0; n14 < 6; ++n14) {
          if (fr(Math.abs(array8[n14] - 207) * 1.91) > Math.abs(array7[n14] - 350)) {
            if (Math.abs(Math.abs(array8[n14] - 207) - 170) > 10) {
              if (Math.abs(array8[n14] - 207) < 170) {
                const adna = cm.adna;
                const n15 = n14;
                adna[n15] = i32(adna[n15] + 10);
              } else {
                const adna2 = cm.adna;
                const n16 = n14;
                adna2[n16] = i32(adna2[n16] - 10);
              }
            }
          } else if (Math.abs(Math.abs(array7[n14] - 350) - 338) > 10) {
            if (Math.abs(array7[n14] - 350) < 338) {
              const adna3 = cm.adna;
              const n17 = n14;
              adna3[n17] = i32(adna3[n17] + 10);
            } else {
              const adna4 = cm.adna;
              const n18 = n14;
              adna4[n18] = i32(adna4[n18] - 10);
            }
          }
          if (cm.adna[n14] > 276) {
            cm.adna[n14] = 276;
          }
          if (cm.adna[n14] < 0) {
            cm.adna[n14] = 0;
          }
        }
      }
    }
    cm.rd.setColor(205, 200, 200);
    cm.rd.fillRect(0, 390, 700, 20);
    cm.rd.setColor(225, 225, 225);
    cm.rd.fillRect(0, 410, 700, 140);
    cm.rd.setFont("Arial", 1, 12);
    cm.ftm = cm.rd.getFontMetrics();
    const array9 = ["3D Controls", "Color Edit", "Scale & Align", "Wheels", "Stats & Class", "Physics", "Test Drive"];
    const array10 = new Int32Array([0, 0, 100, 90]);
    const array11 = new Int32Array([390, 410, 410, 390]);
    for (let dtab = 0; dtab < 7; ++dtab) {
      cm.rd.setColor(170, 170, 170);
      if (cm.xm > array10[0] && cm.xm < array10[3] && cm.ym > 390 && cm.ym < 410) {
        cm.rd.setColor(190, 190, 190);
      }
      if (cm.dtab === dtab) {
        cm.rd.setColor(225, 225, 225);
      }
      cm.rd.fillPolygon(array10, array11, 4);
      cm.rd.setColor(0, 0, 0);
      cm.rd.drawString(array9[dtab], i32(dtab * 100 + 47 - idiv(cm.ftm.stringWidth(array9[dtab]), 2)), 404);
      if (cm.xm > array10[0] && cm.xm < array10[3] && cm.ym > 390 && cm.ym < 410 && cm.mouses === -1) {
        cm.dtab = dtab;
      }
      for (let n19 = 0; n19 < 4; ++n19) {
        const array12 = array10;
        const n20 = n19;
        array12[n20] = i32(array12[n20] + 100);
      }
    }
    if (cm.dtabed !== cm.dtab) {
      if (cm.dtabed !== -1) {
        if (cm.editor.getText() !== cm.lastedo) {
          cm.editor.setText(cm.lastedo);
        }
        setupo(cm);
      }
      cm.setCursor(0);
      hidefields(cm);
      cm.requestFocus();
    }
    cm.rd.setColor(0, 0, 0);
    if (cm.dtab === 0) {
      cm.rd.drawString("Rotate Car around its X & Z Axis using:  [ Keyboard Arrows ] ", 20, 440);
      cm.rd.drawString("Rotate Car fully around the Y Axis using:    [ < ]  &  [ > ]    or    [ A ]  &  [ D ]    or    [ 4 ]  &  [ 6 ]    Keys", 20, 465);
      cm.rd.drawString("Move Car Up and Down using:    [ - ]  &  [ + ]    Keys", 20, 490);
      cm.rd.drawString("Move Car Forwards and Backwards using:    [ W ]  &  [ S ]    or    [ 8 ]  &  [ 2 ]    or    [ Enter ]  &  [ Backspace ]    Keys", 20, 515);
    }
    if (cm.dtab === 1) {
      if (cm.o.colok !== 2) {
        cm.rd.setFont("Arial", 1, 13);
        cm.ftm = cm.rd.getFontMetrics();
        cm.rd.drawString("[  First & Second Color not defined yet  ]", i32(350 - idiv(cm.ftm.stringWidth("[  First & Second Color not defined yet  ]"), 2)), 450);
        stringbutton(cm, " Define 1st and 2nd Color ", 350, 490, 0, true);
      } else {
        if (cm.dtabed !== cm.dtab) {
          cm.fcol = "(" + cm.o.fcol[0] + "," + cm.o.fcol[1] + "," + cm.o.fcol[2] + ")";
          cm.srch.setText(cm.fcol);
          cm.ofcol = cm.fcol;
          RGBtoHSB(cm.o.fcol[0], cm.o.fcol[1], cm.o.fcol[2], cm.fhsb);
          const n21 = cm.fhsb[1];
          cm.fhsb[1] = cm.fhsb[2];
          cm.fhsb[2] = n21;
          cm.scol = "(" + cm.o.scol[0] + "," + cm.o.scol[1] + "," + cm.o.scol[2] + ")";
          cm.rplc.setText(cm.scol);
          cm.oscol = cm.scol;
          RGBtoHSB(cm.o.scol[0], cm.o.scol[1], cm.o.scol[2], cm.shsb);
          const n22 = cm.shsb[1];
          cm.shsb[1] = cm.shsb[2];
          cm.shsb[2] = n22;
          cm.bfo = 51;
          cm.mouseon = -1;
        }
        if (cm.mouses !== 1) {
          cm.mouseon = -1;
        }
        cm.rd.setColor(170, 170, 170);
        cm.rd.drawRect(20, 425, 320, 110);
        cm.rd.setColor(225, 225, 225);
        cm.rd.fillRect(141, 419, 77, 9);
        cm.rd.setColor(0, 0, 0);
        cm.rd.drawString("First Color", 151, 428);
        cm.rd.drawString("Hue:", 75, 450);
        cm.rd.drawString("Brightness:", 35, 470);
        cm.rd.drawString("Saturation:", 38, 490);
        cm.rd.drawString("RGB Value:", 38, 520);
        movefield(cm, cm.srch, 106, 504, 129, 22);
        if (cm.srch.hasFocus()) {
          cm.focuson = false;
        }
        if (!cm.srch.isShowing()) {
          cm.srch.show();
        }
        for (let n23 = 0; n23 < 200; ++n23) {
          const rgb = HSBtoRGB(fr(n23 * 0.005), 1.0, 1.0);
          cm.rd.setColor((rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff);
          cm.rd.drawLine(110 + n23, 442, 110 + n23, 449);
        }
        for (let n24 = 0; n24 < 200; ++n24) {
          const rgb = HSBtoRGB(0.0, 0.0, fr(0.2 + fr(n24 * 0.004)));
          cm.rd.setColor((rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff);
          cm.rd.drawLine(110 + n24, 462, 110 + n24, 469);
        }
        for (let n25 = 0; n25 < 200; ++n25) {
          const rgb = HSBtoRGB(cm.fhsb[0], fr(n25 * 0.005), cm.fhsb[1]);
          cm.rd.setColor((rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff);
          cm.rd.drawLine(110 + n25, 482, 110 + n25, 489);
        }
        for (let mouseon = 0; mouseon < 3; ++mouseon) {
          cm.rd.setColor(0, 0, 0);
          let n26 = fr(cm.fhsb[mouseon] * 200.0);
          if (mouseon === 1) {
            n26 = fr(fr(cm.fhsb[mouseon] - 0.2) * 250.0);
          }
          cm.rd.drawLine(trunc(fr(110.0 + n26)), 442 + mouseon * 20, trunc(fr(110.0 + n26)), 449 + mouseon * 20);
          cm.rd.drawLine(trunc(fr(111.0 + n26)), 442 + mouseon * 20, trunc(fr(111.0 + n26)), 449 + mouseon * 20);
          cm.rd.fillRect(trunc(fr(109.0 + n26)), 450 + mouseon * 20, 4, 2);
          cm.rd.drawLine(trunc(fr(108.0 + n26)), 452 + mouseon * 20, trunc(fr(113.0 + n26)), 452 + mouseon * 20);
          if (cm.xm > 107 && cm.xm < 313 && cm.ym > 439 + mouseon * 20 && cm.ym < 452 + mouseon * 20 && cm.mouses === 1 && cm.mouseon === -1) {
            cm.mouseon = mouseon;
          }
          if (cm.mouseon === mouseon) {
            if (mouseon === 1) {
              cm.fhsb[mouseon] = fr(0.2 + fr((cm.xm - 110) / 250.0));
              if (cm.fhsb[mouseon] < 0.2) {
                cm.fhsb[mouseon] = 0.2;
              }
            } else {
              cm.fhsb[mouseon] = fr((cm.xm - 110) / 200.0);
            }
            if (cm.fhsb[mouseon] > 1.0) {
              cm.fhsb[mouseon] = 1.0;
            }
            if (cm.fhsb[mouseon] < 0.0) {
              cm.fhsb[mouseon] = 0.0;
            }
          }
        }
        stringbutton(cm, " Save ", 300, 520, 0, cm.fcol !== cm.ofcol);
        cm.rd.setColor(170, 170, 170);
        cm.rd.drawRect(360, 425, 320, 110);
        cm.rd.setColor(225, 225, 225);
        cm.rd.fillRect(472, 419, 95, 9);
        cm.rd.setColor(0, 0, 0);
        cm.rd.drawString("Second Color", 482, 428);
        cm.rd.drawString("Hue:", 415, 450);
        cm.rd.drawString("Brightness:", 375, 470);
        cm.rd.drawString("Saturation:", 378, 490);
        cm.rd.drawString("RGB Value:", 378, 520);
        movefield(cm, cm.rplc, 446, 504, 129, 22);
        if (cm.rplc.hasFocus()) {
          cm.focuson = false;
        }
        if (!cm.rplc.isShowing()) {
          cm.rplc.show();
        }
        for (let n27 = 0; n27 < 200; ++n27) {
          const rgb = HSBtoRGB(fr(n27 * 0.005), 1.0, 1.0);
          cm.rd.setColor((rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff);
          cm.rd.drawLine(450 + n27, 442, 450 + n27, 449);
        }
        for (let n28 = 0; n28 < 200; ++n28) {
          const rgb = HSBtoRGB(0.0, 0.0, fr(0.2 + fr(n28 * 0.004)));
          cm.rd.setColor((rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff);
          cm.rd.drawLine(450 + n28, 462, 450 + n28, 469);
        }
        for (let n29 = 0; n29 < 200; ++n29) {
          const rgb = HSBtoRGB(cm.shsb[0], fr(n29 * 0.005), cm.shsb[2]);
          cm.rd.setColor((rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff);
          cm.rd.drawLine(450 + n29, 482, 450 + n29, 489);
        }
        for (let n30 = 0; n30 < 3; ++n30) {
          cm.rd.setColor(0, 0, 0);
          let n31 = fr(cm.shsb[n30] * 200.0);
          if (n30 === 1) {
            n31 = fr(fr(cm.shsb[n30] - 0.2) * 250.0);
          }
          cm.rd.drawLine(trunc(fr(450.0 + n31)), 442 + n30 * 20, trunc(fr(450.0 + n31)), 449 + n30 * 20);
          cm.rd.drawLine(trunc(fr(451.0 + n31)), 442 + n30 * 20, trunc(fr(451.0 + n31)), 449 + n30 * 20);
          cm.rd.fillRect(trunc(fr(449.0 + n31)), 450 + n30 * 20, 4, 2);
          cm.rd.drawLine(trunc(fr(448.0 + n31)), 452 + n30 * 20, trunc(fr(453.0 + n31)), 452 + n30 * 20);
          if (cm.xm > 447 && cm.xm < 653 && cm.ym > 439 + n30 * 20 && cm.ym < 452 + n30 * 20 && cm.mouses === 1 && cm.mouseon === -1) {
            cm.mouseon = n30 + 3;
          }
          if (cm.mouseon === n30 + 3) {
            if (n30 === 1) {
              cm.shsb[n30] = fr(0.2 + fr((cm.xm - 450) / 250.0));
              if (cm.shsb[n30] < 0.2) {
                cm.shsb[n30] = 0.2;
              }
            } else {
              cm.shsb[n30] = fr((cm.xm - 450) / 200.0);
            }
            if (cm.shsb[n30] > 1.0) {
              cm.shsb[n30] = 1.0;
            }
            if (cm.shsb[n30] < 0.0) {
              cm.shsb[n30] = 0.0;
            }
          }
        }
        stringbutton(cm, " Save ", 640, 520, 0, cm.scol !== cm.oscol);
        if (cm.fhsb[1] < 0.2) {
          cm.fhsb[1] = 0.2;
        }
        if (cm.shsb[1] < 0.2) {
          cm.shsb[1] = 0.2;
        }
        for (let n32 = 0; n32 < cm.o.npl; ++n32) {
          if (cm.o.p[n32].colnum === 1) {
            cm.o.p[n32].hsb[0] = cm.fhsb[0];
            cm.o.p[n32].hsb[1] = cm.fhsb[2];
            cm.o.p[n32].hsb[2] = cm.fhsb[1];
          }
          if (cm.o.p[n32].colnum === 2) {
            cm.o.p[n32].hsb[0] = cm.shsb[0];
            cm.o.p[n32].hsb[1] = cm.shsb[2];
            cm.o.p[n32].hsb[2] = cm.shsb[1];
          }
        }
        const rgb1 = HSBtoRGB(cm.fhsb[0], cm.fhsb[2], cm.fhsb[1]);
        const string = "(" + ((rgb1 >> 16) & 0xff) + "," + ((rgb1 >> 8) & 0xff) + "," + (rgb1 & 0xff) + ")";
        if (cm.fcol !== string) {
          cm.fcol = string;
          cm.srch.setText(cm.fcol);
        }
        const rgb2 = HSBtoRGB(cm.shsb[0], cm.shsb[2], cm.shsb[1]);
        const string2 = "(" + ((rgb2 >> 16) & 0xff) + "," + ((rgb2 >> 8) & 0xff) + "," + (rgb2 & 0xff) + ")";
        if (cm.scol !== string2) {
          cm.scol = string2;
          cm.rplc.setText(cm.scol);
        }
        if (cm.srch.getText() === cm.fcol && cm.rplc.getText() === cm.scol) {
          if (cm.bfo < 50) {
            ++cm.bfo;
          } else if (cm.bfo === 50) {
            cm.requestFocus();
            cm.bfo = 51;
          }
        } else {
          cm.bfo = 0;
          if (cm.srch.getText() !== cm.fcol) {
            cm.fcol = cm.srch.getText();
            const array13 = new Int32Array(3);
            let b3 = true;
            try {
              const index = cm.fcol.indexOf(",", 0);
              const index2 = cm.fcol.indexOf(",", index + 1);
              if (index === -1 || index2 === -1) throw new Error("Format");
              array13[0] = parseInt(cm.fcol.substring(1, index), 10);
              if (isNaN(array13[0])) throw new Error("Format");
              if (array13[0] < 0) {
                array13[0] = 0;
              }
              if (array13[0] > 255) {
                array13[0] = 255;
              }
              array13[1] = parseInt(cm.fcol.substring(index + 1, index2), 10);
              if (isNaN(array13[1])) throw new Error("Format");
              if (array13[1] < 0) {
                array13[1] = 0;
              }
              if (array13[1] > 255) {
                array13[1] = 255;
              }
              array13[2] = parseInt(cm.fcol.substring(index2 + 1, cm.fcol.length - 1), 10);
              if (isNaN(array13[2])) throw new Error("Format");
              if (array13[2] < 0) {
                array13[2] = 0;
              }
              if (array13[2] > 255) {
                array13[2] = 255;
              }
            } catch (ex2) {
              b3 = false;
            }
            if (b3) {
              RGBtoHSB(array13[0], array13[1], array13[2], cm.fhsb);
              const n33 = cm.fhsb[1];
              cm.fhsb[1] = cm.fhsb[2];
              cm.fhsb[2] = n33;
            }
          }
          if (cm.rplc.getText() !== cm.scol) {
            cm.scol = cm.rplc.getText();
            const array14 = new Int32Array(3);
            let b4 = true;
            try {
              const index3 = cm.scol.indexOf(",", 0);
              const index4 = cm.scol.indexOf(",", index3 + 1);
              if (index3 === -1 || index4 === -1) throw new Error("Format");
              array14[0] = parseInt(cm.scol.substring(1, index3), 10);
              if (isNaN(array14[0])) throw new Error("Format");
              if (array14[0] < 0) {
                array14[0] = 0;
              }
              if (array14[0] > 255) {
                array14[0] = 255;
              }
              array14[1] = parseInt(cm.scol.substring(index3 + 1, index4), 10);
              if (isNaN(array14[1])) throw new Error("Format");
              if (array14[1] < 0) {
                array14[1] = 0;
              }
              if (array14[1] > 255) {
                array14[1] = 255;
              }
              array14[2] = parseInt(cm.scol.substring(index4 + 1, cm.scol.length - 1), 10);
              if (isNaN(array14[2])) throw new Error("Format");
              if (array14[2] < 0) {
                array14[2] = 0;
              }
              if (array14[2] > 255) {
                array14[2] = 255;
              }
            } catch (ex3) {
              b4 = false;
            }
            if (b4) {
              RGBtoHSB(array14[0], array14[1], array14[2], cm.shsb);
              const n34 = cm.shsb[1];
              cm.shsb[1] = cm.shsb[2];
              cm.shsb[2] = n34;
            }
          }
        }
      }
    }
    if (cm.dtab === 2) {
      if (cm.dtabed !== cm.dtab) {
        cm.lastedo = cm.editor.getText();
        cm.scale[0] = 100;
        let index5 = cm.editor.getText().indexOf("\nScaleX(", 0);
        if (index5 !== -1) {
          ++index5;
          try {
            const endIdx = cm.editor.getText().indexOf(")", index5);
            if (endIdx === -1) throw new Error("Format");
            const val = parseInt(cm.editor.getText().substring(index5 + 7, endIdx), 10);
            if (isNaN(val)) throw new Error("Format");
            cm.scale[0] = val;
          } catch (ex4) {
            cm.scale[0] = 100;
          }
        }
        cm.oscale[0] = cm.scale[0];
        cm.scale[1] = 100;
        let index6 = cm.editor.getText().indexOf("\nScaleY(", 0);
        if (index6 !== -1) {
          ++index6;
          try {
            const endIdx = cm.editor.getText().indexOf(")", index6);
            if (endIdx === -1) throw new Error("Format");
            const val = parseInt(cm.editor.getText().substring(index6 + 7, endIdx), 10);
            if (isNaN(val)) throw new Error("Format");
            cm.scale[1] = val;
          } catch (ex5) {
            cm.scale[1] = 100;
          }
        }
        cm.oscale[1] = cm.scale[1];
        cm.scale[2] = 100;
        let index7 = cm.editor.getText().indexOf("\nScaleZ(", 0);
        if (index7 !== -1) {
          ++index7;
          try {
            const endIdx = cm.editor.getText().indexOf(")", index7);
            if (endIdx === -1) throw new Error("Format");
            const val = parseInt(cm.editor.getText().substring(index7 + 7, endIdx), 10);
            if (isNaN(val)) throw new Error("Format");
            cm.scale[2] = val;
          } catch (ex6) {
            cm.scale[2] = 100;
          }
        }
        cm.oscale[2] = cm.scale[2];
        cm.bfo = 0;
        cm.compsel = 0;
        cm.compcar.select(cm.compsel);
        cm.changed2 = false;
      }
      cm.rd.setColor(170, 170, 170);
      cm.rd.drawRect(9, 425, 270, 115);
      cm.rd.setColor(225, 225, 225);
      cm.rd.fillRect(119, 419, 51, 9);
      cm.rd.setColor(0, 0, 0);
      cm.rd.drawString("Scale", 129, 428);
      cm.rd.setColor(0, 0, 0);
      cm.rd.drawString("Scale X", 25, 450);
      stringbutton(cm, " - ", 92, 450, 4, false);
      const strX = "" + fr(cm.scale[0] / 100.0) + "";
      cm.rd.drawString(strX, i32(126 - idiv(cm.ftm.stringWidth(strX), 2)), 450);
      stringbutton(cm, " + ", 160, 450, 4, false);
      cm.rd.drawString("Scale Y", 25, 474);
      stringbutton(cm, " - ", 92, 474, 4, false);
      const strY = "" + fr(cm.scale[1] / 100.0) + "";
      cm.rd.drawString(strY, i32(126 - idiv(cm.ftm.stringWidth(strY), 2)), 474);
      stringbutton(cm, " + ", 160, 474, 4, false);
      cm.rd.drawString("Scale Z", 25, 498);
      stringbutton(cm, " - ", 92, 498, 4, false);
      const strZ = "" + fr(cm.scale[2] / 100.0) + "";
      cm.rd.drawString(strZ, i32(126 - idiv(cm.ftm.stringWidth(strZ), 2)), 498);
      stringbutton(cm, " + ", 160, 498, 4, false);
      cm.rd.drawString("Scale ALL", 25, 527);
      stringbutton(cm, " - ", 106, 527, 2, true);
      stringbutton(cm, " + ", 146, 527, 2, true);
      stringbutton(cm, "   Save   ", 230, 454, 0, cm.oscale[0] !== cm.scale[0] || cm.oscale[1] !== cm.scale[1] || cm.oscale[2] !== cm.scale[2]);
      stringbutton(cm, " Reset ", 230, 493, 0, false);
      cm.rd.drawString("Compare scale and", 296, 440);
      cm.rd.drawString("alignment with:", 308, 455);
      cm.compcar.move(288, 462);
      if (cm.compcar.hasFocus()) {
        cm.focuson = false;
        ++cm.bfo;
        if (cm.bfo === 100) {
          cm.requestFocus();
        }
      } else {
        cm.bfo = 0;
      }
      if (!cm.compcar.isShowing()) {
        cm.compcar.show();
      }
      if (cm.compsel !== cm.compcar.getSelectedIndex()) {
        cm.compsel = cm.compcar.getSelectedIndex();
        cm.requestFocus();
      }
      cm.rd.setColor(170, 170, 170);
      cm.rd.drawRect(420, 425, 270, 115);
      cm.rd.setColor(225, 225, 225);
      cm.rd.fillRect(531, 419, 47, 9);
      cm.rd.setColor(0, 0, 0);
      cm.rd.drawString("Align", 541, 428);
      cm.rd.drawString("Align in X", 433, 450);
      stringbutton(cm, " Rotate 90° ", 535, 450, 4, false);
      stringbutton(cm, "+10", 607, 450, 4, false);
      stringbutton(cm, "-10", 656, 450, 4, false);
      cm.rd.drawString("Align in Y", 433, 474);
      stringbutton(cm, " Rotate 90° ", 535, 474, 4, false);
      stringbutton(cm, "+10", 607, 474, 4, false);
      stringbutton(cm, "-10", 656, 474, 4, false);
      cm.rd.drawString("Align in Z", 433, 498);
      stringbutton(cm, " Rotate 90° ", 535, 498, 4, false);
      stringbutton(cm, "+10", 607, 498, 4, false);
      stringbutton(cm, "-10", 656, 498, 4, false);
      stringbutton(cm, " Reset ", 490, 527, 0, false);
      stringbutton(cm, "      Save      ", 607, 527, 0, cm.changed2);
    }
    if (cm.dtab === 3) {
      if (cm.dtabed !== cm.dtab) {
        let abs = 45;
        let abs2 = 45;
        let getvalue = 15;
        let getvalue2 = 15;
        let m = 76;
        let i2 = -76;
        let abs3 = 26;
        let abs4 = 26;
        let abs5 = 20;
        let abs6 = 20;
        let i3 = 18;
        let i4 = 18;
        let i5 = 10;
        let i6 = 10;
        let i7 = 0;
        let i8 = 0;
        let text = "(140,140,140)";
        let text2 = "(140,140,140)";
        let n35 = 0;
        const string3 = "" + cm.editor.getText() + "\n";
        let n36 = 0;
        let endIndex = string3.indexOf("\n", 0);
        let getvalue3 = 0;
        let getvalue4 = 15;
        let getvalue5 = 20;
        let string4 = "(140,140,140)";
        while (endIndex !== -1 && n36 < string3.length) {
          const trim = string3.substring(n36, endIndex).trim();
          n36 = endIndex + 1;
          endIndex = string3.indexOf("\n", n36);
          try {
            if (trim.startsWith("rims(")) {
              string4 = "(" + getvalue(cm, "rims", trim, 0) + "," + getvalue(cm, "rims", trim, 1) + "," + getvalue(cm, "rims", trim, 2) + ")";
              getvalue4 = getvalue(cm, "rims", trim, 3);
              getvalue5 = getvalue(cm, "rims", trim, 4);
            }
            if (trim.startsWith("gwgr(")) {
              getvalue3 = getvalue(cm, "gwgr", trim, 0);
            }
            if (!trim.startsWith("w(")) {
              continue;
            }
            const getvalue6 = getvalue(cm, "w", trim, 2);
            if (getvalue6 > 0) {
              abs = Math.abs(getvalue(cm, "w", trim, 0));
              getvalue = getvalue(cm, "w", trim, 1);
              m = getvalue6;
              abs3 = Math.abs(getvalue(cm, "w", trim, 4));
              abs5 = Math.abs(getvalue(cm, "w", trim, 5));
              text = string4;
              i3 = getvalue4;
              i5 = getvalue5;
              i7 = getvalue3;
            } else {
              abs2 = Math.abs(getvalue(cm, "w", trim, 0));
              getvalue2 = getvalue(cm, "w", trim, 1);
              i2 = getvalue6;
              abs4 = Math.abs(getvalue(cm, "w", trim, 4));
              abs6 = Math.abs(getvalue(cm, "w", trim, 5));
              text2 = string4;
              i4 = getvalue4;
              i6 = getvalue5;
              i8 = getvalue3;
            }
            ++n35;
          } catch (ex7) {}
        }
        if (n35 !== 4) {
          cm.defnow = true;
        } else {
          cm.defnow = false;
        }
        cm.wv[0].setText("" + abs2 + "");
        cm.wv[1].setText("" + getvalue2 + "");
        cm.wv[2].setText("" + i2 + "");
        cm.wv[3].setText("" + abs6 + "");
        cm.wv[4].setText("" + abs4 + "");
        cm.srch.setText(text2);
        cm.wv[5].setText("" + i4 + "");
        cm.wv[6].setText("" + i6 + "");
        cm.wv[7].setText("" + i8 + "");
        cm.wv[8].setText("" + abs + "");
        cm.wv[9].setText("" + getvalue + "");
        cm.wv[10].setText("" + m + "");
        cm.wv[11].setText("" + abs5 + "");
        cm.wv[12].setText("" + abs3 + "");
        cm.rplc.setText(text);
        cm.wv[13].setText("" + i3 + "");
        cm.wv[14].setText("" + i5 + "");
        cm.wv[15].setText("" + i7 + "");
        cm.aply1 = "" + cm.wv[0].getText() + "" + cm.wv[1].getText() + "" + cm.wv[2].getText() + "" + cm.wv[3].getText() + "" + cm.wv[4].getText() + "" + cm.srch.getText() + "" + cm.wv[5].getText() + "" + cm.wv[6].getText() + "" + cm.wv[7].getText() + "";
        cm.aply2 = "" + cm.wv[8].getText() + "" + cm.wv[9].getText() + "" + cm.wv[10].getText() + "" + cm.wv[11].getText() + "" + cm.wv[12].getText() + "" + cm.rplc.getText() + "" + cm.wv[13].getText() + "" + cm.wv[14].getText() + "" + cm.wv[15].getText() + "";
        cm.aplyd1 = false;
        cm.aplyd2 = false;
        cm.changed2 = false;
        cm.mouseon = -1;
      }
      cm.rd.setColor(0, 0, 0);
      cm.rd.drawString("BACK Wheels :", 12, 424);
      cm.rd.drawString("±X :", 12, 449);
      movefield(cm, cm.wv[0], 35, 433, 40, 22);
      cm.rd.drawString("Y :", 86, 449);
      movefield(cm, cm.wv[1], 101, 433, 40, 22);
      cm.rd.drawString("Z :", 151, 449);
      movefield(cm, cm.wv[2], 166, 433, 40, 22);
      cm.rd.drawString("Height :", 12, 479);
      movefield(cm, cm.wv[3], 56, 463, 40, 22);
      cm.rd.drawString("Width :", 107, 479);
      movefield(cm, cm.wv[4], 148, 463, 40, 22);
      cm.rd.drawString("Rims RGB Color :", 12, 509);
      movefield(cm, cm.srch, 109, 493, 129, 22);
      cm.rd.drawString("Rims Size :", 12, 539);
      movefield(cm, cm.wv[5], 76, 523, 40, 22);
      cm.rd.drawString("Rims Depth :", 126, 539);
      movefield(cm, cm.wv[6], 199, 523, 40, 22);
      if (cm.xm > 245 && cm.xm < 336 && cm.ym > 524 && cm.ym < 541) {
        cm.rd.setColor(255, 0, 0);
        cm.rd.drawLine(248, 540, 279, 540);
        cm.rd.drawLine(327, 540, 334, 540);
        if (cm.mouseon === -1) {
          cm.mouseon = 1;
          cm.setCursor(12);
        }
      } else if (cm.mouseon === 1) {
        cm.mouseon = -1;
        cm.setCursor(0);
      }
      cm.rd.drawString("Hide :                ?", 249, 539);
      movefield(cm, cm.wv[7], 282, 523, 40, 22);
      stringbutton(cm, "   Apply   ", 300, 440, 0, cm.aplyd1);
      stringbutton(cm, "   Save   ", 300, 477, 0, cm.changed2);
      cm.rd.drawString("FRONT Wheels :", 362, 424);
      cm.rd.drawString("±X :", 362, 449);
      movefield(cm, cm.wv[8], 385, 433, 40, 22);
      cm.rd.drawString("Y :", 436, 449);
      movefield(cm, cm.wv[9], 451, 433, 40, 22);
      cm.rd.drawString("Z :", 501, 449);
      movefield(cm, cm.wv[10], 516, 433, 40, 22);
      cm.rd.drawString("Height :", 362, 479);
      movefield(cm, cm.wv[11], 406, 463, 40, 22);
      cm.rd.drawString("Width :", 457, 479);
      movefield(cm, cm.wv[12], 498, 463, 40, 22);
      cm.rd.drawString("Rims RGB Color :", 362, 509);
      movefield(cm, cm.rplc, 459, 493, 129, 22);
      cm.rd.drawString("Rims Size :", 362, 539);
      movefield(cm, cm.wv[13], 426, 523, 40, 22);
      cm.rd.drawString("Rims Depth :", 476, 539);
      movefield(cm, cm.wv[14], 549, 523, 40, 22);
      if (cm.xm > 595 && cm.xm < 686 && cm.ym > 524 && cm.ym < 541) {
        cm.rd.setColor(255, 0, 0);
        cm.rd.drawLine(598, 540, 629, 540);
        cm.rd.drawLine(677, 540, 684, 540);
        if (cm.mouseon === -1) {
          cm.mouseon = 2;
          cm.setCursor(12);
        }
      } else if (cm.mouseon === 2) {
        cm.mouseon = -1;
        cm.setCursor(0);
      }
      cm.rd.drawString("Hide :                ?", 599, 539);
      movefield(cm, cm.wv[15], 632, 523, 40, 22);
      stringbutton(cm, "   Apply   ", 650, 440, 0, cm.aplyd2);
      stringbutton(cm, "   Save   ", 650, 477, 0, cm.changed2);
      if (cm.mouses === -1 && (cm.mouseon === 1 || cm.mouseon === 2)) {
        cm.showMessageDialog(null, "Use this variable to hide the car wheels inside the car if you need to (if they are getting drawn over the car when they\nshould be drawn behind it).\n\nIf you have created a car model with specific places for the wheels go inside them (inside the car), if when you place the\nwheels there they don\u2019t get drawn inside the car (they get drawn over it instead), use this variable to adjust that.\n\nYou can also use this variable to do the opposite, to make the wheels get drawn over the car if they are getting drawn\nbehind it when they shouldn\u2019t.\n\nThe Hide variable takes values from -40 to 40:\nA +ve value from 1 to 40 makes the wheels more hidden, where 40 is the maximum the car wheel can be hidden.\nA -ve value from -1 to -40 does exactly the opposite and makes the wheels more apparent (this if the car wheels appear\ninside the car when they should be outside).\nA 0 value means do nothing.\nMost of the time you will need to use this variable, it will be to enter +ve values from 1-40 for hiding the car wheels.\n\n", "Car Maker", 1);
      }
      for (let n37 = 0; n37 < 16; ++n37) {
        if (cm.wv[n37].hasFocus()) {
          cm.focuson = false;
        }
        if (!cm.wv[n37].isShowing()) {
          cm.wv[n37].show();
        }
      }
      if (cm.srch.hasFocus()) {
        cm.focuson = false;
      }
      if (!cm.srch.isShowing()) {
        cm.srch.show();
      }
      if (cm.rplc.hasFocus()) {
        cm.focuson = false;
      }
      if (!cm.rplc.isShowing()) {
        cm.rplc.show();
      }
      if (!cm.focuson) {
        if (!cm.aplyd1 && cm.aply1 !== "" + cm.wv[0].getText() + "" + cm.wv[1].getText() + "" + cm.wv[2].getText() + "" + cm.wv[3].getText() + "" + cm.wv[4].getText() + "" + cm.srch.getText() + "" + cm.wv[5].getText() + "" + cm.wv[6].getText() + "" + cm.wv[7].getText() + "") {
          cm.aplyd1 = true;
        }
        if (!cm.aplyd2 && cm.aply2 !== "" + cm.wv[8].getText() + "" + cm.wv[9].getText() + "" + cm.wv[10].getText() + "" + cm.wv[11].getText() + "" + cm.wv[12].getText() + "" + cm.rplc.getText() + "" + cm.wv[13].getText() + "" + cm.wv[14].getText() + "" + cm.wv[15].getText() + "") {
          cm.aplyd2 = true;
        }
      }
      cm.rd.setColor(170, 170, 170);
      cm.rd.drawLine(350, 410, 350, 550);
      cm.rd.drawLine(300, 409, 400, 409);
    }
    if (cm.dtab === 4) {
      if (cm.dtabed !== cm.dtab) {
        cm.changed2 = false;
        cm.statdef = false;
        const string5 = "" + cm.editor.getText() + "\n";
        let n38 = 0;
        let endIndex2 = string5.indexOf("\n", 0);
        while (endIndex2 !== -1 && n38 < string5.length) {
          const trim2 = string5.substring(n38, endIndex2).trim();
          n38 = endIndex2 + 1;
          endIndex2 = string5.indexOf("\n", n38);
          try {
            if (!trim2.startsWith("stat(")) {
              continue;
            }
            let n39 = 0;
            for (let n40 = 0; n40 < 5; ++n40) {
              cm.stat[n40] = getvalue(cm, "stat", trim2, n40);
              if (cm.stat[n40] > 200) {
                cm.stat[n40] = 200;
              }
              if (cm.stat[n40] < 16) {
                cm.stat[n40] = 16;
              }
              n39 = i32(n39 + cm.stat[n40]);
            }
            let n41 = 0;
            if (n39 > 680) {
              n41 = i32(680 - n39);
              cm.changed2 = true;
            }
            if (n39 > 640 && n39 < 680) {
              n41 = i32(640 - n39);
              cm.changed2 = true;
            }
            if (n39 > 600 && n39 < 640) {
              n41 = i32(600 - n39);
              cm.changed2 = true;
            }
            if (n39 > 560 && n39 < 600) {
              n41 = i32(560 - n39);
              cm.changed2 = true;
            }
            if (n39 > 520 && n39 < 560) {
              n41 = i32(520 - n39);
              cm.changed2 = true;
            }
            if (n39 < 520) {
              n41 = i32(520 - n39);
              cm.changed2 = true;
            }
            while (n41 !== 0) {
              for (let n42 = 0; n42 < 5; ++n42) {
                if (n41 > 0 && cm.stat[n42] < 200) {
                  const stat = cm.stat;
                  const n43 = n42;
                  stat[n43] = i32(stat[n43] + 1);
                  n41 = i32(n41 - 1);
                }
                if (n41 < 0 && cm.stat[n42] > 16) {
                  const stat2 = cm.stat;
                  const n44 = n42;
                  stat2[n44] = i32(stat2[n44] - 1);
                  n41 = i32(n41 + 1);
                }
              }
            }
            for (let n45 = 0; n45 < 5; ++n45) {
              cm.rstat[n45] = cm.stat[n45];
            }
            cm.statdef = true;
          } catch (ex8) {
            cm.statdef = false;
          }
        }
        if (cm.statdef) {
          if (cm.simcar.getItemCount() === 16) {
            cm.simcar.add(cm.rd, "   ");
          }
        } else if (cm.simcar.getItemCount() === 17) {
          cm.simcar.remove("   ");
        }
      }
      cm.rd.setColor(0, 0, 0);
      if (!cm.statdef) {
        cm.rd.setFont("Arial", 1, 13);
        cm.ftm = cm.rd.getFontMetrics();
        cm.rd.drawString("To start, please select the most similar NFM car to this car", i32(350 - idiv(cm.ftm.stringWidth("To start, please select the most similar NFM car to this car"), 2)), 450);
        cm.simcar.move(288, 460);
        if (!cm.simcar.isShowing()) {
          cm.simcar.show();
        }
        stringbutton(cm, "   OK   ", 350, 515, 0, true);
      } else {
        cm.rd.drawString("Car Class", 54, 435);
        cm.cls.move(34, 440);
        if (!cm.cls.isShowing()) {
          cm.cls.show();
        }
        let b5 = false;
        let n46 = 0;
        for (let n47 = 0; n47 < 5; ++n47) {
          n46 = i32(n46 + cm.stat[n47]);
          if (cm.stat[n47] !== cm.rstat[n47]) {
            b5 = true;
          }
        }
        if (cm.clsel !== cm.cls.getSelectedIndex()) {
          cm.clsel = cm.cls.getSelectedIndex();
          let n48 = i32(i32(i32(4 - cm.clsel) * 40 + 520) - n46);
          while (n48 !== 0) {
            for (let n49 = 0; n49 < 5; ++n49) {
              if (n48 > 0 && cm.stat[n49] < 200) {
                const stat3 = cm.stat;
                const n50 = n49;
                stat3[n50] = i32(stat3[n50] + 1);
                n48 = i32(n48 - 1);
              }
              if (n48 < 0 && cm.stat[n49] > 16) {
                const stat4 = cm.stat;
                const n51 = n49;
                stat4[n51] = i32(stat4[n51] - 1);
                n48 = i32(n48 + 1);
              }
            }
          }
        }
        if (i32(4 - idiv(i32(n46 - 520), 40)) !== cm.cls.getSelectedIndex()) {
          cm.clsel = i32(4 - idiv(i32(n46 - 520), 40));
          cm.cls.select(cm.clsel);
        }
        cm.rd.drawString("Most Similar Car", 36, 490);
        cm.simcar.move(20, 495);
        if (!cm.simcar.isShowing()) {
          cm.simcar.show();
        }
        if (cm.carsel !== cm.simcar.getSelectedIndex()) {
          cm.carsel = cm.simcar.getSelectedIndex();
          if (cm.carsel !== 16) {
            for (let n52 = 0; n52 < 5; ++n52) {
              cm.stat[n52] = cm.carstat[cm.carsel][n52];
            }
          }
          cm.requestFocus();
        }
        let n53 = 60;
        let carsel = 16;
        for (let n54 = 0; n54 < 16; ++n54) {
          let n55 = 0;
          for (let n56 = 0; n56 < 5; ++n56) {
            n55 = i32(n55 + Math.abs(i32(cm.carstat[n54][n56] - cm.stat[n56])));
          }
          if (n55 < n53) {
            carsel = n54;
            n53 = n55;
          }
        }
        if (carsel !== cm.carsel) {
          cm.carsel = carsel;
          if (cm.carsel < cm.simcar.getItemCount()) {
            cm.simcar.select(cm.carsel);
          }
        }
        cm.rd.drawString("Speed :", 196, 435);
        cm.rd.drawString("Acceleration :", 160, 459);
        cm.rd.drawString("Stunts :", 195, 483);
        cm.rd.drawString("Strength :", 183, 507);
        cm.rd.drawString("Endurance :", 171, 531);
        for (let n57 = 0; n57 < 5; ++n57) {
          for (let n58 = 0; n58 < cm.stat[n57]; ++n58) {
            const rgb = HSBtoRGB(fr(n58 * 0.0007), 1.0, 1.0);
            cm.rd.setColor((rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff);
            cm.rd.drawLine(250 + n58, 426 + n57 * 24, 250 + n58, 434 + n57 * 24);
          }
          cm.rd.setColor(0, 0, 0);
          cm.rd.drawLine(249, 426 + n57 * 24, 249, 434 + n57 * 24);
          cm.rd.drawLine(450, 426 + n57 * 24, 450, 434 + n57 * 24);
          cm.rd.drawLine(249, 435 + n57 * 24, 450, 435 + n57 * 24);
          for (let n59 = 0; n59 < 7; ++n59) {
            cm.rd.drawLine(275 + n59 * 25, 434 + n57 * 24, 275 + n59 * 25, 430 + n57 * 24);
          }
          stringbutton(cm, " - ", 480, 435 + n57 * 24, 4, false);
          stringbutton(cm, " + ", 520, 435 + n57 * 24, 4, false);
        }
        if (cm.carsel < 16 && n53 !== 0) {
          stringbutton(cm, " Reselect ", 80, 534, 4, true);
        } else {
          stringbutton(cm, " Reselect ", 80, -1000, 4, true);
        }
        stringbutton(cm, "      Save      ", 620, 459, 0, b5 || cm.changed2);
        stringbutton(cm, "   Reset   ", 620, 507, 0, false);
      }
    }
    if (cm.dtab === 5) {
      if (cm.dtabed !== cm.dtab) {
        cm.mouseon = -1;
        cm.pfase = 0;
        if (cm.o.keyz[0] <= 0 || cm.o.keyx[0] >= 0) {
          cm.pfase = -1;
        }
        if (cm.o.keyz[1] <= 0 || cm.o.keyx[1] <= 0) {
          cm.pfase = -1;
        }
        if (cm.o.keyz[2] >= 0 || cm.o.keyx[2] >= 0) {
          cm.pfase = -1;
        }
        if (cm.o.keyz[3] >= 0 || cm.o.keyx[3] <= 0) {
          cm.pfase = -1;
        }
        cm.crashok = false;
        if (random() > random()) {
          cm.crashleft = false;
        } else {
          cm.crashleft = true;
        }
        cm.engsel = 0;
        if (cm.pfase === 0) {
          const string6 = "" + cm.editor.getText() + "\n";
          let n60 = 0;
          let endIndex3 = string6.indexOf("\n", 0);
          while (endIndex3 !== -1 && n60 < string6.length) {
            const trim3 = string6.substring(n60, endIndex3).trim();
            n60 = endIndex3 + 1;
            endIndex3 = string6.indexOf("\n", n60);
            try {
              if (!trim3.startsWith("physics(")) {
                continue;
              }
              for (let n61 = 0; n61 < 11; ++n61) {
                cm.phys[n61] = getvalue(cm, "physics", trim3, n61);
                if (cm.phys[n61] > 100) {
                  cm.phys[n61] = 100;
                }
                if (cm.phys[n61] < 0) {
                  cm.phys[n61] = 0;
                }
              }
              for (let n62 = 0; n62 < 11; ++n62) {
                cm.rphys[n62] = cm.phys[n62];
              }
              for (let n63 = 0; n63 < 3; ++n63) {
                cm.crash[n63] = getvalue(cm, "physics", trim3, n63 + 11);
                if (cm.crash[n63] > 100) {
                  cm.crash[n63] = 100;
                }
                if (cm.crash[n63] < 0) {
                  cm.crash[n63] = 0;
                }
              }
              for (let n64 = 0; n64 < 3; ++n64) {
                cm.rcrash[n64] = cm.crash[n64];
              }
              cm.engsel = getvalue(cm, "physics", trim3, 14);
              if (cm.engsel > 4) {
                cm.engsel = 0;
              }
              if (cm.engsel < 0) {
                cm.engsel = 0;
              }
              cm.crashok = true;
            } catch (ex9) {
              cm.crashok = false;
            }
          }
        }
        cm.engon = false;
      }
      let mouseon2 = -1;
      if (cm.pfase === 0) {
        for (let n65 = 0; n65 < 4; ++n65) {
          cm.rd.setColor(0, 0, 0);
          if (cm.xm > cm.pnx[n65] && cm.xm < 230 && cm.ym > 433 + n65 * 24 && cm.ym < 453 + n65 * 24) {
            mouseon2 = n65;
            cm.rd.setColor(176, 64, 0);
            cm.rd.drawLine(cm.pnx[n65], 448 + n65 * 24, 128, 448 + n65 * 24);
          }
          cm.rd.drawString("" + cm.pname[n65] + " :", cm.pnx[n65], 447 + n65 * 24);
          cm.rd.drawLine(140, 443 + n65 * 24, 230, 443 + n65 * 24);
          for (let n66 = 1; n66 < 10; ++n66) {
            cm.rd.drawLine(140 + 10 * n66, 443 - n66 + n65 * 24, 140 + 10 * n66, 443 + n66 + n65 * 24);
          }
          cm.rd.setColor(255, 0, 0);
          const n67 = trunc(fr(fr(cm.phys[n65] / 1.1111) / 10.0));
          cm.rd.fillRect(i32(138 + trunc(fr(cm.phys[n65] / 1.1111))), 443 - n67 + n65 * 24, 5, n67 * 2 + 1);
          cm.rd.setColor(255, 128, 0);
          cm.rd.drawRect(i32(139 + trunc(fr(cm.phys[n65] / 1.1111))), 434 + n65 * 24, 2, 18);
          stringbutton(cm, " - ", 260, 447 + n65 * 24, 4, false);
          stringbutton(cm, " + ", 300, 447 + n65 * 24, 4, false);
        }
        cm.rd.setColor(0, 0, 0);
        cm.rd.drawString("<  Click on any variable name to learn about its function & use!", 333, 447);
        stringbutton(cm, " Random ", 380, 496, 0, false);
        stringbutton(cm, " Reset ", 455, 496, 0, false);
        stringbutton(cm, "       Next  >       ", 570, 496, 0, true);
      }
      if (cm.pfase === 1) {
        for (let n68 = 0; n68 < 4; ++n68) {
          cm.rd.setColor(0, 0, 0);
          if (cm.xm > cm.pnx[n68 + 5] && cm.xm < 211 && cm.ym > 433 + n68 * 24 && cm.ym < 453 + n68 * 24) {
            mouseon2 = n68 + 5;
            cm.rd.setColor(176, 64, 0);
            cm.rd.drawLine(cm.pnx[n68 + 5], 448 + n68 * 24, 109, 448 + n68 * 24);
          }
          cm.rd.drawString("" + cm.pname[n68 + 5] + " :", cm.pnx[n68 + 5], 447 + n68 * 24);
          cm.rd.drawLine(121, 443 + n68 * 24, 211, 443 + n68 * 24);
          for (let n69 = 1; n69 < 10; ++n69) {
            cm.rd.drawLine(121 + 10 * n69, 443 - n69 + n68 * 24, 121 + 10 * n69, 443 + n69 + n68 * 24);
          }
          cm.rd.setColor(255, 0, 0);
          const n70 = trunc(fr(fr(cm.phys[n68 + 5] / 1.1111) / 10.0));
          cm.rd.fillRect(i32(119 + trunc(fr(cm.phys[n68 + 5] / 1.1111))), 443 - n70 + n68 * 24, 5, n70 * 2 + 1);
          cm.rd.setColor(255, 128, 0);
          cm.rd.drawRect(i32(120 + trunc(fr(cm.phys[n68 + 5] / 1.1111))), 434 + n68 * 24, 2, 18);
          stringbutton(cm, " - ", 241, 447 + n68 * 24, 4, false);
          stringbutton(cm, " + ", 281, 447 + n68 * 24, 4, false);
        }
        for (let n71 = 0; n71 < 2; ++n71) {
          cm.rd.setColor(0, 0, 0);
          if (cm.xm > cm.pnx[n71 + 9] && cm.xm < 548 && cm.ym > 433 + n71 * 24 && cm.ym < 453 + n71 * 24) {
            mouseon2 = n71 + 9;
            cm.rd.setColor(176, 64, 0);
            cm.rd.drawLine(cm.pnx[n71 + 9], 448 + n71 * 24, 446, 448 + n71 * 24);
          }
          cm.rd.drawString("" + cm.pname[n71 + 9] + " :", cm.pnx[n71 + 9], 447 + n71 * 24);
          cm.rd.drawLine(458, 443 + n71 * 24, 548, 443 + n71 * 24);
          for (let n72 = 1; n72 < 10; ++n72) {
            cm.rd.drawLine(458 + 10 * n72, 443 - n72 + n71 * 24, 458 + 10 * n72, 443 + n72 + n71 * 24);
          }
          cm.rd.setColor(255, 0, 0);
          const n73 = trunc(fr(fr(cm.phys[n71 + 9] / 1.1111) / 10.0));
          cm.rd.fillRect(i32(456 + trunc(fr(cm.phys[n71 + 9] / 1.1111))), 443 - n73 + n71 * 24, 5, n73 * 2 + 1);
          cm.rd.setColor(255, 128, 0);
          cm.rd.drawRect(i32(457 + trunc(fr(cm.phys[n71 + 9] / 1.1111))), 434 + n71 * 24, 2, 18);
          stringbutton(cm, " - ", 578, 447 + n71 * 24, 4, false);
          stringbutton(cm, " + ", 618, 447 + n71 * 24, 4, false);
        }
        stringbutton(cm, " Random ", 361, 519, 0, false);
        stringbutton(cm, " Reset ", 436, 519, 0, false);
        stringbutton(cm, " <  Back ", 509, 519, 0, false);
        stringbutton(cm, "       Next  >       ", 603, 519, 0, true);
      }
      if (cm.pfase === 2) {
        if (cm.xm > 40 && cm.xm < 670 && cm.ym > 416 && cm.ym < 436) {
          mouseon2 = 11;
          cm.rd.setColor(176, 64, 0);
          cm.rd.drawLine(596, 431, 669, 431);
        }
        cm.rd.drawString("[   Crash Test,  Damage :                                       ]                                                     What is this?", 180, 430);
        if (cm.hitmag < 0) {
          cm.hitmag = 0;
        }
        if (cm.hitmag > 17000) {
          cm.crashok = true;
          cm.hitmag = 17000;
          for (let n74 = 0; n74 < cm.o.npl; ++n74) {
            if ((cm.o.p[n74].wz === 0 || cm.o.p[n74].gr === -17 || cm.o.p[n74].gr === -16) && cm.o.p[n74].embos === 0) {
              cm.o.p[n74].embos = 1;
            }
          }
        }
        cm.rd.setColor(255, trunc(fr(250.0 - fr(cm.hitmag / 68.0))), 0);
        cm.rd.fillRect(322, 423, trunc(fr(cm.hitmag / 170.0)), 7);
        cm.rd.setColor(255, 0, 0);
        cm.rd.drawRect(322, 423, 100, 7);
        if (mouseon2 !== 11) {
          cm.rd.setColor(170, 170, 170);
        } else {
          cm.rd.setColor(176, 64, 0);
        }
        cm.rd.drawString("Normal Crash", 39, 438);
        cm.rd.drawString("Roof Crash", 501, 438);
        cm.rd.drawLine(125, 426, 179, 426);
        cm.rd.drawLine(125, 426, 125, 440);
        cm.rd.drawLine(491, 426, 437, 426);
        cm.rd.drawLine(491, 426, 491, 440);
        cm.rd.drawRect(19, 440, 276, 91);
        cm.rd.drawRect(339, 440, 312, 67);
        cm.rd.setColor(0, 0, 0);
        if (cm.xm > 50 && cm.xm < 195 && cm.ym > 446 && cm.ym < 466) {
          mouseon2 = 12;
          cm.rd.setColor(176, 64, 0);
          cm.rd.drawLine(50, 461, 94, 461);
        }
        cm.rd.drawString("Radius :", 50, 460);
        cm.rd.drawLine(105, 456, 195, 456);
        for (let n75 = 1; n75 < 10; ++n75) {
          cm.rd.drawLine(105 + 10 * n75, 456 - n75, 105 + 10 * n75, 456 + n75);
        }
        cm.rd.setColor(255, 0, 0);
        const n76 = trunc(fr(fr(cm.crash[0] / 1.1111) / 10.0));
        cm.rd.fillRect(i32(103 + trunc(fr(cm.crash[0] / 1.1111))), 456 - n76, 5, n76 * 2 + 1);
        cm.rd.setColor(255, 128, 0);
        cm.rd.drawRect(i32(104 + trunc(fr(cm.crash[0] / 1.1111))), 447, 2, 18);
        stringbutton(cm, " - ", 225, 460, 4, false);
        stringbutton(cm, " + ", 265, 460, 4, false);
        cm.rd.setColor(0, 0, 0);
        if (cm.xm > 30 && cm.xm < 195 && cm.ym > 470 && cm.ym < 490) {
          mouseon2 = 13;
          cm.rd.setColor(176, 64, 0);
          cm.rd.drawLine(30, 485, 94, 485);
        }
        cm.rd.drawString("Magnitude :", 30, 484);
        cm.rd.drawLine(105, 480, 195, 480);
        for (let n77 = 1; n77 < 10; ++n77) {
          cm.rd.drawLine(105 + 10 * n77, 480 - n77, 105 + 10 * n77, 480 + n77);
        }
        cm.rd.setColor(255, 0, 0);
        const n78 = trunc(fr(fr(cm.crash[1] / 1.1111) / 10.0));
        cm.rd.fillRect(i32(103 + trunc(fr(cm.crash[1] / 1.1111))), 480 - n78, 5, n78 * 2 + 1);
        cm.rd.setColor(255, 128, 0);
        cm.rd.drawRect(i32(104 + trunc(fr(cm.crash[1] / 1.1111))), 471, 2, 18);
        stringbutton(cm, " - ", 225, 484, 4, false);
        stringbutton(cm, " + ", 265, 484, 4, false);
        cm.rd.setColor(0, 0, 0);
        if (cm.xm > 350 && cm.xm < 551 && cm.ym > 446 && cm.ym < 466) {
          mouseon2 = 14;
          cm.rd.setColor(176, 64, 0);
          cm.rd.drawLine(350, 461, 450, 461);
        }
        cm.rd.drawString("Roof Destruction :", 350, 460);
        cm.rd.drawLine(461, 456, 551, 456);
        for (let n79 = 1; n79 < 10; ++n79) {
          cm.rd.drawLine(461 + 10 * n79, 456 - n79, 461 + 10 * n79, 456 + n79);
        }
        cm.rd.setColor(255, 0, 0);
        const n80 = trunc(fr(fr(cm.crash[2] / 1.1111) / 10.0));
        cm.rd.fillRect(i32(459 + trunc(fr(cm.crash[2] / 1.1111))), 456 - n80, 5, n80 * 2 + 1);
        cm.rd.setColor(255, 128, 0);
        cm.rd.drawRect(i32(460 + trunc(fr(cm.crash[2] / 1.1111))), 447, 2, 18);
        stringbutton(cm, " - ", 581, 460, 4, false);
        stringbutton(cm, " + ", 621, 460, 4, false);
        stringbutton(cm, "    CRASH!    ", 143, 516, 0, true);
        stringbutton(cm, "  Fix  ", 235, 516, 0, false);
        stringbutton(cm, "    CRASH Roof!    ", 484, 492, 0, true);
        stringbutton(cm, "  Fix  ", 591, 492, 0, false);
        stringbutton(cm, " Reset ", 435, 535, 0, false);
        stringbutton(cm, " <  Back ", 508, 535, 0, false);
        stringbutton(cm, "       Next  >       ", 602, 535, 0, true);
      }
      if (cm.pfase === 3) {
        cm.rd.setColor(0, 0, 0);
        cm.rd.drawString("Select the most suitable engine for your car :", 30, 440);
        cm.engine.move(293, 424);
        if (!cm.engine.isShowing()) {
          cm.engine.show();
          cm.engine.select(cm.engsel);
        }
        if (cm.engsel !== cm.engine.getSelectedIndex()) {
          cm.engsel = cm.engine.getSelectedIndex();
          for (let n81 = 0; n81 < 5; ++n81) {
            for (let n82 = 0; n82 < 5; ++n82) {
              cm.engs[n82][n81].stop();
              cm.engs[n82][n81].checkopen();
            }
          }
          cm.engon = false;
        }
        if (cm.engsel === 0) {
          cm.rd.drawString("Normal Engine:  Like Tornado Shark, Sword of Justice or Radical One's engine.", 30, 470);
        }
        if (cm.engsel === 1) {
          cm.rd.drawString("V8 Engine:  High speed engine like Formula 7, Drifter X or Might Eight's engine.", 30, 470);
        }
        if (cm.engsel === 2) {
          cm.rd.drawString("Retro Engine:  Like Wow Caninaro, Lead Oxide or Kool Kat\u2019s engine.", 30, 470);
        }
        if (cm.engsel === 3) {
          cm.rd.drawString("Power Engine:  Turbo/super charged engine like Max Revenge, High Rider or Dr Monstaa\u2019s engine.", 30, 470);
        }
        if (cm.engsel === 4) {
          cm.rd.drawString("Diesel Engine:  Big diesel powered engine for big cars like EL King or  M A S H E E N .", 30, 470);
        }
        cm.rd.drawString("LISTEN :", 30, 500);
        stringbutton(cm, " Idle ", 108, 500, 0, true);
        stringbutton(cm, " RPM 1 ", 170, 500, 0, true);
        stringbutton(cm, " RPM 2 ", 240, 500, 0, true);
        stringbutton(cm, " RPM 3 ", 310, 500, 0, true);
        stringbutton(cm, " RPM MAX ", 389, 500, 0, true);
        if (cm.engon) {
          stringbutton(cm, "          Stop Engine          ", 240, 535, 0, true);
        } else {
          stringbutton(cm, "          Stop Engine          ", 240, -2500, 0, true);
        }
        stringbutton(cm, " <  Back ", 500, 525, 0, false);
        stringbutton(cm, "     Save & Finish!     ", 610, 525, 0, true);
      }
      if (cm.pfase === 4) {
        cm.rd.drawString("Testing & Setting up Physics...", 265, 470);
        cm.repaint();
        // Thread.sleep(100L);
        for (let n83 = 0; n83 < 4; ++n83) {
          let n84 = 0;
          let n85 = 4;
          if (n83 === 1) {
            n85 = 2;
          }
          if (n83 === 2) {
            n84 = 2;
          }
          for (let n86 = 0; n86 < 10; ++n86) {
            setupo(cm);
            cm.o.xy = 0;
            cm.hitmag = 0;
            let actmag = 0;
            cm.actmag = 0;
            let n87 = n84;
            let n88 = 0;
            while (cm.hitmag < 17000) {
              if (n88 !== 0) {
                regx(cm, n87, fr(trunc(150.0 + 600.0 * random())), true);
              } else {
                regz(cm, n87, fr(trunc(150.0 + 600.0 * random())), true);
              }
              if (++n87 === n85) {
                const o = cm.o;
                o.xz = i32(o.xz + 45);
                const o2 = cm.o;
                o2.zy = i32(o2.zy + 45);
                n87 = 0;
                if (n88 !== 0) {
                  n88 = 0;
                } else {
                  n88 = 1;
                }
                if (actmag === cm.actmag) {
                  const crash = cm.crash;
                  const n89 = 0;
                  crash[n89] = i32(crash[n89] + 10);
                }
                actmag = cm.actmag;
              }
            }
          }
          let n90 = 0.0;
          for (let n91 = 0; n91 < 10; ++n91) {
            setupo(cm);
            cm.o.xy = 0;
            cm.actmag = 0;
            cm.hitmag = 0;
            let n92 = n84;
            let n93 = 0;
            while (cm.hitmag < 17000) {
              if (n93 !== 0) {
                regx(cm, n92, fr(trunc(150.0 + 600.0 * random())), true);
              } else {
                regz(cm, n92, fr(trunc(150.0 + 600.0 * random())), true);
              }
              if (++n92 === n85) {
                const o3 = cm.o;
                o3.xz = i32(o3.xz + 45);
                const o4 = cm.o;
                o4.zy = i32(o4.zy + 45);
                n92 = 0;
                if (n93 !== 0) {
                  n93 = 0;
                } else {
                  n93 = 1;
                }
              }
            }
            n90 = fr(n90 + fr(cm.actmag / cm.hitmag));
          }
          cm.actmag = trunc(fr(cm.hitmag * fr(n90 / 10.0)));
          if (cm.stat[4] > 200) {
            cm.stat[4] = 200;
          }
          if (cm.stat[4] < 16) {
            cm.stat[4] = 16;
          }
          let n94 = fr(0.9 + fr((cm.stat[4] - 90) * 0.01));
          if (n94 < 0.6) {
            n94 = 0.6;
          }
          if (cm.stat[4] === 200 && cm.stat[0] <= 88) {
            n94 = 3.0;
          }
          const n95 = trunc(fr(cm.actmag * n94));
          for (let n96 = 0; n96 < 12; ++n96) {
            setupo(cm);
            cm.o.xy = 0;
            cm.o.xz = i32(90 * n96);
            if (cm.o.xz >= 360) {
              const o5 = cm.o;
              o5.xz = i32(o5.xz - 360);
            }
            cm.hitmag = 0;
            let actmag2 = 0;
            cm.actmag = 0;
            let n97 = n84;
            let n98 = 0;
            while (cm.actmag < n95) {
              if (n98 !== 0) {
                regx(cm, n97, fr(trunc(150.0 + 600.0 * random())), true);
              } else {
                regz(cm, n97, fr(trunc(150.0 + 600.0 * random())), true);
              }
              if (++n97 === n85) {
                if (n98 !== 0) {
                  n98 = 0;
                } else {
                  n98 = 1;
                }
                n97 = 0;
                if (actmag2 === cm.actmag) {
                  const crash2 = cm.crash;
                  const n99 = 0;
                  crash2[n99] = i32(crash2[n99] + 10);
                }
                actmag2 = cm.actmag;
              }
            }
          }
          if (n83 === 3) {
            let n100 = 0.0;
            for (let n101 = 0; n101 < 10; ++n101) {
              setupo(cm);
              cm.o.xy = 0;
              cm.actmag = 0;
              cm.hitmag = 0;
              let n102 = n84;
              let n103 = 0;
              while (cm.hitmag < 17000) {
                if (n103 !== 0) {
                  regx(cm, n102, fr(trunc(150.0 + 600.0 * random())), true);
                } else {
                  regz(cm, n102, fr(trunc(150.0 + 600.0 * random())), true);
                }
                if (++n102 === n85) {
                  const o6 = cm.o;
                  o6.xz = i32(o6.xz + 45);
                  const o7 = cm.o;
                  o7.zy = i32(o7.zy + 45);
                  n102 = 0;
                  if (n103 !== 0) {
                    n103 = 0;
                  } else {
                    n103 = 1;
                  }
                }
              }
              n100 = fr(n100 + fr(cm.actmag / cm.hitmag));
            }
            cm.actmag = trunc(fr(cm.hitmag * fr(n100 / 10.0)));
          }
        }
        setupo(cm);
        const string7 = "" + cm.editor.getText() + "\n";
        let str3 = "";
        let n104 = 0;
        let endIndex4 = string7.indexOf("\n", 0);
        while (endIndex4 !== -1 && n104 < string7.length) {
          const trim4 = string7.substring(n104, endIndex4).trim();
          n104 = endIndex4 + 1;
          endIndex4 = string7.indexOf("\n", n104);
          if (!trim4.startsWith("physics(")) {
            str3 = str3 + "" + trim4 + "\n";
          } else {
            str3 = str3.trim() + "\n";
          }
        }
        cm.editor.setText(str3.trim() + "\n\n\nphysics(" + cm.phys[0] + "," + cm.phys[1] + "," + cm.phys[2] + "," + cm.phys[3] + "," + cm.phys[4] + "," + cm.phys[5] + "," + cm.phys[6] + "," + cm.phys[7] + "," + cm.phys[8] + "," + cm.phys[9] + "," + cm.phys[10] + "," + cm.crash[0] + "," + cm.crash[1] + "," + cm.crash[2] + "," + cm.engsel + "," + cm.actmag + ")\n\n\n\n");
        savefile(cm);
        for (let n105 = 0; n105 < 11; ++n105) {
          cm.rphys[n105] = cm.phys[n105];
        }
        for (let n106 = 0; n106 < 3; ++n106) {
          cm.rcrash[n106] = cm.crash[n106];
        }
        cm.pfase = 5;
      }
      if (cm.pfase === 5) {
        cm.rd.drawString("Car physics has been successfully set up!", 231, 450);
        cm.rd.drawString("Test drive your car to see the results...", 242, 490);
      }
      if (mouseon2 !== -1) {
        if (cm.mouseon === -1) {
          cm.mouseon = mouseon2;
          cm.setCursor(12);
        }
      } else if (cm.mouseon !== -1) {
        cm.mouseon = -1;
        cm.setCursor(0);
      }
      if (cm.mouses === -1 && mouseon2 !== -1) {
        cm.showMessageDialog(null, cm.usage[mouseon2], "Car Maker", 1);
      }
    }
    if (cm.dtab === 6) {
      if (cm.dtab !== cm.dtabed) {
        const string8 = "" + cm.editor.getText() + "\n";
        let n107 = 0;
        let endIndex5 = string8.indexOf("\n", 0);
        while (endIndex5 !== -1 && n107 < string8.length) {
          const trim5 = string8.substring(n107, endIndex5).trim();
          n107 = endIndex5 + 1;
          endIndex5 = string8.indexOf("\n", n107);
          if (trim5.startsWith("handling(")) {
            try {
              cm.handling = getvalue(cm, "handling", trim5, 0);
              if (cm.handling > 200) {
                cm.handling = 200;
              }
              if (cm.handling < 50) {
                cm.handling = 50;
              }
            } catch (ex11) {}
          }
        }
        cm.rateh = false;
      }
      if (!cm.rateh) {
        cm.rd.setFont("Arial", 1, 13);
        cm.ftm = cm.rd.getFontMetrics();
        cm.rd.drawString("Test Drive the Car", i32(350 - idiv(cm.ftm.stringWidth("Test Drive the Car"), 2)), 445);
        cm.witho.move(292, 455);
        if (!cm.witho.isShowing()) {
          cm.witho.show();
        }
        stringbutton(cm, "     TEST DRIVE!     ", 350, 505, 0, true);
        if (cm.tested) {
          stringbutton(cm, "  Edit Stats & Class  ", 150, 471, 0, false);
          stringbutton(cm, "  Edit Physics  ", 150, 505, 0, false);
          stringbutton(cm, "     Rate Car Handling     ", 550, 471, 0, true);
        }
      } else {
        cm.rd.setFont("Arial", 1, 13);
        cm.ftm = cm.rd.getFontMetrics();
        cm.rd.drawString("Based on you test drive(s), how do your rate " + cm.carname + "'s handling?", i32(350 - idiv(cm.ftm.stringWidth("Based on your test drive(s), how do you rate " + cm.carname + "'s handling?"), 2)), 445);
        cm.rd.setFont("Arial", 1, 12);
        cm.rd.drawString("Handling :", 183, 483);
        for (let n108 = 0; n108 < cm.handling; ++n108) {
          const rgb = HSBtoRGB(fr(n108 * 0.0007), 1.0, 1.0);
          cm.rd.setColor((rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff);
          cm.rd.drawLine(250 + n108, 474, 250 + n108, 482);
        }
        cm.rd.setColor(0, 0, 0);
        cm.rd.drawLine(249, 474, 249, 482);
        cm.rd.drawLine(450, 474, 450, 482);
        cm.rd.drawLine(249, 483, 450, 483);
        for (let n109 = 0; n109 < 7; ++n109) {
          cm.rd.drawLine(275 + n109 * 25, 482, 275 + n109 * 25, 478);
        }
        stringbutton(cm, " - ", 480, 483, 4, false);
        stringbutton(cm, " + ", 520, 483, 4, false);
        stringbutton(cm, "       Save       ", 388, 525, 0, true);
        stringbutton(cm, " Cancel ", 298, 525, 0, false);
      }
    }
    if (cm.polynum >= 0 && cm.cntpls > 0) {
      for (let n110 = 0; n110 < cm.o.npl; ++n110) {
        if (n110 >= cm.polynum && n110 < cm.polynum + cm.cntpls) {
          if (cm.pflk) {
            cm.o.p[n110].hsb[2] = 1.0;
          } else {
            cm.o.p[n110].hsb[2] = 0.0;
            cm.o.p[n110].hsb[0] = fr(Math.abs(fr(0.5 - cm.o.p[n110].hsb[0])));
            while (cm.o.p[n110].hsb[0] > 1.0) {
              const hsb = cm.o.p[n110].hsb;
              const n111 = 0;
              hsb[n111] = fr(hsb[n111] - 1.0);
            }
          }
        } else if (cm.prflk > 6 && cm.prflk < 20) {
          cm.o.p[n110].gr = -13;
        } else {
          cm.o.p[n110].gr = 1;
        }
      }
      if (cm.pflk) {
        cm.pflk = false;
      } else {
        cm.pflk = true;
      }
      if (cm.prflk < 40) {
        ++cm.prflk;
      }
      cm.rd.setFont("Arial", 1, 12);
      cm.rd.setColor(0, 0, 0);
      cm.rd.drawString("[ Showing " + cm.cntpls + " Polygons Selected ]", i32(350 - idiv(cm.ftm.stringWidth("[ Showing " + cm.cntpls + " Polygons Selected ]"), 2)), 45);
      stringbutton(cm, "  Stop  ", 350, 67, 5, false);
    }
    let n2 = 50;
    if (cm.rotr) {
      const o8 = cm.o;
      o8.xz = i32(o8.xz - 5);
      n2 = 15;
    }
    if (cm.rotl) {
      const o9 = cm.o;
      o9.xz = i32(o9.xz + 5);
      n2 = 15;
    }
    if (cm.left) {
      const o10 = cm.o;
      o10.xy = i32(o10.xy - 5);
      n2 = 15;
    }
    if (cm.right) {
      const o11 = cm.o;
      o11.xy = i32(o11.xy + 5);
      n2 = 15;
    }
    if (cm.up) {
      const o12 = cm.o;
      o12.zy = i32(o12.zy - 5);
      n2 = 15;
    }
    if (cm.down) {
      const o13 = cm.o;
      o13.zy = i32(o13.zy + 5);
      n2 = 15;
    }
    if (cm.plus) {
      const o14 = cm.o;
      o14.y = i32(o14.y + 5);
      n2 = 15;
    }
    if (cm.minus) {
      const o15 = cm.o;
      o15.y = i32(o15.y - 5);
      n2 = 15;
    }
    if (cm.in) {
      const o16 = cm.o;
      o16.z = i32(o16.z + 10);
      n2 = 15;
    }
    if (cm.out) {
      const o17 = cm.o;
      o17.z = i32(o17.z - 10);
      n2 = 15;
    }
    cm.ox = cm.o.x;
    cm.oy = cm.o.y;
    cm.oz = cm.o.z;
    cm.oxz = cm.o.xz;
    cm.oxy = cm.o.xy;
    cm.ozy = cm.o.zy;
    if (cm.dtabed !== cm.dtab) {
      cm.dtabed = cm.dtab;
    }
    if (cm.dtab === 5 && cm.pfase === -1) {
      cm.repaint();
      cm.showMessageDialog(null, "Car Wheels not defined or not defined correctly.\nBefore defining the car Physics car Wheels must be defined correctly!\nPlease go to the \u2018Wheels\u2019 tab and use  [ Apply ]  and  [ Save ]  to define correctly.\n", "Car Maker", 1);
      cm.dtab = 3;
    }
  }
}
