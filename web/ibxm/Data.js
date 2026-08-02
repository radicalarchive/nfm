import { i32 } from '../java.js';

/**
 * Cp850 -> Unicode for the high half. Printed by the JVM itself
 * (`new String(new byte[]{(byte)i}, "Cp850")` for i in 128..255), so it is the
 * same table `strCp850` resolves against in the Java. Node's TextDecoder has
 * no 'Cp850' label, and the Java only falls back to Latin-1 when the charset
 * is genuinely absent -- on a normal JVM it never does, so falling back here
 * would be a divergence, not a port of the fallback.
 */
const CP850 = [
  199, 252, 233, 226, 228, 224, 229, 231, 234, 235, 232, 239, 238, 236, 196, 197,
  201, 230, 198, 244, 246, 242, 251, 249, 255, 214, 220, 248, 163, 216, 215, 402,
  225, 237, 243, 250, 241, 209, 170, 186, 191, 174, 172, 189, 188, 161, 171, 187,
  9617, 9618, 9619, 9474, 9508, 193, 194, 192, 169, 9571, 9553, 9559, 9565, 162, 165, 9488,
  9492, 9524, 9516, 9500, 9472, 9532, 227, 195, 9562, 9556, 9577, 9574, 9568, 9552, 9580, 164,
  240, 208, 202, 203, 200, 305, 205, 206, 207, 9496, 9484, 9608, 9604, 166, 204, 9600,
  211, 223, 212, 210, 245, 213, 181, 254, 222, 218, 219, 217, 253, 221, 175, 180,
  173, 177, 8215, 190, 182, 167, 247, 184, 176, 168, 183, 185, 179, 178, 9632, 160,
];

export class Data {
  constructor(arg) {
    if (arg && arg.read) {
      const inputStream = arg;
      this.bufLen = 65536;
      this.buffer = new Int8Array(this.bufLen);
      this.stream = inputStream;
      Data.readFully(this.stream, this.buffer, 0, this.bufLen);
    } else {
      const data = arg;
      this.bufLen = data.length;
      // Java's byte[] is SIGNED and this class leans on that: sByte() returns
      // the raw element, so a Uint8Array here reads 130 where Java reads -126
      // -- in ibxm that value is a sample's finetune, i.e. a silently detuned
      // note rather than an error. The zip reader in vfs.js hands out
      // Uint8Array, so this coercion is what makes `new Data(zipEntry)` safe.
      // It aliases the same bytes; it does not copy.
      this.buffer = (data instanceof Int8Array)
        ? data
        : new Int8Array(data.buffer, data.byteOffset, data.byteLength);
    }
  }

  sByte(offset) {
    this.load(offset, 1);
    return this.buffer[offset];
  }

  uByte(offset) {
    this.load(offset, 1);
    return this.buffer[offset] & 0xFF;
  }

  ubeShort(offset) {
    this.load(offset, 2);
    return ((this.buffer[offset] & 0xFF) << 8) | (this.buffer[offset + 1] & 0xFF);
  }

  uleShort(offset) {
    this.load(offset, 2);
    return (this.buffer[offset] & 0xFF) | ((this.buffer[offset + 1] & 0xFF) << 8);
  }

  uleInt(offset) {
    this.load(offset, 4);
    let value = this.buffer[offset] & 0xFF;
    value |= (this.buffer[offset + 1] & 0xFF) << 8;
    value |= (this.buffer[offset + 2] & 0xFF) << 16;
    value |= (this.buffer[offset + 3] & 0x7F) << 24;
    return value;
  }

  strLatin1(offset, length) {
    this.load(offset, length);
    const str = new Array(length);
    for (let idx = 0; idx < length; ++idx) {
      const chr = this.buffer[offset + idx] & 0xFF;
      str[idx] = chr < 32 ? ' ' : String.fromCharCode(chr);
    }
    return str.join('');
  }

  strCp850(offset, length) {
    this.load(offset, length);
    const str = new Array(length);
    for (let idx = 0; idx < length; ++idx) {
      const b = this.buffer[offset + idx] & 0xFF;
      const chr = String.fromCharCode(b < 128 ? b : CP850[b - 128]);
      str[idx] = chr < ' ' ? ' ' : chr;
    }
    return str.join('');
  }

  samS8(offset, length) {
    this.load(offset, length);
    const sampleData = new Int16Array(length);
    for (let idx = 0; idx < length; ++idx) {
      sampleData[idx] = this.buffer[offset + idx] << 8;
    }
    return sampleData;
  }

  samS8D(offset, length) {
    this.load(offset, length);
    const sampleData = new Int16Array(length);
    let sam = 0;
    for (let idx = 0; idx < length; ++idx) {
      sam = i32(sam + this.buffer[offset + idx]);
      sampleData[idx] = sam << 8;
    }
    return sampleData;
  }

  samU8(offset, length) {
    this.load(offset, length);
    const sampleData = new Int16Array(length);
    for (let idx = 0; idx < length; ++idx) {
      sampleData[idx] = ((this.buffer[offset + idx] & 0xFF) - 128) << 8;
    }
    return sampleData;
  }

  samS16(offset, samples) {
    this.load(offset, Math.imul(samples, 2));
    const sampleData = new Int16Array(samples);
    for (let idx = 0; idx < samples; ++idx) {
      sampleData[idx] = (this.buffer[offset + idx * 2] & 0xFF) | (this.buffer[offset + idx * 2 + 1] << 8);
    }
    return sampleData;
  }

  samS16D(offset, samples) {
    this.load(offset, Math.imul(samples, 2));
    const sampleData = new Int16Array(samples);
    let sam = 0;
    for (let idx = 0; idx < samples; ++idx) {
      sam = i32(sam + ((this.buffer[offset + idx * 2] & 0xFF) | (this.buffer[offset + idx * 2 + 1] << 8)));
      sampleData[idx] = sam;
    }
    return sampleData;
  }

  samU16(offset, samples) {
    this.load(offset, Math.imul(samples, 2));
    const sampleData = new Int16Array(samples);
    for (let idx = 0; idx < samples; ++idx) {
      const sam = (this.buffer[offset + idx * 2] & 0xFF) | ((this.buffer[offset + idx * 2 + 1] & 0xFF) << 8);
      sampleData[idx] = sam - 32768;
    }
    return sampleData;
  }

  load(offset, length) {
    while (offset + length > this.bufLen) {
      const newBufLen = this.bufLen << 1;
      const newBuf = new Int8Array(newBufLen);
      newBuf.set(this.buffer, 0);
      if (this.stream != null) {
        Data.readFully(this.stream, newBuf, this.bufLen, newBufLen - this.bufLen);
      }
      this.bufLen = newBufLen;
      this.buffer = newBuf;
    }
  }

  static readFully(inputStream, buffer, offset, length) {
    for (let read = 1, end = offset + length; read > 0; read = inputStream.read(buffer, offset, end - offset), offset = i32(offset + read)) {}
  }
}
