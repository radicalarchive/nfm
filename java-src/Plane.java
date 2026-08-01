import java.awt.RenderingHints;
import java.awt.Graphics2D;
import java.awt.Color;

// 
// Decompiled by Procyon v0.6.0
// 

public class Plane
{
    Medium m;
    Trackers t;
    int[] ox;
    int[] oy;
    int[] oz;
    int n;
    int[] c;
    int[] oc;
    float[] hsb;
    int glass;
    int gr;
    int fs;
    int disline;
    boolean road;
    boolean solo;
    int light;
    int master;
    int wx;
    int wz;
    int wy;
    float deltaf;
    float projf;
    int av;
    int bfase;
    boolean nocol;
    int chip;
    float ctmag;
    int cxz;
    int cxy;
    int czy;
    int[] cox;
    int[] coz;
    int[] coy;
    int dx;
    int dy;
    int dz;
    int vx;
    int vy;
    int vz;
    int embos;
    int typ;
    int pa;
    int pb;
    int flx;
    int colnum;
    
    public Plane(final Medium m, final Trackers t, final int[] array, final int[] array2, final int[] array3, final int n, final int[] array4, final int glass, final int gr, final int fs, final int wx, final int wy, final int wz, final int disline, final int bfase, final boolean road, final int light, final boolean solo) {
        this.c = new int[3];
        this.oc = new int[3];
        this.hsb = new float[3];
        this.glass = 0;
        this.gr = 0;
        this.fs = 0;
        this.disline = 7;
        this.road = false;
        this.solo = false;
        this.light = 0;
        this.master = 0;
        this.wx = 0;
        this.wz = 0;
        this.wy = 0;
        this.deltaf = 1.0f;
        this.projf = 1.0f;
        this.av = 0;
        this.bfase = 0;
        this.nocol = false;
        this.chip = 0;
        this.ctmag = 0.0f;
        this.cxz = 0;
        this.cxy = 0;
        this.czy = 0;
        this.cox = new int[3];
        this.coz = new int[3];
        this.coy = new int[3];
        this.dx = 0;
        this.dy = 0;
        this.dz = 0;
        this.vx = 0;
        this.vy = 0;
        this.vz = 0;
        this.embos = 0;
        this.typ = 0;
        this.pa = 0;
        this.pb = 0;
        this.flx = 0;
        this.colnum = 0;
        this.m = m;
        this.t = t;
        this.n = n;
        this.ox = new int[this.n];
        this.oz = new int[this.n];
        this.oy = new int[this.n];
        for (int i = 0; i < this.n; ++i) {
            this.ox[i] = array[i];
            this.oy[i] = array3[i];
            this.oz[i] = array2[i];
        }
        for (int j = 0; j < 3; ++j) {
            this.oc[j] = array4[j];
        }
        if (gr == -15) {
            if (array4[0] == 211) {
                final int n2 = (int)(Math.random() * 40.0 - 20.0);
                final int n3 = (int)(Math.random() * 40.0 - 20.0);
                for (int k = 0; k < this.n; ++k) {
                    final int[] ox = this.ox;
                    final int n4 = k;
                    ox[n4] += n2;
                    final int[] oz = this.oz;
                    final int n5 = k;
                    oz[n5] += n3;
                }
            }
            final int n6 = (int)(185.0 + Math.random() * 20.0);
            array4[0] = (217 + n6) / 2;
            if (array4[0] == 211) {
                array4[0] = 210;
            }
            array4[1] = (189 + n6) / 2;
            array4[2] = (132 + n6) / 2;
            for (int l = 0; l < this.n; ++l) {
                if (Math.random() > Math.random()) {
                    final int[] ox2 = this.ox;
                    final int n7 = l;
                    ox2[n7] += (int)(8.0 * Math.random() - 4.0);
                }
                if (Math.random() > Math.random()) {
                    final int[] oy = this.oy;
                    final int n8 = l;
                    oy[n8] += (int)(8.0 * Math.random() - 4.0);
                }
                if (Math.random() > Math.random()) {
                    final int[] oz2 = this.oz;
                    final int n9 = l;
                    oz2[n9] += (int)(8.0 * Math.random() - 4.0);
                }
            }
        }
        if (array4[0] == array4[1] && array4[1] == array4[2]) {
            this.nocol = true;
        }
        if (glass == 0) {
            for (int n10 = 0; n10 < 3; ++n10) {
                this.c[n10] = (int)(array4[n10] + array4[n10] * (this.m.snap[n10] / 100.0f));
                if (this.c[n10] > 255) {
                    this.c[n10] = 255;
                }
                if (this.c[n10] < 0) {
                    this.c[n10] = 0;
                }
            }
        }
        if (glass == 1) {
            for (int n11 = 0; n11 < 3; ++n11) {
                this.c[n11] = (this.m.csky[n11] * this.m.fade[0] * 2 + this.m.cfade[n11] * 3000) / (this.m.fade[0] * 2 + 3000);
            }
        }
        if (glass == 2) {
            for (int n12 = 0; n12 < 3; ++n12) {
                this.c[n12] = (int)(this.m.crgrnd[n12] * 0.925f);
            }
        }
        if (glass == 3) {
            for (int n13 = 0; n13 < 3; ++n13) {
                this.c[n13] = array4[n13];
            }
        }
        this.disline = disline;
        this.bfase = bfase;
        this.glass = glass;
        Color.RGBtoHSB(this.c[0], this.c[1], this.c[2], this.hsb);
        if (glass == 3 && this.m.trk != 2) {
            final float[] hsb = this.hsb;
            final int n14 = 1;
            hsb[n14] += 0.05f;
            if (this.hsb[1] > 1.0f) {
                this.hsb[1] = 1.0f;
            }
        }
        if (!this.nocol && this.glass != 1) {
            if (this.bfase > 20 && this.hsb[1] > 0.25) {
                this.hsb[1] = 0.25f;
            }
            if (this.bfase > 25 && this.hsb[2] > 0.7) {
                this.hsb[2] = 0.7f;
            }
            if (this.bfase > 30 && this.hsb[1] > 0.15) {
                this.hsb[1] = 0.15f;
            }
            if (this.bfase > 35 && this.hsb[2] > 0.6) {
                this.hsb[2] = 0.6f;
            }
            if (this.bfase > 40) {
                this.hsb[0] = 0.075f;
            }
            if (this.bfase > 50 && this.hsb[2] > 0.5) {
                this.hsb[2] = 0.5f;
            }
            if (this.bfase > 60) {
                this.hsb[0] = 0.05f;
            }
        }
        this.road = road;
        this.light = light;
        this.solo = solo;
        this.gr = gr;
        this.fs = fs;
        this.wx = wx;
        this.wy = wy;
        this.wz = wz;
        this.deltafntyp();
    }
    
    public void deltafntyp() {
        final int abs = Math.abs(this.ox[2] - this.ox[1]);
        final int abs2 = Math.abs(this.oy[2] - this.oy[1]);
        final int abs3 = Math.abs(this.oz[2] - this.oz[1]);
        if (abs2 <= abs && abs2 <= abs3) {
            this.typ = 2;
        }
        if (abs <= abs2 && abs <= abs3) {
            this.typ = 1;
        }
        if (abs3 <= abs && abs3 <= abs2) {
            this.typ = 3;
        }
        this.deltaf = 1.0f;
        for (int i = 0; i < 3; ++i) {
            for (int j = 0; j < 3; ++j) {
                if (j != i) {
                    this.deltaf *= (float)(Math.sqrt((this.ox[j] - this.ox[i]) * (this.ox[j] - this.ox[i]) + (this.oy[j] - this.oy[i]) * (this.oy[j] - this.oy[i]) + (this.oz[j] - this.oz[i]) * (this.oz[j] - this.oz[i])) / 100.0);
                }
            }
        }
        this.deltaf /= 3.0f;
    }
    
    public void loadprojf() {
        this.projf = 1.0f;
        for (int i = 0; i < 3; ++i) {
            for (int j = 0; j < 3; ++j) {
                if (j != i) {
                    this.projf *= (float)(Math.sqrt((this.ox[i] - this.ox[j]) * (this.ox[i] - this.ox[j]) + (this.oz[i] - this.oz[j]) * (this.oz[i] - this.oz[j])) / 100.0);
                }
            }
        }
        this.projf /= 3.0f;
    }
    
    public void d(final Graphics2D graphics2D, final int n, final int n2, final int n3, final int cxz, final int n4, final int n5, final int n6, final int n7, boolean b, final int n8) {
        if (this.master == 1) {
            if (this.av > 1500 && !this.m.crs) {
                this.n = 12;
            }
            else {
                this.n = 20;
            }
        }
        final int[] array = new int[this.n];
        final int[] array2 = new int[this.n];
        final int[] array3 = new int[this.n];
        if (this.embos == 0) {
            for (int i = 0; i < this.n; ++i) {
                array[i] = this.ox[i] + n;
                array3[i] = this.oy[i] + n2;
                array2[i] = this.oz[i] + n3;
            }
            if ((this.gr == -11 || this.gr == -12 || this.gr == -13) && this.m.lastmaf == 1) {
                for (int j = 0; j < this.n; ++j) {
                    array[j] = -this.ox[j] + n;
                    array3[j] = this.oy[j] + n2;
                    array2[j] = -this.oz[j] + n3;
                }
            }
        }
        else {
            if (this.embos <= 11 && this.m.random() > 0.5 && this.glass != 1) {
                for (int k = 0; k < this.n; ++k) {
                    array[k] = (int)(this.ox[k] + n + (15.0f - this.m.random() * 30.0f));
                    array3[k] = (int)(this.oy[k] + n2 + (15.0f - this.m.random() * 30.0f));
                    array2[k] = (int)(this.oz[k] + n3 + (15.0f - this.m.random() * 30.0f));
                }
                this.rot(array, array3, n, n2, n4, this.n);
                this.rot(array3, array2, n2, n3, n5, this.n);
                this.rot(array, array2, n, n3, cxz, this.n);
                this.rot(array, array2, this.m.cx, this.m.cz, this.m.xz, this.n);
                this.rot(array3, array2, this.m.cy, this.m.cz, this.m.zy, this.n);
                final int[] array4 = new int[this.n];
                final int[] array5 = new int[this.n];
                for (int l = 0; l < this.n; ++l) {
                    array4[l] = this.xs(array[l], array2[l]);
                    array5[l] = this.ys(array3[l], array2[l]);
                }
                graphics2D.setColor(new Color(230, 230, 230));
                graphics2D.fillPolygon(array4, array5, this.n);
            }
            float n9 = 1.0f;
            if (this.embos <= 4) {
                n9 = 1.0f + this.m.random() / 5.0f;
            }
            if (this.embos > 4 && this.embos <= 7) {
                n9 = 1.0f + this.m.random() / 4.0f;
            }
            if (this.embos > 7 && this.embos <= 9) {
                n9 = 1.0f + this.m.random() / 3.0f;
                if (this.hsb[2] > 0.7) {
                    this.hsb[2] = 0.7f;
                }
            }
            if (this.embos > 9 && this.embos <= 10) {
                n9 = 1.0f + this.m.random() / 2.0f;
                if (this.hsb[2] > 0.6) {
                    this.hsb[2] = 0.6f;
                }
            }
            if (this.embos > 10 && this.embos <= 12) {
                n9 = 1.0f + this.m.random() / 1.0f;
                if (this.hsb[2] > 0.5) {
                    this.hsb[2] = 0.5f;
                }
            }
            if (this.embos == 12) {
                this.chip = 1;
                this.ctmag = 2.0f;
                this.bfase = -7;
            }
            if (this.embos == 13) {
                this.hsb[1] = 0.2f;
                this.hsb[2] = 0.4f;
            }
            if (this.embos == 16) {
                this.pa = (int)(this.m.random() * this.n);
                this.pb = (int)(this.m.random() * this.n);
                while (this.pa == this.pb) {
                    this.pb = (int)(this.m.random() * this.n);
                }
            }
            if (this.embos >= 16) {
                int n10 = 1;
                int n11 = 1;
                int abs;
                for (abs = Math.abs(n5); abs > 270; abs -= 360) {}
                if (Math.abs(abs) > 90) {
                    n10 = -1;
                }
                int abs2;
                for (abs2 = Math.abs(n4); abs2 > 270; abs2 -= 360) {}
                if (Math.abs(abs2) > 90) {
                    n11 = -1;
                }
                final int[] array6 = new int[3];
                final int[] array7 = new int[3];
                array[0] = this.ox[this.pa] + n;
                array3[0] = this.oy[this.pa] + n2;
                array2[0] = this.oz[this.pa] + n3;
                array[1] = this.ox[this.pb] + n;
                array3[1] = this.oy[this.pb] + n2;
                array2[1] = this.oz[this.pb] + n3;
                while (Math.abs(array[0] - array[1]) > 100) {
                    if (array[1] > array[0]) {
                        final int[] array8 = array;
                        final int n12 = 1;
                        array8[n12] -= 30;
                    }
                    else {
                        final int[] array9 = array;
                        final int n13 = 1;
                        array9[n13] += 30;
                    }
                }
                while (Math.abs(array2[0] - array2[1]) > 100) {
                    if (array2[1] > array2[0]) {
                        final int[] array10 = array2;
                        final int n14 = 1;
                        array10[n14] -= 30;
                    }
                    else {
                        final int[] array11 = array2;
                        final int n15 = 1;
                        array11[n15] += 30;
                    }
                }
                final int n16 = (int)(Math.abs(array[0] - array[1]) / 3 * (0.5 - this.m.random()));
                final int n17 = (int)(Math.abs(array2[0] - array2[1]) / 3 * (0.5 - this.m.random()));
                array[2] = (array[0] + array[1]) / 2 + n16;
                array2[2] = (array2[0] + array2[1]) / 2 + n17;
                final int n18 = (int)((Math.abs(array[0] - array[1]) + Math.abs(array2[0] - array2[1])) / 1.5 * (this.m.random() / 2.0f + 0.5));
                array3[2] = (array3[0] + array3[1]) / 2 - n10 * n11 * n18;
                this.rot(array, array3, n, n2, n4, 3);
                this.rot(array3, array2, n2, n3, n5, 3);
                this.rot(array, array2, n, n3, cxz, 3);
                this.rot(array, array2, this.m.cx, this.m.cz, this.m.xz, 3);
                this.rot(array3, array2, this.m.cy, this.m.cz, this.m.zy, 3);
                for (int n19 = 0; n19 < 3; ++n19) {
                    array6[n19] = this.xs(array[n19], array2[n19]);
                    array7[n19] = this.ys(array3[n19], array2[n19]);
                }
                int r = (int)(255.0f + 255.0f * (this.m.snap[0] / 400.0f));
                if (r > 255) {
                    r = 255;
                }
                if (r < 0) {
                    r = 0;
                }
                int g = (int)(169.0f + 169.0f * (this.m.snap[1] / 300.0f));
                if (g > 255) {
                    g = 255;
                }
                if (g < 0) {
                    g = 0;
                }
                int b2 = (int)(89.0f + 89.0f * (this.m.snap[2] / 200.0f));
                if (b2 > 255) {
                    b2 = 255;
                }
                if (b2 < 0) {
                    b2 = 0;
                }
                graphics2D.setColor(new Color(r, g, b2));
                graphics2D.fillPolygon(array6, array7, 3);
                array[0] = this.ox[this.pa] + n;
                array3[0] = this.oy[this.pa] + n2;
                array2[0] = this.oz[this.pa] + n3;
                array[1] = this.ox[this.pb] + n;
                array3[1] = this.oy[this.pb] + n2;
                array2[1] = this.oz[this.pb] + n3;
                while (Math.abs(array[0] - array[1]) > 100) {
                    if (array[1] > array[0]) {
                        final int[] array12 = array;
                        final int n20 = 1;
                        array12[n20] -= 30;
                    }
                    else {
                        final int[] array13 = array;
                        final int n21 = 1;
                        array13[n21] += 30;
                    }
                }
                while (Math.abs(array2[0] - array2[1]) > 100) {
                    if (array2[1] > array2[0]) {
                        final int[] array14 = array2;
                        final int n22 = 1;
                        array14[n22] -= 30;
                    }
                    else {
                        final int[] array15 = array2;
                        final int n23 = 1;
                        array15[n23] += 30;
                    }
                }
                array[2] = (array[0] + array[1]) / 2 + n16;
                array2[2] = (array2[0] + array2[1]) / 2 + n17;
                array3[2] = (array3[0] + array3[1]) / 2 - n10 * n11 * (int)(n18 * 0.8);
                this.rot(array, array3, n, n2, n4, 3);
                this.rot(array3, array2, n2, n3, n5, 3);
                this.rot(array, array2, n, n3, cxz, 3);
                this.rot(array, array2, this.m.cx, this.m.cz, this.m.xz, 3);
                this.rot(array3, array2, this.m.cy, this.m.cz, this.m.zy, 3);
                for (int n24 = 0; n24 < 3; ++n24) {
                    array6[n24] = this.xs(array[n24], array2[n24]);
                    array7[n24] = this.ys(array3[n24], array2[n24]);
                }
                int r2 = (int)(255.0f + 255.0f * (this.m.snap[0] / 400.0f));
                if (r2 > 255) {
                    r2 = 255;
                }
                if (r2 < 0) {
                    r2 = 0;
                }
                int g2 = (int)(207.0f + 207.0f * (this.m.snap[1] / 300.0f));
                if (g2 > 255) {
                    g2 = 255;
                }
                if (g2 < 0) {
                    g2 = 0;
                }
                int b3 = (int)(136.0f + 136.0f * (this.m.snap[2] / 200.0f));
                if (b3 > 255) {
                    b3 = 255;
                }
                if (b3 < 0) {
                    b3 = 0;
                }
                graphics2D.setColor(new Color(r2, g2, b3));
                graphics2D.fillPolygon(array6, array7, 3);
            }
            for (int n25 = 0; n25 < this.n; ++n25) {
                if (this.typ == 1) {
                    array[n25] = (int)(this.ox[n25] * n9 + n);
                }
                else {
                    array[n25] = this.ox[n25] + n;
                }
                if (this.typ == 2) {
                    array3[n25] = (int)(this.oy[n25] * n9 + n2);
                }
                else {
                    array3[n25] = this.oy[n25] + n2;
                }
                if (this.typ == 3) {
                    array2[n25] = (int)(this.oz[n25] * n9 + n3);
                }
                else {
                    array2[n25] = this.oz[n25] + n3;
                }
            }
            if (this.embos != 70) {
                ++this.embos;
            }
            else {
                this.embos = 16;
            }
        }
        if (this.wz != 0) {
            this.rot(array3, array2, this.wy + n2, this.wz + n3, n7, this.n);
        }
        if (this.wx != 0) {
            this.rot(array, array2, this.wx + n, this.wz + n3, n6, this.n);
        }
        if (this.chip == 1 && (this.m.random() > 0.6 || this.bfase == 0)) {
            this.chip = 0;
            if (this.bfase == 0 && this.nocol) {
                this.bfase = 1;
            }
        }
        if (this.chip != 0) {
            if (this.chip == 1) {
                this.cxz = cxz;
                this.cxy = n4;
                this.czy = n5;
                final int n26 = (int)(this.m.random() * this.n);
                this.cox[0] = this.ox[n26];
                this.coz[0] = this.oz[n26];
                this.coy[0] = this.oy[n26];
                if (this.ctmag > 3.0f) {
                    this.ctmag = 3.0f;
                }
                if (this.ctmag < -3.0f) {
                    this.ctmag = -3.0f;
                }
                this.cox[1] = (int)(this.cox[0] + this.ctmag * (10.0f - this.m.random() * 20.0f));
                this.cox[2] = (int)(this.cox[0] + this.ctmag * (10.0f - this.m.random() * 20.0f));
                this.coy[1] = (int)(this.coy[0] + this.ctmag * (10.0f - this.m.random() * 20.0f));
                this.coy[2] = (int)(this.coy[0] + this.ctmag * (10.0f - this.m.random() * 20.0f));
                this.coz[1] = (int)(this.coz[0] + this.ctmag * (10.0f - this.m.random() * 20.0f));
                this.coz[2] = (int)(this.coz[0] + this.ctmag * (10.0f - this.m.random() * 20.0f));
                this.dx = 0;
                this.dy = 0;
                this.dz = 0;
                if (this.bfase != -7) {
                    this.vx = (int)(this.ctmag * (30.0f - this.m.random() * 60.0f));
                    this.vz = (int)(this.ctmag * (30.0f - this.m.random() * 60.0f));
                    this.vy = (int)(this.ctmag * (30.0f - this.m.random() * 60.0f));
                }
                else {
                    this.vx = (int)(this.ctmag * (10.0f - this.m.random() * 20.0f));
                    this.vz = (int)(this.ctmag * (10.0f - this.m.random() * 20.0f));
                    this.vy = (int)(this.ctmag * (10.0f - this.m.random() * 20.0f));
                }
                this.chip = 2;
            }
            final int[] array16 = new int[3];
            final int[] array17 = new int[3];
            final int[] array18 = new int[3];
            for (int n27 = 0; n27 < 3; ++n27) {
                array16[n27] = this.cox[n27] + n;
                array18[n27] = this.coy[n27] + n2;
                array17[n27] = this.coz[n27] + n3;
            }
            this.rot(array16, array18, n, n2, this.cxy, 3);
            this.rot(array18, array17, n2, n3, this.czy, 3);
            this.rot(array16, array17, n, n3, this.cxz, 3);
            for (int n28 = 0; n28 < 3; ++n28) {
                final int[] array19 = array16;
                final int n29 = n28;
                array19[n29] += this.dx;
                final int[] array20 = array18;
                final int n30 = n28;
                array20[n30] += this.dy;
                final int[] array21 = array17;
                final int n31 = n28;
                array21[n31] += this.dz;
            }
            this.dx += this.vx;
            this.dz += this.vz;
            this.dy += this.vy;
            this.vy += 7;
            if (array18[0] > this.m.ground) {
                this.chip = 19;
            }
            this.rot(array16, array17, this.m.cx, this.m.cz, this.m.xz, 3);
            this.rot(array18, array17, this.m.cy, this.m.cz, this.m.zy, 3);
            final int[] array22 = new int[3];
            final int[] array23 = new int[3];
            for (int n32 = 0; n32 < 3; ++n32) {
                array22[n32] = this.xs(array16[n32], array17[n32]);
                array23[n32] = this.ys(array18[n32], array17[n32]);
            }
            final int n33 = (int)(this.m.random() * 3.0f);
            if (this.bfase != -7) {
                if (n33 == 0) {
                    graphics2D.setColor(new Color(this.c[0], this.c[1], this.c[2]).darker());
                }
                if (n33 == 1) {
                    graphics2D.setColor(new Color(this.c[0], this.c[1], this.c[2]));
                }
                if (n33 == 2) {
                    graphics2D.setColor(new Color(this.c[0], this.c[1], this.c[2]).brighter());
                }
            }
            else {
                graphics2D.setColor(Color.getHSBColor(this.hsb[0], this.hsb[1], this.hsb[2]));
            }
            graphics2D.fillPolygon(array22, array23, 3);
            ++this.chip;
            if (this.chip == 20) {
                this.chip = 0;
            }
        }
        this.rot(array, array3, n, n2, n4, this.n);
        this.rot(array3, array2, n2, n3, n5, this.n);
        this.rot(array, array2, n, n3, cxz, this.n);
        if ((n4 != 0 || n5 != 0 || cxz != 0) && this.m.trk != 2) {
            this.projf = 1.0f;
            for (int n34 = 0; n34 < 3; ++n34) {
                for (int n35 = 0; n35 < 3; ++n35) {
                    if (n35 != n34) {
                        this.projf *= (float)(Math.sqrt((array[n34] - array[n35]) * (array[n34] - array[n35]) + (array2[n34] - array2[n35]) * (array2[n34] - array2[n35])) / 100.0);
                    }
                }
            }
            this.projf /= 3.0f;
        }
        this.rot(array, array2, this.m.cx, this.m.cz, this.m.xz, this.n);
        boolean b4 = false;
        final int[] array24 = new int[this.n];
        final int[] array25 = new int[this.n];
        int n36 = 500;
        for (int n37 = 0; n37 < this.n; ++n37) {
            array24[n37] = this.xs(array[n37], array2[n37]);
            array25[n37] = this.ys(array3[n37], array2[n37]);
        }
        int n38 = 0;
        int n39 = 1;
        for (int n40 = 0; n40 < this.n; ++n40) {
            for (int n41 = n40; n41 < this.n; ++n41) {
                if (n40 != n41 && Math.abs(array24[n40] - array24[n41]) - Math.abs(array25[n40] - array25[n41]) < n36) {
                    n39 = n40;
                    n38 = n41;
                    n36 = Math.abs(array24[n40] - array24[n41]) - Math.abs(array25[n40] - array25[n41]);
                }
            }
        }
        if (array25[n38] < array25[n39]) {
            final int n42 = n38;
            n38 = n39;
            n39 = n42;
        }
        if (this.spy(array[n38], array2[n38]) > this.spy(array[n39], array2[n39])) {
            b4 = true;
            int n43 = 0;
            for (int n44 = 0; n44 < this.n; ++n44) {
                if (array2[n44] < 50 && array3[n44] > this.m.cy) {
                    b4 = false;
                }
                else if (array3[n44] == array3[0]) {
                    ++n43;
                }
            }
            if (n43 == this.n && array3[0] > this.m.cy) {
                b4 = false;
            }
        }
        this.rot(array3, array2, this.m.cy, this.m.cz, this.m.zy, this.n);
        int n45 = 1;
        final int[] array26 = new int[this.n];
        final int[] array27 = new int[this.n];
        int n46 = 0;
        int n47 = 0;
        int n48 = 0;
        int n49 = 0;
        int n50 = 0;
        for (int n51 = 0; n51 < this.n; ++n51) {
            array26[n51] = this.xs(array[n51], array2[n51]);
            array27[n51] = this.ys(array3[n51], array2[n51]);
            if (array27[n51] < this.m.ih || array2[n51] < 10) {
                ++n46;
            }
            if (array27[n51] > this.m.h || array2[n51] < 10) {
                ++n47;
            }
            if (array26[n51] < this.m.iw || array2[n51] < 10) {
                ++n48;
            }
            if (array26[n51] > this.m.w || array2[n51] < 10) {
                ++n49;
            }
            if (array2[n51] < 10) {
                ++n50;
            }
        }
        if (n48 == this.n || n46 == this.n || n47 == this.n || n49 == this.n) {
            n45 = 0;
        }
        if ((this.m.trk == 1 || this.m.trk == 4) && (n48 != 0 || n46 != 0 || n47 != 0 || n49 != 0)) {
            n45 = 0;
        }
        if (this.m.trk == 3 && n50 != 0) {
            n45 = 0;
        }
        if (n50 != 0) {
            b = true;
        }
        if (n45 != 0 && n8 != -1) {
            int abs3 = 0;
            int abs4 = 0;
            for (int n52 = 0; n52 < this.n; ++n52) {
                for (int n53 = n52; n53 < this.n; ++n53) {
                    if (n52 != n53) {
                        if (Math.abs(array26[n52] - array26[n53]) > abs3) {
                            abs3 = Math.abs(array26[n52] - array26[n53]);
                        }
                        if (Math.abs(array27[n52] - array27[n53]) > abs4) {
                            abs4 = Math.abs(array27[n52] - array27[n53]);
                        }
                    }
                }
            }
            if (abs3 == 0 || abs4 == 0) {
                n45 = 0;
            }
            else if (abs3 < 3 && abs4 < 3 && ((n8 / abs3 > 15 && n8 / abs4 > 15) || b) && (!this.m.lightson || this.light == 0)) {
                n45 = 0;
            }
        }
        if (n45 != 0) {
            int lastmaf = 1;
            int gr = this.gr;
            if (gr < 0 && gr >= -15) {
                gr = 0;
            }
            if (this.gr == -11) {
                gr = -90;
            }
            if (this.gr == -12) {
                gr = -75;
            }
            if (this.gr == -14 || this.gr == -15) {
                gr = -50;
            }
            if (this.glass == 2) {
                gr = 200;
            }
            if (this.fs != 0) {
                int n54;
                int n55;
                if (Math.abs(array27[0] - array27[1]) > Math.abs(array27[2] - array27[1])) {
                    n54 = 0;
                    n55 = 2;
                }
                else {
                    n54 = 2;
                    n55 = 0;
                    lastmaf *= -1;
                }
                if (array27[1] > array27[n54]) {
                    lastmaf *= -1;
                }
                if (array26[1] > array26[n55]) {
                    lastmaf *= -1;
                }
                if (this.fs != 22) {
                    lastmaf *= this.fs;
                    if (lastmaf == -1) {
                        gr += 40;
                        lastmaf = -111;
                    }
                }
            }
            if (this.m.lightson && this.light == 2) {
                gr -= 40;
            }
            int n56 = array3[0];
            int n57 = array3[0];
            int n58 = array[0];
            int n59 = array[0];
            int n60 = array2[0];
            int n61 = array2[0];
            for (int n62 = 0; n62 < this.n; ++n62) {
                if (array3[n62] > n56) {
                    n56 = array3[n62];
                }
                if (array3[n62] < n57) {
                    n57 = array3[n62];
                }
                if (array[n62] > n58) {
                    n58 = array[n62];
                }
                if (array[n62] < n59) {
                    n59 = array[n62];
                }
                if (array2[n62] > n60) {
                    n60 = array2[n62];
                }
                if (array2[n62] < n61) {
                    n61 = array2[n62];
                }
            }
            final int n63 = (n56 + n57) / 2;
            final int n64 = (n58 + n59) / 2;
            final int n65 = (n60 + n61) / 2;
            this.av = (int)Math.sqrt((this.m.cy - n63) * (this.m.cy - n63) + (this.m.cx - n64) * (this.m.cx - n64) + n65 * n65 + gr * gr * gr);
            if (this.m.trk == 0 && (this.av > this.m.fade[this.disline] || this.av == 0)) {
                n45 = 0;
            }
            if (lastmaf == -111 && this.av > 4500 && !this.road) {
                n45 = 0;
            }
            if (lastmaf == -111 && this.av > 1500) {
                b = true;
            }
            if (this.av > 3000 && this.m.adv <= 900) {
                b = true;
            }
            if (this.fs == 22 && this.av < 11200) {
                this.m.lastmaf = lastmaf;
            }
            if (this.gr == -13 && (!this.m.lastcheck || n8 != -1)) {
                n45 = 0;
            }
            if (this.master == 2 && this.av > 1500 && !this.m.crs) {
                n45 = 0;
            }
            if ((this.gr == -14 || this.gr == -15 || this.gr == -12) && (this.av > 11000 || b4 || lastmaf == -111 || this.m.resdown == 2) && this.m.trk != 2 && this.m.trk != 3) {
                n45 = 0;
            }
            if (this.gr == -11 && this.av > 11000 && this.m.trk != 2 && this.m.trk != 3) {
                n45 = 0;
            }
            if (this.glass == 2 && (this.m.trk != 0 || this.av > 6700)) {
                n45 = 0;
            }
            if (this.flx != 0 && this.m.random() > 0.3 && this.flx != 77) {
                n45 = 0;
            }
        }
        if (n45 != 0) {
            float n66 = (float)(this.projf / this.deltaf + 0.3);
            if (b && !this.solo) {
                boolean b5 = false;
                if (n66 > 1.0f) {
                    if (n66 >= 1.27) {
                        b5 = true;
                    }
                    n66 = 1.0f;
                }
                if (b5) {
                    n66 *= (float)0.89;
                }
                else {
                    n66 *= (float)0.86;
                }
                if (n66 < 0.37) {
                    n66 = 0.37f;
                }
                if (this.gr == -9) {
                    n66 = 0.7f;
                }
                if (this.gr == -4) {
                    n66 = 0.74f;
                }
                if (this.gr != -7 && this.m.trk == 0 && b4) {
                    n66 = 0.32f;
                }
                if (this.gr == -8 || this.gr == -14 || this.gr == -15) {
                    n66 = 1.0f;
                }
                if (this.gr == -11 || this.gr == -12) {
                    n66 = 0.6f;
                    if (n8 == -1) {
                        if (this.m.cpflik || (this.m.nochekflk && !this.m.lastcheck)) {
                            n66 = 1.0f;
                        }
                        else {
                            n66 = 0.76f;
                        }
                    }
                }
                if (this.gr == -13 && n8 == -1) {
                    if (this.m.cpflik) {
                        n66 = 0.0f;
                    }
                    else {
                        n66 = 0.76f;
                    }
                }
                if (this.gr == -6) {
                    n66 = 0.62f;
                }
                if (this.gr == -5) {
                    n66 = 0.55f;
                }
            }
            else {
                if (n66 > 1.0f) {
                    n66 = 1.0f;
                }
                if (n66 < 0.6 || b4) {
                    n66 = 0.6f;
                }
            }
            Color color = Color.getHSBColor(this.hsb[0], this.hsb[1], this.hsb[2] * n66);
            if (this.m.trk == 1) {
                final float[] hsbvals = new float[3];
                Color.RGBtoHSB(this.oc[0], this.oc[1], this.oc[2], hsbvals);
                hsbvals[0] = 0.15f;
                hsbvals[1] = 0.3f;
                color = Color.getHSBColor(hsbvals[0], hsbvals[1], hsbvals[2] * n66 + 0.0f);
            }
            if (this.m.trk == 3) {
                final float[] hsbvals2 = new float[3];
                Color.RGBtoHSB(this.oc[0], this.oc[1], this.oc[2], hsbvals2);
                hsbvals2[0] = 0.6f;
                hsbvals2[1] = 0.14f;
                color = Color.getHSBColor(hsbvals2[0], hsbvals2[1], hsbvals2[2] * n66 + 0.0f);
            }
            int red = color.getRed();
            int green = color.getGreen();
            int blue = color.getBlue();
            if (this.m.lightson && (this.light != 0 || ((this.gr == -11 || this.gr == -12) && n8 == -1))) {
                red = this.oc[0];
                if (red > 255) {
                    red = 255;
                }
                if (red < 0) {
                    red = 0;
                }
                green = this.oc[1];
                if (green > 255) {
                    green = 255;
                }
                if (green < 0) {
                    green = 0;
                }
                blue = this.oc[2];
                if (blue > 255) {
                    blue = 255;
                }
                if (blue < 0) {
                    blue = 0;
                }
            }
            if (this.m.trk == 0) {
                for (int n67 = 0; n67 < 16; ++n67) {
                    if (this.av > this.m.fade[n67]) {
                        red = (red * this.m.fogd + this.m.cfade[0]) / (this.m.fogd + 1);
                        green = (green * this.m.fogd + this.m.cfade[1]) / (this.m.fogd + 1);
                        blue = (blue * this.m.fogd + this.m.cfade[2]) / (this.m.fogd + 1);
                    }
                }
            }
            graphics2D.setColor(new Color(red, green, blue));
            graphics2D.fillPolygon(array26, array27, this.n);
            if (this.m.trk != 0 && this.gr == -10) {
                b = false;
            }
            if (!b) {
                if (this.flx == 0) {
                    if (!this.solo) {
                        int r3 = 0;
                        int g3 = 0;
                        int b6 = 0;
                        if (this.m.lightson && this.light != 0) {
                            r3 = this.oc[0] / 2;
                            if (r3 > 255) {
                                r3 = 255;
                            }
                            if (r3 < 0) {
                                r3 = 0;
                            }
                            g3 = this.oc[1] / 2;
                            if (g3 > 255) {
                                g3 = 255;
                            }
                            if (g3 < 0) {
                                g3 = 0;
                            }
                            b6 = this.oc[2] / 2;
                            if (b6 > 255) {
                                b6 = 255;
                            }
                            if (b6 < 0) {
                                b6 = 0;
                            }
                        }
                        if (Madness.anti == 1) {
                            graphics2D.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                        }
                        graphics2D.setColor(new Color(r3, g3, b6));
                        graphics2D.drawPolygon(array26, array27, this.n);
                        if (Madness.anti == 1) {
                            graphics2D.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_OFF);
                        }
                    }
                }
                else {
                    if (this.flx == 2) {
                        graphics2D.setColor(new Color(0, 0, 0));
                        graphics2D.drawPolygon(array26, array27, this.n);
                    }
                    if (this.flx == 1) {
                        final int r4 = 0;
                        int g4 = (int)(223.0f + 223.0f * (this.m.snap[1] / 100.0f));
                        if (g4 > 255) {
                            g4 = 255;
                        }
                        if (g4 < 0) {
                            g4 = 0;
                        }
                        int b7 = (int)(255.0f + 255.0f * (this.m.snap[2] / 100.0f));
                        if (b7 > 255) {
                            b7 = 255;
                        }
                        if (b7 < 0) {
                            b7 = 0;
                        }
                        graphics2D.setColor(new Color(r4, g4, b7));
                        graphics2D.drawPolygon(array26, array27, this.n);
                        this.flx = 2;
                    }
                    if (this.flx == 3) {
                        final int r5 = 0;
                        int g5 = (int)(255.0f + 255.0f * (this.m.snap[1] / 100.0f));
                        if (g5 > 255) {
                            g5 = 255;
                        }
                        if (g5 < 0) {
                            g5 = 0;
                        }
                        int b8 = (int)(223.0f + 223.0f * (this.m.snap[2] / 100.0f));
                        if (b8 > 255) {
                            b8 = 255;
                        }
                        if (b8 < 0) {
                            b8 = 0;
                        }
                        graphics2D.setColor(new Color(r5, g5, b8));
                        graphics2D.drawPolygon(array26, array27, this.n);
                        this.flx = 2;
                    }
                    if (this.flx == 77) {
                        graphics2D.setColor(new Color(16, 198, 255));
                        graphics2D.drawPolygon(array26, array27, this.n);
                        this.flx = 0;
                    }
                }
            }
            else if (this.road && this.av <= 3000 && this.m.trk == 0 && this.m.fade[0] > 4000) {
                red -= 10;
                if (red < 0) {
                    red = 0;
                }
                green -= 10;
                if (green < 0) {
                    green = 0;
                }
                blue -= 10;
                if (blue < 0) {
                    blue = 0;
                }
                graphics2D.setColor(new Color(red, green, blue));
                graphics2D.drawPolygon(array26, array27, this.n);
            }
            if (this.gr == -10) {
                if (this.m.trk == 0) {
                    int r6 = this.c[0];
                    int g6 = this.c[1];
                    int b9 = this.c[2];
                    if (n8 == -1 && this.m.cpflik) {
                        r6 *= (int)1.6;
                        if (r6 > 255) {
                            r6 = 255;
                        }
                        g6 *= (int)1.6;
                        if (g6 > 255) {
                            g6 = 255;
                        }
                        b9 *= (int)1.6;
                        if (b9 > 255) {
                            b9 = 255;
                        }
                    }
                    for (int n68 = 0; n68 < 16; ++n68) {
                        if (this.av > this.m.fade[n68]) {
                            r6 = (r6 * this.m.fogd + this.m.cfade[0]) / (this.m.fogd + 1);
                            g6 = (g6 * this.m.fogd + this.m.cfade[1]) / (this.m.fogd + 1);
                            b9 = (b9 * this.m.fogd + this.m.cfade[2]) / (this.m.fogd + 1);
                        }
                    }
                    graphics2D.setColor(new Color(r6, g6, b9));
                    graphics2D.drawPolygon(array26, array27, this.n);
                }
                else if (this.m.cpflik && this.m.hit == 5000) {
                    int g7 = (int)(Math.random() * 115.0);
                    int r7 = g7 * 2 - 54;
                    if (r7 < 0) {
                        r7 = 0;
                    }
                    if (r7 > 255) {
                        r7 = 255;
                    }
                    int b10 = 202 + g7 * 2;
                    if (b10 < 0) {
                        b10 = 0;
                    }
                    if (b10 > 255) {
                        b10 = 255;
                    }
                    g7 += 101;
                    if (g7 < 0) {
                        g7 = 0;
                    }
                    if (g7 > 255) {
                        g7 = 255;
                    }
                    graphics2D.setColor(new Color(r7, g7, b10));
                    graphics2D.drawPolygon(array26, array27, this.n);
                }
            }
            if (this.gr == -18 && this.m.trk == 0) {
                int r8 = this.c[0];
                int g8 = this.c[1];
                int b11 = this.c[2];
                if (this.m.cpflik && this.m.elecr >= 0.0f) {
                    r8 = (int)(25.5f * this.m.elecr);
                    if (r8 > 255) {
                        r8 = 255;
                    }
                    g8 = (int)(128.0f + 12.8f * this.m.elecr);
                    if (g8 > 255) {
                        g8 = 255;
                    }
                    b11 = 255;
                }
                for (int n69 = 0; n69 < 16; ++n69) {
                    if (this.av > this.m.fade[n69]) {
                        r8 = (r8 * this.m.fogd + this.m.cfade[0]) / (this.m.fogd + 1);
                        g8 = (g8 * this.m.fogd + this.m.cfade[1]) / (this.m.fogd + 1);
                        b11 = (b11 * this.m.fogd + this.m.cfade[2]) / (this.m.fogd + 1);
                    }
                }
                graphics2D.setColor(new Color(r8, g8, b11));
                graphics2D.drawPolygon(array26, array27, this.n);
            }
        }
    }
    
    public void s(final Graphics2D graphics2D, final int n, final int n2, final int n3, final int n4, final int n5, final int n6, final int n7) {
        final int[] array = new int[this.n];
        final int[] array2 = new int[this.n];
        final int[] array3 = new int[this.n];
        for (int i = 0; i < this.n; ++i) {
            array[i] = this.ox[i] + n;
            array3[i] = this.oy[i] + n2;
            array2[i] = this.oz[i] + n3;
        }
        this.rot(array, array3, n, n2, n5, this.n);
        this.rot(array3, array2, n2, n3, n6, this.n);
        this.rot(array, array2, n, n3, n4, this.n);
        int r = (int)((float)this.m.crgrnd[0] / 1.5);
        int g = (int)((float)this.m.crgrnd[1] / 1.5);
        int b = (int)((float)this.m.crgrnd[2] / 1.5);
        for (int j = 0; j < this.n; ++j) {
            array3[j] = this.m.ground;
        }
        if (n7 == 0) {
            int n8 = 0;
            int n9 = 0;
            int n10 = 0;
            int n11 = 0;
            for (int k = 0; k < this.n; ++k) {
                int n12 = 0;
                int n13 = 0;
                int n14 = 0;
                int n15 = 0;
                for (int l = 0; l < this.n; ++l) {
                    if (array[k] >= array[l]) {
                        ++n12;
                    }
                    if (array[k] <= array[l]) {
                        ++n13;
                    }
                    if (array2[k] >= array2[l]) {
                        ++n14;
                    }
                    if (array2[k] <= array2[l]) {
                        ++n15;
                    }
                }
                if (n12 == this.n) {
                    n8 = array[k];
                }
                if (n13 == this.n) {
                    n9 = array[k];
                }
                if (n14 == this.n) {
                    n10 = array2[k];
                }
                if (n15 == this.n) {
                    n11 = array2[k];
                }
            }
            final int n16 = (n8 + n9) / 2;
            final int n17 = (n10 + n11) / 2;
            int ncx = (n16 - this.t.sx + this.m.x) / 3000;
            if (ncx > this.t.ncx) {
                ncx = this.t.ncx;
            }
            if (ncx < 0) {
                ncx = 0;
            }
            int ncz = (n17 - this.t.sz + this.m.z) / 3000;
            if (ncz > this.t.ncz) {
                ncz = this.t.ncz;
            }
            if (ncz < 0) {
                ncz = 0;
            }
            for (int n18 = this.t.sect[ncx][ncz].length - 1; n18 >= 0; --n18) {
                final int n19 = this.t.sect[ncx][ncz][n18];
                int n20 = 0;
                if (Math.abs(this.t.zy[n19]) != 90 && Math.abs(this.t.xy[n19]) != 90 && this.t.rady[n19] != 801 && Math.abs(n16 - (this.t.x[n19] - this.m.x)) < this.t.radx[n19] && Math.abs(n17 - (this.t.z[n19] - this.m.z)) < this.t.radz[n19] && (!this.t.decor[n19] || this.m.resdown != 2)) {
                    ++n20;
                }
                if (n20 != 0) {
                    for (int n21 = 0; n21 < this.n; ++n21) {
                        array3[n21] = this.t.y[n19] - this.m.y;
                        if (this.t.zy[n19] != 0) {
                            final int[] array4 = array3;
                            final int n22 = n21;
                            array4[n22] += (int)((array2[n21] - (this.t.z[n19] - this.m.z - this.t.radz[n19])) * this.m.sin(this.t.zy[n19]) / this.m.sin(90 - this.t.zy[n19]) - this.t.radz[n19] * this.m.sin(this.t.zy[n19]) / this.m.sin(90 - this.t.zy[n19]));
                        }
                        if (this.t.xy[n19] != 0) {
                            final int[] array5 = array3;
                            final int n23 = n21;
                            array5[n23] += (int)((array[n21] - (this.t.x[n19] - this.m.x - this.t.radx[n19])) * this.m.sin(this.t.xy[n19]) / this.m.sin(90 - this.t.xy[n19]) - this.t.radx[n19] * this.m.sin(this.t.xy[n19]) / this.m.sin(90 - this.t.xy[n19]));
                        }
                    }
                    r = (int)((float)this.t.c[n19][0] / 1.5);
                    g = (int)((float)this.t.c[n19][1] / 1.5);
                    b = (int)((float)this.t.c[n19][2] / 1.5);
                    break;
                }
            }
        }
        int n24 = 1;
        final int[] array6 = new int[this.n];
        final int[] array7 = new int[this.n];
        if (n7 == 2) {
            r = 87;
            g = 85;
            b = 57;
        }
        else {
            for (int n25 = 0; n25 < this.m.nsp; ++n25) {
                for (int n26 = 0; n26 < this.n; ++n26) {
                    if (Math.abs(array[n26] - this.m.spx[n25]) < this.m.sprad[n25] && Math.abs(array2[n26] - this.m.spz[n25]) < this.m.sprad[n25]) {
                        n24 = 0;
                    }
                }
            }
        }
        if (n24 != 0) {
            this.rot(array, array2, this.m.cx, this.m.cz, this.m.xz, this.n);
            this.rot(array3, array2, this.m.cy, this.m.cz, this.m.zy, this.n);
            int n27 = 0;
            int n28 = 0;
            int n29 = 0;
            int n30 = 0;
            for (int n31 = 0; n31 < this.n; ++n31) {
                array6[n31] = this.xs(array[n31], array2[n31]);
                array7[n31] = this.ys(array3[n31], array2[n31]);
                if (array7[n31] < this.m.ih || array2[n31] < 10) {
                    ++n27;
                }
                if (array7[n31] > this.m.h || array2[n31] < 10) {
                    ++n28;
                }
                if (array6[n31] < this.m.iw || array2[n31] < 10) {
                    ++n29;
                }
                if (array6[n31] > this.m.w || array2[n31] < 10) {
                    ++n30;
                }
            }
            if (n29 == this.n || n27 == this.n || n28 == this.n || n30 == this.n) {
                n24 = 0;
            }
        }
        if (n24 != 0) {
            for (int n32 = 0; n32 < 16; ++n32) {
                if (this.av > this.m.fade[n32]) {
                    r = (r * this.m.fogd + this.m.cfade[0]) / (this.m.fogd + 1);
                    g = (g * this.m.fogd + this.m.cfade[1]) / (this.m.fogd + 1);
                    b = (b * this.m.fogd + this.m.cfade[2]) / (this.m.fogd + 1);
                }
            }
            graphics2D.setColor(new Color(r, g, b));
            graphics2D.fillPolygon(array6, array7, this.n);
        }
    }
    
    public int xs(final int n, int cz) {
        if (cz < this.m.cz) {
            cz = this.m.cz;
        }
        return (cz - this.m.focus_point) * (this.m.cx - n) / cz + n;
    }
    
    public int ys(final int n, int cz) {
        if (cz < this.m.cz) {
            cz = this.m.cz;
        }
        return (cz - this.m.focus_point) * (this.m.cy - n) / cz + n;
    }
    
    public void rot(final int[] array, final int[] array2, final int n, final int n2, final int n3, final int n4) {
        if (n3 != 0) {
            for (int i = 0; i < n4; ++i) {
                final int n5 = array[i];
                final int n6 = array2[i];
                array[i] = n + (int)((n5 - n) * this.m.cos(n3) - (n6 - n2) * this.m.sin(n3));
                array2[i] = n2 + (int)((n5 - n) * this.m.sin(n3) + (n6 - n2) * this.m.cos(n3));
            }
        }
    }
    
    public int spy(final int n, final int n2) {
        return (int)Math.sqrt((n - this.m.cx) * (n - this.m.cx) + n2 * n2);
    }
}
