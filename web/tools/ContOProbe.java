package tools;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Arrays;

public class ContOProbe {

    public static void main(String[] args) throws Exception {
        System.out.println("=== ContO Probe Output ===");

        // Load classes from classpath
        Class<?> mediumClass = Class.forName("Medium");
        Class<?> trackersClass = Class.forName("Trackers");
        Class<?> contOClass = Class.forName("ContO");

        Object medium = mediumClass.getDeclaredConstructor().newInstance();
        Object trackers = trackersClass.getDeclaredConstructor().newInstance();

        // 1. Probe xs & ys
        Method xsMethod = contOClass.getDeclaredMethod("xs", int.class, int.class);
        Method ysMethod = contOClass.getDeclaredMethod("ys", int.class, int.class);
        xsMethod.setAccessible(true);
        ysMethod.setAccessible(true);

        // Dummy ContO instance with default medium
        Object dummyContO = contOClass.getDeclaredConstructor(int.class, int.class, int.class, mediumClass, trackersClass, int.class, int.class, int.class)
                .newInstance(0, 0, 0, medium, trackers, 0, 0, 0);

        int[][] xsYsCases = {
            {0, 100},
            {400, 5000},
            {-3000, 12000},
            {800, 50},
            {123, 100000},
            {-50000, -20000},
            {70000, 30}
        };

        System.out.println("--- xs / ys ---");
        for (int[] c : xsYsCases) {
            int resX = (int) xsMethod.invoke(dummyContO, c[0], c[1]);
            int resY = (int) ysMethod.invoke(dummyContO, c[0], c[1]);
            System.out.println("xs(" + c[0] + ", " + c[1] + ") = " + resX + " | ys(" + c[0] + ", " + c[1] + ") = " + resY);
        }

        // 2. Probe py & getpy
        Method pyMethod = contOClass.getDeclaredMethod("py", int.class, int.class, int.class, int.class);
        Method getpyMethod = contOClass.getDeclaredMethod("getpy", int.class, int.class, int.class);
        pyMethod.setAccessible(true);
        getpyMethod.setAccessible(true);

        System.out.println("--- py ---");
        int[][] pyCases = {
            {0, 0, 0, 0},
            {10, 5, 20, 8},
            {-100, 50, -200, 300},
            {50000, 0, 50000, 0},
            {-60000, 20000, -80000, -30000}
        };
        for (int[] c : pyCases) {
            int resPy = (int) pyMethod.invoke(dummyContO, c[0], c[1], c[2], c[3]);
            System.out.println("py(" + c[0] + ", " + c[1] + ", " + c[2] + ", " + c[3] + ") = " + resPy);
        }

        System.out.println("--- getpy ---");
        Field xField = contOClass.getDeclaredField("x"); xField.setAccessible(true);
        Field yField = contOClass.getDeclaredField("y"); yField.setAccessible(true);
        Field zField = contOClass.getDeclaredField("z"); zField.setAccessible(true);
        xField.set(dummyContO, 100);
        yField.set(dummyContO, -200);
        zField.set(dummyContO, 300);

        int[][] getpyCases = {
            {100, -200, 300},
            {500, 1000, -500},
            {-10000, 20000, -30000}
        };
        for (int[] c : getpyCases) {
            int resGetpy = (int) getpyMethod.invoke(dummyContO, c[0], c[1], c[2]);
            System.out.println("getpy(" + c[0] + ", " + c[1] + ", " + c[2] + ") = " + resGetpy);
        }

        // 3. Probe rot
        Method rotMethod = contOClass.getDeclaredMethod("rot", int[].class, int[].class, int.class, int.class, int.class, int.class);
        rotMethod.setAccessible(true);

        System.out.println("--- rot ---");
        int[] angles = {37, 90, -45, 405, 180, 1, 359};
        for (int ang : angles) {
            int[] x = {100, -250, 3000, 17};
            int[] z = {40, 900, -1200, 6};
            rotMethod.invoke(dummyContO, x, z, 10, -20, ang, 4);
            System.out.println("rot(ang=" + ang + ") x=" + Arrays.toString(x) + " z=" + Arrays.toString(z));
        }

        System.out.println("--- rot drift (1000 iter) ---");
        int[] x2 = {1000, -500};
        int[] z2 = {750, 250};
        for (int i = 0; i < 1000; i++) {
            rotMethod.invoke(dummyContO, x2, z2, 0, 0, 7, 2);
        }
        System.out.println("x2=" + Arrays.toString(x2) + " z2=" + Arrays.toString(z2));

        // 4. Probe getvalue
        Method getvalueMethod = contOClass.getDeclaredMethod("getvalue", String.class, String.class, int.class);
        getvalueMethod.setAccessible(true);

        System.out.println("--- getvalue ---");
        String[][] gvCases = {
            {"c", "c(200,100,50)", "0"},
            {"c", "c(200,100,50)", "1"},
            {"c", "c(200,100,50)", "2"},
            {"p", "p(-10,20,-30)", "0"},
            {"p", "p(-10,20,-30)", "1"},
            {"p", "p(-10,20,-30)", "2"},
            {"w", "w(1,2,3,4,5,6)", "5"}
        };
        for (String[] c : gvCases) {
            int tag = Integer.parseInt(c[2]);
            int resGv = (int) getvalueMethod.invoke(dummyContO, c[0], c[1], tag);
            System.out.println("getvalue(" + c[0] + ", " + c[1] + ", " + tag + ") = " + resGv);
        }

        // Initialize shadow arrays for dust & sprk
        Field shadowField = contOClass.getDeclaredField("shadow"); shadowField.setAccessible(true);
        shadowField.set(dummyContO, true);

        Field stgField = contOClass.getDeclaredField("stg"); stgField.setAccessible(true); stgField.set(dummyContO, new int[20]);
        Field sxField = contOClass.getDeclaredField("sx"); sxField.setAccessible(true); sxField.set(dummyContO, new int[20]);
        Field syField = contOClass.getDeclaredField("sy"); syField.setAccessible(true); syField.set(dummyContO, new int[20]);
        Field szField = contOClass.getDeclaredField("sz"); szField.setAccessible(true); szField.set(dummyContO, new int[20]);
        Field scxField = contOClass.getDeclaredField("scx"); scxField.setAccessible(true); scxField.set(dummyContO, new int[20]);
        Field sczField = contOClass.getDeclaredField("scz"); sczField.setAccessible(true); sczField.set(dummyContO, new int[20]);
        Field osmagField = contOClass.getDeclaredField("osmag"); osmagField.setAccessible(true); osmagField.set(dummyContO, new float[20]);
        Field savField = contOClass.getDeclaredField("sav"); savField.setAccessible(true); savField.set(dummyContO, new int[20]);
        Field smagField = contOClass.getDeclaredField("smag"); smagField.setAccessible(true); smagField.set(dummyContO, new float[20][8]);
        Field srgbField = contOClass.getDeclaredField("srgb"); srgbField.setAccessible(true); srgbField.set(dummyContO, new int[20][3]);
        Field sblnField = contOClass.getDeclaredField("sbln"); sblnField.setAccessible(true); sblnField.set(dummyContO, new float[20]);

        Field rtgField = contOClass.getDeclaredField("rtg"); rtgField.setAccessible(true); rtgField.set(dummyContO, new int[100]);
        Field rbefField = contOClass.getDeclaredField("rbef"); rbefField.setAccessible(true); rbefField.set(dummyContO, new boolean[100]);
        Field rxField = contOClass.getDeclaredField("rx"); rxField.setAccessible(true); rxField.set(dummyContO, new int[100]);
        Field ryField = contOClass.getDeclaredField("ry"); ryField.setAccessible(true); ryField.set(dummyContO, new int[100]);
        Field rzField = contOClass.getDeclaredField("rz"); rzField.setAccessible(true); rzField.set(dummyContO, new int[100]);
        Field vrxField = contOClass.getDeclaredField("vrx"); vrxField.setAccessible(true); vrxField.set(dummyContO, new float[100]);
        Field vryField = contOClass.getDeclaredField("vry"); vryField.setAccessible(true); vryField.set(dummyContO, new float[100]);
        Field vrzField = contOClass.getDeclaredField("vrz"); vrzField.setAccessible(true); vrzField.set(dummyContO, new float[100]);

        // 5. Probe dust & sprk
        Method dustMethod = contOClass.getDeclaredMethod("dust", int.class, float.class, float.class, float.class, int.class, int.class, float.class, int.class, boolean.class);
        dustMethod.setAccessible(true);
        dustMethod.invoke(dummyContO, 0, 100.0f, -50.0f, 200.0f, 300, 400, 1.5f, 10, false);

        int[] sx = (int[]) sxField.get(dummyContO);
        int[] sy = (int[]) syField.get(dummyContO);
        int[] sz = (int[]) szField.get(dummyContO);
        int[] stg = (int[]) stgField.get(dummyContO);
        int[] scx = (int[]) scxField.get(dummyContO);
        int[] scz = (int[]) sczField.get(dummyContO);

        System.out.println("--- dust state ---");
        System.out.println("sx[1]=" + sx[1] + " sy[1]=" + sy[1] + " sz[1]=" + sz[1] + " stg[1]=" + stg[1] + " scx[1]=" + scx[1] + " scz[1]=" + scz[1]);

        Method sprkMethod = contOClass.getDeclaredMethod("sprk", float.class, float.class, float.class, float.class, float.class, float.class, int.class);
        sprkMethod.setAccessible(true);
        sprkMethod.invoke(dummyContO, 50.0f, 150.0f, 250.0f, 10.0f, 20.0f, 30.0f, 0);

        Field srxField = contOClass.getDeclaredField("srx"); srxField.setAccessible(true);
        Field sryField = contOClass.getDeclaredField("sry"); sryField.setAccessible(true);
        Field srzField = contOClass.getDeclaredField("srz"); srzField.setAccessible(true);
        Field sprkField = contOClass.getDeclaredField("sprk"); sprkField.setAccessible(true);

        System.out.println("--- sprk state ---");
        System.out.println("srx=" + srxField.get(dummyContO) + " sry=" + sryField.get(dummyContO) + " srz=" + srzField.get(dummyContO) + " sprk=" + sprkField.get(dummyContO));
    }
}
