// Transpiled from java-src/CarMaker.java lines 355-429, 2859-2920, 4998-5157,
// 5399-5472, 5634-5644 (chunk "boot"), line by line.
//
// Shared state: every function takes the state object from ./state.js as its
// first parameter, `cm`, and reads/writes `cm.<field>` where the Java said
// `this.<field>`. Local names are procyon's.
//
// WHAT IS DELIBERATELY NOT HERE
//
// run()'s `while (!this.exwist) { ... Thread.sleep(n2) }` is the applet's main
// loop; in the port that loop is web/careditor/shell.js's requestAnimationFrame
// driver. So this module ports run()'s straight-line HEAD (355-429) as
// runHead() and the per-frame bookkeeping at its TAIL (2859-2903) as runTail(),
// and stops at `this.drawms()` -- drawms/ctachm/repaint/Thread.sleep and the
// post-loop rd.dispose()/System.gc()/Madness.advopen() belong to the shell.
// start(), stop() and repaint() are likewise not here.
//
// init() (4998-5157) is AWT widget construction. What is DATA -- the fonts, the
// colours, and the item list of each Smenu -- is ported. What is applet
// plumbing is not: createImage/getGraphics (the double buffer is the shell's
// canvas), setLayout(null), Container.add(...), the java.vendor sniff, the
// PopupMenu and its MouseHandlers.
//
// THE THREE IO METHODS ARE SEAMS, following CarDefine.loadcar (web/CarDefine.js:713)
// and GameSparker.loadbase: Java opens a stream inline, a browser cannot, so
// the already-read data comes in as a parameter.
//   loadsounds(cm, zip)  zip = Map<string, Uint8Array> from vfs.readZip()
//   loadbase(cm, zip)    same
//   getImage(cm, image)  the shell decodes the gif; MediaTracker has no analogue
//
// COLOUR REPRESENTATION. java.awt.Color has one form; the port has two widget
// layers that want different ones, and this is the only file that touches both:
//   - Smenu (../Smenu.js) stores the Color object and calls getRed()/getGreen()/
//     getBlue() on it in draw(), so its setBackground/setForeground get a
//     `new Color(r, g, b)`.
//   - TextWidget (./widgets.js) formats through css(), which takes [r, g, b] or
//     three numbers, so the TextField/TextArea setters -- and `defb`/`deff`,
//     which shape.js's setheme() hands straight to the editor -- get an array.

import { i32, idiv, intArray } from '../java.js';
import { Color, Font } from '../Smenu.js';
import { ContO } from '../ContO.js';
import { Madness } from '../Madness.js';
import { TextField } from './widgets.js';
import { hidefields } from './ui.js';
import { loadfile, savefile } from './files.js';
import { setheme } from './shape.js';

/** JOptionPane.showMessageDialog, supplied by the shell. Same seam as ctachm.js. */
function showMessageDialog(cm, parent, msg, title, type) {
  cm.showMessageDialog(parent, msg, title, type);
}

/**
 * `new soundClip(byte[])` -- an AudioClip bound to one entry of sounds.zip.
 *
 * web/audio.js is name-keyed: `Audio` decodes sounds.zip itself and plays by
 * entry name, and exposes no way to build a clip from bytes. So a clip here is
 * the same three-method stand-in XtGraphics._clip already uses, bound to the
 * name the Java matched, and the `b` byte array the Java would have decoded is
 * unused. That is a seam, not a stub: `cm.snd.play(name)` plays the same bytes.
 *
 * checkopen() has no counterpart in audio.js -- Java's soundClip reopens its
 * stream, Web Audio buffers never close -- but tab2.js:1201 calls it, so it is
 * present and does nothing.
 */
function soundClip(cm, b, name) {
  return {
    play: () => { if (cm.snd) cm.snd.play(name); },
    loop: () => { if (cm.snd) cm.snd.loop(name); },
    stop: () => { if (cm.snd) { cm.snd.stopLoop(name); cm.snd.stop(name); } },
    checkopen: () => {},
  };
}

/**
 * run() head -- CarMaker.java:355-429, down to the `while (!this.exwist)`.
 *
 * Returns `int n`, the local declared at CarMaker.java:398 that crosses into
 * the tab blocks (tab0(cm, n) takes and returns it).
 *
 * ORDERING CONTRACT. The Java calls loadsounds(), loadbase() and loadsettings()
 * from the middle of this run, and loadsettings() is what sets `cfont`/`cthm`,
 * which the setFont loop and setheme() below then read. In the port those three
 * are IO and the shell performs them; it must do so BEFORE calling runHead, in
 * that order, or the editor comes up in the default font and theme.
 */
export function runHead(cm) {
  // TODO not ported: this.thredo.setPriority(10) -- the Thread is the shell's
  //   requestAnimationFrame loop.
  // TODO not ported here: btgame[0], btgame[1] and logo are this.getImage(...)
  //   of three gifs under data/. The shell decodes them and passes each to
  //   getImage() below, which is the rest of the Java method.
  cm.m.w = 700;
  cm.m.cx = 350;
  cm.m.y = -240;
  cm.m.z = -400;
  cm.m.zy = 4;
  cm.m.focus_point = 800;
  cm.m.fadfrom(8000);
  cm.m.cfade[0] = 187;
  cm.m.cfade[1] = 210;
  cm.m.cfade[2] = 227;
  // IO seam: this.loadsounds() -> loadsounds(cm, zip), called by the shell.
  // IO seam: this.loadbase()   -> loadbase(cm, zip),   called by the shell.
  cm.m.loadnew = true;
  // IO seam: this.loadsettings() -> loadsettings(cm, text) in files.js.
  cm.editor.setFont(new Font(cm.cfont, 1, 14));
  cm.srch.setFont(new Font(cm.cfont, 1, 14));
  cm.rplc.setFont(new Font(cm.cfont, 1, 14));
  for (let i = 0; i < 16; ++i) {
    cm.wv[i].setFont(new Font(cm.cfont, 1, 14));
  }
  setheme(cm);
  if (Madness.testdrive !== 0) {
    if (Madness.testcar === "Failx12") {
      showMessageDialog(cm, null, "Failed to load car! Please make sure car is saved before Test Drive.", "Car Maker", 1);
      // TODO not ported: this.thredo.stop() -- killing the applet's thread is
      //   the shell's business; the Java's own next statement is the loop.
    }
    else {
      cm.carname = Madness.testcar;
      // IO seam: this.loadfile() read mycars/<carname>.rad off disk. Same
      // snapshot accessor tab0.js uses.
      loadfile(cm, cm.carsrc(cm.carname));
      if (cm.loadedfile) {
        cm.tested = true;
        cm.tab = 2;
        cm.dtab = 6;
        cm.witho.select(Madness.testdrive - 1);
      }
    }
    Madness.testcar = "";
    Madness.testdrive = 0;
  }
  let n = 0;
  if (cm.carname !== "") {
    cm.tutok = true;
    n = 1;
  }
  return n;
}

/**
 * run() tail -- CarMaker.java:2859-2903: the tab bar, drawn after whichever
 * `if (this.tab == N)` block ran, and the hit test that switches tabs.
 *
 * Stops at `this.drawms()`; drawms(), ctachm() and repaint() are the shell's.
 */
export function runTail(cm) {
  if (cm.tabed !== cm.tab) {
    cm.tabed = cm.tab;
  }
  cm.rd.setColor(0, 0, 0);
  cm.rd.fillRect(0, 0, 700, 25);
  if (!cm.onbtgame) {
    cm.rd.drawImage(cm.btgame[0], 520, 0);
  }
  else {
    cm.rd.drawImage(cm.btgame[1], 520, 0);
  }
  cm.rd.setFont(new Font("Arial", 1, 13));
  cm.ftm = cm.rd.getFontMetrics();
  const array17 = [ "Car", "Code Edit", "3D Edit", "Publish" ];
  const array18 = intArray([ 0, 0, 100, 90 ]);
  const array19 = intArray([ 0, 25, 25, 0 ]);
  let n123 = 4;
  if (cm.carname === "" || !cm.loadedfile || cm.sfase !== 0) {
    cm.tab = 0;
    n123 = 1;
  }
  for (let tab = 0; tab < n123; ++tab) {
    cm.rd.setColor(170, 170, 170);
    if (cm.xm > array18[0] && cm.xm < array18[3] && cm.ym > 0 && cm.ym < 25) {
      cm.rd.setColor(200, 200, 200);
    }
    if (cm.tab === tab) {
      cm.rd.setColor(225, 225, 225);
    }
    cm.rd.fillPolygon(array18, array19, 4);
    cm.rd.setColor(0, 0, 0);
    cm.rd.drawString(array17[tab], i32(tab * 100 + 45 - idiv(cm.ftm.stringWidth(array17[tab]), 2)), 17);
    if (cm.xm > array18[0] && cm.xm < array18[3] && cm.ym > 0 && cm.ym < 25 && cm.mouses === -1) {
      if (cm.tab !== tab && cm.tab === 1) {
        // IO seam: files.js savefile(cm) returns the .rad text instead of
        // writing it; the shell persists what it hands back. Leaving the tab
        // discards the return exactly as the Java's void call does.
        savefile(cm);
      }
      cm.tab = tab;
    }
    for (let n124 = 0; n124 < 4; ++n124) {
      const array20 = array18;
      const n125 = n124;
      array20[n125] += 100;
    }
  }
}

/**
 * init() -- CarMaker.java:4998-5157.
 *
 * The data half of the applet's widget construction: the font, colours and
 * item list of each Smenu and text field. Everything AWT-structural is skipped;
 * see the header.
 */
export function init(cm) {
  // TODO not ported: this.setBackground(new Color(0, 0, 0)) -- the applet's
  //   own background, which the page's CSS provides.
  // TODO not ported: this.offImage = this.createImage(700, 550) and
  //   this.rd = (Graphics2D)this.offImage.getGraphics() -- the shell builds rd
  //   over its canvas before calling init.
  cm.rd.setRenderingHint();
  // TODO not ported: the `boolean b` java.vendor sniff (apple/sun => false).
  //   It gates only the MouseHandler installs, which are not ported either.
  // TODO not ported: this.setLayout(null).
  cm.slcar.setFont(new Font("Arial", 1, 13));
  cm.slcar.add(cm.rd, "Select a Car...         ");
  cm.slcar.setForeground(new Color(63, 80, 110));
  cm.slcar.setBackground(new Color(209, 217, 230));
  cm.fontsel.setFont(new Font("Arial", 1, 12));
  cm.fontsel.add(cm.rd, "Arial");
  cm.fontsel.add(cm.rd, "Dialog");
  cm.fontsel.add(cm.rd, "DialogInput");
  cm.fontsel.add(cm.rd, "Monospaced");
  cm.fontsel.add(cm.rd, "Serif");
  cm.fontsel.add(cm.rd, "SansSerif");
  cm.fontsel.add(cm.rd, "Verdana");
  cm.fontsel.setBackground(new Color(63, 80, 110));
  cm.fontsel.setForeground(new Color(209, 217, 230));
  cm.ctheme.setFont(new Font("Arial", 1, 12));
  cm.ctheme.add(cm.rd, "Default");
  cm.ctheme.add(cm.rd, "Author");
  cm.ctheme.add(cm.rd, "Dos");
  cm.ctheme.add(cm.rd, "Green");
  cm.ctheme.add(cm.rd, "The Matrix");
  cm.ctheme.add(cm.rd, "Ice Age");
  cm.ctheme.add(cm.rd, "Fire");
  cm.ctheme.add(cm.rd, "Ocean");
  cm.ctheme.setBackground(new Color(63, 80, 110));
  cm.ctheme.setForeground(new Color(209, 217, 230));
  cm.compcar.setFont(new Font("Arial", 1, 12));
  cm.compcar.add(cm.rd, "Compare Car...");
  cm.compcar.add(cm.rd, "Tornado Shark");
  cm.compcar.add(cm.rd, "Formula 7");
  cm.compcar.add(cm.rd, "Wow Caninaro");
  cm.compcar.add(cm.rd, "La Vita Crab");
  cm.compcar.add(cm.rd, "Nimi");
  cm.compcar.add(cm.rd, "MAX Revenge");
  cm.compcar.add(cm.rd, "Lead Oxide");
  cm.compcar.add(cm.rd, "Kool Kat");
  cm.compcar.add(cm.rd, "Drifter X");
  cm.compcar.add(cm.rd, "Sword of Justice");
  cm.compcar.add(cm.rd, "High Rider");
  cm.compcar.add(cm.rd, "EL KING");
  cm.compcar.add(cm.rd, "Mighty Eight");
  cm.compcar.add(cm.rd, "M A S H E E N");
  cm.compcar.add(cm.rd, "Radical One");
  cm.compcar.add(cm.rd, "DR Monstaa");
  cm.compcar.add(cm.rd, " -  None  - ");
  cm.compcar.setBackground(new Color(63, 80, 110));
  cm.compcar.setForeground(new Color(209, 217, 230));
  cm.cls.setFont(new Font("Arial", 1, 12));
  cm.cls.add(cm.rd, "Class A");
  cm.cls.add(cm.rd, "Class A & B");
  cm.cls.add(cm.rd, "Class B");
  cm.cls.add(cm.rd, "Class B & C");
  cm.cls.add(cm.rd, "Class C");
  cm.cls.setBackground(new Color(63, 80, 110));
  cm.cls.setForeground(new Color(209, 217, 230));
  cm.simcar.setFont(new Font("Arial", 1, 12));
  cm.simcar.add(cm.rd, "Tornado Shark");
  cm.simcar.add(cm.rd, "Formula 7");
  cm.simcar.add(cm.rd, "Wow Caninaro");
  cm.simcar.add(cm.rd, "La Vita Crab");
  cm.simcar.add(cm.rd, "Nimi");
  cm.simcar.add(cm.rd, "MAX Revenge");
  cm.simcar.add(cm.rd, "Lead Oxide");
  cm.simcar.add(cm.rd, "Kool Kat");
  cm.simcar.add(cm.rd, "Drifter X");
  cm.simcar.add(cm.rd, "Sword of Justice");
  cm.simcar.add(cm.rd, "High Rider");
  cm.simcar.add(cm.rd, "EL KING");
  cm.simcar.add(cm.rd, "Mighty Eight");
  cm.simcar.add(cm.rd, "M A S H E E N");
  cm.simcar.add(cm.rd, "Radical One");
  cm.simcar.add(cm.rd, "DR Monstaa");
  cm.simcar.setBackground(new Color(63, 80, 110));
  cm.simcar.setForeground(new Color(209, 217, 230));
  cm.witho.setFont(new Font("Arial", 1, 12));
  cm.witho.add(cm.rd, "With other cars");
  cm.witho.add(cm.rd, "Alone");
  cm.witho.setBackground(new Color(63, 80, 110));
  cm.witho.setForeground(new Color(209, 217, 230));
  cm.engine.setFont(new Font("Arial", 1, 12));
  cm.engine.add(cm.rd, "Normal Engine");
  cm.engine.add(cm.rd, "V8 Engine");
  cm.engine.add(cm.rd, "Retro Engine");
  cm.engine.add(cm.rd, "Power Engine");
  cm.engine.add(cm.rd, "Diesel Engine");
  cm.engine.setBackground(new Color(63, 80, 110));
  cm.engine.setForeground(new Color(209, 217, 230));
  // TODO not ported: the Cut/Copy/Paste/Select All PopupMenu, its four
  //   MenuItems and their ActionListeners. The browser's own context menu
  //   serves the text widgets.
  for (let i = 0; i < 16; ++i) {
    // The Java's `new TextField("", 2)` -- state.js allocates wv as
    // objArray(16), i.e. 16 nulls, exactly as the Java constructor's
    // `new TextField[16]` does, and this is the line that fills it. The second
    // argument is a column count, which the ported widget has no concept of.
    (cm.wv[i] = new TextField("")).setBackground([255, 255, 255]);
    cm.wv[i].setForeground([0, 0, 0]);
    cm.wv[i].setFont(new Font(cm.cfont, 1, 14));
    // TODO not ported: wv[i].addMouseListener(new MouseHandler(popupMenu, i)).
  }
  cm.tnick.setFont(new Font("Arial", 1, 13));
  cm.tnick.setBackground([255, 255, 255]);
  cm.tnick.setForeground([0, 0, 0]);
  cm.tpass.setFont(new Font("Arial", 1, 13));
  // TODO not ported: tpass.setEchoCharacter('*') -- widgets.js backs a
  //   TextField with a plain <input type=text> and has no echo character. The
  //   field belongs to the account/publish flow, which CAREDITOR_PORT_SPEC
  //   drops wholesale (no upload, no server stat check), so nothing types into
  //   it in this port.
  cm.tpass.setBackground([255, 255, 255]);
  cm.tpass.setForeground([0, 0, 0]);
  cm.pubtyp.setFont(new Font("Arial", 1, 13));
  cm.pubtyp.add(cm.rd, "Private");
  cm.pubtyp.add(cm.rd, "Public");
  cm.pubtyp.add(cm.rd, "Super Public");
  cm.pubtyp.setBackground(new Color(63, 80, 110));
  cm.pubtyp.setForeground(new Color(209, 217, 230));
  cm.pubitem.setFont(new Font("Arial", 1, 13));
  cm.pubitem.add(cm.rd, "Account Cars");
  cm.pubitem.setBackground(new Color(209, 217, 230));
  cm.pubitem.setForeground(new Color(63, 80, 110));
  cm.srch.setBackground([255, 255, 255]);
  cm.srch.setForeground([0, 0, 0]);
  // TODO not ported: srch/rplc/editor addMouseListener(MouseHandler(...,16/17/18)).
  cm.rplc.setBackground([255, 255, 255]);
  cm.rplc.setForeground([0, 0, 0]);
  // TODO not ported: this.add(tnick/tpass/editor/srch/rplc) -- Container.add.
  cm.defb = [255, 255, 255];
  cm.deff = [0, 0, 0];
  hidefields(cm);
}

/**
 * loadsounds() -- CarMaker.java:5399-5439.
 *
 * @param zip Map<string, Uint8Array> from vfs.readZip('data/sounds.zip').
 *
 * Java streamed the archive with a ZipInputStream and reassembled each entry
 * with a read loop (`off += read; i -= read;`); the parsed zip has whole
 * entries already, so the loop is gone and `b` is the entry's bytes. The
 * try/catch around the stream goes with it: there is no IO left to fail.
 */
export function loadsounds(cm, zip) {
  for (const [name, b] of zip) {
    for (let j = 0; j < 5; ++j) {
      for (let k = 0; k < 5; ++k) {
        if (name === "" + k + "" + j + ".wav") {
          cm.engs[k][j] = new soundClip(cm, b, name);
        }
      }
    }
    for (let l = 0; l < 3; ++l) {
      if (name === "crash" + (l + 1) + ".wav") {
        cm.crashs[l] = new soundClip(cm, b, name);
      }
    }
    for (let n = 0; n < 3; ++n) {
      if (name === "lowcrash" + (n + 1) + ".wav") {
        cm.lowcrashs[n] = new soundClip(cm, b, name);
      }
    }
  }
}

/**
 * loadbase() -- CarMaker.java:5440-5472. The editor's own copy of the
 * base-model loader; it fills cm.compo[16] with the 16 shipped cars, which
 * tab2's "Compare Car..." draws beside the car being edited.
 *
 * @param zip Map<string, Uint8Array> from vfs.readZip('data/models.zip').
 *
 * Differences from GameSparker.loadbase (web/GameSparker.js:57), which is the
 * race's version of the same method and is already verified:
 *   - this one knows only the 16 car names (`array` below is character for
 *     character GameSparker's exported CAR_NAMES); the race's also matches 68
 *     track names into slots i+56 of a 124-slot array.
 *   - `n` starts at -1 and an entry matching nothing is SKIPPED. The race's
 *     `n2` starts at 0, so an unmatched entry there overwrites slot 0.
 *   - this one sets shadow = false and noline = true on every model.
 *   - the race's sums the uncompressed sizes and sets mload = 2 when the total
 *     is not 615671, the tampered-models.zip check. There is none here.
 */
export function loadbase(cm, zip) {
  const array = [ "2000tornados", "formula7", "canyenaro", "lescrab", "nimi", "maxrevenge", "leadoxide", "koolkat", "drifter", "policecops", "mustang", "king", "audir8", "masheen", "radicalone", "drmonster" ];
  for (const [name, b] of zip) {
    let n = -1;
    for (let i = 0; i < 16; ++i) {
      if (name.startsWith(array[i])) {
        n = i;
      }
    }
    if (n !== -1) {
      cm.compo[n] = new ContO(b, cm.m, cm.t);
      cm.compo[n].shadow = false;
      cm.compo[n].noline = true;
    }
  }
}

/**
 * getImage(String) -- CarMaker.java:5634-5644.
 *
 * The Java asked the Toolkit for the gif and then blocked on a MediaTracker
 * until it had decoded. `image` is the already-decoded image the shell fetched;
 * the wait is what is left of the method, and it has already happened.
 */
export function getImage(cm, image) {
  return image;
}
