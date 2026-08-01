import java.io.*;
import java.lang.reflect.*;
import java.util.Arrays;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class LoadCarProbe {
  public static Object getField(Object obj, String name) throws Exception {
    Field f = obj.getClass().getDeclaredField(name);
    f.setAccessible(true);
    return f.get(obj);
  }

  public static void main(String[] args) throws Exception {
    File mycarsDir = new File("mycars");
    if (!mycarsDir.exists()) {
      mycarsDir.mkdirs();
    }

    // Read formula7.rad raw content from data/models.zip
    String formula7Raw = "";
    File zipFile = new File("data/models.zip");
    if (zipFile.exists()) {
      try (ZipInputStream zis = new ZipInputStream(new FileInputStream(zipFile))) {
        ZipEntry entry;
        while ((entry = zis.getNextEntry()) != null) {
          if (entry.getName().equals("formula7.rad")) {
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buf = new byte[1024];
            int len;
            while ((len = zis.read(buf)) > 0) {
              baos.write(buf, 0, len);
            }
            formula7Raw = baos.toString("ISO-8859-1");
          }
        }
      }
    }

    // Create a valid custom car file mycars/custom_formula7.rad
    String customHeader = "stat(150,150,150,150,150)\n" +
                          "physics(50,50,50,50,50,50,50,50,50,50,50,50,50,50,1,1.0)\n" +
                          "handling(100)\n" +
                          "carmaker(TestAuthor)\n" +
                          "publish(1)\n";
    String validCustomCarText = customHeader + formula7Raw;
    try (FileWriter fw = new FileWriter(new File(mycarsDir, "custom_formula7.rad"))) {
      fw.write(validCustomCarText);
    }

    // Create a custom car file with bad stats
    try (FileWriter fw = new FileWriter(new File(mycarsDir, "badstat_car.rad"))) {
      fw.write("stat(invalid)\n" + formula7Raw);
    }

    Class<?> carDefineClass = Class.forName("CarDefine");
    Class<?> mediumClass = Class.forName("Medium");
    Class<?> trackersClass = Class.forName("Trackers");
    Class<?> contOClass = Class.forName("ContO");

    Object medium = mediumClass.getDeclaredConstructor().newInstance();
    Object trackers = trackersClass.getDeclaredConstructor().newInstance();
    Object contOArray = Array.newInstance(contOClass, 56);

    Constructor<?> ctor = carDefineClass.getDeclaredConstructor(
      contOArray.getClass(), mediumClass, trackersClass, Class.forName("GameSparker")
    );
    ctor.setAccessible(true);
    Object cd = ctor.newInstance(contOArray, medium, trackers, null);

    Method loadcar = carDefineClass.getDeclaredMethod("loadcar", String.class, int.class);
    loadcar.setAccessible(true);

    System.out.println("=== Test 1: Load Valid Custom Car (custom_formula7 at slot 16) ===");
    int res1 = (Integer) loadcar.invoke(cd, "custom_formula7", 16);
    System.out.println("loadcar_valid_res=" + res1);

    Object[] bco = (Object[]) getField(cd, "bco");
    Object car16 = bco[16];
    if (car16 != null) {
      System.out.println("car16_npl=" + getField(car16, "npl"));
      System.out.println("car16_maxR=" + getField(car16, "maxR"));
      System.out.println("car16_shadow=" + getField(car16, "shadow"));
      System.out.println("car16_noline=" + getField(car16, "noline"));
      System.out.println("car16_decor=" + getField(car16, "decor"));
      System.out.println("car16_tnt=" + getField(car16, "tnt"));
      System.out.println("car16_disp=" + getField(car16, "disp"));
      System.out.println("car16_disline=" + getField(car16, "disline"));
      System.out.println("car16_grounded=" + getField(car16, "grounded"));
      System.out.println("car16_roofat=" + getField(car16, "roofat"));
      System.out.println("car16_wh=" + getField(car16, "wh"));
    }

    String[] names = (String[]) getField(cd, "names");
    int[] cclass = (int[]) getField(cd, "cclass");
    int[][] swits = (int[][]) getField(cd, "swits");
    float[][] acelf = (float[][]) getField(cd, "acelf");
    int[] handb = (int[]) getField(cd, "handb");
    float[] airs = (float[]) getField(cd, "airs");
    int[] airc = (int[]) getField(cd, "airc");
    int[] turn = (int[]) getField(cd, "turn");
    float[] grip = (float[]) getField(cd, "grip");
    float[] bounce = (float[]) getField(cd, "bounce");
    float[] simag = (float[]) getField(cd, "simag");
    float[] moment = (float[]) getField(cd, "moment");
    float[] comprad = (float[]) getField(cd, "comprad");
    int[] push = (int[]) getField(cd, "push");
    int[] revpush = (int[]) getField(cd, "revpush");
    int[] lift = (int[]) getField(cd, "lift");
    int[] revlift = (int[]) getField(cd, "revlift");
    int[] powerloss = (int[]) getField(cd, "powerloss");
    int[] flipy = (int[]) getField(cd, "flipy");
    int[] msquash = (int[]) getField(cd, "msquash");
    int[] clrad = (int[]) getField(cd, "clrad");
    float[] dammult = (float[]) getField(cd, "dammult");
    int[] maxmag = (int[]) getField(cd, "maxmag");
    float[] dishandle = (float[]) getField(cd, "dishandle");
    float[] outdam = (float[]) getField(cd, "outdam");
    int[] enginsignature = (int[]) getField(cd, "enginsignature");
    String[] createdby = (String[]) getField(cd, "createdby");
    int[] publish = (int[]) getField(cd, "publish");

    System.out.println("name[16]=" + names[16]);
    System.out.println("cclass[16]=" + cclass[16]);
    System.out.println("swits[16]=" + Arrays.toString(swits[16]));
    System.out.println("acelf[16]=" + Arrays.toString(acelf[16]));
    System.out.println("handb[16]=" + handb[16]);
    System.out.println("airs[16]=" + airs[16]);
    System.out.println("airc[16]=" + airc[16]);
    System.out.println("turn[16]=" + turn[16]);
    System.out.println("grip[16]=" + grip[16]);
    System.out.println("bounce[16]=" + bounce[16]);
    System.out.println("simag[16]=" + simag[16]);
    System.out.println("moment[16]=" + moment[16]);
    System.out.println("comprad[16]=" + comprad[16]);
    System.out.println("push[16]=" + push[16]);
    System.out.println("revpush[16]=" + revpush[16]);
    System.out.println("lift[16]=" + lift[16]);
    System.out.println("revlift[16]=" + revlift[16]);
    System.out.println("powerloss[16]=" + powerloss[16]);
    System.out.println("flipy[16]=" + flipy[16]);
    System.out.println("msquash[16]=" + msquash[16]);
    System.out.println("clrad[16]=" + clrad[16]);
    System.out.println("dammult[16]=" + dammult[16]);
    System.out.println("maxmag[16]=" + maxmag[16]);
    System.out.println("dishandle[16]=" + dishandle[16]);
    System.out.println("outdam[16]=" + outdam[16]);
    System.out.println("enginsignature[16]=" + enginsignature[16]);
    System.out.println("createdby[0]=" + createdby[0]);
    System.out.println("publish[0]=" + publish[0]);

    System.out.println("\n=== Test 2: Load Car Bad Stat ===");
    int res2 = (Integer) loadcar.invoke(cd, "badstat_car", 17);
    System.out.println("loadcar_badstat_res=" + res2);
  }
}
