# MUSIC_PORT_SPEC.md — delegating the ibxm tracker port

A bounded job spec for `agy -p`, in the shape `decompilation/agy_tmp` already
uses. Read `PORT_SPEC.md` §"Using a subagent" and §"Calibrate before batching"
first — they are binding, and the calibration procedure is not optional.

## What this is

The game's soundtrack is a set of MOD/XM tracker modules played by a
decompiled copy of **ibxm**, a small Java playback library. Sound *effects* are
already done (`web/audio.js`); this is only the music.

```
decompilation/java-src/ibxm/   2,494 lines over 11 files
  IBXM.java        the mixer/sequencer: the entry point
  Module.java      the parsed module: patterns, instruments, order
  Channel.java     per-channel state; volume/panning/portamento/vibrato
  Instrument.java  Envelope.java  Sample.java  Pattern.java  Note.java
  Data.java        byte-level reader over the module file
  GlobalVol.java
```

Target: `web/ibxm/*.js` plus `web/music.js` wiring it to an `AudioWorklet`.

## Why this is a good delegation candidate

It is the one part of the port that is genuinely self-contained:

- **No renderer contact.** It never touches `Graphics2D`, so the
  painter's-algorithm constraint — the rule that silently breaks things and is
  hard to test for — cannot be violated here.
- **No game state.** It reads a module file and writes audio samples. It does
  not share `Medium`, `ContO` or any of the mutable world.
- **Objectively verifiable.** Rendered audio can be compared sample-for-sample
  against the Java. That is a far stronger oracle than "the handling feels
  off", which is the failure mode `PORT_SPEC.md` warns about.

## Why it is still not trivial

- ibxm mixes in **fixed-point integer arithmetic**. §2b applies throughout:
  every int operation wraps at 32 bits, the addition as well as the multiply.
  A wrap that is dropped produces a click or a detuned note, not an exception.
- `Data.java` reads **unsigned** bytes and little-endian shorts out of a byte
  array. Java's `byte` is signed; the sign-extension rules in
  `web/TRANSPILE_SPEC.md` §1 decide whether a sample plays or screams.
- Sample interpolation and envelope math mix int and float. Java `float` is not
  JS `number`: `fr()` at each binary operation, per §1.

## The verification oracle — insist on this

Unlike the rest of the port, this one can be checked exactly, so there is no
excuse for "it sounds right":

1. Write a Java probe (`web/tools/IbxmProbe.java`, `package tools;` — see
   `WORK.md`) that loads a module (see "Where the modules actually are") through the **real** ibxm classes
   out of `java/Game.jar` by reflection, renders **N seconds** of PCM at a
   fixed sample rate, and writes raw signed 16-bit LE to stdout.
2. Do the same in JS with the port.
3. Diff as **exact integers**. They must match sample-for-sample. Any
   divergence is a port bug: find it, do not tolerate it.

Run the probe more than once before believing a mismatch — `WORK.md` records
that `Medium.random()` bottoms out in unseeded `Math.random()`. ibxm should be
fully deterministic; if it is not, find out why before writing any JS.

## Bounding the job

`PORT_SPEC.md` is explicit: **calibrate before batching**. Do not hand over all
eleven files at once.

1. **`Data.java` first** (small, pure, all the sign-extension traps). Verify
   against a probe. Catalogue every systematic error into the prompt.
2. **`Sample.java` + `Envelope.java`** next — the interpolation and envelope
   math, where int/float mixing lives.
3. Only then the rest, and re-verify partway through; `PORT_SPEC.md` notes
   quality is not stationary across a long run.

Ceiling: if step 1 comes back needing prompt changes, that is expected. If step
2 does as well, stop delegating and do it directly.

## Where the modules actually are

**Corrected 2026-08-01 — there is no `ds.nfm.mod`.** Each track is its own zip
under `music/`: `music/stage1.zip` contains `stage1.mod`, and so on through
`stage32.zip`, plus `music/interface.zip` -> `interface.mod`. The reader
therefore goes through `web/vfs.js`'s zip path exactly as `sounds.zip` and
`models.zip` do, not straight at a bare file.

The stage file names its track: `soundtrack(<name>.mod,<vol>,<n>)`, parsed by
`GameSparker.loadstage` into `checkPoints.trackname` / `trackvol` (volume
clamped to 50..300). Only `mystages/Example Stage - with all the parts used in
it.txt` carries that line in the shipped content, so the stock stages take
whatever default the menu sets — check that before concluding a track fails to
load.

## The game PRE-RENDERS the module — there is no realtime playback

**Corrected 2026-08-01, and it makes the whole job easier.** The plan below
assumed an `AudioWorkletProcessor` streaming from the mixer. The game does not
work that way. `RadicalMod`'s constructor calls
`IBXModSlayer.turnbytesNorm()`, which runs the mixer to completion at load and
returns **the entire track as a PCM byte[]** (16-bit LE, MONO — it keeps only
the even mix indices, i.e. one side of the stereo pair — at a 22000 skiprate),
capped at 18,000,000 bytes. That buffer is handed to `SuperClip`, which is
just a streaming clip player with a loop point.

So the browser side is: render once into an `AudioBuffer`, play it with a
looping `AudioBufferSourceNode`. That is machinery `web/audio.js` already has.
**No AudioWorklet, no ring buffer, no realtime deadline, no audio-thread
concurrency** — which was the part of this job that actually needed care.

- `sClip.rollBackPos` / `rollBackTrig` are the loop points -> `loopStart` /
  `loopEnd` on the source node.
- `prepareSlayer(module, n2, n, n3)` takes sample rate, gain and bpm flex;
  `loadstrack` (`xtGraphics.java:2987`) has a per-stage table of those
  constants for all 32 stages, which is data to transcribe, not logic.
- Watch `n *= (int)0.8f` in `RadicalMod`'s constructor — a §2 artifact, really
  `n = (int)(n * 0.8f)`. See `WORK.md`.
- The same autoplay-gesture unlock `web/audio.js` already does.
- `checkPoints.trackname` / `trackvol` are parsed from the stage file already
  (`GameSparker.loadstage`) and select the track and its volume.

### The oracle is even better than described

`turnbytesNorm()` returns the whole track as bytes, so the comparison is a
byte-for-byte diff of one buffer against the Java's — one check covering the
entire tracker, with no timing or streaming to make it approximate.

## Files the spec missed

The game does not call `ibxm` directly. It goes through a wrapper layer that
also has to be ported (~427 lines on top of the 2,494):

| file | lines | note |
|---|---|---|
| `RadicalMod.java` | 208 | what `xtGraphics.strack` actually is; load/play/stop/resume |
| `ds/nfm/xm/IBXModSlayer.java` | 110 | `turnbytesNorm`, the pre-render loop |
| `ds/nfm/ModuleLoader.java` | 79 | reads the module out of the stage zip |
| `ds/nfm/xm/IBXMod.java` | 30 | small |
| `SuperClip.java` | 126 | **do NOT port** — Java Sound streaming, replaced by `web/audio.js` |

## Non-negotiables for the prompt

Restate these verbatim; they are the ones that have actually been violated:

- **§2c: never weaken a test to make it pass.** `WORK.md` records delegated
  jobs editing tests green *twice*, and `CarDefine.loadcar` being silently
  stubbed to `return -1` while the report claimed only networking was dropped.
  Diff against an independent artifact; do not trust a green suite or a
  "gaps: none" report.
- **Transpile line by line.** Keep procyon's local names. Do not restructure,
  rename, or fix apparent bugs — §3, preserve the game's own bugs verbatim.
- **Touch nothing outside `web/ibxm/`, `web/tools/`, and its own tests.**
- Run jobs **one at a time**: the `agy` quota is shared across `claude-*` and
  `gpt-oss` (gemini is a separate pool), and five parallel jobs exhausted it
  and killed all five mid-flight.

## Honest estimate

The port itself is a day of agent time with careful verification. The wiring is
an hour. The risk is not the size, it is that a fixed-point error sounds
*plausible* — which is exactly the failure `PORT_SPEC.md` says not to delegate
without an exact oracle. Here there is one, so use it.
