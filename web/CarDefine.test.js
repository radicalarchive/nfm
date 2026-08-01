import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CarDefine } from './CarDefine.js';
import { Medium } from './Medium.js';
import { Trackers } from './Trackers.js';
import { ContO } from './ContO.js';
import { parseZip, entryText } from './vfs.js';
import { fr } from './java.js';

test('CarDefine constructor defaults match Java probe', () => {
  const m = new Medium();
  const t = new Trackers();
  const cd = new CarDefine(null, m, t, null);

  // All expected values verified against real Java class via CarDefineProbe.java
  assert.deepEqual(Array.from(cd.swits[0]), [50, 185, 282]);
  assert.deepEqual(Array.from(cd.swits[15]), [70, 210, 290]);
  assert.deepEqual(Array.from(cd.acelf[0]), [11.0, 5.0, 3.0]);
  assert.strictEqual(cd.handb[0], 7);
  assert.strictEqual(cd.airs[0], 1.0);
  assert.strictEqual(cd.airc[0], 70);
  assert.strictEqual(cd.turn[0], 6);
  assert.strictEqual(cd.grip[0], 20.0);
  assert.strictEqual(cd.bounce[0], 1.2000000476837158);
  assert.strictEqual(cd.simag[0], 0.8999999761581421);
  assert.strictEqual(cd.moment[0], 1.2999999523162842);
  assert.strictEqual(cd.comprad[0], 0.5);
  assert.strictEqual(cd.push[0], 2);
  assert.strictEqual(cd.revpush[0], 2);
  assert.strictEqual(cd.lift[0], 0);
  assert.strictEqual(cd.revlift[0], 0);
  assert.strictEqual(cd.powerloss[0], 2500000);
  assert.strictEqual(cd.flipy[0], -50);
  assert.strictEqual(cd.msquash[0], 7);
  assert.strictEqual(cd.clrad[0], 3300);
  assert.strictEqual(cd.dammult[0], 0.75);
  assert.strictEqual(cd.maxmag[0], 7600);
  assert.strictEqual(cd.dishandle[0], 0.6499999761581421);
  assert.strictEqual(cd.outdam[0], 0.6800000071525574);
  assert.strictEqual(cd.cclass[0], 0);
  assert.strictEqual(cd.names[0], 'Tornado Shark');
  assert.strictEqual(cd.enginsignature[0], 0);
});

test('CarDefine helper methods match Java probe', () => {
  const cd = new CarDefine(null, new Medium(), new Trackers(), null);

  // All expected values verified against real Java class via CarDefineProbe.java
  assert.strictEqual(cd.getvalue('stat', 'stat(180,160,140,120,100)', 0), 180);
  assert.strictEqual(cd.getvalue('stat', 'stat(180,160,140,120,100)', 4), 100);
  assert.strictEqual(cd.getvalue('stat', 'stat(250,-40,15,18,99)', 1), -40);

  assert.strictEqual(cd.getSvalue('carmaker', 'carmaker(TestUser,extra)', 0), 'TestUser');

  assert.strictEqual(cd.servervalue('0|key|clan|clankey', 0), 0);
  assert.strictEqual(cd.servervalue('-150|foo', 0), -150);

  assert.strictEqual(cd.serverSvalue('0|key|clan|clankey', 1), 'key');
});

test('CarDefine loadready matches Java probe', () => {
  const m = new Medium();
  const cd = new CarDefine(null, m, new Trackers(), null);

  cd.loadready();

  assert.strictEqual(cd.fails, '');
  assert.strictEqual(cd.nl, 0);
  assert.strictEqual(cd.action, 0);
  assert.strictEqual(m.csky[0], 170);
  assert.strictEqual(m.csky[1], 220);
  assert.strictEqual(m.csky[2], 255);
  assert.strictEqual(m.cfade[0], 255);
  assert.strictEqual(m.cfade[1], 220);
  assert.strictEqual(m.cfade[2], 220);
  assert.strictEqual(m.snap[0], 0);
  assert.strictEqual(m.snap[1], 0);
  assert.strictEqual(m.snap[2], 0);
});

test('CarDefine loadstat Case A (Normal car stats) matches Java probe', () => {
  const cd = new CarDefine(null, new Medium(), new Trackers(), null);

  const statTextA =
    'stat(180,160,140,120,100)\n' +
    'physics(80,70,60,50,40,30,20,10,50,40,30,20,10,3,2,100.0)\n' +
    'handling(150)\n' +
    'carmaker(TestMaker)\n' +
    'publish(1)\n';

  cd.loadstat(statTextA, 'CustomCarA', 400, -60, 200, 16);

  // All expected values verified against real Java class via CarDefineProbe.java
  assert.strictEqual(cd.names[16], 'CustomCarA');
  assert.strictEqual(cd.cclass[16], 4);
  assert.deepEqual(Array.from(cd.swits[16]), [86, 200, 303]);
  assert.deepEqual(Array.from(cd.acelf[16]), [11.359999656677246, 7.440000057220459, 4.119999885559082]);
  assert.strictEqual(cd.airs[16], 0.9081651568412781);
  assert.strictEqual(cd.airc[16], 49);
  assert.strictEqual(cd.powerloss[16], 5230000);
  assert.strictEqual(cd.moment[16], 1.2434782981872559);
  assert.strictEqual(cd.maxmag[16], 96);
  assert.strictEqual(cd.outdam[16], 0.5299999713897705);
  assert.strictEqual(cd.clrad[16], 1000);
  assert.strictEqual(cd.dammult[16], 0.3500000238418579);
  assert.strictEqual(cd.msquash[16], 2);
  assert.strictEqual(cd.flipy[16], -60);
  assert.strictEqual(cd.handb[16], 13);
  assert.strictEqual(cd.turn[16], 8);
  assert.strictEqual(cd.grip[16], 24.400001525878906);
  assert.strictEqual(cd.bounce[16], 1.100000023841858);
  assert.strictEqual(cd.lift[16], 2);
  assert.strictEqual(cd.revlift[16], 6);
  assert.strictEqual(cd.push[16], 2);
  assert.strictEqual(cd.revpush[16], 2);
  assert.strictEqual(cd.comprad[16], 1.10869562625885);
  assert.strictEqual(cd.simag[16], 3.906099796295166);
  assert.strictEqual(cd.dishandle[16], 0.75);
  assert.strictEqual(cd.createdby[0], 'TestMaker');
  assert.strictEqual(cd.publish[0], 1);
  assert.strictEqual(cd.enginsignature[16], 2);
});

test('CarDefine loadstat Case B (Low stats / compound assignment) matches Java probe', () => {
  const cd = new CarDefine(null, new Medium(), new Trackers(), null);

  const statTextB =
    'stat(50,50,50,50,50)\n' +
    'physics(10,20,5,75,40,30,20,10,50,40,30,20,10,1,0,85.5)\n' +
    'handling(40)\n' +
    'carmaker(LowMaker)\n' +
    'publish(0)\n';

  cd.loadstat(statTextB, 'CustomCarB', 200, -100, 50, 17);

  // All expected values verified against real Java class via CarDefineProbe.java
  assert.strictEqual(cd.names[17], 'CustomCarB');
  assert.strictEqual(cd.cclass[17], 0);
  assert.deepEqual(Array.from(cd.swits[17]), [84, 155, 260]);
  assert.deepEqual(Array.from(cd.acelf[17]), [11.714285850524902, 6.0, 3.142857074737549]);
  assert.strictEqual(cd.airs[17], 0.6363651752471924);
  assert.strictEqual(cd.airc[17], 23);
  assert.strictEqual(cd.powerloss[17], 5230000);
  assert.strictEqual(cd.moment[17], 1.3478261232376099);
  assert.strictEqual(cd.maxmag[17], 88);
  assert.strictEqual(cd.outdam[17], 0.5699999332427979);
  assert.strictEqual(cd.clrad[17], 1000);
  assert.strictEqual(cd.dammult[17], 0.3500000238418579);
  assert.strictEqual(cd.msquash[17], 2);
  assert.strictEqual(cd.flipy[17], -100);
  assert.strictEqual(cd.handb[17], 7);
  assert.strictEqual(cd.turn[17], 5);
  assert.strictEqual(cd.grip[17], 16.700000762939453);
  assert.strictEqual(cd.bounce[17], 1.25);
  assert.strictEqual(cd.lift[17], 2);
  assert.strictEqual(cd.revlift[17], 6);
  assert.strictEqual(cd.push[17], 2);
  assert.strictEqual(cd.revpush[17], 2);
  assert.strictEqual(cd.comprad[17], 0.595652163028717);
  assert.strictEqual(cd.simag[17], 1.4011000394821167);
  assert.strictEqual(cd.dishandle[17], 0.25);
  assert.strictEqual(cd.createdby[1], 'LowMaker');
  assert.strictEqual(cd.publish[1], 0);
  assert.strictEqual(cd.enginsignature[17], 0);
});

test('CarDefine loadstat Case C (Failed physics n6 <= 0) matches Java probe', () => {
  const cd = new CarDefine(null, new Medium(), new Trackers(), null);

  const statTextC =
    'stat(300,-50,16,250,50)\n' +
    'physics(-10,120,-5,-50,150,-20,80,-100,500,250,-10,20,-30,8,0,-20.0)\n' +
    'handling(300)\n' +
    'carmaker(ExtremeMaker)\n' +
    'publish(99)\n';

  cd.loadstat(statTextC, 'CustomCarC', -500, -120, -50, 18);

  // All expected values verified against real Java class via CarDefineProbe.java
  assert.strictEqual(cd.names[18], '');
  assert.strictEqual(cd.cclass[18], 0);
  assert.deepEqual(Array.from(cd.swits[18]), [0, 0, 0]);
});

test('CarDefine loadstat Case D (Negative parameters n, n2, n3 & extreme values) matches Java probe', () => {
  const cd = new CarDefine(null, new Medium(), new Trackers(), null);

  const statTextD =
    'stat(300,-50,16,250,50)\n' +
    'physics(-10,120,-5,-50,150,-20,80,-100,500,250,-10,20,-30,8,0,150.0)\n' +
    'handling(300)\n' +
    'carmaker(ExtremeMaker)\n' +
    'publish(99)\n';

  cd.loadstat(statTextD, 'CustomCarD', -500, -120, -50, 19);

  // All expected values verified against real Java class via CarDefineProbe.java
  assert.strictEqual(cd.names[19], 'CustomCarD');
  assert.strictEqual(cd.cclass[19], 0);
  assert.deepEqual(Array.from(cd.swits[19]), [100, 200, 310]);
  assert.deepEqual(Array.from(cd.acelf[19]), [9.0, 4.0, 3.0]);
  assert.strictEqual(cd.airs[19], 0.7064220905303955);
  assert.strictEqual(cd.airc[19], 0);
  assert.strictEqual(cd.powerloss[19], 4600000);
  assert.strictEqual(cd.moment[19], 1.7000000476837158);
  assert.strictEqual(cd.maxmag[19], 93);
  assert.strictEqual(cd.outdam[19], 0.35999998450279236);
  assert.strictEqual(cd.clrad[19], 1000);
  assert.strictEqual(cd.dammult[19], 0.30000001192092896);
  assert.strictEqual(cd.msquash[19], 3);
  assert.strictEqual(cd.flipy[19], -120);
  assert.strictEqual(cd.handb[19], 7);
  assert.strictEqual(cd.turn[19], 10);
  assert.strictEqual(cd.grip[19], 16.0);
  assert.strictEqual(cd.bounce[19], 0.800000011920929);
  assert.strictEqual(cd.lift[19], 0);
  assert.strictEqual(cd.revlift[19], 25);
  assert.strictEqual(cd.push[19], 2);
  assert.strictEqual(cd.revpush[19], 3);
  assert.strictEqual(cd.comprad[19], 0.4000000059604645);
  assert.strictEqual(cd.simag[19], -0.26889991760253906);
  assert.strictEqual(cd.dishandle[19], 1.0);
  assert.strictEqual(cd.createdby[3], 'ExtremeMaker');
  assert.strictEqual(cd.publish[3], 99);
  assert.strictEqual(cd.enginsignature[19], 0);
});

test('CarDefine loadcar successfully loads valid custom car RAD file matching Java probe', async () => {
  const zip = await parseZip(new Uint8Array(readFileSync(new URL('../data/models.zip', import.meta.url))));
  const formula7Raw = entryText(zip.get('formula7.rad'));

  const customHeader =
    'stat(150,150,150,150,150)\n' +
    'physics(50,50,50,50,50,50,50,50,50,50,50,50,50,50,1,1.0)\n' +
    'handling(100)\n' +
    'carmaker(TestAuthor)\n' +
    'publish(1)\n';
  const validCustomCarText = customHeader + formula7Raw;

  const bco = new Array(56).fill(null);
  const cd = new CarDefine(bco, new Medium(), new Trackers(), null);

  const res = cd.loadcar('custom_formula7', 16, validCustomCarText);

  // Exact integers and floats verified against real Java class via LoadCarProbe.java
  assert.strictEqual(res, 16);
  assert.ok(cd.bco[16] instanceof ContO);
  assert.strictEqual(cd.bco[16].npl, 186);
  assert.strictEqual(cd.bco[16].maxR, 181);
  assert.strictEqual(cd.bco[16].shadow, true);
  assert.strictEqual(cd.bco[16].noline, false);
  assert.strictEqual(cd.bco[16].decor, false);
  assert.strictEqual(cd.bco[16].tnt, 0);
  assert.strictEqual(cd.bco[16].disp, 0);
  assert.strictEqual(cd.bco[16].disline, 7);
  assert.strictEqual(cd.bco[16].grounded, 1.0);
  assert.strictEqual(cd.bco[16].roofat, -48);
  assert.strictEqual(cd.bco[16].wh, 18);

  assert.strictEqual(cd.names[16], 'custom_formula7');
  assert.strictEqual(cd.cclass[16], 4);
  assert.deepEqual(Array.from(cd.swits[16]), [72, 200, 296]);
  assert.deepEqual(Array.from(cd.acelf[16]), [8.363636016845703, 8.181818008422852, 3.8636364936828613]);
  assert.strictEqual(cd.handb[16], 11);
  assert.strictEqual(cd.airs[16], 0.9481651186943054);
  assert.strictEqual(cd.airc[16], 55);
  assert.strictEqual(cd.turn[16], 7);
  assert.strictEqual(cd.grip[16], 23.0);
  assert.strictEqual(cd.bounce[16], 1.100000023841858);
  assert.strictEqual(cd.simag[16], 0.8667000532150269);
  assert.strictEqual(cd.moment[16], 1.352173924446106);
  assert.strictEqual(cd.comprad[16], 0.5829347968101501);
  assert.strictEqual(cd.push[16], 2);
  assert.strictEqual(cd.revpush[16], 2);
  assert.strictEqual(cd.lift[16], 7);
  assert.strictEqual(cd.revlift[16], 16);
  assert.strictEqual(cd.powerloss[16], 4600000);
  assert.strictEqual(cd.flipy[16], -48);
  assert.strictEqual(cd.msquash[16], 8);
  assert.strictEqual(cd.clrad[16], 3750);
  assert.strictEqual(cd.dammult[16], 0.550000011920929);
  assert.strictEqual(cd.maxmag[16], 1);
  assert.strictEqual(cd.dishandle[16], 0.5);
  assert.strictEqual(cd.outdam[16], 0.7299998998641968);
  assert.strictEqual(cd.enginsignature[16], 1);
  assert.strictEqual(cd.createdby[0], 'TestAuthor');
  assert.strictEqual(cd.publish[0], 1);
});

test('CarDefine loadcar returns -1 for missing text or bad stats or npl <= 60 matching Java probe', async () => {
  const zip = await parseZip(new Uint8Array(readFileSync(new URL('../data/models.zip', import.meta.url))));
  const formula7Raw = entryText(zip.get('formula7.rad'));
  const opile1Raw = entryText(zip.get('opile1.rad'));

  const bco = new Array(56).fill(null);
  const cd = new CarDefine(bco, new Medium(), new Trackers(), null);

  // Missing text / null
  assert.strictEqual(cd.loadcar('nonexistent', 17, null), -1);
  assert.strictEqual(cd.loadcar('nonexistent', 17, undefined), -1);

  // Bad stats
  assert.strictEqual(cd.loadcar('badstat_car', 17, 'stat(invalid)\n' + formula7Raw), -1);

  // Small model npl <= 60 validation failure
  assert.strictEqual(cd.loadcar('opile1', 18, opile1Raw), -1);
});

