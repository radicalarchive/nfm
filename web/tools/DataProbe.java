package tools;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.lang.reflect.Constructor;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.io.ByteArrayOutputStream;

public class DataProbe {
    public static void main(String[] args) throws Exception {
        // Read stage1.mod from music/stage1.zip
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
        
        if (modBytes == null) {
            throw new RuntimeException("Could not find .mod in zip");
        }
        
        Class<?> dataClass = Class.forName("ibxm.Data");
        Constructor<?> ctor = dataClass.getDeclaredConstructor(byte[].class);
        ctor.setAccessible(true);
        Object dataObj = ctor.newInstance((Object) modBytes);
        
        // Let's test a few offsets, some large ones, some small ones
        int[] offsets = {0, 10, 100, 1000, 5000, 10000, modBytes.length - 10};
        
        Method mSByte = dataClass.getDeclaredMethod("sByte", int.class); mSByte.setAccessible(true);
        Method mUByte = dataClass.getDeclaredMethod("uByte", int.class); mUByte.setAccessible(true);
        Method mUbeShort = dataClass.getDeclaredMethod("ubeShort", int.class); mUbeShort.setAccessible(true);
        Method mUleShort = dataClass.getDeclaredMethod("uleShort", int.class); mUleShort.setAccessible(true);
        Method mUleInt = dataClass.getDeclaredMethod("uleInt", int.class); mUleInt.setAccessible(true);
        Method mStrLatin1 = dataClass.getDeclaredMethod("strLatin1", int.class, int.class); mStrLatin1.setAccessible(true);
        Method mStrCp850 = dataClass.getDeclaredMethod("strCp850", int.class, int.class); mStrCp850.setAccessible(true);
        Method mSamS8 = dataClass.getDeclaredMethod("samS8", int.class, int.class); mSamS8.setAccessible(true);
        Method mSamS8D = dataClass.getDeclaredMethod("samS8D", int.class, int.class); mSamS8D.setAccessible(true);
        Method mSamU8 = dataClass.getDeclaredMethod("samU8", int.class, int.class); mSamU8.setAccessible(true);
        Method mSamS16 = dataClass.getDeclaredMethod("samS16", int.class, int.class); mSamS16.setAccessible(true);
        Method mSamS16D = dataClass.getDeclaredMethod("samS16D", int.class, int.class); mSamS16D.setAccessible(true);
        Method mSamU16 = dataClass.getDeclaredMethod("samU16", int.class, int.class); mSamU16.setAccessible(true);
        
        System.out.println("--- sByte ---");
        for (int off : offsets) System.out.println(off + ": " + mSByte.invoke(dataObj, off));
        
        System.out.println("--- uByte ---");
        for (int off : offsets) System.out.println(off + ": " + mUByte.invoke(dataObj, off));
        
        System.out.println("--- ubeShort ---");
        for (int off : offsets) System.out.println(off + ": " + mUbeShort.invoke(dataObj, off));
        
        System.out.println("--- uleShort ---");
        for (int off : offsets) System.out.println(off + ": " + mUleShort.invoke(dataObj, off));
        
        System.out.println("--- uleInt ---");
        for (int off : offsets) System.out.println(off + ": " + mUleInt.invoke(dataObj, off));
        
        // Printed as CODE POINTS, not as text: the string forms go through the
        // terminal's encoding on the way out and through the editor's on the way
        // into the test, and a Cp850 high byte does not survive that round trip.
        // The first version of this probe printed text and the test's literals
        // came back as UTF-8 for a different character.
        System.out.println("--- strLatin1 ---");
        for (int off : offsets) System.out.println(off + ": " + codes((String) mStrLatin1.invoke(dataObj, off, 8)));
        
        System.out.println("--- strCp850 ---");
        for (int off : offsets) System.out.println(off + ": " + codes((String) mStrCp850.invoke(dataObj, off, 8)));
        
        System.out.println("--- samS8 ---");
        for (int off : offsets) System.out.println(off + ": " + Arrays.toString((short[]) mSamS8.invoke(dataObj, off, 4)));
        
        System.out.println("--- samS8D ---");
        for (int off : offsets) System.out.println(off + ": " + Arrays.toString((short[]) mSamS8D.invoke(dataObj, off, 4)));
        
        System.out.println("--- samU8 ---");
        for (int off : offsets) System.out.println(off + ": " + Arrays.toString((short[]) mSamU8.invoke(dataObj, off, 4)));
        
        System.out.println("--- samS16 ---");
        for (int off : offsets) System.out.println(off + ": " + Arrays.toString((short[]) mSamS16.invoke(dataObj, off, 4)));
        
        System.out.println("--- samS16D ---");
        for (int off : offsets) System.out.println(off + ": " + Arrays.toString((short[]) mSamS16D.invoke(dataObj, off, 4)));
        
        System.out.println("--- samU16 ---");
        for (int off : offsets) System.out.println(off + ": " + Arrays.toString((short[]) mSamU16.invoke(dataObj, off, 4)));
    }
    /** Char codes of a string, so the value survives every encoding hop. */
    private static String codes(String s) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < s.length(); i++) {
            if (i > 0) sb.append(",");
            sb.append((int) s.charAt(i));
        }
        return sb.append("]").toString();
    }

}
