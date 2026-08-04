// The game's own help, wired to the controls that carry it.
//
// CarMaker ships fifteen help texts in `usage[]` and shows one in a modal when
// you click a label in the physics pane. They are the author's descriptions of
// what each variable does -- there is no better copy to write -- so they become
// the tooltips here, and nothing is retyped: the array is read straight out of
// the transpiled constructor.
//
// usage[4] is the joke the author left for whoever decompiled the applet. It
// sits in the "Empty" physics slot, which the editor does not show.

import { newCarMaker } from './state.js';

const usage = newCarMaker().usage;

/** Help for physics slot 0..10, by the same index physics() uses. */
export const physicsHelp = (i) => usage[i] || '';

/** Help for crash slot 0..2 (radius, magnitude, roof destruction). */
export const crashHelp = (i) => usage[12 + i] || '';

/** The crash test's own instructions -- the ones its Test button pops up. */
export const crashTestHelp = usage[11];

// Nothing in usage[] covers the rest, so these are written here -- from the
// game's own on-screen captions and error messages where it has them.
//
// House rule for anything the PLAYER reads: describe the car, not the code.
// No internal class names, no "the original", no file paths. Directive names
// like stat() or ScaleX() are fair game, because the source pane is right there
// and they can see them.
export const STAT_HELP = {
  Speed: 'Top speed. The five stats share a fixed budget, so raising one lowers the others.',
  Acceleration: 'How hard the car pulls away from a standstill and out of corners.',
  Stunts: 'How well the car flips and spins in mid-air. Also makes the two aerial settings on the Physics tab count for more.',
  Strength: 'How hard the car is to wreck — how much punishment it takes before it is wasted.',
  Endurance: 'How well the car keeps going once it is damaged, over a whole race.',
};

export const CLASS_HELP =
  'A class is a points budget shared between the five stats: Class A cars get 680 to ' +
  'spend, Class C gets 520. That is why raising one stat lowers the others. Pick a ' +
  'higher class for a stronger car, and it will race against tougher opponents.';

export const SCALE_HELP =
  'Stretch or shrink the whole car along one axis — 100% leaves it as built. Use this ' +
  'to get the size right without redrawing anything. The game will not race a car that ' +
  'is far too big or too small; the radius beside the preview should sit between 120 ' +
  'and 400.';

export const ALIGN_HELP =
  'Move or turn the whole car. Rotate if you built it facing the wrong way — it should ' +
  'point away from you, nose at the far end. Nudge to centre it, so it turns about its ' +
  'middle instead of swinging around some point off to one side.';

export const ENGINE_HELP =
  'The engine your car sounds like, and how its power comes on. Pick the one closest ' +
  'to the kind of car you have built.';
