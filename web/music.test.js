// The soundtrack's per-track constants, checked against the Java they were
// transcribed from.
//
// A shape-and-bounds test passes with every number wrong, which is the whole
// risk with a hand-copied table of 34 triples -- so the oracle here is
// xtGraphics.loadstrack itself, parsed out of the decompiled source, the same
// way the ibxm tests use a probe rather than trusting the port.
import test from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';

const R = new URL('../', import.meta.url);
const readRepo = (p) => readFileSync(new URL(p, R), 'latin1');

/** [gain, rate, bpmflex] per stage, read out of loadstrack. */
function constantsFromJava() {
  const java = readRepo('decompilation/java-src/xtGraphics.java');
  const blk = java.match(/public void loadstrack[\s\S]*?\n {4}\}/)[0];
  const out = {};
  const re = /new RadicalMod\("music\/(?:stage" \+ n \+ "|(party))\.zip",\s*(\d+),\s*(\d+),\s*(\d+),/g;
  // Stage cases appear in ascending order of `n`, and stage 27 carries the
  // party alternative in the same if-block, so track the enclosing case.
  const caseRe = /if \(n == (\d+)\)/g;
  const cases = [...blk.matchAll(caseRe)].map((m) => ({ n: m[1], at: m.index }));
  for (const m of blk.matchAll(re)) {
    const owner = cases.filter((c) => c.at < m.index).pop();
    const key = m[1] === 'party' ? 'party' : owner.n;
    out[key] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return out;
}

/** interface's triple lives in RadicalMod.loadimod, in a different arg order. */
function interfaceFromJava() {
  const src = readRepo('decompilation/java-src/RadicalMod.java');
  const blk = src.match(/public void loadimod[\s\S]*?prepareSlayer\(loadMod, (\w+), (\w+), (\w+)\)/);
  const body = src.match(/public void loadimod[\s\S]*?try \{/)[0];
  const val = (name) => Number(body.match(new RegExp(`int ${name} = (\\d+)`))[1]);
  // prepareSlayer(module, rate, gain, bpmflex) -- note rate comes FIRST here,
  // the opposite of the stage constructor's (gain, rate, bpmflex) order.
  return [val(blk[2]), val(blk[1]), val(blk[3])];
}

test('every track constant matches the Java', async () => {
  const { _stageConstants: table } = await import('./music.js');
  const java = constantsFromJava();

  assert.strictEqual(Object.keys(java).length, 33, 'expected 32 stages + party from loadstrack');
  for (const [key, expected] of Object.entries(java)) {
    assert.deepStrictEqual(table[key], expected,
      `${key}: table has ${JSON.stringify(table[key])}, loadstrack says ${JSON.stringify(expected)}`);
  }
  assert.deepStrictEqual(table['interface'], interfaceFromJava(),
    'interface constants must match RadicalMod.loadimod');
  assert.strictEqual(Object.keys(table).length, 34, '32 stages + party + interface');
});

test('stage 27 is the only track with a party alternative', () => {
  // loadstrack's one conditional case. resetstat() depends on this being the
  // only one, so it is worth failing if the Java ever said otherwise.
  const java = readRepo('decompilation/java-src/xtGraphics.java');
  const blk = java.match(/public void loadstrack[\s\S]*?\n {4}\}/)[0];
  const partyLines = [...blk.matchAll(/music\/party\.zip/g)];
  assert.strictEqual(partyLines.length, 1, 'expected exactly one party.zip case');
  const idx = blk.indexOf('music/party.zip');
  const owner = [...blk.matchAll(/if \(n == (\d+)\)/g)].filter((m) => m.index < idx).pop();
  assert.strictEqual(owner[1], '27');
});

test('load() resolves false and never throws without Web Audio', async () => {
  // No window/AudioContext here, so getContext() bails. The contract is the
  // same one web/audio.js keeps: no audio costs music and nothing else.
  const music = await import('./music.js');
  await assert.doesNotReject(async () => {
    assert.strictEqual(await music.load(1), false);
    assert.strictEqual(await music.load('interface'), false);
  });
  assert.strictEqual(music.stageLoaded, false);
  // stop()/unload() must be safe before anything has ever loaded.
  assert.doesNotThrow(() => { music.stop(); music.unload(); });
});
