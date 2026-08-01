// Sound effects: decode sounds.zip once, play one-shots on demand.
//
// The Java uses java.applet.AudioClip, whose contract is exactly "play() fires
// a one-shot, stop() cuts it". Web Audio's model is the same if you treat a
// decoded AudioBuffer as the clip and a fresh BufferSource as each playback,
// so the call sites in xtGraphics port across unchanged.
//
// Two things Web Audio imposes that the applet did not:
//
//   - an AudioContext starts suspended until a user gesture. The game must
//     stay playable with no sound rather than block on it, so nothing here
//     throws and `unlock()` is wired to the first key press.
//   - decoding is asynchronous. A clip that has not decoded yet is simply not
//     played; the alternative is stalling the tick to wait for audio.

import { readZip } from './vfs.js';

/** Clips the race needs, by name in sounds.zip minus the extension. */
const CLIPS = [
  'crash1', 'crash2', 'crash3',
  'lowcrash1', 'lowcrash2', 'lowcrash3',
  'skid1', 'skid2', 'skid3',
  'dustskid1', 'dustskid2', 'dustskid3',
  'scrape1', 'scrape2', 'scrape3',
  'scrape3b',
  'tires', 'checkpoint', 'wasted', 'firewasted', 'carfixed', 'powerup',
  'one', 'two', 'three', 'go',
];

export class Audio {
  constructor() {
    this.ctx = null;
    this.buffers = new Map();      // name -> AudioBuffer
    this.playing = new Map();      // name -> AudioBufferSourceNode, for stop()
    this.muted = false;
    this.ready = false;
  }

  /**
   * Decode the clips. Safe to call before any user gesture: the context is
   * created suspended and decodeAudioData still works.
   */
  async load() {
    if (this.ctx) return;
    const Ctx = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Ctx) return;                      // no Web Audio: stay silent
    this.ctx = new Ctx();
    this.gain = this.ctx.createGain();
    this.gain.connect(this.ctx.destination);

    const zip = await readZip('data/sounds.zip');
    await Promise.all(CLIPS.map(async (name) => {
      // 'scrape3b' is a second instance of scrape3.wav: the Java keeps two
      // clips of it so gscrape can cut one while the other still sounds.
      const bytes = zip.get(`${name.replace(/b$/, '')}.wav`);
      if (!bytes) return;
      try {
        // decodeAudioData detaches the buffer it is given, and the zip's
        // entries are views into one shared ArrayBuffer -- slice first or
        // decoding one clip invalidates the rest.
        const copy = bytes.slice().buffer;
        this.buffers.set(name, await this.ctx.decodeAudioData(copy));
      } catch { /* a clip that will not decode is simply silent */ }
    }));
    this.ready = true;
  }

  /** Resume the context. Must be called from a user gesture. */
  unlock() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  /** AudioClip.play(): fire a one-shot. Unknown or undecoded clips no-op. */
  play(name) {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const buf = this.buffers.get(name);
    if (!buf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.gain);
    src.start();
    this.playing.set(name, src);
    src.onended = () => {
      if (this.playing.get(name) === src) this.playing.delete(name);
    };
  }

  /** AudioClip.stop(): cut the most recent playback of this clip. */
  stop(name) {
    const src = this.playing.get(name);
    if (!src) return;
    try { src.stop(); } catch { /* already ended */ }
    this.playing.delete(name);
  }

  setMuted(on) {
    this.muted = on;
    if (this.gain) this.gain.gain.value = on ? 0 : 1;
  }
}
