package tools;

import java.awt.Color;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.lang.reflect.Field;
import java.lang.reflect.Method;

/**
 * BootProbe — drives the real CarMaker's `boot` chunk out of java/Game.jar.
 *
 * Covers CarMaker.java 355-429 (run() head), 2859-2920 (run() tail),
 * 4998-5157 (init), 5399-5439 (loadsounds), 5440-5472 (loadbase),
 * 5634-5644 (getImage).
 *
 * init() constructs java.awt.TextField, whose constructor calls
 * GraphicsEnvironment.checkHeadless(), so -Djava.awt.headless=true throws
 * before the loop at CarMaker.java:5151. This probe therefore runs under a
 * real (virtual) display instead:
 *
 *   mkdir -p /tmp/claude-1000/-home-evan-games-nfm/careditor/jar
 *   cd /tmp/claude-1000/-home-evan-games-nfm/careditor/jar && unzip -oq /home/evan/games/nfm/java/Game.jar
 *   javac -cp /tmp/claude-1000/-home-evan-games-nfm/careditor/jar \
 *         -d /tmp/claude-1000/-home-evan-games-nfm/careditor/probe \
 *         /home/evan/games/nfm/web/tools/BootProbe.java
 *   xvfb-run -a java -cp /tmp/claude-1000/-home-evan-games-nfm/careditor/probe:/tmp/claude-1000/-home-evan-games-nfm/careditor/jar \
 *        tools.BootProbe
 *
 * The applet is never made displayable, so createImage(700,550) returns null
 * exactly as it does here; `rd` is poked in as a BufferedImage Graphics2D so
 * init()'s setRenderingHint and the Smenu.add() font measuring have a real
 * context to run against, which is what the applet's own double buffer is.
 *
 * NOTHING here writes to disk: savefile()/newcar() are never invoked (a
 * previous delegated probe left files in mycars/).
 */
public class BootProbe {

    static Object cm;

    static Field field(Object obj, String name) throws Exception {
        Class<?> c = obj.getClass();
        while (c != null) {
            try {
                Field f = c.getDeclaredField(name);
                f.setAccessible(true);
                return f;
            } catch (NoSuchFieldException e) { c = c.getSuperclass(); }
        }
        throw new NoSuchFieldException(name);
    }

    static Object get(Object obj, String name) throws Exception { return field(obj, name).get(obj); }
    static void set(Object obj, String name, Object v) throws Exception { field(obj, name).set(obj, v); }
    static Object gcm(String name) throws Exception { return get(cm, name); }
    static void scm(String name, Object v) throws Exception { set(cm, name, v); }

    static void call(Object obj, String name) throws Exception {
        Method m = obj.getClass().getDeclaredMethod(name);
        m.setAccessible(true);
        m.invoke(obj);
    }

    static String col(Object c) {
        if (c == null) return "null";
        Color k = (Color) c;
        return k.getRed() + "," + k.getGreen() + "," + k.getBlue();
    }

    static String font(Object f) {
        if (f == null) return "null";
        Font k = (Font) f;
        return k.getName() + "/" + k.getStyle() + "/" + k.getSize();
    }

    /** Dump one Smenu: item list, geometry, font and colours after init(). */
    static void dumpSmenu(String label) throws Exception {
        Object sm = gcm(label);
        int no = (Integer) get(sm, "no");
        Object[] opts = (Object[]) get(sm, "opts");
        Object[] sopts = (Object[]) get(sm, "sopts");
        StringBuilder sb = new StringBuilder();
        sb.append("smenu ").append(label)
          .append(" no=").append(no)
          .append(" w=").append(get(sm, "w"))
          .append(" sel=").append(get(sm, "sel"))
          .append(" maxl=").append(get(sm, "maxl"))
          .append(" font=").append(font(get(sm, "font")))
          .append(" bcol=").append(col(get(sm, "bcol")))
          .append(" fcol=").append(col(get(sm, "fcol")))
          .append(" show=").append(get(sm, "show"));
        for (int i = 0; i < no; i++) {
            sb.append("\n    [").append(i).append("] opt=<").append(opts[i])
              .append("> sopt=<").append(sopts[i]).append(">");
        }
        System.out.println(sb);
    }

    static void dumpText(String label, Object w) throws Exception {
        System.out.println("text " + label
            + " font=" + font(((java.awt.Component) w).getFont())
            + " fg=" + col(((java.awt.Component) w).getForeground())
            + " bg=" + col(((java.awt.Component) w).getBackground())
            + " visible=" + ((java.awt.Component) w).isVisible());
    }

    public static void main(String[] args) throws Exception {
        String root = "/home/evan/games/nfm/";
        Class<?> madness = Class.forName("Madness");
        Field fpath = madness.getDeclaredField("fpath");
        fpath.setAccessible(true);
        fpath.set(null, root);

        Class<?> cmClass = Class.forName("CarMaker");
        cm = cmClass.getDeclaredConstructor().newInstance();

        BufferedImage buf = new BufferedImage(700, 550, BufferedImage.TYPE_INT_RGB);
        Graphics2D rd = buf.createGraphics();
        scm("rd", rd);

        // ---- init(), CarMaker.java:4998-5157 --------------------------------
        call(cm, "init");
        System.out.println("== init ==");
        for (String s : new String[] { "slcar", "fontsel", "ctheme", "compcar",
                                       "cls", "simcar", "witho", "engine",
                                       "pubtyp", "pubitem" }) {
            dumpSmenu(s);
        }
        dumpText("tnick", gcm("tnick"));
        dumpText("tpass", gcm("tpass"));
        dumpText("srch", gcm("srch"));
        dumpText("rplc", gcm("rplc"));
        dumpText("editor", gcm("editor"));
        System.out.println("tpass echo=" + (int) ((java.awt.TextField) gcm("tpass")).getEchoChar());
        System.out.println("defb=" + col(gcm("defb")) + " deff=" + col(gcm("deff")));
        Object[] wv = (Object[]) gcm("wv");
        for (int i = 0; i < 16; i++) dumpText("wv[" + i + "]", wv[i]);

        // ---- run() head, CarMaker.java:360-370 ------------------------------
        // The camera block, then Medium.fadfrom(8000) which is real Java code.
        Object m = gcm("m");
        set(m, "w", 700);
        set(m, "cx", 350);
        set(m, "y", -240);
        set(m, "z", -400);
        set(m, "zy", 4);
        set(m, "focus_point", 800);
        Method fadfrom = m.getClass().getDeclaredMethod("fadfrom", int.class);
        fadfrom.setAccessible(true);
        fadfrom.invoke(m, 8000);
        int[] cfade = (int[]) get(m, "cfade");
        cfade[0] = 187;
        cfade[1] = 210;
        cfade[2] = 227;
        System.out.println("== run head camera ==");
        System.out.println("m.w=" + get(m, "w") + " m.cx=" + get(m, "cx")
            + " m.y=" + get(m, "y") + " m.z=" + get(m, "z") + " m.zy=" + get(m, "zy")
            + " m.focus_point=" + get(m, "focus_point")
            + " m.fade=" + java.util.Arrays.toString((int[]) get(m, "fade"))
            + " cfade=" + cfade[0] + "," + cfade[1] + "," + cfade[2]);

        // `int n` initialisation, CarMaker.java:398-402.
        for (String carname : new String[] { "", "Simple Car" }) {
            scm("carname", carname);
            scm("tutok", false);
            int n = 0;
            if (!((String) gcm("carname")).equals("")) {
                scm("tutok", true);
                n = 1;
            }
            System.out.println("headn carname=<" + carname + "> n=" + n
                + " tutok=" + gcm("tutok"));
        }

        // ---- loadsounds(), CarMaker.java:5399-5439 --------------------------
        call(cm, "loadsounds");
        Object[][] engs = (Object[][]) gcm("engs");
        StringBuilder sb = new StringBuilder("engs=");
        for (int k = 0; k < 5; k++)
            for (int j = 0; j < 5; j++)
                sb.append(engs[k][j] != null ? "1" : "0");
        Object[] crashs = (Object[]) gcm("crashs");
        Object[] lowcrashs = (Object[]) gcm("lowcrashs");
        sb.append(" crashs=");
        for (int l = 0; l < 3; l++) sb.append(crashs[l] != null ? "1" : "0");
        sb.append(" lowcrashs=");
        for (int l = 0; l < 3; l++) sb.append(lowcrashs[l] != null ? "1" : "0");
        System.out.println("== loadsounds ==");
        System.out.println(sb);

        // ---- loadbase(), CarMaker.java:5440-5472 ----------------------------
        call(cm, "loadbase");
        Object[] compo = (Object[]) gcm("compo");
        System.out.println("== loadbase ==");
        for (int i = 0; i < 16; i++) {
            if (compo[i] == null) { System.out.println("compo[" + i + "]=null"); continue; }
            System.out.println("compo[" + i + "] npl=" + get(compo[i], "npl")
                + " maxR=" + get(compo[i], "maxR")
                + " shadow=" + get(compo[i], "shadow")
                + " noline=" + get(compo[i], "noline")
                + " disline=" + get(compo[i], "disline"));
        }

        // ---- run() tail, CarMaker.java:2859-2903 ----------------------------
        // Inline in run() and so not reflectively callable; the block is
        // replayed here against the real instance's fields, with the real AWT
        // FontMetrics, and every mutation printed.
        System.out.println("== run tail ==");
        rd.setFont(new Font("Arial", 1, 13));
        FontMetrics ftm = rd.getFontMetrics();
        String[] array17 = { "Car", "Code Edit", "3D Edit", "Publish" };
        for (int i = 0; i < 4; i++) {
            System.out.println("stringWidth[" + i + "]=" + ftm.stringWidth(array17[i]));
        }
        // Four scenarios: (tab, tabed, carname, loadedfile, sfase, xm, ym, mouses)
        int[][] cases = {
            { 2, 1, 1, 0,   40, 10, -1 },   // click tab 0 while on tab 2
            { 1, 1, 1, 0,  340, 10, -1 },   // click tab 3 while on tab 1 -> savefile
            { 0, 0, 0, 0,   40, 10, -1 },   // no car: n123 collapses to 1
            { 3, 3, 1, 2,  140, 10,  1 },   // sfase != 0 and no click
        };
        for (int[] c : cases) {
            scm("tab", c[0]);
            scm("tabed", c[1]);
            scm("carname", c[2] == 1 ? "Simple Car" : "");
            scm("loadedfile", c[2] == 1);
            scm("sfase", c[3]);
            scm("xm", c[4]);
            scm("ym", c[5]);
            scm("mouses", c[6]);
            boolean saved = false;

            if ((Integer) gcm("tabed") != (Integer) gcm("tab")) scm("tabed", gcm("tab"));
            int[] array18 = { 0, 0, 100, 90 };
            int n123 = 4;
            if (((String) gcm("carname")).equals("") || !((Boolean) gcm("loadedfile"))
                || (Integer) gcm("sfase") != 0) {
                scm("tab", 0);
                n123 = 1;
            }
            StringBuilder t = new StringBuilder();
            for (int tab = 0; tab < n123; tab++) {
                int xm = (Integer) gcm("xm"), ym = (Integer) gcm("ym");
                int drawx = tab * 100 + 45 - ftm.stringWidth(array17[tab]) / 2;
                t.append(" poly[").append(array18[0]).append(',').append(array18[1])
                 .append(',').append(array18[2]).append(',').append(array18[3])
                 .append("]@").append(drawx);
                if (xm > array18[0] && xm < array18[3] && ym > 0 && ym < 25
                    && (Integer) gcm("mouses") == -1) {
                    if ((Integer) gcm("tab") != tab && (Integer) gcm("tab") == 1) {
                        saved = true;   // this.savefile(); NOT invoked: it writes files
                    }
                    scm("tab", tab);
                }
                for (int n124 = 0; n124 < 4; n124++) array18[n124] += 100;
            }
            System.out.println("tail in=[" + c[0] + "," + c[1] + "," + c[2] + "," + c[3]
                + "," + c[4] + "," + c[5] + "," + c[6] + "] n123=" + n123
                + " tab=" + gcm("tab") + " tabed=" + gcm("tabed")
                + " savefile=" + saved + t);
        }

        System.exit(0);
    }
}
