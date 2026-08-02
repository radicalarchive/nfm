package tools;

import java.io.*;
import java.lang.reflect.*;
import java.nio.file.*;

public class BakeMusic {
    static class Track {
        String name;
        String zipFile;
        int gain, rate, bpmflex;
        
        Track(String n, String z, int g, int r, int b) {
            name = n; zipFile = z; gain = g; rate = r; bpmflex = b;
        }
    }

    public static void main(String[] args) throws Exception {
        Class<?> madClass = Class.forName("Madness");
        Field fpath = madClass.getDeclaredField("fpath");
        fpath.setAccessible(true);
        fpath.set(null, "./");

        Track[] tracks = {
            new Track("stage1", "music/stage1.zip", 240, 8400, 135),
            new Track("stage2", "music/stage2.zip", 190, 9000, 145),
            new Track("stage3", "music/stage3.zip", 170, 8500, 145),
            new Track("stage4", "music/stage4.zip", 205, 7500, 125),
            new Track("stage5", "music/stage5.zip", 170, 7900, 125),
            new Track("stage6", "music/stage6.zip", 370, 7900, 125),
            new Track("stage7", "music/stage7.zip", 205, 7500, 125),
            new Track("stage8", "music/stage8.zip", 230, 7900, 125),
            new Track("stage9", "music/stage9.zip", 180, 7900, 125),
            new Track("stage10", "music/stage10.zip", 280, 8100, 145),
            new Track("stage11", "music/stage11.zip", 120, 8000, 125),
            new Track("stage12", "music/stage12.zip", 260, 7200, 125),
            new Track("stage13", "music/stage13.zip", 270, 8000, 125),
            new Track("stage14", "music/stage14.zip", 190, 8000, 125),
            new Track("stage15", "music/stage15.zip", 162, 7800, 125),
            new Track("stage16", "music/stage16.zip", 220, 7600, 125),
            new Track("stage17", "music/stage17.zip", 300, 7500, 125),
            new Track("stage18", "music/stage18.zip", 200, 7900, 125),
            new Track("stage19", "music/stage19.zip", 200, 7900, 125),
            new Track("stage20", "music/stage20.zip", 232, 7300, 125),
            new Track("stage21", "music/stage21.zip", 370, 7900, 125),
            new Track("stage22", "music/stage22.zip", 290, 7900, 125),
            new Track("stage23", "music/stage23.zip", 222, 7600, 125),
            new Track("stage24", "music/stage24.zip", 230, 8000, 125),
            new Track("stage25", "music/stage25.zip", 220, 8000, 125),
            new Track("stage26", "music/stage26.zip", 261, 8000, 125),
            new Track("stage27", "music/stage27.zip", 276, 8800, 145),
            new Track("stage28", "music/stage28.zip", 182, 8000, 125),
            new Track("stage29", "music/stage29.zip", 220, 8000, 125),
            new Track("stage30", "music/stage30.zip", 200, 8000, 125),
            new Track("stage31", "music/stage31.zip", 350, 7900, 125),
            new Track("stage32", "music/stage32.zip", 310, 8000, 125),
            new Track("party", "music/party.zip", 400, 7600, 125),
            new Track("interface", "music/interface.zip", 160, 44000, 125)
        };

        File dir = new File("./music-baked");
        if (!dir.exists()) dir.mkdirs();

        PrintWriter manifest = new PrintWriter(new FileWriter("./music-baked/manifest.json"));
        manifest.println("{");

        Class<?> rmClass = Class.forName("RadicalMod");
        Constructor<?> ctor = rmClass.getDeclaredConstructor(String.class, int.class, int.class, int.class, boolean.class, boolean.class);
        ctor.setAccessible(true);
        Constructor<?> ctorStr = rmClass.getDeclaredConstructor(String.class);
        ctorStr.setAccessible(true);
        Method loadimod = rmClass.getDeclaredMethod("loadimod", boolean.class);
        loadimod.setAccessible(true);

        Field sClipF = rmClass.getDeclaredField("sClip");
        sClipF.setAccessible(true);

        for (int i = 0; i < tracks.length; i++) {
            Track t = tracks[i];
            System.out.println("Baking " + t.name + "...");
            
            Object rm;
            if (t.name.equals("interface")) {
                rm = ctorStr.newInstance(t.zipFile);
                loadimod.invoke(rm, false);
            } else {
                rm = ctor.newInstance(t.zipFile, t.gain, t.rate, t.bpmflex, false, false);
            }

            Object sClip = sClipF.get(rm);
            if (sClip == null) {
                throw new RuntimeException("Failed to render " + t.name);
            }

            Field streamF = sClip.getClass().getDeclaredField("stream");
            streamF.setAccessible(true);
            java.io.ByteArrayInputStream bais = (java.io.ByteArrayInputStream) streamF.get(sClip);
            bais.reset();
            byte[] buf = bais.readAllBytes();

            Field rbPosF = sClip.getClass().getDeclaredField("rollBackPos");
            rbPosF.setAccessible(true);
            int rbPos = (int) rbPosF.get(sClip);
            
            Field rbTrigF = sClip.getClass().getDeclaredField("rollBackTrig");
            rbTrigF.setAccessible(true);
            int rbTrig = (int) rbTrigF.get(sClip);
            
            int maxAbs = 0;
            double sumSq = 0;
            for (int j = 0; j < buf.length - 1; j += 2) {
                int sample = (buf[j] & 0xFF) | (buf[j+1] << 8);
                short s = (short) sample;
                int abs = Math.abs(s);
                if (abs > maxAbs) maxAbs = abs;
                sumSq += (double)s * s;
            }
            double rms = Math.sqrt(sumSq / (buf.length / 2));
            System.out.println("  peak: " + maxAbs + ", rms: " + rms);
            if (maxAbs < 100) {
                System.out.println("  WARNING: Track is almost completely silent. Peak: " + maxAbs);
            }

            Files.write(Paths.get("./music-baked/" + t.name + ".raw"), buf);

            manifest.println("  \"" + t.name + "\": {");
            manifest.println("    \"file\": \"" + t.name + ".flac\",");
            manifest.println("    \"sampleRate\": 22000,");
            manifest.println("    \"channels\": 1,");
            manifest.println("    \"lengthSamples\": " + (buf.length / 2) + ",");
            // rbTrig is NOT the loop end. RadicalMod stores it transformed --
            // sClip.rollBackTrig = oln - slayer.rollBackTrig -- and SuperClip
            // compares it against the bytes REMAINING in the stream
            // (`available < rollBackTrig`), so the loop end is length - rbTrig.
            // Taking rbTrig directly put loopEnd BEFORE loopStart on 4 tracks.
            // And rbPos == 0 means no rollback point at all: SuperClip then
            // just restarts on EOF, i.e. the whole track is the loop.
            int loopStart = (rbPos == 0) ? 0 : rbPos / 2;
            int loopEnd = (rbPos == 0) ? buf.length / 2 : (buf.length - rbTrig) / 2;
            manifest.println("    \"loopStartSamples\": " + loopStart + ",");
            manifest.println("    \"loopEndSamples\": " + loopEnd + ",");
            manifest.println("    \"gain\": " + t.gain + ",");
            manifest.println("    \"rate\": " + t.rate + ",");
            manifest.println("    \"bpmflex\": " + t.bpmflex);
            if (i == tracks.length - 1) {
                manifest.println("  }");
            } else {
                manifest.println("  },");
            }
        }
        manifest.println("}");
        manifest.close();
        System.out.println("Done.");
    }
}
