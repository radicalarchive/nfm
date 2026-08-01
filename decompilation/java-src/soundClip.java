import javax.sound.sampled.Line;
import javax.sound.sampled.DataLine;
import java.io.InputStream;
import javax.sound.sampled.AudioSystem;
import java.io.ByteArrayInputStream;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.Clip;

// 
// Decompiled by Procyon v0.6.0
// 

public class soundClip
{
    Clip clip;
    AudioInputStream sound;
    boolean loaded;
    int lfrpo;
    int cntcheck;
    
    public soundClip(final byte[] buf) {
        this.clip = null;
        this.loaded = false;
        this.lfrpo = -1;
        this.cntcheck = 0;
        try {
            (this.sound = AudioSystem.getAudioInputStream(new ByteArrayInputStream(buf))).mark(buf.length);
            this.clip = (Clip)AudioSystem.getLine(new DataLine.Info(Clip.class, this.sound.getFormat()));
            this.loaded = true;
        }
        catch (final Exception obj) {
            System.out.println("Loading Clip error: " + obj);
            this.loaded = false;
        }
    }
    
    public void play() {
        if (this.loaded) {
            try {
                if (!this.clip.isOpen()) {
                    try {
                        this.clip.open(this.sound);
                    }
                    catch (final Exception ex) {}
                    this.clip.loop(0);
                }
                else {
                    this.clip.loop(1);
                }
                this.lfrpo = -1;
                this.cntcheck = 5;
            }
            catch (final Exception ex2) {}
        }
    }
    
    public void loop() {
        if (this.loaded) {
            try {
                if (!this.clip.isOpen()) {
                    try {
                        this.clip.open(this.sound);
                    }
                    catch (final Exception ex) {}
                }
                this.clip.loop(70);
                this.lfrpo = -2;
                this.cntcheck = 0;
            }
            catch (final Exception ex2) {}
        }
    }
    
    public void stop() {
        if (this.loaded) {
            try {
                this.clip.stop();
                this.lfrpo = -1;
            }
            catch (final Exception ex) {}
        }
    }
    
    public void checkopen() {
        if (this.loaded && this.clip.isOpen() && this.lfrpo != -2) {
            if (this.cntcheck == 0) {
                final int framePosition = this.clip.getFramePosition();
                if (this.lfrpo == framePosition && !this.clip.isRunning()) {
                    try {
                        this.clip.close();
                        this.sound.reset();
                    }
                    catch (final Exception ex) {}
                    this.lfrpo = -1;
                }
                else {
                    this.lfrpo = framePosition;
                }
            }
            else {
                --this.cntcheck;
            }
        }
    }
}
