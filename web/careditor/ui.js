// Transpiled from java-src/CarMaker.java lines 5158-5232, 5645-5795 (chunk "ui") verbatim.
// UI/widget helper methods: hidefields, movefield, drawms, openlink, openhlink, stringbutton, ovbutton.

import { idiv, i32, trunc, fr } from '../java.js';
import { Madness } from '../Madness.js';

export function hidefields(cm) {
  if (cm.pubtyp) cm.pubtyp.hide();
  if (cm.pubitem) cm.pubitem.hide();
  if (cm.tpass) cm.tpass.hide();
  if (cm.tnick) cm.tnick.hide();
  if (cm.slcar) cm.slcar.hide();
  if (cm.witho) cm.witho.hide();
  if (cm.wv) {
    for (let i = 0; i < 16; ++i) {
      if (cm.wv[i]) cm.wv[i].hide();
    }
  }
  if (cm.simcar) cm.simcar.hide();
  if (cm.engine) cm.engine.hide();
  if (cm.cls) cm.cls.hide();
  if (cm.compcar) cm.compcar.hide();
  if (cm.editor) cm.editor.hide();
  if (cm.fontsel) cm.fontsel.hide();
  if (cm.ctheme) cm.ctheme.hide();
  if (cm.srch) cm.srch.hide();
  if (cm.rplc) cm.rplc.hide();
}

export function movefield(cm, component, x, y, width, height) {
  x = i32(x + cm.apx);
  y = i32(y + cm.apy);
  if (component.getX() !== x || component.getY() !== y || component.getWidth() !== width || component.getHeight() !== height) {
    component.setBounds(x, y, width, height);
  }
}

export function drawms(cm) {
  cm.openm = false;
  if (cm.pubtyp && cm.pubtyp.draw(cm.rd, cm.xm, cm.ym, cm.mousdr, 550, false)) {
    cm.openm = true;
  }
  if (cm.pubitem && cm.pubitem.draw(cm.rd, cm.xm, cm.ym, cm.mousdr, 550, false)) {
    cm.openm = true;
  }
  if (cm.fontsel && cm.fontsel.draw(cm.rd, cm.xm, cm.ym, cm.mousdr, 550, true)) {
    cm.openm = true;
  }
  if (cm.ctheme && cm.ctheme.draw(cm.rd, cm.xm, cm.ym, cm.mousdr, 550, true)) {
    cm.openm = true;
  }
  if (cm.compcar && cm.compcar.draw(cm.rd, cm.xm, cm.ym, cm.mousdr, 550, true)) {
    cm.openm = true;
  }
  if (cm.cls && cm.cls.draw(cm.rd, cm.xm, cm.ym, cm.mousdr, 550, true)) {
    cm.openm = true;
  }
  if (cm.simcar && cm.simcar.draw(cm.rd, cm.xm, cm.ym, cm.mousdr, 550, true)) {
    cm.openm = true;
  }
  if (cm.engine && cm.engine.draw(cm.rd, cm.xm, cm.ym, cm.mousdr, 550, false)) {
    cm.openm = true;
  }
  if (cm.witho && cm.witho.draw(cm.rd, cm.xm, cm.ym, cm.mousdr, 550, true)) {
    cm.openm = true;
  }
  if (cm.slcar && cm.slcar.draw(cm.rd, cm.xm, cm.ym, cm.mousdr, 550, false)) {
    cm.openm = true;
  }
  if (cm.openm) {
    cm.waso = true;
    cm.mouses = 0;
  }
}

export function openlink(cm) {
  cm.openurl("http://www.needformadness.com/developer/simplecar.html");
}

export function openhlink(cm) {
  cm.openurl("http://www.needformadness.com/developer/");
}

export function stringbutton(cm, str, n, n2, n3, b) {
  cm.rd.setFont({ name: "Arial", style: 1, size: 12 });
  {
    cm.ftm = cm.rd.getFontMetrics();
  }
  if (str.indexOf("Publish") !== -1) {
    cm.rd.setFont({ name: "Arial", style: 1, size: 13 });
    {
      cm.ftm = cm.rd.getFontMetrics();
    }
  }
  cm.bx[cm.btn] = n;
  cm.by[cm.btn] = i32(n2 - 5);
  cm.bw[cm.btn] = cm.ftm.stringWidth(str);
  const bwDiv2 = idiv(cm.bw[cm.btn], 2);

  if (!cm.pessd[cm.btn]) {
    cm.rd.setColor(220, 220, 220);
    if (b) {
      cm.rd.setColor(230, 230, 230);
    }
    cm.rd.fillRect(i32(i32(n - bwDiv2) - 10), i32(n2 - i32(17 - n3)), i32(cm.bw[cm.btn] + 20), i32(25 - i32(n3 * 2)));
    cm.rd.setColor(240, 240, 240);
    if (b) {
      cm.rd.setColor(255, 255, 255);
    }
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 10), i32(n2 - i32(17 - n3)), i32(i32(n + bwDiv2) + 10), i32(n2 - i32(17 - n3)));
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 10), i32(n2 - i32(18 - n3)), i32(i32(n + bwDiv2) + 10), i32(n2 - i32(18 - n3)));
    cm.rd.setColor(240, 240, 240);
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 9), i32(n2 - i32(19 - n3)), i32(i32(n + bwDiv2) + 9), i32(n2 - i32(19 - n3)));
    cm.rd.setColor(200, 200, 200);
    if (b) {
      cm.rd.setColor(192, 192, 192);
    }
    cm.rd.drawLine(i32(i32(n + bwDiv2) + 10), i32(n2 - i32(17 - n3)), i32(i32(n + bwDiv2) + 10), i32(n2 + i32(7 - n3)));
    cm.rd.drawLine(i32(i32(n + bwDiv2) + 11), i32(n2 - i32(17 - n3)), i32(i32(n + bwDiv2) + 11), i32(n2 + i32(7 - n3)));
    cm.rd.setColor(200, 200, 200);
    cm.rd.drawLine(i32(i32(n + bwDiv2) + 12), i32(n2 - i32(16 - n3)), i32(i32(n + bwDiv2) + 12), i32(n2 + i32(6 - n3)));
    if (b) {
      cm.rd.setColor(192, 192, 192);
    }
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 10), i32(n2 + i32(7 - n3)), i32(i32(n + bwDiv2) + 10), i32(n2 + i32(7 - n3)));
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 10), i32(n2 + i32(8 - n3)), i32(i32(n + bwDiv2) + 10), i32(n2 + i32(8 - n3)));
    cm.rd.setColor(200, 200, 200);
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 9), i32(n2 + i32(9 - n3)), i32(i32(n + bwDiv2) + 9), i32(n2 + i32(9 - n3)));
    cm.rd.setColor(240, 240, 240);
    if (b) {
      cm.rd.setColor(255, 255, 255);
    }
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 10), i32(n2 - i32(17 - n3)), i32(i32(n - bwDiv2) - 10), i32(n2 + i32(7 - n3)));
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 11), i32(n2 - i32(17 - n3)), i32(i32(n - bwDiv2) - 11), i32(n2 + i32(7 - n3)));
    cm.rd.setColor(240, 240, 240);
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 12), i32(n2 - i32(16 - n3)), i32(i32(n - bwDiv2) - 12), i32(n2 + i32(6 - n3)));
    cm.rd.setColor(0, 0, 0);
    cm.rd.drawString(str, i32(n - bwDiv2), n2);
  } else {
    cm.rd.setColor(220, 220, 220);
    cm.rd.fillRect(i32(i32(n - bwDiv2) - 10), i32(n2 - i32(17 - n3)), i32(cm.bw[cm.btn] + 20), i32(25 - i32(n3 * 2)));
    cm.rd.setColor(192, 192, 192);
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 10), i32(n2 - i32(17 - n3)), i32(i32(n + bwDiv2) + 10), i32(n2 - i32(17 - n3)));
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 10), i32(n2 - i32(18 - n3)), i32(i32(n + bwDiv2) + 10), i32(n2 - i32(18 - n3)));
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 9), i32(n2 - i32(19 - n3)), i32(i32(n + bwDiv2) + 9), i32(n2 - i32(19 - n3)));
    cm.rd.setColor(247, 247, 247);
    cm.rd.drawLine(i32(i32(n + bwDiv2) + 10), i32(n2 - i32(17 - n3)), i32(i32(n + bwDiv2) + 10), i32(n2 + i32(7 - n3)));
    cm.rd.drawLine(i32(i32(n + bwDiv2) + 11), i32(n2 - i32(17 - n3)), i32(i32(n + bwDiv2) + 11), i32(n2 + i32(7 - n3)));
    cm.rd.drawLine(i32(i32(n + bwDiv2) + 12), i32(n2 - i32(16 - n3)), i32(i32(n + bwDiv2) + 12), i32(n2 + i32(6 - n3)));
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 10), i32(n2 + i32(7 - n3)), i32(i32(n + bwDiv2) + 10), i32(n2 + i32(7 - n3)));
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 10), i32(n2 + i32(8 - n3)), i32(i32(n + bwDiv2) + 10), i32(n2 + i32(8 - n3)));
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 9), i32(n2 + i32(9 - n3)), i32(i32(n + bwDiv2) + 9), i32(n2 + i32(9 - n3)));
    cm.rd.setColor(192, 192, 192);
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 10), i32(n2 - i32(17 - n3)), i32(i32(n - bwDiv2) - 10), i32(n2 + i32(7 - n3)));
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 11), i32(n2 - i32(17 - n3)), i32(i32(n - bwDiv2) - 11), i32(n2 + i32(7 - n3)));
    cm.rd.drawLine(i32(i32(n - bwDiv2) - 12), i32(n2 - i32(16 - n3)), i32(i32(n - bwDiv2) - 12), i32(n2 + i32(6 - n3)));
    cm.rd.setColor(0, 0, 0);
    cm.rd.drawString(str, i32(i32(n - bwDiv2) + 1), i32(n2 + 1));
  }
  cm.btn = i32(cm.btn + 1);
}

export function ovbutton(cm, str, n, n2) {
  cm.rd.setFont({ name: "Arial", style: 0, size: 12 });
  {
    cm.ftm = cm.rd.getFontMetrics();
  }
  if (str === "X" || str === "Download") {
    cm.rd.setFont({ name: "Arial", style: 1, size: 12 });
    {
      cm.ftm = cm.rd.getFontMetrics();
    }
  }
  const stringWidth = cm.ftm.stringWidth(str);
  const n3 = 4;
  let b = false;
  const stringWidthDiv2 = idiv(stringWidth, 2);
  const b2 = Math.abs(i32(cm.xm - n)) < i32(stringWidthDiv2 + 12) && Math.abs(i32(i32(cm.ym - n2) + 5)) < 10 && cm.mouses === 1;
  if (Math.abs(i32(cm.xm - n)) < i32(stringWidthDiv2 + 12) && Math.abs(i32(i32(cm.ym - n2) + 5)) < 10 && cm.mouses === -1) {
    cm.mouses = 0;
    b = true;
  }
  if (!b2) {
    cm.rd.setColor(220, 220, 220);
    cm.rd.fillRect(i32(i32(n - stringWidthDiv2) - 10), i32(n2 - i32(17 - n3)), i32(stringWidth + 20), i32(25 - i32(n3 * 2)));
    cm.rd.setColor(240, 240, 240);
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 10), i32(n2 - i32(17 - n3)), i32(i32(n + stringWidthDiv2) + 10), i32(n2 - i32(17 - n3)));
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 10), i32(n2 - i32(18 - n3)), i32(i32(n + stringWidthDiv2) + 10), i32(n2 - i32(18 - n3)));
    cm.rd.setColor(240, 240, 240);
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 9), i32(n2 - i32(19 - n3)), i32(i32(n + stringWidthDiv2) + 9), i32(n2 - i32(19 - n3)));
    cm.rd.setColor(200, 200, 200);
    cm.rd.drawLine(i32(i32(n + stringWidthDiv2) + 10), i32(n2 - i32(17 - n3)), i32(i32(n + stringWidthDiv2) + 10), i32(n2 + i32(7 - n3)));
    cm.rd.drawLine(i32(i32(n + stringWidthDiv2) + 11), i32(n2 - i32(17 - n3)), i32(i32(n + stringWidthDiv2) + 11), i32(n2 + i32(7 - n3)));
    cm.rd.setColor(200, 200, 200);
    cm.rd.drawLine(i32(i32(n + stringWidthDiv2) + 12), i32(n2 - i32(16 - n3)), i32(i32(n + stringWidthDiv2) + 12), i32(n2 + i32(6 - n3)));
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 10), i32(n2 + i32(7 - n3)), i32(i32(n + stringWidthDiv2) + 10), i32(n2 + i32(7 - n3)));
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 10), i32(n2 + i32(8 - n3)), i32(i32(n + stringWidthDiv2) + 10), i32(n2 + i32(8 - n3)));
    cm.rd.setColor(200, 200, 200);
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 9), i32(n2 + i32(9 - n3)), i32(i32(n + stringWidthDiv2) + 9), i32(n2 + i32(9 - n3)));
    cm.rd.setColor(240, 240, 240);
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 10), i32(n2 - i32(17 - n3)), i32(i32(n - stringWidthDiv2) - 10), i32(n2 + i32(7 - n3)));
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 11), i32(n2 - i32(17 - n3)), i32(i32(n - stringWidthDiv2) - 11), i32(n2 + i32(7 - n3)));
    cm.rd.setColor(240, 240, 240);
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 12), i32(n2 - i32(16 - n3)), i32(i32(n - stringWidthDiv2) - 12), i32(n2 + i32(6 - n3)));
    cm.rd.setColor(0, 0, 0);
    if (str === "X") {
      cm.rd.setColor(255, 0, 0);
    }
    if (str === "Download") {
      cm.rd.setColor(0, 64, 128);
    }
    cm.rd.drawString(str, i32(n - stringWidthDiv2), n2);
  } else {
    cm.rd.setColor(220, 220, 220);
    cm.rd.fillRect(i32(i32(n - stringWidthDiv2) - 10), i32(n2 - i32(17 - n3)), i32(stringWidth + 20), i32(25 - i32(n3 * 2)));
    cm.rd.setColor(192, 192, 192);
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 10), i32(n2 - i32(17 - n3)), i32(i32(n + stringWidthDiv2) + 10), i32(n2 - i32(17 - n3)));
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 10), i32(n2 - i32(18 - n3)), i32(i32(n + stringWidthDiv2) + 10), i32(n2 - i32(18 - n3)));
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 9), i32(n2 - i32(19 - n3)), i32(i32(n + stringWidthDiv2) + 9), i32(n2 - i32(19 - n3)));
    cm.rd.setColor(247, 247, 247);
    cm.rd.drawLine(i32(i32(n + stringWidthDiv2) + 10), i32(n2 - i32(17 - n3)), i32(i32(n + stringWidthDiv2) + 10), i32(n2 + i32(7 - n3)));
    cm.rd.drawLine(i32(i32(n + stringWidthDiv2) + 11), i32(n2 - i32(17 - n3)), i32(i32(n + stringWidthDiv2) + 11), i32(n2 + i32(7 - n3)));
    cm.rd.drawLine(i32(i32(n + stringWidthDiv2) + 12), i32(n2 - i32(16 - n3)), i32(i32(n + stringWidthDiv2) + 12), i32(n2 + i32(6 - n3)));
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 10), i32(n2 + i32(7 - n3)), i32(i32(n + stringWidthDiv2) + 10), i32(n2 + i32(7 - n3)));
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 10), i32(n2 + i32(8 - n3)), i32(i32(n + stringWidthDiv2) + 10), i32(n2 + i32(8 - n3)));
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 9), i32(n2 + i32(9 - n3)), i32(i32(n + stringWidthDiv2) + 9), i32(n2 + i32(9 - n3)));
    cm.rd.setColor(192, 192, 192);
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 10), i32(n2 - i32(17 - n3)), i32(i32(n - stringWidthDiv2) - 10), i32(n2 + i32(7 - n3)));
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 11), i32(n2 - i32(17 - n3)), i32(i32(n - stringWidthDiv2) - 11), i32(n2 + i32(7 - n3)));
    cm.rd.drawLine(i32(i32(n - stringWidthDiv2) - 12), i32(n2 - i32(16 - n3)), i32(i32(n - stringWidthDiv2) - 12), i32(n2 + i32(6 - n3)));
    cm.rd.setColor(0, 0, 0);
    if (str === "X") {
      cm.rd.setColor(255, 0, 0);
    }
    if (str === "Download") {
      cm.rd.setColor(0, 64, 128);
    }
    cm.rd.drawString(str, i32(i32(n - stringWidthDiv2) + 1), i32(n2 + 1));
  }
  return b;
}
