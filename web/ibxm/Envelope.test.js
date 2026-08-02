import test from 'node:test';
import assert from 'node:assert';
import { Envelope } from './Envelope.js';
import { intArray } from '../java.js';

test('Envelope calculateAmpl matches Java probe', () => {
  const env = new Envelope();
  env.numPoints = 4;
  env.pointsTick = intArray(4);
  env.pointsTick.set([0, 10, 30, 50]);
  env.pointsAmpl = intArray(4);
  env.pointsAmpl.set([0, 64, 32, 0]);
  env.sustain = true;
  env.sustainTick = 30;
  env.looped = true;
  env.loopStartTick = 10;
  env.loopEndTick = 30;

  const testTicks = [-5, 0, 5, 10, 20, 30, 40, 50, 60];
  const expectedAmpl = [-32, 0, 31, 64, 48, 32, 16, 0, 0];

  testTicks.forEach((tick, i) => {
    assert.strictEqual(env.calculateAmpl(tick), expectedAmpl[i]);
  });
});

test('Envelope nextTick matches Java probe', () => {
  const env = new Envelope();
  env.numPoints = 4;
  env.pointsTick = intArray(4);
  env.pointsTick.set([0, 10, 30, 50]);
  env.pointsAmpl = intArray(4);
  env.pointsAmpl.set([0, 64, 32, 0]);
  env.sustain = true;
  env.sustainTick = 30;
  env.looped = true;
  env.loopStartTick = 10;
  env.loopEndTick = 30;

  const testTicks = [-5, 0, 5, 10, 20, 30, 40, 50, 60];
  const expectedTrue = [-4, 1, 6, 11, 21, 10, 10, 10, 10];
  const expectedFalse = [-4, 1, 6, 11, 21, 10, 10, 10, 10];

  testTicks.forEach((tick, i) => {
    assert.strictEqual(env.nextTick(tick, true), expectedTrue[i]);
    assert.strictEqual(env.nextTick(tick, false), expectedFalse[i]);
  });
});
