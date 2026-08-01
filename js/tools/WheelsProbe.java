import java.lang.reflect.*;
import java.util.Arrays;

/**
 * Reflection probe for Wheels.java — drives the REAL class from Game.jar.
 * Verifies setrims(), field values, and the make() method's geometry output
 * including negative values and magnitudes that stress float32 precision.
 */
public class WheelsProbe {
  public static void main(String[] args) throws Exception {
    // --- Test 1: constructor defaults ---
    Object w = Class.forName("Wheels").getDeclaredConstructor().newInstance();
    System.out.println("=== Test 1: constructor defaults ===");
    System.out.println("ground=" + getInt(w, "ground"));
    System.out.println("mast=" + getInt(w, "mast"));
    System.out.println("sparkat=" + getInt(w, "sparkat"));
    System.out.println("rc=" + Arrays.toString((int[]) getField(w, "rc")));
    System.out.println("size=" + getFloat(w, "size"));
    System.out.println("depth=" + getFloat(w, "depth"));

    // --- Test 2: setrims with normal values ---
    System.out.println("\n=== Test 2: setrims(200, 100, 50, 35, 70) ===");
    Method setrims = w.getClass().getDeclaredMethod("setrims",
      int.class, int.class, int.class, int.class, int.class);
    setrims.setAccessible(true);
    setrims.invoke(w, 200, 100, 50, 35, 70);
    System.out.println("rc=" + Arrays.toString((int[]) getField(w, "rc")));
    System.out.println("size=" + getFloat(w, "size"));
    System.out.println("depth=" + getFloat(w, "depth"));

    // --- Test 3: setrims with depth/size > 41 (clamp) ---
    System.out.println("\n=== Test 3: setrims(0,0,0, 10, 500) depth/size>41 ===");
    Object w2 = Class.forName("Wheels").getDeclaredConstructor().newInstance();
    setrims.invoke(w2, 0, 0, 0, 10, 500);
    System.out.println("size=" + getFloat(w2, "size"));
    System.out.println("depth=" + getFloat(w2, "depth"));

    // --- Test 4: setrims with depth/size < -25 (clamp) ---
    System.out.println("\n=== Test 4: setrims(0,0,0, 20, -600) depth/size<-25 ===");
    Object w3 = Class.forName("Wheels").getDeclaredConstructor().newInstance();
    setrims.invoke(w3, 0, 0, 0, 20, -600);
    System.out.println("size=" + getFloat(w3, "size"));
    System.out.println("depth=" + getFloat(w3, "depth"));

    // --- Test 5: setrims with negative size (clamp to 0) ---
    System.out.println("\n=== Test 5: setrims(0,0,0, -5, 30) negative size ===");
    Object w4 = Class.forName("Wheels").getDeclaredConstructor().newInstance();
    setrims.invoke(w4, 0, 0, 0, -5, 30);
    System.out.println("size=" + getFloat(w4, "size"));
    System.out.println("depth=" + getFloat(w4, "depth"));

    // --- Test 6: setrims with large negative values for float precision ---
    System.out.println("\n=== Test 6: setrims(255,128,64, -137, 450) ===");
    Object w5 = Class.forName("Wheels").getDeclaredConstructor().newInstance();
    setrims.invoke(w5, 255, 128, 64, -137, 450);
    System.out.println("rc=" + Arrays.toString((int[]) getField(w5, "rc")));
    System.out.println("size=" + getFloat(w5, "size"));
    System.out.println("depth=" + getFloat(w5, "depth"));

    // --- Test 7: make() — the main method, with stubs ---
    // We need Medium and Trackers. Build them via reflection with minimal setup.
    System.out.println("\n=== Test 7: make() with positive n2 ===");
    Object medium = Class.forName("Medium").getDeclaredConstructor().newInstance();
    // Medium needs snap[] for Plane constructor; it's already initialized
    Object trackers = Class.forName("Trackers").getDeclaredConstructor().newInstance();

    // Build a Wheels, set rims, then call make
    Object wm = Class.forName("Wheels").getDeclaredConstructor().newInstance();
    setrims.invoke(wm, 180, 90, 45, 25, 40);

    // Plane[] array big enough
    Class<?> planeClass = Class.forName("Plane");
    Object planeArray = Array.newInstance(planeClass, 30);

    Method make = wm.getClass().getDeclaredMethod("make",
      Class.forName("Medium"), Class.forName("Trackers"),
      planeArray.getClass(), int.class, int.class, int.class, int.class,
      int.class, int.class, int.class, int.class);
    make.setAccessible(true);

    // make(medium, trackers, array, n=0, n2=500, n3=-200, n4=300, n5=11, n6=75, n7=130, n8=5)
    make.invoke(wm, medium, trackers, planeArray, 0, 500, -200, 300, 11, 75, 130, 5);

    System.out.println("sparkat=" + getInt(wm, "sparkat"));
    System.out.println("ground=" + getInt(wm, "ground"));

    // Read Plane fields to verify geometry
    Field oxF = planeClass.getDeclaredField("ox"); oxF.setAccessible(true);
    Field oyF = planeClass.getDeclaredField("oy"); oyF.setAccessible(true);
    Field ozF = planeClass.getDeclaredField("oz"); ozF.setAccessible(true);
    Field grF = planeClass.getDeclaredField("gr"); grF.setAccessible(true);
    Field masterF = planeClass.getDeclaredField("master"); masterF.setAccessible(true);
    Field fsF = planeClass.getDeclaredField("fs"); fsF.setAccessible(true);
    Field soloF = planeClass.getDeclaredField("solo"); soloF.setAccessible(true);
    Field nF = planeClass.getDeclaredField("n"); nF.setAccessible(true);

    for (int i = 0; i < 20; i++) {
      Object p = Array.get(planeArray, i);
      if (p == null) break;
      int[] ox = (int[]) oxF.get(p);
      int[] oy = (int[]) oyF.get(p);
      int[] oz = (int[]) ozF.get(p);
      int pn = nF.getInt(p);
      System.out.println("plane[" + i + "] n=" + pn + " master=" + masterF.getInt(p) +
        " gr=" + grF.getInt(p) + " fs=" + fsF.getInt(p) +
        " solo=" + soloF.getBoolean(p));
      System.out.println("  ox=" + arrStr(ox, pn));
      System.out.println("  oy=" + arrStr(oy, pn));
      System.out.println("  oz=" + arrStr(oz, pn));
    }

    // --- Test 8: make() with NEGATIVE n2 (flips n12) ---
    System.out.println("\n=== Test 8: make() with negative n2=-700, large n6/n7 ===");
    Object wm2 = Class.forName("Wheels").getDeclaredConstructor().newInstance();
    setrims.invoke(wm2, 100, 200, 150, 33, -80);

    Object planeArray2 = Array.newInstance(planeClass, 30);
    Object medium2 = Class.forName("Medium").getDeclaredConstructor().newInstance();
    Object trackers2 = Class.forName("Trackers").getDeclaredConstructor().newInstance();

    // n5 != 11 so n9 stays 0
    make.invoke(wm2, medium2, trackers2, planeArray2, 0, -700, 1500, -800, 7, -230, 470, -3);

    System.out.println("sparkat=" + getInt(wm2, "sparkat"));
    System.out.println("ground=" + getInt(wm2, "ground"));

    for (int i = 0; i < 20; i++) {
      Object p = Array.get(planeArray2, i);
      if (p == null) break;
      int[] ox = (int[]) oxF.get(p);
      int[] oy = (int[]) oyF.get(p);
      int[] oz = (int[]) ozF.get(p);
      int pn = nF.getInt(p);
      System.out.println("plane[" + i + "] n=" + pn + " master=" + masterF.getInt(p) +
        " gr=" + grF.getInt(p) + " fs=" + fsF.getInt(p) +
        " solo=" + soloF.getBoolean(p));
      System.out.println("  ox=" + arrStr(ox, pn));
      System.out.println("  oy=" + arrStr(oy, pn));
      System.out.println("  oz=" + arrStr(oz, pn));
    }

    // --- Test 9: individual float computations for precision checking ---
    System.out.println("\n=== Test 9: individual float expressions ===");
    // Check: (int)(n2 - 4.0f * n10) where n2=500, n10=75/10.0f=7.5f
    float n10_a = 75 / 10.0f;
    System.out.println("n10=75/10.0f = " + n10_a);
    System.out.println("(int)(500 - 4.0f * n10) = " + (int)(500 - 4.0f * n10_a));
    System.out.println("(int)(500 + 4.0f * n10) = " + (int)(500 + 4.0f * n10_a));

    float n11_a = 130 / 10.0f;
    System.out.println("n11=130/10.0f = " + n11_a);
    System.out.println("(int)(-200 - 9.1923f * n11) = " + (int)(-200 - 9.1923f * n11_a));
    System.out.println("(int)(300 + 9.1923f * n11) = " + (int)(300 + 9.1923f * n11_a));
    System.out.println("(int)(-200 - 12.557f * n11) = " + (int)(-200 - 12.557f * n11_a));
    System.out.println("(int)(300 + 3.3646f * n11) = " + (int)(300 + 3.3646f * n11_a));

    // 8.66 * size (double arith)
    float size = 25 / 10.0f;
    System.out.println("size=25/10.0f = " + size);
    System.out.println("(int)(-200 + 8.66 * size) = " + (int)(-200 + 8.66 * size));
    System.out.println("(int)(-200 - 8.66 * size) = " + (int)(-200 - 8.66 * size));
    System.out.println("(int)(300 + 5.0f * size) = " + (int)(300 + 5.0f * size));
    System.out.println("(int)(300 - 10.0f * size) = " + (int)(300 - 10.0f * size));

    // n13 = (int)(n8 - depth/size * 4.0f)
    float depth = 40 / 10.0f;
    System.out.println("depth=40/10.0f = " + depth);
    System.out.println("(int)(5 - depth/size * 4.0f) = " + (int)(5 - depth / size * 4.0f));

    // Large negative n11 for precision
    float n11_b = -230 / 10.0f;
    System.out.println("n11=-230/10.0f = " + n11_b);
    System.out.println("(int)(1500 - 9.1923f * n11_b) = " + (int)(1500 - 9.1923f * n11_b));
    System.out.println("(int)(1500 + 12.557f * n11_b) = " + (int)(1500 + 12.557f * n11_b));

    // n13 negative depth
    float depth2 = -80 / 10.0f;
    float size2 = 33 / 10.0f;
    System.out.println("depth2=-80/10.0f = " + depth2);
    System.out.println("size2=33/10.0f = " + size2);
    System.out.println("(int)(-3 - depth2/size2 * 4.0f) = " + (int)(-3 - depth2 / size2 * 4.0f));

    // sparkat and ground
    System.out.println("(int)(n11_a * 24.0f) = " + (int)(n11_a * 24.0f));
    System.out.println("(int)(-200 + 13.0f * n11_a) = " + (int)(-200 + 13.0f * n11_a));
    System.out.println("(int)(n11_b * 24.0f) = " + (int)(n11_b * 24.0f));
    System.out.println("(int)(1500 + 13.0f * n11_b) = " + (int)(1500 + 13.0f * n11_b));

    // n9 = (int)(n2 + 4.0f * n10) when n5==11
    System.out.println("(int)(500 + 4.0f * n10_a) [n9 when n5==11] = " + (int)(500 + 4.0f * n10_a));

    // n12 direction
    System.out.println("n12 when n2=500: -1");
    System.out.println("n12 when n2=-700: 1");
  }

  static int getInt(Object obj, String name) throws Exception {
    Field f = obj.getClass().getDeclaredField(name);
    f.setAccessible(true);
    return f.getInt(obj);
  }

  static float getFloat(Object obj, String name) throws Exception {
    Field f = obj.getClass().getDeclaredField(name);
    f.setAccessible(true);
    return f.getFloat(obj);
  }

  static Object getField(Object obj, String name) throws Exception {
    Field f = obj.getClass().getDeclaredField(name);
    f.setAccessible(true);
    return f.get(obj);
  }

  static String arrStr(int[] a, int len) {
    StringBuilder sb = new StringBuilder("[");
    for (int i = 0; i < len; i++) {
      if (i > 0) sb.append(", ");
      sb.append(a[i]);
    }
    sb.append("]");
    return sb.toString();
  }
}
