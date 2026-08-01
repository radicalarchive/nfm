// Drives the REAL Medium.class from Game.jar and prints the state the JS port
// must reproduce. Reflection is used because the fields are package-private.
import java.lang.reflect.*;

public class MedProbe {
    static Object m;
    static int[] ia(String f) throws Exception { return (int[]) get(f); }
    static Object get(String f) throws Exception {
        Field x = m.getClass().getDeclaredField(f); x.setAccessible(true); return x.get(m);
    }
    static void set(String f, Object v) throws Exception {
        Field x = m.getClass().getDeclaredField(f); x.setAccessible(true); x.set(m, v);
    }
    static void call(String n, Class<?>[] t, Object... a) throws Exception {
        Method x = m.getClass().getDeclaredMethod(n, t); x.setAccessible(true); x.invoke(m, a);
    }
    static String s(int[] a) {
        StringBuilder b = new StringBuilder();
        for (int i=0;i<a.length;i++){ if(i>0) b.append(','); b.append(a[i]); }
        return b.toString();
    }
    static Class<?>[] I3 = {int.class,int.class,int.class};
    static Class<?>[] I4 = {int.class,int.class,int.class,int.class};
    static Class<?>[] I5 = {int.class,int.class,int.class,int.class,int.class};

    public static void main(String[] args) throws Exception {
        m = Class.forName("Medium").getDeclaredConstructor().newInstance();
        // Stage 1's header, in the order loadstage applies it.
        call("setsnap", I3, -5,-5,20);
        call("setsky",  I3, 207,232,255);
        call("setgrnd", I3, 185,210,205);
        call("setexture", I4, 41,119,204,20);
        call("setfade", I3, 198,219,224);
        call("fadfrom", new Class<?>[]{int.class}, 5000);
        call("setcloads", I5, 255,255,255,3,-1062);
        System.out.println("csky " + s(ia("csky")));
        System.out.println("cgrnd " + s(ia("cgrnd")));
        System.out.println("cpol " + s(ia("cpol")));
        System.out.println("crgrnd " + s(ia("crgrnd")));
        System.out.println("cfade " + s(ia("cfade")));
        System.out.println("clds " + s(ia("clds")));
        System.out.println("fade " + s(ia("fade")));
        System.out.println("darksky " + get("darksky"));

        // Deterministic generators: pin mgen so the seeded Random matches.
        set("mgen", 99406);
        call("newmountains", I4, -20000, 20000, -20000, 20000);
        System.out.println("nmt " + get("nmt"));
        int[] nmv = ia("nmv");
        System.out.println("nmv0 " + nmv[0]);
        int[][] mtx = (int[][]) get("mtx");
        int[][] mty = (int[][]) get("mty");
        System.out.println("mtx00 " + mtx[0][0] + " mty00 " + mty[0][0]);
        System.out.println("mtx0 " + s(mtx[0]));
        System.out.println("mty0 " + s(mty[0]));
        System.out.println("mrd " + s(ia("mrd")));

        call("newpolys", new Class<?>[]{int.class,int.class,int.class,int.class,
             Class.forName("Trackers"), int.class}, 0, 20000, 0, 20000, null, 99406);
        System.out.println("nrw " + get("nrw") + " ncl " + get("ncl"));
        int[] cgpx = ia("cgpx"), cgpz = ia("cgpz"), pmx = ia("pmx");
        System.out.println("cgpx012 " + cgpx[0] + "," + cgpx[1] + "," + cgpx[2]);
        System.out.println("cgpz012 " + cgpz[0] + "," + cgpz[1] + "," + cgpz[2]);
        System.out.println("pmx012 " + pmx[0] + "," + pmx[1] + "," + pmx[2]);
        int[][] ogpx = (int[][]) get("ogpx");
        System.out.println("ogpx0 " + s(ogpx[0]));
        float[] pcv = (float[]) get("pcv");
        System.out.println("pcv0 " + pcv[0] + " pcv1 " + pcv[1]);
    }
}
