// Transpiled from CarMaker.java lines 430-691 (chunk "tab0"), line by line.
//
// Shared state: CarMaker methods receive state object `cm` as first parameter.
// Local names kept as procyon emitted them (n, n3, n4, n5, n6, list, str, str2).
//
// External local referenced but not declared here:
//   n  (int, declared CarMaker.java:399) — passed as parameter, returned.
//
// Methods from other chunks are imported, not looked up on `cm`. Only the two
// the applet itself provides -- setCursor and requestFocus -- stay on `cm`,
// because the shell supplies those.
//
// IO seam: new File("" + Madness.fpath + "mycars/").list() is dropped and
//   replaced by cm.mycarslist — a String[] the shell pre-populates before
//   each call (carstore.listAll() result, synchronous snapshot).
//   // TODO not ported: filesystem listing via new File(...).list()
//
//   The Java's `this.loadfile()` then reads mycars/<carname>.rad off disk.
//   Storage is async and a frame is not, so the shell keeps a synchronous
//   snapshot too: `cm.carsrc(name)` returns the .rad text it already holds.
//   That is the same seam CarDefine.loadcar uses (web/CarDefine.js:713) --
//   text in, no IO inside the transpiled code.
//
// No float arithmetic here and nothing wide enough to overflow int32 -- but
// there IS int division: `stringWidth(s) / 2` truncates in Java, and the first
// pass wrote it as JS `/`, which is half a pixel off on every odd-width label.
// 13 sites, all idiv() now.

import { idiv } from '../java.js';
import { movefield, stringbutton, openlink, openhlink, openelink } from './ui.js';
import { loadfile, fixtext } from './files.js';

/**
 * tab0(cm, n) — the "car file management" pane of CarMaker.run().
 *
 * Corresponds to the `if (this.tab == 0)` block at CarMaker.java:430-691.
 * `n` is the run() loop's tutorial-shown flag (int, declared at line 399).
 * Returns the (possibly updated) value of n.
 */
export function tab0(cm, n) {
  if (cm.tab === 0) {
    if (cm.tabed !== cm.tab) {
      cm.slcar.removeAll();
      cm.slcar.maxl = 200;
      cm.slcar.add(cm.rd, "Select a Car                      ");
      // TODO not ported: new File("" + Madness.fpath + "mycars/").list()
      //   In the browser, cm.mycarslist is a pre-populated String[] from carstore.
      const list = cm.mycarslist;
      if (list !== null) {
        for (let j = 0; j < list.length; ++j) {
          if (list[j].toLowerCase().endsWith(".rad")) {
            cm.slcar.add(cm.rd, list[j].substring(0, list[j].length - 4));
          }
        }
      }
      if (cm.carname === "") {
        cm.slcar.select(0);
      }
      else {
        cm.slcar.select(cm.carname);
        if (cm.carname === cm.slcar.getSelectedItem()) {
          loadfile(cm, cm.carsrc(cm.carname));
        }
      }
      cm.mouseon = -1;
      cm.srch.setText("");
      cm.sfase = 0;
    }
    cm.rd.setFont("Arial", 1, 13);
    cm.rd.setColor(0, 0, 0);
    cm.rd.drawImage(cm.logo, 214, 35);
    if (cm.xm > 214 && cm.xm < 485 && cm.ym > 25 && cm.ym < 104 && !cm.openm) {
      if (cm.mouseon === -1) {
        cm.mouseon = 3;
        cm.setCursor(12);
      }
    }
    else if (cm.mouseon === 3) {
      cm.mouseon = -1;
      cm.setCursor(0);
    }
    if (cm.mouseon === 3 && cm.mouses === -1) {
      openhlink(cm);
    }
    let n3 = 30;
    let n4 = 0;
    if (cm.tutok) {
      n3 = 250;
      n4 = -70;
    }
    if (cm.xm > 76 && cm.xm < 624 && cm.ym > 84 + n3 && cm.ym < 167 + n3 && !cm.openm) {
      if (cm.mouseon === -1) {
        cm.mouseon = 1;
        cm.setCursor(12);
      }
    }
    else if (cm.mouseon === 1) {
      cm.mouseon = -1;
      cm.setCursor(0);
    }
    let n5 = 0;
    if (!cm.tutok && cm.mouseon !== 1 && n === 0) {
      if (cm.flk <= 0) {
        cm.rd.setColor(255, 0, 0);
        --cm.flk;
        if (cm.flk === -2) {
          cm.flk = 1;
        }
      }
      else {
        cm.rd.setColor(0, 0, 255);
        n5 = 2;
        ++cm.flk;
        if (cm.flk === 3) {
          cm.flk = 0;
        }
      }
    }
    cm.rd.drawLine(76 + n5, 84 + n3, 76 + n5, 167 + n3);
    cm.rd.drawLine(76 + n5, 84 + n3, 95 + n5, 84 + n3);
    cm.rd.drawLine(76 + n5, 167 + n3, 95 + n5, 167 + n3);
    cm.rd.drawLine(624 - n5, 84 + n3, 624 - n5, 167 + n3);
    cm.rd.drawLine(624 - n5, 84 + n3, 605 - n5, 84 + n3);
    cm.rd.drawLine(624 - n5, 167 + n3, 605 - n5, 167 + n3);
    if (cm.mouseon === 1) {
      cm.rd.setColor(0, 64, 128);
    }
    else {
      cm.rd.setColor(0, 0, 0);
    }
    cm.rd.drawString("If this is your first time creating a car please follow the tutorial found at:", 106, 110 + n3);
    cm.rd.setColor(0, 128, 255);
    cm.rd.drawString("http://www.needformadness.com/developer/simplecar.html", 106, 130 + n3);
    if (cm.mouseon === 1) {
      cm.rd.setColor(0, 128, 255);
    }
    else {
      cm.rd.setColor(0, 64, 128);
    }
    cm.rd.drawLine(106, 131 + n3, 480, 131 + n3);
    if (cm.mouseon === 1) {
      cm.rd.setColor(0, 64, 128);
    }
    else {
      cm.rd.setColor(0, 0, 0);
    }
    cm.rd.drawString("It is highly recommended that you follow this tutorial before trying anything!", 106, 150 + n3);
    if (cm.mouseon === 1 && cm.mouses === -1) {
      openlink(cm);
      n = 1;
    }
    if (cm.xm > 200 && cm.xm < 500 && cm.ym > 467 && cm.ym < 504 && !cm.openm) {
      if (cm.mouseon === -1) {
        cm.mouseon = 2;
        cm.setCursor(12);
      }
    }
    else if (cm.mouseon === 2) {
      cm.mouseon = -1;
      cm.setCursor(0);
    }
    cm.ftm = cm.rd.getFontMetrics();
    if (cm.mouseon === 2) {
      cm.rd.setColor(0, 64, 128);
    }
    else {
      cm.rd.setColor(0, 0, 0);
    }
    cm.rd.drawString("For the Car Maker Homepage, Development Center and Forums :", 350 - idiv(cm.ftm.stringWidth("For the Car Maker Homepage, Development Center and Forums :"), 2), 480);
    cm.rd.setColor(0, 128, 255);
    const str = "http://www.needformadness.com/developer/";
    cm.rd.drawString(str, 350 - idiv(cm.ftm.stringWidth(str), 2), 500);
    if (cm.mouseon === 2) {
      cm.rd.setColor(0, 128, 255);
    }
    else {
      cm.rd.setColor(0, 64, 128);
    }
    cm.rd.drawLine(350 - idiv(cm.ftm.stringWidth(str), 2), 501, 350 + idiv(cm.ftm.stringWidth(str), 2), 501);
    if (cm.mouseon === 2 && cm.mouses === -1) {
      openhlink(cm);
    }
    let n6 = 0;
    if (cm.sfase === 3) {
      n6 = 100;
    }
    cm.rd.setColor(0, 0, 0);
    cm.rd.drawRect(177 - n6, 202 + n4, 346 + n6 * 2, 167 + n6 / 5);
    if (cm.sfase === 0) {
      cm.rd.drawString("Select Car to Edit", 350 - idiv(cm.ftm.stringWidth("Select Car to Edit"), 2), 230 + n4);
      cm.slcar.move(250, 240 + n4);
      if (cm.slcar.getWidth() !== 200) {
        cm.slcar.setSize(200, 21);
      }
      if (!cm.slcar.isShowing()) {
        cm.slcar.show();
      }
      stringbutton(cm, "    Make new Car    ", 430, 296 + n4, 0, true);
      stringbutton(cm, "     Rename Car     ", 270, 296 + n4, 0, false);
      stringbutton(cm, "      Delete Car      ", 270, 336 + n4, 0, false);
      stringbutton(cm, "     Import & Export     ", 430, 336 + n4, 0, false);
      if (cm.slcar.getSelectedIndex() !== 0) {
        if (cm.carname !== cm.slcar.getSelectedItem()) {
          cm.tomany = false;
          cm.carname = cm.slcar.getSelectedItem();
          loadfile(cm, cm.carsrc(cm.carname));
          cm.editor.select(0, 0);
          cm.tested = false;
          cm.requestFocus();
        }
      }
      else {
        cm.carname = "";
      }
    }
    if (cm.sfase === 1) {
      cm.rd.drawString("Make a new Car", 350 - idiv(cm.ftm.stringWidth("Make a new Car"), 2), 230 + n4);
      cm.rd.setFont("Arial", 1, 12);
      cm.rd.drawString("New car name :", 228, 266 + n4);
      movefield(cm, cm.srch, 335, 250 + n4, 129, 22);
      if (!cm.srch.isShowing()) {
        cm.srch.show();
        cm.srch.requestFocus();
      }
      fixtext(cm.srch);
      stringbutton(cm, "    Make Car    ", 350, 306 + n4, 0, true);
      stringbutton(cm, "  Cancel  ", 350, 346 + n4, 0, false);
    }
    if (cm.sfase === 2) {
      cm.rd.drawString("Rename Car :  " + cm.carname + "", 350 - idiv(cm.ftm.stringWidth("Rename Car :  " + cm.carname + ""), 2), 230 + n4);
      cm.rd.setFont("Arial", 1, 12);
      cm.rd.drawString("New name :", 239, 266 + n4);
      movefield(cm, cm.srch, 316, 250 + n4, 129, 22);
      if (!cm.srch.isShowing()) {
        cm.srch.show();
        cm.srch.requestFocus();
      }
      fixtext(cm.srch);
      stringbutton(cm, "   Rename Car   ", 350, 306 + n4, 0, true);
      stringbutton(cm, "  Cancel  ", 350, 346 + n4, 0, false);
    }
    if (cm.sfase === 3) {
      cm.rd.drawString("Import a Wavefront OBJ 3D Model", 350 - idiv(cm.ftm.stringWidth("Import a Wavefront OBJ 3D Model"), 2), 230 + n4);
      if (cm.xm > 116 && cm.xm < 584 && cm.ym > 246 + n4 && cm.ym < 290 + n4) {
        if (cm.mouseon === -1) {
          cm.mouseon = 3;
          cm.setCursor(12);
        }
      }
      else if (cm.mouseon === 3) {
        cm.mouseon = -1;
        cm.setCursor(0);
      }
      cm.ftm = cm.rd.getFontMetrics();
      if (cm.mouseon === 3) {
        cm.rd.setColor(0, 64, 128);
      }
      else {
        cm.rd.setColor(0, 0, 0);
      }
      cm.rd.drawString("Please read the important information about importing cars found at:", 350 - idiv(cm.ftm.stringWidth("Please read the important information about importing cars, found here :"), 2), 260 + n4);
      cm.rd.setColor(0, 128, 255);
      const str2 = "http://www.needformadness.com/developer/extras.html";
      cm.rd.drawString(str2, 350 - idiv(cm.ftm.stringWidth(str2), 2), 280 + n4);
      if (cm.mouseon === 3) {
        cm.rd.setColor(0, 128, 255);
      }
      else {
        cm.rd.setColor(0, 64, 128);
      }
      cm.rd.drawLine(350 - idiv(cm.ftm.stringWidth(str2), 2), 281 + n4, 350 + idiv(cm.ftm.stringWidth(str2), 2), 281 + n4);
      if (cm.mouseon === 3 && cm.mouses === -1) {
        openelink(cm);
      }
      stringbutton(cm, "     Import Car     ", 350, 326 + n4, 0, true);
      stringbutton(cm, "  Export >  ", 550, 326 + n4, 0, false);
      stringbutton(cm, "  Cancel  ", 350, 366 + n4, 0, false);
    }
    if (cm.sfase === 4) {
      cm.rd.drawString("Select Car to Export", 350 - idiv(cm.ftm.stringWidth("Select Car to Export"), 2), 230 + n4);
      cm.slcar.move(250, 240 + n4);
      if (cm.slcar.getWidth() !== 200) {
        cm.slcar.setSize(200, 21);
      }
      if (!cm.slcar.isShowing()) {
        cm.slcar.show();
      }
      stringbutton(cm, "     Export Car     ", 350, 306 + n4, 0, true);
      stringbutton(cm, "  Cancel  ", 350, 346 + n4, 0, false);
      if (cm.slcar.getSelectedIndex() !== 0) {
        if (cm.carname !== cm.slcar.getSelectedItem()) {
          cm.tomany = false;
          cm.carname = cm.slcar.getSelectedItem();
          loadfile(cm, cm.carsrc(cm.carname));
          cm.editor.select(0, 0);
          cm.tested = false;
          cm.requestFocus();
        }
      }
      else {
        cm.carname = "";
      }
    }
  }
  return n;
}
