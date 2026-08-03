package tools;

import java.awt.TextArea;
import java.awt.TextField;
import java.lang.reflect.Array;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import sun.misc.Unsafe;

public class CtachmProbe {
    private static Object cm;
    private static Class<?> cmClass;
    private static Unsafe unsafe;

    static class MockTextArea extends TextArea {
        public StringBuilder text = new StringBuilder();
        public int selStart = 0;
        public int selEnd = 0;

        @Override
        public String getText() {
            return text.toString();
        }

        @Override
        public void setText(String s) {
            text = new StringBuilder(s == null ? "" : s);
            selStart = 0;
            selEnd = text.length();
        }

        @Override
        public String getSelectedText() {
            if (selStart < 0 || selEnd < selStart || selEnd > text.length()) return "";
            return text.substring(selStart, selEnd);
        }

        @Override
        public void replaceText(String str, int start, int end) {
            if (start < 0) start = 0;
            if (end > text.length()) end = text.length();
            if (start <= end) {
                text.replace(start, end, str);
            }
        }

        @Override
        public void insertText(String str, int pos) {
            if (pos < 0) pos = 0;
            if (pos > text.length()) pos = text.length();
            text.insert(pos, str);
        }

        @Override
        public void select(int start, int end) {
            this.selStart = Math.max(0, Math.min(start, text.length()));
            this.selEnd = Math.max(this.selStart, Math.min(end, text.length()));
        }

        @Override
        public int getSelectionStart() {
            return selStart;
        }

        @Override
        public int getSelectionEnd() {
            return selEnd;
        }

        @Override
        public void requestFocus() {}

        @Override
        public void hide() {}
    }

    static class MockTextField extends TextField {
        public String text = "";

        @Override
        public String getText() {
            return text;
        }

        @Override
        public void setText(String s) {
            text = s == null ? "" : s;
        }

        @Override
        public void requestFocus() {}

        @Override
        public void hide() {}
    }

    private static void setField(String name, Object val) throws Exception {
        Field f = cmClass.getDeclaredField(name);
        f.setAccessible(true);
        f.set(cm, val);
    }

    private static Object getField(String name) throws Exception {
        Field f = cmClass.getDeclaredField(name);
        f.setAccessible(true);
        return f.get(cm);
    }

    private static void invokeCtachm() throws Exception {
        Method m = cmClass.getDeclaredMethod("ctachm");
        m.setAccessible(true);
        m.invoke(cm);
    }

    public static void main(String[] args) throws Exception {
        Field unsafeField = Unsafe.class.getDeclaredField("theUnsafe");
        unsafeField.setAccessible(true);
        unsafe = (Unsafe) unsafeField.get(null);

        cmClass = Class.forName("CarMaker");
        cm = unsafe.allocateInstance(cmClass);

        MockTextArea mockEditor = (MockTextArea) unsafe.allocateInstance(MockTextArea.class);
        MockTextField mockSrch = (MockTextField) unsafe.allocateInstance(MockTextField.class);
        MockTextField mockRplc = (MockTextField) unsafe.allocateInstance(MockTextField.class);
        MockTextField mockTnick = (MockTextField) unsafe.allocateInstance(MockTextField.class);
        MockTextField mockTpass = (MockTextField) unsafe.allocateInstance(MockTextField.class);

        TextField[] wv = new TextField[16];
        for (int i = 0; i < 16; ++i) {
            wv[i] = (TextField) unsafe.allocateInstance(MockTextField.class);
        }
        setField("wv", wv);

        Class<?> mediumClass = Class.forName("Medium");
        Object medium = mediumClass.getDeclaredConstructor().newInstance();
        setField("m", medium);

        Class<?> trackersClass = Class.forName("Trackers");
        Object trackers = trackersClass.getDeclaredConstructor().newInstance();
        setField("t", trackers);

        // Smenus initialization
        Class<?> smenuClass = Class.forName("Smenu");
        Constructor<?> smenuCtor = smenuClass.getDeclaredConstructor(int.class);
        setField("slcar", smenuCtor.newInstance(2000));
        setField("fontsel", smenuCtor.newInstance(40));
        setField("ctheme", smenuCtor.newInstance(40));
        setField("compcar", smenuCtor.newInstance(40));
        setField("cls", smenuCtor.newInstance(40));
        setField("simcar", smenuCtor.newInstance(40));
        setField("engine", smenuCtor.newInstance(40));
        setField("witho", smenuCtor.newInstance(40));
        setField("pubitem", smenuCtor.newInstance(707));
        setField("pubtyp", smenuCtor.newInstance(40));

        // Common default setup
        setField("btn", 4);
        setField("bx", new int[]{100, 200, 300, 400});
        setField("by", new int[]{50, 50, 50, 50});
        setField("bw", new int[]{40, 40, 40, 40});
        setField("pessd", new boolean[]{false, false, false, false});
        setField("xm", 0);
        setField("ym", 0);
        setField("mouses", 0);
        setField("tab", 0);
        setField("sfase", 0);
        setField("dtab", 0);
        setField("editor", mockEditor);
        setField("srch", mockSrch);
        setField("rplc", mockRplc);
        setField("tnick", mockTnick);
        setField("tpass", mockTpass);
        setField("carname", "testcar");
        setField("scale", new int[]{100, 100, 100});
        setField("oscale", new int[]{100, 100, 100});
        setField("stat", new int[]{150, 150, 150, 150, 150});
        setField("rstat", new int[]{150, 150, 150, 150, 150});
        setField("phys", new int[]{50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50});
        setField("rphys", new int[]{50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50});
        setField("crash", new int[]{50, 50, 50});
        setField("rcrash", new int[]{50, 50, 50});
        setField("handling", 100);

        System.out.println("=== 1. Button Hit Test & mouses ===");
        setField("xm", 102);
        setField("ym", 52);
        setField("mouses", 1);
        invokeCtachm();
        boolean[] pessd = (boolean[]) getField("pessd");
        System.out.println("pessd[0]: " + pessd[0] + ", pessd[1]: " + pessd[1]);

        setField("xm", 201);
        setField("ym", 49);
        setField("mouses", -1);
        invokeCtachm();
        System.out.println("mouses after release: " + getField("mouses"));

        System.out.println("\n=== 2. Tab 1 Prefs Toggle ===");
        setField("tab", 1);
        setField("prefs", false);
        setField("xm", 100); setField("ym", 50); setField("mouses", -1);
        invokeCtachm();
        System.out.println("prefs after click n=0: " + getField("prefs"));

        System.out.println("\n=== 3. Tab 1 Mirror Polygon X-axis ===");
        setField("tab", 1);
        setField("mirror", true);
        setField("cntpls", 2);
        mockEditor.setText("p(100,-20,300)\nfs(150)\n");
        mockEditor.select(0, mockEditor.getText().length());
        setField("bx", new int[]{100, 200, 300, 400, 500, 600});
        setField("by", new int[]{50, 50, 50, 50, 50, 50});
        setField("bw", new int[]{40, 40, 40, 40, 40, 40});
        setField("btn", 6);
        setField("pessd", new boolean[6]);
        setField("xm", 400); setField("ym", 50); setField("mouses", -1); // n = 3
        invokeCtachm();
        System.out.println("editor mirror output:\n" + mockEditor.getText());

        System.out.println("\n=== 4. Tab 2 Subtab 2 Scale Adjustments ===");
        setField("tab", 2);
        setField("dtab", 2);
        setField("scale", new int[]{100, 100, 100});
        mockEditor.setText("ScaleX(100)\nScaleY(100)\nScaleZ(100)\n<p>");
        setField("xm", 200); setField("ym", 50); setField("mouses", -1); // n = 1 -> ScaleX += 5
        invokeCtachm();
        int[] scale = (int[]) getField("scale");
        System.out.println("scale after n=1: " + scale[0] + "," + scale[1] + "," + scale[2]);
        System.out.println("editor text after n=1:\n" + mockEditor.getText());

        System.out.println("\n=== 5. Tab 2 Subtab 2 Point Shift X+10 ===");
        setField("tab", 2);
        setField("dtab", 2);
        mockEditor.setText("p(15,-25,35)\n");
        setField("btn", 20);
        int[] bx20 = new int[20]; int[] by20 = new int[20]; int[] bw20 = new int[20];
        for (int i=0; i<20; ++i) { bx20[i] = (i+1)*50; by20[i] = 50; bw20[i] = 40; }
        setField("bx", bx20); setField("by", by20); setField("bw", bw20); setField("pessd", new boolean[20]);
        setField("xm", 600); setField("ym", 50); setField("mouses", -1); // n = 11 -> X += 10
        invokeCtachm();
        System.out.println("editor text after n=11:\n" + mockEditor.getText());

        System.out.println("\n=== 6. Tab 2 Subtab 4 Stat Balancing ===");
        setField("tab", 2);
        setField("dtab", 4);
        setField("statdef", true);
        setField("stat", new int[]{150, 150, 150, 150, 150});
        setField("xm", 50); setField("ym", 50); setField("mouses", -1); // n = 0 -> decrease stat[0]
        invokeCtachm();
        int[] stat = (int[]) getField("stat");
        System.out.println("stat after n=0: " + stat[0] + "," + stat[1] + "," + stat[2] + "," + stat[3] + "," + stat[4]);

        System.out.println("\n=== 7. Tab 2 Subtab 5 Physics Adjustment ===");
        setField("tab", 2);
        setField("dtab", 5);
        setField("pfase", 0);
        setField("phys", new int[]{50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50});
        setField("xm", 100); setField("ym", 50); setField("mouses", -1); // n = 1 -> phys[0] += 2
        invokeCtachm();
        int[] phys = (int[]) getField("phys");
        System.out.println("phys[0] after n=1: " + phys[0]);

        System.out.println("\n=== 8. Tab 2 Subtab 6 Handling Rating ===");
        setField("tab", 2);
        setField("dtab", 6);
        setField("rateh", true);
        setField("handling", 100);
        setField("xm", 50); setField("ym", 50); setField("mouses", -1); // n = 0 -> handling -= 2
        invokeCtachm();
        System.out.println("handling after n=0: " + getField("handling"));
        setField("xm", 100); setField("ym", 50); setField("mouses", -1); // n = 1 -> handling += 2
        invokeCtachm();
        System.out.println("handling after n=1: " + getField("handling"));

        System.out.println("\n=== 9. Tab 2 Polygon Color RGBtoHSB ===");
        // Construct ContO object stub
        Class<?> contOClass = Class.forName("ContO");
        Object contO = unsafe.allocateInstance(contOClass);
        Field nplField = contOClass.getDeclaredField("npl"); nplField.setAccessible(true); nplField.setInt(contO, 1);
        
        Class<?> planeClass = Class.forName("Plane");
        Object plane = unsafe.allocateInstance(planeClass);
        Field cField = planeClass.getDeclaredField("c"); cField.setAccessible(true); cField.set(plane, new int[]{200, 100, 50});
        Field hsbField = planeClass.getDeclaredField("hsb"); hsbField.setAccessible(true); hsbField.set(plane, new float[3]);
        Field grField = planeClass.getDeclaredField("gr"); grField.setAccessible(true); grField.setInt(plane, -13);
        
        Object pArray = Array.newInstance(planeClass, 1);
        Array.set(pArray, 0, plane);
        Field pField = contOClass.getDeclaredField("p"); pField.setAccessible(true); pField.set(contO, pArray);
        
        Field colokField = contOClass.getDeclaredField("colok"); colokField.setAccessible(true); colokField.setInt(contO, 2);
        
        setField("o", contO);
        setField("tab", 2);
        setField("dtab", 1);
        
        setField("xm", 150); setField("ym", 50); setField("mouses", -1); // n = 2 -> n17 = 2
        invokeCtachm();
        float[] hsbVal = (float[]) hsbField.get(plane);
        int grVal = grField.getInt(plane);
        System.out.println("plane hsb: " + hsbVal[0] + ", " + hsbVal[1] + ", " + hsbVal[2]);
        System.out.println("plane gr: " + grVal);
    }
}
