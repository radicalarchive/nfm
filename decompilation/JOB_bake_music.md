# JOB — bake the soundtrack to audio files at build time

Work in `/home/evan/games/nfm`. **This job ports nothing.** It builds a tool
that drives the REAL Java classes out of `java/Game.jar` to render each of the
game's tracker modules to an audio file, so the browser port can play the
soundtrack without porting the ~2,500-line `ibxm` tracker at all.

## Why this works

`RadicalMod`'s constructor already pre-renders the whole module at load:
`ModuleLoader.loadMod(zip)` -> `ModuleLoader.prepareSlayer(module, rate, gain,
bpmflex)` -> `IBXModSlayer.turnbytesNorm(calvol)`, which returns **the entire
track as a PCM `byte[]`** — 16-bit little-endian, MONO (it keeps only the even
mix indices, one side of the stereo pair), played back at a 22000 skiprate. It
is handed to `SuperClip` with `rollBackPos` / `rollBackTrig` as loop points.

There is no realtime playback to reproduce. Render once, ship the audio.

**Gain and bpmflex are applied inside that render** (`turnbytesNorm` scales by
`gain / 300.0f`; `bpmflex` goes into `prepareSlayer`), so a baked file already
has the per-stage character baked in and needs no playback-rate or gain
correction in the browser.

## The deliverables

1. `web/tools/BakeMusic.java` — `package tools;`, run as `tools.BakeMusic`.
   Renders every track and writes raw output + a manifest.
2. `tools/bake-music.sh` — a repo-root-relative shell script that compiles and
   runs the Java tool, then encodes the raw PCM with `ffmpeg`. Idempotent, safe
   to re-run, and it must not clobber anything outside its output directory.
3. `music-baked/` — the output: one audio file per track plus
   `music-baked/manifest.json`.
4. `music-baked/README.md` — two short paragraphs: what generated these, and
   the exact command to regenerate them.

**Do NOT** modify `music/`, `data/`, `stages/`, `mystages/`, `java/`, or any
existing file under `web/` other than adding the two new files above. Those
asset directories are byte-identical to the original game and are not to be
touched. Do not commit anything.

## The per-track constants

`xtGraphics.loadstrack` (`decompilation/java-src/xtGraphics.java:2987`) has one
line per stage:

```java
this.strack = new RadicalMod("music/stage" + n + ".zip", GAIN, RATE, BPMFLEX, false, false);
```

for `n` = 1..32 — e.g. stage 1 is `(240, 8400, 135)`, stage 2 is
`(190, 9000, 145)`, most later ones are `(x, 8000, 125)`. **Extract all 32
triples from the source; do not guess or assume a default.** Also bake
`music/interface.zip` and `music/party.zip` — find their constants by reading
how `RadicalMod.loadimod` / `loadpmod` construct them, and say in your report
which constants you used and where you found them.

`RadicalMod`'s constructor transforms two of them before use:

```java
n2 = (int)(n2 / 8000.0f * 2.0f * 22000);   // the mixer's sample rate
n *= (int)0.8f;                             // gain
```

The second line is a **procyon decompilation artifact** (see
`web/TRANSPILE_SPEC.md` §2 and `WORK.md`): `(int)0.8f` is 0, which would zero
the gain and render silence. The real bytecode is `n = (int)(n * 0.8f)`.
**Verify this yourself with `javap -p -c -cp <JAR_DIR> RadicalMod` before
relying on it**, and report what the bytecode actually says.

## Strongly preferred approach

Drive the real `RadicalMod` constructor by reflection with exactly the
`loadstrack` arguments, then read the rendered bytes and loop points back out
of its `sClip` field. That way the arithmetic above is executed by the real
class and cannot be got wrong.

`RadicalMod` prefixes paths with `Madness.fpath`, so set that field first (it
is static; use reflection). If constructing `RadicalMod` pulls in Java Sound
and fails on a headless box, fall back to calling `ModuleLoader.loadMod` /
`prepareSlayer` / `turnbytesNorm` directly and doing the two conversions
yourself — **and if you take that fallback, render one track BOTH ways and diff
the bytes to prove they are identical.** Report which path you used.

## Output format — loop points are the constraint

The track loops in game, so the loop seam must be sample-exact:
`rollBackPos` and `rollBackTrig` are BYTE offsets into a 16-bit mono buffer, so
sample offsets are those halved. A lossy codec shifts sample offsets by its
encoder delay and would put a click in the loop.

Use **FLAC** (`ffmpeg -f s16le -ar 22000 -ac 1 -i in.raw -c:a flac out.flac`),
which is lossless, sample-exact, and decodes in every current browser via
`decodeAudioData`. Report the total size of `music-baked/`. If it exceeds
~80 MB, also produce Opus versions alongside and report both sizes, but keep
FLAC as the default — do not silently switch to a lossy codec.

`manifest.json`: an object keyed by track name (`"stage1"`, `"interface"`, ...)
with, per track: `file`, `sampleRate` (22000), `channels` (1), `lengthSamples`,
`loopStartSamples`, `loopEndSamples`, and the `gain`/`rate`/`bpmflex` triple it
was rendered with. State the units in the README.

## Verify before you report

- Every one of the 34 tracks renders non-silent audio. **Check the actual peak
  and RMS amplitude of each** — a silent or near-silent track means the gain
  artifact above bit you, and it is exactly the failure this job is prone to.
  Report the peak/RMS per track.
- Durations are plausible (tens of seconds to a few minutes), not truncated to
  the 18,000,000-byte cap unless genuinely that long.
- The loop points are within the track and `loopEnd > loopStart`.
- Play or spectrally sanity-check at least one file and say which.

## Report

Files created; the exact commands run; the 34 constant triples and where you
read each from; what `javap` showed for the gain line; which rendering path you
used and, if the fallback, the both-ways diff result; per-track peak/RMS,
duration and loop points; total output size; and every divergence, workaround
or thing you could not verify. Do not report "gaps: none".
