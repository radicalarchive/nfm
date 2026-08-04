// Write stat()/physics()/handling() into the sixteen base models.
//
//   node web/tools/embedstats.mjs [--write]
//
// The game keeps the original cars' handling in CarDefine's constructor tables
// (handb[], grip[], lift[], maxmag[], ...) and derives those SAME tables from a
// custom car's stat()/physics() lines at load time. So the sixteen ship with
// their numbers in the code and nothing in their .rad, which is why the Car
// Maker shows them as blank and why saving one produced a car the launcher
// would not list -- loadstat() rejects anything without both lines.
//
// This closes that gap by solving the derivation backwards: for each car, pick
// the physics() arguments whose derived tables land closest to the hand-authored
// ones. Not by re-implementing the formulas -- by RUNNING loadstat() into a
// scratch slot and comparing, so the search is checked against the same code
// the game runs and cannot drift from it.
//
// Where the mapping is many-to-one the fit is exact anyway (integer truncation
// leaves a whole band of inputs that produce the target). Where it is genuinely
// lossy the report prints the residual; see TASKS.md for the follow-up that
// would make the .rad the single source of truth.

import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { parseZip, entryText } from '../vfs.js';
import { CAR_NAMES } from '../GameSparker.js';
import { CarDefine } from '../CarDefine.js';
import { ContO } from '../ContO.js';
import { Medium } from '../Medium.js';
import { Trackers } from '../Trackers.js';
import { newCarMaker } from '../careditor/state.js';

const ZIP = new URL('../../data/models.zip', import.meta.url);
const SCRATCH = 16;              // the slot we solve in, never one of the 16

// The Car Maker's own table of the sixteen cars' stats (state.js, from
// CarMaker.java:126). This is what the desktop editor shows when you pick a
// stock car to compare against, so it IS their stat() line -- no solving needed.
const CARSTAT = newCarMaker().carstat;

/** A CarDefine holding the hand-authored tables, untouched. */
function targets() {
  const cd = new CarDefine(new Medium(), new Trackers());
  return cd;
}

/** Everything loadstat() writes, for one slot. */
const FIELDS = [
  'handb', 'turn', 'grip', 'bounce', 'airs', 'airc', 'powerloss', 'lift',
  'revlift', 'push', 'revpush', 'moment', 'comprad', 'simag', 'maxmag',
  'dammult', 'msquash', 'clrad', 'outdam', 'dishandle', 'enginsignature',
];

function snapshot(cd, slot) {
  return Object.fromEntries(FIELDS.map((f) => [f, cd[f][slot]]));
}

function radText(zip, entry) {
  const bytes = zip.get(`${entry}.rad`);
  if (!bytes) throw new Error(`models.zip has no ${entry}.rad`);
  return entryText(bytes);
}

/** Strip any block this tool wrote before, so re-running is idempotent. */
function stripBlock(text) {
  return text.replace(/\n*\/\/ ---- stats, embedded[\s\S]*$/, '\n');
}

const line = (stat, phys, crash, eng, actmag) =>
  `stat(${stat.join(',')})\nphysics(${[...phys, ...crash, eng, actmag].join(',')})`;

/**
 * Load one candidate into the scratch slot and report what it produced.
 * `geom` is what loadcar() measures off the parsed model before calling
 * loadstat: the radius, the roof height and the wheel count.
 */
function tryCandidate(cd, text, stat, phys, crash, eng, actmag, geom, handling) {
  const body = `${text}\n\n${line(stat, phys, crash, eng, actmag)}\nhandling(${handling})\n`;
  cd.loadstat(body, 'probe', geom.maxR, geom.roofat, geom.wh, SCRATCH);
  return snapshot(cd, SCRATCH);
}

/** Scan one physics slot over 0..100, keeping the value that fits best. */
function solveSlot(fit, index, weigh) {
  let best = 50, bestErr = Infinity;
  for (let v = 0; v <= 100; ++v) {
    const err = weigh(fit(index, v));
    if (err < bestErr) { bestErr = err; best = v; }
  }
  return { value: best, err: bestErr };
}

const rel = (got, want) => (want === 0 ? Math.abs(got) : Math.abs(got - want) / Math.abs(want));

async function main() {
  const write = process.argv.includes('--write');
  const zip = await parseZip(new Uint8Array(readFileSync(ZIP)));
  const want = targets();
  const cd = targets();
  const m = new Medium();
  const t = new Trackers();

  const out = [];
  const report = [];

  for (let i = 0; i < CAR_NAMES.length; ++i) {
    const entry = CAR_NAMES[i];
    const text = stripBlock(radText(zip, entry));
    const target = snapshot(want, i);

    // Geometry, measured the way loadcar() measures it.
    m.loadnew = true;
    const o = new ContO(new TextEncoder().encode(text), m, t);
    m.loadnew = false;
    const geom = { maxR: o.maxR, roofat: o.roofat, wh: o.wh };

    const stat = Array.from(CARSTAT[i]);
    const eng = want.enginsignature[i];
    const handling = Math.max(50, Math.min(200, Math.round(want.dishandle[i] * 200)));

    const phys = [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50];
    const crash = [50, 50, 50];
    let actmag = 10000;

    const fit = (mutate) => {
      const p = phys.slice(), c = crash.slice();
      let a = actmag;
      mutate(p, c, (v) => { a = v; });
      return tryCandidate(cd, text, stat, p, c, eng, a, geom, handling);
    };
    const at = (idx, v) => fit((p) => { p[idx] = v; });
    const atCrash = (idx, v) => fit((p, c) => { c[idx] = v; });

    // Independent slots first: each drives exactly one table.
    phys[0] = solveSlot(at, 0, (g) => rel(g.handb, target.handb)).value;
    phys[1] = solveSlot(at, 1, (g) => rel(g.turn, target.turn)).value;
    phys[2] = solveSlot(at, 2, (g) => rel(g.grip, target.grip)).value;
    phys[3] = solveSlot(at, 3, (g) => rel(g.bounce, target.bounce)).value;
    phys[5] = solveSlot(at, 5, (g) => rel(g.lift, target.lift)).value;
    phys[6] = solveSlot(at, 6, (g) => rel(g.revlift, target.revlift)).value;
    phys[8] = solveSlot(at, 8, (g) => rel(g.revpush, target.revpush)).value;
    // Pushes Others is scaled by (30 - lift) / 30 in INTEGER division, so any
    // car with lift at all pins push to 2 and the argument cannot be recovered.
    phys[7] = solveSlot(at, 7, (g) => rel(g.push, target.push)).value;

    // The two aerial slots share airs, airc and powerloss, and bounce rescales
    // the first two, so they have to be solved together and after phys[3].
    let bestErr = Infinity;
    for (let a = 0; a <= 100; ++a) {
      for (let b = 0; b <= 100; ++b) {
        const g = fit((p) => { p[9] = a; p[10] = b; });
        const err = rel(g.airs, target.airs) * 2 + rel(g.airc, target.airc)
                  + rel(g.powerloss, target.powerloss) * 0.5;
        if (err < bestErr) { bestErr = err; phys[9] = a; phys[10] = b; }
      }
    }

    crash[0] = solveSlot(atCrash, 0, (g) => rel(g.clrad, target.clrad)).value;
    crash[1] = solveSlot(atCrash, 1, (g) => rel(g.dammult, target.dammult)).value;
    crash[2] = solveSlot(atCrash, 2, (g) => rel(g.msquash, target.msquash)).value;

    // maxmag is actmag scaled by an endurance factor, so it inverts directly --
    // and it has to be > 0 or loadstat() rejects the car outright.
    {
      let best = 1, bestE = Infinity;
      const probe = (v) => fit((p, c, setA) => setA(v));
      // Two passes: coarse over the decade, then fine.
      for (let v = 1000; v <= 60000; v += 100) {
        const e = rel(probe(v).maxmag, target.maxmag);
        if (e < bestE) { bestE = e; best = v; }
      }
      for (let v = Math.max(1, best - 200); v <= best + 200; ++v) {
        const e = rel(probe(v).maxmag, target.maxmag);
        if (e < bestE) { bestE = e; best = v; }
      }
      actmag = best;
    }

    const got = tryCandidate(cd, text, stat, phys, crash, eng, actmag, geom, handling);
    const drift = FIELDS
      .map((f) => [f, rel(got[f], target[f])])
      .filter(([, e]) => e > 0.02)
      .map(([f, e]) => `${f} ${target[f]}→${got[f]} (${(e * 100).toFixed(0)}%)`);
    report.push(`${want.names[i].padEnd(16)} ${drift.length ? drift.join(', ') : 'exact'}`);

    const block = [
      '', '', '// ---- stats, embedded from CarDefine\'s own tables by',
      '// web/tools/embedstats.mjs. The game reads these for custom cars and',
      '// ignores them for the original sixteen, which keep the same numbers in',
      '// code -- so they change nothing about how this car races.',
      '', line(stat, phys, crash, eng, actmag), '', `handling(${handling})`, '', '',
    ].join('\n');
    out.push({ entry, text: text.replace(/\s*$/, '') + block });
  }

  console.log(report.join('\n'));
  if (!write) {
    console.log('\n(dry run; pass --write to update data/models.zip)');
    return;
  }

  // Rewrite the archive in place. `zip` cannot update a file it did not create
  // a directory for, so patch each entry through the system zip tool against a
  // scratch copy of the tree.
  const dir = execFileSync('mktemp', ['-d']).toString().trim();
  for (const { entry, text } of out) writeFileSync(`${dir}/${entry}.rad`, text, 'latin1');
  execFileSync('zip', ['-q', '-j', new URL(ZIP).pathname,
    ...out.map(({ entry }) => `${dir}/${entry}.rad`)]);
  execFileSync('rm', ['-rf', dir]);
  console.log(`\nupdated ${out.length} entries in data/models.zip`);
}

main();
