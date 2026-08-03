package tools;

import java.awt.Color;
import java.beans.PropertyChangeSupport;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import sun.misc.Unsafe;

public class ShapeProbe {
    static Unsafe unsafe;
    static Object cm;
    static Class<?> cmClass;

    static Object getField(Object obj, String fieldName) throws Exception {
        Class<?> cls = obj.getClass();
        while (cls != null) {
            try {
                Field f = cls.getDeclaredField(fieldName);
                f.setAccessible(true);
                return f.get(obj);
            } catch (NoSuchFieldException e) {
                cls = cls.getSuperclass();
            }
        }
        throw new NoSuchFieldException(fieldName);
    }

    static void setField(Object obj, String fieldName, Object val) throws Exception {
        Class<?> cls = obj.getClass();
        while (cls != null) {
            try {
                Field f = cls.getDeclaredField(fieldName);
                f.setAccessible(true);
                f.set(obj, val);
                return;
            } catch (NoSuchFieldException e) {
                cls = cls.getSuperclass();
            }
        }
        throw new NoSuchFieldException(fieldName);
    }

    static Object getCmField(String fieldName) throws Exception {
        Field f = cmClass.getDeclaredField(fieldName);
        f.setAccessible(true);
        return f.get(cm);
    }

    static void setCmField(String fieldName, Object val) throws Exception {
        Field f = cmClass.getDeclaredField(fieldName);
        f.setAccessible(true);
        f.set(cm, val);
    }

    static void fixMediumRandom(Object mObj) throws Exception {
        setField(mObj, "cntrn", 20);
        setField(mObj, "rand", new int[]{5, 5, 5});
        setField(mObj, "diup", new boolean[]{false, false, false});
        setField(mObj, "trn", 0);
    }

    public static void main(String[] args) throws Exception {
        Field f = Unsafe.class.getDeclaredField("theUnsafe");
        f.setAccessible(true);
        unsafe = (Unsafe) f.get(null);

        cmClass = Class.forName("CarMaker");
        cm = unsafe.allocateInstance(cmClass);

        Object mObj = Class.forName("Medium").getDeclaredConstructor().newInstance();
        setCmField("m", mObj);

        // 1. py
        Method pyMethod = cmClass.getDeclaredMethod("py", int.class, int.class, int.class, int.class);
        pyMethod.setAccessible(true);
        int py1 = (Integer) pyMethod.invoke(cm, -50000, 50000, -60000, 60000);
        int py2 = (Integer) pyMethod.invoke(cm, 123456, -654321, -987654, 456789);
        System.out.println("py1: " + py1);
        System.out.println("py2: " + py2);

        // 2. xs & ys
        setField(mObj, "cz", 50);
        setField(mObj, "focus_point", 200);
        setField(mObj, "cx", 400);
        setField(mObj, "cy", 300);
        Method xsMethod = cmClass.getDeclaredMethod("xs", int.class, int.class);
        xsMethod.setAccessible(true);
        Method ysMethod = cmClass.getDeclaredMethod("ys", int.class, int.class);
        ysMethod.setAccessible(true);
        int xs1 = (Integer) xsMethod.invoke(cm, -80000, 30);
        int xs2 = (Integer) xsMethod.invoke(cm, 90000, 500);
        int ys1 = (Integer) ysMethod.invoke(cm, -70000, 20);
        int ys2 = (Integer) ysMethod.invoke(cm, 85000, 600);
        System.out.println("xs1: " + xs1);
        System.out.println("xs2: " + xs2);
        System.out.println("ys1: " + ys1);
        System.out.println("ys2: " + ys2);

        // 3. rot
        int[] arrX = new int[]{-5000, 10000, -15000};
        int[] arrY = new int[]{8000, -12000, 20000};
        Method rotMethod = cmClass.getDeclaredMethod("rot", int[].class, int[].class, int.class, int.class, int.class, int.class);
        rotMethod.setAccessible(true);
        rotMethod.invoke(cm, arrX, arrY, 100, -200, 45, 3);
        System.out.println("rotX: " + arrX[0] + "," + arrX[1] + "," + arrX[2]);
        System.out.println("rotY: " + arrY[0] + "," + arrY[1] + "," + arrY[2]);

        // 4. crash
        Class<?> scClass = Class.forName("soundClip");
        Object lowcrashs = Array.newInstance(scClass, 3);
        Object crashs = Array.newInstance(scClass, 3);
        for (int i = 0; i < 3; i++) {
            Array.set(lowcrashs, i, unsafe.allocateInstance(scClass));
            Array.set(crashs, i, unsafe.allocateInstance(scClass));
        }
        setCmField("lowcrashs", lowcrashs);
        setCmField("crashs", crashs);
        setCmField("crshturn", 0);
        setCmField("crashup", false);

        Method crashMethod = cmClass.getDeclaredMethod("crash", float.class);
        crashMethod.setAccessible(true);

        crashMethod.invoke(cm, 150.0f);
        int turn1 = (Integer) getCmField("crshturn");
        crashMethod.invoke(cm, 200.0f);
        int turn2 = (Integer) getCmField("crshturn");
        crashMethod.invoke(cm, -180.0f);
        int turn3 = (Integer) getCmField("crshturn");

        setCmField("crashup", true);
        crashMethod.invoke(cm, 50.0f);
        int turn4 = (Integer) getCmField("crshturn");
        System.out.println("crashTurns: " + turn1 + "," + turn2 + "," + turn3 + "," + turn4);

        // 5. setheme
        Object editor = unsafe.allocateInstance(Class.forName("java.awt.TextArea"));
        setField(editor, "objectLock", new Object());
        setCmField("editor", editor);
        setCmField("deff", new Color(10, 20, 30));
        setCmField("defb", new Color(40, 50, 60));

        Method sethemeMethod = cmClass.getDeclaredMethod("setheme");
        sethemeMethod.setAccessible(true);

        setCmField("cthm", 0);
        sethemeMethod.invoke(cm);
        Method getFg = editor.getClass().getMethod("getForeground");
        Method getBg = editor.getClass().getMethod("getBackground");

        Color fg0 = (Color) getFg.invoke(editor);
        Color bg0 = (Color) getBg.invoke(editor);

        setCmField("cthm", 5);
        sethemeMethod.invoke(cm);
        Color fg5 = (Color) getFg.invoke(editor);
        Color bg5 = (Color) getBg.invoke(editor);

        System.out.println("theme0_fg: " + fg0.getRed() + "," + fg0.getGreen() + "," + fg0.getBlue());
        System.out.println("theme0_bg: " + bg0.getRed() + "," + bg0.getGreen() + "," + bg0.getBlue());
        System.out.println("theme5_fg: " + fg5.getRed() + "," + fg5.getGreen() + "," + fg5.getBlue());
        System.out.println("theme5_bg: " + bg5.getRed() + "," + bg5.getGreen() + "," + bg5.getBlue());

        // 6. regx
        setupContOForReg();
        fixMediumRandom(mObj);
        setCmField("hitmag", 1000);
        setCmField("actmag", 50);
        setCmField("crash", new int[]{500, 20, 10});

        Method regxMethod = cmClass.getDeclaredMethod("regx", int.class, float.class, boolean.class);
        regxMethod.setAccessible(true);

        regxMethod.invoke(cm, 0, 500.0f, true);
        int hitmag1 = (Integer) getCmField("hitmag");
        int actmag1 = (Integer) getCmField("actmag");
        Object oObj = getCmField("o");
        Object[] planes = (Object[]) getField(oObj, "p");
        int[] ox0 = (int[]) getField(planes[0], "ox");
        int[] oz0 = (int[]) getField(planes[0], "oz");
        int bfase0 = (Integer) getField(planes[0], "bfase");
        int[] c0 = (int[]) getField(planes[0], "c");

        System.out.println("regx_hitmag: " + hitmag1);
        System.out.println("regx_actmag: " + actmag1);
        System.out.println("regx_ox0: " + ox0[0] + "," + ox0[1]);
        System.out.println("regx_oz0: " + oz0[0] + "," + oz0[1]);
        System.out.println("regx_bfase0: " + bfase0);
        System.out.println("regx_c0: " + c0[0] + "," + c0[1] + "," + c0[2]);

        // 7. regz
        setupContOForReg();
        fixMediumRandom(mObj);
        setCmField("hitmag", 2000);
        setCmField("actmag", 100);
        setCmField("crash", new int[]{600, 30, 15});

        Method regzMethod = cmClass.getDeclaredMethod("regz", int.class, float.class, boolean.class);
        regzMethod.setAccessible(true);

        regzMethod.invoke(cm, 0, -600.0f, true);
        int hitmag2 = (Integer) getCmField("hitmag");
        int actmag2 = (Integer) getCmField("actmag");
        planes = (Object[]) getField(getCmField("o"), "p");
        ox0 = (int[]) getField(planes[0], "ox");
        oz0 = (int[]) getField(planes[0], "oz");
        bfase0 = (Integer) getField(planes[0], "bfase");
        c0 = (int[]) getField(planes[0], "c");

        System.out.println("regz_hitmag: " + hitmag2);
        System.out.println("regz_actmag: " + actmag2);
        System.out.println("regz_ox0: " + ox0[0] + "," + ox0[1]);
        System.out.println("regz_oz0: " + oz0[0] + "," + oz0[1]);
        System.out.println("regz_bfase0: " + bfase0);
        System.out.println("regz_c0: " + c0[0] + "," + c0[1] + "," + c0[2]);

        // 8. roofsqsh (run multiple times until Math.random() <= 0.9 so Math.random() > 0.9 does not trigger)
        int hitmag3 = 0, squash3 = 0, bfase0_roof = 0;
        int[] oy0 = null;
        int[] c0_roof = null;

        Method roofsqshMethod = cmClass.getDeclaredMethod("roofsqsh", float.class);
        roofsqshMethod.setAccessible(true);

        for (int trial = 0; trial < 100; trial++) {
            setupContOForReg();
            fixMediumRandom(mObj);
            setCmField("hitmag", 500);
            setCmField("squash", 0);
            setCmField("crash", new int[]{400, 15, 30});

            roofsqshMethod.invoke(cm, 400.0f);
            hitmag3 = (Integer) getCmField("hitmag");
            squash3 = (Integer) getCmField("squash");
            planes = (Object[]) getField(getCmField("o"), "p");
            oy0 = (int[]) getField(planes[0], "oy");
            bfase0_roof = (Integer) getField(planes[0], "bfase");
            c0_roof = (int[]) getField(planes[0], "c");

            // When Math.random() <= 0.9, hitmag3 is 510 (500 + 5 + 5).
            // When Math.random() > 0.9, hitmag3 is 514 (500 + 5 + 5 + 4 due to consuming 1 extra random).
            if (hitmag3 == 510) {
                break;
            }
        }

        System.out.println("roofsqsh_hitmag: " + hitmag3);
        System.out.println("roofsqsh_squash: " + squash3);
        System.out.println("roofsqsh_oy0: " + oy0[0] + "," + oy0[1]);
        System.out.println("roofsqsh_bfase0: " + bfase0_roof);
        System.out.println("roofsqsh_c0: " + c0_roof[0] + "," + c0_roof[1] + "," + c0_roof[2]);
    }

    static void setupContOForReg() throws Exception {
        Class<?> contoClass = Class.forName("ContO");
        Object oObj = unsafe.allocateInstance(contoClass);
        setField(oObj, "npl", 1);
        setField(oObj, "keyx", new int[]{100, 200});
        setField(oObj, "keyz", new int[]{300, 400});
        setField(oObj, "xz", 30);
        setField(oObj, "zy", 15);
        setField(oObj, "xy", 10);
        setField(oObj, "roofat", 50);

        Class<?> planeClass = Class.forName("Plane");
        Object planeObj = unsafe.allocateInstance(planeClass);
        setField(planeObj, "n", 2);
        setField(planeObj, "wz", 0);
        setField(planeObj, "ox", new int[]{110, 120});
        setField(planeObj, "oy", new int[]{55, 60});
        setField(planeObj, "oz", new int[]{310, 320});
        setField(planeObj, "nocol", false);
        setField(planeObj, "glass", 0);
        setField(planeObj, "bfase", 22);
        setField(planeObj, "hsb", new float[]{0.1f, 0.3f, 0.8f});
        setField(planeObj, "c", new int[]{100, 150, 200});
        setField(planeObj, "gr", 0);
        setField(planeObj, "chip", 0);
        setField(planeObj, "ctmag", 0.0f);

        Object planes = Array.newInstance(planeClass, 1);
        Array.set(planes, 0, planeObj);
        setField(oObj, "p", planes);

        setCmField("o", oObj);
    }
}
