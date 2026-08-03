// Transpiled from CarMaker.java lines 2921-4351 (chunk "ctachm"), line by line.
//
// Shared state: CarMaker methods receive state object `cm` as first parameter.
// Local names kept as procyon emitted them (n, n2, b, array, array2, ...).

import { idiv, trunc, fr, i32, intArray, random, RGBtoHSB, HSBtoRGB } from '../java.js';
import { setupo, savefile, newcar, delcar, rencar, objvalue, servervalue, savesettings, checko } from './files.js';
import { regx, regz, roofsqsh } from './shape.js';
import { hidefields } from './ui.js';

function getEditorText(widget) {
  if (!widget) return '';
  if (typeof widget.getText === 'function') return widget.getText();
  return widget.text || '';
}

function setEditorText(widget, text) {
  if (!widget) return;
  if (typeof widget.setText === 'function') widget.setText(text);
  else widget.text = text;
}

function getSelectedText(editor) {
  if (!editor) return '';
  if (typeof editor.getSelectedText === 'function') return editor.getSelectedText();
  const start = getSelectionStart(editor);
  const end = getSelectionEnd(editor);
  const text = getEditorText(editor);
  return text.substring(start, end);
}

function getSelectionStart(editor) {
  if (!editor) return 0;
  if (typeof editor.getSelectionStart === 'function') return editor.getSelectionStart();
  return editor.selectionStart || 0;
}

function getSelectionEnd(editor) {
  if (!editor) return 0;
  if (typeof editor.getSelectionEnd === 'function') return editor.getSelectionEnd();
  return editor.selectionEnd !== undefined ? editor.selectionEnd : getEditorText(editor).length;
}

function selectEditorText(editor, start, end) {
  if (!editor) return;
  if (typeof editor.select === 'function') editor.select(start, end);
  else {
    editor.selectionStart = start;
    editor.selectionEnd = end;
  }
}

function insertEditorText(editor, str, pos) {
  if (!editor) return;
  if (typeof editor.insertText === 'function') {
    editor.insertText(str, pos);
    return;
  }
  const text = getEditorText(editor);
  const next = text.substring(0, pos) + str + text.substring(pos);
  setEditorText(editor, next);
}

function replaceEditorText(editor, str, start, end) {
  if (!editor) return;
  if (typeof editor.replaceText === 'function') {
    editor.replaceText(str, start, end);
    return;
  }
  const text = getEditorText(editor);
  const next = text.substring(0, start) + str + text.substring(end);
  setEditorText(editor, next);
}

function getSelectedIndex(smenu) {
  if (!smenu) return 0;
  if (typeof smenu.getSelectedIndex === 'function') return smenu.getSelectedIndex();
  return smenu.select || 0;
}

function selectSmenu(smenu, idx) {
  if (!smenu) return;
  if (typeof smenu.select === 'function') smenu.select(idx);
  else smenu.select = idx;
}

function getItemCount(smenu) {
  if (!smenu) return 0;
  if (typeof smenu.getItemCount === 'function') return smenu.getItemCount();
  return smenu.no || 0;
}

function addSmenuItem(smenu, rd, str) {
  if (!smenu) return;
  if (typeof smenu.add === 'function') smenu.add(rd, str);
}

function hideSmenu(smenu) {
  if (!smenu) return;
  smenu.hide();
}

// JOptionPane's two entry points. The shell supplies them; they are the one
// widget the editor cannot do without, since several flows branch on the
// answer.
function showMessageDialog(cm, parent, msg, title, type) {
  cm.showMessageDialog(parent, msg, title, type);
}

function showConfirmDialog(cm, parent, msg, title, type) {
  return cm.showConfirmDialog(parent, msg, title, type);
}

export function ctachm(cm) {
  let n = -1;
  for (let i = 0; i < cm.btn; ++i) {
    if (Math.abs(cm.xm - cm.bx[i]) < idiv(cm.bw[i], 2) + 12 && Math.abs(cm.ym - cm.by[i]) < 14 && cm.mouses === 1) {
      cm.pessd[i] = true;
    } else {
      cm.pessd[i] = false;
    }
    if (Math.abs(cm.xm - cm.bx[i]) < idiv(cm.bw[i], 2) + 12 && Math.abs(cm.ym - cm.by[i]) < 14 && cm.mouses === -1) {
      n = i;
    }
  }
  if (cm.mouses === -1) {
    cm.mouses = 0;
  }
  if (cm.tab === 0) {
    if (cm.sfase === 0) {
      if (n === 0) {
        cm.sfase = 1;
        n = -1;
        hidefields(cm);
      }
      if (n === 1) {
        if (cm.carname !== '') {
          setEditorText(cm.srch, cm.carname);
          cm.sfase = 2;
          n = -1;
          hidefields(cm);
        } else {
          showMessageDialog(cm, null, 'Please Select a Car to Rename!\n', 'Car Maker', 1);
        }
      }
      if (n === 2) {
        delcar(cm, cm.carname);
      }
      if (n === 3) {
        cm.sfase = 3;
        n = -1;
        hidefields(cm);
      }
    }
    if (cm.sfase === 1) {
      if (n === 0) {
        newcar(cm, getEditorText(cm.srch));
        n = -1;
      }
      if (n === 1) {
        setEditorText(cm.srch, '');
        cm.sfase = 0;
        n = -1;
        hidefields(cm);
      }
    }
    if (cm.sfase === 2) {
      if (n === 0) {
        rencar(cm, getEditorText(cm.srch));
        n = -1;
      }
      if (n === 1) {
        setEditorText(cm.srch, '');
        cm.sfase = 0;
        n = -1;
        hidefields(cm);
      }
    }
    if (cm.sfase === 3) {
      if (n === 0) {
        // TODO not ported: FileDialog desktop OBJ import
      }
      if (n === 1) {
        cm.sfase = 4;
        n = -1;
      }
      if (n === 2) {
        cm.sfase = 0;
        n = -1;
      }
    }
    if (cm.sfase === 4) {
      if (n === 0) {
        // TODO not ported: FileDialog desktop OBJ export
      }
      if (n === 1) {
        cm.sfase = 0;
        n = -1;
      }
    }
  }
  if (cm.tab === 1) {
    if (n === 0) {
      if (cm.prefs) {
        cm.prefs = false;
      } else {
        cm.prefs = true;
      }
    }
    if (n === 1 || n === 2) {
      savefile(cm);
      if (n === 2) {
        cm.tab = 2;
      }
    }
    if (!cm.mirror) {
      let b4 = false;
      if (n === 4) {
        if (cm.sls !== -1 && cm.sle !== -1 && getSelectedText(cm.editor) === getEditorText(cm.srch)) {
          replaceEditorText(cm.editor, getEditorText(cm.rplc), cm.sls, cm.sle);
          cm.sls = -1;
          cm.sle = -1;
          b4 = true;
        }
        n = 3;
      }
      if (n === 3 && getEditorText(cm.srch) !== '') {
        cm.editor.requestFocus();
        cm.sls = getEditorText(cm.editor).indexOf(getEditorText(cm.srch), getSelectionEnd(cm.editor));
        if (cm.sls !== -1) {
          cm.sle = cm.sls + getEditorText(cm.srch).length;
          selectEditorText(cm.editor, cm.sls, cm.sle);
        } else if (!b4) {
          showMessageDialog(cm, null, "Cannot find  '" + getEditorText(cm.srch) + "'  from Cursor position    ", "Car Maker", 1);
        }
      }
    } else {
      if (n === 3 || n === 4 || n === 5) {
        const string2 = "" + getSelectedText(cm.editor) + "\n";
        const s3 = "\n\n";
        let s4;
        if (cm.cntpls === 1) {
          s4 = s3 + "// Mirror of the polygon above along the ";
        } else {
          s4 = s3 + "// Mirror of the " + cm.cntpls + " polygons above along the ";
        }
        if (n === 3) {
          s4 += "X axis:";
        }
        if (n === 4) {
          s4 += "Y axis:";
        }
        if (n === 5) {
          s4 += "Z axis:";
        }
        let s5 = s4 + "\n\n";
        let n14 = 0;
        let endIndex = string2.indexOf("\n", 0);
        while (endIndex !== -1 && n14 < string2.length) {
          let str3 = string2.substring(n14, endIndex).trim();
          n14 = endIndex + 1;
          endIndex = string2.indexOf("\n", n14);
          if (str3.startsWith("fs(-")) {
            str3 = "fs(" + str3.substring(4, str3.length);
          } else if (str3.startsWith("fs(")) {
            str3 = "fs(-" + str3.substring(3, str3.length);
          }
          if (n === 3) {
            if (str3.startsWith("p(-")) {
              str3 = "p(" + str3.substring(3, str3.length);
            } else if (str3.startsWith("p(")) {
              str3 = "p(-" + str3.substring(2, str3.length);
            }
          }
          if (n === 4 && str3.startsWith("p(")) {
            const index = str3.indexOf(",", 0);
            if (index >= 0) {
              if (str3.startsWith(",-", index)) {
                str3 = "" + str3.substring(0, index) + "," + str3.substring(index + 2, str3.length);
              } else if (str3.startsWith(",", index)) {
                str3 = "" + str3.substring(0, index) + ",-" + str3.substring(index + 1, str3.length);
              }
            }
          }
          if (n === 5 && str3.startsWith("p(")) {
            const index2 = str3.indexOf(",", str3.indexOf(",", 0) + 1);
            if (index2 >= 0) {
              if (str3.startsWith(",-", index2)) {
                str3 = "" + str3.substring(0, index2) + "," + str3.substring(index2 + 2, str3.length);
              } else if (str3.startsWith(",", index2)) {
                str3 = "" + str3.substring(0, index2) + ",-" + str3.substring(index2 + 1, str3.length);
              }
            }
          }
          s5 = s5 + "" + str3 + "\n";
        }
        insertEditorText(cm.editor, s5 + "\n// End of mirror", getSelectionEnd(cm.editor));
      }
      if (n === 6) {
        cm.polynum = 0;
        let n15 = getEditorText(cm.editor).lastIndexOf("</p>", getSelectionStart(cm.editor));
        let n16 = 0;
        while (n15 >= 0) {
          if (n16 === 0) {
            n15 = getEditorText(cm.editor).lastIndexOf("<p>", n15);
            if (n15 !== -1) {
              n16 = 1;
              ++cm.polynum;
            }
          } else {
            n15 = getEditorText(cm.editor).lastIndexOf("</p>", n15);
            if (n15 !== -1) {
              n16 = 0;
            }
          }
          --n15;
        }
        cm.prflk = 0;
        cm.tab = 2;
      }
    }
    n = -1;
  }
  if (cm.tab === 2) {
    let n17 = 0;
    if (cm.dtab === 1) {
      if (cm.o.colok !== 2) {
        if (n === 0) {
          showMessageDialog(cm, null, "Car Maker will attempt now to find the first and second colors automatically.\nPlease make sure that they are the correct colors!\n\nPlease note that these are also the colors that will be editable in the multiplayer game.      ", "Car Maker", 1);
          const string3 = "" + getEditorText(cm.editor) + "\n";
          let n18 = 0;
          let endIndex2 = string3.indexOf("\n", 0);
          let n19 = 0;
          let str4 = "";
          let anObject = "";
          while (endIndex2 !== -1 && n18 < string3.length && n19 !== 2) {
            const trim = string3.substring(n18, endIndex2).trim();
            n18 = endIndex2 + 1;
            endIndex2 = string3.indexOf("\n", n18);
            if (trim.startsWith("c(")) {
              const substring = trim.substring(1, trim.indexOf(")") + 1);
              if (n19 === 1 && substring !== anObject) {
                str4 = str4 + "2ndColor" + substring + "\n\n\n";
                n19 = 2;
              }
              if (n19 !== 0) {
                continue;
              }
              anObject = substring;
              str4 = "1stColor" + substring + "\n";
              n19 = 1;
            }
          }
          if (n19 === 0) {
            str4 = "1stColor(255,0,0)\n2ndColor(0,0,255)\n\n\n";
            n19 = 2;
          }
          if (n19 === 1) {
            str4 += "2ndColor(0,0,255)\n\n\n";
          }
          const index3 = getEditorText(cm.editor).indexOf("<p>", 0);
          insertEditorText(cm.editor, str4, index3);
          selectEditorText(cm.editor, index3, index3 + str4.length - 2);
          cm.breakbond = true;
          cm.tab = 1;
        }
        n17 = 1;
      } else {
        if (n === 0) {
          cm.ofcol = "(" + cm.o.fcol[0] + "," + cm.o.fcol[1] + "," + cm.o.fcol[2] + ")";
          let index5;
          for (let index4 = index5 = getEditorText(cm.editor).indexOf(cm.ofcol, 0); index4 !== -1; index4 = getEditorText(cm.editor).indexOf(cm.ofcol, index4 + 1)) {
            replaceEditorText(cm.editor, cm.fcol, index4, index4 + cm.ofcol.length);
          }
          cm.ofcol = cm.fcol;
          selectEditorText(cm.editor, index5 - 8, index5 - 8);
          savefile(cm);
          const rgb = HSBtoRGB(cm.fhsb[0], cm.fhsb[2], cm.fhsb[1]);
          cm.o.fcol[0] = (rgb >> 16) & 0xFF;
          cm.o.fcol[1] = (rgb >> 8) & 0xFF;
          cm.o.fcol[2] = rgb & 0xFF;
        }
        if (n === 1) {
          cm.oscol = "(" + cm.o.scol[0] + "," + cm.o.scol[1] + "," + cm.o.scol[2] + ")";
          let index7;
          for (let index6 = index7 = getEditorText(cm.editor).indexOf(cm.oscol, 0); index6 !== -1; index6 = getEditorText(cm.editor).indexOf(cm.oscol, index6 + 1)) {
            replaceEditorText(cm.editor, cm.scol, index6, index6 + cm.oscol.length);
          }
          cm.oscol = cm.scol;
          selectEditorText(cm.editor, index7 - 8, index7 - 8);
          savefile(cm);
          const srgb = HSBtoRGB(cm.shsb[0], cm.shsb[2], cm.shsb[1]);
          cm.o.scol[0] = (srgb >> 16) & 0xFF;
          cm.o.scol[1] = (srgb >> 8) & 0xFF;
          cm.o.scol[2] = srgb & 0xFF;
        }
        n17 = 2;
      }
    }
    if (cm.dtab === 2) {
      if (n === 9) {
        cm.scale[0] = 100;
        cm.scale[1] = 100;
        cm.scale[2] = 100;
      }
      if (n === 0 || n === 1 || n === 6 || n === 7 || n === 9) {
        if (n === 0 || n === 6) {
          const scale = cm.scale;
          const n20 = 0;
          scale[n20] = i32(scale[n20] - 5);
        }
        if (n === 1 || n === 7) {
          const scale2 = cm.scale;
          const n21 = 0;
          scale2[n21] = i32(scale2[n21] + 5);
        }
        if (cm.scale[0] < 0) {
          cm.scale[0] = 0;
        }
        let index8 = getEditorText(cm.editor).indexOf("\nScaleX(", 0);
        if (index8 !== -1) {
          ++index8;
          const index9 = getEditorText(cm.editor).indexOf(")", index8);
          const index10 = getEditorText(cm.editor).indexOf("\n", index8);
          if (index10 > index9) {
            replaceEditorText(cm.editor, "ScaleX(" + cm.scale[0] + ")", index8, index9 + 1);
          } else {
            replaceEditorText(cm.editor, "ScaleX(" + cm.scale[0] + ")", index8, index10);
          }
        } else {
          const index11 = getEditorText(cm.editor).indexOf("<p>", 0);
          const index12 = getEditorText(cm.editor).indexOf("\nScale", 0);
          if (index12 < index11 && index12 !== -1) {
            insertEditorText(cm.editor, "\nScaleX(" + cm.scale[0] + ")", index12);
          } else {
            insertEditorText(cm.editor, "ScaleX(" + cm.scale[0] + ")\n\n\n", index11);
          }
        }
      }
      if (n === 2 || n === 3 || n === 6 || n === 7 || n === 9) {
        if (n === 2 || n === 6) {
          const scale3 = cm.scale;
          const n22 = 1;
          scale3[n22] = i32(scale3[n22] - 5);
        }
        if (n === 3 || n === 7) {
          const scale4 = cm.scale;
          const n23 = 1;
          scale4[n23] = i32(scale4[n23] + 5);
        }
        if (cm.scale[1] < 0) {
          cm.scale[1] = 0;
        }
        let index13 = getEditorText(cm.editor).indexOf("\nScaleY(", 0);
        if (index13 !== -1) {
          ++index13;
          const index14 = getEditorText(cm.editor).indexOf(")", index13);
          const index15 = getEditorText(cm.editor).indexOf("\n", index13);
          if (index15 > index14) {
            replaceEditorText(cm.editor, "ScaleY(" + cm.scale[1] + ")", index13, index14 + 1);
          } else {
            replaceEditorText(cm.editor, "ScaleY(" + cm.scale[1] + ")", index13, index15);
          }
        } else {
          const index16 = getEditorText(cm.editor).indexOf("<p>", 0);
          const index17 = getEditorText(cm.editor).indexOf("\nScale", 0);
          if (index17 < index16 && index17 !== -1) {
            insertEditorText(cm.editor, "\nScaleY(" + cm.scale[1] + ")", index17);
          } else {
            insertEditorText(cm.editor, "ScaleY(" + cm.scale[1] + ")\n\n\n", index16);
          }
        }
      }
      if (n === 4 || n === 5 || n === 6 || n === 7 || n === 9) {
        if (n === 4 || n === 6) {
          const scale5 = cm.scale;
          const n24 = 2;
          scale5[n24] = i32(scale5[n24] - 5);
        }
        if (n === 5 || n === 7) {
          const scale6 = cm.scale;
          const n25 = 2;
          scale6[n25] = i32(scale6[n25] + 5);
        }
        if (cm.scale[2] < 0) {
          cm.scale[2] = 0;
        }
        let index18 = getEditorText(cm.editor).indexOf("\nScaleZ(", 0);
        if (index18 !== -1) {
          ++index18;
          const index19 = getEditorText(cm.editor).indexOf(")", index18);
          const index20 = getEditorText(cm.editor).indexOf("\n", index18);
          if (index20 > index19) {
            replaceEditorText(cm.editor, "ScaleZ(" + cm.scale[2] + ")", index18, index19 + 1);
          } else {
            replaceEditorText(cm.editor, "ScaleZ(" + cm.scale[2] + ")", index18, index20);
          }
        } else {
          const index21 = getEditorText(cm.editor).indexOf("<p>", 0);
          const index22 = getEditorText(cm.editor).indexOf("\nScale", 0);
          if (index22 < index21 && index22 !== -1) {
            insertEditorText(cm.editor, "\nScaleZ(" + cm.scale[2] + ")", index22);
          } else {
            insertEditorText(cm.editor, "ScaleZ(" + cm.scale[2] + ")\n\n\n", index21);
          }
        }
      }
      if (n === 0 || n === 1 || n === 2 || n === 3 || n === 4 || n === 5 || n === 6 || n === 7 || n === 9) {
        setupo(cm);
      }
      if (n === 8) {
        savefile(cm);
        cm.oscale[0] = cm.scale[0];
        cm.oscale[1] = cm.scale[1];
        cm.oscale[2] = cm.scale[2];
      }
      if (n === 10 || n === 11 || n === 12 || n === 13 || n === 14 || n === 15 || n === 16 || n === 17 || n === 18) {
        try {
          const string4 = "" + getEditorText(cm.editor) + "\n";
          let s6 = "";
          let n26 = 0;
          let endIndex3 = string4.indexOf("\n", 0);
          while (endIndex3 !== -1 && n26 < string4.length) {
            const trim2 = string4.substring(n26, endIndex3).trim();
            n26 = endIndex3 + 1;
            endIndex3 = string4.indexOf("\n", n26);
            if (trim2.startsWith("p(")) {
              const index23 = trim2.indexOf(",", 0);
              const index24 = trim2.indexOf(",", index23 + 1);
              const index25 = trim2.indexOf(")", index24 + 1);
              if (index23 !== -1 && index24 !== -1 && index25 !== -1) {
                let intValue = trunc(parseFloat(trim2.substring(2, index23)));
                let intValue2 = trunc(parseFloat(trim2.substring(index23 + 1, index24)));
                let intValue3 = trunc(parseFloat(trim2.substring(index24 + 1, index25)));
                if (n === 10) {
                  const n27 = intValue2;
                  intValue2 = intValue3;
                  intValue3 = -n27;
                }
                if (n === 11) {
                  intValue += 10;
                }
                if (n === 12) {
                  intValue -= 10;
                }
                if (n === 13) {
                  const n28 = intValue;
                  intValue = -intValue3;
                  intValue3 = n28;
                }
                if (n === 14) {
                  intValue2 += 10;
                }
                if (n === 15) {
                  intValue2 -= 10;
                }
                if (n === 16) {
                  const n29 = intValue2;
                  intValue2 = -intValue;
                  intValue = n29;
                }
                if (n === 17) {
                  intValue3 += 10;
                }
                if (n === 18) {
                  intValue3 -= 10;
                }
                s6 = s6 + "p(" + intValue + "," + intValue2 + "," + intValue3 + ")" + trim2.substring(index25 + 1, trim2.length) + "\n";
              } else {
                s6 = s6 + "" + trim2 + "\n";
              }
            } else {
              s6 = s6 + "" + trim2 + "\n";
            }
          }
          setEditorText(cm.editor, s6);
          setupo(cm);
          cm.changed2 = true;
        } catch (ex4) {}
      }
      if (n === 19) {
        setEditorText(cm.editor, cm.lastedo);
        setupo(cm);
        cm.changed2 = false;
      }
      if (n === 20 && cm.changed2 && showConfirmDialog(cm, null, "Saving now will permanently change the point locations & numbers entered in the code!      \n\nContinue?", "Car Maker", 0) === 0) {
        setEditorText(cm.editor, getEditorText(cm.editor).trim() + "\n\n\n\n");
        savefile(cm);
        cm.changed2 = false;
      }
      n17 = 21;
    }
    if (cm.dtab === 3) {
      if (n === 0 || n === 2 || cm.defnow) {
        if (cm.defnow) {
          cm.defnow = false;
          showMessageDialog(cm, null, "Car Maker will setup default Front and Back Wheels positions and adjustments.\n\nEnter the desired positions and adjustments then press ' Apply ' to view!\nDon't forget to press ' Save ' when finished!", "Car Maker", 1);
        }
        let n30 = 0;
        try {
          if (trunc(parseFloat(getEditorText(cm.wv[10]))) <= 0) {
            n30 = 1;
          }
          if (trunc(parseFloat(getEditorText(cm.wv[2]))) >= 0) {
            n30 = 2;
          }
          if (trunc(parseFloat(getEditorText(cm.wv[8]))) <= 0) {
            n30 = 3;
          }
          if (trunc(parseFloat(getEditorText(cm.wv[0]))) <= 0) {
            n30 = 4;
          }
          const intValue4 = trunc(parseFloat(getEditorText(cm.wv[15])));
          if (intValue4 > 40) {
            setEditorText(cm.wv[15], "40");
          }
          if (intValue4 < -40) {
            setEditorText(cm.wv[15], "-40");
          }
          const intValue5 = trunc(parseFloat(getEditorText(cm.wv[7])));
          if (intValue5 > 40) {
            setEditorText(cm.wv[7], "40");
          }
          if (intValue5 < -40) {
            setEditorText(cm.wv[7], "-40");
          }
        } catch (ex5) {}
        if (n30 === 1) {
          showMessageDialog(cm, null, "ERROR:\nThe Z location value of the FRONT Wheels must be greater then zero! (it should have a +ve value)\nZ :  '" + getEditorText(cm.wv[10]) + "'  is less or equal to zero, where it should have +ve value!", "Car Maker", 1);
        }
        if (n30 === 2) {
          showMessageDialog(cm, null, "ERROR:\nThe Z location value of the BACK Wheels must be smaller then zero! (it should have a -ve value)\nZ :  '" + getEditorText(cm.wv[2]) + "'  is bigger or equal to zero, where it should have -ve value!", "Car Maker", 1);
        }
        if (n30 === 3) {
          showMessageDialog(cm, null, "ERROR:\nThe ±X location value of the FRONT or BACK Wheels must be greater then zero! (it should have a +ve value)\n±X :  '" + getEditorText(cm.wv[8]) + "'  is less or equal to zero, where it should have +ve value!", "Car Maker", 1);
        }
        if (n30 === 4) {
          showMessageDialog(cm, null, "ERROR:\nThe ±X location value of the FRONT or BACK Wheels must be greater then zero! (it should have a +ve value)\n±X :  '" + getEditorText(cm.wv[0]) + "'  is less or equal to zero, whenr it should have +ve value!", "Car Maker", 1);
        }
        if (n30 === 0) {
          const string5 = "" + getEditorText(cm.editor) + "\n";
          let str5 = "";
          let n31 = 0;
          let endIndex4 = string5.indexOf("\n", 0);
          while (endIndex4 !== -1 && n31 < string5.length) {
            const trim3 = string5.substring(n31, endIndex4).trim();
            n31 = endIndex4 + 1;
            endIndex4 = string5.indexOf("\n", n31);
            if (!trim3.startsWith("rims(") && !trim3.startsWith("gwgr(") && !trim3.startsWith("w(")) {
              str5 = str5 + "" + trim3 + "\n";
            } else {
              str5 = str5.trim() + "\n";
            }
          }
          const string6 = str5.trim() + "\n\n\ngwgr(" + getEditorText(cm.wv[15]) + ")\n";
          let substring2 = "140,140,140";
          if (getEditorText(cm.rplc).startsWith("(") && getEditorText(cm.rplc).endsWith(")")) {
            substring2 = getEditorText(cm.rplc).substring(1, getEditorText(cm.rplc).length - 1);
          }
          const string7 = string6 + "rims(" + substring2 + "," + getEditorText(cm.wv[13]) + "," + getEditorText(cm.wv[14]) + ")\n" + "w(-" + getEditorText(cm.wv[8]) + "," + getEditorText(cm.wv[9]) + "," + getEditorText(cm.wv[10]) + ",11," + getEditorText(cm.wv[12]) + "," + getEditorText(cm.wv[11]) + ")\n" + "w(" + getEditorText(cm.wv[8]) + "," + getEditorText(cm.wv[9]) + "," + getEditorText(cm.wv[10]) + ",11,-" + getEditorText(cm.wv[12]) + "," + getEditorText(cm.wv[11]) + ")\n" + "\ngwgr(" + getEditorText(cm.wv[7]) + ")\n";
          let substring3 = "140,140,140";
          if (getEditorText(cm.srch).startsWith("(") && getEditorText(cm.srch).endsWith(")")) {
            substring3 = getEditorText(cm.srch).substring(1, getEditorText(cm.srch).length - 1);
          }
          setEditorText(cm.editor, string7 + "rims(" + substring3 + "," + getEditorText(cm.wv[5]) + "," + getEditorText(cm.wv[6]) + ")\n" + "w(-" + getEditorText(cm.wv[0]) + "," + getEditorText(cm.wv[1]) + "," + getEditorText(cm.wv[2]) + ",0," + getEditorText(cm.wv[4]) + "," + getEditorText(cm.wv[3]) + ")\n" + "w(" + getEditorText(cm.wv[0]) + "," + getEditorText(cm.wv[1]) + "," + getEditorText(cm.wv[2]) + ",0,-" + getEditorText(cm.wv[4]) + "," + getEditorText(cm.wv[3]) + ")\n\n\n\n");
          cm.forwheels = true;
          setupo(cm);
          cm.forwheels = false;
          cm.aply1 = "" + getEditorText(cm.wv[0]) + getEditorText(cm.wv[1]) + getEditorText(cm.wv[2]) + getEditorText(cm.wv[3]) + getEditorText(cm.wv[4]) + getEditorText(cm.srch) + getEditorText(cm.wv[5]) + getEditorText(cm.wv[6]) + getEditorText(cm.wv[7]);
          cm.aply2 = "" + getEditorText(cm.wv[8]) + getEditorText(cm.wv[9]) + getEditorText(cm.wv[10]) + getEditorText(cm.wv[11]) + getEditorText(cm.wv[12]) + getEditorText(cm.rplc) + getEditorText(cm.wv[13]) + getEditorText(cm.wv[14]) + getEditorText(cm.wv[15]);
          cm.aplyd1 = false;
          cm.aplyd2 = false;
          cm.changed2 = true;
        }
      }
      if (n === 1 || n === 3) {
        if (!cm.o.errd) {
          savefile(cm);
          cm.changed2 = false;
        } else {
          showMessageDialog(cm, null, "Unable to Save, press  [ Apply ]  to find out why!", "Car Maker", 1);
        }
      }
      n17 = 4;
    }
    if (cm.dtab === 4) {
      if (!cm.statdef) {
        if (n === 0) {
          cm.carsel = getSelectedIndex(cm.simcar);
          let n32 = 0;
          for (let n33 = 0; n33 < 5; ++n33) {
            cm.stat[n33] = cm.carstat[cm.carsel][n33];
            cm.rstat[n33] = cm.stat[n33];
            n32 += cm.stat[n33];
          }
          cm.clsel = 4 - idiv(n32 - 520, 40);
          selectSmenu(cm.cls, cm.clsel);
          if (getItemCount(cm.simcar) === 16) {
            addSmenuItem(cm.simcar, cm.rd, "   ");
          }
          cm.statdef = true;
          cm.changed2 = true;
        }
        n17 = 1;
      } else {
        for (let n34 = 0; n34 < 5; ++n34) {
          let n35 = 0;
          if (n === 1 + n34 * 2 && cm.stat[n34] < 200) {
            n35 = 200 - cm.stat[n34];
            if (n35 > 4) {
              n35 = 4;
            }
          }
          if (n === n34 * 2 && cm.stat[n34] > 16) {
            n35 = 16 - cm.stat[n34];
            if (n35 < -4) {
              n35 = -4;
            }
          }
          let n36 = 0;
          while (n35 !== 0 && n36 !== 5) {
            n36 = 0;
            for (let n37 = 0; n37 < 5; ++n37) {
              if (n34 !== n37 && (cm.stat[n37] <= 200 || n35 > 0) && (cm.stat[n37] >= 16 || n35 < 0) && n35 !== 0) {
                if (n35 > 0) {
                  const stat = cm.stat;
                  const n38 = n34;
                  stat[n38] = i32(stat[n38] + 1);
                  const stat2 = cm.stat;
                  const n39 = n37;
                  stat2[n39] = i32(stat2[n39] - 1);
                  --n35;
                } else {
                  const stat3 = cm.stat;
                  const n40 = n34;
                  stat3[n40] = i32(stat3[n40] - 1);
                  const stat4 = cm.stat;
                  const n41 = n37;
                  stat4[n41] = i32(stat4[n41] + 1);
                  ++n35;
                }
              } else {
                ++n36;
              }
            }
          }
        }
        if (n === 10) {
          cm.carsel = getSelectedIndex(cm.simcar);
          let n42 = 0;
          for (let n43 = 0; n43 < 5; ++n43) {
            cm.stat[n43] = cm.carstat[cm.carsel][n43];
            n42 += cm.stat[n43];
          }
          cm.clsel = 4 - idiv(n42 - 520, 40);
          selectSmenu(cm.cls, cm.clsel);
        }
        if (n === 11) {
          const string8 = "" + getEditorText(cm.editor) + "\n";
          let str6 = "";
          let n44 = 0;
          let endIndex5 = string8.indexOf("\n", 0);
          while (endIndex5 !== -1 && n44 < string8.length) {
            const trim4 = string8.substring(n44, endIndex5).trim();
            n44 = endIndex5 + 1;
            endIndex5 = string8.indexOf("\n", n44);
            if (!trim4.startsWith("stat(")) {
              str6 = str6 + "" + trim4 + "\n";
            } else {
              str6 = str6.trim() + "\n";
            }
          }
          setEditorText(cm.editor, str6.trim() + "\n\n\nstat(" + cm.stat[0] + "," + cm.stat[1] + "," + cm.stat[2] + "," + cm.stat[3] + "," + cm.stat[4] + ")\n\n\n\n");
          savefile(cm);
          for (let n45 = 0; n45 < 5; ++n45) {
            cm.rstat[n45] = cm.stat[n45];
          }
          cm.changed2 = false;
        }
        if (n === 12) {
          for (let n46 = 0; n46 < 5; ++n46) {
            cm.stat[n46] = cm.rstat[n46];
          }
        }
        n17 = 13;
      }
    }
    if (cm.dtab === 5) {
      if (cm.pfase === 0) {
        for (let n47 = 0; n47 < 4; ++n47) {
          if (n === 1 + n47 * 2) {
            const phys = cm.phys;
            const n48 = n47;
            phys[n48] = i32(phys[n48] + 2);
            if (cm.phys[n47] > 100) {
              cm.phys[n47] = 100;
            }
          }
          if (n === n47 * 2) {
            const phys2 = cm.phys;
            const n49 = n47;
            phys2[n49] = i32(phys2[n49] - 2);
            if (cm.phys[n47] < 0) {
              cm.phys[n47] = 0;
            }
          }
        }
        if (n === 8) {
          for (let n50 = 0; n50 < 5; ++n50) {
            cm.phys[n50] = trunc(fr(random() * 100.0));
          }
        }
        if (n === 9) {
          for (let n51 = 0; n51 < 5; ++n51) {
            cm.phys[n51] = cm.rphys[n51];
          }
        }
        if (n === 10) {
          cm.pfase = 1;
          n = -1;
        }
        n17 = 11;
      }
      if (cm.pfase === 1) {
        for (let n52 = 0; n52 < 6; ++n52) {
          if (n === 1 + n52 * 2) {
            const phys3 = cm.phys;
            const n53 = n52 + 5;
            phys3[n53] = i32(phys3[n53] + 2);
            if (cm.phys[n52 + 5] > 100) {
              cm.phys[n52 + 5] = 100;
            }
          }
          if (n === n52 * 2) {
            const phys4 = cm.phys;
            const n54 = n52 + 5;
            phys4[n54] = i32(phys4[n54] - 2);
            if (cm.phys[n52 + 5] < 0) {
              cm.phys[n52 + 5] = 0;
            }
          }
        }
        if (n === 12) {
          for (let n55 = 0; n55 < 6; ++n55) {
            cm.phys[n55 + 5] = trunc(fr(random() * 100.0));
          }
        }
        if (n === 13) {
          for (let n56 = 0; n56 < 6; ++n56) {
            cm.phys[n56 + 5] = cm.rphys[n56 + 5];
          }
        }
        if (n === 14) {
          cm.pfase = 0;
          n = -1;
        }
        if (n === 15) {
          cm.pfase = 2;
          n = -1;
        }
        n17 = 16;
      }
      if (cm.pfase === 2) {
        for (let n57 = 0; n57 < 3; ++n57) {
          if (n === 1 + n57 * 2) {
            const crash = cm.crash;
            const n58 = n57;
            crash[n58] = i32(crash[n58] + 2);
            if (cm.crash[n57] > 100) {
              cm.crash[n57] = 100;
            }
          }
          if (n === n57 * 2) {
            const crash2 = cm.crash;
            const n59 = n57;
            crash2[n59] = i32(crash2[n59] - 2);
            if (cm.crash[n57] < 0) {
              cm.crash[n57] = 0;
            }
          }
        }
        if (n === 6) {
          let n60 = trunc(fr(150.0 + fr(600.0 * random())));
          let b5 = false;
          let b6 = false;
          if (random() > random()) {
            b5 = true;
          }
          if (random() > random()) {
            b6 = true;
          }
          const array10 = intArray([-101, -101, -101, -101]);
          array10[0] = trunc(fr(random() * 4.0));
          if (random() > random()) {
            if (b6) {
              array10[1] = array10[0] + 1;
            } else {
              array10[1] = array10[0] - 1;
            }
            if (random() > random()) {
              if (b6) {
                array10[2] = array10[1] + 1;
              } else {
                array10[2] = array10[1] - 1;
              }
              if (random() > random()) {
                if (b6) {
                  array10[3] = array10[2] + 1;
                } else {
                  array10[3] = array10[2] - 1;
                }
              }
            }
          }
          if (random() > random()) {
            cm.crashup = false;
          } else {
            cm.crashup = true;
          }
          for (let n61 = 0; n61 < 4; ++n61) {
            if (array10[n61] !== -101) {
              if (array10[n61] >= 4) {
                const array11 = array10;
                const n62 = n61;
                array11[n62] = i32(array11[n62] - 4);
              }
              if (array10[n61] <= -1) {
                const array12 = array10;
                const n63 = n61;
                array12[n63] = i32(array12[n63] + 4);
              }
              n60 = i32(n60 - Math.imul(50, n61));
              if (n60 < 150) {
                n60 = 150;
              }
              if (b5) {
                regx(cm, array10[n61], fr(n60), false);
              } else {
                regz(cm, array10[n61], fr(n60), false);
              }
            }
          }
          if (cm.hitmag < 17000) {
            if (cm.crashleft) {
              const o = cm.o;
              o.xz = i32(o.xz + 22);
            } else {
              const o2 = cm.o;
              o2.xz = i32(o2.xz - 22);
            }
          }
        }
        if (n === 8) {
          if (random() > random()) {
            cm.crashup = false;
          } else {
            cm.crashup = true;
          }
          roofsqsh(cm, fr(trunc(fr(230.0 + fr(random() * 80.0)))));
        }
        if (n === 9 || n === 7) {
          setupo(cm);
          if (random() > random()) {
            cm.crashleft = false;
          } else {
            cm.crashleft = true;
          }
        }
        if (n === 10) {
          for (let n64 = 0; n64 < 3; ++n64) {
            cm.crash[n64] = cm.rcrash[n64];
          }
        }
        if (n === 11) {
          setupo(cm);
          cm.pfase = 1;
          n = -1;
        }
        if (n === 12) {
          if (cm.crashok) {
            setupo(cm);
            cm.pfase = 3;
            n = -1;
          } else {
            showMessageDialog(cm, null, cm.usage[11], "Car Maker", 1);
          }
        }
        n17 = 13;
      }
      if (cm.pfase === 3) {
        for (let n65 = 0; n65 < 5; ++n65) {
          if (n === n65) {
            for (let n66 = 0; n66 < 5; ++n66) {
              for (let n67 = 0; n67 < 5; ++n67) {
                cm.engs[n67][n66].stop();
              }
            }
            cm.engs[cm.engsel][n65].loop();
            cm.engon = true;
          }
          if (n === 5) {
            for (let n68 = 0; n68 < 5; ++n68) {
              for (let n69 = 0; n69 < 5; ++n69) {
                cm.engs[n69][n68].stop();
              }
            }
            cm.engon = false;
          }
          if (n === 6) {
            cm.pfase = 2;
            n = -1;
            hideSmenu(cm.engine);
          }
          if (n === 7) {
            cm.pfase = 4;
            n = -1;
            hideSmenu(cm.engine);
          }
        }
        n17 = 8;
      }
    }
    if (cm.dtab === 6) {
      if (!cm.rateh) {
        if (n === 0 && checko(cm, "Test Drive")) {
          // TODO not ported: test drive launch
        }
        n17 = 1;
        if (cm.tested) {
          if (n === 1) {
            cm.dtab = 4;
            n = -1;
          }
          if (n === 2) {
            cm.dtab = 5;
            n = -1;
          }
          if (n === 3) {
            cm.rateh = true;
            hidefields(cm);
          }
          n17 = 4;
        }
      } else {
        if (n === 0) {
          cm.handling -= 2;
          if (cm.handling < 50) {
            cm.handling = 50;
          }
        }
        if (n === 1) {
          cm.handling += 2;
          if (cm.handling > 200) {
            cm.handling = 200;
          }
        }
        if (n === 2) {
          const string9 = "" + getEditorText(cm.editor) + "\n";
          let str7 = "";
          let n70 = 0;
          let endIndex6 = string9.indexOf("\n", 0);
          while (endIndex6 !== -1 && n70 < string9.length) {
            const trim5 = string9.substring(n70, endIndex6).trim();
            n70 = endIndex6 + 1;
            endIndex6 = string9.indexOf("\n", n70);
            if (!trim5.startsWith("handling(")) {
              str7 = str7 + "" + trim5 + "\n";
            } else {
              str7 = str7.trim() + "\n";
            }
          }
          setEditorText(cm.editor, str7.trim() + "\n\n\nhandling(" + cm.handling + ")\n\n\n\n");
          savefile(cm);
          cm.rateh = false;
        }
        if (n === 3) {
          cm.rateh = false;
        }
        n17 = 4;
      }
    }
    if (n === n17) {
      for (let n71 = 0; n71 < cm.o.npl; ++n71) {
        RGBtoHSB(cm.o.p[n71].c[0], cm.o.p[n71].c[1], cm.o.p[n71].c[2], cm.o.p[n71].hsb);
        if (cm.o.p[n71].gr === -13) {
          cm.o.p[n71].gr = 1;
        }
      }
      cm.polynum = -1;
    }
    n = -1;
  }
  if (cm.tab === 3) {
    if (n === 0) {
      if (cm.logged === 0) {
        showMessageDialog(cm, null, "Please login to retrieve your account first before publishing!", "Car Maker", 1);
      }
      if ((cm.logged === 3 || cm.logged === -1) && checko(cm, "Publishing")) {
        // TODO not ported: server socket publishing
      }
    }
    if (cm.logged === 0) {
      if (n === 1) {
        // TODO not ported: server socket authentication
      }
      if (n === 2) {
        // TODO not ported: openurl register
      }
      if (n === 3) {
        // TODO not ported: openurl edit
      }
    }
  }
}
