// Transpiled from CarMaker.java lines 2478-2858 (chunk "tab3"), line by line.
//
// The "Publish" pane: the account car list, the login form, and the per-row
// Download / remove-from-account controls.
//
// Shared state: CarMaker methods receive the state object `cm` as their first
// parameter and read/write `cm.<field>` exactly where the Java said
// `this.<field>`. Local names are procyon's (b6, n112 ... n122, s, s2, b7).
//
// No local declared outside this line range is referenced: unlike tab0, the
// `if (this.tab == 3)` block is closed over its own locals, so tab3 takes only
// `cm` and returns nothing.
//
// ---------------------------------------------------------------------------
// NETWORK: dropped, per CAREDITOR_PORT_SPEC.md §"Measured facts".
//
// This is the one chunk that talks to multiplayer.needformadness.com. Every
// java.net use is dropped and marked `// TODO not ported:` at the site; the
// layout, hit tests and state transitions around them are ported verbatim so
// the shell can repoint the buttons at a contribution flow later. The four
// sites are:
//
//   1. logged == 2 — DataInputStream(new URL(".../cars/<car>.txt")) reading a
//      car's details line. Its catch is EMPTY, so dropping the whole try/catch
//      is exactly what the real Java does with the server unreachable: maker /
//      pubt / clas / nad keep the "Unkown" / -1 / 0 / 0 values assigned above
//      it, and nmc / roto are NOT advanced (the ++ sit inside the try, after
//      the read that throws). logged still becomes 3.
//   2. logged == 1 — DataInputStream(new URL(".../cars/lists/<nick>.txt"))
//      filling pubitem. Its catch has TWO branches and picks between them by
//      matching "FileNotFound" against the exception's toString(); with no
//      exception there is no honest way to choose, so the whole try/catch is
//      dropped rather than inventing one. CONSEQUENCE: `logged` is left at 1,
//      and this pane then redraws "Loading your account car list..." forever.
//      Nothing in the port sets logged = 1 (ctachm.js dropped the login socket
//      too), so it is unreachable today -- but a shell that sets it would
//      wedge here.
//   3. logged == 3, "Download" — URL.openConnection()/openStream() of a
//      .radq, its ZIP unwrap, and the BufferedWriter into mycars/. The catch
//      has a single unambiguous branch, so the catch IS ported: clicking
//      Download draws the "Downloading car..." frame and then reports the
//      failure the offline Java reports.
//   4. logged == 3, "X" — the Socket to port 7061 that removes a car from the
//      account. `servervalue` is a plain local initialised to -1 BEFORE the
//      try, so dropping the try/catch leaves it -1, which is precisely the
//      catch's own assignment; the `servervalue == 0` / else branch below is
//      ported unchanged and takes the failure path.
// ---------------------------------------------------------------------------
//
// rd.setFont takes the `new Font(name, style, size)` argument as an object
// literal, the way ui.js does -- Smenu.js hands Graphics2D.setFont the same
// shape. (tab0.js/tab2.js spell the same call as three positional arguments;
// that difference predates this chunk and is not touched here.)

import { idiv, i32 } from '../java.js';
import { movefield, stringbutton, ovbutton } from './ui.js';
import { Cursor } from './input.js';

/**
 * tab3(cm) — the "Publish" pane of CarMaker.run().
 *
 * Corresponds to the `if (this.tab == 3)` block at CarMaker.java:2478-2858.
 */
export function tab3(cm) {
  if (cm.tab === 3) {
    cm.rd.setFont({ name: "Arial", style: 1, size: 13 });
    cm.rd.setColor(0, 0, 0);
    cm.rd.drawString("Publish Car :  [ " + cm.carname + " ]", 30, 50);
    cm.rd.drawString("Publishing Type :", 30, 80);
    cm.pubtyp.move(150, 63);
    if (!cm.pubtyp.isShowing()) {
      cm.pubtyp.show();
      cm.pubtyp.select(1);
    }
    stringbutton(cm, "       Publish  >       ", 102, 110, 0, true);
    cm.pubitem.move(i32(690 - cm.pubitem.w), 96);
    if (!cm.pubitem.isShowing()) {
      cm.pubitem.show();
    }
    if (cm.pubitem.sel !== 0) {
      let b6 = false;
      for (let n112 = 0; n112 < cm.nmc; ++n112) {
        if (cm.pubitem.getSelectedItem() === cm.mycars[n112]) {
          b6 = true;
        }
      }
      if (!b6) {
        cm.logged = 2;
      }
    }
    cm.rd.setColor(0, 0, 0);
    cm.rd.setFont({ name: "Arial", style: 0, size: 12 });
    if (cm.pubtyp.getSelectedIndex() === 0) {
      cm.rd.drawString("Private :  This means only you can use your car and no one else can add", 268, 72);
      cm.rd.drawString("it to their account to play with it !", 268, 88);
    }
    if (cm.pubtyp.getSelectedIndex() === 1) {
      cm.rd.drawString("Public :  This means anyone can add this car to their account to play with it,", 268, 72);
      cm.rd.drawString("but only you can download it to your Car Maker (no one else can get it’s code).", 268, 88);
    }
    if (cm.pubtyp.getSelectedIndex() === 2) {
      cm.rd.drawString("Super Public :  This means anyone can add this car to their account to play", 268, 72);
      cm.rd.drawString("with it and anyone can also download it to their Car Maker to get its code.", 268, 88);
    }
    cm.rd.setFont({ name: "Arial", style: 1, size: 12 });
    cm.ftm = cm.rd.getFontMetrics();
    cm.rd.drawString("Car Name", i32(80 - idiv(cm.ftm.stringWidth("Car Name"), 2)), 138);
    cm.rd.drawString("Car Class", i32(200 - idiv(cm.ftm.stringWidth("Car Class"), 2)), 138);
    cm.rd.drawString("Created By", i32(300 - idiv(cm.ftm.stringWidth("Created By"), 2)), 138);
    cm.rd.drawString("Added By", i32(400 - idiv(cm.ftm.stringWidth("Added By"), 2)), 138);
    cm.rd.drawString("Publish Type", i32(500 - idiv(cm.ftm.stringWidth("Publish Type"), 2)), 138);
    cm.rd.drawString("Options", i32(620 - idiv(cm.ftm.stringWidth("Options"), 2)), 138);
    cm.rd.drawLine(150, 129, 150, 140);
    cm.rd.drawLine(250, 129, 250, 140);
    cm.rd.drawLine(350, 129, 350, 140);
    cm.rd.drawLine(450, 129, 450, 140);
    cm.rd.drawLine(550, 129, 550, 140);
    cm.rd.drawRect(10, 140, 680, 402);
    if (cm.logged === 0) {
      cm.rd.setFont({ name: "Arial", style: 1, size: 13 });
      cm.ftm = cm.rd.getFontMetrics();
      cm.rd.drawString("Login to Retrieve your Account Cars", i32(350 - idiv(cm.ftm.stringWidth("Login to Retrieve your Account Cars"), 2)), 220);
      cm.rd.drawString("Nickname:", i32(i32(326 - cm.ftm.stringWidth("Nickname:")) - 14), 266);
      movefield(cm, cm.tnick, 326, 250, 129, 22);
      if (!cm.tnick.isShowing()) {
        cm.tnick.show();
      }
      cm.rd.drawString("Password:", i32(i32(326 - cm.ftm.stringWidth("Password:")) - 14), 296);
      movefield(cm, cm.tpass, 326, 280, 129, 22);
      if (!cm.tpass.isShowing()) {
        cm.tpass.show();
      }
      stringbutton(cm, "       Login       ", 350, 340, 0, true);
      cm.rd.setFont({ name: "Arial", style: 1, size: 13 });
      cm.ftm = cm.rd.getFontMetrics();
      cm.rd.drawString("Register a full account or if you have a trial account upgrade it!", i32(350 - idiv(cm.ftm.stringWidth("Register a full account or if you have a trial account upgrade it!"), 2)), 450);
      stringbutton(cm, "   Register!   ", 290, 480, 0, true);
      stringbutton(cm, "   Upgrade!   ", 410, 480, 0, true);
      cm.rd.setFont({ name: "Arial", style: 0, size: 12 });
      cm.ftm = cm.rd.getFontMetrics();
      cm.rd.drawString("You need a full account to publish your cars to the multiplayer game!", i32(350 - idiv(cm.ftm.stringWidth("You need a full account to publish your cars to the multiplayer game!"), 2)), 505);
    }
    if (cm.logged === -1) {
      cm.rd.setFont({ name: "Arial", style: 1, size: 13 });
      cm.ftm = cm.rd.getFontMetrics();
      cm.rd.drawString("Ready to publish...", i32(350 - idiv(cm.ftm.stringWidth("Ready to publish..."), 2)), 220);
      cm.rd.drawString("Click ‘Publish’ above to add car: '" + cm.carname + "'.", i32(350 - idiv(cm.ftm.stringWidth("Click ‘Publish’ above to add car: '" + cm.carname + "'."), 2)), 280);
    }
    if (cm.logged === 2) {
      cm.mycars[cm.roto] = cm.pubitem.getSelectedItem();
      cm.rd.setFont({ name: "Arial", style: 1, size: 13 });
      cm.ftm = cm.rd.getFontMetrics();
      cm.rd.setColor(225, 225, 225);
      cm.rd.fillRect(50, 150, 600, 150);
      cm.rd.setColor(0, 0, 0);
      cm.rd.drawString("Loading " + cm.mycars[cm.roto] + "‘s info...", i32(350 - idiv(cm.ftm.stringWidth("Loading " + cm.mycars[cm.roto] + "‘s info..."), 2)), 220);
      cm.repaint();
      cm.maker[cm.roto] = "Unkown";
      cm.pubt[cm.roto] = -1;
      cm.clas[cm.roto] = 0;
      cm.nad[cm.roto] = 0;
      // TODO not ported: http://multiplayer.needformadness.com/cars/<car>.txt
      //   The dropped try/catch read the car's `details(...)` line and filled
      //   maker/pubt/clas/addeda/nad from it, then advanced nmc and roto. The
      //   catch was empty, so an unreachable server skips all of that -- which
      //   is exactly the state the four assignments above leave behind.
      cm.logged = 3;
    }
    if (cm.logged === 1) {
      cm.rd.setFont({ name: "Arial", style: 1, size: 13 });
      cm.ftm = cm.rd.getFontMetrics();
      cm.rd.drawString("Loading your account car list...", i32(350 - idiv(cm.ftm.stringWidth("Loading your account car list..."), 2)), 220);
      cm.repaint();
      cm.pubitem.removeAll();
      cm.pubitem.add(cm.rd, "Account Cars");
      cm.nmc = 0;
      cm.roto = 0;
      // n114 counted the `mycars(...)` entries pulled off the server. Kept, and
      // now unused, because the loop that consumed it is the dropped one.
      let n114 = 0;
      // TODO not ported: http://multiplayer.needformadness.com/cars/lists/<nick>.txt
      //   The dropped try filled pubitem from the account's car list and set
      //   logged = -1. Its catch picks between logged = -1 and the branch below
      //   by matching "FileNotFound" against the exception's toString(), and
      //   with the server unreachable that match always fails -- Tab3Probe case
      //   D, run against the real class behind a dead proxy, ends at logged = 0
      //   with this dialog. So the catch's else branch IS ported; only the
      //   FileNotFound test, which has no exception left to test, is dropped.
      cm.logged = 0;
      cm.showMessageDialog(null, "Unable to connect to server at this moment, please try again later.", "Car Maker", 1);
      if (cm.justpubd !== "") {
        cm.pubitem.select(cm.justpubd);
        cm.justpubd = "";
      }
    }
    if (cm.logged === 3) {
      for (let n116 = 0; n116 < cm.nmc; ++n116) {
        cm.rd.setColor(235, 235, 235);
        if (cm.xm > 11 && cm.xm < 689 && cm.ym > i32(142 + n116 * 20) && cm.ym < i32(160 + n116 * 20)) {
          cm.rd.setColor(255, 255, 255);
        }
        cm.rd.fillRect(11, i32(142 + n116 * 20), 678, 18);
        cm.rd.setFont({ name: "Arial", style: 0, size: 12 });
        cm.ftm = cm.rd.getFontMetrics();
        cm.rd.setColor(0, 0, 0);
        cm.rd.drawString(cm.mycars[n116], i32(80 - idiv(cm.ftm.stringWidth(cm.mycars[n116]), 2)), i32(156 + n116 * 20));
        cm.rd.setColor(155, 155, 155);
        cm.rd.drawLine(150, i32(145 + n116 * 20), 150, i32(157 + n116 * 20));
        if (cm.pubt[n116] !== -1) {
          cm.rd.drawLine(250, i32(145 + n116 * 20), 250, i32(157 + n116 * 20));
          cm.rd.drawLine(350, i32(145 + n116 * 20), 350, i32(157 + n116 * 20));
          cm.rd.drawLine(450, i32(145 + n116 * 20), 450, i32(157 + n116 * 20));
          cm.rd.drawLine(550, i32(145 + n116 * 20), 550, i32(157 + n116 * 20));
          cm.rd.setColor(0, 0, 64);
          let s = "C";
          if (cm.clas[n116] === 1) {
            s = "B & C";
          }
          if (cm.clas[n116] === 2) {
            s = "B";
          }
          if (cm.clas[n116] === 3) {
            s = "A & B";
          }
          if (cm.clas[n116] === 4) {
            s = "A";
          }
          cm.rd.drawString("Class " + s + "", i32(200 - idiv(cm.ftm.stringWidth("Class " + s + ""), 2)), i32(156 + n116 * 20));
          let b7 = false;
          if (cm.maker[n116].toLowerCase() === cm.tnick.getText().toLowerCase()) {
            b7 = true;
            cm.rd.setColor(0, 64, 0);
            cm.rd.drawString("You", i32(300 - idiv(cm.ftm.stringWidth("You"), 2)), i32(156 + n116 * 20));
          }
          else {
            cm.rd.drawString(cm.maker[n116], i32(300 - idiv(cm.ftm.stringWidth(cm.maker[n116]), 2)), i32(156 + n116 * 20));
          }
          if (cm.nad[n116] > 1) {
            if (ovbutton(cm, "" + cm.nad[n116] + " Players", 400, i32(156 + n116 * 20))) {
              let s2 = "[ " + cm.mycars[n116] + " ]  has been added by the following players to their accounts:     \n\n";
              let n117 = 0;
              for (let n118 = 0; n118 < cm.nad[n116]; ++n118) {
                if (++n117 === 17) {
                  s2 += "\n";
                  n117 = 1;
                }
                s2 += cm.addeda[n116][n118];
                if (n118 !== i32(cm.nad[n116] - 1)) {
                  if (n118 !== i32(cm.nad[n116] - 2)) {
                    s2 += ", ";
                  }
                  else if (n117 === 16) {
                    s2 += "\nand ";
                    n117 = 0;
                  }
                  else {
                    s2 += " and ";
                  }
                }
              }
              cm.showMessageDialog(null, s2 + "\n \n \n", "Car Maker", 1);
            }
          }
          else {
            cm.rd.setColor(0, 0, 64);
            cm.rd.drawString("None", i32(400 - idiv(cm.ftm.stringWidth("None"), 2)), i32(156 + n116 * 20));
          }
          if (cm.pubt[n116] === 0) {
            cm.rd.setColor(0, 0, 64);
            cm.rd.drawString("Private", i32(500 - idiv(cm.ftm.stringWidth("Private"), 2)), i32(156 + n116 * 20));
          }
          if (cm.pubt[n116] === 1) {
            cm.rd.setColor(0, 0, 64);
            cm.rd.drawString("Public", i32(500 - idiv(cm.ftm.stringWidth("Public"), 2)), i32(156 + n116 * 20));
          }
          if (cm.pubt[n116] === 2) {
            cm.rd.setColor(0, 64, 0);
            cm.rd.drawString("Super Public", i32(500 - idiv(cm.ftm.stringWidth("Super Public"), 2)), i32(156 + n116 * 20));
          }
          if ((cm.pubt[n116] === 2 || b7) && ovbutton(cm, "Download", 600, i32(156 + n116 * 20))) {
            let showConfirmDialog = 0;
            for (let n119 = 0; n119 < cm.slcar.getItemCount(); ++n119) {
              if (cm.mycars[n116] === cm.slcar.getItem(n119)) {
                showConfirmDialog = cm.showConfirmDialog(null, "Replace the local " + cm.mycars[n116] + " in your 'mycars' folder with the published online copy?", "Car Maker", 0);
              }
            }
            if (showConfirmDialog === 0) {
              cm.setCursor(new Cursor(3));
              cm.rd.setFont({ name: "Arial", style: 1, size: 13 });
              cm.ftm = cm.rd.getFontMetrics();
              cm.rd.setColor(225, 225, 225);
              cm.rd.fillRect(11, 141, 679, 401);
              cm.rd.setColor(0, 0, 0);
              cm.rd.drawString("Downloading car, please wait...", i32(350 - idiv(cm.ftm.stringWidth("Downloading car, please wait..."), 2)), 250);
              cm.repaint();
              // TODO not ported: http://multiplayer.needformadness.com/cars/<car>.radq
              //   The dropped try read the .radq over HTTP, stripped its 20/40
              //   byte header, unzipped it, filtered the carmaker()/publish()
              //   lines out of the .rad text and wrote it to mycars/ (and into
              //   the editor when it was the open car). Its catch has a single
              //   branch, which is what an unreachable server takes, so the
              //   catch itself IS ported, below.
              cm.showMessageDialog(null, "Unable to download car.  Unknown Error!     \nPlease try again later.", "Car Maker", 1);
            }
          }
        }
        else {
          cm.rd.drawString("-    Error Loading this car's info!    -", i32(350 - idiv(cm.ftm.stringWidth("-    Error Loading this car's info!    -"), 2)), i32(156 + n116 * 20));
        }
        if (ovbutton(cm, "X", 665, i32(156 + n116 * 20)) && cm.showConfirmDialog(null, "Remove " + cm.mycars[n116] + " from your account?", "Car Maker", 0) === 0) {
          cm.setCursor(new Cursor(3));
          let servervalue = -1;
          // TODO not ported: Socket("multiplayer.needformadness.com", 7061)
          //   The dropped try/catch sent "9|<nick>|<pass>|<car>|" and read the
          //   reply through this.servervalue(line, 0). Its catch assigns -1,
          //   which is the value the declaration above already holds, so the
          //   branch below takes the failure path exactly as the offline Java
          //   does.
          if (servervalue === 0) {
            cm.logged = 1;
          }
          else {
            cm.setCursor(new Cursor(0));
            cm.showMessageDialog(null, "Failed to remove " + cm.mycars[n116] + " from your account.  Unknown Error!     \nPlease try again later.", "Car Maker", 1);
          }
        }
      }
    }
  }
}
