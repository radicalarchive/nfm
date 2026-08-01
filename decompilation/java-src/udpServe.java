import java.net.InetAddress;
import java.net.DatagramPacket;
import java.net.DatagramSocket;

// 
// Decompiled by Procyon v0.6.0
// 

public class udpServe implements Runnable
{
    Thread servo;
    DatagramSocket dSocket;
    UDPMistro um;
    int mport;
    int im;
    int[] lsframe;
    
    public udpServe(final UDPMistro um, final int im) {
        this.mport = 7060;
        this.im = 0;
        this.lsframe = new int[] { -1, -1, -1, -1, -1, -1, -1, -1 };
        this.um = um;
        this.im = im;
        this.mport = 7060 + this.im;
        (this.servo = new Thread(this)).start();
    }
    
    public void stopServe() {
        try {
            this.dSocket.close();
            this.dSocket = null;
        }
        catch (final Exception ex) {}
        if (this.servo != null) {
            this.servo.stop();
            this.servo = null;
        }
    }
    
    @Override
    public void run() {
        try {
            this.dSocket = new DatagramSocket(this.mport);
            final byte[] buf = new byte[128];
            while (true) {
                final DatagramPacket p = new DatagramPacket(buf, buf.length);
                this.dSocket.receive(p);
                final String s = new String(p.getData());
                String svalue = this.getSvalue(s, 0);
                final int getvalue = this.getvalue(s, 1);
                if (getvalue == this.im && this.im < this.um.nplayers && this.um.out[getvalue] != 76) {
                    final int getvalue2 = this.getvalue(s, 2);
                    int n = 0;
                    for (int i = 0; i < 3; ++i) {
                        if (getvalue2 != this.um.frame[getvalue][i]) {
                            ++n;
                        }
                    }
                    if (n == 3) {
                        for (int j = 0; j < 3; ++j) {
                            if (getvalue2 > this.um.frame[getvalue][j]) {
                                for (int k = 2; k >= j + 1; --k) {
                                    this.um.frame[getvalue][k] = this.um.frame[getvalue][k - 1];
                                    this.um.info[getvalue][k] = this.um.info[getvalue][k - 1];
                                }
                                this.um.frame[getvalue][j] = getvalue2;
                                this.um.info[getvalue][j] = this.getSvalue(s, 3);
                                j = 3;
                            }
                        }
                    }
                    if (this.um.gocnt[getvalue] != 0) {
                        int n2 = 0;
                        for (int l = 0; l < this.um.nplayers; ++l) {
                            if (this.um.frame[l][0] >= 0) {
                                ++n2;
                            }
                        }
                        if (n2 == this.um.nplayers) {
                            svalue = "1111111";
                            final int[] gocnt = this.um.gocnt;
                            final int n3 = getvalue;
                            --gocnt[n3];
                        }
                    }
                    if (!this.um.go) {
                        int n4 = 0;
                        for (int n5 = 0; n5 < this.um.nplayers; ++n5) {
                            if (this.um.frame[n5][0] >= 0) {
                                ++n4;
                            }
                        }
                        if (n4 == this.um.nplayers) {
                            final int[] gocnt2 = this.um.gocnt;
                            final int n6 = 0;
                            --gocnt2[n6];
                        }
                        if (this.um.gocnt[0] <= 1) {
                            this.um.go = true;
                        }
                    }
                }
                final InetAddress address = p.getAddress();
                final int port = p.getPort();
                for (int m = 0; m < this.um.nplayers; ++m) {
                    if (m != this.im) {
                        int n7 = -1;
                        for (int n8 = 0; n8 < 3; ++n8) {
                            if (this.um.frame[m][n8] == this.lsframe[m] + 1) {
                                n7 = n8;
                            }
                        }
                        if (n7 == -1) {
                            for (int n9 = 0; n9 < 3; ++n9) {
                                if (this.um.frame[m][n9] > this.lsframe[m]) {
                                    n7 = n9;
                                }
                            }
                        }
                        if (n7 == -1) {
                            n7 = 0;
                        }
                        this.lsframe[m] = this.um.frame[m][n7];
                        final byte[] bytes = ("" + svalue + "|" + m + "|" + this.um.frame[m][n7] + "|" + this.um.info[m][n7] + "|").getBytes();
                        this.dSocket.send(new DatagramPacket(bytes, bytes.length, address, port));
                    }
                }
            }
        }
        catch (final Exception ex) {}
    }
    
    public int getvalue(final String s, final int n) {
        int intValue = -1;
        try {
            int index = 0;
            int n2 = 0;
            int n3 = 0;
            String string = "";
            while (index < s.length() && n3 != 2) {
                final String string2 = "" + s.charAt(index);
                if (string2.equals("|")) {
                    ++n2;
                    if (n3 == 1 || n2 > n) {
                        n3 = 2;
                    }
                }
                else if (n2 == n) {
                    string += string2;
                    n3 = 1;
                }
                ++index;
            }
            if (string.equals("")) {
                string = "-1";
            }
            intValue = Integer.valueOf(string);
        }
        catch (final Exception ex) {}
        return intValue;
    }
    
    public String getSvalue(final String s, final int n) {
        String s2 = "";
        try {
            int index = 0;
            int n2 = 0;
            int n3 = 0;
            String string = "";
            while (index < s.length() && n3 != 2) {
                final String string2 = "" + s.charAt(index);
                if (string2.equals("|")) {
                    ++n2;
                    if (n3 == 1 || n2 > n) {
                        n3 = 2;
                    }
                }
                else if (n2 == n) {
                    string += string2;
                    n3 = 1;
                }
                ++index;
            }
            s2 = string;
        }
        catch (final Exception ex) {}
        return s2;
    }
}
