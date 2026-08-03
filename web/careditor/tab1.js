// Transpiled from CarMaker.java lines 692-877 (chunk "tab1"), line by line.
//
// Shared state: CarMaker methods receive state object `cm` as first parameter.
// Local names kept as procyon emitted them (k, n7, n8, n9, b, b2, selectedText).
//
// External locals referenced but not declared in this range: NONE. The tab==1
// block reads and writes only fields and its own locals, so tab1 takes no
// parameter beyond `cm` and returns nothing. (`int n`, the run() loop local at
// CarMaker.java:399, is touched by tab0 only.)
//
// Methods from other chunks are imported, not looked up on `cm`:
//   movefield, stringbutton  (ui.js)      setheme (shape.js)
// The two the applet itself provides -- repaint() and the JOptionPane bridge
// showMessageDialog() -- stay on `cm`, as they do in tab0.js/files.js.
//
// No numeric helpers beyond i32: this chunk has no float arithmetic and no
// integer division. Every ++/--/+= here is int + int, so i32() is the whole
// of §1/§2b that applies. There is not one `+= (int)(` site in the range.

import { i32 } from '../java.js';
import { Font } from '../Smenu.js';
import { movefield, stringbutton } from './ui.js';
import { setheme } from './shape.js';

/**
 * tab1(cm) — the "code editor" pane of CarMaker.run().
 *
 * Corresponds to the `if (this.tab == 1)` block at CarMaker.java:692-877:
 * the code pane itself, the font/theme preferences strip, the polygon
 * counter, and the find/replace vs mirror/show-selection footer.
 */
export function tab1(cm) {
  if (cm.tab === 1) {
    if (cm.tabed !== cm.tab) {
      cm.srch.setText("");
      cm.rplc.setText("");
      cm.cntchk = 1;
      cm.npolys = 0;
      cm.prefs = false;
    }
    movefield(cm, cm.editor, 5, 30, 690, 400);
    if (!cm.openm) {
      if (!cm.editor.isShowing()) {
        cm.editor.show();
        cm.editor.requestFocus();
      }
    }
    else if (cm.editor.isShowing()) {
      cm.editor.hide();
    }
    cm.rd.setFont("Arial", 1, 12);
    if (cm.prefs) {
      cm.rd.drawString("Code Font:", 10, 446);
      cm.fontsel.move(76, 430);
      if (!cm.fontsel.isShowing()) {
        cm.fontsel.show();
        cm.fontsel.select(cm.cfont);
      }
      if (cm.cfont !== cm.fontsel.getSelectedItem()) {
        cm.cntprf = 0;
        cm.cfont = cm.fontsel.getSelectedItem();
        cm.editor.setFont(new Font(cm.cfont, 1, 14));
        cm.srch.setFont(new Font(cm.cfont, 1, 14));
        cm.rplc.setFont(new Font(cm.cfont, 1, 14));
        for (let k = 0; k < 16; ++k) {
          cm.wv[k].setFont(new Font(cm.cfont, 1, 14));
        }
        cm.editor.requestFocus();
      }
      cm.rd.drawString("Code Theme:", 190, 446);
      cm.ctheme.move(271, 430);
      if (!cm.ctheme.isShowing()) {
        cm.ctheme.show();
        cm.ctheme.select(cm.cthm);
      }
      if (cm.cthm !== cm.ctheme.getSelectedIndex()) {
        cm.cntprf = 0;
        cm.cthm = cm.ctheme.getSelectedIndex();
        setheme(cm);
        cm.editor.requestFocus();
      }
      stringbutton(cm, "<", 400, 446, 3, false);
      cm.cntprf = i32(cm.cntprf + 1);
      if (cm.cntprf === 200) {
        cm.prefs = false;
      }
    }
    else {
      stringbutton(cm, "Preferences", 52, 446, 3, false);
      if (cm.ctheme.isShowing()) {
        cm.ctheme.hide();
      }
      if (cm.fontsel.isShowing()) {
        cm.fontsel.hide();
      }
      if (cm.cntprf !== 0) {
        cm.cntprf = 0;
      }
      if (cm.cntchk === 0) {
        cm.npolys = 0;
        let n7 = 0;
        let n8 = 0;
        while (n7 !== -1 && cm.mouses !== 1) {
          if (n8 === 0) {
            n7 = cm.editor.getText().indexOf("<p>", n7);
          }
          else {
            n7 = cm.editor.getText().indexOf("</p>", n7);
          }
          if (n7 !== -1) {
            if (n8 === 0) {
              n8 = 1;
            }
            else {
              n8 = 0;
              cm.npolys = i32(cm.npolys + 1);
            }
            n7 = i32(n7 + 3);
          }
        }
        if (cm.mouses === 1) {
          cm.npolys = 0;
        }
        cm.cntchk = 30;
      }
      else {
        cm.cntchk = i32(cm.cntchk - 1);
      }
      if (cm.npolys > 210) {
        cm.rd.setColor(255, 0, 0);
      }
      if (cm.npolys !== 0) {
        cm.rd.drawString("Number of Polygons :  " + cm.npolys + " / 210", 200, 446);
      }
    }
    if (!cm.changed && cm.editor.getText() !== cm.lastedo) {
      cm.changed = true;
    }
    stringbutton(cm, "  Save  ", 490, 455, 0, cm.changed);
    stringbutton(cm, "  Save & Preview  >  ", 600, 455, 0, cm.changed);
    cm.mirror = false;
    cm.polynum = -1;
    cm.cntpls = 0;
    let selectedText = "";
    try {
      selectedText = cm.editor.getSelectedText();
    }
    catch (ex) {}
    if (selectedText !== "") {
      let n9 = selectedText.indexOf("<p>", 0);
      while (n9 !== -1 && i32(n9 + 1) < selectedText.length) {
        if (!cm.mirror) {
          n9 = selectedText.indexOf("</p>", i32(n9 + 1));
          if (n9 !== -1) {
            cm.mirror = true;
            cm.cntpls = i32(cm.cntpls + 1);
          }
        }
        if (cm.mirror) {
          n9 = selectedText.indexOf("<p>", i32(n9 + 1));
          if (n9 === -1) {
            continue;
          }
          cm.mirror = false;
        }
      }
    }
    if (!cm.mirror) {
      cm.rd.setColor(170, 170, 170);
      cm.rd.drawRect(5, 474, 494, 70);
      cm.rd.setColor(0, 0, 0);
      cm.rd.drawString("Text to find:", 18, 500);
      movefield(cm, cm.srch, 91, 484, 129, 22);
      if (!cm.srch.isShowing()) {
        cm.srch.show();
      }
      let b = false;
      if (cm.srch.getText() !== "") {
        b = true;
      }
      stringbutton(cm, " Find ", 117, 526, 2, b);
      cm.rd.drawString("Replace with:", 255, 500);
      movefield(cm, cm.rplc, 338, 484, 129, 22);
      if (!cm.rplc.isShowing()) {
        cm.rplc.show();
      }
      let b2 = false;
      if (cm.srch.getText() !== "" && cm.rplc.getText() !== "") {
        b2 = true;
      }
      stringbutton(cm, " Replace ", 376, 526, 2, b2);
    }
    else {
      if (cm.srch.isShowing()) {
        cm.srch.hide();
      }
      if (cm.rplc.isShowing()) {
        cm.rplc.hide();
      }
      cm.rd.setColor(170, 170, 170);
      cm.rd.drawRect(5, 474, 450, 70);
      cm.rd.setColor(0, 0, 0);
      cm.rd.drawString("Mirror [Selected] polygon(s) along:", 18, 490);
      stringbutton(cm, " Mirro Along X Axis ", 90, 525, 2, true);
      stringbutton(cm, " Mirro Along Y Axis ", 230, 525, 2, false);
      stringbutton(cm, " Mirro Along Z Axis ", 370, 525, 2, false);
      cm.rd.setColor(170, 170, 170);
      cm.rd.drawRect(465, 474, 230, 70);
      cm.rd.setColor(0, 0, 0);
      cm.rd.drawString("Show [Selected] polygon(s):", 478, 490);
      stringbutton(cm, " Show in 3D  > ", 580, 523, 0, true);
    }
    if (cm.npolys > 210 && !cm.tomany) {
      cm.repaint();
      cm.showMessageDialog(null, "Maximum number of polygons (pieces) allowed has been exceeded!\nThe maximum allowed is 210 polygons, please decrease.\n", "Car Maker", 1);
      cm.tomany = true;
    }
  }
}
