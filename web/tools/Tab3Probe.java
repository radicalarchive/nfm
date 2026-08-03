package tools;

import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Composite;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.GraphicsConfiguration;
import java.awt.Image;
import java.awt.Paint;
import java.awt.Rectangle;
import java.awt.RenderingHints;
import java.awt.Shape;
import java.awt.Stroke;
import java.awt.geom.AffineTransform;
import java.awt.font.FontRenderContext;
import java.awt.font.GlyphVector;
import java.awt.image.BufferedImage;
import java.awt.image.BufferedImageOp;
import java.awt.image.ImageObserver;
import java.awt.image.RenderedImage;
import java.awt.image.renderable.RenderableImage;
import java.lang.reflect.Field;
import java.text.AttributedCharacterIterator;
import java.util.ArrayList;
import java.util.List;
import sun.misc.Unsafe;

/**
 * Tab3Probe -- drives the REAL CarMaker.run() through its `if (this.tab == 3)`
 * block (CarMaker.java:2478-2858), the chunk transpiled to web/careditor/tab3.js.
 *
 * The block is inline in run() and cannot be invoked on its own, so this probe
 * runs run() itself:
 *
 *   - CarMaker is allocated with Unsafe (its constructor and Applet's touch
 *     AWT), and every field run()'s prologue and the tab==3 block read is set
 *     by reflection.
 *   - `rd` is a recording Graphics2D that logs every call the block makes, in
 *     order, and delegates to a real BufferedImage Graphics2D so font metrics
 *     are genuine. Its FontMetrics is wrapped too, so every stringWidth() the
 *     block asks for is logged with its answer -- the JS test replays exactly
 *     those widths, which is what makes the coordinate comparison meaningful
 *     across two different text rasterisers.
 *   - Madness.fpath is pointed at an empty temp directory so loadsounds(),
 *     loadbase() and loadsettings() find nothing (all three swallow it) and
 *     NOTHING is written into the repo's mycars/ (see WORK.md 2026-08-02).
 *   - run()'s loop is exited by throwing a private Stop from the recorder when
 *     it sees the tail block's `fillRect(0, 0, 700, 25)`, i.e. the first call
 *     after the tab==3 block has finished.
 *
 * The -Dhttp.proxy* pair is NOT optional: multiplayer.needformadness.com is
 * still answering, so without it the real Java takes the network paths this
 * chunk drops (case C's `++nmc` fires and the row loop then reads a null car
 * name). Pointing http at a closed port forces the offline branch, which is the
 * branch tab3.js hard-codes.
 *
 * Compile / run:
 *   JAR=/tmp/claude-1000/-home-evan-games-nfm/careditor/jar
 *   PROBE=/tmp/claude-1000/-home-evan-games-nfm/careditor/probe
 *   javac -nowarn -cp $JAR -d $PROBE Tab3Probe.java
 *   java -Djava.awt.headless=true \
 *        -Dhttp.proxyHost=127.0.0.1 -Dhttp.proxyPort=1 \
 *        --add-opens java.desktop/java.awt=ALL-UNNAMED \
 *        -cp $PROBE:$JAR tools.Tab3Probe
 *
 * --add-opens is needed for Component.objectLock (see allocComponent).
 */
public class Tab3Probe {

    // ---- reflection helpers -------------------------------------------------

    static Unsafe unsafe;
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

    static void set(String name, Object val) throws Exception { field(cm, name).set(cm, val); }
    static void setInt(String name, int val) throws Exception { field(cm, name).setInt(cm, val); }
    static void setBool(String name, boolean val) throws Exception { field(cm, name).setBoolean(cm, val); }
    static Object get(String name) throws Exception { return field(cm, name).get(cm); }
    static int getInt(String name) throws Exception { return field(cm, name).getInt(cm); }

    static Object alloc(String cls) throws Exception {
        return unsafe.allocateInstance(Class.forName(cls));
    }

    /**
     * An AWT text widget with its constructor skipped. Component's constructor
     * is what allocates `objectLock`, and setFont()/setForeground() synchronize
     * on it, so it has to be put back by hand.
     */
    static Object allocComponent(String cls) throws Exception {
        Object o = alloc(cls);
        Field lock = Class.forName("java.awt.Component").getDeclaredField("objectLock");
        lock.setAccessible(true);
        lock.set(o, new Object());
        return o;
    }

    /** java.awt.TextComponent's backing string, with no peer to read it from. */
    static void setText(Object comp, String text) throws Exception {
        Field f = Class.forName("java.awt.TextComponent").getDeclaredField("text");
        f.setAccessible(true);
        f.set(comp, text);
    }

    /** Thrown by the recorder to break out of run()'s `while (!exwist)` loop. */
    static class Stop extends RuntimeException {}

    // ---- the recorder -------------------------------------------------------

    static final String SETUP_END = "--SETUP-END--";
    static final List<String> log = new ArrayList<String>();
    static boolean recording = false;

    static void rec(String s) { if (recording) log.add(s); }

    /** FontMetrics wrapper: logs every stringWidth the chunk asks for. */
    static class RecFontMetrics extends FontMetrics {
        final FontMetrics d;
        RecFontMetrics(FontMetrics d) { super(d.getFont()); this.d = d; }
        public int stringWidth(String s) {
            int w = d.stringWidth(s);
            Font fo = getFont();
            rec("stringWidth|" + fo.getName() + "," + fo.getStyle() + "," + fo.getSize()
                    + "|" + s.replace("\n", "\\n") + "|" + w);
            return w;
        }
        public int getHeight() { return d.getHeight(); }
        public int charWidth(char c) { return d.charWidth(c); }
        public int charWidth(int c) { return d.charWidth(c); }
        public int getAscent() { return d.getAscent(); }
        public int getDescent() { return d.getDescent(); }
        public int getLeading() { return d.getLeading(); }
        public int[] getWidths() { return d.getWidths(); }
    }

    static class Rec extends Graphics2D {
        final Graphics2D d;
        Rec(Graphics2D d) { this.d = d; }

        // --- the calls the chunk actually makes, all logged ------------------
        public void setColor(Color c) {
            rec("setColor|" + c.getRed() + "," + c.getGreen() + "," + c.getBlue());
            d.setColor(c);
        }
        public void setFont(Font f) {
            rec("setFont|" + f.getName() + "," + f.getStyle() + "," + f.getSize());
            d.setFont(f);
        }
        public FontMetrics getFontMetrics() {
            rec("getFontMetrics");
            return new RecFontMetrics(d.getFontMetrics());
        }
        public FontMetrics getFontMetrics(Font f) { return new RecFontMetrics(d.getFontMetrics(f)); }
        public void drawString(String s, int x, int y) {
            rec("drawString|" + s.replace("\n", "\\n") + "|" + x + "|" + y);
            d.drawString(s, x, y);
        }
        public void drawLine(int x1, int y1, int x2, int y2) {
            rec("drawLine|" + x1 + "|" + y1 + "|" + x2 + "|" + y2);
            d.drawLine(x1, y1, x2, y2);
        }
        public void drawRect(int x, int y, int w, int h) {
            rec("drawRect|" + x + "|" + y + "|" + w + "|" + h);
            d.drawRect(x, y, w, h);
        }
        public void fillRect(int x, int y, int w, int h) {
            // The tail block's first call: the tab==3 block is done, stop run().
            if (recording && x == 0 && y == 0 && w == 700 && h == 25) throw new Stop();
            rec("fillRect|" + x + "|" + y + "|" + w + "|" + h);
            d.fillRect(x, y, w, h);
        }
        public void setComposite(Composite c) {
            if (c instanceof AlphaComposite) rec("setComposite|" + ((AlphaComposite) c).getAlpha());
            d.setComposite(c);
        }
        public void fillPolygon(int[] xs, int[] ys, int n) {
            StringBuilder sb = new StringBuilder("fillPolygon|" + n);
            for (int i = 0; i < n; i++) sb.append("|").append(xs[i]).append(",").append(ys[i]);
            rec(sb.toString());
            d.fillPolygon(xs, ys, n);
        }
        public boolean drawImage(Image img, int x, int y, ImageObserver o) {
            rec("drawImage|" + x + "|" + y);
            return true;
        }

        // --- pure delegation -------------------------------------------------
        public Graphics create() { return this; }
        public void translate(int x, int y) { d.translate(x, y); }
        public Color getColor() { return d.getColor(); }
        public void setPaintMode() { d.setPaintMode(); }
        public void setXORMode(Color c) { d.setXORMode(c); }
        public Font getFont() { return d.getFont(); }
        public Rectangle getClipBounds() { return d.getClipBounds(); }
        public void clipRect(int x, int y, int w, int h) { d.clipRect(x, y, w, h); }
        public void setClip(int x, int y, int w, int h) { d.setClip(x, y, w, h); }
        public Shape getClip() { return d.getClip(); }
        public void setClip(Shape s) { d.setClip(s); }
        public void copyArea(int x, int y, int w, int h, int dx, int dy) { d.copyArea(x, y, w, h, dx, dy); }
        public void clearRect(int x, int y, int w, int h) { d.clearRect(x, y, w, h); }
        public void drawRoundRect(int x, int y, int w, int h, int aw, int ah) { d.drawRoundRect(x, y, w, h, aw, ah); }
        public void fillRoundRect(int x, int y, int w, int h, int aw, int ah) { d.fillRoundRect(x, y, w, h, aw, ah); }
        public void drawOval(int x, int y, int w, int h) { d.drawOval(x, y, w, h); }
        public void fillOval(int x, int y, int w, int h) { d.fillOval(x, y, w, h); }
        public void drawArc(int x, int y, int w, int h, int a, int b) { d.drawArc(x, y, w, h, a, b); }
        public void fillArc(int x, int y, int w, int h, int a, int b) { d.fillArc(x, y, w, h, a, b); }
        public void drawPolyline(int[] xs, int[] ys, int n) { d.drawPolyline(xs, ys, n); }
        public void drawPolygon(int[] xs, int[] ys, int n) { d.drawPolygon(xs, ys, n); }
        public void drawString(AttributedCharacterIterator it, int x, int y) { d.drawString(it, x, y); }
        public boolean drawImage(Image i, int x, int y, int w, int h, ImageObserver o) { return true; }
        public boolean drawImage(Image i, int x, int y, Color c, ImageObserver o) { return true; }
        public boolean drawImage(Image i, int x, int y, int w, int h, Color c, ImageObserver o) { return true; }
        public boolean drawImage(Image i, int dx1, int dy1, int dx2, int dy2, int sx1, int sy1, int sx2, int sy2, ImageObserver o) { return true; }
        public boolean drawImage(Image i, int dx1, int dy1, int dx2, int dy2, int sx1, int sy1, int sx2, int sy2, Color c, ImageObserver o) { return true; }
        public void dispose() {}
        public void draw(Shape s) { d.draw(s); }
        public boolean drawImage(Image i, AffineTransform t, ImageObserver o) { return true; }
        public void drawImage(BufferedImage i, BufferedImageOp op, int x, int y) {}
        public void drawRenderedImage(RenderedImage i, AffineTransform t) {}
        public void drawRenderableImage(RenderableImage i, AffineTransform t) {}
        public void drawString(String s, float x, float y) { d.drawString(s, x, y); }
        public void drawString(AttributedCharacterIterator it, float x, float y) { d.drawString(it, x, y); }
        public void drawGlyphVector(GlyphVector g, float x, float y) { d.drawGlyphVector(g, x, y); }
        public void fill(Shape s) { d.fill(s); }
        public boolean hit(Rectangle r, Shape s, boolean b) { return d.hit(r, s, b); }
        public GraphicsConfiguration getDeviceConfiguration() { return d.getDeviceConfiguration(); }
        public void setPaint(Paint p) { d.setPaint(p); }
        public void setStroke(Stroke s) { d.setStroke(s); }
        public void setRenderingHint(RenderingHints.Key k, Object v) { d.setRenderingHint(k, v); }
        public Object getRenderingHint(RenderingHints.Key k) { return d.getRenderingHint(k); }
        public void setRenderingHints(java.util.Map<?, ?> m) { d.setRenderingHints(m); }
        public void addRenderingHints(java.util.Map<?, ?> m) { d.addRenderingHints(m); }
        public RenderingHints getRenderingHints() { return d.getRenderingHints(); }
        public void translate(double x, double y) { d.translate(x, y); }
        public void rotate(double t) { d.rotate(t); }
        public void rotate(double t, double x, double y) { d.rotate(t, x, y); }
        public void scale(double x, double y) { d.scale(x, y); }
        public void shear(double x, double y) { d.shear(x, y); }
        public void transform(AffineTransform t) { d.transform(t); }
        public void setTransform(AffineTransform t) { d.setTransform(t); }
        public AffineTransform getTransform() { return d.getTransform(); }
        public Paint getPaint() { return d.getPaint(); }
        public Composite getComposite() { return d.getComposite(); }
        public void setBackground(Color c) { d.setBackground(c); }
        public Color getBackground() { return d.getBackground(); }
        public Stroke getStroke() { return d.getStroke(); }
        public void clip(Shape s) { d.clip(s); }
        public FontRenderContext getFontRenderContext() { return d.getFontRenderContext(); }
    }

    // ---- driving run() ------------------------------------------------------

    /**
     * Set up a fresh CarMaker, run one iteration of run()'s loop with tab == 3,
     * and return the recorded call log.
     */
    static List<String> drive(Setup setup) throws Exception {
        cm = alloc("CarMaker");
        log.clear();
        recording = false;

        BufferedImage img = new BufferedImage(700, 550, BufferedImage.TYPE_INT_RGB);
        Graphics2D real = img.createGraphics();
        Rec rec = new Rec(real);

        set("rd", rec);
        set("thredo", new Thread());
        set("btgame", new Image[2]);
        set("m", Class.forName("Medium").getDeclaredConstructor().newInstance());
        set("t", Class.forName("Trackers").getDeclaredConstructor().newInstance());
        set("compo", java.lang.reflect.Array.newInstance(Class.forName("ContO"), 16));
        set("crashs", java.lang.reflect.Array.newInstance(Class.forName("soundClip"), 3));
        set("lowcrashs", java.lang.reflect.Array.newInstance(Class.forName("soundClip"), 3));
        set("engs", java.lang.reflect.Array.newInstance(Class.forName("soundClip"), 5, 5));

        set("editor", allocComponent("java.awt.TextArea"));
        set("srch", allocComponent("java.awt.TextField"));
        set("rplc", allocComponent("java.awt.TextField"));
        Object[] wv = (Object[]) java.lang.reflect.Array.newInstance(Class.forName("java.awt.TextField"), 16);
        for (int i = 0; i < 16; i++) wv[i] = allocComponent("java.awt.TextField");
        set("wv", wv);
        set("tnick", allocComponent("java.awt.TextField"));
        set("tpass", allocComponent("java.awt.TextField"));
        setText(get("tnick"), "");
        setText(get("tpass"), "");

        set("slcar", newSmenu(2000));
        set("fontsel", newSmenu(40));
        set("ctheme", newSmenu(40));
        set("compcar", newSmenu(40));
        set("cls", newSmenu(40));
        set("simcar", newSmenu(40));
        set("engine", newSmenu(40));
        set("witho", newSmenu(40));
        set("pubitem", newSmenu(707));
        set("pubtyp", newSmenu(40));

        set("carname", "MyCar");
        set("scar", "");
        set("suser", "Horaks");
        set("sfont", "Monospaced");
        set("cfont", "Monospaced");
        set("lastedo", "");
        set("fcol", "");
        set("ofcol", "");
        set("scol", "");
        set("oscol", "");
        set("aply1", "");
        set("aply2", "");
        set("justpubd", "");
        set("mycars", new String[20]);
        set("maker", new String[20]);
        set("pubt", new int[20]);
        set("clas", new int[20]);
        set("nad", new int[20]);
        set("addeda", new String[20][5000]);
        set("bx", new int[24]);
        set("by", new int[24]);
        set("bw", new int[24]);
        set("pessd", new boolean[24]);
        set("stat", new int[5]);
        set("rstat", new int[5]);
        set("phys", new int[11]);
        set("rphys", new int[11]);
        set("crash", new int[3]);
        set("rcrash", new int[3]);
        set("adna", new int[6]);
        set("scale", new int[] { 100, 100, 100 });
        set("oscale", new int[] { 100, 100, 100 });
        set("fhsb", new float[3]);
        set("shsb", new float[3]);
        set("pnx", new int[11]);
        set("pname", new String[11]);
        set("usage", new String[16]);
        set("carstat", new int[16][5]);
        set("defb", new Color(255, 255, 255));
        set("deff", new Color(0, 0, 0));

        setInt("tab", 3);
        setInt("tabed", 3);
        setInt("logged", 0);
        setInt("nmc", 0);
        setInt("roto", 0);
        setInt("xm", 0);
        setInt("ym", 0);
        setInt("mouses", 0);
        setInt("btn", 0);
        setInt("cthm", 1);   // avoid setheme()'s defb/deff branch entirely
        setInt("apx", 0);
        setInt("apy", 0);
        setBool("exwist", false);
        setBool("loadedfile", true);
        setBool("openm", false);
        setBool("mousdr", false);

        // Recording is on across setup too: the Smenu.add() calls a case makes
        // measure strings, and the JS test needs those widths to build the same
        // Smenu. Everything up to the marker is setup, not expected output.
        recording = true;
        setup.apply();
        log.add(SETUP_END);

        // Nothing must be found on disk, and nothing must be written to the
        // repo's mycars/ (WORK.md 2026-08-02).
        java.io.File tmp = java.io.File.createTempFile("nfmprobe", "");
        tmp.delete();
        tmp.mkdirs();
        Field fpath = Class.forName("Madness").getDeclaredField("fpath");
        fpath.setAccessible(true);
        fpath.set(null, tmp.getAbsolutePath() + java.io.File.separator);
        Field testdrive = Class.forName("Madness").getDeclaredField("testdrive");
        testdrive.setAccessible(true);
        testdrive.setInt(null, 0);

        try {
            cm.getClass().getDeclaredMethod("run").invoke(cm);
        } catch (java.lang.reflect.InvocationTargetException e) {
            if (e.getCause() instanceof Stop) {
                // run()'s tail sets the colour for the tab bar one statement
                // before the sentinel fillRect (CarMaker.java:2861). That call
                // is outside the chunk, so drop it.
                log.remove(log.size() - 1);
            } else if (e.getCause() instanceof java.awt.HeadlessException) {
                // JOptionPane cannot open a dialog headless. It is the last
                // statement of the branch that reaches it, and the state it
                // reports is already set, so record it and carry on.
                log.add("showMessageDialog");
            } else {
                System.out.println("!! aborted after " + log.size() + " calls, last:");
                for (int i = Math.max(0, log.size() - 6); i < log.size(); i++) {
                    System.out.println("   " + log.get(i));
                }
                throw (Exception) e.getCause();
            }
        }
        recording = false;
        real.dispose();
        // run()'s loop head paints the background before reaching the tab
        // blocks: setColor(225,225,225); fillRect(0,0,700,550); setColor(0,0,0).
        // Drop those three so the log resumes exactly at CarMaker.java:2479.
        int marker = log.indexOf(SETUP_END);
        for (int i = 0; i < 3; i++) log.remove(marker + 1);
        return new ArrayList<String>(log);
    }

    interface Setup { void apply() throws Exception; }

    static Object newSmenu(int n) throws Exception {
        return Class.forName("Smenu").getDeclaredConstructor(int.class).newInstance(n);
    }

    static void dump(String title, List<String> l) throws Exception {
        System.out.println("=== " + title + " ===");
        for (String s : l) System.out.println(s);
        System.out.println("--- fields: logged=" + getInt("logged")
                + " nmc=" + getInt("nmc") + " roto=" + getInt("roto")
                + " btn=" + getInt("btn"));
        System.out.println("=== end " + title + " ===");
    }

    public static void main(String[] args) throws Exception {
        System.setProperty("java.awt.headless", "true");
        Field f = Unsafe.class.getDeclaredField("theUnsafe");
        f.setAccessible(true);
        unsafe = (Unsafe) f.get(null);

        // A: the login pane. logged == 0, publish type 0 (pubtyp.select(1) only
        // fires once pubtyp is showing, and it is not on the first frame).
        dump("A logged=0", drive(new Setup() { public void apply() throws Exception {
            setInt("logged", 0);
            set("carname", "MyCar");
        }}));

        // B: logged == -1, "Ready to publish", with a car name that exercises
        // the two-string concatenation in the drawString width.
        dump("B logged=-1", drive(new Setup() { public void apply() throws Exception {
            setInt("logged", -1);
            set("carname", "Radical One");
        }}));

        // C: logged == 2, the per-car info fetch. mycars[roto] comes from
        // pubitem's selection; roto is negative-adjacent (19, the last slot) to
        // exercise the array indexing, and nmc/roto must NOT advance.
        dump("C logged=2", drive(new Setup() { public void apply() throws Exception {
            setInt("logged", 2);
            setInt("roto", 19);
            setInt("nmc", 1);
            Object pubitem = get("pubitem");
            Class<?> sm = pubitem.getClass();
            java.lang.reflect.Method add = sm.getDeclaredMethod("add", Graphics2D.class, String.class);
            add.setAccessible(true);
            add.invoke(pubitem, get("rd"), "Account Cars");
            add.invoke(pubitem, get("rd"), "Kool Kat");
            java.lang.reflect.Field sel = sm.getDeclaredField("sel");
            sel.setAccessible(true);
            sel.setInt(pubitem, 1);
            // logged 2 -> 3 happens in this same pass, so the row the
            // logged==3 block then draws has to be populated too.
            String[] mycars = (String[]) get("mycars");
            mycars[0] = "Kool Kat";   // b6 true -> logged is not forced to 2
            ((String[]) get("maker"))[0] = "Horaks";
            ((int[]) get("pubt"))[0] = 0;
            ((int[]) get("clas"))[0] = 1;
        }}));

        // D: logged == 1, the account list fetch.
        dump("D logged=1", drive(new Setup() { public void apply() throws Exception {
            setInt("logged", 1);
            set("justpubd", "");
        }}));

        // E: logged == 3, four rows covering every class, publish type and the
        // "You"/maker, "N Players"/"None" and Download/no-Download branches.
        // Row 2 has pubt = -1 (the error row). Mouse parked at (0,0) so no
        // ovbutton fires and the row highlight stays off.
        dump("E logged=3", drive(new Setup() { public void apply() throws Exception {
            setInt("logged", 3);
            setInt("nmc", 4);
            setInt("xm", 0);
            setInt("ym", 0);
            String[] mycars = (String[]) get("mycars");
            String[] maker = (String[]) get("maker");
            int[] pubt = (int[]) get("pubt");
            int[] clas = (int[]) get("clas");
            int[] nad = (int[]) get("nad");
            mycars[0] = "Kool Kat";   maker[0] = "HORAKS"; pubt[0] = 0; clas[0] = 0; nad[0] = 0;
            mycars[1] = "Radical One"; maker[1] = "Bob";   pubt[1] = 2; clas[1] = 4; nad[1] = 5;
            mycars[2] = "Broken";      maker[2] = "";      pubt[2] = -1; clas[2] = 0; nad[2] = 0;
            mycars[3] = "El King";     maker[3] = "Ann";   pubt[3] = 1; clas[3] = 3; nad[3] = 1;
            setText(get("tnick"), "horaks");
        }}));

        // F: logged == 3 with the mouse INSIDE row 1, so the row highlight and
        // the hover colour fire, and with a wide row count so the y arithmetic
        // is exercised well past the first row.
        dump("F logged=3 hover", drive(new Setup() { public void apply() throws Exception {
            setInt("logged", 3);
            setInt("nmc", 6);
            setInt("xm", 300);
            setInt("ym", 175);   // row 1: 142+20 < 175 < 160+20
            String[] mycars = (String[]) get("mycars");
            String[] maker = (String[]) get("maker");
            int[] pubt = (int[]) get("pubt");
            int[] clas = (int[]) get("clas");
            int[] nad = (int[]) get("nad");
            for (int i = 0; i < 6; i++) {
                mycars[i] = "Car" + i;
                maker[i] = "Maker" + i;
                pubt[i] = i % 3;
                clas[i] = i % 5;
                nad[i] = i;
            }
            setText(get("tnick"), "maker3");
        }}));

        // G: logged == 3 with the mouse ON row 1's "X" button and the button
        // held (mouses == 1), which is ovbutton()'s pressed rendering -- the
        // other half of that branch, and the only one the hit test's
        // |ym - n2 + 5| < 10 arithmetic reaches. mouses == 1 rather than -1
        // deliberately: at -1 ovbutton returns true and the code walks into
        // JOptionPane, which cannot open a dialog headless.
        dump("G logged=3 pressed", drive(new Setup() { public void apply() throws Exception {
            setInt("logged", 3);
            setInt("nmc", 2);
            setInt("xm", 665);
            setInt("ym", 176);
            setInt("mouses", 1);
            String[] mycars = (String[]) get("mycars");
            String[] maker = (String[]) get("maker");
            int[] pubt = (int[]) get("pubt");
            int[] clas = (int[]) get("clas");
            int[] nad = (int[]) get("nad");
            mycars[0] = "Kool Kat";    maker[0] = "Ann"; pubt[0] = 1; clas[0] = 2; nad[0] = 1;
            mycars[1] = "Radical One"; maker[1] = "Ann"; pubt[1] = 2; clas[1] = 3; nad[1] = 4;
            setText(get("tnick"), "ANN");
        }}));
    }
}
