// Oracle for js/Plane.test.js.
//
// Reproduces Plane.java's numerically risky methods verbatim (rot, xs, ys,
// spy, deltafntyp's accumulator, and the fog blend) against a real float[]
// sin/cos table built exactly as Medium's constructor builds it. Running the
// whole Plane would need Medium + Trackers; the arithmetic is where the
// divergence risk lives, so that is what is pinned.
//
//   javac -d /tmp/js js/tools/PlaneMath.java && java -cp /tmp/js PlaneMath

public class PlaneMath {
    // Medium's tables, built identically.
    static float[] tcos = new float[360];
    static float[] tsin = new float[360];
    static {
        for (int i = 0; i < 360; ++i) tcos[i] = (float) Math.cos(i * 0.017453292519943295);
        for (int j = 0; j < 360; ++j) tsin[j] = (float) Math.sin(j * 0.017453292519943295);
    }

    static float cos(int i) {
        while (i >= 360) i -= 360;
        while (i < 0) i += 360;
        return tcos[i];
    }

    static float sin(int i) {
        while (i >= 360) i -= 360;
        while (i < 0) i += 360;
        return tsin[i];
    }

    // Medium camera state used by xs/ys/spy.
    static int cx = 400, cy = 225, cz = 100, focus_point = 500;

    static int xs(int n, int lcz) {
        if (lcz < cz) lcz = cz;
        return (lcz - focus_point) * (cx - n) / lcz + n;
    }

    static int ys(int n, int lcz) {
        if (lcz < cz) lcz = cz;
        return (lcz - focus_point) * (cy - n) / lcz + n;
    }

    static int spy(int n, int n2) {
        return (int) Math.sqrt((n - cx) * (n - cx) + n2 * n2);
    }

    static void rot(int[] a, int[] a2, int n, int n2, int n3, int n4) {
        if (n3 != 0) {
            for (int i = 0; i < n4; ++i) {
                final int n5 = a[i];
                final int n6 = a2[i];
                a[i] = n + (int) ((n5 - n) * cos(n3) - (n6 - n2) * sin(n3));
                a2[i] = n2 + (int) ((n5 - n) * sin(n3) + (n6 - n2) * cos(n3));
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("-- rot --");
        // A few angles, including negative and >360 so the normalising loops run.
        int[][] cases = {{37}, {90}, {-45}, {405}, {180}, {1}, {359}};
        for (int[] c : cases) {
            int[] x = {100, -250, 3000, 17}, z = {40, 900, -1200, 6};
            rot(x, z, 10, -20, c[0], 4);
            System.out.println("ang=" + c[0] + " x=" + join(x) + " z=" + join(z));
        }

        System.out.println("-- repeated rot (drift check, 1000 iterations) --");
        int[] x2 = {1000, -500}, z2 = {750, 250};
        for (int i = 0; i < 1000; i++) rot(x2, z2, 0, 0, 7, 2);
        System.out.println("x=" + join(x2) + " z=" + join(z2));

        System.out.println("-- xs / ys --");
        int[][] proj = {{0, 100}, {400, 5000}, {-3000, 12000}, {800, 50}, {123, 100000}};
        for (int[] p : proj) {
            System.out.println("n=" + p[0] + " cz=" + p[1] + " xs=" + xs(p[0], p[1]) + " ys=" + ys(p[0], p[1]));
        }

        System.out.println("-- spy --");
        System.out.println("spy(0,0)=" + spy(0, 0));
        System.out.println("spy(9000,12000)=" + spy(9000, 12000));
        System.out.println("spy(-9000,-12000)=" + spy(-9000, -12000));

        System.out.println("-- deltaf accumulator --");
        int[] ox = {0, 1400, 700, -700}, oy = {0, 0, 0, 0}, oz = {-1100, 0, 0, -1100};
        float deltaf = 1.0f;
        for (int i = 0; i < 3; ++i)
            for (int j = 0; j < 3; ++j)
                if (j != i)
                    deltaf *= (float) (Math.sqrt(
                        (ox[j] - ox[i]) * (ox[j] - ox[i]) +
                        (oy[j] - oy[i]) * (oy[j] - oy[i]) +
                        (oz[j] - oz[i]) * (oz[j] - oz[i])) / 100.0);
        deltaf /= 3.0f;
        System.out.println("deltaf=" + deltaf);

        System.out.println("-- fog blend (int) --");
        int red = 177, fogd = 7;
        for (int i = 0; i < 5; i++) red = (red * fogd + 198) / (fogd + 1);
        System.out.println("red after 5 blends=" + red);

        System.out.println("-- av (cube term can be negative) --");
        System.out.println("av gr=-90  " + av(120, 340, 5000, -90));
        System.out.println("av gr=200  " + av(120, 340, 5000, 200));
    }

    static int av(int n63, int n64, int n65, int gr) {
        return (int) Math.sqrt((cy - n63) * (cy - n63) + (cx - n64) * (cx - n64) + n65 * n65 + gr * gr * gr);
    }

    static String join(int[] a) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < a.length; i++) { if (i > 0) sb.append(','); sb.append(a[i]); }
        return sb.toString();
    }
}
