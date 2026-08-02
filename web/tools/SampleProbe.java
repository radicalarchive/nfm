package tools;

import java.io.File;
import java.io.FileInputStream;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.io.ByteArrayOutputStream;

public class SampleProbe {
    public static void main(String[] args) throws Exception {
        File zipFile = new File("../../music/stage1.zip");
        if (!zipFile.exists()) {
            zipFile = new File("/home/evan/games/nfm/music/stage1.zip");
        }
        
        byte[] modBytes = null;
        try (ZipInputStream zis = new ZipInputStream(new FileInputStream(zipFile))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if (entry.getName().endsWith(".mod")) {
                    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
                    int nRead;
                    byte[] data = new byte[16384];
                    while ((nRead = zis.read(data, 0, data.length)) != -1) {
                        buffer.write(data, 0, nRead);
                    }
                    modBytes = buffer.toByteArray();
                    break;
                }
            }
        }
        
        Class<?> sampleClass = Class.forName("ibxm.Sample");
        Field sincTablesField = sampleClass.getDeclaredField("SINC_TABLES");
        sincTablesField.setAccessible(true);
        short[][] sincTables = (short[][]) sincTablesField.get(null);
        System.out.println("--- SINC_TABLES ---");
        for (int i = 0; i < sincTables.length; i++) {
            System.out.println(i + ": " + Arrays.toString(sincTables[i]));
        }

        Constructor<?> ctor = sampleClass.getDeclaredConstructor();
        ctor.setAccessible(true);
        Object sampleObj = ctor.newInstance();

        // Sample data from modBytes that naturally includes negative and large values
        short[] sampleData = new short[modBytes.length / 2];
        for (int i = 0; i < sampleData.length; i++) {
            // using the original bytes to get raw short values
            sampleData[i] = (short) ((modBytes[i*2] & 0xFF) | (modBytes[i*2+1] << 8));
        }

        Method setSampleData = sampleClass.getDeclaredMethod("setSampleData", short[].class, int.class, int.class, boolean.class);
        setSampleData.setAccessible(true);
        setSampleData.invoke(sampleObj, sampleData, 500, 1000, true);

        Method resampleNearest = sampleClass.getDeclaredMethod("resampleNearest", int.class, int.class, int.class, int.class, int.class, int[].class, int.class, int.class);
        Method resampleLinear = sampleClass.getDeclaredMethod("resampleLinear", int.class, int.class, int.class, int.class, int.class, int[].class, int.class, int.class);
        Method resampleSinc = sampleClass.getDeclaredMethod("resampleSinc", int.class, int.class, int.class, int.class, int.class, int[].class, int.class, int.class);
        resampleNearest.setAccessible(true);
        resampleLinear.setAccessible(true);
        resampleSinc.setAccessible(true);

        System.out.println("--- resampleNearest ---");
        int[] mixBuf = new int[200];
        // extreme gains to test int32 wrapping in JS
        resampleNearest.invoke(sampleObj, 10, 20000, 15000, 2000000, -3000000, mixBuf, 10, 50);
        System.out.println(Arrays.toString(mixBuf));

        System.out.println("--- resampleLinear ---");
        mixBuf = new int[200];
        resampleLinear.invoke(sampleObj, 10, 20000, 15000, 2000000, -3000000, mixBuf, 10, 50);
        System.out.println(Arrays.toString(mixBuf));

        System.out.println("--- resampleSinc ---");
        mixBuf = new int[200];
        resampleSinc.invoke(sampleObj, 10, 20000, 15000, 2000000, -3000000, mixBuf, 10, 50);
        System.out.println(Arrays.toString(mixBuf));

        System.out.println("--- resampleSinc high step ---");
        mixBuf = new int[200];
        resampleSinc.invoke(sampleObj, 1400, 5000, 40000, 2000000, -3000000, mixBuf, 0, 80);
        System.out.println(Arrays.toString(mixBuf));

        System.out.println("--- Envelope ---");
        Class<?> envClass = Class.forName("ibxm.Envelope");
        Constructor<?> envCtor = envClass.getDeclaredConstructor();
        envCtor.setAccessible(true);
        Object envObj = envCtor.newInstance();

        Field numPoints = envClass.getDeclaredField("numPoints"); numPoints.setAccessible(true);
        Field pointsTick = envClass.getDeclaredField("pointsTick"); pointsTick.setAccessible(true);
        Field pointsAmpl = envClass.getDeclaredField("pointsAmpl"); pointsAmpl.setAccessible(true);
        Field sustain = envClass.getDeclaredField("sustain"); sustain.setAccessible(true);
        Field sustainTick = envClass.getDeclaredField("sustainTick"); sustainTick.setAccessible(true);
        Field looped = envClass.getDeclaredField("looped"); looped.setAccessible(true);
        Field loopStartTick = envClass.getDeclaredField("loopStartTick"); loopStartTick.setAccessible(true);
        Field loopEndTick = envClass.getDeclaredField("loopEndTick"); loopEndTick.setAccessible(true);

        numPoints.set(envObj, 4);
        pointsTick.set(envObj, new int[]{0, 10, 30, 50});
        pointsAmpl.set(envObj, new int[]{0, 64, 32, 0});
        sustain.set(envObj, true);
        sustainTick.set(envObj, 30);
        looped.set(envObj, true);
        loopStartTick.set(envObj, 10);
        loopEndTick.set(envObj, 30);

        Method calcAmpl = envClass.getDeclaredMethod("calculateAmpl", int.class);
        calcAmpl.setAccessible(true);

        int[] testTicks = {-5, 0, 5, 10, 20, 30, 40, 50, 60};
        System.out.println("--- calculateAmpl ---");
        for (int tick : testTicks) {
            System.out.println("tick " + tick + ": " + calcAmpl.invoke(envObj, tick));
        }

        Method nextTick = envClass.getDeclaredMethod("nextTick", int.class, boolean.class);
        nextTick.setAccessible(true);
        System.out.println("--- nextTick ---");
        for (int tick : testTicks) {
            System.out.println("tick " + tick + " keyOn=true: " + nextTick.invoke(envObj, tick, true));
            System.out.println("tick " + tick + " keyOn=false: " + nextTick.invoke(envObj, tick, false));
        }
    }
}
