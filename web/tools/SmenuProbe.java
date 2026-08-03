package tools;

import java.awt.Color;
import java.awt.Font;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Arrays;

public class SmenuProbe {
    public static void main(String[] args) throws Exception {
        BufferedImage img = new BufferedImage(800, 600, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = img.createGraphics();

        Class<?> smenuClass = Class.forName("Smenu");
        Object menu = smenuClass.getDeclaredConstructor(int.class).newInstance(50);

        Method add = smenuClass.getDeclaredMethod("add", Graphics2D.class, String.class);
        Method addw = smenuClass.getDeclaredMethod("addw", String.class, String.class);
        Method addstg = smenuClass.getDeclaredMethod("addstg", String.class);
        Method selectInt = smenuClass.getDeclaredMethod("select", int.class);
        Method selectStr = smenuClass.getDeclaredMethod("select", String.class);
        Method remove = smenuClass.getDeclaredMethod("remove", String.class);
        Method draw = smenuClass.getDeclaredMethod("draw", Graphics2D.class, int.class, int.class, boolean.class, int.class, boolean.class);
        Method getItem = smenuClass.getDeclaredMethod("getItem", int.class);

        // Print FontMetrics values in Java
        g.setFont(new Font("Arial", 1, 13));
        System.out.println("Java ftm.getHeight(): " + g.getFontMetrics().getHeight());
        System.out.println("Java ftm.stringWidth('Option Alpha'): " + g.getFontMetrics().stringWidth("Option Alpha"));

        // 1. Add items
        add.invoke(menu, g, "Option Alpha");
        add.invoke(menu, g, "Option Beta");
        add.invoke(menu, g, "Option Gamma");
        addw.invoke(menu, "Short Delta", "Full Delta");
        addstg.invoke(menu, "Stage Epsilon");

        printState("After Adds", menu);

        // 2. Selection & Removal
        selectStr.invoke(menu, "Option Beta");
        System.out.println("Selected Index (Str 'Option Beta'): " + getField(menu, "sel"));
        selectInt.invoke(menu, 3);
        System.out.println("Selected Index (Int 3): " + getField(menu, "sel"));
        selectInt.invoke(menu, 100);
        System.out.println("Selected Index (Int 100 out of bounds): " + getField(menu, "sel"));
        System.out.println("getItem(1): " + getItem.invoke(menu, 1));
        System.out.println("getItem(-1): '" + getItem.invoke(menu, -1) + "'");

        remove.invoke(menu, "Option Alpha");
        printState("After Remove Option Alpha", menu);

        // 3. Setup menu for draw tests
        setField(menu, "show", true);
        setField(menu, "x", 100);
        setField(menu, "y", 50);
        setField(menu, "w", 200);
        setField(menu, "h", 300);
        setField(menu, "bcol", new Color(200, 200, 200));
        setField(menu, "fcol", new Color(50, 50, 50));
        setField(menu, "alphad", true);
        setField(menu, "carsel", true);

        // Add more items so scrolling applies
        for (int i = 0; i < 15; i++) {
            add.invoke(menu, g, "Extra Item " + i);
        }

        // Test draw call 1: open the menu (hover x=150, y=60, mouse click b=true)
        boolean res1 = (boolean) draw.invoke(menu, g, 150, 60, true, 400, false);
        System.out.println("Draw 1 res: " + res1);
        printState("Draw 1 (Open trigger)", menu);

        // Test draw call 2: mouse drag inside scrollbar with negative/overflow inputs
        // (n=290, n2=120, b=true, n3=200, b2=false)
        boolean res2 = (boolean) draw.invoke(menu, g, 290, 120, true, 200, false);
        System.out.println("Draw 2 res: " + res2);
        printState("Draw 2 (Scrolling b2=false)", menu);

        // Test draw call 3: reverse mode b2=true
        setField(menu, "open", true);
        setField(menu, "revup", true);
        boolean res3 = (boolean) draw.invoke(menu, g, 290, 40, true, 200, true);
        System.out.println("Draw 3 res: " + res3);
        printState("Draw 3 (Scrolling b2=true)", menu);

        // 4. Maxl test
        Object menu2 = smenuClass.getDeclaredConstructor(int.class).newInstance(10);
        setField(menu2, "maxl", 80);
        add.invoke(menu2, g, "This is a very long string that should be truncated by maxl");
        printState("Maxl Truncation Test", menu2);
    }

    private static Object getField(Object obj, String fieldName) throws Exception {
        Field f = obj.getClass().getDeclaredField(fieldName);
        f.setAccessible(true);
        return f.get(obj);
    }

    private static void setField(Object obj, String fieldName, Object val) throws Exception {
        Field f = obj.getClass().getDeclaredField(fieldName);
        f.setAccessible(true);
        f.set(obj, val);
    }

    private static void printState(String label, Object obj) throws Exception {
        System.out.println("=== " + label + " ===");
        String[] fieldNames = {"sel", "no", "x", "y", "w", "h", "show", "open", "dis", "maxl", "rooms", "kmoused", "alphad", "revup", "carsel", "flksel", "om", "onsc", "scro", "scra"};
        for (String name : fieldNames) {
            System.out.println(name + " = " + getField(obj, name));
        }
        String[] opts = (String[]) getField(obj, "opts");
        String[] sopts = (String[]) getField(obj, "sopts");
        int no = (int) getField(obj, "no");
        System.out.println("opts = " + Arrays.toString(Arrays.copyOf(opts, no)));
        System.out.println("sopts = " + Arrays.toString(Arrays.copyOf(sopts, no)));
    }
}
