import java.net.URI;
import java.awt.Desktop;
import java.awt.Event;
import java.io.Writer;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.Reader;
import java.io.BufferedReader;
import java.io.FileReader;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.io.ByteArrayInputStream;
import java.net.URL;
import java.io.InputStream;
import java.io.DataInputStream;
import java.io.FileInputStream;
import java.io.File;
import java.awt.Component;
import java.awt.event.KeyListener;
import java.awt.event.KeyEvent;
import java.awt.event.KeyAdapter;
import java.awt.LayoutManager;
import java.awt.Composite;
import java.awt.AlphaComposite;
import java.awt.Font;
import java.awt.Graphics;
import java.awt.Cursor;
import java.awt.image.ImageObserver;
import java.awt.RenderingHints;
import java.util.Date;
import java.awt.Color;
import java.awt.Checkbox;
import java.awt.TextArea;
import java.awt.TextField;
import java.awt.Image;
import java.awt.Graphics2D;
import java.applet.Applet;

// 
// Decompiled by Procyon v0.6.0
// 

public class GameSparker extends Applet implements Runnable
{
    Graphics2D rd;
    Image offImage;
    Thread gamer;
    int mload;
    boolean exwist;
    int apx;
    int apy;
    float apmult;
    float reqmult;
    int smooth;
    int moto;
    int lastw;
    int lasth;
    boolean onbar;
    boolean oncarm;
    boolean onstgm;
    boolean onfulls;
    Image sizebar;
    Image blb;
    Image fulls;
    Image[] chkbx;
    Image[] carmaker;
    Image[] stagemaker;
    int showsize;
    Control[] u;
    int mouses;
    int xm;
    int ym;
    int mousew;
    boolean lostfcs;
    boolean moused;
    int fcscnt;
    int nob;
    int notb;
    int view;
    int mvect;
    int lmxz;
    int shaka;
    boolean applejava;
    TextField tnick;
    TextField tpass;
    TextField temail;
    TextField cmsg;
    TextArea mmsg;
    Checkbox mycar;
    Checkbox notp;
    Checkbox keplo;
    boolean openm;
    Smenu sgame;
    Smenu wgame;
    Smenu warb;
    Smenu pgame;
    Smenu vnpls;
    Smenu vtyp;
    Smenu snfmm;
    Smenu snfm1;
    Smenu snfm2;
    Smenu mstgs;
    Smenu mcars;
    Smenu slaps;
    Smenu snpls;
    Smenu snbts;
    Smenu swait;
    Smenu sclass;
    Smenu scars;
    Smenu sfix;
    Smenu gmode;
    Smenu rooms;
    Smenu sendtyp;
    Smenu senditem;
    Smenu clanlev;
    Smenu clcars;
    Smenu datat;
    Smenu ilaps;
    Smenu icars;
    Smenu proitem;
    
    public GameSparker() {
        this.mload = 1;
        this.exwist = false;
        this.apx = 0;
        this.apy = 0;
        this.apmult = 1.0f;
        this.reqmult = 1.0f;
        this.smooth = 1;
        this.moto = 1;
        this.lastw = 0;
        this.lasth = 0;
        this.onbar = false;
        this.oncarm = false;
        this.onstgm = false;
        this.onfulls = false;
        this.chkbx = new Image[2];
        this.carmaker = new Image[2];
        this.stagemaker = new Image[2];
        this.showsize = 0;
        this.u = new Control[8];
        this.mouses = 0;
        this.xm = 0;
        this.ym = 0;
        this.mousew = 0;
        this.lostfcs = false;
        this.moused = false;
        this.fcscnt = 0;
        this.nob = 0;
        this.notb = 0;
        this.view = 0;
        this.mvect = 100;
        this.lmxz = 0;
        this.shaka = 0;
        this.applejava = false;
        this.openm = false;
        this.sgame = new Smenu(8);
        this.wgame = new Smenu(4);
        this.warb = new Smenu(102);
        this.pgame = new Smenu(11);
        this.vnpls = new Smenu(5);
        this.vtyp = new Smenu(6);
        this.snfmm = new Smenu(12);
        this.snfm1 = new Smenu(12);
        this.snfm2 = new Smenu(19);
        this.mstgs = new Smenu(707);
        this.mcars = new Smenu(707);
        this.slaps = new Smenu(17);
        this.snpls = new Smenu(9);
        this.snbts = new Smenu(8);
        this.swait = new Smenu(6);
        this.sclass = new Smenu(7);
        this.scars = new Smenu(4);
        this.sfix = new Smenu(7);
        this.gmode = new Smenu(3);
        this.rooms = new Smenu(7);
        this.sendtyp = new Smenu(6);
        this.senditem = new Smenu(707);
        this.clanlev = new Smenu(8);
        this.clcars = new Smenu(707);
        this.datat = new Smenu(26);
        this.ilaps = new Smenu(18);
        this.icars = new Smenu(5);
        this.proitem = new Smenu(707);
    }
    
    @Override
    public void run() {
        this.rd.setColor(new Color(0, 0, 0));
        this.rd.fillRect(0, 0, 800, 450);
        this.repaint();
        this.requestFocus();
        if (System.getProperty("java.vendor").toLowerCase().indexOf("apple") != -1) {
            this.applejava = true;
        }
        final Medium medium = new Medium();
        final Trackers trackers = new Trackers();
        final CheckPoints checkPoints = new CheckPoints();
        final ContO[] array = new ContO[124];
        final CarDefine carDefine = new CarDefine(array, medium, trackers, this);
        final xtGraphics xtGraphics = new xtGraphics(medium, carDefine, this.rd, this);
        this.sizebar = xtGraphics.getImage("data/sizebar.gif");
        this.blb = xtGraphics.getImage("data/b.gif");
        this.fulls = xtGraphics.getImage("data/fullscreen.gif");
        this.chkbx[0] = xtGraphics.getImage("data/checkbox1.gif");
        this.chkbx[1] = xtGraphics.getImage("data/checkbox2.gif");
        this.carmaker[0] = xtGraphics.getImage("data/carmaker1.gif");
        this.carmaker[1] = xtGraphics.getImage("data/carmaker2.gif");
        this.stagemaker[0] = xtGraphics.getImage("data/stagemaker1.gif");
        this.stagemaker[1] = xtGraphics.getImage("data/stagemaker2.gif");
        xtGraphics.loaddata();
        Login login = null;
        Lobby lobby = null;
        Globe globe = null;
        int n = 0;
        final UDPMistro udpMistro = new UDPMistro();
        final Record record = new Record(medium);
        this.loadbase(array, medium, trackers, xtGraphics, false);
        final ContO[] array2 = new ContO[610];
        final Mad[] array3 = new Mad[8];
        for (int i = 0; i < 8; ++i) {
            array3[i] = new Mad(carDefine, medium, record, xtGraphics, i);
            this.u[i] = new Control(medium);
        }
        float n2 = 47.0f;
        this.readcookies(xtGraphics, carDefine, array);
        xtGraphics.testdrive = Madness.testdrive;
        if (xtGraphics.testdrive != 0) {
            if (xtGraphics.testdrive <= 2) {
                xtGraphics.sc[0] = carDefine.loadcar(Madness.testcar, 16);
                if (xtGraphics.sc[0] != -1) {
                    xtGraphics.fase = -9;
                }
                else {
                    Madness.testcar = "Failx12";
                    Madness.carmaker();
                }
            }
            else {
                checkPoints.name = Madness.testcar;
                xtGraphics.fase = -9;
            }
        }
        xtGraphics.stoploading();
        this.requestFocus();
        if (xtGraphics.testdrive == 0 && xtGraphics.firstime) {
            this.setupini();
        }
        System.gc();
        long time = new Date().getTime();
        float a = 30.0f;
        int n3 = 0;
        int n4 = 30;
        final int n5 = 530;
        int n6 = 0;
        int n7 = 0;
        int n8 = 0;
        int n9 = 0;
        int n10 = 0;
        int n11 = 0;
        while (true) {
            final long time2 = new Date().getTime();
            if (xtGraphics.fase == 111) {
                if (this.mouses == 1) {
                    n8 = 800;
                }
                if (n8 < 800) {
                    xtGraphics.clicknow();
                    ++n8;
                }
                else {
                    n8 = 0;
                    if (!this.exwist) {
                        xtGraphics.fase = 9;
                    }
                    this.mouses = 0;
                    this.lostfcs = false;
                }
            }
            if (xtGraphics.fase == 9) {
                if (n8 < 76) {
                    xtGraphics.rad(n8);
                    this.catchlink();
                    if (this.mouses == 2) {
                        this.mouses = 0;
                    }
                    if (this.mouses == 1) {
                        this.mouses = 2;
                    }
                    ++n8;
                }
                else {
                    n8 = 0;
                    xtGraphics.fase = 10;
                    this.mouses = 0;
                    this.u[0].falseo(0);
                }
            }
            if (xtGraphics.fase == -9) {
                if (xtGraphics.loadedt) {
                    xtGraphics.mainbg(-101);
                    this.rd.setColor(new Color(0, 0, 0));
                    this.rd.fillRect(0, 0, 800, 450);
                    this.repaint();
                    xtGraphics.strack.unload();
                    xtGraphics.strack = null;
                    xtGraphics.flexpix = null;
                    xtGraphics.fleximg = null;
                    System.gc();
                    xtGraphics.loadedt = false;
                }
                if (n8 < 2) {
                    xtGraphics.mainbg(-101);
                    this.rd.setColor(new Color(0, 0, 0));
                    this.rd.fillRect(65, 25, 670, 400);
                    ++n8;
                }
                else {
                    this.checkmemory(xtGraphics);
                    xtGraphics.inishcarselect(array);
                    n8 = 0;
                    xtGraphics.fase = 7;
                    this.mvect = 50;
                    this.mouses = 0;
                }
            }
            if (xtGraphics.fase == 8) {
                xtGraphics.credits(this.u[0], this.xm, this.ym, this.mouses);
                xtGraphics.ctachm(this.xm, this.ym, this.mouses, this.u[0]);
                if (xtGraphics.flipo <= 100) {
                    this.catchlink();
                }
                if (this.mouses == 2) {
                    this.mouses = 0;
                }
                if (this.mouses == 1) {
                    this.mouses = 2;
                }
            }
            if (xtGraphics.fase == 10) {
                this.mvect = 100;
                xtGraphics.maini(this.u[0]);
                xtGraphics.ctachm(this.xm, this.ym, this.mouses, this.u[0]);
                if (this.mouses == 2) {
                    this.mouses = 0;
                }
                if (this.mouses == 1) {
                    this.mouses = 2;
                }
            }
            if (xtGraphics.fase == 102) {
                this.mvect = 100;
                if (xtGraphics.loadedt) {
                    this.rd.setColor(new Color(0, 0, 0));
                    this.rd.fillRect(0, 0, 800, 450);
                    this.repaint();
                    this.checkmemory(xtGraphics);
                    xtGraphics.strack.unload();
                    xtGraphics.strack = null;
                    xtGraphics.flexpix = null;
                    xtGraphics.fleximg = null;
                    System.gc();
                    xtGraphics.loadedt = false;
                }
                if (xtGraphics.testdrive == 1 || xtGraphics.testdrive == 2) {
                    Madness.carmaker();
                }
                if (xtGraphics.testdrive == 3 || xtGraphics.testdrive == 4) {
                    Madness.stagemaker();
                }
                xtGraphics.maini2(this.u[0], this.xm, this.ym, this.mouses);
                xtGraphics.ctachm(this.xm, this.ym, this.mouses, this.u[0]);
                if (this.mouses == 2) {
                    this.mouses = 0;
                }
                if (this.mouses == 1) {
                    this.mouses = 2;
                }
            }
            if (xtGraphics.fase == -22) {
                checkPoints.name = Madness.testcar;
                checkPoints.stage = -1;
                this.loadstage(array2, array, medium, trackers, checkPoints, xtGraphics, array3, record);
                if (checkPoints.stage == -3) {
                    Madness.testcar = "Failx12";
                    Madness.stagemaker();
                }
            }
            if (xtGraphics.fase == 11) {
                xtGraphics.inst(this.u[0]);
                xtGraphics.ctachm(this.xm, this.ym, this.mouses, this.u[0]);
                if (this.mouses == 2) {
                    this.mouses = 0;
                }
                if (this.mouses == 1) {
                    this.mouses = 2;
                }
            }
            if (xtGraphics.fase == -5) {
                this.mvect = 100;
                xtGraphics.finish(checkPoints, array, this.u[0], this.xm, this.ym, this.moused);
                xtGraphics.ctachm(this.xm, this.ym, this.mouses, this.u[0]);
                if (this.mouses == 2) {
                    this.mouses = 0;
                }
                if (this.mouses == 1) {
                    this.mouses = 2;
                }
            }
            if (xtGraphics.fase == 7) {
                xtGraphics.carselect(this.u[0], array, array3[0], this.xm, this.ym, this.moused);
                xtGraphics.ctachm(this.xm, this.ym, this.mouses, this.u[0]);
                if (this.mouses == 2) {
                    this.mouses = 0;
                }
                if (this.mouses == 1) {
                    this.mouses = 2;
                }
                this.drawms();
            }
            if (xtGraphics.fase == 6) {
                xtGraphics.musicomp(checkPoints.stage, this.u[0]);
                xtGraphics.ctachm(this.xm, this.ym, this.mouses, this.u[0]);
                if (this.mouses == 2) {
                    this.mouses = 0;
                }
                if (this.mouses == 1) {
                    this.mouses = 2;
                }
            }
            if (xtGraphics.fase == 5) {
                this.mvect = 100;
                xtGraphics.loadmusic(checkPoints.stage, checkPoints.trackname, checkPoints.trackvol);
            }
            if (xtGraphics.fase == 4) {
                xtGraphics.cantgo(this.u[0]);
                xtGraphics.ctachm(this.xm, this.ym, this.mouses, this.u[0]);
                if (this.mouses == 2) {
                    this.mouses = 0;
                }
                if (this.mouses == 1) {
                    this.mouses = 2;
                }
            }
            if (xtGraphics.fase == 3) {
                this.rd.setColor(new Color(0, 0, 0));
                this.rd.fillRect(65, 25, 670, 400);
                this.repaint();
                xtGraphics.inishstageselect(checkPoints);
            }
            if (xtGraphics.fase == 2) {
                this.mvect = 100;
                xtGraphics.loadingstage(checkPoints.stage, true);
                checkPoints.nfix = 0;
                checkPoints.notb = false;
                this.loadstage(array2, array, medium, trackers, checkPoints, xtGraphics, array3, record);
                this.u[0].falseo(0);
                udpMistro.freg = 0.0f;
                this.mvect = 20;
            }
            if (xtGraphics.fase == 1) {
                xtGraphics.trackbg(false);
                this.rd.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_OFF);
                if (checkPoints.stage != -3) {
                    medium.aroundtrack(checkPoints);
                    if (medium.hit == 5000 && this.mvect < 40) {
                        ++this.mvect;
                    }
                    int n12 = 0;
                    final int[] array4 = new int[1000];
                    for (int j = xtGraphics.nplayers; j < this.notb; ++j) {
                        if (array2[j].dist != 0) {
                            array4[n12] = j;
                            ++n12;
                        }
                        else {
                            array2[j].d(this.rd);
                        }
                    }
                    final int[] array5 = new int[n12];
                    for (int k = 0; k < n12; ++k) {
                        array5[k] = 0;
                    }
                    for (int l = 0; l < n12; ++l) {
                        for (int n13 = l + 1; n13 < n12; ++n13) {
                            if (array2[array4[l]].dist != array2[array4[n13]].dist) {
                                if (array2[array4[l]].dist < array2[array4[n13]].dist) {
                                    final int[] array6 = array5;
                                    final int n14 = l;
                                    ++array6[n14];
                                }
                                else {
                                    final int[] array7 = array5;
                                    final int n15 = n13;
                                    ++array7[n15];
                                }
                            }
                            else if (n13 > l) {
                                final int[] array8 = array5;
                                final int n16 = l;
                                ++array8[n16];
                            }
                            else {
                                final int[] array9 = array5;
                                final int n17 = n13;
                                ++array9[n17];
                            }
                        }
                    }
                    for (int n18 = 0; n18 < n12; ++n18) {
                        for (int n19 = 0; n19 < n12; ++n19) {
                            if (array5[n19] == n18) {
                                array2[array4[n19]].d(this.rd);
                            }
                        }
                    }
                }
                if (!this.openm) {
                    xtGraphics.ctachm(this.xm, this.ym, this.mouses, this.u[0]);
                }
                if (this.mouses == 2) {
                    this.mouses = 0;
                }
                if (this.mouses == 1) {
                    this.mouses = 2;
                }
                this.rd.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                xtGraphics.stageselect(checkPoints, this.u[0], this.xm, this.ym, this.moused);
                this.drawms();
            }
            if (xtGraphics.fase == 1177) {
                this.mvect = 100;
                if (n == 0) {
                    if (xtGraphics.loadedt) {
                        this.rd.setColor(new Color(0, 0, 0));
                        this.rd.fillRect(0, 0, 800, 450);
                        this.repaint();
                        this.checkmemory(xtGraphics);
                        xtGraphics.strack.unload();
                        xtGraphics.strack = null;
                        xtGraphics.flexpix = null;
                        xtGraphics.fleximg = null;
                        System.gc();
                        xtGraphics.loadedt = false;
                    }
                    xtGraphics.intertrack.unloadimod();
                    this.rd.setColor(new Color(0, 0, 0));
                    this.rd.fillRect(65, 25, 670, 400);
                    if (this.mload > 0) {
                        this.rd.drawImage(xtGraphics.mload, 259, 195, this);
                    }
                    this.repaint();
                    if (this.mload == 2) {
                        carDefine.loadready();
                        this.loadbase(array, medium, trackers, xtGraphics, true);
                        this.readcookies(xtGraphics, carDefine, array);
                        this.mload = -1;
                    }
                    System.gc();
                    login = new Login(medium, this.rd, xtGraphics, this);
                    globe = new Globe(this.rd, xtGraphics, medium, login, carDefine, checkPoints, array, array2, this);
                    lobby = new Lobby(medium, this.rd, login, globe, xtGraphics, carDefine, this);
                    n = 1;
                }
                if (login.fase != 18) {
                    boolean b = false;
                    if (login.fase == 0) {
                        login.inishmulti();
                    }
                    if (login.fase >= 1 && login.fase <= 11) {
                        login.multistart(array, this.xm, this.ym, this.moused);
                    }
                    if (login.fase >= 12 && login.fase <= 17) {
                        if (globe.open != 452) {
                            login.multimode(array);
                        }
                        else {
                            b = true;
                        }
                        globe.dome(0, this.xm, this.ym, this.moused, this.u[0]);
                    }
                    if (login.justlog) {
                        if (!xtGraphics.clan.equals("")) {
                            globe.itab = 2;
                        }
                        login.justlog = false;
                    }
                    if (!b) {
                        login.ctachm(this.xm, this.ym, this.mouses, this.u[0], lobby);
                        this.mvect = 50;
                    }
                    else {
                        this.drawms();
                        this.mvect = 100;
                    }
                    if (this.mouses == 1) {
                        this.mouses = 11;
                    }
                    if (this.mouses <= -1) {
                        --this.mouses;
                        if (this.mouses == -4) {
                            this.mouses = 0;
                        }
                    }
                    if (this.mousew != 0) {
                        if (this.mousew > 0) {
                            --this.mousew;
                        }
                        else {
                            ++this.mousew;
                        }
                    }
                }
                else {
                    boolean b2 = false;
                    if (lobby.fase == 0) {
                        lobby.inishlobby();
                        this.mvect = 100;
                    }
                    if (lobby.fase == 1) {
                        if (globe.open >= 2 && globe.open < 452) {
                            this.openm = true;
                        }
                        if (globe.open != 452) {
                            lobby.lobby(this.xm, this.ym, this.moused, this.mousew, checkPoints, this.u[0], array);
                        }
                        else {
                            b2 = true;
                        }
                        globe.dome(lobby.conon, this.xm, this.ym, this.moused, this.u[0]);
                        if (lobby.loadstage > 0) {
                            this.setCursor(new Cursor(3));
                            this.drawms();
                            this.repaint();
                            trackers.nt = 0;
                            if (this.loadstagePreview(lobby.loadstage, "", array2, array, medium, checkPoints)) {
                                lobby.gstagename = checkPoints.name;
                                lobby.gstagelaps = checkPoints.nlaps;
                                lobby.loadstage = -lobby.loadstage;
                            }
                            else {
                                lobby.loadstage = 0;
                                checkPoints.name = "";
                            }
                            this.setCursor(new Cursor(0));
                        }
                        if (lobby.msload != 0) {
                            this.setCursor(new Cursor(3));
                            this.drawms();
                            this.repaint();
                            if (lobby.msload == 1) {
                                carDefine.loadmystages(checkPoints);
                            }
                            if (lobby.msload == 7) {
                                carDefine.loadclanstages(xtGraphics.clan);
                            }
                            if (lobby.msload == 3 || lobby.msload == 4) {
                                carDefine.loadtop20(lobby.msload);
                            }
                            lobby.msload = 0;
                            this.setCursor(new Cursor(0));
                        }
                    }
                    if (lobby.fase == 3) {
                        xtGraphics.trackbg(false);
                        medium.trk = 0;
                        medium.focus_point = 400;
                        medium.crs = true;
                        medium.x = -335;
                        medium.y = 0;
                        medium.z = -50;
                        medium.xz = 0;
                        medium.zy = 20;
                        medium.ground = -2000;
                        this.mvect = 100;
                        lobby.fase = 1;
                    }
                    if (lobby.fase == 4) {
                        this.mvect = 50;
                        this.rd.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_OFF);
                        medium.d(this.rd);
                        medium.aroundtrack(checkPoints);
                        int n20 = 0;
                        final int[] array10 = new int[1000];
                        for (int n21 = 0; n21 < this.nob; ++n21) {
                            if (array2[n21].dist != 0) {
                                array10[n20] = n21;
                                ++n20;
                            }
                            else {
                                array2[n21].d(this.rd);
                            }
                        }
                        final int[] array11 = new int[n20];
                        for (int n22 = 0; n22 < n20; ++n22) {
                            array11[n22] = 0;
                        }
                        for (int n23 = 0; n23 < n20; ++n23) {
                            for (int n24 = n23 + 1; n24 < n20; ++n24) {
                                if (array2[array10[n23]].dist != array2[array10[n24]].dist) {
                                    if (array2[array10[n23]].dist < array2[array10[n24]].dist) {
                                        final int[] array12 = array11;
                                        final int n25 = n23;
                                        ++array12[n25];
                                    }
                                    else {
                                        final int[] array13 = array11;
                                        final int n26 = n24;
                                        ++array13[n26];
                                    }
                                }
                                else if (n24 > n23) {
                                    final int[] array14 = array11;
                                    final int n27 = n23;
                                    ++array14[n27];
                                }
                                else {
                                    final int[] array15 = array11;
                                    final int n28 = n24;
                                    ++array15[n28];
                                }
                            }
                        }
                        for (int n29 = 0; n29 < n20; ++n29) {
                            for (int n30 = 0; n30 < n20; ++n30) {
                                if (array11[n30] == n29) {
                                    array2[array10[n30]].d(this.rd);
                                }
                            }
                        }
                        this.rd.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                        lobby.stageselect(checkPoints, this.u[0], this.xm, this.ym, this.moused);
                        if (lobby.plsndt == 1) {
                            this.mvect = 70;
                            this.repaint();
                            this.setCursor(new Cursor(3));
                            xtGraphics.loadstrack(checkPoints.stage, checkPoints.trackname, checkPoints.trackvol);
                            xtGraphics.strack.play();
                            lobby.plsndt = 2;
                            this.moused = false;
                            this.mouses = 0;
                        }
                    }
                    if (lobby.fase == 2) {
                        int n31 = 0;
                        for (int n32 = 0; n32 < lobby.ngm; ++n32) {
                            if (lobby.ongame == lobby.gnum[n32]) {
                                n31 = n32;
                            }
                        }
                        boolean b3 = false;
                        if (lobby.gstgn[n31] > 0) {
                            if (lobby.gstgn[n31] == -lobby.loadstage) {
                                b3 = true;
                            }
                        }
                        else if (lobby.gstages[n31].equals(checkPoints.name)) {
                            b3 = true;
                        }
                        if (b3) {
                            lobby.fase = 4;
                            lobby.addstage = 0;
                        }
                        else {
                            xtGraphics.loadingstage(lobby.gstgn[n31], false);
                            trackers.nt = 0;
                            if (this.loadstagePreview(lobby.gstgn[n31], lobby.gstages[n31], array2, array, medium, checkPoints)) {
                                lobby.loadstage = -lobby.gstgn[n31];
                                lobby.fase = 4;
                                lobby.addstage = 0;
                            }
                            else {
                                lobby.loadstage = 0;
                                checkPoints.name = "";
                                lobby.fase = 3;
                            }
                        }
                    }
                    if (lobby.fase == 76) {
                        checkPoints.nlaps = lobby.laps;
                        checkPoints.stage = lobby.stage;
                        checkPoints.name = lobby.stagename;
                        checkPoints.nfix = lobby.nfix;
                        checkPoints.notb = lobby.notb;
                        xtGraphics.fase = 21;
                        this.u[0].multion = xtGraphics.multion;
                    }
                    if (globe.loadwbgames == 7) {
                        this.repaint();
                        globe.redogame();
                    }
                    if (!this.openm) {
                        if (!b2) {
                            lobby.ctachm(this.xm, this.ym, this.mouses, this.u[0]);
                        }
                    }
                    else {
                        this.mouses = 0;
                    }
                    this.drawms();
                    if (lobby.fase == 1) {
                        lobby.preforma(this.xm, this.ym);
                    }
                    if (lobby.loadwarb) {
                        this.repaint();
                        globe.loadwarb();
                        lobby.loadwarb = false;
                    }
                    if (globe.loadwbgames == 1) {
                        this.repaint();
                        globe.loadwgames();
                    }
                    if (this.mouses == 1) {
                        this.mouses = 11;
                    }
                    if (this.mouses <= -1) {
                        --this.mouses;
                        if (this.mouses == -4) {
                            this.mouses = 0;
                        }
                    }
                    if (this.mousew != 0) {
                        if (this.mousew > 0) {
                            --this.mousew;
                        }
                        else {
                            ++this.mousew;
                        }
                        if (!lobby.zeromsw) {
                            this.mousew = 0;
                        }
                    }
                }
            }
            if (xtGraphics.fase == 24) {
                login.endcons();
                login = null;
                lobby = null;
                globe = null;
                n = 0;
                System.gc();
                System.runFinalization();
                if (!xtGraphics.mtop) {
                    xtGraphics.fase = 102;
                    xtGraphics.opselect = 2;
                }
                else {
                    xtGraphics.fase = 10;
                    xtGraphics.opselect = 1;
                }
            }
            if (xtGraphics.fase == 23) {
                if (login.fase == 18) {
                    xtGraphics.playingame = -101;
                }
                login.stopallnow();
                lobby.stopallnow();
                globe.stopallnow();
                login = null;
                lobby = null;
                globe = null;
                this.hidefields();
                n = 0;
                System.gc();
                System.runFinalization();
                xtGraphics.fase = -9;
            }
            if (xtGraphics.fase == 22) {
                this.loadstage(array2, array, medium, trackers, checkPoints, xtGraphics, array3, record);
                if (checkPoints.stage != -3) {
                    if (xtGraphics.lan && xtGraphics.im == 0) {
                        udpMistro.UDPLanServer(xtGraphics.nplayers, xtGraphics.server, xtGraphics.servport, xtGraphics.playingame);
                    }
                    this.u[0].falseo(2);
                    this.requestFocus();
                }
                else {
                    xtGraphics.fase = 1177;
                }
            }
            if (xtGraphics.fase == 21) {
                login.endcons();
                login = null;
                lobby = null;
                globe = null;
                n = 0;
                System.gc();
                System.runFinalization();
                xtGraphics.fase = 22;
            }
            if (xtGraphics.fase == 0) {
                for (int n33 = 0; n33 < xtGraphics.nplayers; ++n33) {
                    if (array3[n33].newcar) {
                        final int xz = array2[n33].xz;
                        final int xy = array2[n33].xy;
                        final int zy = array2[n33].zy;
                        array2[n33] = new ContO(array[array3[n33].cn], array2[n33].x, array2[n33].y, array2[n33].z, 0);
                        array2[n33].xz = xz;
                        array2[n33].xy = xy;
                        array2[n33].zy = zy;
                        array3[n33].newcar = false;
                    }
                }
                medium.d(this.rd);
                int n34 = 0;
                final int[] array16 = new int[200];
                for (int n35 = 0; n35 < this.nob; ++n35) {
                    if (array2[n35].dist != 0) {
                        array16[n34] = n35;
                        ++n34;
                    }
                    else {
                        array2[n35].d(this.rd);
                    }
                }
                final int[] array17 = new int[n34];
                final int[] array18 = new int[n34];
                for (int n36 = 0; n36 < n34; ++n36) {
                    array17[n36] = 0;
                }
                for (int n37 = 0; n37 < n34; ++n37) {
                    for (int n38 = n37 + 1; n38 < n34; ++n38) {
                        if (array2[array16[n37]].dist < array2[array16[n38]].dist) {
                            final int[] array19 = array17;
                            final int n39 = n37;
                            ++array19[n39];
                        }
                        else {
                            final int[] array20 = array17;
                            final int n40 = n38;
                            ++array20[n40];
                        }
                    }
                    array18[array17[n37]] = n37;
                }
                for (int n41 = 0; n41 < n34; ++n41) {
                    array2[array16[array18[n41]]].d(this.rd);
                }
                if (xtGraphics.starcnt == 0) {
                    for (int n42 = 0; n42 < xtGraphics.nplayers; ++n42) {
                        for (int n43 = 0; n43 < xtGraphics.nplayers; ++n43) {
                            if (n43 != n42) {
                                array3[n42].colide(array2[n42], array3[n43], array2[n43]);
                            }
                        }
                    }
                    for (int n44 = 0; n44 < xtGraphics.nplayers; ++n44) {
                        array3[n44].drive(this.u[n44], array2[n44], trackers, checkPoints);
                    }
                    for (int n45 = 0; n45 < xtGraphics.nplayers; ++n45) {
                        record.rec(array2[n45], n45, array3[n45].squash, array3[n45].lastcolido, array3[n45].cntdest, 0);
                    }
                    checkPoints.checkstat(array3, array2, record, xtGraphics.nplayers, xtGraphics.im, 0);
                    for (int n46 = 1; n46 < xtGraphics.nplayers; ++n46) {
                        this.u[n46].preform(array3[n46], array2[n46], checkPoints, trackers);
                    }
                }
                else {
                    if (xtGraphics.starcnt == 130) {
                        medium.adv = 1900;
                        medium.zy = 40;
                        medium.vxz = 70;
                        this.rd.setColor(new Color(255, 255, 255));
                        this.rd.fillRect(0, 0, 800, 450);
                    }
                    if (xtGraphics.starcnt != 0) {
                        final xtGraphics xtGraphics2 = xtGraphics;
                        --xtGraphics2.starcnt;
                    }
                }
                if (xtGraphics.starcnt < 38) {
                    if (this.view == 0) {
                        medium.follow(array2[0], array3[0].cxz, this.u[0].lookback);
                        xtGraphics.stat(array3[0], array2[0], checkPoints, this.u[0], true);
                        if (array3[0].outshakedam > 0) {
                            this.shaka = array3[0].outshakedam / 20;
                            if (this.shaka > 25) {
                                this.shaka = 25;
                            }
                        }
                        this.mvect = 65 + Math.abs(this.lmxz - medium.xz) / 5 * 100;
                        if (this.mvect > 90) {
                            this.mvect = 90;
                        }
                        this.lmxz = medium.xz;
                    }
                    if (this.view == 1) {
                        medium.around(array2[0], false);
                        xtGraphics.stat(array3[0], array2[0], checkPoints, this.u[0], false);
                        this.mvect = 80;
                    }
                    if (this.view == 2) {
                        medium.watch(array2[0], array3[0].mxz);
                        xtGraphics.stat(array3[0], array2[0], checkPoints, this.u[0], false);
                        this.mvect = 65 + Math.abs(this.lmxz - medium.xz) / 5 * 100;
                        if (this.mvect > 90) {
                            this.mvect = 90;
                        }
                        this.lmxz = medium.xz;
                    }
                    if (this.mouses == 1) {
                        this.u[0].enter = true;
                        this.mouses = 0;
                    }
                }
                else {
                    int n47 = 3;
                    if (xtGraphics.nplayers == 1) {
                        n47 = 0;
                    }
                    medium.around(array2[n47], true);
                    this.mvect = 80;
                    if (this.u[0].enter || this.u[0].handb) {
                        xtGraphics.starcnt = 38;
                        this.u[0].enter = false;
                        this.u[0].handb = false;
                    }
                    if (xtGraphics.starcnt == 38) {
                        this.mouses = 0;
                        medium.vert = false;
                        medium.adv = 900;
                        medium.vxz = 180;
                        checkPoints.checkstat(array3, array2, record, xtGraphics.nplayers, xtGraphics.im, 0);
                        medium.follow(array2[0], array3[0].cxz, 0);
                        xtGraphics.stat(array3[0], array2[0], checkPoints, this.u[0], true);
                        this.rd.setColor(new Color(255, 255, 255));
                        this.rd.fillRect(0, 0, 800, 450);
                    }
                }
            }
            if (xtGraphics.fase == 7001) {
                for (int n48 = 0; n48 < xtGraphics.nplayers; ++n48) {
                    if (array3[n48].newedcar == 0 && array3[n48].newcar) {
                        final int xz2 = array2[n48].xz;
                        final int xy2 = array2[n48].xy;
                        final int zy2 = array2[n48].zy;
                        xtGraphics.colorCar(array[array3[n48].cn], n48);
                        array2[n48] = new ContO(array[array3[n48].cn], array2[n48].x, array2[n48].y, array2[n48].z, 0);
                        array2[n48].xz = xz2;
                        array2[n48].xy = xy2;
                        array2[n48].zy = zy2;
                        array3[n48].newedcar = 20;
                    }
                }
                medium.d(this.rd);
                int n49 = 0;
                final int[] array21 = new int[200];
                for (int n50 = 0; n50 < this.nob; ++n50) {
                    if (array2[n50].dist != 0) {
                        array21[n49] = n50;
                        ++n49;
                    }
                    else {
                        array2[n50].d(this.rd);
                    }
                }
                final int[] array22 = new int[n49];
                final int[] array23 = new int[n49];
                for (int n51 = 0; n51 < n49; ++n51) {
                    array22[n51] = 0;
                }
                for (int n52 = 0; n52 < n49; ++n52) {
                    for (int n53 = n52 + 1; n53 < n49; ++n53) {
                        if (array2[array21[n52]].dist < array2[array21[n53]].dist) {
                            final int[] array24 = array22;
                            final int n54 = n52;
                            ++array24[n54];
                        }
                        else {
                            final int[] array25 = array22;
                            final int n55 = n53;
                            ++array25[n55];
                        }
                    }
                    array23[array22[n52]] = n52;
                }
                for (int n56 = 0; n56 < n49; ++n56) {
                    if (array21[array23[n56]] < xtGraphics.nplayers && array21[array23[n56]] != xtGraphics.im) {
                        udpMistro.readContOinfo(array2[array21[array23[n56]]], array21[array23[n56]]);
                    }
                    array2[array21[array23[n56]]].d(this.rd);
                }
                if (xtGraphics.starcnt == 0) {
                    if (xtGraphics.multion == 1) {
                        int n57 = 1;
                        for (int n58 = 0; n58 < xtGraphics.nplayers; ++n58) {
                            if (xtGraphics.im != n58) {
                                udpMistro.readinfo(array3[n58], array2[n58], this.u[n57], n58, checkPoints.dested);
                                ++n57;
                            }
                        }
                    }
                    else {
                        for (int n59 = 0; n59 < xtGraphics.nplayers; ++n59) {
                            udpMistro.readinfo(array3[n59], array2[n59], this.u[n59], n59, checkPoints.dested);
                        }
                    }
                    for (int n60 = 0; n60 < xtGraphics.nplayers; ++n60) {
                        for (int n61 = 0; n61 < xtGraphics.nplayers; ++n61) {
                            if (n61 != n60) {
                                array3[n60].colide(array2[n60], array3[n61], array2[n61]);
                            }
                        }
                    }
                    if (xtGraphics.multion == 1) {
                        int n62 = 1;
                        for (int n63 = 0; n63 < xtGraphics.nplayers; ++n63) {
                            if (xtGraphics.im != n63) {
                                array3[n63].drive(this.u[n62], array2[n63], trackers, checkPoints);
                                ++n62;
                            }
                            else {
                                array3[n63].drive(this.u[0], array2[n63], trackers, checkPoints);
                            }
                        }
                        for (int n64 = 0; n64 < xtGraphics.nplayers; ++n64) {
                            record.rec(array2[n64], n64, array3[n64].squash, array3[n64].lastcolido, array3[n64].cntdest, xtGraphics.im);
                        }
                    }
                    else {
                        for (int n65 = 0; n65 < xtGraphics.nplayers; ++n65) {
                            array3[n65].drive(this.u[n65], array2[n65], trackers, checkPoints);
                        }
                    }
                    checkPoints.checkstat(array3, array2, record, xtGraphics.nplayers, xtGraphics.im, xtGraphics.multion);
                }
                else {
                    if (xtGraphics.starcnt == 130) {
                        medium.adv = 1900;
                        medium.zy = 40;
                        medium.vxz = 70;
                        this.rd.setColor(new Color(255, 255, 255));
                        this.rd.fillRect(0, 0, 800, 450);
                        this.repaint();
                        if (xtGraphics.lan) {
                            udpMistro.UDPConnectLan(xtGraphics.localserver, xtGraphics.nplayers, xtGraphics.im);
                            if (xtGraphics.im == 0) {
                                xtGraphics.setbots(udpMistro.isbot, udpMistro.frame);
                            }
                        }
                        else {
                            udpMistro.UDPConnectOnline(xtGraphics.server, xtGraphics.gameport, xtGraphics.nplayers, xtGraphics.im);
                        }
                        if (xtGraphics.multion >= 2) {
                            xtGraphics.im = (int)(Math.random() * xtGraphics.nplayers);
                            xtGraphics.starcnt = 0;
                        }
                    }
                    if (xtGraphics.starcnt == 50) {
                        udpMistro.frame[udpMistro.im][0] = 0;
                    }
                    if (xtGraphics.starcnt != 39 && xtGraphics.starcnt != 0) {
                        final xtGraphics xtGraphics3 = xtGraphics;
                        --xtGraphics3.starcnt;
                    }
                    if (udpMistro.go && xtGraphics.starcnt >= 39) {
                        xtGraphics.starcnt = 38;
                        if (xtGraphics.lan) {
                            if (checkPoints.stage < 0) {}
                            if (xtGraphics.loadedt) {
                                xtGraphics.strack.play();
                            }
                        }
                    }
                }
                if (xtGraphics.lan && udpMistro.im == 0) {
                    for (int n66 = 2; n66 < xtGraphics.nplayers; ++n66) {
                        if (udpMistro.isbot[n66]) {
                            this.u[n66].preform(array3[n66], array2[n66], checkPoints, trackers);
                            udpMistro.setinfo(array3[n66], array2[n66], this.u[n66], checkPoints.pos[n66], checkPoints.magperc[n66], false, n66);
                        }
                    }
                }
                if (xtGraphics.starcnt < 38) {
                    if (xtGraphics.multion == 1) {
                        udpMistro.setinfo(array3[xtGraphics.im], array2[xtGraphics.im], this.u[0], checkPoints.pos[xtGraphics.im], checkPoints.magperc[xtGraphics.im], xtGraphics.holdit, xtGraphics.im);
                        if (this.view == 0) {
                            medium.follow(array2[xtGraphics.im], array3[xtGraphics.im].cxz, this.u[0].lookback);
                            xtGraphics.stat(array3[xtGraphics.im], array2[xtGraphics.im], checkPoints, this.u[0], true);
                            if (array3[xtGraphics.im].outshakedam > 0) {
                                this.shaka = array3[xtGraphics.im].outshakedam / 20;
                                if (this.shaka > 25) {
                                    this.shaka = 25;
                                }
                            }
                            this.mvect = 65 + Math.abs(this.lmxz - medium.xz) / 5 * 100;
                            if (this.mvect > 90) {
                                this.mvect = 90;
                            }
                            this.lmxz = medium.xz;
                        }
                        if (this.view == 1) {
                            medium.around(array2[xtGraphics.im], false);
                            xtGraphics.stat(array3[xtGraphics.im], array2[xtGraphics.im], checkPoints, this.u[0], false);
                            this.mvect = 80;
                        }
                        if (this.view == 2) {
                            medium.watch(array2[xtGraphics.im], array3[xtGraphics.im].mxz);
                            xtGraphics.stat(array3[xtGraphics.im], array2[xtGraphics.im], checkPoints, this.u[0], false);
                            this.mvect = 65 + Math.abs(this.lmxz - medium.xz) / 5 * 100;
                            if (this.mvect > 90) {
                                this.mvect = 90;
                            }
                            this.lmxz = medium.xz;
                        }
                    }
                    else {
                        if (this.view == 0) {
                            medium.getaround(array2[xtGraphics.im]);
                            this.mvect = 80;
                        }
                        if (this.view == 1) {
                            medium.getfollow(array2[xtGraphics.im], array3[xtGraphics.im].cxz, this.u[0].lookback);
                            this.mvect = 65 + Math.abs(this.lmxz - medium.xz) / 5 * 100;
                            if (this.mvect > 90) {
                                this.mvect = 90;
                            }
                            this.lmxz = medium.xz;
                        }
                        if (this.view == 2) {
                            medium.watch(array2[xtGraphics.im], array3[xtGraphics.im].mxz);
                            this.mvect = 65 + Math.abs(this.lmxz - medium.xz) / 5 * 100;
                            if (this.mvect > 90) {
                                this.mvect = 90;
                            }
                            this.lmxz = medium.xz;
                        }
                        xtGraphics.stat(array3[xtGraphics.im], array2[xtGraphics.im], checkPoints, this.u[0], true);
                    }
                    if (this.mouses == 1) {
                        if (xtGraphics.holdit && xtGraphics.exitm != 4 && xtGraphics.multion == 1) {
                            this.u[0].enter = true;
                        }
                        this.mouses = 0;
                    }
                }
                else {
                    medium.around(array2[xtGraphics.im], true);
                    this.mvect = 80;
                    if (xtGraphics.starcnt == 39) {
                        xtGraphics.waitenter();
                    }
                    if (xtGraphics.starcnt == 38) {
                        xtGraphics.forstart = 0;
                        this.mouses = 0;
                        medium.vert = false;
                        medium.adv = 900;
                        medium.vxz = 180;
                        checkPoints.checkstat(array3, array2, record, xtGraphics.nplayers, xtGraphics.im, xtGraphics.multion);
                        medium.follow(array2[xtGraphics.im], array3[xtGraphics.im].cxz, 0);
                        xtGraphics.stat(array3[xtGraphics.im], array2[xtGraphics.im], checkPoints, this.u[0], true);
                        this.rd.setColor(new Color(255, 255, 255));
                        this.rd.fillRect(0, 0, 800, 450);
                    }
                }
                xtGraphics.multistat(this.u[0], checkPoints, this.xm, this.ym, this.moused, udpMistro);
            }
            if (xtGraphics.fase == -1) {
                if (n7 == 0) {
                    for (int n67 = 0; n67 < xtGraphics.nplayers; ++n67) {
                        record.ocar[n67] = new ContO(array2[n67], 0, 0, 0, 0);
                        array2[n67] = new ContO(record.car[0][n67], 0, 0, 0, 0);
                    }
                }
                medium.d(this.rd);
                int n68 = 0;
                final int[] array26 = new int[200];
                for (int n69 = 0; n69 < this.nob; ++n69) {
                    if (array2[n69].dist != 0) {
                        array26[n68] = n69;
                        ++n68;
                    }
                    else {
                        array2[n69].d(this.rd);
                    }
                }
                final int[] array27 = new int[n68];
                for (int n70 = 0; n70 < n68; ++n70) {
                    array27[n70] = 0;
                }
                for (int n71 = 0; n71 < n68; ++n71) {
                    for (int n72 = n71 + 1; n72 < n68; ++n72) {
                        if (array2[array26[n71]].dist != array2[array26[n72]].dist) {
                            if (array2[array26[n71]].dist < array2[array26[n72]].dist) {
                                final int[] array28 = array27;
                                final int n73 = n71;
                                ++array28[n73];
                            }
                            else {
                                final int[] array29 = array27;
                                final int n74 = n72;
                                ++array29[n74];
                            }
                        }
                        else if (n72 > n71) {
                            final int[] array30 = array27;
                            final int n75 = n71;
                            ++array30[n75];
                        }
                        else {
                            final int[] array31 = array27;
                            final int n76 = n72;
                            ++array31[n76];
                        }
                    }
                }
                for (int n77 = 0; n77 < n68; ++n77) {
                    for (int n78 = 0; n78 < n68; ++n78) {
                        if (array27[n78] == n77) {
                            array2[array26[n78]].d(this.rd);
                        }
                    }
                }
                if (this.u[0].enter || this.u[0].handb || this.mouses == 1) {
                    n7 = 299;
                    this.u[0].enter = false;
                    this.u[0].handb = false;
                    this.mouses = 0;
                }
                for (int n79 = 0; n79 < xtGraphics.nplayers; ++n79) {
                    if (record.fix[n79] == n7) {
                        if (array2[n79].dist == 0) {
                            array2[n79].fcnt = 8;
                        }
                        else {
                            array2[n79].fix = true;
                        }
                    }
                    if (array2[n79].fcnt == 7 || array2[n79].fcnt == 8) {
                        array2[n79] = new ContO(array[array3[n79].cn], 0, 0, 0, 0);
                        record.cntdest[n79] = 0;
                    }
                    if (n7 == 299) {
                        array2[n79] = new ContO(record.ocar[n79], 0, 0, 0, 0);
                    }
                    record.play(array2[n79], array3[n79], n79, n7);
                }
                if (++n7 == 300) {
                    n7 = 0;
                    xtGraphics.fase = -6;
                }
                else {
                    xtGraphics.replyn();
                }
                medium.around(array2[0], false);
            }
            if (xtGraphics.fase == -2) {
                if (xtGraphics.multion >= 2) {
                    record.hcaught = false;
                }
                this.u[0].falseo(3);
                if (record.hcaught && record.wasted == 0 && record.whenwasted != 229 && (checkPoints.stage == 1 || checkPoints.stage == 2) && xtGraphics.looped != 0) {
                    record.hcaught = false;
                }
                if (record.hcaught) {
                    this.rd.setColor(new Color(0, 0, 0));
                    this.rd.fillRect(0, 0, 800, 450);
                    this.repaint();
                }
                if (xtGraphics.multion != 0) {
                    udpMistro.UDPquit();
                    xtGraphics.stopchat();
                    if (this.cmsg.isShowing()) {
                        this.cmsg.hide();
                    }
                    this.cmsg.setText("");
                    this.requestFocus();
                }
                if (record.hcaught) {
                    if (medium.random() > 0.45) {
                        medium.vert = false;
                    }
                    else {
                        medium.vert = true;
                    }
                    medium.adv = (int)(900.0f * medium.random());
                    medium.vxz = (int)(360.0f * medium.random());
                    n7 = 0;
                    xtGraphics.fase = -3;
                    n8 = 0;
                    n9 = 0;
                }
                else {
                    n7 = -2;
                    xtGraphics.fase = -4;
                }
            }
            if (xtGraphics.fase == -3) {
                if (n7 == 0) {
                    if (record.wasted == 0) {
                        if (record.whenwasted == 229) {
                            n10 = 67;
                            final Medium medium2 = medium;
                            medium2.vxz += 90;
                        }
                        else {
                            n10 = (int)(medium.random() * 4.0f);
                            if (n10 == 1 || n10 == 3) {
                                n10 = 69;
                            }
                            if (n10 == 2 || n10 == 4) {
                                n10 = 30;
                            }
                        }
                    }
                    else if (record.closefinish != 0 && n9 != 0) {
                        final Medium medium3 = medium;
                        medium3.vxz += 90;
                    }
                    for (int n80 = 0; n80 < xtGraphics.nplayers; ++n80) {
                        array2[n80] = new ContO(record.starcar[n80], 0, 0, 0, 0);
                    }
                }
                medium.d(this.rd);
                int n81 = 0;
                final int[] array32 = new int[200];
                for (int n82 = 0; n82 < this.nob; ++n82) {
                    if (array2[n82].dist != 0) {
                        array32[n81] = n82;
                        ++n81;
                    }
                    else {
                        array2[n82].d(this.rd);
                    }
                }
                final int[] array33 = new int[n81];
                for (int n83 = 0; n83 < n81; ++n83) {
                    array33[n83] = 0;
                }
                for (int n84 = 0; n84 < n81; ++n84) {
                    for (int n85 = n84 + 1; n85 < n81; ++n85) {
                        if (array2[array32[n84]].dist != array2[array32[n85]].dist) {
                            if (array2[array32[n84]].dist < array2[array32[n85]].dist) {
                                final int[] array34 = array33;
                                final int n86 = n84;
                                ++array34[n86];
                            }
                            else {
                                final int[] array35 = array33;
                                final int n87 = n85;
                                ++array35[n87];
                            }
                        }
                        else if (n85 > n84) {
                            final int[] array36 = array33;
                            final int n88 = n84;
                            ++array36[n88];
                        }
                        else {
                            final int[] array37 = array33;
                            final int n89 = n85;
                            ++array37[n89];
                        }
                    }
                }
                for (int n90 = 0; n90 < n81; ++n90) {
                    for (int n91 = 0; n91 < n81; ++n91) {
                        if (array33[n91] == n90) {
                            array2[array32[n91]].d(this.rd);
                        }
                    }
                }
                for (int n92 = 0; n92 < xtGraphics.nplayers; ++n92) {
                    if (record.hfix[n92] == n7) {
                        if (array2[n92].dist == 0) {
                            array2[n92].fcnt = 8;
                        }
                        else {
                            array2[n92].fix = true;
                        }
                    }
                    if (array2[n92].fcnt == 7 || array2[n92].fcnt == 8) {
                        array2[n92] = new ContO(array[array3[n92].cn], 0, 0, 0, 0);
                        record.cntdest[n92] = 0;
                    }
                    record.playh(array2[n92], array3[n92], n92, n7, xtGraphics.im);
                }
                if (n9 == 2 && n7 == 299) {
                    this.u[0].enter = true;
                }
                if (this.u[0].enter || this.u[0].handb) {
                    xtGraphics.fase = -4;
                    this.u[0].enter = false;
                    this.u[0].handb = false;
                    n7 = -7;
                }
                else {
                    xtGraphics.levelhigh(record.wasted, record.whenwasted, record.closefinish, n7, checkPoints.stage);
                    if (n7 == 0 || n7 == 1 || n7 == 2) {
                        this.rd.setColor(new Color(0, 0, 0));
                        this.rd.fillRect(0, 0, 800, 450);
                    }
                    if (record.wasted != xtGraphics.im) {
                        if (record.closefinish == 0) {
                            if (n8 == 9 || n8 == 11) {
                                this.rd.setColor(new Color(255, 255, 255));
                                this.rd.fillRect(0, 0, 800, 450);
                            }
                            if (n8 == 0) {
                                medium.around(array2[xtGraphics.im], false);
                            }
                            if (n8 > 0 && n8 < 20) {
                                medium.transaround(array2[xtGraphics.im], array2[record.wasted], n8);
                            }
                            if (n8 == 20) {
                                medium.around(array2[record.wasted], false);
                            }
                            if (n7 > record.whenwasted && n8 != 20) {
                                ++n8;
                            }
                            if ((n8 == 0 || n8 == 20) && ++n7 == 300) {
                                n7 = 0;
                                n8 = 0;
                                ++n9;
                            }
                        }
                        else if (record.closefinish == 1) {
                            if (n8 == 0) {
                                medium.around(array2[xtGraphics.im], false);
                            }
                            if (n8 > 0 && n8 < 20) {
                                medium.transaround(array2[xtGraphics.im], array2[record.wasted], n8);
                            }
                            if (n8 == 20) {
                                medium.around(array2[record.wasted], false);
                            }
                            if (n8 > 20 && n8 < 40) {
                                medium.transaround(array2[record.wasted], array2[xtGraphics.im], n8 - 20);
                            }
                            if (n8 == 40) {
                                medium.around(array2[xtGraphics.im], false);
                            }
                            if (n8 > 40 && n8 < 60) {
                                medium.transaround(array2[xtGraphics.im], array2[record.wasted], n8 - 40);
                            }
                            if (n8 == 60) {
                                medium.around(array2[record.wasted], false);
                            }
                            if (n7 > 160 && n8 < 20) {
                                ++n8;
                            }
                            if (n7 > 230 && n8 < 40) {
                                ++n8;
                            }
                            if (n7 > 280 && n8 < 60) {
                                ++n8;
                            }
                            if ((n8 == 0 || n8 == 20 || n8 == 40 || n8 == 60) && ++n7 == 300) {
                                n7 = 0;
                                n8 = 0;
                                ++n9;
                            }
                        }
                        else {
                            if (n8 == 0) {
                                medium.around(array2[xtGraphics.im], false);
                            }
                            if (n8 > 0 && n8 < 20) {
                                medium.transaround(array2[xtGraphics.im], array2[record.wasted], n8);
                            }
                            if (n8 == 20) {
                                medium.around(array2[record.wasted], false);
                            }
                            if (n8 > 20 && n8 < 40) {
                                medium.transaround(array2[record.wasted], array2[xtGraphics.im], n8 - 20);
                            }
                            if (n8 == 40) {
                                medium.around(array2[xtGraphics.im], false);
                            }
                            if (n8 > 40 && n8 < 60) {
                                medium.transaround(array2[xtGraphics.im], array2[record.wasted], n8 - 40);
                            }
                            if (n8 == 60) {
                                medium.around(array2[record.wasted], false);
                            }
                            if (n8 > 60 && n8 < 80) {
                                medium.transaround(array2[record.wasted], array2[xtGraphics.im], n8 - 60);
                            }
                            if (n8 == 80) {
                                medium.around(array2[xtGraphics.im], false);
                            }
                            if (n7 > 90 && n8 < 20) {
                                ++n8;
                            }
                            if (n7 > 160 && n8 < 40) {
                                ++n8;
                            }
                            if (n7 > 230 && n8 < 60) {
                                ++n8;
                            }
                            if (n7 > 280 && n8 < 80) {
                                ++n8;
                            }
                            if ((n8 == 0 || n8 == 20 || n8 == 40 || n8 == 60 || n8 == 80) && ++n7 == 300) {
                                n7 = 0;
                                n8 = 0;
                                ++n9;
                            }
                        }
                    }
                    else {
                        if (n10 == 67 && (n8 == 3 || n8 == 31 || n8 == 66)) {
                            this.rd.setColor(new Color(255, 255, 255));
                            this.rd.fillRect(0, 0, 800, 450);
                        }
                        if (n10 == 69 && (n8 == 3 || n8 == 5 || n8 == 31 || n8 == 33 || n8 == 66 || n8 == 68)) {
                            this.rd.setColor(new Color(255, 255, 255));
                            this.rd.fillRect(0, 0, 800, 450);
                        }
                        if (n10 == 30 && n8 >= 1 && n8 < 30) {
                            if (n8 % (int)(2.0f + medium.random() * 3.0f) == 0 && n11 == 0) {
                                this.rd.setColor(new Color(255, 255, 255));
                                this.rd.fillRect(0, 0, 800, 450);
                                n11 = 1;
                            }
                            else {
                                n11 = 0;
                            }
                        }
                        if (n7 > record.whenwasted && n8 != n10) {
                            ++n8;
                        }
                        medium.around(array2[xtGraphics.im], false);
                        if ((n8 == 0 || n8 == n10) && ++n7 == 300) {
                            n7 = 0;
                            n8 = 0;
                            ++n9;
                        }
                    }
                }
            }
            if (xtGraphics.fase == -4) {
                if (n7 == 0) {
                    xtGraphics.sendwin(checkPoints);
                    if (xtGraphics.winner && xtGraphics.multion == 0 && xtGraphics.gmode != 0 && checkPoints.stage != 27 && checkPoints.stage == xtGraphics.unlocked[xtGraphics.gmode - 1] + (xtGraphics.gmode - 1) * 10) {
                        final int[] unlocked = xtGraphics.unlocked;
                        final int n93 = xtGraphics.gmode - 1;
                        ++unlocked[n93];
                        this.setcarcookie(xtGraphics.sc[0], carDefine.names[xtGraphics.sc[0]], xtGraphics.arnp, xtGraphics.gmode, xtGraphics.unlocked, false);
                        final int[] unlocked2 = xtGraphics.unlocked;
                        final int n94 = xtGraphics.gmode - 1;
                        --unlocked2[n94];
                    }
                }
                if (n7 <= 0) {
                    this.rd.drawImage(xtGraphics.mdness, 289, 30, null);
                    this.rd.drawImage(xtGraphics.dude[0], 135, 10, null);
                }
                if (n7 >= 0) {
                    xtGraphics.fleximage(this.offImage, n7, checkPoints.stage);
                }
                if (++n7 == 7) {
                    xtGraphics.fase = -5;
                    this.rd.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
                    this.rd.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
                }
            }
            if (xtGraphics.fase == -6) {
                this.repaint();
                xtGraphics.pauseimage(this.offImage);
                xtGraphics.fase = -7;
                this.mouses = 0;
            }
            if (xtGraphics.fase == -7) {
                xtGraphics.pausedgame(checkPoints.stage, this.u[0], record);
                if (n7 != 0) {
                    n7 = 0;
                }
                xtGraphics.ctachm(this.xm, this.ym, this.mouses, this.u[0]);
                if (this.mouses == 2) {
                    this.mouses = 0;
                }
                if (this.mouses == 1) {
                    this.mouses = 2;
                }
            }
            if (xtGraphics.fase == -8) {
                xtGraphics.cantreply();
                if (++n7 == 150 || this.u[0].enter || this.u[0].handb || this.mouses == 1) {
                    xtGraphics.fase = -7;
                    this.mouses = 0;
                    this.u[0].enter = false;
                    this.u[0].handb = false;
                }
            }
            if (this.lostfcs && xtGraphics.fase == 7001) {
                if (this.fcscnt == 0) {
                    if (this.u[0].chatup == 0) {
                        this.requestFocus();
                    }
                    this.fcscnt = 10;
                }
                else {
                    --this.fcscnt;
                }
            }
            this.repaint();
            if (xtGraphics.im > -1 && xtGraphics.im < 8) {
                int im = 0;
                if (xtGraphics.multion == 2 || xtGraphics.multion == 3) {
                    im = xtGraphics.im;
                    this.u[im].mutem = this.u[0].mutem;
                    this.u[im].mutes = this.u[0].mutes;
                }
                xtGraphics.playsounds(array3[xtGraphics.im], this.u[im], checkPoints.stage);
            }
            final long time3 = new Date().getTime();
            if (xtGraphics.fase == 0 || xtGraphics.fase == -1 || xtGraphics.fase == -3 || xtGraphics.fase == 7001) {
                if (n3 == 0) {
                    n4 = 15;
                    a = n2;
                    if (a < 30.0f) {
                        a = 30.0f;
                    }
                    n3 = 1;
                    n6 = 0;
                }
                if (n6 == 10) {
                    float n95 = (n5 + udpMistro.freg - (time3 - time)) / 20.0f;
                    if (n95 > 40.0f) {
                        n95 = 40.0f;
                    }
                    if (n95 < -40.0f) {
                        n95 = -40.0f;
                    }
                    a += n95;
                    if (a < 5.0f) {
                        a = 5.0f;
                    }
                    medium.adjstfade(a, n95, xtGraphics.starcnt, this);
                    time = time3;
                    n6 = 0;
                }
                else {
                    ++n6;
                }
            }
            else {
                if (n3 != 0) {
                    n4 = 30;
                    n2 = a;
                    n3 = 0;
                    n6 = 0;
                }
                if (n6 == 10) {
                    if (time3 - time < 400L) {
                        a += 3.5;
                    }
                    else {
                        a -= 3.5;
                        if (a < 5.0f) {
                            a = 5.0f;
                        }
                    }
                    time = time3;
                    n6 = 0;
                }
                else {
                    ++n6;
                }
            }
            if (this.exwist) {
                this.rd.dispose();
                xtGraphics.stopallnow();
                carDefine.stopallnow();
                udpMistro.UDPquit();
                if (n != 0) {
                    lobby.stopallnow();
                    login.stopallnow();
                    globe.stopallnow();
                }
                System.gc();
                if (Madness.endadv == 2) {
                    Madness.advopen();
                }
                this.gamer.stop();
                this.gamer = null;
            }
            long millis = Math.round(a) - (time3 - time2);
            if (millis < n4) {
                millis = n4;
            }
            try {
                final Thread gamer = this.gamer;
                Thread.sleep(millis);
            }
            catch (final InterruptedException ex) {}
        }
    }
    
    public void checkmemory(final xtGraphics xtGraphics) {
        if (this.applejava || Runtime.getRuntime().freeMemory() / 1048576L < 50L) {
            xtGraphics.badmac = true;
        }
    }
    
    @Override
    public void paint(final Graphics graphics) {
        final Graphics2D graphics2D = (Graphics2D)graphics;
        if (this.lastw != this.getWidth() || this.lasth != this.getHeight()) {
            this.lastw = this.getWidth();
            this.lasth = this.getHeight();
            this.showsize = 100;
            if (this.lastw <= 800 || this.lasth <= 550) {
                this.reqmult = 0.0f;
            }
            if (Madness.fullscreen) {
                if (this.reqmult == 0.0f) {
                    this.reqmult = 1.0f;
                }
                this.apx = (int)(this.getWidth() / 2 - 400.0f * this.apmult);
                this.apy = (int)(this.getHeight() / 2 - 225.0f * this.apmult);
            }
        }
        int n = 0;
        int n2 = 0;
        if (this.moto == 1 && this.shaka > 0) {
            n = (int)((this.shaka * 2 * Math.random() - this.shaka) * this.apmult);
            n2 = (int)((this.shaka * 2 * Math.random() - this.shaka) * this.apmult);
            --this.shaka;
        }
        if (!Madness.fullscreen) {
            if (this.showsize != 0) {
                if (this.showsize == 100 || this.showsize == 70) {
                    graphics2D.clearRect(0, 0, this.getWidth(), this.getHeight());
                }
                float n3 = (this.getWidth() - 40) / 800.0f - 1.0f;
                if (n3 > (this.getHeight() - 70) / 450.0f - 1.0f) {
                    n3 = (this.getHeight() - 70) / 450.0f - 1.0f;
                }
                if (n3 > 1.0f) {
                    n3 = 1.0f;
                }
                if (n3 < 0.0f) {
                    n3 = 0.0f;
                }
                this.apmult = 1.0f + n3 * this.reqmult;
                if (!this.oncarm) {
                    graphics2D.drawImage(this.carmaker[0], 50, 14, this);
                }
                else {
                    graphics2D.drawImage(this.carmaker[1], 50, 14, this);
                }
                if (!this.onstgm) {
                    graphics2D.drawImage(this.stagemaker[0], this.getWidth() - 208, 14, this);
                }
                else {
                    graphics2D.drawImage(this.stagemaker[1], this.getWidth() - 208, 14, this);
                }
                graphics2D.drawImage(this.sizebar, this.getWidth() / 2 - 230, 23, this);
                graphics2D.drawImage(this.blb, (int)(this.getWidth() / 2 - 222 + 141.0f * this.reqmult), 23, this);
                graphics2D.drawImage(this.chkbx[this.smooth], this.getWidth() / 2 - 53, 23, this);
                graphics2D.setFont(new Font("Arial", 1, 11));
                graphics2D.setColor(new Color(74, 99, 125));
                graphics2D.drawString("Screen Size:", this.getWidth() / 2 - 224, 17);
                graphics2D.drawString("Smooth", this.getWidth() / 2 - 36, 34);
                graphics2D.drawImage(this.fulls, this.getWidth() / 2 + 27, 15, this);
                graphics2D.setColor(new Color(94, 126, 159));
                graphics2D.drawString("Fullscreen", this.getWidth() / 2 + 63, 30);
                graphics2D.drawImage(this.chkbx[Madness.anti], this.getWidth() / 2 + 135, 9, this);
                graphics2D.drawString("Antialiasing", this.getWidth() / 2 + 152, 20);
                graphics2D.drawImage(this.chkbx[this.moto], this.getWidth() / 2 + 135, 26, this);
                graphics2D.drawString("Motion Effects", this.getWidth() / 2 + 152, 37);
                graphics2D.setColor(new Color(0, 0, 0));
                graphics2D.fillRect(this.getWidth() / 2 - 153, 5, 80, 16);
                graphics2D.setColor(new Color(121, 135, 152));
                String string = "" + (int)(this.apmult * 100.0f) + "%";
                if (this.reqmult == 0.0f) {
                    string = "Original";
                }
                if (this.reqmult == 1.0f) {
                    string = "Maximum";
                }
                graphics2D.drawString(string, this.getWidth() / 2 - 150, 17);
                if (!this.oncarm && !this.onstgm) {
                    --this.showsize;
                }
                if (this.showsize == 0) {
                    graphics2D.setColor(new Color(0, 0, 0));
                    graphics2D.fillRect(this.getWidth() / 2 - 260, 0, 520, 40);
                    graphics2D.fillRect(50, 14, 142, 23);
                    graphics2D.fillRect(this.getWidth() - 208, 14, 158, 23);
                }
            }
            this.apx = (int)(this.getWidth() / 2 - 400.0f * this.apmult);
            this.apy = (int)(this.getHeight() / 2 - 225.0f * this.apmult - 50.0f);
            if (this.apy < 50) {
                this.apy = 50;
            }
            if (this.apmult > 1.0f) {
                if (this.smooth == 1) {
                    graphics2D.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
                    if (this.moto == 1) {
                        graphics2D.setComposite(AlphaComposite.getInstance(3, this.mvect / 100.0f));
                        this.rd.setRenderingHint(RenderingHints.KEY_ALPHA_INTERPOLATION, RenderingHints.VALUE_ALPHA_INTERPOLATION_SPEED);
                        graphics2D.drawImage(this.offImage, this.apx + n, this.apy + n2, (int)(800.0f * this.apmult), (int)(450.0f * this.apmult), this);
                        this.cropit(graphics2D, n, n2);
                    }
                    else {
                        graphics2D.drawImage(this.offImage, this.apx, this.apy, (int)(800.0f * this.apmult), (int)(450.0f * this.apmult), this);
                    }
                }
                else if (this.moto == 1) {
                    graphics2D.setComposite(AlphaComposite.getInstance(3, this.mvect / 100.0f));
                    this.rd.setRenderingHint(RenderingHints.KEY_ALPHA_INTERPOLATION, RenderingHints.VALUE_ALPHA_INTERPOLATION_SPEED);
                    graphics2D.drawImage(this.offImage, this.apx + n, this.apy + n2, (int)(800.0f * this.apmult), (int)(450.0f * this.apmult), this);
                    this.cropit(graphics2D, n, n2);
                }
                else {
                    graphics2D.drawImage(this.offImage, this.apx, this.apy, (int)(800.0f * this.apmult), (int)(450.0f * this.apmult), this);
                }
            }
            else if (this.moto == 1) {
                graphics2D.setComposite(AlphaComposite.getInstance(3, this.mvect / 100.0f));
                this.rd.setRenderingHint(RenderingHints.KEY_ALPHA_INTERPOLATION, RenderingHints.VALUE_ALPHA_INTERPOLATION_SPEED);
                graphics2D.drawImage(this.offImage, this.apx + n, this.apy + n2, this.apx + n + (int)(this.apmult * 800.0f), this.apy + n2 + (int)(this.apmult * 450.0f), 0, 0, 1600, 900, this);
                this.cropit(graphics2D, n, n2);
            }
            else {
                graphics2D.drawImage(this.offImage, this.apx, this.apy, this.apx + (int)(this.apmult * 800.0f), this.apy + (int)(this.apmult * 450.0f), 0, 0, 1600, 900, this);
            }
        }
        else if (this.moto == 1) {
            graphics2D.setComposite(AlphaComposite.getInstance(3, this.mvect / 100.0f));
            this.rd.setRenderingHint(RenderingHints.KEY_ALPHA_INTERPOLATION, RenderingHints.VALUE_ALPHA_INTERPOLATION_SPEED);
            graphics2D.drawImage(this.offImage, this.apx + n, this.apy + n2, this.apx + n + (int)(this.apmult * 800.0f), this.apy + n2 + (int)(this.apmult * 450.0f), 0, 0, 1600, 900, this);
            this.cropit(graphics2D, n, n2);
        }
        else {
            graphics2D.drawImage(this.offImage, this.apx, this.apy, this.apx + (int)(this.apmult * 800.0f), this.apy + (int)(this.apmult * 450.0f), 0, 0, 1600, 900, this);
        }
    }
    
    public void cropit(final Graphics2D graphics2D, final int a, final int a2) {
        if (a != 0 || a2 != 0) {
            graphics2D.setComposite(AlphaComposite.getInstance(3, 1.0f));
            graphics2D.setColor(new Color(0, 0, 0));
        }
        if (a != 0) {
            if (a < 0) {
                graphics2D.fillRect(this.apx + a, this.apy - (int)(25.0f * this.apmult), Math.abs(a), (int)(500.0f * this.apmult));
            }
            else {
                graphics2D.fillRect(this.apx + (int)(800.0f * this.apmult), this.apy - (int)(25.0f * this.apmult), a, (int)(500.0f * this.apmult));
            }
        }
        if (a2 != 0) {
            if (a2 < 0) {
                graphics2D.fillRect(this.apx - (int)(25.0f * this.apmult), this.apy + a2, (int)(850.0f * this.apmult), Math.abs(a2));
            }
            else {
                graphics2D.fillRect(this.apx - (int)(25.0f * this.apmult), this.apy + (int)(450.0f * this.apmult), (int)(850.0f * this.apmult), a2);
            }
        }
    }
    
    @Override
    public void update(final Graphics graphics) {
        this.paint(graphics);
    }
    
    @Override
    public void init() {
        this.setBackground(new Color(0, 0, 0));
        this.offImage = this.createImage(1600, 900);
        if (this.offImage != null) {
            (this.rd = (Graphics2D)this.offImage.getGraphics()).scale(2.0, 2.0);
        }
        this.rd.setRenderingHint(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_ON);
        this.rd.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        this.setLayout(null);
        (this.tnick = new TextField("Nickbname")).setFont(new Font("Arial", 1, 13));
        (this.tpass = new TextField("")).setFont(new Font("Arial", 1, 13));
        this.tpass.setEchoCharacter('*');
        (this.temail = new TextField("")).setFont(new Font("Arial", 1, 13));
        this.cmsg = new TextField("");
        if (System.getProperty("java.vendor").toLowerCase().indexOf("oracle") != -1) {
            this.cmsg.addKeyListener(new KeyAdapter() {
                @Override
                public void keyReleased(final KeyEvent keyEvent) {
                }
                
                @Override
                public void keyTyped(final KeyEvent keyEvent) {
                }
                
                @Override
                public void keyPressed(final KeyEvent keyEvent) {
                    if (keyEvent.getKeyCode() == 10 && GameSparker.this.u[0] != null) {
                        GameSparker.this.u[0].enter = true;
                    }
                }
            });
        }
        this.mmsg = new TextArea("", 200, 20, 3);
        this.cmsg.setFont(new Font("Tahoma", 0, 11));
        this.mmsg.setFont(new Font("Tahoma", 0, 11));
        this.mycar = new Checkbox("Sword of Justice Game!");
        this.notp = new Checkbox("No Trees & Piles");
        (this.keplo = new Checkbox("Stay logged in")).setState(true);
        this.add(this.tnick);
        this.add(this.tpass);
        this.add(this.temail);
        this.add(this.cmsg);
        this.add(this.mmsg);
        this.add(this.mycar);
        this.add(this.notp);
        this.add(this.keplo);
        this.sgame.setFont(new Font("Arial", 1, 13));
        this.wgame.setFont(new Font("Arial", 1, 13));
        this.warb.setFont(new Font("Arial", 1, 13));
        this.pgame.setFont(new Font("Arial", 1, 12));
        this.vnpls.setFont(new Font("Arial", 1, 13));
        this.vtyp.setFont(new Font("Arial", 1, 13));
        this.snfmm.setFont(new Font("Arial", 1, 13));
        this.snfm1.setFont(new Font("Arial", 1, 13));
        this.snfm2.setFont(new Font("Arial", 1, 13));
        this.mstgs.setFont(new Font("Arial", 1, 13));
        this.mcars.setFont(new Font("Arial", 1, 13));
        this.slaps.setFont(new Font("Arial", 1, 13));
        this.snpls.setFont(new Font("Arial", 0, 13));
        this.snbts.setFont(new Font("Arial", 0, 13));
        this.swait.setFont(new Font("Arial", 0, 12));
        this.sclass.setFont(new Font("Arial", 1, 12));
        this.scars.setFont(new Font("Arial", 1, 12));
        this.sfix.setFont(new Font("Arial", 1, 12));
        this.mycar.setFont(new Font("Arial", 1, 12));
        this.notp.setFont(new Font("Arial", 1, 12));
        this.keplo.setFont(new Font("Arial", 1, 12));
        this.gmode.setFont(new Font("Arial", 1, 13));
        this.rooms.setFont(new Font("Arial", 1, 13));
        this.sendtyp.setFont(new Font("Arial", 1, 12));
        this.senditem.setFont(new Font("Arial", 1, 12));
        this.datat.setFont(new Font("Arial", 1, 12));
        this.clanlev.setFont(new Font("Arial", 1, 12));
        this.clcars.setFont(new Font("Arial", 1, 12));
        this.clcars.alphad = true;
        this.ilaps.setFont(new Font("Arial", 1, 13));
        this.icars.setFont(new Font("Arial", 1, 12));
        this.proitem.setFont(new Font("Arial", 1, 12));
        this.sgame.add(this.rd, " NFM 1     ");
        this.sgame.add(this.rd, " NFM 2     ");
        this.sgame.add(this.rd, " My Stages ");
        this.sgame.add(this.rd, " Weekly Top20 ");
        this.sgame.add(this.rd, " Monthly Top20 ");
        this.sgame.add(this.rd, " All Time Top20 ");
        this.sgame.add(this.rd, " Stage Maker ");
        this.wgame.add(this.rd, " Normal Game");
        this.wgame.add(this.rd, " War / Battle");
        this.wgame.add(this.rd, " War / Battle - Practice");
        this.warb.add(this.rd, " Loading your clan's wars and battles, please wait...");
        this.pgame.add(this.rd, " Select the game you want to practice");
        this.vnpls.add(this.rd, "Players");
        this.vnpls.add(this.rd, " 2 VS 2");
        this.vnpls.add(this.rd, " 3 VS 3");
        this.vnpls.add(this.rd, " 4 VS 4");
        this.vtyp.add(this.rd, "Normal clan game");
        this.vtyp.add(this.rd, "Racing only");
        this.vtyp.add(this.rd, "Wasting only");
        this.vtyp.add(this.rd, "Racers VS Wasters - my clan wastes");
        this.vtyp.add(this.rd, "Racers VS Wasters - my clan races");
        this.snfmm.add(this.rd, "Select Stage");
        this.snfm1.add(this.rd, "Select Stage");
        this.snfm2.add(this.rd, "Select Stage");
        this.mstgs.add(this.rd, "Suddenly the King becomes Santa's Little Helper");
        this.mcars.add(this.rd, "Sword of Justice");
        this.snpls.add(this.rd, "Select");
        this.swait.add(this.rd, "1 Minute");
        this.ilaps.add(this.rd, "Laps");
        this.ilaps.add(this.rd, "1 Lap");
        for (int i = 0; i < 5; ++i) {
            this.snfmm.add(this.rd, " Stage " + (i + 1) + "");
        }
        for (int j = 0; j < 10; ++j) {
            this.snfm1.add(this.rd, " Stage " + (j + 1) + "");
        }
        for (int k = 0; k < 17; ++k) {
            this.snfm2.add(this.rd, " Stage " + (k + 1) + "");
        }
        for (int l = 0; l < 7; ++l) {
            this.snpls.add(this.rd, "    " + (l + 2) + "");
        }
        for (int m = 0; m < 7; ++m) {
            this.snbts.add(this.rd, "    " + m + "    ");
        }
        for (int n = 0; n < 2; ++n) {
            this.swait.add(this.rd, "" + (n + 2) + " Minutes");
        }
        for (int n2 = 0; n2 < 15; ++n2) {
            this.slaps.add(this.rd, "" + (n2 + 1) + "");
        }
        for (int n3 = 0; n3 < 14; ++n3) {
            this.ilaps.add(this.rd, "" + (n3 + 2) + " Laps");
        }
        this.sclass.add(this.rd, "All Classes");
        this.sclass.add(this.rd, "Class C Cars");
        this.sclass.add(this.rd, "Class B & C Cars");
        this.sclass.add(this.rd, "Class B Cars");
        this.sclass.add(this.rd, "Class A & B Cars");
        this.sclass.add(this.rd, "Class A Cars");
        this.scars.add(this.rd, "All Cars");
        this.scars.add(this.rd, "Custom Cars");
        this.scars.add(this.rd, "Game Cars");
        this.sfix.add(this.rd, "Unlimited Fixing");
        this.sfix.add(this.rd, "4 Fixes");
        this.sfix.add(this.rd, "3 Fixes");
        this.sfix.add(this.rd, "2 Fixes");
        this.sfix.add(this.rd, "1 Fix");
        this.sfix.add(this.rd, "No Fixing");
        this.icars.add(this.rd, "Type of Cars");
        this.icars.add(this.rd, "All Cars");
        this.icars.add(this.rd, "Clan Cars");
        this.icars.add(this.rd, "Game Cars");
        this.icars.w = 140;
        this.gmode.add(this.rd, " Normal Game ");
        this.gmode.add(this.rd, " Practice Game ");
        this.rooms.rooms = true;
        this.rooms.add(this.rd, "Ghostrider :: 1");
        this.sendtyp.add(this.rd, "Write a Message");
        this.sendtyp.add(this.rd, "Share a Custom Car");
        this.sendtyp.add(this.rd, "Share a Custom Stage");
        this.sendtyp.add(this.rd, "Send a Clan Invitation");
        this.sendtyp.add(this.rd, "Share a Relative Date");
        this.senditem.add(this.rd, "Suddenly the King becomes Santa's Little Helper");
        for (int n4 = 0; n4 < 6; ++n4) {
            this.clanlev.add(this.rd, "" + (n4 + 1) + "");
        }
        this.clanlev.add(this.rd, "7 - Admin");
        this.hidefields();
    }
    
    public void hidefields() {
        this.ilaps.hide();
        this.icars.hide();
        this.proitem.hide();
        this.clcars.hide();
        this.clanlev.hide();
        this.mmsg.hide();
        this.datat.hide();
        this.senditem.hide();
        this.sendtyp.hide();
        this.rooms.hide();
        this.mcars.hide();
        this.mstgs.hide();
        this.gmode.hide();
        this.sclass.hide();
        this.scars.hide();
        this.sfix.hide();
        this.mycar.hide();
        this.notp.hide();
        this.keplo.hide();
        this.tnick.hide();
        this.tpass.hide();
        this.temail.hide();
        this.cmsg.hide();
        this.sgame.hide();
        this.wgame.hide();
        this.pgame.hide();
        this.vnpls.hide();
        this.vtyp.hide();
        this.warb.hide();
        this.slaps.hide();
        this.snfm1.hide();
        this.snfmm.hide();
        this.snfm2.hide();
        this.snpls.hide();
        this.snbts.hide();
        this.swait.hide();
    }
    
    public void drawms() {
        this.openm = false;
        if (this.gmode.draw(this.rd, this.xm, this.ym, this.moused, 450, true)) {
            this.openm = true;
        }
        if (this.swait.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.slaps.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.snpls.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.snbts.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.scars.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.sgame.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.snfm1.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.snfm2.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.snfmm.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.mstgs.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.mcars.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.pgame.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.vnpls.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.vtyp.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.warb.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.wgame.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.rooms.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.sendtyp.draw(this.rd, this.xm, this.ym, this.moused, 450, true)) {
            this.openm = true;
        }
        if (this.senditem.draw(this.rd, this.xm, this.ym, this.moused, 450, true)) {
            this.openm = true;
        }
        if (this.datat.draw(this.rd, this.xm, this.ym, this.moused, 450, true)) {
            this.openm = true;
        }
        if (this.clanlev.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.clcars.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.ilaps.draw(this.rd, this.xm, this.ym, this.moused, 450, true)) {
            this.openm = true;
        }
        if (this.icars.draw(this.rd, this.xm, this.ym, this.moused, 450, true)) {
            this.openm = true;
        }
        if (this.proitem.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.sfix.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
        if (this.sclass.draw(this.rd, this.xm, this.ym, this.moused, 450, false)) {
            this.openm = true;
        }
    }
    
    public void movefield(final Component component, int x, int y, final int width, final int height) {
        if (width == 360 || width == 576) {
            x = (int)(x * this.apmult + this.apx + component.getWidth() / 2 * (this.apmult - 1.0f));
            y = (int)(y * this.apmult + this.apy + 12.0f * (this.apmult - 1.0f));
        }
        else {
            x = (int)(x * this.apmult + this.apx);
            y = (int)(y * this.apmult + this.apy + 12.0f * (this.apmult - 1.0f));
        }
        if (component.getX() != x || component.getY() != y) {
            component.setBounds(x, y, width, height);
        }
    }
    
    public void movefieldd(final TextField textField, int n, int n2, final int width, final int height, final boolean b) {
        if (this.applejava) {
            if (b) {
                if ((this.xm > n && this.xm < n + width && this.ym > n2 && this.ym < n2 + height) || !textField.getText().equals("")) {
                    if (!textField.isShowing()) {
                        textField.show();
                        textField.requestFocus();
                    }
                    if (width == 360 || width == 576) {
                        n = (int)(n * this.apmult + this.apx + textField.getWidth() / 2 * (this.apmult - 1.0f));
                        n2 = (int)(n2 * this.apmult + this.apy + 12.0f * (this.apmult - 1.0f));
                    }
                    else {
                        n = (int)(n * this.apmult + this.apx);
                        n2 = (int)(n2 * this.apmult + this.apy + 12.0f * (this.apmult - 1.0f));
                    }
                    if (textField.getX() != n || textField.getY() != n2) {
                        textField.setBounds(n, n2, width, height);
                    }
                }
                else {
                    if (textField.isShowing()) {
                        textField.hide();
                        this.requestFocus();
                    }
                    this.rd.setColor(textField.getBackground());
                    this.rd.fillRect(n, n2, width - 1, height - 1);
                    this.rd.setColor(textField.getBackground().darker());
                    this.rd.drawRect(n, n2, width - 1, height - 1);
                }
            }
        }
        else {
            if (b && !textField.isShowing()) {
                textField.show();
            }
            this.movefield(textField, n, n2, width, height);
        }
    }
    
    public void movefielda(final TextArea textArea, int n, int n2, final int width, final int height) {
        if (this.applejava) {
            if ((this.xm > n && this.xm < n + width && this.ym > n2 && this.ym < n2 + height) || !textArea.getText().equals(" ")) {
                if (!textArea.isShowing()) {
                    textArea.show();
                    textArea.requestFocus();
                }
                if (width == 360 || width == 576) {
                    n = (int)(n * this.apmult + this.apx + textArea.getWidth() / 2 * (this.apmult - 1.0f));
                    n2 = (int)(n2 * this.apmult + this.apy + 12.0f * (this.apmult - 1.0f));
                }
                else {
                    n = (int)(n * this.apmult + this.apx);
                    n2 = (int)(n2 * this.apmult + this.apy + 12.0f * (this.apmult - 1.0f));
                }
                if (textArea.getX() != n || textArea.getY() != n2) {
                    textArea.setBounds(n, n2, width, height);
                }
            }
            else {
                if (textArea.isShowing()) {
                    textArea.hide();
                    this.requestFocus();
                }
                this.rd.setColor(textArea.getBackground());
                this.rd.fillRect(n, n2, width - 1, height - 1);
                this.rd.setColor(textArea.getBackground().darker());
                this.rd.drawRect(n, n2, width - 1, height - 1);
            }
        }
        else {
            if (!textArea.isShowing()) {
                textArea.show();
            }
            this.movefield(textArea, n, n2, width, height);
        }
    }
    
    public void loadstage(final ContO[] array, final ContO[] array2, final Medium medium, final Trackers trackers, final CheckPoints checkPoints, final xtGraphics xtGraphics, final Mad[] array3, final Record record) {
        if (xtGraphics.testdrive == 2 || xtGraphics.testdrive == 4) {
            xtGraphics.nplayers = 1;
        }
        if (xtGraphics.gmode == 1) {
            xtGraphics.nplayers = 5;
            xtGraphics.xstart[4] = 0;
            xtGraphics.zstart[4] = 760;
        }
        trackers.nt = 0;
        this.nob = xtGraphics.nplayers;
        this.notb = 0;
        checkPoints.n = 0;
        checkPoints.nsp = 0;
        checkPoints.fn = 0;
        checkPoints.trackname = "";
        checkPoints.haltall = false;
        checkPoints.wasted = 0;
        checkPoints.catchfin = 0;
        medium.resdown = 0;
        medium.rescnt = 5;
        medium.lightson = false;
        medium.noelec = 0;
        medium.ground = 250;
        medium.trk = 0;
        this.view = 0;
        int getint = 0;
        int getint2 = 100;
        int getint3 = 0;
        int getint4 = 100;
        xtGraphics.newparts = false;
        String string = "";
        try {
            DataInputStream dataInputStream;
            if (xtGraphics.multion == 0 && checkPoints.stage != -2) {
                String str = "stages/" + checkPoints.stage + "";
                if (checkPoints.stage == -1) {
                    str = "mystages/" + checkPoints.name + "";
                }
                dataInputStream = new DataInputStream(new FileInputStream(new File("" + Madness.fpath + "" + str + ".txt")));
            }
            else if (checkPoints.stage > 0) {
                dataInputStream = new DataInputStream(new URL("http://multiplayer.needformadness.com/stages/" + checkPoints.stage + ".txt").openStream());
            }
            else {
                final URL url = new URL(("http://multiplayer.needformadness.com/tracks/" + checkPoints.name + ".radq").replace(' ', '_'));
                final int contentLength = url.openConnection().getContentLength();
                final DataInputStream dataInputStream2 = new DataInputStream(url.openStream());
                final byte[] array4 = new byte[contentLength];
                dataInputStream2.readFully(array4);
                ZipInputStream zipInputStream;
                if (array4[0] == 80 && array4[1] == 75 && array4[2] == 3) {
                    zipInputStream = new ZipInputStream(new ByteArrayInputStream(array4));
                }
                else {
                    final byte[] buf = new byte[contentLength - 40];
                    for (int i = 0; i < contentLength - 40; ++i) {
                        int n = 20;
                        if (i >= 500) {
                            n = 40;
                        }
                        buf[i] = array4[i + n];
                    }
                    zipInputStream = new ZipInputStream(new ByteArrayInputStream(buf));
                }
                int j = Integer.valueOf(zipInputStream.getNextEntry().getName());
                final byte[] array5 = new byte[j];
                int off = 0;
                while (j > 0) {
                    final int read = zipInputStream.read(array5, off, j);
                    off += read;
                    j -= read;
                }
                zipInputStream.close();
                dataInputStream2.close();
                dataInputStream = new DataInputStream(new ByteArrayInputStream(array5));
            }
            String line;
            while ((line = dataInputStream.readLine()) != null) {
                string = "" + line.trim();
                if (string.startsWith("snap")) {
                    medium.setsnap(this.getint("snap", string, 0), this.getint("snap", string, 1), this.getint("snap", string, 2));
                }
                if (string.startsWith("sky")) {
                    medium.setsky(this.getint("sky", string, 0), this.getint("sky", string, 1), this.getint("sky", string, 2));
                    xtGraphics.snap(checkPoints.stage);
                }
                if (string.startsWith("ground")) {
                    medium.setgrnd(this.getint("ground", string, 0), this.getint("ground", string, 1), this.getint("ground", string, 2));
                }
                if (string.startsWith("polys")) {
                    medium.setpolys(this.getint("polys", string, 0), this.getint("polys", string, 1), this.getint("polys", string, 2));
                }
                if (string.startsWith("fog")) {
                    medium.setfade(this.getint("fog", string, 0), this.getint("fog", string, 1), this.getint("fog", string, 2));
                }
                if (string.startsWith("texture")) {
                    medium.setexture(this.getint("texture", string, 0), this.getint("texture", string, 1), this.getint("texture", string, 2), this.getint("texture", string, 3));
                }
                if (string.startsWith("clouds")) {
                    medium.setcloads(this.getint("clouds", string, 0), this.getint("clouds", string, 1), this.getint("clouds", string, 2), this.getint("clouds", string, 3), this.getint("clouds", string, 4));
                }
                if (string.startsWith("density")) {
                    medium.fogd = (this.getint("density", string, 0) + 1) * 2 - 1;
                    if (medium.fogd < 1) {
                        medium.fogd = 1;
                    }
                    if (medium.fogd > 30) {
                        medium.fogd = 30;
                    }
                }
                if (string.startsWith("fadefrom")) {
                    medium.fadfrom(this.getint("fadefrom", string, 0));
                }
                if (string.startsWith("lightson")) {
                    medium.lightson = true;
                }
                if (string.startsWith("mountains")) {
                    medium.mgen = this.getint("mountains", string, 0);
                }
                if (string.startsWith("set")) {
                    int getint5 = this.getint("set", string, 0);
                    if (xtGraphics.nplayers == 8) {
                        if (getint5 == 47) {
                            getint5 = 76;
                        }
                        if (getint5 == 48) {
                            getint5 = 77;
                        }
                    }
                    boolean b = true;
                    if (getint5 >= 65 && getint5 <= 75 && checkPoints.notb) {
                        b = false;
                    }
                    if (b) {
                        if (getint5 == 49 || getint5 == 64 || (getint5 >= 56 && getint5 <= 61)) {
                            xtGraphics.newparts = true;
                        }
                        if ((checkPoints.stage < 0 || checkPoints.stage >= 28) && getint5 >= 10 && getint5 <= 25) {
                            medium.loadnew = true;
                        }
                        getint5 += 46;
                        array[this.nob] = new ContO(array2[getint5], this.getint("set", string, 1), medium.ground - array2[getint5].grat, this.getint("set", string, 2), this.getint("set", string, 3));
                        if (string.indexOf(")p") != -1) {
                            checkPoints.x[checkPoints.n] = this.getint("set", string, 1);
                            checkPoints.z[checkPoints.n] = this.getint("set", string, 2);
                            checkPoints.y[checkPoints.n] = 0;
                            checkPoints.typ[checkPoints.n] = 0;
                            if (string.indexOf(")pt") != -1) {
                                checkPoints.typ[checkPoints.n] = -1;
                            }
                            if (string.indexOf(")pr") != -1) {
                                checkPoints.typ[checkPoints.n] = -2;
                            }
                            if (string.indexOf(")po") != -1) {
                                checkPoints.typ[checkPoints.n] = -3;
                            }
                            if (string.indexOf(")ph") != -1) {
                                checkPoints.typ[checkPoints.n] = -4;
                            }
                            if (string.indexOf("out") != -1) {
                                System.out.println("out: " + checkPoints.n);
                            }
                            ++checkPoints.n;
                            this.notb = this.nob + 1;
                        }
                        ++this.nob;
                        if (medium.loadnew) {
                            medium.loadnew = false;
                        }
                    }
                }
                if (string.startsWith("chk")) {
                    int getint6 = this.getint("chk", string, 0);
                    getint6 += 46;
                    int getint7 = medium.ground - array2[getint6].grat;
                    if (getint6 == 110) {
                        getint7 = this.getint("chk", string, 4);
                    }
                    array[this.nob] = new ContO(array2[getint6], this.getint("chk", string, 1), getint7, this.getint("chk", string, 2), this.getint("chk", string, 3));
                    checkPoints.x[checkPoints.n] = this.getint("chk", string, 1);
                    checkPoints.z[checkPoints.n] = this.getint("chk", string, 2);
                    checkPoints.y[checkPoints.n] = getint7;
                    if (this.getint("chk", string, 3) == 0) {
                        checkPoints.typ[checkPoints.n] = 1;
                    }
                    else {
                        checkPoints.typ[checkPoints.n] = 2;
                    }
                    checkPoints.pcs = checkPoints.n;
                    ++checkPoints.n;
                    array[this.nob].checkpoint = checkPoints.nsp + 1;
                    ++checkPoints.nsp;
                    ++this.nob;
                    this.notb = this.nob;
                }
                if (checkPoints.nfix != 5 && string.startsWith("fix")) {
                    int getint8 = this.getint("fix", string, 0);
                    getint8 += 46;
                    array[this.nob] = new ContO(array2[getint8], this.getint("fix", string, 1), this.getint("fix", string, 3), this.getint("fix", string, 2), this.getint("fix", string, 4));
                    checkPoints.fx[checkPoints.fn] = this.getint("fix", string, 1);
                    checkPoints.fz[checkPoints.fn] = this.getint("fix", string, 2);
                    checkPoints.fy[checkPoints.fn] = this.getint("fix", string, 3);
                    array[this.nob].elec = true;
                    if (this.getint("fix", string, 4) != 0) {
                        checkPoints.roted[checkPoints.fn] = true;
                        array[this.nob].roted = true;
                    }
                    else {
                        checkPoints.roted[checkPoints.fn] = false;
                    }
                    if (string.indexOf(")s") != -1) {
                        checkPoints.special[checkPoints.fn] = true;
                    }
                    else {
                        checkPoints.special[checkPoints.fn] = false;
                    }
                    ++checkPoints.fn;
                    ++this.nob;
                    this.notb = this.nob;
                }
                if (!checkPoints.notb && string.startsWith("pile")) {
                    array[this.nob] = new ContO(this.getint("pile", string, 0), this.getint("pile", string, 1), this.getint("pile", string, 2), medium, trackers, this.getint("pile", string, 3), this.getint("pile", string, 4), medium.ground);
                    ++this.nob;
                }
                if (xtGraphics.multion == 0 && string.startsWith("nlaps")) {
                    checkPoints.nlaps = this.getint("nlaps", string, 0);
                    if (checkPoints.nlaps < 1) {
                        checkPoints.nlaps = 1;
                    }
                    if (checkPoints.nlaps > 15) {
                        checkPoints.nlaps = 15;
                    }
                }
                if (checkPoints.stage > 0 && string.startsWith("name")) {
                    checkPoints.name = this.getstring("name", string, 0).replace('|', ',');
                }
                if (string.startsWith("stagemaker")) {
                    checkPoints.maker = this.getstring("stagemaker", string, 0);
                }
                if (string.startsWith("publish")) {
                    checkPoints.pubt = this.getint("publish", string, 0);
                }
                if (string.startsWith("soundtrack")) {
                    checkPoints.trackname = this.getstring("soundtrack", string, 0);
                    checkPoints.trackvol = this.getint("soundtrack", string, 1);
                    if (checkPoints.trackvol < 50) {
                        checkPoints.trackvol = 50;
                    }
                    if (checkPoints.trackvol > 300) {
                        checkPoints.trackvol = 300;
                    }
                    xtGraphics.sndsize[32] = this.getint("soundtrack", string, 2);
                }
                if (string.startsWith("maxr")) {
                    final int getint9 = this.getint("maxr", string, 0);
                    final int n2 = getint = this.getint("maxr", string, 1);
                    final int getint10 = this.getint("maxr", string, 2);
                    for (int k = 0; k < getint9; ++k) {
                        array[this.nob] = new ContO(array2[85], n2, medium.ground - array2[85].grat, k * 4800 + getint10, 0);
                        ++this.nob;
                    }
                    trackers.y[trackers.nt] = -5000;
                    trackers.rady[trackers.nt] = 7100;
                    trackers.x[trackers.nt] = n2 + 500;
                    trackers.radx[trackers.nt] = 600;
                    trackers.z[trackers.nt] = getint9 * 4800 / 2 + getint10 - 2400;
                    trackers.radz[trackers.nt] = getint9 * 4800 / 2;
                    trackers.xy[trackers.nt] = 90;
                    trackers.zy[trackers.nt] = 0;
                    trackers.dam[trackers.nt] = 167;
                    trackers.decor[trackers.nt] = false;
                    trackers.skd[trackers.nt] = 0;
                    ++trackers.nt;
                }
                if (string.startsWith("maxl")) {
                    final int getint11 = this.getint("maxl", string, 0);
                    final int n3 = getint2 = this.getint("maxl", string, 1);
                    final int getint12 = this.getint("maxl", string, 2);
                    for (int l = 0; l < getint11; ++l) {
                        array[this.nob] = new ContO(array2[85], n3, medium.ground - array2[85].grat, l * 4800 + getint12, 180);
                        ++this.nob;
                    }
                    trackers.y[trackers.nt] = -5000;
                    trackers.rady[trackers.nt] = 7100;
                    trackers.x[trackers.nt] = n3 - 500;
                    trackers.radx[trackers.nt] = 600;
                    trackers.z[trackers.nt] = getint11 * 4800 / 2 + getint12 - 2400;
                    trackers.radz[trackers.nt] = getint11 * 4800 / 2;
                    trackers.xy[trackers.nt] = -90;
                    trackers.zy[trackers.nt] = 0;
                    trackers.dam[trackers.nt] = 167;
                    trackers.decor[trackers.nt] = false;
                    trackers.skd[trackers.nt] = 0;
                    ++trackers.nt;
                }
                if (string.startsWith("maxt")) {
                    final int getint13 = this.getint("maxt", string, 0);
                    final int n4 = getint3 = this.getint("maxt", string, 1);
                    final int getint14 = this.getint("maxt", string, 2);
                    for (int n5 = 0; n5 < getint13; ++n5) {
                        array[this.nob] = new ContO(array2[85], n5 * 4800 + getint14, medium.ground - array2[85].grat, n4, 90);
                        ++this.nob;
                    }
                    trackers.y[trackers.nt] = -5000;
                    trackers.rady[trackers.nt] = 7100;
                    trackers.z[trackers.nt] = n4 + 500;
                    trackers.radz[trackers.nt] = 600;
                    trackers.x[trackers.nt] = getint13 * 4800 / 2 + getint14 - 2400;
                    trackers.radx[trackers.nt] = getint13 * 4800 / 2;
                    trackers.zy[trackers.nt] = 90;
                    trackers.xy[trackers.nt] = 0;
                    trackers.dam[trackers.nt] = 167;
                    trackers.decor[trackers.nt] = false;
                    trackers.skd[trackers.nt] = 0;
                    ++trackers.nt;
                }
                if (string.startsWith("maxb")) {
                    final int getint15 = this.getint("maxb", string, 0);
                    final int n6 = getint4 = this.getint("maxb", string, 1);
                    final int getint16 = this.getint("maxb", string, 2);
                    for (int n7 = 0; n7 < getint15; ++n7) {
                        array[this.nob] = new ContO(array2[85], n7 * 4800 + getint16, medium.ground - array2[85].grat, n6, -90);
                        ++this.nob;
                    }
                    trackers.y[trackers.nt] = -5000;
                    trackers.rady[trackers.nt] = 7100;
                    trackers.z[trackers.nt] = n6 - 500;
                    trackers.radz[trackers.nt] = 600;
                    trackers.x[trackers.nt] = getint15 * 4800 / 2 + getint16 - 2400;
                    trackers.radx[trackers.nt] = getint15 * 4800 / 2;
                    trackers.zy[trackers.nt] = -90;
                    trackers.xy[trackers.nt] = 0;
                    trackers.dam[trackers.nt] = 167;
                    trackers.decor[trackers.nt] = false;
                    trackers.skd[trackers.nt] = 0;
                    ++trackers.nt;
                }
            }
            dataInputStream.close();
            medium.newpolys(getint2, getint - getint2, getint4, getint3 - getint4, trackers, this.notb);
            medium.newclouds(getint2, getint, getint4, getint3);
            medium.newmountains(getint2, getint, getint4, getint3);
            medium.newstars();
            trackers.devidetrackers(getint2, getint - getint2, getint4, getint3 - getint4);
        }
        catch (final Exception obj) {
            checkPoints.stage = -3;
            System.out.println("Error in stage " + checkPoints.stage);
            System.out.println("" + obj);
            System.out.println("At line: " + string);
        }
        if (checkPoints.nsp < 2) {
            checkPoints.stage = -3;
        }
        if (medium.nrw * medium.ncl >= 16000) {
            checkPoints.stage = -3;
        }
        if (checkPoints.stage != -3) {
            checkPoints.top20 = Math.abs(checkPoints.top20);
            if (checkPoints.stage == 26) {
                medium.lightn = 0;
            }
            else {
                medium.lightn = -1;
            }
            if (checkPoints.stage == 1 || checkPoints.stage == 11) {
                medium.nochekflk = false;
            }
            else {
                medium.nochekflk = true;
            }
            for (int n8 = 0; n8 < xtGraphics.nplayers; ++n8) {
                this.u[n8].reset(checkPoints, xtGraphics.sc[n8]);
            }
            xtGraphics.resetstat(checkPoints.stage);
            checkPoints.calprox();
            for (int n9 = 0; n9 < xtGraphics.nplayers; ++n9) {
                if (xtGraphics.fase == 22) {
                    xtGraphics.colorCar(array2[xtGraphics.sc[n9]], n9);
                }
                array[n9] = new ContO(array2[xtGraphics.sc[n9]], xtGraphics.xstart[n9], 250 - array2[xtGraphics.sc[n9]].grat, xtGraphics.zstart[n9], 0);
                array3[n9].reseto(xtGraphics.sc[n9], array[n9], checkPoints);
            }
            if (xtGraphics.fase == 2 || xtGraphics.fase == -22) {
                medium.trx = (getint2 + getint) / 2;
                medium.trz = (getint3 + getint4) / 2;
                medium.ptr = 0;
                medium.ptcnt = -10;
                medium.hit = 45000;
                medium.fallen = 0;
                medium.nrnd = 0;
                medium.trk = 1;
                medium.ih = 25;
                medium.iw = 65;
                medium.h = 425;
                medium.w = 735;
                xtGraphics.fase = 1;
                this.mouses = 0;
            }
            if (xtGraphics.fase == 22) {
                medium.crs = false;
                xtGraphics.fase = 5;
            }
            if (checkPoints.stage > 0) {
                int stage = checkPoints.stage;
                if (stage > 27) {
                    stage -= 27;
                }
                else if (stage > 10) {
                    stage -= 10;
                }
                xtGraphics.asay = "Stage " + stage + ":  " + checkPoints.name + " ";
            }
            else {
                xtGraphics.asay = "Custom Stage:  " + checkPoints.name + " ";
            }
            record.reset(array);
        }
        else if (xtGraphics.fase == 2) {
            xtGraphics.fase = 1;
        }
        System.gc();
    }
    
    public boolean loadstagePreview(final int stage, final String name, final ContO[] array, final ContO[] array2, final Medium medium, final CheckPoints checkPoints) {
        boolean b = true;
        if (stage < 100) {
            checkPoints.stage = stage;
            if (checkPoints.stage < 0) {
                checkPoints.name = name;
            }
        }
        else {
            checkPoints.stage = -2;
            if (this.sgame.getSelectedIndex() == 3 || this.sgame.getSelectedIndex() == 4) {
                checkPoints.name = this.mstgs.getSelectedItem();
            }
            else {
                final int beginIndex = this.mstgs.getSelectedItem().indexOf(" ") + 1;
                if (beginIndex > 0) {
                    checkPoints.name = this.mstgs.getSelectedItem().substring(beginIndex);
                }
            }
        }
        this.nob = 0;
        checkPoints.n = 0;
        checkPoints.nsp = 0;
        checkPoints.fn = 0;
        checkPoints.haltall = false;
        checkPoints.wasted = 0;
        checkPoints.catchfin = 0;
        medium.ground = 250;
        this.view = 0;
        medium.trx = 0L;
        medium.trz = 0L;
        int getint = 0;
        int getint2 = 100;
        int getint3 = 0;
        int getint4 = 100;
        String string = "";
        try {
            DataInputStream dataInputStream;
            if (checkPoints.stage > 0) {
                dataInputStream = new DataInputStream(new URL("http://multiplayer.needformadness.com/stages/" + checkPoints.stage + ".txt").openStream());
            }
            else {
                final URL url = new URL(("http://multiplayer.needformadness.com/tracks/" + checkPoints.name + ".radq").replace(' ', '_'));
                final int contentLength = url.openConnection().getContentLength();
                final DataInputStream dataInputStream2 = new DataInputStream(url.openStream());
                final byte[] array3 = new byte[contentLength];
                dataInputStream2.readFully(array3);
                ZipInputStream zipInputStream;
                if (array3[0] == 80 && array3[1] == 75 && array3[2] == 3) {
                    zipInputStream = new ZipInputStream(new ByteArrayInputStream(array3));
                }
                else {
                    final byte[] buf = new byte[contentLength - 40];
                    for (int i = 0; i < contentLength - 40; ++i) {
                        int n = 20;
                        if (i >= 500) {
                            n = 40;
                        }
                        buf[i] = array3[i + n];
                    }
                    zipInputStream = new ZipInputStream(new ByteArrayInputStream(buf));
                }
                int j = Integer.valueOf(zipInputStream.getNextEntry().getName());
                final byte[] array4 = new byte[j];
                int off = 0;
                while (j > 0) {
                    final int read = zipInputStream.read(array4, off, j);
                    off += read;
                    j -= read;
                }
                zipInputStream.close();
                dataInputStream2.close();
                dataInputStream = new DataInputStream(new ByteArrayInputStream(array4));
            }
            String line;
            while ((line = dataInputStream.readLine()) != null) {
                string = "" + line.trim();
                if (string.startsWith("snap")) {
                    medium.setsnap(this.getint("snap", string, 0), this.getint("snap", string, 1), this.getint("snap", string, 2));
                }
                if (string.startsWith("sky")) {
                    medium.setsky(this.getint("sky", string, 0), this.getint("sky", string, 1), this.getint("sky", string, 2));
                }
                if (string.startsWith("ground")) {
                    medium.setgrnd(this.getint("ground", string, 0), this.getint("ground", string, 1), this.getint("ground", string, 2));
                }
                if (string.startsWith("polys")) {
                    medium.setpolys(this.getint("polys", string, 0), this.getint("polys", string, 1), this.getint("polys", string, 2));
                }
                if (string.startsWith("fog")) {
                    medium.setfade(this.getint("fog", string, 0), this.getint("fog", string, 1), this.getint("fog", string, 2));
                }
                if (string.startsWith("texture")) {
                    medium.setexture(this.getint("texture", string, 0), this.getint("texture", string, 1), this.getint("texture", string, 2), this.getint("texture", string, 3));
                }
                if (string.startsWith("clouds")) {
                    medium.setcloads(this.getint("clouds", string, 0), this.getint("clouds", string, 1), this.getint("clouds", string, 2), this.getint("clouds", string, 3), this.getint("clouds", string, 4));
                }
                if (string.startsWith("density")) {
                    medium.fogd = (this.getint("density", string, 0) + 1) * 2 - 1;
                    if (medium.fogd < 1) {
                        medium.fogd = 1;
                    }
                    if (medium.fogd > 30) {
                        medium.fogd = 30;
                    }
                }
                if (string.startsWith("fadefrom")) {
                    medium.fadfrom(this.getint("fadefrom", string, 0));
                }
                if (string.startsWith("lightson")) {
                    medium.lightson = true;
                }
                if (string.startsWith("mountains")) {
                    medium.mgen = this.getint("mountains", string, 0);
                }
                if (string.startsWith("soundtrack")) {
                    checkPoints.trackname = this.getstring("soundtrack", string, 0);
                    checkPoints.trackvol = this.getint("soundtrack", string, 1);
                    if (checkPoints.trackvol < 50) {
                        checkPoints.trackvol = 50;
                    }
                    if (checkPoints.trackvol > 300) {
                        checkPoints.trackvol = 300;
                    }
                }
                if (string.startsWith("set")) {
                    int getint5 = this.getint("set", string, 0);
                    getint5 += 46;
                    array[this.nob] = new ContO(array2[getint5], this.getint("set", string, 1), medium.ground - array2[getint5].grat, this.getint("set", string, 2), this.getint("set", string, 3));
                    array[this.nob].t.nt = 0;
                    if (string.indexOf(")p") != -1) {
                        checkPoints.x[checkPoints.n] = this.getint("chk", string, 1);
                        checkPoints.z[checkPoints.n] = this.getint("chk", string, 2);
                        checkPoints.y[checkPoints.n] = 0;
                        checkPoints.typ[checkPoints.n] = 0;
                        if (string.indexOf(")pt") != -1) {
                            checkPoints.typ[checkPoints.n] = -1;
                        }
                        if (string.indexOf(")pr") != -1) {
                            checkPoints.typ[checkPoints.n] = -2;
                        }
                        if (string.indexOf(")po") != -1) {
                            checkPoints.typ[checkPoints.n] = -3;
                        }
                        if (string.indexOf(")ph") != -1) {
                            checkPoints.typ[checkPoints.n] = -4;
                        }
                        if (string.indexOf("out") != -1) {
                            System.out.println("out: " + checkPoints.n);
                        }
                        ++checkPoints.n;
                    }
                    ++this.nob;
                }
                if (string.startsWith("chk")) {
                    int getint6 = this.getint("chk", string, 0);
                    getint6 += 46;
                    int getint7 = medium.ground - array2[getint6].grat;
                    if (getint6 == 110) {
                        getint7 = this.getint("chk", string, 4);
                    }
                    array[this.nob] = new ContO(array2[getint6], this.getint("chk", string, 1), getint7, this.getint("chk", string, 2), this.getint("chk", string, 3));
                    checkPoints.x[checkPoints.n] = this.getint("chk", string, 1);
                    checkPoints.z[checkPoints.n] = this.getint("chk", string, 2);
                    checkPoints.y[checkPoints.n] = getint7;
                    if (this.getint("chk", string, 3) == 0) {
                        checkPoints.typ[checkPoints.n] = 1;
                    }
                    else {
                        checkPoints.typ[checkPoints.n] = 2;
                    }
                    checkPoints.pcs = checkPoints.n;
                    ++checkPoints.n;
                    array[this.nob].checkpoint = checkPoints.nsp + 1;
                    ++checkPoints.nsp;
                    ++this.nob;
                }
                if (string.startsWith("fix")) {
                    int getint8 = this.getint("fix", string, 0);
                    getint8 += 46;
                    array[this.nob] = new ContO(array2[getint8], this.getint("fix", string, 1), this.getint("fix", string, 3), this.getint("fix", string, 2), this.getint("fix", string, 4));
                    checkPoints.fx[checkPoints.fn] = this.getint("fix", string, 1);
                    checkPoints.fz[checkPoints.fn] = this.getint("fix", string, 2);
                    checkPoints.fy[checkPoints.fn] = this.getint("fix", string, 3);
                    array[this.nob].elec = true;
                    if (this.getint("fix", string, 4) != 0) {
                        checkPoints.roted[checkPoints.fn] = true;
                        array[this.nob].roted = true;
                    }
                    else {
                        checkPoints.roted[checkPoints.fn] = false;
                    }
                    if (string.indexOf(")s") != -1) {
                        checkPoints.special[checkPoints.fn] = true;
                    }
                    else {
                        checkPoints.special[checkPoints.fn] = false;
                    }
                    ++checkPoints.fn;
                    ++this.nob;
                }
                if (string.startsWith("nlaps")) {
                    checkPoints.nlaps = this.getint("nlaps", string, 0);
                    if (checkPoints.nlaps < 1) {
                        checkPoints.nlaps = 1;
                    }
                    if (checkPoints.nlaps > 15) {
                        checkPoints.nlaps = 15;
                    }
                }
                if (checkPoints.stage > 0 && string.startsWith("name")) {
                    checkPoints.name = this.getstring("name", string, 0).replace('|', ',');
                }
                if (string.startsWith("stagemaker")) {
                    checkPoints.maker = this.getstring("stagemaker", string, 0);
                }
                if (string.startsWith("publish")) {
                    checkPoints.pubt = this.getint("publish", string, 0);
                }
                if (string.startsWith("maxr")) {
                    getint = this.getint("maxr", string, 1);
                }
                if (string.startsWith("maxl")) {
                    getint2 = this.getint("maxl", string, 1);
                }
                if (string.startsWith("maxt")) {
                    getint3 = this.getint("maxt", string, 1);
                }
                if (string.startsWith("maxb")) {
                    getint4 = this.getint("maxb", string, 1);
                }
            }
            dataInputStream.close();
            medium.newpolys(getint2, getint - getint2, getint4, getint3 - getint4, null, this.notb);
            medium.newclouds(getint2, getint, getint4, getint3);
            medium.newmountains(getint2, getint, getint4, getint3);
            medium.newstars();
        }
        catch (final Exception obj) {
            b = false;
            System.out.println("Error in stage " + checkPoints.stage);
            System.out.println("" + obj);
            System.out.println("At line: " + string);
        }
        if (checkPoints.nsp < 2) {
            b = false;
        }
        if (medium.nrw * medium.ncl >= 16000) {
            b = false;
        }
        medium.trx = (getint2 + getint) / 2;
        medium.trz = (getint3 + getint4) / 2;
        System.gc();
        return b;
    }
    
    public void loadbase(final ContO[] array, final Medium medium, final Trackers trackers, final xtGraphics xtGraphics, final boolean b) {
        final String[] array2 = { "2000tornados", "formula7", "canyenaro", "lescrab", "nimi", "maxrevenge", "leadoxide", "koolkat", "drifter", "policecops", "mustang", "king", "audir8", "masheen", "radicalone", "drmonster" };
        final String[] array3 = { "road", "froad", "twister2", "twister1", "turn", "offroad", "bumproad", "offturn", "nroad", "nturn", "roblend", "noblend", "rnblend", "roadend", "offroadend", "hpground", "ramp30", "cramp35", "dramp15", "dhilo15", "slide10", "takeoff", "sramp22", "offbump", "offramp", "sofframp", "halfpipe", "spikes", "rail", "thewall", "checkpoint", "fixpoint", "offcheckpoint", "sideoff", "bsideoff", "uprise", "riseroad", "sroad", "soffroad", "tside", "launchpad", "thenet", "speedramp", "offhill", "slider", "uphill", "roll1", "roll2", "roll3", "roll4", "roll5", "roll6", "opile1", "opile2", "aircheckpoint", "tree1", "tree2", "tree3", "tree4", "tree5", "tree6", "tree7", "tree8", "cac1", "cac2", "cac3", "8sroad", "8soffroad" };
        int n = 0;
        xtGraphics.dnload += 6;
        try {
            ZipInputStream zipInputStream;
            if (!b) {
                zipInputStream = new ZipInputStream(new FileInputStream(new File("" + Madness.fpath + "data/models.zip")));
            }
            else {
                zipInputStream = new ZipInputStream(new URL("http://multiplayer.needformadness.com/data/models.zip").openStream());
            }
            for (ZipEntry zipEntry = zipInputStream.getNextEntry(); zipEntry != null; zipEntry = zipInputStream.getNextEntry()) {
                int n2 = 0;
                for (int i = 0; i < 16; ++i) {
                    if (zipEntry.getName().startsWith(array2[i])) {
                        n2 = i;
                    }
                }
                for (int j = 0; j < 68; ++j) {
                    if (zipEntry.getName().startsWith(array3[j])) {
                        n2 = j + 56;
                    }
                }
                int k = (int)zipEntry.getSize();
                n += k;
                final byte[] b2 = new byte[k];
                int off = 0;
                while (k > 0) {
                    final int read = zipInputStream.read(b2, off, k);
                    off += read;
                    k -= read;
                }
                array[n2] = new ContO(b2, medium, trackers);
                ++xtGraphics.dnload;
            }
            zipInputStream.close();
        }
        catch (final Exception obj) {
            System.out.println("Error Reading Models: " + obj);
        }
        System.gc();
        if (this.mload != -1 && n != 615671) {
            this.mload = 2;
        }
    }
    
    public int getint(final String s, final String s2, final int n) {
        int n2 = 0;
        String string = "";
        for (int i = s.length() + 1; i < s2.length(); ++i) {
            final String string2 = "" + s2.charAt(i);
            if (string2.equals(",") || string2.equals(")")) {
                ++n2;
                ++i;
            }
            if (n2 == n) {
                string += s2.charAt(i);
            }
        }
        return Integer.valueOf(string);
    }
    
    public String getstring(final String s, final String s2, final int n) {
        int n2 = 0;
        String string = "";
        for (int i = s.length() + 1; i < s2.length(); ++i) {
            final String string2 = "" + s2.charAt(i);
            if (string2.equals(",") || string2.equals(")")) {
                ++n2;
                ++i;
            }
            if (n2 == n) {
                string += s2.charAt(i);
            }
        }
        return string;
    }
    
    @Override
    public void start() {
        if (this.gamer == null) {
            this.gamer = new Thread(this);
        }
        this.gamer.start();
    }
    
    @Override
    public void stop() {
        if (this.exwist && this.gamer != null) {
            System.gc();
            this.gamer.stop();
            this.gamer = null;
        }
        this.exwist = true;
    }
    
    public void setcarcookie(final int i, final String str, final float[] array, final int n, final int[] array2, final boolean b) {
        try {
            final File file = new File("" + Madness.fpath + "data/user.data");
            final String[] array3 = { "", "", "", "", "" };
            if (file.exists()) {
                final BufferedReader bufferedReader = new BufferedReader(new FileReader(file));
                String line;
                for (int n2 = 0; (line = bufferedReader.readLine()) != null && n2 < 5; ++n2) {
                    array3[n2] = line;
                }
                bufferedReader.close();
            }
            if (n == 0) {
                array3[1] = "lastcar(" + i + "," + (int)(array[0] * 100.0f) + "," + (int)(array[1] * 100.0f) + "," + (int)(array[2] * 100.0f) + "," + (int)(array[3] * 100.0f) + "," + (int)(array[4] * 100.0f) + "," + (int)(array[5] * 100.0f) + "," + str + ")";
            }
            if (n == 1) {
                array3[2] = "NFM1(" + i + "," + array2[0] + ")";
            }
            if (n == 2) {
                array3[3] = "NFM2(" + i + "," + array2[1] + ")";
            }
            array3[4] = "graphics(" + this.moto + "," + Madness.anti + ")";
            final BufferedWriter bufferedWriter = new BufferedWriter(new FileWriter(file));
            for (int j = 0; j < 5; ++j) {
                bufferedWriter.write(array3[j]);
                bufferedWriter.newLine();
            }
            bufferedWriter.close();
        }
        catch (final Exception ex) {}
    }
    
    public void setloggedcookie() {
        try {
            final File file = new File("" + Madness.fpath + "data/user.data");
            final String[] array = { "", "", "", "", "" };
            if (file.exists()) {
                final BufferedReader bufferedReader = new BufferedReader(new FileReader(file));
                String line;
                for (int n = 0; (line = bufferedReader.readLine()) != null && n < 5; ++n) {
                    array[n] = line;
                }
                bufferedReader.close();
            }
            if (this.keplo.getState()) {
                array[0] = "lastuser(" + this.tnick.getText() + "," + this.tpass.getText() + ")";
            }
            else {
                array[0] = "lastuser(" + this.tnick.getText() + ")";
            }
            final BufferedWriter bufferedWriter = new BufferedWriter(new FileWriter(file));
            for (int i = 0; i < 5; ++i) {
                bufferedWriter.write(array[i]);
                bufferedWriter.newLine();
            }
            bufferedWriter.close();
        }
        catch (final Exception ex) {}
    }
    
    public void readcookies(final xtGraphics xtGraphics, final CarDefine carDefine, final ContO[] array) {
        xtGraphics.nickname = "";
        try {
            final File file = new File("" + Madness.fpath + "data/user.data");
            final String[] array2 = { "", "", "", "", "" };
            if (file.exists()) {
                final BufferedReader bufferedReader = new BufferedReader(new FileReader(file));
                String line;
                for (int n = 0; (line = bufferedReader.readLine()) != null && n < 5; ++n) {
                    array2[n] = line;
                }
                bufferedReader.close();
            }
            if (array2[0].startsWith("lastuser")) {
                xtGraphics.nickname = this.getstring("lastuser", array2[0], 0);
                if (!xtGraphics.nickname.equals("")) {
                    xtGraphics.opselect = 1;
                }
                String getstring;
                try {
                    getstring = this.getstring("lastuser", array2[0], 1);
                }
                catch (final Exception ex) {
                    getstring = "";
                }
                if (!getstring.equals("")) {
                    this.tnick.setText(xtGraphics.nickname);
                    this.tpass.setText(getstring);
                    xtGraphics.autolog = true;
                }
            }
            if (array2[2].startsWith("NFM1")) {
                final int getint = this.getint("NFM1", array2[2], 0);
                if (getint >= 0 && getint < 16) {
                    xtGraphics.scm[0] = getint;
                    xtGraphics.firstime = false;
                }
                final int getint2 = this.getint("NFM1", array2[2], 1);
                if (getint2 >= 1 && getint2 <= 11) {
                    xtGraphics.unlocked[0] = getint2;
                }
            }
            if (array2[3].startsWith("NFM2")) {
                final int getint3 = this.getint("NFM2", array2[3], 0);
                if (getint3 >= 0 && getint3 < 16) {
                    xtGraphics.scm[1] = getint3;
                    xtGraphics.firstime = false;
                }
                final int getint4 = this.getint("NFM2", array2[3], 1);
                if (getint4 >= 1 && getint4 <= 17) {
                    xtGraphics.unlocked[1] = getint4;
                }
            }
            if (array2[4].startsWith("graphics")) {
                final int getint5 = this.getint("graphics", array2[4], 0);
                if (getint5 >= 0 && getint5 <= 1) {
                    this.moto = getint5;
                }
                final int getint6 = this.getint("graphics", array2[4], 1);
                if (getint6 >= 0 && getint6 <= 1) {
                    Madness.anti = getint6;
                }
            }
            if (array2[1].startsWith("lastcar")) {
                final int getint7 = this.getint("lastcar", array2[1], 0);
                carDefine.lastcar = this.getstring("lastcar", array2[1], 7);
                if (getint7 >= 0 && getint7 < 36) {
                    xtGraphics.osc = getint7;
                    xtGraphics.firstime = false;
                }
                int n2 = 0;
                for (int i = 0; i < 6; ++i) {
                    final int getint8 = this.getint("lastcar", array2[1], i + 1);
                    if (getint8 >= 0 && getint8 <= 100) {
                        xtGraphics.arnp[i] = getint8 / 100.0f;
                        ++n2;
                    }
                }
                if (n2 == 6 && xtGraphics.osc >= 0 && xtGraphics.osc <= 15) {
                    final Color hsbColor = Color.getHSBColor(xtGraphics.arnp[0], xtGraphics.arnp[1], 1.0f - xtGraphics.arnp[2]);
                    final Color hsbColor2 = Color.getHSBColor(xtGraphics.arnp[3], xtGraphics.arnp[4], 1.0f - xtGraphics.arnp[5]);
                    for (int j = 0; j < array[xtGraphics.osc].npl; ++j) {
                        if (array[xtGraphics.osc].p[j].colnum == 1) {
                            array[xtGraphics.osc].p[j].c[0] = hsbColor.getRed();
                            array[xtGraphics.osc].p[j].c[1] = hsbColor.getGreen();
                            array[xtGraphics.osc].p[j].c[2] = hsbColor.getBlue();
                        }
                    }
                    for (int k = 0; k < array[xtGraphics.osc].npl; ++k) {
                        if (array[xtGraphics.osc].p[k].colnum == 2) {
                            array[xtGraphics.osc].p[k].c[0] = hsbColor2.getRed();
                            array[xtGraphics.osc].p[k].c[1] = hsbColor2.getGreen();
                            array[xtGraphics.osc].p[k].c[2] = hsbColor2.getBlue();
                        }
                    }
                }
            }
        }
        catch (final Exception ex2) {}
    }
    
    public void regprom() {
    }
    
    @Override
    public boolean mouseUp(final Event event, final int n, final int n2) {
        if (!this.exwist) {
            if (this.mouses == 11) {
                this.xm = (int)((n - this.apx) / this.apmult);
                this.ym = (int)((n2 - this.apy) / this.apmult);
                this.mouses = -1;
            }
            this.moused = false;
        }
        if (!Madness.fullscreen) {
            if (n > this.getWidth() / 2 - 55 && n < this.getWidth() / 2 + 7 && n2 > 21 && n2 < 38 && !this.onbar) {
                if (this.smooth == 1) {
                    this.smooth = 0;
                }
                else {
                    this.smooth = 1;
                }
                this.showsize = 60;
            }
            if (n > this.getWidth() / 2 + 133 && n < this.getWidth() / 2 + 231 && n2 > 7 && n2 < 24 && !this.onbar) {
                if (Madness.anti == 0) {
                    Madness.anti = 1;
                }
                else {
                    Madness.anti = 0;
                }
                this.showsize = 60;
            }
            if (n > this.getWidth() / 2 + 133 && n < this.getWidth() / 2 + 231 && n2 > 24 && n2 < 41 && !this.onbar) {
                if (this.moto == 0) {
                    this.moto = 1;
                }
                else {
                    this.moto = 0;
                }
                this.showsize = 60;
            }
            if (this.oncarm) {
                Madness.carmaker();
            }
            if (this.onstgm) {
                Madness.stagemaker();
            }
            if (this.onfulls) {
                Madness.gofullscreen();
            }
            this.onbar = false;
        }
        return false;
    }
    
    @Override
    public boolean mouseDown(final Event event, final int n, final int n2) {
        this.requestFocus();
        if (!this.exwist) {
            if (this.mouses == 0) {
                this.xm = (int)((n - this.apx) / this.apmult);
                this.ym = (int)((n2 - this.apy) / this.apmult);
                this.mouses = 1;
            }
            this.moused = true;
        }
        if (!Madness.fullscreen) {
            this.sizescreen(n, n2);
        }
        return false;
    }
    
    @Override
    public boolean mouseMove(final Event event, final int n, final int n2) {
        if (!this.exwist && !this.lostfcs) {
            this.xm = (int)((n - this.apx) / this.apmult);
            this.ym = (int)((n2 - this.apy) / this.apmult);
        }
        if (!Madness.fullscreen) {
            if (this.showsize < 20) {
                this.showsize = 20;
            }
            if (n > 50 && n < 192 && n2 > 14 && n2 < 37) {
                if (!this.oncarm) {
                    this.oncarm = true;
                    this.setCursor(new Cursor(12));
                }
            }
            else if (this.oncarm) {
                this.oncarm = false;
                this.setCursor(new Cursor(0));
            }
            if (n > this.getWidth() - 208 && n < this.getWidth() - 50 && n2 > 14 && n2 < 37) {
                if (!this.onstgm) {
                    this.onstgm = true;
                    this.setCursor(new Cursor(12));
                }
            }
            else if (this.onstgm) {
                this.onstgm = false;
                this.setCursor(new Cursor(0));
            }
            if (n > this.getWidth() / 2 + 22 && n < this.getWidth() / 2 + 122 && n2 > 14 && n2 < 37) {
                if (!this.onfulls) {
                    this.onfulls = true;
                    this.setCursor(new Cursor(12));
                }
            }
            else if (this.onfulls) {
                this.onfulls = false;
                this.setCursor(new Cursor(0));
            }
        }
        return false;
    }
    
    @Override
    public boolean mouseDrag(final Event event, final int n, final int n2) {
        if (!this.exwist && !this.lostfcs) {
            this.xm = (int)((n - this.apx) / this.apmult);
            this.ym = (int)((n2 - this.apy) / this.apmult);
        }
        if (!Madness.fullscreen) {
            this.sizescreen(n, n2);
        }
        return false;
    }
    
    @Override
    public boolean lostFocus(final Event event, final Object o) {
        if (!this.exwist && !this.lostfcs) {
            this.lostfcs = true;
            this.fcscnt = 10;
            if (this.u[0] != null) {
                if (this.u[0].multion == 0) {
                    this.u[0].falseo(1);
                }
                else if (this.u[0].chatup == 0) {
                    this.requestFocus();
                }
                this.setCursor(new Cursor(0));
            }
        }
        return false;
    }
    
    @Override
    public boolean gotFocus(final Event event, final Object o) {
        if (!this.exwist && this.lostfcs) {
            this.lostfcs = false;
        }
        return false;
    }
    
    public void mouseW(final int n) {
        if (!this.exwist) {
            this.mousew += n * 4;
        }
    }
    
    public void sizescreen(final int n, final int n2) {
        if ((n > this.getWidth() / 2 - 230 && n < this.getWidth() / 2 - 68 && n2 > 21 && n2 < 39) || this.onbar) {
            this.reqmult = (n - (this.getWidth() / 2 - 222)) / 141.0f;
            if (this.reqmult < 0.1) {
                this.reqmult = 0.0f;
            }
            if (this.reqmult > 1.0f) {
                this.reqmult = 1.0f;
            }
            this.onbar = true;
            this.showsize = 100;
        }
    }
    
    public void catchlink() {
        if (!this.lostfcs) {
            if ((this.xm > 65 && this.xm < 735 && this.ym > 135 && this.ym < 194) || (this.xm > 275 && this.xm < 525 && this.ym > 265 && this.ym < 284)) {
                this.setCursor(new Cursor(12));
                if (this.mouses == 2) {
                    this.openurl("http://www.radicalplay.com/");
                }
            }
            else {
                this.setCursor(new Cursor(0));
            }
        }
    }
    
    public void musiclink() {
        this.openurl("http://multiplayer.needformadness.com/music.html");
    }
    
    public void reglink() {
        this.openurl("http://multiplayer.needformadness.com/register.html?ref=game");
    }
    
    public void madlink() {
        this.openurl("http://www.needformadness.com/");
    }
    
    public void editlink(final String str, final boolean b) {
        String str2 = "";
        if (b) {
            str2 = "?display=upgrade";
        }
        this.openurl("http://multiplayer.needformadness.com/edit.pl" + str2 + "#" + str + "");
    }
    
    public void regnew() {
        this.openurl("http://multiplayer.needformadness.com/registernew.pl");
    }
    
    public void multlink() {
        this.openurl("http://multiplayer.needformadness.com/");
    }
    
    public void setupini() {
        Madness.inisetup = true;
        try {
            final File file = new File("" + Madness.fpath + "Madness.ini");
            if (file.exists()) {
                final String[] array = new String[40];
                int n;
                BufferedReader bufferedReader;
                String line;
                for (n = 0, bufferedReader = new BufferedReader(new FileReader(file)); (line = bufferedReader.readLine()) != null && n < 40; ++n) {
                    array[n] = line;
                    if (array[n].startsWith("Class Path")) {
                        if (array[n].indexOf("madapps.jar") != -1) {
                            array[n] = "Class Path=\\data\\madapps.jar;";
                        }
                        else {
                            array[n] = "Class Path=\\data\\madapp.jar;";
                        }
                    }
                    if (array[n].startsWith("JRE Path")) {
                        array[n] = "JRE Path=data\\jre\\";
                    }
                }
                bufferedReader.close();
                final BufferedWriter bufferedWriter = new BufferedWriter(new FileWriter(file));
                for (int i = 0; i < n; ++i) {
                    bufferedWriter.write(array[i]);
                    bufferedWriter.newLine();
                }
                bufferedWriter.close();
            }
        }
        catch (final Exception ex) {}
        Madness.inisetup = false;
    }
    
    public void openurl(final String s) {
        if (Desktop.isDesktopSupported()) {
            try {
                Desktop.getDesktop().browse(new URI(s));
            }
            catch (final Exception ex) {}
        }
        else {
            try {
                Runtime.getRuntime().exec("" + Madness.urlopen() + " " + s + "");
            }
            catch (final Exception ex2) {}
        }
    }
    
    @Override
    public boolean keyDown(final Event event, final int n) {
        if (this.u == null || this.u.length == 0 || this.u[0] == null) {
            return false;
        }
        if (!this.exwist) {
            if (this.u[0].multion < 2) {
                if (n == 1004) {
                    this.u[0].up = true;
                }
                if (n == 1005) {
                    this.u[0].down = true;
                }
                if (n == 1007) {
                    this.u[0].right = true;
                }
                if (n == 1006) {
                    this.u[0].left = true;
                }
                if (n == 32) {
                    this.u[0].handb = true;
                }
            }
            if (n == 10) {
                this.u[0].enter = true;
            }
            if (n == 27) {
                this.u[0].exit = true;
                if (this.u[0].chatup != 0) {
                    this.u[0].chatup = 0;
                }
            }
            if ((n == 67 || n == 99) && this.u[0].multion != 0 && this.u[0].chatup == 0) {
                this.u[0].chatup = 2;
                this.view = 0;
            }
            if (this.u[0].chatup == 0) {
                if (n == 120 || n == 88) {
                    this.u[0].lookback = -1;
                }
                if (n == 122 || n == 90) {
                    this.u[0].lookback = 1;
                }
                if (n == 77 || n == 109) {
                    if (this.u[0].mutem) {
                        this.u[0].mutem = false;
                    }
                    else {
                        this.u[0].mutem = true;
                    }
                }
                if (n == 78 || n == 110) {
                    if (this.u[0].mutes) {
                        this.u[0].mutes = false;
                    }
                    else {
                        this.u[0].mutes = true;
                    }
                }
                if (n == 97 || n == 65) {
                    if (this.u[0].arrace) {
                        this.u[0].arrace = false;
                    }
                    else {
                        this.u[0].arrace = true;
                    }
                }
                if (n == 115 || n == 83) {
                    if (this.u[0].radar) {
                        this.u[0].radar = false;
                    }
                    else {
                        this.u[0].radar = true;
                    }
                }
                if (n == 118 || n == 86) {
                    ++this.view;
                    if (this.view == 3) {
                        this.view = 0;
                    }
                }
            }
        }
        return false;
    }
    
    @Override
    public boolean keyUp(final Event event, final int n) {
        if (this.u == null || this.u.length == 0 || this.u[0] == null) {
            return false;
        }
        if (!this.exwist) {
            if (this.u[0].multion < 2) {
                if (n == 1004) {
                    this.u[0].up = false;
                }
                if (n == 1005) {
                    this.u[0].down = false;
                }
                if (n == 1007) {
                    this.u[0].right = false;
                }
                if (n == 1006) {
                    this.u[0].left = false;
                }
                if (n == 32) {
                    this.u[0].handb = false;
                }
            }
            if (n == 27) {
                this.u[0].exit = false;
                if (Madness.fullscreen) {
                    Madness.exitfullscreen();
                }
            }
            if (n == 120 || n == 88 || n == 122 || n == 90) {
                this.u[0].lookback = 0;
            }
        }
        return false;
    }
}
