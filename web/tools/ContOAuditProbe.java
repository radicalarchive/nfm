import java.lang.reflect.Field;
import java.lang.reflect.Method;

/**
 * Probe created during audit of ContO.js vs ContO.java.
 * Verifies Case B compound assignment on wh and int32 wrapping on dist sum of squares.
 */
public class ContOAuditProbe {
    public static void main(String[] args) throws Exception {
        Class<?> mediumClass = Class.forName("Medium");
        Class<?> trackersClass = Class.forName("Trackers");
        Class<?> contoClass = Class.forName("ContO");

        Object m = mediumClass.getDeclaredConstructor().newInstance();
        Object t = trackersClass.getDeclaredConstructor().newInstance();

        Field loadnewField = mediumClass.getDeclaredField("loadnew");
        loadnewField.setAccessible(true);
        loadnewField.set(m, true);

        // Model line with float expr resulting in -10.95
        String modelText = "w(-10, 0, 10, 0, 10, -10.95)\n";
        byte[] buf = modelText.getBytes("ISO-8859-1");

        Object c = contoClass.getDeclaredConstructor(byte[].class, mediumClass, trackersClass)
                             .newInstance(buf, m, t);

        Field whField = contoClass.getDeclaredField("wh");
        whField.setAccessible(true);
        System.out.println("Java wh result: " + whField.get(c)); // Expected: -10

        // Large coordinates to trigger int32 overflow in dist
        Field mxField = mediumClass.getDeclaredField("x"); mxField.setAccessible(true); mxField.set(m, 50000);
        Field mzField = mediumClass.getDeclaredField("z"); mzField.setAccessible(true); mzField.set(m, 50000);
        
        Field shadowField = contoClass.getDeclaredField("shadow"); shadowField.setAccessible(true); shadowField.set(c, true);
        Field xField = contoClass.getDeclaredField("x"); xField.setAccessible(true); xField.set(c, 0);
        Field yField = contoClass.getDeclaredField("y"); yField.setAccessible(true); yField.set(c, 0);
        Field zField = contoClass.getDeclaredField("z"); zField.setAccessible(true); zField.set(c, 0);

        Method dMethod = contoClass.getDeclaredMethod("d", java.awt.Graphics2D.class);
        dMethod.setAccessible(true);
        dMethod.invoke(c, (Object) null);

        Field distField = contoClass.getDeclaredField("dist");
        distField.setAccessible(true);
        System.out.println("Java dist result: " + distField.get(c)); // Expected: 162
    }
}
