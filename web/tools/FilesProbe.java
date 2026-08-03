package tools;

import java.lang.reflect.*;
import java.io.*;
import java.util.Arrays;
import sun.misc.Unsafe;

public class FilesProbe {
    private static Object cm;
    private static Class<?> cmClass;
    private static Unsafe unsafe;

    public static void main(String[] args) throws Exception {
        cmClass = Class.forName("CarMaker");
        Field unsafeField = Unsafe.class.getDeclaredField("theUnsafe");
        unsafeField.setAccessible(true);
        unsafe = (Unsafe) unsafeField.get(null);
        cm = unsafe.allocateInstance(cmClass);

        System.out.println("=== 1. getvalue ===");
        testGetValue("stat", "stat(180,160,140,120,100)", 0);
        testGetValue("stat", "stat(180,160,140,120,100)", 4);
        testGetValue("stat", "stat(250,-40,15,18,99)", 1);
        testGetValue("physics", "physics(10,20,30,40,50,60,70,80,90,100,110,120,130,140,150)", 14);
        testGetValue("handling", "handling(-12345)", 0);
        testGetValue("test", "test(99999999)", 0);
        testGetValue("test", "test(-2147483648)", 0);
        testGetValue("stat", "stat(invalid)", 0);

        System.out.println("\n=== 2. getSvalue ===");
        testGetSvalue("stat", "stat(abc,def,ghi)", 0);
        testGetSvalue("stat", "stat(abc,def,ghi)", 1);
        testGetSvalue("stat", "stat(abc,def,ghi)", 2);
        testGetSvalue("car", "car(My Super Car,v1.0)", 0);
        testGetSvalue("car", "car(My Super Car,v1.0)", 1);

        System.out.println("\n=== 3. servervalue ===");
        testServerValue("100|200|-300|400", 0);
        testServerValue("100|200|-300|400", 2);
        testServerValue("100|200|-300|400", 5);
        testServerValue("|||", 1);
        testServerValue("abc", 0);

        System.out.println("\n=== 4. serverSvalue ===");
        testServerSvalue("alpha|beta|gamma", 0);
        testServerSvalue("alpha|beta|gamma", 1);
        testServerSvalue("alpha|beta|gamma", 2);
        testServerSvalue("alpha|beta|gamma", 5);

        System.out.println("\n=== 5. objvalue ===");
        testObjValue("<p 10 20 30>", 0, false, false);
        testObjValue("<p 10 20 30>", 1, false, false);
        testObjValue("<p 10 20 30>", 2, false, false);
        testObjValue("<p -10/-20/30>", 0, false, false);
        testObjValue("<p 50 60>", 0, true, false); // multf10 = true
        testObjValue("<p -5.5 10>", 0, true, false); // multf10 = true, negative float
        testObjValue("<p 1 2 3>", 0, false, true); // objfacend test
        testObjValue("<p 12.7 45.3>", 0, false, false);

        System.out.println("\n=== 6. loadsettings / savesettings logic ===");
        testSettings();
    }

    private static void testGetValue(String s, String s2, int n) {
        try {
            Method m = cmClass.getDeclaredMethod("getvalue", String.class, String.class, int.class);
            m.setAccessible(true);
            int res = (int) m.invoke(cm, s, s2, n);
            System.out.println("getvalue(" + s + ", " + s2 + ", " + n + ") = " + res);
        } catch (InvocationTargetException e) {
            System.out.println("getvalue(" + s + ", " + s2 + ", " + n + ") THREW: " + e.getCause().getClass().getName());
        } catch (Exception e) {
            System.out.println("getvalue(" + s + ", " + s2 + ", " + n + ") THREW: " + e);
        }
    }

    private static void testGetSvalue(String s, String s2, int n) {
        try {
            Method m = cmClass.getDeclaredMethod("getSvalue", String.class, String.class, int.class);
            m.setAccessible(true);
            String res = (String) m.invoke(cm, s, s2, n);
            System.out.println("getSvalue(" + s + ", " + s2 + ", " + n + ") = \"" + res + "\"");
        } catch (Exception e) {
            System.out.println("getSvalue THREW: " + e);
        }
    }

    private static void testServerValue(String s, int n) {
        try {
            Method m = cmClass.getDeclaredMethod("servervalue", String.class, int.class);
            m.setAccessible(true);
            int res = (int) m.invoke(cm, s, n);
            System.out.println("servervalue(" + s + ", " + n + ") = " + res);
        } catch (Exception e) {
            System.out.println("servervalue THREW: " + e);
        }
    }

    private static void testServerSvalue(String s, int n) {
        try {
            Method m = cmClass.getDeclaredMethod("serverSvalue", String.class, int.class);
            m.setAccessible(true);
            String res = (String) m.invoke(cm, s, n);
            System.out.println("serverSvalue(" + s + ", " + n + ") = \"" + res + "\"");
        } catch (Exception e) {
            System.out.println("serverSvalue THREW: " + e);
        }
    }

    private static void testObjValue(String s, int n, boolean multf10, boolean initialObjfacend) {
        try {
            Field multf10Field = cmClass.getDeclaredField("multf10");
            multf10Field.setAccessible(true);
            multf10Field.setBoolean(cm, multf10);

            Field objfacendField = cmClass.getDeclaredField("objfacend");
            objfacendField.setAccessible(true);
            objfacendField.setBoolean(cm, initialObjfacend);

            Method m = cmClass.getDeclaredMethod("objvalue", String.class, int.class);
            m.setAccessible(true);
            int res = (int) m.invoke(cm, s, n);
            boolean end = objfacendField.getBoolean(cm);
            System.out.println("objvalue(" + s + ", " + n + ", multf10=" + multf10 + ") = " + res + " (objfacend=" + end + ")");
        } catch (Exception e) {
            System.out.println("objvalue THREW: " + e);
        }
    }

    private static void testSettings() throws Exception {
        Field scarF = cmClass.getDeclaredField("scar"); scarF.setAccessible(true);
        Field carnameF = cmClass.getDeclaredField("carname"); carnameF.setAccessible(true);
        Field suserF = cmClass.getDeclaredField("suser"); suserF.setAccessible(true);
        Field sfontF = cmClass.getDeclaredField("sfont"); sfontF.setAccessible(true);
        Field cfontF = cmClass.getDeclaredField("cfont"); cfontF.setAccessible(true);
        Field sthmF = cmClass.getDeclaredField("sthm"); sthmF.setAccessible(true);
        Field cthmF = cmClass.getDeclaredField("cthm"); cthmF.setAccessible(true);

        scarF.set(cm, "OldCar");
        carnameF.set(cm, "NewCar");
        suserF.set(cm, "Player1");
        sfontF.set(cm, "Monospaced");
        cfontF.set(cm, "SansSerif");
        sthmF.setInt(cm, 1);
        cthmF.setInt(cm, 2);

        System.out.println("Settings state before save: scar=" + scarF.get(cm) + ", carname=" + carnameF.get(cm) + ", cthm=" + cthmF.getInt(cm));
    }
}
