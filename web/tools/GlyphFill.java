// Ground truth: rasterize the checkpoint glyphs with java.awt.Graphics2D
// exactly as the game does, and count filled pixels.
import java.awt.*;
import java.awt.image.BufferedImage;

public class GlyphFill {
    static int fillCount(int[] xs, int[] ys, int n, int w, int h) {
        BufferedImage img = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = img.createGraphics();
        g.setColor(Color.BLACK);
        g.fillRect(0, 0, w, h);
        g.setColor(Color.WHITE);
        g.fillPolygon(xs, ys, n);
        g.dispose();
        int c = 0;
        for (int y = 0; y < h; y++)
            for (int x = 0; x < w; x++)
                if ((img.getRGB(x, y) & 0xFFFFFF) != 0) c++;
        return c;
    }

    public static void main(String[] a) {
        // The "O": 28 verts, keyhole, inner loop same winding as outer.
        int[] ox = {129,138,134,121,118,121,118,112,99,87,84,87,94,107,121,134,136,133,128,120,98,83,76,71,75,83,94,109};
        int[] oy = {-924,-915,-913,-906,-904,-895,-882,-874,-870,-876,-888,-902,-910,-914,-906,-913,-901,-884,-874,-865,-857,-861,-868,-887,-906,-918,-926,-929};
        // The "R": 23 verts.
        int[] rx = {23,7,13,20,26,37,53,57,51,35,39,37,26,22,20,41,57,66,70,66,58,45,30};
        int[] ry = {-861,-858,-880,-899,-913,-913,-914,-908,-902,-900,-910,-913,-913,-912,-927,-929,-926,-921,-911,-900,-893,-889,-888};
        emit("O", ox, oy);
        emit("R", rx, ry);
    }

    static void emit(String name, int[] xs, int[] ys) {
        int n = xs.length, S = 6;
        int minx = Integer.MAX_VALUE, miny = Integer.MAX_VALUE;
        for (int v : xs) minx = Math.min(minx, v);
        for (int v : ys) miny = Math.min(miny, v);
        int[] px = new int[n], py = new int[n];
        for (int i = 0; i < n; i++) { px[i] = (xs[i]-minx)*S + 20; py[i] = (ys[i]-miny)*S + 20; }
        System.out.println(name + " n=" + n + " javaFilledPixels=" + fillCount(px, py, n, 1200, 1200));
        StringBuilder sx = new StringBuilder(), sy = new StringBuilder();
        for (int i = 0; i < n; i++) { if(i>0){sx.append(',');sy.append(',');} sx.append(px[i]); sy.append(py[i]); }
        System.out.println("  px=[" + sx + "]");
        System.out.println("  py=[" + sy + "]");
    }
}
