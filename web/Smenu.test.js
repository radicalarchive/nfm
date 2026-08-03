// Differential check of Smenu against real Java class (Smenu.class).
// Every expected value below comes from web/tools/SmenuProbe.java.

import test from 'node:test';
import assert from 'node:assert';
import { Smenu, Color, Font } from './Smenu.js';

function stubGraphics() {
  return {
    setFont() {},
    getFontMetrics() {
      return {
        getHeight: () => 16,
        stringWidth: (s) => {
          if (s === "Option Alpha" || s === "Option Beta" || s === "Option Gamma" || s === "Stage Epsilon") return 79;
          if (s === "This is ") return 50;
          if (s.length > 8) return 100;
          return s.length * 6;
        },
      };
    },
    setColor() {},
    fillRect() {},
    drawRect() {},
    drawLine() {},
    drawString() {},
    setComposite() {},
  };
}

test('Smenu constructor and initial state match Java probe', () => {
  const menu = new Smenu(20);
  assert.strictEqual(menu.sel, 0);
  assert.strictEqual(menu.no, 0);
  assert.strictEqual(menu.x, 0);
  assert.strictEqual(menu.y, 0);
  assert.strictEqual(menu.w, 0);
  assert.strictEqual(menu.h, 0);
  assert.strictEqual(menu.shown, false);
  assert.strictEqual(menu.open, false);
  assert.strictEqual(menu.dis, false);
  assert.strictEqual(menu.maxl, 0);
  assert.strictEqual(menu.rooms, false);
  assert.strictEqual(menu.kmoused, 0);
  assert.strictEqual(menu.alphad, false);
  assert.strictEqual(menu.revup, false);
  assert.strictEqual(menu.carsel, false);
  assert.strictEqual(menu.flksel, false);
  assert.strictEqual(menu.om, false);
  assert.strictEqual(menu.onsc, false);
  assert.strictEqual(menu.scro, 0);
  assert.strictEqual(menu.scra, 0);
  assert.strictEqual(menu.opts.length, 20);
  assert.strictEqual(menu.sopts.length, 20);
});

test('Smenu add, addw, addstg operations match Java probe', () => {
  const g = stubGraphics();
  const menu = new Smenu(20);

  menu.add(g, "Option Alpha");
  menu.add(g, "Option Beta");
  menu.add(g, "Option Gamma");
  menu.addw("Short Delta", "Full Delta");
  menu.addstg("Stage Epsilon");

  assert.strictEqual(menu.no, 5);
  assert.strictEqual(menu.w, 300);
  assert.deepStrictEqual(menu.opts.slice(0, 5), ["Option Alpha", "Stage Epsilon", "Option Beta", "Option Gamma", "Full Delta"]);
  assert.deepStrictEqual(menu.sopts.slice(0, 5), ["Option Alpha", "Stage Epsilon", "Option Beta", "Option Gamma", "Short Delta"]);
});

test('Smenu selection, removal, and getItem match Java probe', () => {
  const g = stubGraphics();
  const menu = new Smenu(20);

  menu.add(g, "Option Alpha");
  menu.add(g, "Option Beta");
  menu.add(g, "Option Gamma");
  menu.addw("Short Delta", "Full Delta");
  menu.addstg("Stage Epsilon");

  menu.select("Option Beta");
  assert.strictEqual(menu.getSelectedIndex(), 2);

  menu.select(3);
  assert.strictEqual(menu.getSelectedIndex(), 3);

  // Out of bounds select does not change sel
  menu.select(100);
  assert.strictEqual(menu.getSelectedIndex(), 3);

  assert.strictEqual(menu.getItem(1), "Stage Epsilon");
  assert.strictEqual(menu.getItem(-1), "");

  menu.remove("Option Alpha");
  assert.strictEqual(menu.no, 4);
  assert.strictEqual(menu.sel, 3);
  assert.deepStrictEqual(menu.opts.slice(0, 4), ["Stage Epsilon", "Option Beta", "Option Gamma", "Full Delta"]);
  assert.deepStrictEqual(menu.sopts.slice(0, 4), ["Stage Epsilon", "Option Beta", "Option Gamma", "Short Delta"]);
});

test('Smenu draw method, open trigger, and scrolling match Java probe', () => {
  const g = stubGraphics();
  const menu = new Smenu(50);

  menu.add(g, "Option Alpha");
  menu.add(g, "Option Beta");
  menu.add(g, "Option Gamma");
  menu.addw("Short Delta", "Full Delta");
  menu.addstg("Stage Epsilon");

  menu.remove("Option Alpha");

  menu.shown = true;
  menu.x = 100;
  menu.y = 50;
  menu.w = 200;
  menu.h = 300;
  menu.bcol = new Color(200, 200, 200);
  menu.fcol = new Color(50, 50, 50);
  menu.alphad = true;
  menu.carsel = true;

  for (let i = 0; i < 15; i++) {
    menu.add(g, "Extra Item " + i);
  }

  // Draw 1: hover x=150, y=60, b=true, n3=400, b2=false -> triggers open
  const res1 = menu.draw(g, 150, 60, true, 400, false);
  assert.strictEqual(res1, true);
  assert.strictEqual(menu.open, true);
  assert.strictEqual(menu.om, true);
  assert.strictEqual(menu.onsc, false);
  assert.strictEqual(menu.scro, 0);
  assert.strictEqual(menu.scra, 0);

  // Draw 2: drag inside scrollbar n=290, n2=120, b=true, n3=200, b2=false -> computes scra & scro
  const res2 = menu.draw(g, 290, 120, true, 200, false);
  assert.strictEqual(res2, true);
  assert.strictEqual(menu.onsc, true);
  assert.strictEqual(menu.scra, 30);
  assert.strictEqual(menu.scro, -78);
  assert.strictEqual(menu.flksel, true);

  // Draw 3: reverse mode b2=true
  menu.open = true;
  menu.revup = true;
  const res3 = menu.draw(g, 290, 40, true, 200, true);
  assert.strictEqual(res3, true);
  assert.strictEqual(menu.onsc, true);
  assert.strictEqual(menu.scra, 0);
  assert.strictEqual(menu.scro, 0);
  assert.strictEqual(menu.flksel, false);
});

test('Smenu maxl string truncation matches Java probe', () => {
  const g = stubGraphics();
  const menu = new Smenu(10);
  menu.maxl = 80;
  menu.add(g, "This is a very long string that should be truncated by maxl");

  assert.strictEqual(menu.no, 1);
  assert.strictEqual(menu.opts[0], "This is a very long string that should be truncated by maxl");
  assert.strictEqual(menu.sopts[0], "This ...");
});
