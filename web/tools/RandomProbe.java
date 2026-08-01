import java.util.Random;
public class RandomProbe {
  public static void main(String[] a){
    // The exact seed shape Medium.newpolys uses: (mgen + cgrnd sum) * 1671
    long seed = (99406 + 205 + 200 + 200) * 1671L;
    Random r = new Random(seed);
    System.out.println("seed=" + seed);
    for (int i=0;i<5;i++) System.out.println("nextDouble=" + r.nextDouble());
    for (int i=0;i<3;i++) System.out.println("nextInt=" + r.nextInt());
    for (int i=0;i<3;i++) System.out.println("nextInt(100)=" + r.nextInt(100));
    System.out.println("nextFloat=" + r.nextFloat());
    System.out.println("nextBoolean=" + r.nextBoolean());
    Random r2 = new Random(0);
    System.out.println("seed0 first=" + r2.nextDouble());
  }
}
