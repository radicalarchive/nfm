import java.lang.reflect.Field;
import java.lang.reflect.Method;
import sun.misc.Unsafe;

public class RecordProbe {
    public static void main(String[] args) throws Exception {
        System.out.println("--- RecordProbe ---");

        Field unsafeField = Unsafe.class.getDeclaredField("theUnsafe");
        unsafeField.setAccessible(true);
        Unsafe unsafe = (Unsafe) unsafeField.get(null);

        Class<?> mediumClass = Class.forName("Medium");
        Object medium = unsafe.allocateInstance(mediumClass);

        Class<?> recordClass = Class.forName("Record");
        Object record = recordClass.getDeclaredConstructor(mediumClass).newInstance(medium);

        // Initialize Medium fields for deterministic test
        Field mSinF = mediumClass.getDeclaredField("tsin"); mSinF.setAccessible(true);
        float[] sinArr = new float[360];
        for (int i = 0; i < 360; i++) sinArr[i] = (float) Math.sin(i * 0.017453292519943295);
        mSinF.set(medium, sinArr);

        Field mCosF = mediumClass.getDeclaredField("tcos"); mCosF.setAccessible(true);
        float[] cosArr = new float[360];
        for (int i = 0; i < 360; i++) cosArr[i] = (float) Math.cos(i * 0.017453292519943295);
        mCosF.set(medium, cosArr);

        Field mRandF = mediumClass.getDeclaredField("rand"); mRandF.setAccessible(true);
        mRandF.set(medium, new int[]{5, 5, 5});

        Field mDiupF = mediumClass.getDeclaredField("diup"); mDiupF.setAccessible(true);
        mDiupF.set(medium, new boolean[]{true, true, true});

        Field mCntrnF = mediumClass.getDeclaredField("cntrn"); mCntrnF.setAccessible(true);
        mCntrnF.set(medium, 20);

        Field mTrnF = mediumClass.getDeclaredField("trn"); mTrnF.setAccessible(true);
        mTrnF.set(medium, 0);

        Field mRecF = recordClass.getDeclaredField("m"); mRecF.setAccessible(true); mRecF.set(record, medium);

        Class<?> contOClass = Class.forName("ContO");
        Object contO = unsafe.allocateInstance(contOClass);
        Class<?> planeClass = Class.forName("Plane");
        Object plane = unsafe.allocateInstance(planeClass);

        Field pn = planeClass.getDeclaredField("n"); pn.setAccessible(true); pn.set(plane, 2);
        Field pox = planeClass.getDeclaredField("ox"); pox.setAccessible(true); pox.set(plane, new int[]{105, 150});
        Field poz = planeClass.getDeclaredField("oz"); poz.setAccessible(true); poz.set(plane, new int[]{505, 550});
        Field poy = planeClass.getDeclaredField("oy"); poy.setAccessible(true); poy.set(plane, new int[]{10, 20});
        Field pc = planeClass.getDeclaredField("c"); pc.setAccessible(true); pc.set(plane, new int[]{200, 100, 50});
        Field phsb = planeClass.getDeclaredField("hsb"); phsb.setAccessible(true); phsb.set(plane, new float[]{0.1f, 0.5f, 0.8f});
        Field pbfase = planeClass.getDeclaredField("bfase"); pbfase.setAccessible(true); pbfase.set(plane, 35);
        Field pwz = planeClass.getDeclaredField("wz"); pwz.setAccessible(true); pwz.set(plane, 0);

        Field pnpl = contOClass.getDeclaredField("npl"); pnpl.setAccessible(true); pnpl.set(contO, 1);
        Field pp = contOClass.getDeclaredField("p"); pp.setAccessible(true);
        Object planesArray = java.lang.reflect.Array.newInstance(planeClass, 1);
        java.lang.reflect.Array.set(planesArray, 0, plane);
        pp.set(contO, planesArray);

        Field pkeyx = contOClass.getDeclaredField("keyx"); pkeyx.setAccessible(true); pkeyx.set(contO, new int[]{100, 200, 300, 400});
        Field pkeyz = contOClass.getDeclaredField("keyz"); pkeyz.setAccessible(true); pkeyz.set(contO, new int[]{500, 600, 700, 800});
        Field pzy = contOClass.getDeclaredField("zy"); pzy.setAccessible(true); pzy.set(contO, 180);
        Field pxy = contOClass.getDeclaredField("xy"); pxy.setAccessible(true); pxy.set(contO, 45);

        Class<?> madClass = Class.forName("Mad");
        Object mad = unsafe.allocateInstance(madClass);
        Class<?> carDefineClass = Class.forName("CarDefine");
        Object cd = unsafe.allocateInstance(carDefineClass);
        Field madCd = madClass.getDeclaredField("cd"); madCd.setAccessible(true); madCd.set(mad, cd);
        Field madCn = madClass.getDeclaredField("cn"); madCn.setAccessible(true); madCn.set(mad, 0);
        Field madIm = madClass.getDeclaredField("im"); madIm.setAccessible(true); madIm.set(mad, 0);

        Field cdClrad = carDefineClass.getDeclaredField("clrad"); cdClrad.setAccessible(true); cdClrad.set(cd, new int[]{1000000});
        Field cdFlipy = carDefineClass.getDeclaredField("flipy"); cdFlipy.setAccessible(true); cdFlipy.set(cd, new int[]{0});
        Field cdMsquash = carDefineClass.getDeclaredField("msquash"); cdMsquash.setAccessible(true); cdMsquash.set(cd, new int[]{100});

        Method regyMethod = recordClass.getDeclaredMethod("regy", int.class, float.class, boolean.class, contOClass, madClass);
        regyMethod.setAccessible(true);
        regyMethod.invoke(record, 0, 150.0f, true, contO, mad);

        System.out.println("after_regy_bfase: " + pbfase.get(plane));
    }
}
