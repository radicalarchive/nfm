// Minimal stand-in for xtGraphics.
//
// The real xtGraphics.java is 10,511 lines and is almost entirely menus, car
// select, stage select and the chat/multiplayer UI -- all out of scope for the
// race-only spike. The race path touches only the handful of fields and
// methods below, so this shim provides exactly those rather than dragging in
// the whole class.
//
// The one method with real behaviour worth porting later is stat() -- the
// in-race HUD. It is stubbed here; the game renders and drives without it.

import { intArray } from './java.js';

export class XtGraphics {
  constructor() {
    // --- fields loadstage() and the fase==0 tick read ---
    this.fase = 0;
    this.nplayers = 7;
    this.sc = Int32Array.from([0, 0, 0, 0, 0, 0, 0, 0]);      // selected car per player
    this.xstart = Int32Array.from([0, -350, 350, 0, -350, 350, 0, 0]);
    this.zstart = Int32Array.from([-760, -380, -380, 0, 380, 380, 760, 0]);
    this.multion = 0;          // 0 = offline. Multiplayer is dropped.
    this.newparts = false;
    this.testdrive = 0;
    this.loadedt = false;
    this.starcnt = 0;
    this.im = 0;
    this.asay = '';
    this.sndsize = intArray(64);
    this.gmode = 0;
    this.flipo = 0;

    // --- fields Mad / Control / Record read directly ---
    // Missing any of these does not fail at load; it throws mid-race the first
    // time the relevant event fires (a collision, a skid, a lap completing),
    // which is why the first build crashed on impact rather than on boot.
    this.beststunt = 0;
    this.dcrashes = intArray(8);      // per-player crash counters
    this.fastestlap = 0;
    this.laptime = 0;
    this.isbot = new Array(8).fill(false);
    this.lan = false;
    this.mutes = false;
    this.carfixed = { play() {} };    // soundClip; audio is deferred
  }

  // --- sound hooks -----------------------------------------------------------
  // All four are audio in the original (impact, scrape, ground-scrape, tyre
  // skid). They are called from Mad.drive/colide on collision, landing and
  // sliding. Stubbed until the AudioWorklet path exists -- deliberately kept
  // as named no-ops so the call sites stay line-for-line with the Java.

  /** Impact sound. crash(float magnitude, int player) */
  crash(_a, _n) {}

  /** Body-on-ground scrape. gscrape(int, int, int) */
  gscrape(_n, _n2, _n3) {}

  /** Body-on-body scrape. scrape(int, int, int) */
  scrape(_n, _n2, _n3) {}

  /** Tyre skid. skid(int, float) */
  skid(_n, _n2) {}

  // --- stubs. Named and left in place so the call sites stay line-for-line
  //     with GameSparker.java rather than being edited out.

  /** Per-stage colour tint setup. Visual only; no effect on physics. */
  snap(_stage) {}

  /** Resets the HUD's per-stage counters. */
  resetstat(_stage) {}

  /** Recolours a car model for player n. Visual only. */
  colorCar(_contO, _n) {}

  /** TODO: the in-race HUD -- speed, position, lap, damage bars, wasted text.
   *  This is the one xtGraphics method genuinely worth porting for the race.
   *  Everything renders correctly without it; you simply get no overlay. */
  stat(_mad, _contO, _checkPoints, _control, _follow) {}

  loadingstage(_stage, _b) {}
  trackbg(_b) {}
  stoploading() {}
  playsounds() {}
}
