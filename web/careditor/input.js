// Transpiled from java-src/CarMaker.java lines 5251-5398, 5796-5839 (chunk "input") verbatim.

import { idiv, i32 } from '../java.js';
import { Madness } from '../Madness.js';

export class Cursor {
  constructor(type) {
    this.type = type;
  }
}

class StringSelection {
  constructor(str) {
    this.str = str;
  }
}

const DataFlavor = {
  stringFlavor: 'stringFlavor',
};

const _systemClipboard = {
  _content: '',
  setContents(selection, owner) {
    if (selection && typeof selection.str === 'string') {
      this._content = selection.str;
    } else if (typeof selection === 'string') {
      this._content = selection;
    }
  },
  getData(flavor) {
    return this._content;
  },
};

const Toolkit = {
  getDefaultToolkit() {
    return {
      getSystemClipboard() {
        return _systemClipboard;
      },
    };
  },
};

export function paint(cm, graphics) {
  cm.apx = i32(idiv(cm.getWidth(), 2) - 350);
  cm.apy = i32(idiv(cm.getHeight(), 2) - 275);
  graphics.drawImage(cm.offImage, cm.apx, cm.apy, cm);
}

export function update(cm, graphics) {
  paint(cm, graphics);
}

export function mouseUp(cm, event, n, n2) {
  cm.xm = i32(n - cm.apx);
  cm.ym = i32(n2 - cm.apy);
  if (cm.waso) {
    cm.waso = false;
  } else {
    cm.mouses = -1;
  }
  cm.mousdr = false;
  if (cm.onbtgame) {
    Madness.game();
  }
  return false;
}

export function mouseDown(cm, event, n, n2) {
  cm.xm = i32(n - cm.apx);
  cm.ym = i32(n2 - cm.apy);
  cm.mouses = 1;
  cm.mousdr = true;
  if (cm.tab !== 1) {
    cm.requestFocus();
  }
  return false;
}

export function mouseMove(cm, event, n, n2) {
  cm.xm = i32(n - cm.apx);
  cm.ym = i32(n2 - cm.apy);
  if (cm.xm > 520 && cm.xm < 674 && cm.ym > 0 && cm.ym < 23) {
    if (!cm.onbtgame) {
      cm.onbtgame = true;
      cm.setCursor(new Cursor(12));
    }
  } else if (cm.onbtgame) {
    cm.onbtgame = false;
    cm.setCursor(new Cursor(0));
  }
  return false;
}

export function mouseDrag(cm, event, n, n2) {
  cm.mousdr = true;
  cm.xm = i32(n - cm.apx);
  cm.ym = i32(n2 - cm.apy);
  return false;
}

export function lostFocus(cm, event, o) {
  return (cm.focuson = false);
}

export function gotFocus(cm, event, o) {
  cm.focuson = true;
  return false;
}

export function keyDown(cm, event, n) {
  if (cm.focuson) {
    if (n === 54 || n === 46 || n === 100 || n === 68) {
      cm.rotr = true;
    }
    if (n === 52 || n === 44 || n === 97 || n === 65) {
      cm.rotl = true;
    }
    if (n === 43 || n === 61) {
      cm.plus = true;
    }
    if (n === 45) {
      cm.minus = true;
    }
    if (n === 42 || n === 10 || n === 56 || n === 119 || n === 87) {
      cm.in = true;
    }
    if (n === 47 || n === 8 || n === 50 || n === 115 || n === 83) {
      cm.out = true;
    }
    if (n === 1006) {
      cm.left = true;
    }
    if (n === 1007) {
      cm.right = true;
    }
    if (n === 1005) {
      cm.down = true;
    }
    if (n === 1004) {
      cm.up = true;
    }
  }
  return false;
}

export function keyUp(cm, event, n) {
  if (n === 54 || n === 46 || n === 100 || n === 68) {
    cm.rotr = false;
  }
  if (n === 52 || n === 44 || n === 97 || n === 65) {
    cm.rotl = false;
  }
  if (n === 43 || n === 61) {
    cm.plus = false;
  }
  if (n === 45) {
    cm.minus = false;
  }
  // Note: keyUp checks 97 instead of 87 (game bug preserved verbatim)
  if (n === 42 || n === 10 || n === 56 || n === 119 || n === 97) {
    cm.in = false;
  }
  if (n === 47 || n === 8 || n === 50 || n === 115 || n === 83) {
    cm.out = false;
  }
  if (n === 1006) {
    cm.left = false;
  }
  if (n === 1007) {
    cm.right = false;
  }
  if (n === 1005) {
    cm.down = false;
  }
  if (n === 1004) {
    cm.up = false;
  }
  return false;
}

export function actionPerformed(cm, actionEvent) {
  let textComponent = cm.wv[0];
  if (Madness.textid >= 0 && Madness.textid <= 15) {
    textComponent = cm.wv[Madness.textid];
  }
  if (Madness.textid === 16) {
    textComponent = cm.srch;
  }
  if (Madness.textid === 17) {
    textComponent = cm.rplc;
  }
  if (Madness.textid === 18) {
    textComponent = cm.editor;
  }
  const actionCommand = actionEvent.getActionCommand();
  if (actionCommand === "Cut") {
    Toolkit.getDefaultToolkit().getSystemClipboard().setContents(new StringSelection(textComponent.getSelectedText()), null);
    if (Madness.textid === 18) {
      cm.editor.replaceText("", cm.editor.getSelectionStart(), cm.editor.getSelectionEnd());
    } else {
      textComponent.setText(textComponent.getText().substring(0, textComponent.getSelectionStart()) + textComponent.getText().substring(textComponent.getSelectionEnd(), textComponent.getText().length));
    }
  }
  if (actionCommand === "Copy") {
    Toolkit.getDefaultToolkit().getSystemClipboard().setContents(new StringSelection(textComponent.getSelectedText()), null);
  }
  if (actionCommand === "Paste") {
    try {
      const s = Toolkit.getDefaultToolkit().getSystemClipboard().getData(DataFlavor.stringFlavor);
      if (Madness.textid === 18) {
        cm.editor.replaceText(s, cm.editor.getSelectionStart(), cm.editor.getSelectionEnd());
      } else {
        textComponent.setText(textComponent.getText().substring(0, textComponent.getSelectionStart()) + s + textComponent.getText().substring(textComponent.getSelectionEnd(), textComponent.getText().length));
      }
    } catch (ex) {}
  }
  if (actionCommand === "Select All") {
    textComponent.selectAll();
  }
}
