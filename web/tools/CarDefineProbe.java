import java.lang.reflect.*;
import java.util.Arrays;

/**
 * Probe for CarDefine.java — runs against real unpacked Game.jar.
 */
public class CarDefineProbe {
  public static void main(String[] args) throws Exception {
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

    System.out.println("=== Test 1: Constructor Defaults ===");
    System.out.println("swits[0]=" + Arrays.toString(((int[][]) getField(cd, "swits"))[0]));
    System.out.println("swits[15]=" + Arrays.toString(((int[][]) getField(cd, "swits"))[15]));
    System.out.println("acelf[0]=" + Arrays.toString(((float[][]) getField(cd, "acelf"))[0]));
    System.out.println("handb[0]=" + ((int[]) getField(cd, "handb"))[0]);
    System.out.println("airs[0]=" + ((float[]) getField(cd, "airs"))[0]);
    System.out.println("airc[0]=" + ((int[]) getField(cd, "airc"))[0]);
    System.out.println("turn[0]=" + ((int[]) getField(cd, "turn"))[0]);
    System.out.println("grip[0]=" + ((float[]) getField(cd, "grip"))[0]);
    System.out.println("bounce[0]=" + ((float[]) getField(cd, "bounce"))[0]);
    System.out.println("simag[0]=" + ((float[]) getField(cd, "simag"))[0]);
    System.out.println("moment[0]=" + ((float[]) getField(cd, "moment"))[0]);
    System.out.println("comprad[0]=" + ((float[]) getField(cd, "comprad"))[0]);
    System.out.println("push[0]=" + ((int[]) getField(cd, "push"))[0]);
    System.out.println("revpush[0]=" + ((int[]) getField(cd, "revpush"))[0]);
    System.out.println("lift[0]=" + ((int[]) getField(cd, "lift"))[0]);
    System.out.println("revlift[0]=" + ((int[]) getField(cd, "revlift"))[0]);
    System.out.println("powerloss[0]=" + ((int[]) getField(cd, "powerloss"))[0]);
    System.out.println("flipy[0]=" + ((int[]) getField(cd, "flipy"))[0]);
    System.out.println("msquash[0]=" + ((int[]) getField(cd, "msquash"))[0]);
    System.out.println("clrad[0]=" + ((int[]) getField(cd, "clrad"))[0]);
    System.out.println("dammult[0]=" + ((float[]) getField(cd, "dammult"))[0]);
    System.out.println("maxmag[0]=" + ((int[]) getField(cd, "maxmag"))[0]);
    System.out.println("dishandle[0]=" + ((float[]) getField(cd, "dishandle"))[0]);
    System.out.println("outdam[0]=" + ((float[]) getField(cd, "outdam"))[0]);
    System.out.println("cclass[0]=" + ((int[]) getField(cd, "cclass"))[0]);
    System.out.println("names[0]=" + ((String[]) getField(cd, "names"))[0]);
    System.out.println("enginsignature[0]=" + ((int[]) getField(cd, "enginsignature"))[0]);

    // Test helper methods
    System.out.println("\n=== Test 2: Helper Methods ===");
    Method getvalue = carDefineClass.getDeclaredMethod("getvalue", String.class, String.class, int.class);
    getvalue.setAccessible(true);
    System.out.println("getvalue stat 0=" + getvalue.invoke(cd, "stat", "stat(180,160,140,120,100)", 0));
    System.out.println("getvalue stat 4=" + getvalue.invoke(cd, "stat", "stat(180,160,140,120,100)", 4));
    System.out.println("getvalue stat negative=" + getvalue.invoke(cd, "stat", "stat(250,-40,15,18,99)", 1));

    Method getSvalue = carDefineClass.getDeclaredMethod("getSvalue", String.class, String.class, int.class);
    getSvalue.setAccessible(true);
    System.out.println("getSvalue carmaker=" + getSvalue.invoke(cd, "carmaker", "carmaker(TestUser,extra)", 0));

    Method servervalue = carDefineClass.getDeclaredMethod("servervalue", String.class, int.class);
    servervalue.setAccessible(true);
    System.out.println("servervalue 0=" + servervalue.invoke(cd, "0|key|clan|clankey", 0));
    System.out.println("servervalue -150=" + servervalue.invoke(cd, "-150|foo", 0));

    Method serverSvalue = carDefineClass.getDeclaredMethod("serverSvalue", String.class, int.class);
    serverSvalue.setAccessible(true);
    System.out.println("serverSvalue 1=" + serverSvalue.invoke(cd, "0|key|clan|clankey", 1));

    // Test loadready
    System.out.println("\n=== Test 3: loadready ===");
    Method loadready = carDefineClass.getDeclaredMethod("loadready");
    loadready.setAccessible(true);
    loadready.invoke(cd);
    System.out.println("fails=" + getField(cd, "fails"));
    System.out.println("nl=" + getField(cd, "nl"));
    System.out.println("action=" + getField(cd, "action"));

    // Test loadstat Case A: Normal car stats
    System.out.println("\n=== Test 4: loadstat Case A (Normal) ===");
    Method loadstat = carDefineClass.getDeclaredMethod("loadstat", byte[].class, String.class, int.class, int.class, int.class, int.class);
    loadstat.setAccessible(true);
    String statTextA = "stat(180,160,140,120,100)\n" +
                       "physics(80,70,60,50,40,30,20,10,50,40,30,20,10,3,2,100.0)\n" +
                       "handling(150)\n" +
                       "carmaker(TestMaker)\n" +
                       "publish(1)\n";
    loadstat.invoke(cd, statTextA.getBytes("ISO-8859-1"), "CustomCarA", 400, -60, 200, 16);
    printCarStat(cd, 16);

    // Test loadstat Case B: Edge case with low stats, grip compound assignment & bounce scaling
    System.out.println("\n=== Test 5: loadstat Case B (Low stats / compound assignment) ===");
    String statTextB = "stat(50,50,50,50,50)\n" +
                       "physics(10,20,5,75,40,30,20,10,50,40,30,20,10,1,0,85.5)\n" +
                       "handling(40)\n" +
                       "carmaker(LowMaker)\n" +
                       "publish(0)\n";
    loadstat.invoke(cd, statTextB.getBytes("ISO-8859-1"), "CustomCarB", 200, -100, 50, 17);
    printCarStat(cd, 17);

    // Test loadstat Case C: Failed physics (n6 <= 0)
    System.out.println("\n=== Test 6: loadstat Case C (Failed physics / n6 <= 0) ===");
    String statTextC = "stat(300,-50,16,250,50)\n" +
                       "physics(-10,120,-5,-50,150,-20,80,-100,500,250,-10,20,-30,8,0,-20.0)\n" +
                       "handling(300)\n" +
                       "carmaker(ExtremeMaker)\n" +
                       "publish(99)\n";
    loadstat.invoke(cd, statTextC.getBytes("ISO-8859-1"), "CustomCarC", -500, -120, -50, 18);
    printCarStat(cd, 18);

    // Test loadstat Case D: Negative parameters n, n2, n3 and extreme stat values
    System.out.println("\n=== Test 7: loadstat Case D (Negative n, n2, n3 & extreme values) ===");
    String statTextD = "stat(300,-50,16,250,50)\n" +
                       "physics(-10,120,-5,-50,150,-20,80,-100,500,250,-10,20,-30,8,0,150.0)\n" +
                       "handling(300)\n" +
                       "carmaker(ExtremeMaker)\n" +
                       "publish(99)\n";
    loadstat.invoke(cd, statTextD.getBytes("ISO-8859-1"), "CustomCarD", -500, -120, -50, 19);
    printCarStat(cd, 19);
  }

  private static Object getField(Object obj, String fieldName) throws Exception {
    Field f = obj.getClass().getDeclaredField(fieldName);
    f.setAccessible(true);
    return f.get(obj);
  }

  private static void printCarStat(Object cd, int idx) throws Exception {
    System.out.println("idx=" + idx);
    System.out.println("  name=" + ((String[]) getField(cd, "names"))[idx]);
    System.out.println("  cclass=" + ((int[]) getField(cd, "cclass"))[idx]);
    System.out.println("  swits=" + Arrays.toString(((int[][]) getField(cd, "swits"))[idx]));
    float[] acelf = ((float[][]) getField(cd, "acelf"))[idx];
    System.out.println("  acelf=[" + (double)acelf[0] + ", " + (double)acelf[1] + ", " + (double)acelf[2] + "]");
    System.out.println("  airs=" + (double)((float[]) getField(cd, "airs"))[idx]);
    System.out.println("  airc=" + ((int[]) getField(cd, "airc"))[idx]);
    System.out.println("  powerloss=" + ((int[]) getField(cd, "powerloss"))[idx]);
    System.out.println("  moment=" + (double)((float[]) getField(cd, "moment"))[idx]);
    System.out.println("  maxmag=" + ((int[]) getField(cd, "maxmag"))[idx]);
    System.out.println("  outdam=" + (double)((float[]) getField(cd, "outdam"))[idx]);
    System.out.println("  clrad=" + ((int[]) getField(cd, "clrad"))[idx]);
    System.out.println("  dammult=" + (double)((float[]) getField(cd, "dammult"))[idx]);
    System.out.println("  msquash=" + ((int[]) getField(cd, "msquash"))[idx]);
    System.out.println("  flipy=" + ((int[]) getField(cd, "flipy"))[idx]);
    System.out.println("  handb=" + ((int[]) getField(cd, "handb"))[idx]);
    System.out.println("  turn=" + ((int[]) getField(cd, "turn"))[idx]);
    System.out.println("  grip=" + (double)((float[]) getField(cd, "grip"))[idx]);
    System.out.println("  bounce=" + (double)((float[]) getField(cd, "bounce"))[idx]);
    System.out.println("  lift=" + ((int[]) getField(cd, "lift"))[idx]);
    System.out.println("  revlift=" + ((int[]) getField(cd, "revlift"))[idx]);
    System.out.println("  push=" + ((int[]) getField(cd, "push"))[idx]);
    System.out.println("  revpush=" + ((int[]) getField(cd, "revpush"))[idx]);
    System.out.println("  comprad=" + (double)((float[]) getField(cd, "comprad"))[idx]);
    System.out.println("  simag=" + (double)((float[]) getField(cd, "simag"))[idx]);
    System.out.println("  dishandle=" + (double)((float[]) getField(cd, "dishandle"))[idx]);
    System.out.println("  createdby=" + ((String[]) getField(cd, "createdby"))[idx - 16]);
    System.out.println("  publish=" + ((int[]) getField(cd, "publish"))[idx - 16]);
    System.out.println("  enginsignature=" + ((int[]) getField(cd, "enginsignature"))[idx]);
  }
}
