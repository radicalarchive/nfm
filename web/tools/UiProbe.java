package tools;

import java.awt.Component;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import sun.misc.Unsafe;

public class UiProbe {
    private static Object cm;
    private static Class<?> cmClass;
    private static Unsafe unsafe;

    static class DummyComponent extends Component {
        public int x, y, width, height;
        @Override public int getX() { return x; }
        @Override public int getY() { return y; }
        @Override public int getWidth() { return width; }
        @Override public int getHeight() { return height; }
        @Override public void setBounds(int x, int y, int w, int h) {
            this.x = x;
            this.y = y;
            this.width = w;
            this.height = h;
        }
    }

    private static void setField(String name, Object val) throws Exception {
        Field f = cmClass.getDeclaredField(name);
        f.setAccessible(true);
        f.set(cm, val);
    }

    private static Object getField(String name) throws Exception {
        Field f = cmClass.getDeclaredField(name);
        f.setAccessible(true);
        return f.get(cm);
    }

    private static Method getMethod(String name, Class<?>... paramTypes) throws Exception {
        Method m = cmClass.getDeclaredMethod(name, paramTypes);
        m.setAccessible(true);
        return m;
    }

    public static void main(String[] args) throws Exception {
        cmClass = Class.forName("CarMaker");
        Field unsafeField = Unsafe.class.getDeclaredField("theUnsafe");
        unsafeField.setAccessible(true);
        unsafe = (Unsafe) unsafeField.get(null);
        cm = unsafe.allocateInstance(cmClass);

        // Initialize arrays
        int[] bx = new int[100];
        int[] by = new int[100];
        int[] bw = new int[100];
        boolean[] pessd = new boolean[100];
        setField("bx", bx);
        setField("by", by);
        setField("bw", bw);
        setField("pessd", pessd);

        BufferedImage img = new BufferedImage(100, 100, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = img.createGraphics();
        setField("rd", g2d);

        System.out.println("=== 1. movefield ===");
        Method movefieldMethod = getMethod("movefield", Component.class, int.class, int.class, int.class, int.class);
        setField("apx", 15);
        setField("apy", -30);
        
        DummyComponent testComp = (DummyComponent) unsafe.allocateInstance(DummyComponent.class);
        testComp.setBounds(0, 0, 10, 10);

        movefieldMethod.invoke(cm, testComp, 100, 200, 50, 25);
        System.out.println("comp bounds after movefield(100, 200, 50, 25): x=" + testComp.getX() + ", y=" + testComp.getY() + ", w=" + testComp.getWidth() + ", h=" + testComp.getHeight());

        setField("apx", -2000000000);
        setField("apy", -2000000000);
        movefieldMethod.invoke(cm, testComp, -1000000000, -1000000000, 80, 40);
        System.out.println("comp bounds after overflow movefield: x=" + testComp.getX() + ", y=" + testComp.getY() + ", w=" + testComp.getWidth() + ", h=" + testComp.getHeight());

        System.out.println("\n=== 2. stringbutton ===");
        Method stringbuttonMethod = getMethod("stringbutton", String.class, int.class, int.class, int.class, boolean.class);
        setField("btn", 0);
        
        stringbuttonMethod.invoke(cm, "Test Button", 100, 200, 4, false);
        int btnVal = (Integer) getField("btn");
        System.out.println("After stringbutton 1: btn=" + btnVal + ", bx[0]=" + bx[0] + ", by[0]=" + by[0] + ", bw[0]=" + bw[0]);

        stringbuttonMethod.invoke(cm, "Publish Car", -500, -300, -10, true);
        btnVal = (Integer) getField("btn");
        System.out.println("After stringbutton 2: btn=" + btnVal + ", bx[1]=" + bx[1] + ", by[1]=" + by[1] + ", bw[1]=" + bw[1]);

        pessd[2] = true;
        stringbuttonMethod.invoke(cm, "Pressed Btn", 300, 400, 2, false);
        btnVal = (Integer) getField("btn");
        System.out.println("After stringbutton 3 (pressed): btn=" + btnVal + ", bx[2]=" + bx[2] + ", by[2]=" + by[2] + ", bw[2]=" + bw[2]);

        System.out.println("\n=== 3. ovbutton ===");
        Method ovbuttonMethod = getMethod("ovbutton", String.class, int.class, int.class);
        
        setField("xm", 100);
        setField("ym", 200);
        setField("mouses", 0);
        boolean res1 = (Boolean) ovbuttonMethod.invoke(cm, "X", 100, 200);
        System.out.println("ovbutton 1: res=" + res1 + ", mouses=" + getField("mouses"));

        setField("xm", 100);
        setField("ym", 195);
        setField("mouses", -1);
        boolean res2 = (Boolean) ovbuttonMethod.invoke(cm, "Download", 100, 200);
        System.out.println("ovbutton 2 (click): res=" + res2 + ", mouses=" + getField("mouses"));

        setField("xm", 500);
        setField("ym", 500);
        setField("mouses", 1);
        boolean res3 = (Boolean) ovbuttonMethod.invoke(cm, "Cancel", 100, 200);
        System.out.println("ovbutton 3 (far away, mouses=1): res=" + res3 + ", mouses=" + getField("mouses"));

        System.out.println("\n=== 4. openlink & openhlink ===");
        Method openlinkMethod = getMethod("openlink");
        Method openhlinkMethod = getMethod("openhlink");
        openlinkMethod.invoke(cm);
        openhlinkMethod.invoke(cm);
        System.out.println("openlink & openhlink executed without throwing");

        System.out.println("\n=== 5. drawms ===");
        Method drawmsMethod = getMethod("drawms");
        Class<?> smenuClass = Class.forName("Smenu");
        Object smenuObj = unsafe.allocateInstance(smenuClass);
        setField("pubtyp", smenuObj);
        setField("pubitem", smenuObj);
        setField("fontsel", smenuObj);
        setField("ctheme", smenuObj);
        setField("compcar", smenuObj);
        setField("cls", smenuObj);
        setField("simcar", smenuObj);
        setField("engine", smenuObj);
        setField("witho", smenuObj);
        setField("slcar", smenuObj);
        setField("xm", 0);
        setField("ym", 0);
        setField("mousdr", false);
        drawmsMethod.invoke(cm);
        System.out.println("drawms executed: openm=" + getField("openm") + ", waso=" + getField("waso") + ", mouses=" + getField("mouses"));

        System.out.println("\n=== 6. hidefields ===");
        Method hidefieldsMethod = getMethod("hidefields");
        Object[] wvArray = (Object[]) java.lang.reflect.Array.newInstance(Class.forName("java.awt.TextField"), 16);
        for (int i = 0; i < 16; i++) {
            wvArray[i] = unsafe.allocateInstance(Class.forName("java.awt.TextField"));
        }
        setField("wv", wvArray);
        setField("tpass", unsafe.allocateInstance(Class.forName("java.awt.TextField")));
        setField("tnick", unsafe.allocateInstance(Class.forName("java.awt.TextField")));
        setField("editor", unsafe.allocateInstance(Class.forName("java.awt.TextArea")));
        setField("srch", unsafe.allocateInstance(Class.forName("java.awt.TextField")));
        setField("rplc", unsafe.allocateInstance(Class.forName("java.awt.TextField")));
        hidefieldsMethod.invoke(cm);
        System.out.println("hidefields executed without throwing");
    }
}
