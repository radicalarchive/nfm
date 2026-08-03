package tools;

import java.awt.Color;
import java.awt.Component;
import java.awt.FontMetrics;
import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.TextArea;
import java.awt.TextField;
import java.awt.TextComponent;
import java.awt.image.BufferedImage;
import java.lang.reflect.Array;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import sun.misc.Unsafe;

public class Tab2Probe {
    private static Object cm;
    private static Class<?> cmClass;
    private static Unsafe unsafe;
    private static Class<?> smenuClass;
    private static Object compcar, simcar, cls, engine, witho, pubtyp, pubitem, fontsel, ctheme, slcar;

    private static void setField(Object obj, Class<?> cls, String name, Object val) throws Exception {
        Field f = cls.getDeclaredField(name);
        f.setAccessible(true);
        f.set(obj, val);
    }

    private static Object getField(Object obj, Class<?> cls, String name) throws Exception {
        Field f = cls.getDeclaredField(name);
        f.setAccessible(true);
        return f.get(obj);
    }

    private static void setCmField(String name, Object val) throws Exception {
        setField(cm, cmClass, name, val);
    }

    private static Object getCmField(String name) throws Exception {
        return getField(cm, cmClass, name);
    }

    private static void initComponentLocks(Component comp) throws Exception {
        setField(comp, Component.class, "objectLock", new Object());
    }

    private static void initSmenu(Object smenu, Class<?> smenuClass) throws Exception {
        setField(smenu, smenuClass, "bcol", Color.BLACK);
        setField(smenu, smenuClass, "fcol", Color.WHITE);
        setField(smenu, smenuClass, "dis", false);
        setField(smenu, smenuClass, "no", 16);
        String[] sopts = new String[100];
        String[] opts = new String[100];
        for (int i = 0; i < 100; i++) {
            sopts[i] = "";
            opts[i] = "";
        }
        setField(smenu, smenuClass, "sopts", sopts);
        setField(smenu, smenuClass, "opts", opts);
        setField(smenu, smenuClass, "sel", 0);
    }

    private static void resetSmenus() throws Exception {
        setField(compcar, smenuClass, "sel", 0);
        setCmField("compsel", 0);
        setField(simcar, smenuClass, "sel", 0);
        setCmField("carsel", 0);
        setField(cls, smenuClass, "sel", 0);
        setCmField("clsel", 0);
        setField(engine, smenuClass, "sel", 0);
        setCmField("engsel", 0);
        setField(witho, smenuClass, "sel", 0);
        setField(pubtyp, smenuClass, "sel", 0);
        setField(pubitem, smenuClass, "sel", 0);
        setField(fontsel, smenuClass, "sel", 0);
        setField(ctheme, smenuClass, "sel", 0);
        setField(slcar, smenuClass, "sel", 0);
    }

    private static void runSingleTick() throws Exception {
        setCmField("exwist", false);
        setCmField("loadedfile", true);
        Object ed = getCmField("editor");
        String text = (String) getField(ed, TextComponent.class, "text");
        setCmField("lastedo", text);
        setCmField("tabed", -1);
        setCmField("dtabed", -1);
        Thread t = new Thread(new Runnable() {
            public void run() {
                try {
                    Method runMethod = cmClass.getDeclaredMethod("run");
                    runMethod.invoke(cm);
                } catch (Throwable ex) {
                    ex.printStackTrace(System.out);
                }
            }
        });
        t.start();
        
        long start = System.currentTimeMillis();
        while (System.currentTimeMillis() - start < 200) {
            Thread.sleep(5);
            setCmField("exwist", true);
        }
        setCmField("exwist", true);
        t.join(500);
    }

    public static void main(String[] args) throws Exception {
        cmClass = Class.forName("CarMaker");
        Field unsafeField = Unsafe.class.getDeclaredField("theUnsafe");
        unsafeField.setAccessible(true);
        unsafe = (Unsafe) unsafeField.get(null);
        cm = unsafe.allocateInstance(cmClass);

        Class<?> madClass = Class.forName("Madness");
        Field tdField = madClass.getDeclaredField("testdrive");
        tdField.setAccessible(true);
        tdField.setInt(null, 1);

        Class<?> scClass = Class.forName("soundClip");
        setCmField("engs", Array.newInstance(scClass, 5, 5));
        setCmField("crashs", Array.newInstance(scClass, 3));
        setCmField("lowcrashs", Array.newInstance(scClass, 3));

        setCmField("thredo", Thread.currentThread());
        setCmField("btgame", new Image[2]);
        setCmField("carname", "");
        setCmField("cfont", "Arial");
        setCmField("loadedfile", true);
        setCmField("compsel", 0);
        setCmField("carsel", 0);
        setCmField("clsel", 0);
        setCmField("engsel", 0);

        Class<?> trackClass = Class.forName("Trackers");
        Object trackers = unsafe.allocateInstance(trackClass);
        setCmField("t", trackers);

        // Setup Medium and ContO mocks/instances
        Class<?> medClass = Class.forName("Medium");
        Object med = medClass.getDeclaredConstructor().newInstance();
        setCmField("m", med);

        Class<?> contoClass = Class.forName("ContO");
        Object conto = unsafe.allocateInstance(contoClass);
        setField(conto, contoClass, "m", med);
        setField(conto, contoClass, "t", trackers);
        setCmField("o", conto);

        // Create compo array
        Object compoArray = Array.newInstance(contoClass, 16);
        for (int i = 0; i < 16; i++) {
            Object oComp = unsafe.allocateInstance(contoClass);
            setField(oComp, contoClass, "m", med);
            setField(oComp, contoClass, "t", trackers);
            Array.set(compoArray, i, oComp);
        }
        setCmField("compo", compoArray);

        // Setup Graphics2D
        BufferedImage img = new BufferedImage(800, 600, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = img.createGraphics();
        setCmField("rd", g2d);

        // Setup widgets with Unsafe so AWT constructors don't check headless
        TextArea editor = (TextArea) unsafe.allocateInstance(TextArea.class);
        initComponentLocks(editor);
        setField(editor, TextComponent.class, "text", "");
        setCmField("editor", editor);

        TextField srch = (TextField) unsafe.allocateInstance(TextField.class);
        initComponentLocks(srch);
        setField(srch, TextComponent.class, "text", "");
        setCmField("srch", srch);

        TextField rplc = (TextField) unsafe.allocateInstance(TextField.class);
        initComponentLocks(rplc);
        setField(rplc, TextComponent.class, "text", "");
        setCmField("rplc", rplc);

        TextField tpass = (TextField) unsafe.allocateInstance(TextField.class);
        initComponentLocks(tpass);
        setCmField("tpass", tpass);

        TextField tnick = (TextField) unsafe.allocateInstance(TextField.class);
        initComponentLocks(tnick);
        setCmField("tnick", tnick);

        smenuClass = Class.forName("Smenu");
        compcar = unsafe.allocateInstance(smenuClass);
        initSmenu(compcar, smenuClass);
        setCmField("compcar", compcar);

        simcar = unsafe.allocateInstance(smenuClass);
        initSmenu(simcar, smenuClass);
        setCmField("simcar", simcar);

        cls = unsafe.allocateInstance(smenuClass);
        initSmenu(cls, smenuClass);
        setCmField("cls", cls);

        engine = unsafe.allocateInstance(smenuClass);
        initSmenu(engine, smenuClass);
        setCmField("engine", engine);

        witho = unsafe.allocateInstance(smenuClass);
        initSmenu(witho, smenuClass);
        setCmField("witho", witho);

        pubtyp = unsafe.allocateInstance(smenuClass);
        initSmenu(pubtyp, smenuClass);
        setCmField("pubtyp", pubtyp);

        pubitem = unsafe.allocateInstance(smenuClass);
        initSmenu(pubitem, smenuClass);
        setCmField("pubitem", pubitem);

        fontsel = unsafe.allocateInstance(smenuClass);
        initSmenu(fontsel, smenuClass);
        setCmField("fontsel", fontsel);

        ctheme = unsafe.allocateInstance(smenuClass);
        initSmenu(ctheme, smenuClass);
        setCmField("ctheme", ctheme);

        slcar = unsafe.allocateInstance(smenuClass);
        initSmenu(slcar, smenuClass);
        setCmField("slcar", slcar);

        TextField[] wv = new TextField[16];
        for (int i = 0; i < 16; i++) {
            wv[i] = (TextField) unsafe.allocateInstance(TextField.class);
            initComponentLocks(wv[i]);
            setField(wv[i], TextComponent.class, "text", "");
        }
        setCmField("wv", wv);

        // Setup state arrays
        int[] adna = new int[6];
        setCmField("adna", adna);
        int[] scale = new int[3];
        int[] oscale = new int[3];
        setCmField("scale", scale);
        setCmField("oscale", oscale);
        float[] fhsb = new float[3];
        float[] shsb = new float[3];
        setCmField("fhsb", fhsb);
        setCmField("shsb", shsb);
        int[] stat = new int[5];
        int[] rstat = new int[5];
        setCmField("stat", stat);
        setCmField("rstat", rstat);
        int[][] carstat = new int[16][5];
        for (int i = 0; i < 16; i++) {
            carstat[i] = new int[] { 100 + i * 5, 120 + i * 2, 110 + i * 3, 130 - i * 2, 140 + i };
        }
        setCmField("carstat", carstat);
        int[] phys = new int[11];
        int[] rphys = new int[11];
        setCmField("phys", phys);
        setCmField("rphys", rphys);
        int[] crash = new int[3];
        int[] rcrash = new int[3];
        setCmField("crash", crash);
        setCmField("rcrash", rcrash);
        String[] pname = new String[15];
        int[] pnx = new int[15];
        String[] usage = new String[15];
        for (int i = 0; i < 15; i++) {
          pname[i] = "P" + i;
          pnx[i] = 100 + i * 10;
          usage[i] = "Usage " + i;
        }
        setCmField("pname", pname);
        setCmField("pnx", pnx);
        setCmField("usage", usage);

        int[] fcol = new int[] { 100, 150, 200 };
        int[] scol = new int[] { 50, 75, 100 };
        setField(conto, contoClass, "fcol", fcol);
        setField(conto, contoClass, "scol", scol);

        int[] keyx = new int[4];
        int[] keyz = new int[4];
        keyx[0] = -100; keyz[0] = -100;
        keyx[1] = 100;  keyz[1] = -100;
        keyx[2] = -100; keyz[2] = 100;
        keyx[3] = 100;  keyz[3] = 100;
        setField(conto, contoClass, "keyx", keyx);
        setField(conto, contoClass, "keyz", keyz);

        int[] bx = new int[100];
        int[] by = new int[100];
        int[] bw = new int[100];
        boolean[] pessd = new boolean[100];
        setCmField("bx", bx);
        setCmField("by", by);
        setCmField("bw", bw);
        setCmField("pessd", pessd);

        String carText = "// car: testcar\nstat(180,160,140,120,100)\nphysics(10,20,30,40,50,60,70,80,90,100,110,12,14,16,2)\n<p>\nc(100,200,100)\np(-40,-50,80)\np(-40,-50,-70)\np(40,-50,-70)\np(40,-50,80)\n</p>\n";

        // Run tests
        System.out.println("=== TEST 1: dtab = 2, controls rotation & adna adjustments ===");
        resetSmenus();
        setCmField("carname", "");
        setCmField("tab", 2);
        setCmField("dtab", 2);
        setField(editor, TextComponent.class, "text", carText);
        setCmField("xm", 500);
        setCmField("ym", 450);
        adna[0] = 10; adna[1] = -20; adna[2] = 30; adna[3] = -40; adna[4] = 50; adna[5] = -60;
        setField(conto, contoClass, "x", 1000);
        setField(conto, contoClass, "y", -500);
        setField(conto, contoClass, "z", 2000);
        setField(conto, contoClass, "xz", 45);
        setField(conto, contoClass, "xy", 90);
        setField(conto, contoClass, "zy", 180);

        runSingleTick();

        System.out.println("adna=" + java.util.Arrays.toString((int[])getCmField("adna")));
        System.out.println("ox=" + getCmField("ox") + ", oy=" + getCmField("oy") + ", oz=" + getCmField("oz"));
        System.out.println("oxz=" + getCmField("oxz") + ", oxy=" + getCmField("oxy") + ", ozy=" + getCmField("ozy"));

        System.out.println("\n=== TEST 2: dtab = 1, Color Edit ===");
        resetSmenus();
        setCmField("carname", "");
        setCmField("tab", 2);
        setCmField("dtab", 1);
        setField(editor, TextComponent.class, "text", carText);
        setField(conto, contoClass, "colok", 2);

        runSingleTick();

        System.out.println("fcol=" + java.util.Arrays.toString((int[])getField(conto, contoClass, "fcol")));
        System.out.println("scol=" + java.util.Arrays.toString((int[])getField(conto, contoClass, "scol")));
        System.out.println("fhsb=" + java.util.Arrays.toString((float[])getCmField("fhsb")));
        System.out.println("shsb=" + java.util.Arrays.toString((float[])getCmField("shsb")));

        System.out.println("\n=== TEST 3: dtab = 4, Stats & Class ===");
        resetSmenus();
        setCmField("carname", "");
        setCmField("tab", 2);
        setCmField("dtab", 4);
        setField(editor, TextComponent.class, "text", carText);

        runSingleTick();

        System.out.println("stat=" + java.util.Arrays.toString((int[])getCmField("stat")));
        System.out.println("rstat=" + java.util.Arrays.toString((int[])getCmField("rstat")));
        System.out.println("statdef=" + getCmField("statdef"));
        System.out.println("clsel=" + getCmField("clsel"));
        System.out.println("carsel=" + getCmField("carsel"));

        System.out.println("\n=== TEST 4: dtab = 5, Physics ===");
        resetSmenus();
        setCmField("carname", "");
        setCmField("tab", 2);
        setCmField("dtab", 5);
        setField(editor, TextComponent.class, "text", carText);

        runSingleTick();

        System.out.println("phys=" + java.util.Arrays.toString((int[])getCmField("phys")));
        System.out.println("rphys=" + java.util.Arrays.toString((int[])getCmField("rphys")));
        System.out.println("crash=" + java.util.Arrays.toString((int[])getCmField("crash")));
        System.out.println("rcrash=" + java.util.Arrays.toString((int[])getCmField("rcrash")));
        System.out.println("engsel=" + getCmField("engsel"));
        System.out.println("crashok=" + getCmField("crashok"));

        System.out.println("\n=== TEST 5: Movement keys ===");
        resetSmenus();
        setCmField("carname", "");
        setCmField("tab", 2);
        setCmField("dtab", 0);
        setField(editor, TextComponent.class, "text", carText);
        setCmField("rotr", true);
        setCmField("up", true);
        setCmField("plus", true);

        runSingleTick();

        System.out.println("o.xz=" + getField(conto, contoClass, "xz") + ", o.zy=" + getField(conto, contoClass, "zy") + ", o.y=" + getField(conto, contoClass, "y"));
    }
}
