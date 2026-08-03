// Tab1Probe -- drives the REAL CarMaker (out of java/Game.jar) through the
// tab==1 block of run() (CarMaker.java:692-877), the chunk transpiled to
// web/careditor/tab1.js.
//
// WHY THIS PROBE HAS NO `package tools;` LINE
// -------------------------------------------
// The other probes in this directory declare `package tools;` and reach the
// class under test through reflection. That does not work here. The block is
// inline in run() -- there is no method to invoke -- so the only way to run it
// against the real class is to re-compile the block's own 186 lines against the
// real CarMaker and let them touch its fields and call its methods directly.
// CarMaker's fields (`npolys`, `cntchk`, ...) and its `movefield`,
// `stringbutton` and `setheme` methods are PACKAGE-PRIVATE and CarMaker is in
// the default package, so this probe must be in the default package too.
// Everything below the block -- movefield, stringbutton, setheme, Smenu, the
// AWT widgets -- is therefore the real jar's code, not a re-implementation.
//
// WHY Xvfb
// --------
// java.awt.TextArea/TextField throw HeadlessException in their constructors,
// and an un-parented component's isShowing() is always false, which the block
// branches on four times. So the widgets are real ones inside a real visible
// Frame, and the probe runs under a virtual display.
//
// Build & run:
//   mkdir -p /tmp/claude-1000/-home-evan-games-nfm/careditor/jar && \
//     cd /tmp/claude-1000/-home-evan-games-nfm/careditor/jar && \
//     unzip -oq /home/evan/games/nfm/java/Game.jar
//   javac -cp /tmp/claude-1000/-home-evan-games-nfm/careditor/jar \
//         -d /tmp/claude-1000/-home-evan-games-nfm/careditor/probe \
//         web/tools/Tab1Probe.java
//   xvfb-run -a java \
//     -cp /tmp/claude-1000/-home-evan-games-nfm/careditor/probe:/tmp/claude-1000/-home-evan-games-nfm/careditor/jar \
//     Tab1Probe
//
// NOT DRIVEN HERE, deliberately: the `npolys > 210 && !tomany` tail calls
// JOptionPane.showMessageDialog, which is modal and would block the probe
// forever under Xvfb. Every probe case keeps npolys <= 210 or tomany true.

import java.awt.Color;
import java.awt.Font;
import java.awt.Frame;
import java.awt.Graphics2D;
import java.awt.TextArea;
import java.awt.TextField;
import java.awt.image.BufferedImage;
import java.lang.reflect.Field;
import javax.swing.JOptionPane;
import sun.misc.Unsafe;

public class Tab1Probe {

    static Unsafe unsafe;

    static void set(Object obj, String name, Object val) throws Exception {
        Class<?> c = obj.getClass();
        while (c != null) {
            try {
                Field f = c.getDeclaredField(name);
                f.setAccessible(true);
                f.set(obj, val);
                return;
            } catch (NoSuchFieldException e) { c = c.getSuperclass(); }
        }
        throw new NoSuchFieldException(name);
    }

    // ---- the chunk under test, verbatim from CarMaker.java:692-877 ----------
    // `this.` -> `cm.`; nothing else changed. Compare side by side with
    // decompilation/java-src/CarMaker.java and with web/careditor/tab1.js.
    static void tab1(CarMaker cm) {
        if (cm.tab == 1) {
            if (cm.tabed != cm.tab) {
                cm.srch.setText("");
                cm.rplc.setText("");
                cm.cntchk = 1;
                cm.npolys = 0;
                cm.prefs = false;
            }
            cm.movefield(cm.editor, 5, 30, 690, 400);
            if (!cm.openm) {
                if (!cm.editor.isShowing()) {
                    cm.editor.show();
                    cm.editor.requestFocus();
                }
            }
            else if (cm.editor.isShowing()) {
                cm.editor.hide();
            }
            cm.rd.setFont(new Font("Arial", 1, 12));
            if (cm.prefs) {
                cm.rd.drawString("Code Font:", 10, 446);
                cm.fontsel.move(76, 430);
                if (!cm.fontsel.isShowing()) {
                    cm.fontsel.show();
                    cm.fontsel.select(cm.cfont);
                }
                if (!cm.cfont.equals(cm.fontsel.getSelectedItem())) {
                    cm.cntprf = 0;
                    cm.cfont = cm.fontsel.getSelectedItem();
                    cm.editor.setFont(new Font(cm.cfont, 1, 14));
                    cm.srch.setFont(new Font(cm.cfont, 1, 14));
                    cm.rplc.setFont(new Font(cm.cfont, 1, 14));
                    for (int k = 0; k < 16; ++k) {
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
                if (cm.cthm != cm.ctheme.getSelectedIndex()) {
                    cm.cntprf = 0;
                    cm.cthm = cm.ctheme.getSelectedIndex();
                    cm.setheme();
                    cm.editor.requestFocus();
                }
                cm.stringbutton("<", 400, 446, 3, false);
                ++cm.cntprf;
                if (cm.cntprf == 200) {
                    cm.prefs = false;
                }
            }
            else {
                cm.stringbutton("Preferences", 52, 446, 3, false);
                if (cm.ctheme.isShowing()) {
                    cm.ctheme.hide();
                }
                if (cm.fontsel.isShowing()) {
                    cm.fontsel.hide();
                }
                if (cm.cntprf != 0) {
                    cm.cntprf = 0;
                }
                if (cm.cntchk == 0) {
                    cm.npolys = 0;
                    int n7 = 0;
                    int n8 = 0;
                    while (n7 != -1 && cm.mouses != 1) {
                        if (n8 == 0) {
                            n7 = cm.editor.getText().indexOf("<p>", n7);
                        }
                        else {
                            n7 = cm.editor.getText().indexOf("</p>", n7);
                        }
                        if (n7 != -1) {
                            if (n8 == 0) {
                                n8 = 1;
                            }
                            else {
                                n8 = 0;
                                ++cm.npolys;
                            }
                            n7 += 3;
                        }
                    }
                    if (cm.mouses == 1) {
                        cm.npolys = 0;
                    }
                    cm.cntchk = 30;
                }
                else {
                    --cm.cntchk;
                }
                if (cm.npolys > 210) {
                    cm.rd.setColor(new Color(255, 0, 0));
                }
                if (cm.npolys != 0) {
                    cm.rd.drawString("Number of Polygons :  " + cm.npolys + " / 210", 200, 446);
                }
            }
            if (!cm.changed && !cm.editor.getText().equals(cm.lastedo)) {
                cm.changed = true;
            }
            cm.stringbutton("  Save  ", 490, 455, 0, cm.changed);
            cm.stringbutton("  Save & Preview  >  ", 600, 455, 0, cm.changed);
            cm.mirror = false;
            cm.polynum = -1;
            cm.cntpls = 0;
            String selectedText = "";
            try {
                selectedText = cm.editor.getSelectedText();
            }
            catch (final Exception ex) {}
            if (!selectedText.equals("")) {
                int n9 = selectedText.indexOf("<p>", 0);
                while (n9 != -1 && n9 + 1 < selectedText.length()) {
                    if (!cm.mirror) {
                        n9 = selectedText.indexOf("</p>", n9 + 1);
                        if (n9 != -1) {
                            cm.mirror = true;
                            ++cm.cntpls;
                        }
                    }
                    if (cm.mirror) {
                        n9 = selectedText.indexOf("<p>", n9 + 1);
                        if (n9 == -1) {
                            continue;
                        }
                        cm.mirror = false;
                    }
                }
            }
            if (!cm.mirror) {
                cm.rd.setColor(new Color(170, 170, 170));
                cm.rd.drawRect(5, 474, 494, 70);
                cm.rd.setColor(new Color(0, 0, 0));
                cm.rd.drawString("Text to find:", 18, 500);
                cm.movefield(cm.srch, 91, 484, 129, 22);
                if (!cm.srch.isShowing()) {
                    cm.srch.show();
                }
                boolean b = false;
                if (!cm.srch.getText().equals("")) {
                    b = true;
                }
                cm.stringbutton(" Find ", 117, 526, 2, b);
                cm.rd.drawString("Replace with:", 255, 500);
                cm.movefield(cm.rplc, 338, 484, 129, 22);
                if (!cm.rplc.isShowing()) {
                    cm.rplc.show();
                }
                boolean b2 = false;
                if (!cm.srch.getText().equals("") && !cm.rplc.getText().equals("")) {
                    b2 = true;
                }
                cm.stringbutton(" Replace ", 376, 526, 2, b2);
            }
            else {
                if (cm.srch.isShowing()) {
                    cm.srch.hide();
                }
                if (cm.rplc.isShowing()) {
                    cm.rplc.hide();
                }
                cm.rd.setColor(new Color(170, 170, 170));
                cm.rd.drawRect(5, 474, 450, 70);
                cm.rd.setColor(new Color(0, 0, 0));
                cm.rd.drawString("Mirror [Selected] polygon(s) along:", 18, 490);
                cm.stringbutton(" Mirro Along X Axis ", 90, 525, 2, true);
                cm.stringbutton(" Mirro Along Y Axis ", 230, 525, 2, false);
                cm.stringbutton(" Mirro Along Z Axis ", 370, 525, 2, false);
                cm.rd.setColor(new Color(170, 170, 170));
                cm.rd.drawRect(465, 474, 230, 70);
                cm.rd.setColor(new Color(0, 0, 0));
                cm.rd.drawString("Show [Selected] polygon(s):", 478, 490);
                cm.stringbutton(" Show in 3D  > ", 580, 523, 0, true);
            }
            if (cm.npolys > 210 && !cm.tomany) {
                cm.repaint();
                JOptionPane.showMessageDialog(null, "Maximum number of polygons (pieces) allowed has been exceeded!\nThe maximum allowed is 210 polygons, please decrease.\n", "Car Maker", 1);
                cm.tomany = true;
            }
        }
    }

    // ---- harness -----------------------------------------------------------

    static Frame frame;
    static CarMaker cm;
    static TextArea editor;
    static TextField srch, rplc;

    /** A fresh CarMaker with the fields the block touches, and real widgets. */
    static CarMaker fresh() throws Exception {
        CarMaker c = (CarMaker) unsafe.allocateInstance(CarMaker.class);
        BufferedImage img = new BufferedImage(700, 550, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = img.createGraphics();
        set(c, "rd", g2d);
        set(c, "apx", 0);
        set(c, "apy", 0);
        set(c, "tab", 1);
        set(c, "tabed", 1);
        set(c, "editor", editor);
        set(c, "srch", srch);
        set(c, "rplc", rplc);
        set(c, "fontsel", new Smenu(40));
        set(c, "ctheme", new Smenu(40));
        set(c, "cfont", "Monospaced");
        set(c, "cthm", 0);
        set(c, "cntprf", 0);
        set(c, "cntpls", 0);
        set(c, "cntchk", 0);
        set(c, "npolys", 0);
        set(c, "prefs", false);
        set(c, "mirror", false);
        set(c, "polynum", -1);
        set(c, "tomany", false);
        set(c, "changed", false);
        set(c, "lastedo", "");
        set(c, "openm", false);
        set(c, "mouses", 0);
        set(c, "xm", 0);
        set(c, "ym", 0);
        set(c, "btn", 0);
        set(c, "bx", new int[24]);
        set(c, "by", new int[24]);
        set(c, "bw", new int[24]);
        set(c, "pessd", new boolean[24]);
        set(c, "defb", new Color(255, 255, 255));
        set(c, "deff", new Color(0, 0, 0));
        TextField[] wv = new TextField[16];
        for (int i = 0; i < 16; ++i) wv[i] = new TextField();
        set(c, "wv", wv);
        return c;
    }

    static void report(String label, CarMaker c) throws Exception {
        StringBuilder sb = new StringBuilder();
        sb.append(label).append(" | ");
        sb.append("npolys=").append(c.npolys);
        sb.append(" cntchk=").append(c.cntchk);
        sb.append(" cntprf=").append(c.cntprf);
        sb.append(" cntpls=").append(c.cntpls);
        sb.append(" prefs=").append(c.prefs);
        sb.append(" mirror=").append(c.mirror);
        sb.append(" polynum=").append(c.polynum);
        sb.append(" changed=").append(c.changed);
        sb.append(" tomany=").append(c.tomany);
        sb.append(" cthm=").append(c.cthm);
        sb.append(" cfont=").append(c.cfont);
        sb.append(" btn=").append(c.btn);
        sb.append(" bx=[");
        for (int i = 0; i < c.btn; ++i) sb.append(i == 0 ? "" : ",").append(c.bx[i]);
        sb.append("] by=[");
        for (int i = 0; i < c.btn; ++i) sb.append(i == 0 ? "" : ",").append(c.by[i]);
        sb.append("]");
        sb.append(" editorBounds=").append(editor.getX()).append(",").append(editor.getY())
          .append(",").append(editor.getWidth()).append(",").append(editor.getHeight());
        sb.append(" srchShow=").append(srch.isShowing());
        sb.append(" rplcShow=").append(rplc.isShowing());
        sb.append(" fontselShow=").append(c.fontsel.isShowing());
        sb.append(" cthemeShow=").append(c.ctheme.isShowing());
        sb.append(" fontselSel=").append(c.fontsel.getSelectedIndex());
        sb.append(" cthemeSel=").append(c.ctheme.getSelectedIndex());
        sb.append(" srch=[").append(srch.getText()).append("]");
        sb.append(" rplc=[").append(rplc.getText()).append("]");
        System.out.println(sb);
    }

    public static void main(String[] args) throws Exception {
        Field f = Unsafe.class.getDeclaredField("theUnsafe");
        f.setAccessible(true);
        unsafe = (Unsafe) f.get(null);

        // Real widgets in a real visible Frame, so isShowing() means something.
        frame = new Frame("Tab1Probe");
        frame.setLayout(null);
        editor = new TextArea();
        srch = new TextField();
        rplc = new TextField();
        editor.setBounds(0, 0, 100, 100);
        srch.setBounds(0, 110, 100, 20);
        rplc.setBounds(0, 140, 100, 20);
        frame.add(editor);
        frame.add(srch);
        frame.add(rplc);
        frame.setSize(700, 550);
        frame.setVisible(true);

        BufferedImage mimg = new BufferedImage(700, 550, BufferedImage.TYPE_INT_RGB);
        Graphics2D mg = mimg.createGraphics();

        // ---- A. the tabed != tab entry block --------------------------------
        cm = fresh();
        srch.setText("dirt");
        rplc.setText("more dirt");
        editor.setText("");
        editor.select(0, 0);
        cm.tabed = 0;             // != tab, so the entry block runs
        cm.cntchk = 17;
        cm.npolys = 99;
        cm.prefs = true;
        tab1(cm);
        report("A entry-block", cm);

        // ---- B. polygon count over a real body, cntchk == 0 ------------------
        String body = "<p>\nc(1,2,3)\np(0,0,0)\n</p>\n<p>\nc(4,5,6)\n</p>\n<p>\n</p>\n";
        cm = fresh();
        editor.setText(body);
        editor.select(0, 0);
        srch.setText("");
        rplc.setText("");
        cm.cntchk = 0;
        cm.mouses = 0;
        tab1(cm);
        report("B count-3-polys", cm);

        // ---- C. same, but mouses == 1 kills the count ------------------------
        cm = fresh();
        editor.setText(body);
        editor.select(0, 0);
        cm.cntchk = 0;
        cm.mouses = 1;
        tab1(cm);
        report("C count-mouses1", cm);

        // ---- D. cntchk != 0 just decrements ----------------------------------
        cm = fresh();
        editor.setText(body);
        editor.select(0, 0);
        cm.cntchk = 30;
        cm.npolys = 7;
        tab1(cm);
        report("D cntchk-decrement", cm);

        // ---- E. an unbalanced body: trailing <p> with no </p> ----------------
        cm = fresh();
        editor.setText("<p></p><p>");
        editor.select(0, 0);
        cm.cntchk = 0;
        tab1(cm);
        report("E unbalanced", cm);

        // ---- F. npolys > 210 sets the red colour but tomany already true -----
        StringBuilder big = new StringBuilder();
        for (int i = 0; i < 215; ++i) big.append("<p>x</p>\n");
        cm = fresh();
        editor.setText(big.toString());
        editor.select(0, 0);
        cm.cntchk = 0;
        cm.tomany = true;          // keeps the modal JOptionPane out of the probe
        tab1(cm);
        report("F over-210", cm);

        // ---- G. changed flips when the pane differs from lastedo -------------
        cm = fresh();
        editor.setText("something");
        editor.select(0, 0);
        cm.lastedo = "something else";
        cm.changed = false;
        cm.cntchk = 5;
        tab1(cm);
        report("G changed-flip", cm);

        // ---- H. selection spanning two whole polygons -> mirror --------------
        cm = fresh();
        editor.setText("<p></p><p></p>");
        editor.select(0, 14);
        cm.cntchk = 5;
        tab1(cm);
        report("H mirror-2", cm);

        // ---- I. selection with a trailing open <p> -> mirror false -----------
        cm = fresh();
        editor.setText("<p></p><p>");
        editor.select(0, 10);
        cm.cntchk = 5;
        tab1(cm);
        report("I mirror-open-tail", cm);

        // ---- J. selection of exactly one polygon -----------------------------
        cm = fresh();
        editor.setText("<p>abc</p>");
        editor.select(0, 10);
        cm.cntchk = 5;
        tab1(cm);
        report("J mirror-1", cm);

        // ---- K. find/replace enable flags ------------------------------------
        cm = fresh();
        editor.setText("body");
        editor.select(0, 0);
        srch.setText("find me");
        rplc.setText("");
        cm.cntchk = 5;
        tab1(cm);
        report("K find-only", cm);

        cm = fresh();
        editor.setText("body");
        editor.select(0, 0);
        srch.setText("find me");
        rplc.setText("with this");
        cm.cntchk = 5;
        tab1(cm);
        report("K2 find-and-replace", cm);

        // ---- L. prefs pane: font menu selection drives cfont ------------------
        cm = fresh();
        editor.setText("");
        editor.select(0, 0);
        srch.setText("");
        rplc.setText("");
        cm.prefs = true;
        cm.fontsel.add(mg, "Monospaced");
        cm.fontsel.add(mg, "Arial");
        cm.fontsel.add(mg, "Courier");
        for (int i = 0; i < 8; ++i) cm.ctheme.add(mg, "theme" + i);
        cm.cntprf = 0;
        tab1(cm);
        report("L prefs-first-frame", cm);

        // second frame, with the user having picked "Courier" and theme 5
        cm.fontsel.select("Courier");
        cm.ctheme.select(5);
        cm.btn = 0;
        tab1(cm);
        report("L2 prefs-font-and-theme-change", cm);

        // ---- M. cntprf hits 200 and closes the prefs strip --------------------
        cm = fresh();
        editor.setText("");
        editor.select(0, 0);
        cm.prefs = true;
        cm.fontsel.add(mg, "Monospaced");
        for (int i = 0; i < 8; ++i) cm.ctheme.add(mg, "theme" + i);
        cm.fontsel.show();
        cm.ctheme.show();
        cm.cntprf = 199;
        tab1(cm);
        report("M cntprf-200", cm);

        // ---- N. openm hides the editor ---------------------------------------
        cm = fresh();
        editor.setText("");
        editor.select(0, 0);
        cm.openm = true;
        cm.cntchk = 5;
        tab1(cm);
        System.out.println("N openm-hides-editor | editorShowing=" + editor.isShowing());
        editor.show();

        // ---- O. tab != 1 is a no-op ------------------------------------------
        cm = fresh();
        cm.tab = 0;
        cm.tabed = 5;
        cm.npolys = 42;
        cm.cntchk = 9;
        tab1(cm);
        report("O tab-not-1", cm);

        System.out.println("Done.");
        frame.dispose();
        System.exit(0);
    }
}
