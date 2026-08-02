import { i32, jround } from '../java.js';

export class Sample {
  static FP_SHIFT = 15;
  static FP_ONE = 32768;
  static FP_MASK = 32767;
  static C2_PAL = 8287;
  static C2_NTSC = 8363;
  static LOG2_FILTER_TAPS = 4;
  static FILTER_TAPS = 16;
  static DELAY = 8;
  static LOG2_TABLE_ACCURACY = 4;
  static TABLE_ACCURACY = 16;
  static TABLE_INTERP_SHIFT = 11;
  static TABLE_INTERP_ONE = 2048;
  static TABLE_INTERP_MASK = 2047;
  static LOG2_NUM_TABLES = 3;
  static NUM_TABLES = 8;

  constructor() {
    this.name = "";
    this.volume = 0;
    this.panning = -1;
    this.relNote = 0;
    this.fineTune = 0;
    this.c2Rate = 8363;
    this.loopStart = 0;
    this.loopLength = 0;
  }

  static calculateSincTables() {
    const sincTables = new Array(8);
    for (let tableIdx = 0; tableIdx < 8; ++tableIdx) {
      sincTables[tableIdx] = Sample.calculateSincTable(1.0 / (tableIdx + 1));
    }
    return sincTables;
  }

  static calculateSincTable(lowpass) {
    const sincTable = new Int16Array(272);
    const windDT = -0.39269908169872414;
    const sincDT = -3.141592653589793;
    let tableIdx = 0;
    for (let tableY = 0; tableY <= 16; ++tableY) {
      const fracT = tableY / 16.0;
      let sincT = 3.141592653589793 * (7.0 + fracT);
      let windT = 3.141592653589793 + sincT * 2.0 / 16.0;
      for (let tableX = 0; tableX < 16; ++tableX) {
        let sincY = lowpass;
        if (sincT !== 0.0) {
          sincY = Math.sin(lowpass * sincT) / sincT;
        }
        let windY = 0.35875;
        windY -= 0.48829 * Math.cos(windT);
        windY += 0.14128 * Math.cos(windT * 2.0);
        windY -= 0.01168 * Math.cos(windT * 3.0);
        sincTable[tableIdx++] = jround(sincY * windY * 32767.0);
        sincT += sincDT;
        windT += windDT;
      }
    }
    return sincTable;
  }

  setSampleData(sampleData, loopStart, loopLength, pingPong) {
    let sampleLength = sampleData.length;
    if (loopStart < 0 || loopStart > sampleLength) {
      loopStart = sampleLength;
    }
    if (loopLength < 0 || loopStart + loopLength > sampleLength) {
      loopLength = sampleLength - loopStart;
    }
    sampleLength = i32(loopStart + loopLength);
    loopStart = i32(loopStart + 8);
    const newSampleLength = i32(8 + sampleLength + (pingPong ? loopLength : 0) + 16);
    const newSampleData = new Int16Array(newSampleLength);
    newSampleData.set(sampleData.subarray(0, sampleLength), 8);
    sampleData = newSampleData;
    if (pingPong) {
      const loopEnd = i32(loopStart + loopLength);
      for (let idx = 0; idx < loopLength; ++idx) {
        sampleData[loopEnd + idx] = sampleData[loopEnd - idx - 1];
      }
      loopLength = Math.imul(loopLength, 2);
    }
    for (let idx2 = i32(loopStart + loopLength), end = i32(idx2 + 16); idx2 < end; ++idx2) {
      sampleData[idx2] = sampleData[idx2 - loopLength];
    }
    this.sampleData = sampleData;
    this.loopStart = loopStart;
    this.loopLength = loopLength;
  }

  resampleNearest(sampleIdx, sampleFrac, step, leftGain, rightGain, mixBuffer, offset, length) {
    const loopLen = this.loopLength;
    const loopEnd = i32(this.loopStart + loopLen);
    sampleIdx = i32(sampleIdx + 8);
    if (sampleIdx >= loopEnd) {
      sampleIdx = this.normaliseSampleIdx(sampleIdx);
    }
    const data = this.sampleData;
    let y = 0;
    let n;
    let n2;
    for (let outIdx = offset << 1, outEnd = i32(offset + length) << 1; outIdx < outEnd; n = outIdx++, mixBuffer[n] = i32(mixBuffer[n] + (Math.imul(y, leftGain) >> 15)), n2 = outIdx++, mixBuffer[n2] = i32(mixBuffer[n2] + (Math.imul(y, rightGain) >> 15)), sampleFrac = i32(sampleFrac + step), sampleIdx = i32(sampleIdx + (sampleFrac >> 15)), sampleFrac &= 0x7FFF) {
      if (sampleIdx >= loopEnd) {
        if (loopLen < 2) {
          break;
        }
        while (sampleIdx >= loopEnd) {
          sampleIdx = i32(sampleIdx - loopLen);
        }
      }
      y = data[sampleIdx];
    }
  }

  resampleLinear(sampleIdx, sampleFrac, step, leftGain, rightGain, mixBuffer, offset, length) {
    const loopLen = this.loopLength;
    const loopEnd = i32(this.loopStart + loopLen);
    sampleIdx = i32(sampleIdx + 8);
    if (sampleIdx >= loopEnd) {
      sampleIdx = this.normaliseSampleIdx(sampleIdx);
    }
    const data = this.sampleData;
    let y = 0;
    let n;
    let n2;
    for (let outIdx = offset << 1, outEnd = i32(offset + length) << 1; outIdx < outEnd; n = outIdx++, mixBuffer[n] = i32(mixBuffer[n] + (Math.imul(y, leftGain) >> 15)), n2 = outIdx++, mixBuffer[n2] = i32(mixBuffer[n2] + (Math.imul(y, rightGain) >> 15)), sampleFrac = i32(sampleFrac + step), sampleIdx = i32(sampleIdx + (sampleFrac >> 15)), sampleFrac &= 0x7FFF) {
      if (sampleIdx >= loopEnd) {
        if (loopLen < 2) {
          break;
        }
        while (sampleIdx >= loopEnd) {
          sampleIdx = i32(sampleIdx - loopLen);
        }
      }
      const c = data[sampleIdx];
      const m = i32(data[sampleIdx + 1] - c);
      y = i32((Math.imul(m, sampleFrac) >> 15) + c);
    }
  }

  resampleSinc(sampleIdx, sampleFrac, step, leftGain, rightGain, mixBuffer, offset, length) {
    let tableIdx = 0;
    if (step > 32768) {
      tableIdx = (step >> 15) - 1;
      if (tableIdx >= 8) {
        tableIdx = 7;
      }
    }
    const sincTable = Sample.SINC_TABLES[tableIdx];
    const loopLen = this.loopLength;
    const loopEnd = i32(this.loopStart + loopLen);
    if (sampleIdx >= loopEnd) {
      sampleIdx = this.normaliseSampleIdx(sampleIdx);
    }
    const data = this.sampleData;
    let y = 0;
    let n;
    let n2;
    for (let outIdx = offset << 1, outEnd = i32(offset + length) << 1; outIdx < outEnd; n = outIdx++, mixBuffer[n] = i32(mixBuffer[n] + (Math.imul(y, leftGain) >> 15)), n2 = outIdx++, mixBuffer[n2] = i32(mixBuffer[n2] + (Math.imul(y, rightGain) >> 15)), sampleFrac = i32(sampleFrac + step), sampleIdx = i32(sampleIdx + (sampleFrac >> 15)), sampleFrac &= 0x7FFF) {
      if (sampleIdx >= loopEnd) {
        if (loopLen < 2) {
          break;
        }
        while (sampleIdx >= loopEnd) {
          sampleIdx = i32(sampleIdx - loopLen);
        }
      }
      const tableIdx2 = (sampleFrac >> 11) << 4;
      const tableIdx3 = i32(tableIdx2 + 16);
      let a1 = 0;
      let a2 = 0;
      for (let tap = 0; tap < 16; ++tap) {
        a1 = i32(a1 + Math.imul(sincTable[tableIdx2 + tap], data[sampleIdx + tap]));
        a2 = i32(a2 + Math.imul(sincTable[tableIdx3 + tap], data[sampleIdx + tap]));
      }
      a1 >>= 15;
      a2 >>= 15;
      y = i32(a1 + (Math.imul(a2 - a1, sampleFrac & 0x7FF) >> 11));
    }
  }

  normaliseSampleIdx(sampleIdx) {
    const loopOffset = i32(sampleIdx - this.loopStart);
    if (loopOffset > 0) {
      sampleIdx = this.loopStart;
      if (this.loopLength > 1) {
        sampleIdx = i32(sampleIdx + (loopOffset % this.loopLength));
      }
    }
    return sampleIdx;
  }

  looped() {
    return this.loopLength > 1;
  }

  toStringBuffer(out) {
    out.append("Name: " + this.name + '\n');
    out.append("Volume: " + this.volume + '\n');
    out.append("Panning: " + this.panning + '\n');
    out.append("Relative Note: " + this.relNote + '\n');
    out.append("Fine Tune: " + this.fineTune + '\n');
    out.append("Loop Start: " + this.loopStart + '\n');
    out.append("Loop Length: " + this.loopLength + '\n');
  }
}

Sample.SINC_TABLES = Sample.calculateSincTables();
