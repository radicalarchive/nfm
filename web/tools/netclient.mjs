// One netplay client, in its own process, driven over IPC instead of WebRTC.
//
// Separate processes are not a convenience here, they are the whole point: the
// PRNG and the draw-phase flag are module state, so two worlds inside one node
// process share a stream that two browser tabs never would, and a test built
// that way proves nothing about two machines.
//
// The parent (netloop.mjs) relays packets between two of these and compares
// their world hashes. Everything below the IPC seam -- InputSync, the tick
// gate, the order of pack/apply -- is the same code main.js runs.

import { readFileSync } from 'node:fs';
import { parseZip } from '../vfs.js';
import { Graphics2D } from '../graphics.js';
import { Medium } from '../Medium.js';
import { Trackers } from '../Trackers.js';
import { CheckPoints } from '../CheckPoints.js';
import { Control } from '../Control.js';
import { Record } from '../Record.js';
import { CarDefine } from '../CarDefine.js';
import { Mad } from '../Mad.js';
import { GameSparker } from '../GameSparker.js';
import { XtGraphics } from '../XtGraphics.js';
import { objArray, setSeed } from '../java.js';
import { InputSync, packInput, applyInput, worldHash } from '../netsync.js';

const R = new URL('../../', import.meta.url);
const readRepo = (p, enc) => readFileSync(new URL(p, R), enc);

const localIndex = parseInt(process.argv[2], 10);
const seed = parseInt(process.argv[3], 10);
const delay = parseInt(process.argv[4], 10);
const players = parseInt(process.argv[5], 10);
// How many interpolated frames this client draws per tick -- the asymmetry a
// shared PRNG stream would turn into a desync.
const interp = parseInt(process.argv[6], 10);

setSeed(seed);
const zip = await parseZip(new Uint8Array(readRepo('data/models.zip')));
const rd = new Graphics2D(null, null, 800, 450);
const medium = new Medium();
const trackers = new Trackers();
const checkPoints = new CheckPoints();
const array = objArray(124);
const gs = new GameSparker();
const cd = new CarDefine(array, medium, trackers, gs);
const xt = new XtGraphics(medium, cd, rd, gs);
const record = new Record(medium);
gs.loadbase(array, medium, trackers, zip);

const array2 = objArray(610);
const array3 = objArray(8);
for (let i = 0; i < 8; ++i) {
  array3[i] = new Mad(cd, medium, record, xt, i);
  gs.u[i] = new Control(medium);
}
xt.nplayers = players;
// A fixed grid, as the host would send it: never re-drawn per client.
for (let i = 0; i < 8; ++i) xt.sc[i] = [5, 2, 7, 1, 9, 3, 11, 5][i];
checkPoints.stage = 1;
gs.loadstage(array2, array, medium, trackers, checkPoints, xt, array3, record,
             readRepo('stages/1.txt', 'latin1'));
xt.starcnt = 0;                       // skip the intro; this is about sync
medium.trk = 0; medium.iw = 0; medium.ih = 0; medium.w = 800; medium.h = 450;

xt.im = localIndex;
xt.humans = new Set([0, 1]);
gs.u[1 - localIndex].human = true;

const sync = new InputSync(localIndex, [0, 1], delay);
const pad = new Control(medium);
let netTick = 0;

/**
 * Everything worth comparing, per car, as name/value pairs.
 *
 * Deliberately wider than the world hash: the hash is the shipping detector
 * and has to stay cheap, while this exists to answer "which field first" and
 * is only paid in a test. `mesh` matters more than it looks -- the collision
 * geometry is deformed by regx/regy/regz and read back as damage, so it can
 * diverge a thousand ticks before any position does.
 */
function stateVector() {
  return [0, 1, 2, 3].map((i) => {
    const o = array2[i], m = array3[i];
    let mesh = 0x811c9dc5;
    for (let q = 0; q < o.npl; q++) {
      const pl = o.p[q];
      // pl.ox.length, NOT pl.n: Plane.s() sets n to 12 or 20 as a distance
      // LOD, so hashing to `n` makes this a function of the CAMERA -- and each
      // client has its own camera. That produced a convincing phantom "mesh
      // desync at tick 3" that cost an hour.
      for (let r = 0; r < pl.ox.length; r++) {
        for (const v of [pl.ox[r], pl.oy[r], pl.oz[r]]) {
          mesh ^= v | 0;
          mesh = Math.imul(mesh, 16777619) >>> 0;
        }
      }
    }
    return ['x', o.x, 'y', o.y, 'z', o.z, 'xz', o.xz, 'xy', o.xy, 'zy', o.zy,
            'speed', m.speed, 'power', m.power, 'powerup', m.powerup,
            'hitmag', m.hitmag, 'nlaps', m.nlaps, 'trcnt', m.trcnt,
            'travxy', m.travxy, 'travzy', m.travzy, 'travxz', m.travxz,
            'surfer', m.surfer, 'capsized', m.capsized, 'skid', m.skid,
            'mxz', m.mxz, 'fixes', m.fixes, 'cntdest', m.cntdest,
            'mesh', mesh >>> 0].join(',');
  });
}

/** A scripted input, different per client, deterministic from the tick. */
function drive(t) {
  pad.up = true;
  pad.left = localIndex === 0 && (t % 40) < 12;
  pad.right = localIndex === 1 ? (t % 30) < 10 : (t % 55) < 8;
  pad.handb = (t % 97) === 0;
  pad.steer = localIndex === 0 ? Math.sin(t / 9) : -Math.cos(t / 13);
}

process.on('message', (m) => {
  if (m.k === 'packet') sync.decode(Uint8Array.from(m.b));
  else if (m.k === 'run') pump();
});

const TARGET = parseInt(process.argv[7], 10);

function pump() {
  // Run every tick whose inputs have arrived, then hand control back so the
  // parent can deliver more packets. Exactly the shape of main.js's frame().
  for (;;) {
    if (netTick >= TARGET) {
      process.send({ k: 'done', tick: netTick });
      return;
    }
    const future = netTick + delay;
    if (sync.lastSent < future) {
      drive(future);
      const packed = packInput(pad);
      sync.setLocal(future, packed);
      applyInput(pad, packed);
      sync.lastSent = future;
      process.send({ k: 'packet', b: Array.from(sync.encode(future)) });
    }
    if (!sync.ready(netTick)) {
      process.send({ k: 'stalled', tick: netTick, missing: sync.missing(netTick) });
      return;
    }
    applyInput(gs.u[0], sync.get(0, netTick));
    applyInput(gs.u[1], sync.get(1, netTick));

    rd.begin();
    gs.tick(rd, medium, trackers, checkPoints, xt, record, array2, array3);
    for (let f = 0; f < interp; f++) {
      medium.interpolating = true;
      rd.begin(true);
      gs.draw(rd, medium, xt, array2, array3);
      medium.interpolating = false;
    }
    netTick++;
    if (netTick % 1 === 0) {
      process.send({ k: 'hash', tick: netTick, h: worldHash(array2, array3, xt.nplayers),
                     sim: globalThis.__simCalls || 0, mr: globalThis.__mrand || 0, tally: [...(globalThis.__mtally||new Map())],
                     cars: [0,1,2,3].map(i=>{const o=array2[i],m=array3[i];
                       return ['x',o.x,'y',o.y,'z',o.z,'xz',o.xz,'xy',o.xy,'zy',o.zy,
                        'speed',m.speed,'power',m.power,'powerup',m.powerup,'xtpower',m.xtpower,
                        'hitmag',m.hitmag,'nlaps',m.nlaps,'trcnt',m.trcnt,'lxz',m.lxz,'srfcnt',m.srfcnt,'travxy',m.travxy,'travzy',m.travzy,'surfer',m.surfer,
                        'capsized',m.capsized,'wtouch',m.wtouch,'gtouch',m.gtouch,'mtouch',m.mtouch,
                        'skid',m.skid,'loop',m.loop,'mxz',m.mxz,'travxz',m.travxz,'tilt',m.tilt,
                        'rpdcatch',m.rpdcatch,'fixes',m.fixes,'cntdest',m.cntdest,'mesh',(()=>{let h=0x811c9dc5;const o=array2[i];for(let q=0;q<o.npl;q++){const pl=o.p[q];for(let r=0;r<pl.n;r++){h^=pl.ox[r]|0;h=Math.imul(h,16777619)>>>0;h^=pl.oz[r]|0;h=Math.imul(h,16777619)>>>0;h^=pl.oy[r]|0;h=Math.imul(h,16777619)>>>0;}}return h>>>0;})()].join(',');}) });
    }
  }
}

// Report the world BEFORE any tick runs. Nothing checked construction until
// now, and "identical at tick 1" does not imply "identical at tick 0".
process.send({ k: 'hash', tick: 0, h: worldHash(array2, array3, xt.nplayers), cars: stateVector() });
process.send({ k: 'ready' });
