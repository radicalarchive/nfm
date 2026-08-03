package tools;

import java.awt.Event;
import java.awt.Graphics;
import java.awt.TextField;
import java.awt.TextArea;
import java.awt.event.ActionEvent;
import java.awt.image.BufferedImage;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import sun.misc.Unsafe;

public class InputProbe {
    private static Object cm;
    private static Class<?> cmClass;
    private static Unsafe unsafe;

    private static void setField(Object obj, String name, Object val) throws Exception {
        Field f = obj.getClass().getDeclaredField(name);
        f.setAccessible(true);
        f.set(obj, val);
    }

    private static Object getField(Object obj, String name) throws Exception {
        Field f = obj.getClass().getDeclaredField(name);
        f.setAccessible(true);
        return f.get(obj);
    }

    private static void setCmField(String name, Object val) throws Exception {
        Field f = cmClass.getDeclaredField(name);
        f.setAccessible(true);
        f.set(cm, val);
    }

    private static Object getCmField(String name) throws Exception {
        Field f = cmClass.getDeclaredField(name);
        f.setAccessible(true);
        return f.get(cm);
    }

    private static Method getMethod(String name, Class<?>... paramTypes) throws Exception {
        Method m = cmClass.getDeclaredMethod(name, paramTypes);
        m.setAccessible(true);
        return m;
    }

    private static void setTextComp(Object comp, String text, int selStart, int selEnd) throws Exception {
        Field textF = java.awt.TextComponent.class.getDeclaredField("text");
        textF.setAccessible(true);
        textF.set(comp, text);

        Field selStartF = java.awt.TextComponent.class.getDeclaredField("selectionStart");
        selStartF.setAccessible(true);
        selStartF.set(comp, selStart);

        Field selEndF = java.awt.TextComponent.class.getDeclaredField("selectionEnd");
        selEndF.setAccessible(true);
        selEndF.set(comp, selEnd);
    }

    public static void main(String[] args) throws Exception {
        cmClass = Class.forName("CarMaker");
        Field unsafeField = Unsafe.class.getDeclaredField("theUnsafe");
        unsafeField.setAccessible(true);
        unsafe = (Unsafe) unsafeField.get(null);
        cm = unsafe.allocateInstance(cmClass);

        System.out.println("=== 1. paint / update ===");
        BufferedImage img = new BufferedImage(100, 100, BufferedImage.TYPE_INT_ARGB);
        Graphics g = img.getGraphics();
        setCmField("offImage", img);

        Field widthField = java.awt.Component.class.getDeclaredField("width");
        widthField.setAccessible(true);
        widthField.set(cm, 1600);

        Field heightField = java.awt.Component.class.getDeclaredField("height");
        heightField.setAccessible(true);
        heightField.set(cm, 1200);

        Method paintM = getMethod("paint", Graphics.class);
        paintM.invoke(cm, g);
        System.out.println("paint(1600, 1200): apx=" + getCmField("apx") + ", apy=" + getCmField("apy"));

        widthField.set(cm, -2000000000);
        heightField.set(cm, -2000000000);
        Method updateM = getMethod("update", Graphics.class);
        updateM.invoke(cm, g);
        System.out.println("update(-2000000000, -2000000000): apx=" + getCmField("apx") + ", apy=" + getCmField("apy"));

        System.out.println("\n=== 2. mouseUp ===");
        Method mouseUpM = getMethod("mouseUp", Event.class, int.class, int.class);
        setCmField("apx", 450);
        setCmField("apy", 325);
        setCmField("waso", true);
        setCmField("mouses", 0);
        setCmField("mousdr", true);
        setCmField("onbtgame", false);

        Boolean ret1 = (Boolean) mouseUpM.invoke(cm, null, 500, 400);
        System.out.println("mouseUp waso=true: xm=" + getCmField("xm") + ", ym=" + getCmField("ym") + ", waso=" + getCmField("waso") + ", mouses=" + getCmField("mouses") + ", mousdr=" + getCmField("mousdr") + ", ret=" + ret1);

        setCmField("waso", false);
        Boolean ret2 = (Boolean) mouseUpM.invoke(cm, null, -1000000000, -1000000000);
        System.out.println("mouseUp overflow: xm=" + getCmField("xm") + ", ym=" + getCmField("ym") + ", waso=" + getCmField("waso") + ", mouses=" + getCmField("mouses") + ", mousdr=" + getCmField("mousdr") + ", ret=" + ret2);

        System.out.println("\n=== 3. mouseDown ===");
        Method mouseDownM = getMethod("mouseDown", Event.class, int.class, int.class);
        setCmField("tab", 0);
        setCmField("apx", 100);
        setCmField("apy", 50);

        Boolean ret3 = (Boolean) mouseDownM.invoke(cm, null, 250, 350);
        System.out.println("mouseDown tab=0: xm=" + getCmField("xm") + ", ym=" + getCmField("ym") + ", mouses=" + getCmField("mouses") + ", mousdr=" + getCmField("mousdr") + ", ret=" + ret3);

        System.out.println("\n=== 4. mouseMove ===");
        Method mouseMoveM = getMethod("mouseMove", Event.class, int.class, int.class);
        setCmField("apx", 0);
        setCmField("apy", 0);
        setCmField("onbtgame", false);

        Boolean ret4 = (Boolean) mouseMoveM.invoke(cm, null, 600, 10);
        System.out.println("mouseMove in btn: onbtgame=" + getCmField("onbtgame") + ", ret=" + ret4);

        Boolean ret5 = (Boolean) mouseMoveM.invoke(cm, null, 100, 100);
        System.out.println("mouseMove out btn: onbtgame=" + getCmField("onbtgame") + ", ret=" + ret5);

        System.out.println("\n=== 5. mouseDrag ===");
        Method mouseDragM = getMethod("mouseDrag", Event.class, int.class, int.class);
        setCmField("apx", 10);
        setCmField("apy", 20);

        Boolean ret6 = (Boolean) mouseDragM.invoke(cm, null, -2000000000, 2000000000);
        System.out.println("mouseDrag overflow: xm=" + getCmField("xm") + ", ym=" + getCmField("ym") + ", mousdr=" + getCmField("mousdr") + ", ret=" + ret6);

        System.out.println("\n=== 6. lostFocus / gotFocus ===");
        Method lostFocusM = getMethod("lostFocus", Event.class, Object.class);
        Method gotFocusM = getMethod("gotFocus", Event.class, Object.class);

        setCmField("focuson", true);
        Boolean ret7 = (Boolean) lostFocusM.invoke(cm, null, null);
        System.out.println("lostFocus: focuson=" + getCmField("focuson") + ", ret=" + ret7);

        Boolean ret8 = (Boolean) gotFocusM.invoke(cm, null, null);
        System.out.println("gotFocus: focuson=" + getCmField("focuson") + ", ret=" + ret8);

        System.out.println("\n=== 7. keyDown / keyUp ===");
        Method keyDownM = getMethod("keyDown", Event.class, int.class);
        Method keyUpM = getMethod("keyUp", Event.class, int.class);

        setCmField("focuson", true);
        keyDownM.invoke(cm, null, 87);
        keyDownM.invoke(cm, null, 1006);
        System.out.println("keyDown 87 & 1006: in=" + getCmField("in") + ", left=" + getCmField("left"));

        keyUpM.invoke(cm, null, 97);
        keyUpM.invoke(cm, null, 1006);
        System.out.println("keyUp 97 & 1006: in=" + getCmField("in") + ", left=" + getCmField("left"));

        setCmField("in", true);
        keyUpM.invoke(cm, null, 87);
        System.out.println("keyUp 87 (unhandled): in=" + getCmField("in"));

        System.out.println("\n=== 8. actionPerformed ===");
        Method actionPerformedM = getMethod("actionPerformed", ActionEvent.class);
        TextField[] wv = new TextField[16];
        for (int i = 0; i < 16; i++) {
            wv[i] = (TextField) unsafe.allocateInstance(TextField.class);
            setTextComp(wv[i], "field" + i, 0, 0);
        }
        setCmField("wv", wv);

        TextField srch = (TextField) unsafe.allocateInstance(TextField.class);
        setTextComp(srch, "search_text", 0, 0);
        setCmField("srch", srch);

        TextField rplc = (TextField) unsafe.allocateInstance(TextField.class);
        setTextComp(rplc, "replace_text", 0, 0);
        setCmField("rplc", rplc);

        TextArea editor = (TextArea) unsafe.allocateInstance(TextArea.class);
        setTextComp(editor, "editor_content", 0, 0);
        setCmField("editor", editor);

        Class<?> madnessClass = Class.forName("Madness");
        Field textidField = madnessClass.getDeclaredField("textid");
        textidField.setAccessible(true);

        textidField.setInt(null, 0);
        setTextComp(wv[0], "Hello World", 0, 5);

        ActionEvent cutEvt = new ActionEvent(wv[0], ActionEvent.ACTION_PERFORMED, "Cut");
        actionPerformedM.invoke(cm, cutEvt);
        System.out.println("actionPerformed Cut wv[0]: wv[0]=" + wv[0].getText());

        setTextComp(wv[0], wv[0].getText(), 0, 0);
        ActionEvent pasteEvt = new ActionEvent(wv[0], ActionEvent.ACTION_PERFORMED, "Paste");
        actionPerformedM.invoke(cm, pasteEvt);
        System.out.println("actionPerformed Paste wv[0]: wv[0]=" + wv[0].getText());

        ActionEvent selectAllEvt = new ActionEvent(wv[0], ActionEvent.ACTION_PERFORMED, "Select All");
        actionPerformedM.invoke(cm, selectAllEvt);
        System.out.println("actionPerformed Select All wv[0]: selStart=" + wv[0].getSelectionStart() + ", selEnd=" + wv[0].getSelectionEnd());

        textidField.setInt(null, 18);
        setTextComp(editor, "Line1\nLine2\nLine3", 6, 11);
        ActionEvent cutEditorEvt = new ActionEvent(editor, ActionEvent.ACTION_PERFORMED, "Cut");
        actionPerformedM.invoke(cm, cutEditorEvt);
        System.out.println("actionPerformed Cut editor: editor=" + editor.getText().replace("\n", "\\n"));

        setTextComp(editor, editor.getText(), 6, 6);
        ActionEvent pasteEditorEvt = new ActionEvent(editor, ActionEvent.ACTION_PERFORMED, "Paste");
        actionPerformedM.invoke(cm, pasteEditorEvt);
        System.out.println("actionPerformed Paste editor: editor=" + editor.getText().replace("\n", "\\n"));
    }
}
