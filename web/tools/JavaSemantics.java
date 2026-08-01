// Oracle for js/java.test.js. Prints the values the JS helpers must reproduce.
//   javac -d /tmp/js js/tools/JavaSemantics.java && java -cp /tmp/js JavaSemantics
import java.awt.Color;

public class JavaSemantics {
    public static void main(String[] a) {
        System.out.println("-- int division --");
        System.out.println("7/2       = " + (7 / 2));
        System.out.println("-7/2      = " + (-7 / 2));
        System.out.println("7/-2      = " + (7 / -2));
        System.out.println("-7/-2     = " + (-7 / -2));
        System.out.println("fogblend  = " + ((207 * 5000 * 2 + 198 * 3000) / (5000 * 2 + 3000)));

        System.out.println("-- int overflow --");
        int max = 2147483647;
        System.out.println("MAX+1     = " + (max + 1));
        System.out.println("MAX*2     = " + (max * 2));
        System.out.println("MIN-1     = " + (-2147483648 - 1));

        System.out.println("-- (int) cast of float --");
        System.out.println("(int)3.9  = " + (int) 3.9);
        System.out.println("(int)-3.9 = " + (int) -3.9);
        System.out.println("(int)NaN  = " + (int) Double.NaN);
        System.out.println("(int)1e18 = " + (int) 1e18);
        System.out.println("(int)-1e18= " + (int) -1e18);

        System.out.println("-- Math.round --");
        System.out.println("round 2.5 = " + Math.round(2.5f));
        System.out.println("round -2.5= " + Math.round(-2.5f));
        System.out.println("round -2.6= " + Math.round(-2.6f));

        System.out.println("-- float32 --");
        System.out.println("0.1f      = " + (double) 0.1f);

        System.out.println("-- RGBtoHSB --");
        hsb(177, 171, 160);
        hsb(0, 0, 0);
        hsb(255, 0, 0);

        System.out.println("-- HSBtoRGB round trip --");
        rt(177, 171, 160); rt(12, 200, 43); rt(255, 255, 255); rt(1, 2, 3);
    }

    static void hsb(int r, int g, int b) {
        float[] o = new float[3];
        Color.RGBtoHSB(r, g, b, o);
        System.out.println(r + "," + g + "," + b + " -> " + o[0] + " " + o[1] + " " + o[2]);
    }

    static void rt(int r, int g, int b) {
        float[] o = new float[3];
        Color.RGBtoHSB(r, g, b, o);
        int rgb = Color.HSBtoRGB(o[0], o[1], o[2]) & 0xFFFFFF;
        System.out.println(r + "," + g + "," + b + " -> " + ((rgb >> 16) & 255) + "," + ((rgb >> 8) & 255) + "," + (rgb & 255));
    }
}
