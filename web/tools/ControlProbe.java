package js.tools;

import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Arrays;

public class ControlProbe {
    public static void main(String[] args) throws Exception {
        Class<?> mediumClass = Class.forName("Medium");
        Object mediumObj = mediumClass.getDeclaredConstructor().newInstance();

        Class<?> controlClass = Class.forName("Control");
        Constructor<?> controlCtor = controlClass.getDeclaredConstructor(mediumClass);
        controlCtor.setAccessible(true);
        Object controlObj = controlCtor.newInstance(mediumObj);

        Class<?> checkPointsClass = Class.forName("CheckPoints");
        Object cpObj = checkPointsClass.getDeclaredConstructor().newInstance();

        Field unsafeField = sun.misc.Unsafe.class.getDeclaredField("theUnsafe");
        unsafeField.setAccessible(true);
        sun.misc.Unsafe unsafe = (sun.misc.Unsafe) unsafeField.get(null);

        Class<?> madClass = Class.forName("Mad");
        Object madObj = unsafe.allocateInstance(madClass);

        Class<?> carDefineClass = Class.forName("CarDefine");
        Object cdObj = unsafe.allocateInstance(carDefineClass);
        setField(cdObj, "maxmag", new int[16]);
        setField(cdObj, "swits", new int[16][16]);

        Class<?> contOClass = Class.forName("ContO");
        Object contOObj = unsafe.allocateInstance(contOClass);

        Class<?> trackersClass = Class.forName("Trackers");
        Object trackersObj = trackersClass.getDeclaredConstructor().newInstance();

        Method preformMethod = controlClass.getDeclaredMethod("preform", madClass, contOClass, checkPointsClass, trackersClass);
        preformMethod.setAccessible(true);

        setField(cpObj, "stage", 1);
        setField(cpObj, "pos", new int[]{ 0, 1, 2, 3, 4, 5, 6 });
        setField(cpObj, "clear", new int[]{ 0, 0, 0, 0, 0, 0, 0 });
        setField(cpObj, "opx", new int[]{ 0, 1000, 2000, 3000, 4000, 5000, 6000 });
        setField(cpObj, "opz", new int[]{ 0, 1000, 2000, 3000, 4000, 5000, 6000 });
        setField(cpObj, "typ", new int[]{ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0 });
        setField(cpObj, "fn", 2);
        setField(cpObj, "n", 10);
        setField(cpObj, "nsp", 4);
        setField(cpObj, "fx", new int[]{ 1000, 2000 });
        setField(cpObj, "fz", new int[]{ 3000, 4000 });
        setField(cpObj, "x", new int[]{ 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000 });
        setField(cpObj, "z", new int[]{ 150, 250, 350, 450, 550, 650, 750, 850, 950, 1050 });

        setField(madObj, "cd", cdObj);
        setField(madObj, "dest", false);
        setField(madObj, "mtouch", true);
        setField(madObj, "im", 1);
        setField(madObj, "power", 90.0f);
        setField(madObj, "point", 0);
        setField(madObj, "scy", new float[]{ 0.0f, 0.0f, 0.0f, 0.0f });

        setField(contOObj, "x", 500);
        setField(contOObj, "z", 500);
        setField(contOObj, "xz", 45);

        setField(controlObj, "stcnt", 10);
        setField(controlObj, "statusque", 5);

        preformMethod.invoke(controlObj, madObj, contOObj, cpObj, trackersObj);

        Field[] fields = controlClass.getDeclaredFields();
        for (Field f : fields) {
            if (f.getName().equals("m")) continue;
            f.setAccessible(true);
            Object val = f.get(controlObj);
            if (val != null && val.getClass().isArray()) {
                if (val instanceof int[]) System.out.println(f.getName() + "=" + Arrays.toString((int[])val));
                else if (val instanceof float[]) System.out.println(f.getName() + "=" + Arrays.toString((float[])val));
                else if (val instanceof boolean[]) System.out.println(f.getName() + "=" + Arrays.toString((boolean[])val));
            } else {
                System.out.println(f.getName() + "=" + val);
            }
        }
    }

    private static void setField(Object obj, String fieldName, Object value) throws Exception {
        Field f = findField(obj.getClass(), fieldName);
        f.setAccessible(true);
        f.set(obj, value);
    }

    private static Field findField(Class<?> cls, String name) {
        while (cls != null) {
            try {
                return cls.getDeclaredField(name);
            } catch (NoSuchFieldException e) {
                cls = cls.getSuperclass();
            }
        }
        return null;
    }
}
