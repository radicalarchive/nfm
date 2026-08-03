// Transpiled from java-src/CarMaker.java lines 4352-4681, 5473-5633 verbatim.
// Car file IO and .rad text parser: setupo, loadfile, savefile, newcar, delcar, rencar,
// loadsettings, savesettings, checko, fixtext, getvalue, getSvalue, servervalue, serverSvalue, objvalue.

import { idiv, trunc, fr, i32, intArray, floatArray, objArray } from '../java.js';
import { ContO } from '../ContO.js';

/**
 * Transpiled from CarMaker.java setupo() (lines 4352-4375)
 */
export function setupo(cm) {
  const text = cm.editor ? (typeof cm.editor.getText === 'function' ? cm.editor.getText() : cm.editor.text || '') : '';
  const bytes = new TextEncoder().encode(text);
  cm.o = new ContO(bytes, cm.m, cm.t);
  cm.o.x = cm.ox;
  cm.o.y = cm.oy;
  cm.o.z = cm.oz;
  cm.o.xz = cm.oxz;
  cm.o.xy = cm.oxy;
  cm.o.zy = cm.ozy;
  cm.o.shadow = true;
  cm.o.tnt = 0;
  cm.o.disp = 0;
  cm.o.disline = 7;
  cm.o.grounded = 1.0;
  cm.o.noline = false;
  cm.o.decor = false;
  if (cm.o.errd && (!cm.o.err.startsWith('Wheels Error:') || cm.forwheels)) {
    if (typeof cm.showMessageDialog === 'function') {
      cm.showMessageDialog(null, cm.o.err, 'Car Maker', 0);
    }
  }
  if (cm.o.maxR === 0) {
    cm.o.maxR = 100;
  }
  cm.squash = 0;
  cm.hitmag = 0;
}

/**
 * Transpiled from CarMaker.java loadfile() (lines 4378-4397)
 * IO seam: takes text parameter instead of reading disk directly.
 */
export function loadfile(cm, text) {
  cm.loadedfile = false;
  cm.lastedo = '';
  if (text !== null && text !== undefined) {
    try {
      const lines = text.endsWith('\n') ? text.slice(0, -1).split(/\r?\n/) : text.split(/\r?\n/);
      let lastedo = '';
      for (let i = 0; i < lines.length; ++i) {
        lastedo += lines[i] + '\n';
      }
      cm.lastedo = lastedo;
      cm.loadedfile = true;
    } catch (obj) {
      cm.loadedfile = false;
      cm.lastedo = '';
      if (typeof cm.showMessageDialog === 'function') {
        cm.showMessageDialog(null, 'Unable to load file! Error Details:\n' + obj, 'Car Maker', 1);
      }
    }
  }
  if (cm.editor) {
    if (typeof cm.editor.setText === 'function') {
      cm.editor.setText(cm.lastedo);
    } else {
      cm.editor.text = cm.lastedo;
    }
  }
}

/**
 * Transpiled from CarMaker.java savefile() (lines 4398-4416)
 * IO seam: returns the .rad text string instead of writing to disk.
 */
export function savefile(cm) {
  const text = cm.editor ? (typeof cm.editor.getText === 'function' ? cm.editor.getText() : cm.editor.text || '') : '';
  let savedText = null;
  if (text !== '') {
    try {
      cm.changed = false;
      cm.lastedo = text;
      savedText = text;
    } catch (obj) {
      if (typeof cm.showMessageDialog === 'function') {
        cm.showMessageDialog(null, 'Unable to save file! Error Details:\n' + obj, 'Car Maker', 1);
      }
    }
  }
  savesettings(cm);
  return savedText;
}

/**
 * Transpiled from CarMaker.java newcar(String s) (lines 4418-4453)
 * IO seam: returns template data object instead of writing disk.
 */
export function newcar(cm, s) {
  if (s === '') {
    if (typeof cm.showMessageDialog === 'function') {
      cm.showMessageDialog(null, 'Please Enter a Car Name!\n', 'Car Maker', 1);
    }
    return { ok: false, error: 'empty' };
  } else {
    const string = '\n// car: ' + s + '\n---------------------\n\n// To start making you car you must start by reading the tutorial at:\n// http://www.needformadness.com/developer/simplecar.html\n\n\n<p>\nc(100,200,100)\n\np(-40,-50,80)\np(-40,-50,-70)\np(40,-50,-70)\np(40,-50,80)\n</p>\n\n<p>\nc(100,150,200)\n\np(-40,-20,-100)\np(-40,-50,-70)\np(40,-50,-70)\np(40,-20,-100)\n</p>\n\n\n\n';
    try {
      cm.carname = s;
      cm.sfase = 0;
      if (typeof cm.hidefields === 'function') {
        cm.hidefields();
      }
      cm.tabed = -1;
      return { ok: true, text: string, name: s };
    } catch (obj) {
      cm.carname = '';
      if (typeof cm.showMessageDialog === 'function') {
        cm.showMessageDialog(null, 'Unable to create file! Error Details:\n' + obj, 'Car Maker', 1);
      }
      return { ok: false, error: String(obj) };
    }
  }
}

/**
 * Transpiled from CarMaker.java delcar(String s) (lines 4455-4469)
 * IO seam: returns plain data object.
 */
export function delcar(cm, s) {
  if (s === '') {
    if (typeof cm.showMessageDialog === 'function') {
      cm.showMessageDialog(null, 'Please Select a Car to Delete!\n', 'Car Maker', 1);
    }
    return { ok: false, error: 'empty' };
  } else {
    try {
      if (cm.slcar) {
        if (typeof cm.slcar.remove === 'function') cm.slcar.remove(s);
        if (typeof cm.slcar.select === 'function') cm.slcar.select(0);
      }
      return { ok: true, name: s };
    } catch (obj) {
      if (typeof cm.showMessageDialog === 'function') {
        cm.showMessageDialog(null, 'Unable to delete file! Error Details:\n' + obj, 'Car Maker', 1);
      }
      return { ok: false, error: String(obj) };
    }
  }
}

/**
 * Transpiled from CarMaker.java rencar(String str) (lines 4471-4491)
 * IO seam: returns plain data object.
 */
export function rencar(cm, str) {
  if (str === '') {
    if (typeof cm.showMessageDialog === 'function') {
      cm.showMessageDialog(null, 'Please Enter a New Car Name!\n', 'Car Maker', 1);
    }
    return { ok: false, error: 'empty' };
  } else {
    try {
      const oldName = cm.carname;
      cm.carname = str;
      cm.sfase = 0;
      if (typeof cm.hidefields === 'function') {
        cm.hidefields();
      }
      cm.tabed = -1;
      return { ok: true, oldName, newName: str };
    } catch (obj) {
      if (typeof cm.showMessageDialog === 'function') {
        cm.showMessageDialog(null, 'Unable to rename file! Error Details:\n' + obj, 'Car Maker', 1);
      }
      return { ok: false, error: String(obj) };
    }
  }
}

/**
 * Transpiled from CarMaker.java loadsettings() (lines 4493-4523)
 * IO seam: accepts settings text string.
 */
export function loadsettings(cm, settingsText) {
  if (settingsText !== null && settingsText !== undefined) {
    try {
      const lines = settingsText.split(/\r?\n/);
      if (lines.length > 0 && lines[0] !== '') {
        cm.scar = lines[0];
        cm.carname = cm.scar;
      }
      if (lines.length > 1 && lines[1] !== '') {
        cm.suser = lines[1];
        if (cm.suser !== 'Horaks') {
          if (cm.tnick) {
            if (typeof cm.tnick.setText === 'function') cm.tnick.setText(cm.suser);
            else cm.tnick.text = cm.suser;
          }
        }
      }
      if (lines.length > 2 && lines[2] !== '') {
        cm.sfont = lines[2];
        cm.cfont = cm.sfont;
      }
      if (lines.length > 3 && lines[3] !== '') {
        const val = parseFloat(lines[3]);
        if (!isNaN(val)) {
          cm.sthm = trunc(val);
          cm.cthm = cm.sthm;
        }
      }
    } catch (ex) {}
  }
}

/**
 * Transpiled from CarMaker.java savesettings() (lines 4525-4545)
 * IO seam: returns settings text string.
 */
export function savesettings(cm) {
  const nickText = cm.tnick ? (typeof cm.tnick.getText === 'function' ? cm.tnick.getText() : cm.tnick.text || '') : cm.suser;
  if (cm.scar !== cm.carname || cm.suser !== nickText || cm.sfont !== cm.cfont || cm.cthm !== cm.sthm) {
    const string = '' + cm.carname + '\n' + nickText + '\n' + cm.cfont + '\n' + cm.cthm + '\n\n';
    cm.scar = cm.carname;
    cm.suser = nickText;
    cm.sfont = cm.cfont;
    cm.sthm = cm.cthm;
    return string;
  }
  return null;
}

/**
 * Transpiled from CarMaker.java checko(String str) (lines 4547-4681)
 */
export function checko(cm, str, text) {
  loadfile(cm, text);
  setupo(cm);
  if (cm.o.colok < 2) {
    if (typeof cm.showMessageDialog === 'function') {
      cm.showMessageDialog(null, "Car is not ready for " + str + "!\nReason:\nFirst and Second colors not defined yet!\nPlease go to the 'Color Edit' tab to define the colors.\n", "Car Maker", 1);
    }
    return false;
  }
  let b = true;
  if (cm.o.keyz[0] <= 0 || cm.o.keyx[0] >= 0) {
    b = false;
  }
  if (cm.o.keyz[1] <= 0 || cm.o.keyx[1] <= 0) {
    b = false;
  }
  if (cm.o.keyz[2] >= 0 || cm.o.keyx[2] >= 0) {
    b = false;
  }
  if (cm.o.keyz[3] >= 0 || cm.o.keyx[3] <= 0) {
    b = false;
  }
  if (!b) {
    if (typeof cm.showMessageDialog === 'function') {
      cm.showMessageDialog(null, "Car is not ready for " + str + "!\nReason:\nCar Wheels not defined or not defined correctly!\nPlease go to the \u2018Wheels\u2019 tab and use  [ Apply ]  and  [ Save ]  to define correctly.\n", "Car Maker", 1);
    }
    return false;
  }
  if (cm.o.npl <= 60) {
    if (typeof cm.showMessageDialog === 'function') {
      cm.showMessageDialog(null, "Car is not ready for " + str + "!\nReason:\nNo car seems to be designed!\nYou have not built a car yet please go to the \u2018Car\u2019 tab to find the tutorial on how to build a car.\n", "Car Maker", 1);
    }
    return false;
  }
  if (cm.o.npl > 286) {
    if (typeof cm.showMessageDialog === 'function') {
      cm.showMessageDialog(null, "Car is not ready for " + str + "!\nReason:\nCar contains too many polygons (pieces).\nNumber of polygons used need to be less then 210.\nPlease use the counter in the \u2018Code Edit\u2019 to decrease the number of polygons (pieces).\n", "Car Maker", 1);
    }
    return false;
  }
  if (cm.o.maxR > 400) {
    if (typeof cm.showMessageDialog === 'function') {
      cm.showMessageDialog(null, "Car is not ready for " + str + "!\nReason:\nCar scale size is too large!\nPlease use the \u2018Scale All\u2019 option in the \u2018Scale & Align\u2019 tab to resize your car to suitable size.       \nCompare it to other NFM cars using the \u2018Compare Car...\u2019 option.\nCurrently you car needs to be scaled down by " + trunc(fr(fr(fr(cm.o.maxR / 400.0) - 1.0) * 100.0)) + "%.\n", "Car Maker", 1);
    }
    return false;
  }
  if (cm.o.maxR < 120) {
    if (typeof cm.showMessageDialog === 'function') {
      cm.showMessageDialog(null, "Car is not ready for " + str + "!\nReason:\nCar scale size is too small!\nPlease use the \u2018Scale All\u2019 option in the \u2018Scale & Align\u2019 tab to resize your car to suitable size.       \nCompare it to other NFM cars using the \u2018Compare Car...\u2019 option.\nCurrently you car needs to be scaled up by " + trunc(fr(fr(fr(120.0 / cm.o.maxR) - 1.0) * 100.0)) + "%.\n", "Car Maker", 1);
    }
    return false;
  }
  const editorText = cm.editor ? (typeof cm.editor.getText === 'function' ? cm.editor.getText() : cm.editor.text || '') : '';
  const string = "" + editorText + "\n";
  let n = 0;
  let endIndex = string.indexOf("\n", 0);
  let b2 = false;
  let b3 = false;
  let b4 = false;
  while (endIndex !== -1 && n < string.length) {
    const trim = string.substring(n, endIndex).trim();
    n = endIndex + 1;
    endIndex = string.indexOf("\n", n);
    if (trim.startsWith("stat(")) {
      b2 = true;
      try {
        let n2 = 0;
        for (let i = 0; i < 5; ++i) {
          cm.stat[i] = getvalue("stat", trim, i);
          if (cm.stat[i] > 200) {
            b2 = false;
          }
          if (cm.stat[i] < 16) {
            b2 = false;
          }
          n2 = i32(n2 + cm.stat[i]);
        }
        if (n2 !== 680 && n2 !== 640 && n2 !== 600 && n2 !== 560 && n2 !== 520) {
          b2 = false;
        }
      } catch (ex) {
        b2 = false;
      }
    }
    if (trim.startsWith("physics(")) {
      b3 = true;
      try {
        for (let j = 0; j < 11; ++j) {
          cm.phys[j] = getvalue("physics", trim, j);
          if (cm.phys[j] > 100) {
            b3 = false;
          }
          if (cm.phys[j] < 0) {
            b3 = false;
          }
        }
        for (let k = 0; k < 3; ++k) {
          cm.crash[k] = getvalue("physics", trim, k + 11);
          if (k !== 0 && cm.crash[k] > 100) {
            b3 = false;
          }
          if (cm.crash[k] < 0) {
            b3 = false;
          }
        }
        cm.engsel = getvalue("physics", trim, 14);
        if (cm.engsel > 4) {
          b3 = false;
        }
        if (cm.engsel < 0) {
          b3 = false;
        }
      } catch (ex2) {
        b3 = false;
      }
    }
    if (trim.startsWith("handling(")) {
      b4 = true;
      try {
        const getval = getvalue("handling", trim, 0);
        if (getval > 200) {
          b4 = false;
        }
        if (getval >= 0) {
          continue;
        }
        b4 = false;
      } catch (ex3) {
        b4 = false;
      }
    }
  }
  if (!b2) {
    if (typeof cm.showMessageDialog === 'function') {
      cm.showMessageDialog(null, "Car is not ready for " + str + "!\nReason:\nCar Stats & Class not defined correctly!\nPlease go to the 'Stats & Class' tab to define stats and don't forget to press  [ Save ]  when finished.\n", "Car Maker", 1);
    }
    return false;
  }
  if (!b3) {
    if (typeof cm.showMessageDialog === 'function') {
      cm.showMessageDialog(null, "Car is not ready for " + str + "!\nReason:\nCar Physics not defined correctly!\nPlease go to the 'Physics' tab and complete the car physics definition until it is saved.\n", "Car Maker", 1);
    }
    return false;
  }
  if (!b4 && str === "Publishing") {
    if (typeof cm.showMessageDialog === 'function') {
      cm.showMessageDialog(null, "Car is not ready for " + str + "!\nReason:\nCar Handling not rated.\nPlease Test Drive your car to rate its handling before publishing!\n", "Car Maker", 1);
    }
    return false;
  }
  return true;
}

/**
 * Transpiled from CarMaker.java fixtext(TextField textField) (lines 5473-5494)
 */
export function fixtext(textField) {
  const rawText = typeof textField.getText === 'function' ? textField.getText() : textField.text || '';
  const replace = rawText.replaceAll('"', '#');
  const anObject = "\\";
  let string = "";
  let i = 0;
  let n = -1;
  while (i < replace.length) {
    const string2 = replace[i];
    if (string2 === "|" || string2 === "," || string2 === "(" || string2 === ")" || string2 === "#" || string2 === anObject || string2 === "!" || string2 === "?" || string2 === "~" || string2 === "." || string2 === "@" || string2 === "$" || string2 === "%" || string2 === "^" || string2 === "&" || string2 === "*" || string2 === "+" || string2 === "=" || string2 === ">" || string2 === "<" || string2 === "/" || string2 === "'" || string2 === ";" || string2 === ":" || i > 15) {
      n = i;
    } else {
      string += string2;
    }
    ++i;
  }
  if (n !== -1) {
    if (typeof textField.setText === 'function') {
      textField.setText(string);
    } else {
      textField.text = string;
    }
    if (typeof textField.select === 'function') {
      textField.select(n, n);
    }
  }
}

function parseFloatValueToInt(string) {
  if (string === '' || /^\s*$/.test(string)) {
    throw new Error('For input string: "' + string + '"');
  }
  const val = Number(string);
  if (Number.isNaN(val)) {
    throw new Error('For input string: "' + string + '"');
  }
  return trunc(fr(val));
}

/**
 * Transpiled from CarMaker.java getvalue(String s, String s2, int n) (lines 5496-5510)
 */
export function getvalue(s, s2, n) {
  let n2 = 0;
  let string = "";
  for (let i = s.length + 1; i < s2.length; ++i) {
    const string2 = s2[i];
    if (string2 === "," || string2 === ")") {
      ++n2;
      ++i;
    }
    if (n2 === n) {
      // charAt() past the end throws in Java, and the ++i above can walk off
      // the end. Do not "fix" it: a caller that hits this gets an exception in
      // the original too (§3).
      if (i >= s2.length) throw new RangeError('String index out of range: ' + i);
      string += s2[i];
    }
  }
  return parseFloatValueToInt(string);
}

/**
 * Transpiled from CarMaker.java getSvalue(String s, String s2, int n) (lines 5512-5524)
 */
export function getSvalue(s, s2, n) {
  let string = "";
  for (let n2 = 0, index = s.length + 1; index < s2.length && n2 <= n; ++index) {
    const string2 = s2[index];
    if (string2 === "," || string2 === ")") {
      ++n2;
    } else if (n2 === n) {
      string += string2;
    }
  }
  return string;
}

/**
 * Transpiled from CarMaker.java servervalue(String s, int n) (lines 5526-5553)
 * TODO not ported: server stat check (per CAREDITOR_PORT_SPEC.md §"Measured facts")
 */
export function servervalue(s, n) {
  let intValue = -1;
  try {
    let index = 0;
    let n2 = 0;
    let n3 = 0;
    let string = "";
    while (index < s.length && n3 !== 2) {
      const string2 = s[index];
      if (string2 === "|") {
        ++n2;
        if (n3 === 1 || n2 > n) {
          n3 = 2;
        }
      } else if (n2 === n) {
        string += string2;
        n3 = 1;
      }
      ++index;
    }
    if (string === "") {
      string = "-1";
    }
    const parsed = parseInt(string, 10);
    if (!isNaN(parsed)) {
      intValue = parsed;
    }
  } catch (ex) {}
  return intValue;
}

/**
 * Transpiled from CarMaker.java serverSvalue(String s, int n) (lines 5555-5581)
 * TODO not ported: server stat check (per CAREDITOR_PORT_SPEC.md §"Measured facts")
 */
export function serverSvalue(s, n) {
  let s2 = "";
  try {
    let index = 0;
    let n2 = 0;
    let n3 = 0;
    let string = "";
    while (index < s.length && n3 !== 2) {
      const string2 = s[index];
      if (string2 === "|") {
        ++n2;
        if (n3 === 1 || n2 > n) {
          n3 = 2;
        }
      } else if (n2 === n) {
        string += string2;
        n3 = 1;
      }
      ++index;
    }
    s2 = string;
  } catch (ex) {}
  return s2;
}

/**
 * Transpiled from CarMaker.java objvalue(String s, int n) (lines 5583-5633)
 */
export function objvalue(cm, s, n) {
  let n2 = 0;
  try {
    let index = 2;
    let n3 = 0;
    let n4 = 0;
    let s2 = "";
    let n5 = 0;
    while (index < s.length && n4 !== 2) {
      const string = s[index];
      if (string === " ") {
        if (n5 !== 0) {
          ++n3;
          n5 = 0;
        }
        if (n4 === 1 || n3 > n) {
          n4 = 2;
        }
      } else {
        if (n3 === n) {
          s2 += string;
          n4 = 1;
        }
        n5 = 1;
      }
      ++index;
    }
    if (index >= s.length) {
      cm.objfacend = true;
    }
    if (s2 === "") {
      s2 = "0";
    }
    if (cm.multf10) {
      const val = Number(s2);
      if (Number.isNaN(val)) throw new Error('For input string: "' + s2 + '"');
      n2 = trunc(fr(fr(val) * 10.0));
    } else {
      const index2 = s2.indexOf("/", 0);
      if (index2 !== -1) {
        s2 = s2.substring(0, index2);
      }
      const val = Number(s2);
      if (Number.isNaN(val)) throw new Error('For input string: "' + s2 + '"');
      n2 = i32(trunc(fr(val)) - 1);
      if (n2 < 0) {
        n2 = 0;
      }
    }
  } catch (ex) {}
  return n2;
}
