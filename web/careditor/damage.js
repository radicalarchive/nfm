// The crash test: what the car will look like once the race has beaten it up.
//
// This is the one place the editor cannot work from the .rad text, because
// damage is not a property of the car -- it is what the game's deformation code
// does to a loaded model. So the ported math runs here, on the same ContO the
// preview draws, and the "Fix" button simply re-parses the source to throw the
// damage away.
//
// regx/regz/roofsqsh are transpiled from CarMaker verbatim; the only thing this
// file adds is a scratch state for them to write into and a sane calling order.

import { regx, regz, roofsqsh } from './shape.js';
import { trunc, fr, i32 } from '../java.js';

/**
 * One round of collision damage, the way the applet's CRASH! button delivers
 * it: four hits of decaying force, alternating between the two axes, with the
 * car swinging round between them so the dents do not all land in one place.
 *
 * `cm` needs `o`, `m`, `crash[]`, `hitmag` and `actmag` -- the fields the ported
 * deformation reads. The editor hands it the same CarMaker state bag it keeps
 * for exactly this.
 */
export function crashOnce(cm, { sideways = Math.random() > 0.5 } = {}) {
  let force = 700;
  for (let i = 0; i < 4; ++i) {
    const key = i;
    force = i32(force - 50 * i);
    if (force < 150) force = 150;
    if (sideways) regx(cm, key, fr(force), false);
    else regz(cm, key, fr(force), false);
  }
  // Turn the car between rounds, so repeated crashes chew a different corner.
  cm.o.xz = i32(cm.o.xz + (sideways ? 22 : -22));
}

/** A roof landing: the crush that happens when the car comes down upside down. */
export function roofCrash(cm) {
  cm.crashup = Math.random() > 0.5;
  roofsqsh(cm, fr(trunc(fr(230.0 + fr(Math.random() * 80.0)))));
}

/** True once the car has taken all the damage the game models. */
export const isWasted = (cm) => cm.hitmag >= 17000;
