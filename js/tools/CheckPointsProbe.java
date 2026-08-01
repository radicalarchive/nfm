import java.lang.reflect.*;
import java.util.Arrays;

/**
 * Reflection probe for CheckPoints.  Drives the real class from Game.jar,
 * prints exact field values that become the expected literals in
 * CheckPoints.test.js.
 *
 * Compile & run:
 *   javac -cp $JAR -d $PROBE CheckPointsProbe.java
 *   java  -cp $PROBE:$JAR CheckPointsProbe
 */
public class CheckPointsProbe {

    static Field f(Object o, String name) throws Exception {
        Field fld = o.getClass().getDeclaredField(name);
        fld.setAccessible(true);
        return fld;
    }

    static int[] getIntArr(Object o, String name) throws Exception {
        return (int[]) f(o, name).get(o);
    }

    static float[] getFloatArr(Object o, String name) throws Exception {
        return (float[]) f(o, name).get(o);
    }

    static int getInt(Object o, String name) throws Exception {
        return f(o, name).getInt(o);
    }

    static float getFloat(Object o, String name) throws Exception {
        return f(o, name).getFloat(o);
    }

    static void setInt(Object o, String name, int val) throws Exception {
        f(o, name).setInt(o, val);
    }

    static void setIntArr(Object o, String name, int[] val) throws Exception {
        f(o, name).set(o, val);
    }

    public static void main(String[] args) throws Exception {
        // ---- Test 1: py() with positive, negative, and zero inputs ----
        System.out.println("=== py() tests ===");
        CheckPoints cp = new CheckPoints();
        Method py = cp.getClass().getDeclaredMethod("py", int.class, int.class, int.class, int.class);
        py.setAccessible(true);

        // (0,0,0,0) -> 0
        System.out.println("py(0,0,0,0) = " + py.invoke(cp, 0, 0, 0, 0));
        // (100, 50, 200, 150) -> 50*50 + 50*50 = 5000
        System.out.println("py(100,50,200,150) = " + py.invoke(cp, 100, 50, 200, 150));
        // negative: (-300, 200, -100, 400) -> (-500)^2 + (-500)^2 = 500000
        System.out.println("py(-300,200,-100,400) = " + py.invoke(cp, -300, 200, -100, 400));
        // large values that cause int overflow with imul
        System.out.println("py(50000,0,50000,0) = " + py.invoke(cp, 50000, 0, 50000, 0));
        // very large: 100000 vs 0 -> (100000)^2 * 2 overflows int32
        System.out.println("py(100000,0,100000,0) = " + py.invoke(cp, 100000, 0, 100000, 0));

        // ---- Test 2: calprox() ----
        System.out.println("\n=== calprox() tests ===");

        // Test with a few checkpoint positions, including negatives
        CheckPoints cp2 = new CheckPoints();
        int[] xvals = new int[]{1000, -500, 3000, 200, 0, 0, 0, 0, 0, 0};
        int[] zvals = new int[]{-200, 800, -1500, 400, 0, 0, 0, 0, 0, 0};
        setIntArr(cp2, "x", xvals);
        setIntArr(cp2, "z", zvals);
        setInt(cp2, "n", 4);

        Method calprox = cp2.getClass().getDeclaredMethod("calprox");
        calprox.setAccessible(true);
        calprox.invoke(cp2);
        System.out.println("calprox n=4 prox = " + getFloat(cp2, "prox"));
        // print the raw int that became the divisor
        // The max of abs(x[i]-x[j]) and abs(z[i]-z[j]) over all pairs
        // x: 1000,-500,3000,200 -> max diff = |(-500)-3000| = 3500
        // z: -200,800,-1500,400 -> max diff = |(-1500)-800| = 2300
        // So n = 3500, prox = 3500/90.0f
        System.out.println("  (expected max spread = 3500, 3500/90f = " + (3500 / 90.0f) + ")");

        // Edge case: n=0 (no checkpoints) -> no loop iterations, n stays 0
        CheckPoints cp3 = new CheckPoints();
        setInt(cp3, "n", 0);
        calprox.invoke(cp3);
        System.out.println("calprox n=0 prox = " + getFloat(cp3, "prox"));

        // Edge case: n=1 -> outer loop 0..0 (i < n-1 = 0), no iterations
        CheckPoints cp4 = new CheckPoints();
        getIntArr(cp4, "x")[0] = 5000;
        getIntArr(cp4, "z")[0] = -3000;
        setInt(cp4, "n", 1);
        calprox.invoke(cp4);
        System.out.println("calprox n=1 prox = " + getFloat(cp4, "prox"));

        // Edge case: n=2 with negative values
        CheckPoints cp5 = new CheckPoints();
        getIntArr(cp5, "x")[0] = -7777;
        getIntArr(cp5, "x")[1] = 8888;
        getIntArr(cp5, "z")[0] = 12345;
        getIntArr(cp5, "z")[1] = -6789;
        setInt(cp5, "n", 2);
        calprox.invoke(cp5);
        System.out.println("calprox n=2 prox = " + getFloat(cp5, "prox"));
        System.out.println("  x spread = " + Math.abs(-7777 - 8888) + ", z spread = " + Math.abs(12345 - (-6789)));
        int maxSpread = Math.max(Math.abs(-7777 - 8888), Math.abs(12345 + 6789));
        System.out.println("  max = " + maxSpread + ", /90f = " + (maxSpread / 90.0f));

        // ---- Test 3: constructor defaults ----
        System.out.println("\n=== constructor defaults ===");
        CheckPoints cpd = new CheckPoints();
        System.out.println("pcs = " + getInt(cpd, "pcs"));
        System.out.println("nsp = " + getInt(cpd, "nsp"));
        System.out.println("n = " + getInt(cpd, "n"));
        System.out.println("fn = " + getInt(cpd, "fn"));
        System.out.println("nlaps = " + getInt(cpd, "nlaps"));
        System.out.println("nfix = " + getInt(cpd, "nfix"));
        System.out.println("notb = " + f(cpd, "notb").getBoolean(cpd));
        System.out.println("name = " + f(cpd, "name").get(cpd));
        System.out.println("maker = " + f(cpd, "maker").get(cpd));
        System.out.println("pubt = " + getInt(cpd, "pubt"));
        System.out.println("trackname = " + f(cpd, "trackname").get(cpd));
        System.out.println("trackvol = " + getInt(cpd, "trackvol"));
        System.out.println("top20 = " + getInt(cpd, "top20"));
        System.out.println("nto = " + getInt(cpd, "nto"));
        System.out.println("pos = " + Arrays.toString(getIntArr(cpd, "pos")));
        System.out.println("clear = " + Arrays.toString(getIntArr(cpd, "clear")));
        System.out.println("dested = " + Arrays.toString(getIntArr(cpd, "dested")));
        System.out.println("magperc = " + Arrays.toString(getFloatArr(cpd, "magperc")));
        System.out.println("wasted = " + getInt(cpd, "wasted"));
        System.out.println("haltall = " + f(cpd, "haltall").getBoolean(cpd));
        System.out.println("pcleared = " + getInt(cpd, "pcleared"));
        System.out.println("catchfin = " + getInt(cpd, "catchfin"));
        System.out.println("postwo = " + getInt(cpd, "postwo"));
        System.out.println("prox = " + getFloat(cpd, "prox"));
        System.out.println("x.length = " + getIntArr(cpd, "x").length);
        System.out.println("z.length = " + getIntArr(cpd, "z").length);
        System.out.println("y.length = " + getIntArr(cpd, "y").length);
        System.out.println("typ.length = " + getIntArr(cpd, "typ").length);
        System.out.println("fx.length = " + getIntArr(cpd, "fx").length);
        System.out.println("roted.length = " + ((boolean[])f(cpd, "roted").get(cpd)).length);
        System.out.println("special.length = " + ((boolean[])f(cpd, "special").get(cpd)).length);
        System.out.println("opx.length = " + getIntArr(cpd, "opx").length);
        System.out.println("opz.length = " + getIntArr(cpd, "opz").length);
        System.out.println("onscreen.length = " + getIntArr(cpd, "onscreen").length);
        System.out.println("omxz.length = " + getIntArr(cpd, "omxz").length);

        // ---- Test 4: py() with int overflow (imul behavior) ----
        System.out.println("\n=== py() overflow ===");
        // 46341^2 = 2,147,488,281 which overflows int32
        System.out.println("py(46341,0,0,0) = " + py.invoke(cp, 46341, 0, 0, 0));
        System.out.println("py(0,0,46341,0) = " + py.invoke(cp, 0, 0, 46341, 0));
        System.out.println("py(46341,0,46341,0) = " + py.invoke(cp, 46341, 0, 46341, 0));
        // negative overflow
        System.out.println("py(-46341,0,0,0) = " + py.invoke(cp, -46341, 0, 0, 0));
        System.out.println("py(0,46341,0,46341) = " + py.invoke(cp, 0, 46341, 0, 46341));

        // ---- Test 5: calprox with large spread to check float precision ----
        System.out.println("\n=== calprox float precision ===");
        CheckPoints cp6 = new CheckPoints();
        getIntArr(cp6, "x")[0] = -50000;
        getIntArr(cp6, "x")[1] = 50000;
        getIntArr(cp6, "z")[0] = 0;
        getIntArr(cp6, "z")[1] = 0;
        setInt(cp6, "n", 2);
        calprox.invoke(cp6);
        System.out.println("calprox large spread prox = " + getFloat(cp6, "prox"));
        System.out.println("  (100000/90f = " + (100000/90.0f) + ")");

        // ---- Test 6: calprox with all same values ----
        CheckPoints cp7 = new CheckPoints();
        getIntArr(cp7, "x")[0] = 42;
        getIntArr(cp7, "x")[1] = 42;
        getIntArr(cp7, "x")[2] = 42;
        getIntArr(cp7, "z")[0] = -99;
        getIntArr(cp7, "z")[1] = -99;
        getIntArr(cp7, "z")[2] = -99;
        setInt(cp7, "n", 3);
        calprox.invoke(cp7);
        System.out.println("calprox all-same prox = " + getFloat(cp7, "prox"));
    }
}
