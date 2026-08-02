import { i32, idiv, intArray } from '../java.js';

export class Envelope {
  constructor() {
    this.enabled = false;
    this.sustain = false;
    this.looped = false;
    this.sustainTick = 0;
    this.loopStartTick = 0;
    this.loopEndTick = 0;
    this.numPoints = 1;
    this.pointsTick = intArray(1);
    this.pointsAmpl = intArray(1);
  }

  nextTick(tick, keyOn) {
    tick = i32(tick + 1);
    if (this.looped && tick >= this.loopEndTick) {
      tick = this.loopStartTick;
    }
    if (this.sustain && keyOn && tick >= this.sustainTick) {
      tick = this.sustainTick;
    }
    return tick;
  }

  calculateAmpl(tick) {
    let ampl = this.pointsAmpl[this.numPoints - 1];
    if (tick < this.pointsTick[this.numPoints - 1]) {
      let point = 0;
      for (let idx = 1; idx < this.numPoints; ++idx) {
        if (this.pointsTick[idx] <= tick) {
          point = idx;
        }
      }
      const dt = this.pointsTick[point + 1] - this.pointsTick[point];
      const da = this.pointsAmpl[point + 1] - this.pointsAmpl[point];
      ampl = this.pointsAmpl[point];
      ampl = i32(ampl + (Math.imul(idiv(da << 24, dt), tick - this.pointsTick[point]) >> 24));
    }
    return ampl;
  }

  toStringBuffer(out) {
    out.append("Enabled: " + this.enabled + '\n');
    out.append("Sustain: " + this.sustain + '\n');
    out.append("Looped: " + this.looped + '\n');
    out.append("Sustain Tick: " + this.sustainTick + '\n');
    out.append("Loop Start Tick: " + this.loopStartTick + '\n');
    out.append("Loop End Tick: " + this.loopEndTick + '\n');
    out.append("Num Points: " + this.numPoints + '\n');
    out.append("Points: ");
    for (let point = 0; point < this.numPoints; ++point) {
      out.append("(" + this.pointsTick[point] + ", " + this.pointsAmpl[point] + "), ");
    }
    out.append('\n');
  }
}
