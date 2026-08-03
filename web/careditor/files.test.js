import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  setupo,
  loadfile,
  savefile,
  newcar,
  delcar,
  rencar,
  loadsettings,
  savesettings,
  checko,
  fixtext,
  getvalue,
  getSvalue,
  servervalue,
  serverSvalue,
  objvalue
} from './files.js';
import { Medium } from '../Medium.js';
import { Trackers } from '../Trackers.js';
import { ContO } from '../ContO.js';
import { intArray } from '../java.js';

// Helper mock state for CarMaker
// Every widget hidefields() touches. The Java hides them unconditionally, so a
// mock that omits one is a mock that hides a call from the test.
const hideable = () => ({ _hidden: false, hide() { this._hidden = true; }, show() { this._hidden = false; } });

function createMockCarMaker() {
  const cm = {
    pubtyp: hideable(),
    pubitem: hideable(),
    tpass: hideable(),
    witho: hideable(),
    wv: Array.from({ length: 16 }, hideable),
    simcar: hideable(),
    engine: hideable(),
    cls: hideable(),
    compcar: hideable(),
    fontsel: hideable(),
    ctheme: hideable(),
    srch: hideable(),
    rplc: hideable(),
    editor: {
      _text: '', _hidden: false,
      getText() { return this._text; },
      setText(val) { this._text = val; },
      hide() { this._hidden = true; },
      show() { this._hidden = false; }
    },
    tnick: {
      _text: '', _hidden: false,
      getText() { return this._text; },
      setText(val) { this._text = val; },
      hide() { this._hidden = true; },
      show() { this._hidden = false; }
    },
    slcar: {
      _items: [],
      _selected: 0,
      _hidden: false,
      hide() { this._hidden = true; },
      show() { this._hidden = false; },
      remove(s) {
        this._items = this._items.filter(item => item !== s);
      },
      select(n) {
        this._selected = n;
      }
    },
    m: new Medium(),
    t: new Trackers(),
    o: null,
    ox: 0,
    oy: 0,
    oz: 0,
    oxz: 0,
    oxy: 0,
    ozy: 0,
    forwheels: false,
    squash: 0,
    hitmag: 0,
    loadedfile: false,
    lastedo: '',
    carname: '',
    changed: false,
    sfase: 0,
    tabed: 0,
    scar: '',
    suser: '',
    sfont: '',
    cfont: '',
    sthm: 0,
    cthm: 0,
    stat: intArray(5),
    phys: intArray(11),
    crash: intArray(3),
    engsel: 0,
    objfacend: false,
    multf10: false,
    hidefieldsCalled: false,
    hidefields() { this.hidefieldsCalled = true; },
    dialogMessages: [],
    showMessageDialog(parent, msg, title, type) {
      this.dialogMessages.push({ parent, msg, title, type });
    }
  };
  return cm;
}

test('getvalue — numeric extraction & 32-bit float precision', () => {
  // All expected values verified against Java reflection probe FilesProbe.java
  assert.equal(getvalue('stat', 'stat(180,160,140,120,100)', 0), 180); // probe: 180
  assert.equal(getvalue('stat', 'stat(180,160,140,120,100)', 4), 100); // probe: 100
  assert.equal(getvalue('stat', 'stat(250,-40,15,18,99)', 1), -40);  // probe: -40
  assert.equal(getvalue('physics', 'physics(10,20,30,40,50,60,70,80,90,100,110,120,130,140,150)', 14), 150); // probe: 150
  assert.equal(getvalue('handling', 'handling(-12345)', 0), -12345); // probe: -12345

  // 32-bit float precision overflow (99999999f -> 100000000)
  assert.equal(getvalue('test', 'test(99999999)', 0), 100000000); // probe: 100000000
  assert.equal(getvalue('test', 'test(-2147483648)', 0), -2147483648); // probe: -2147483648

  // Throws on malformed input
  assert.throws(() => getvalue('stat', 'stat(invalid)', 0), /For input string/);
});

test('getSvalue — string extraction', () => {
  // All expected values verified against Java reflection probe FilesProbe.java
  assert.equal(getSvalue('stat', 'stat(abc,def,ghi)', 0), 'abc'); // probe: "abc"
  assert.equal(getSvalue('stat', 'stat(abc,def,ghi)', 1), 'def'); // probe: "def"
  assert.equal(getSvalue('stat', 'stat(abc,def,ghi)', 2), 'ghi'); // probe: "ghi"
  assert.equal(getSvalue('car', 'car(My Super Car,v1.0)', 0), 'My Super Car'); // probe: "My Super Car"
  assert.equal(getSvalue('car', 'car(My Super Car,v1.0)', 1), 'v1.0'); // probe: "v1.0"
});

test('servervalue — server pipe delimited int extraction', () => {
  // All expected values verified against Java reflection probe FilesProbe.java
  assert.equal(servervalue('100|200|-300|400', 0), 100);  // probe: 100
  assert.equal(servervalue('100|200|-300|400', 2), -300); // probe: -300
  assert.equal(servervalue('100|200|-300|400', 5), -1);   // probe: -1
  assert.equal(servervalue('|||', 1), -1);                // probe: -1
  assert.equal(servervalue('abc', 0), -1);                // probe: -1
});

test('serverSvalue — server pipe delimited string extraction', () => {
  // All expected values verified against Java reflection probe FilesProbe.java
  assert.equal(serverSvalue('alpha|beta|gamma', 0), 'alpha'); // probe: "alpha"
  assert.equal(serverSvalue('alpha|beta|gamma', 1), 'beta');  // probe: "beta"
  assert.equal(serverSvalue('alpha|beta|gamma', 2), 'gamma'); // probe: "gamma"
  assert.equal(serverSvalue('alpha|beta|gamma', 5), '');      // probe: ""
});

test('objvalue — .rad 3D vertex token parser', () => {
  const cm = createMockCarMaker();

  // Standard index parsing (index - 1)
  cm.multf10 = false;
  cm.objfacend = false;
  assert.equal(objvalue(cm, '<p 10 20 30>', 0), 9); // probe: 9
  assert.equal(cm.objfacend, false);
  assert.equal(objvalue(cm, '<p 10 20 30>', 1), 19); // probe: 19
  assert.equal(cm.objfacend, false);
  // Index 30/2 trailing character '>' causes NumberFormatException in Java -> returns 0, objfacend=true
  assert.equal(objvalue(cm, '<p 10 20 30>', 2), 0); // probe: 0
  assert.equal(cm.objfacend, true);

  // Negative / slashed format
  cm.objfacend = false;
  assert.equal(objvalue(cm, '<p -10/-20/30>', 0), 0); // probe: 0
  assert.equal(cm.objfacend, true);

  // multf10 = true
  cm.multf10 = true;
  cm.objfacend = false;
  assert.equal(objvalue(cm, '<p 50 60>', 0), 500); // probe: 500
  assert.equal(objvalue(cm, '<p -5.5 10>', 0), -55); // probe: -55
});

test('fixtext — sanitize text input', () => {
  const tf = {
    text: 'test"quote\\slash|pipe(parens)',
    selectedStart: -1,
    selectedEnd: -1,
    getText() { return this.text; },
    setText(t) { this.text = t; },
    select(s, e) { this.selectedStart = s; this.selectedEnd = e; }
  };
  fixtext(tf);
  assert.equal(tf.text, 'testquoteslash');
  assert.equal(tf.selectedStart, 28);
  assert.equal(tf.selectedEnd, 28);
});

test('loadfile & savefile — IO seam', () => {
  const cm = createMockCarMaker();
  const sampleRad = '<p>\nc(100,200,100)\np(-40,-50,80)\n</p>\n';

  loadfile(cm, sampleRad);
  assert.equal(cm.loadedfile, true);
  assert.equal(cm.lastedo, sampleRad);
  assert.equal(cm.editor.getText(), sampleRad);

  const saved = savefile(cm);
  assert.equal(saved, sampleRad);
  assert.equal(cm.changed, false);
});

test('newcar, delcar, rencar — IO seam data handlers', () => {
  const cm = createMockCarMaker();

  const resNew = newcar(cm, 'MyCar');
  assert.equal(resNew.ok, true);
  assert.equal(resNew.name, 'MyCar');
  assert.match(resNew.text, /\/\/ car: MyCar/);
  assert.equal(cm.carname, 'MyCar');
  assert.equal(cm.sfase, 0);

  const resRen = rencar(cm, 'RenamedCar');
  assert.equal(resRen.ok, true);
  assert.equal(resRen.oldName, 'MyCar');
  assert.equal(resRen.newName, 'RenamedCar');
  assert.equal(cm.carname, 'RenamedCar');

  cm.slcar._items = ['RenamedCar', 'OtherCar'];
  const resDel = delcar(cm, 'RenamedCar');
  assert.equal(resDel.ok, true);
  assert.deepEqual(cm.slcar._items, ['OtherCar']);
});

test('loadsettings & savesettings — settings IO seam', () => {
  const cm = createMockCarMaker();
  const settingsStr = 'MyCar\nPlayer1\nMonospaced\n3\n';

  loadsettings(cm, settingsStr);
  assert.equal(cm.scar, 'MyCar');
  assert.equal(cm.carname, 'MyCar');
  assert.equal(cm.suser, 'Player1');
  assert.equal(cm.tnick.getText(), 'Player1');
  assert.equal(cm.sfont, 'Monospaced');
  assert.equal(cm.cfont, 'Monospaced');
  assert.equal(cm.sthm, 3);
  assert.equal(cm.cthm, 3);

  cm.carname = 'NewCar';
  const savedSettings = savesettings(cm);
  assert.equal(savedSettings, 'NewCar\nPlayer1\nMonospaced\n3\n\n');
  assert.equal(cm.scar, 'NewCar');
});

test('checko — car validation', () => {
  const cm = createMockCarMaker();
  const simpleCarPath = existsSync('/home/evan/games/nfm/mycars/Simple Car.rad')
    ? '/home/evan/games/nfm/mycars/Simple Car.rad'
    : '/home/evan/games/nfm/data/Simple Car.rad';
  const validRad = readFileSync(simpleCarPath, 'utf-8');

  const result = checko(cm, 'Racing', validRad);
  assert.equal(result, true);
});

test('roundtrip real .rad files in mycars/ and data/', () => {
  const dirPath = existsSync('/home/evan/games/nfm/mycars')
    ? '/home/evan/games/nfm/mycars'
    : '/home/evan/games/nfm/data';

  const files = readdirSync(dirPath).filter(f => f.endsWith('.rad'));
  assert.ok(files.length > 0, 'Should find at least 1 .rad file');

  for (const file of files) {
    const filePath = join(dirPath, file);
    const content = readFileSync(filePath, 'utf-8');
    const cm = createMockCarMaker();

    loadfile(cm, content);
    setupo(cm);
    assert.ok(cm.loadedfile, `File ${file} should load cleanly`);
    assert.ok(cm.o instanceof ContO, `File ${file} should build ContO instance`);
  }
});
