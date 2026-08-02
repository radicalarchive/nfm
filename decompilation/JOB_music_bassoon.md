# JOB — play the soundtrack with BassoonTracker instead of porting ibxm

Work in `/home/evan/games/nfm`. Read `AGENTS.md` first for how to run and
verify. This job **ports nothing from Java** — it wires an existing pure-JS
tracker player to the game's existing `.mod` modules.

## The decision this implements

The game's music is 34 tracker modules in `music/stageN.zip` (+ `interface`,
`party`), 3.3 MB zipped. Two rejected alternatives, for context: pre-rendering
them to audio produced 203 MB of FLAC / 54 MB of Opus (in `music-baked/`, kept
for now — **do not delete it, do not use it**), and hand-porting the game's
`ibxm` tracker is ~2,500 lines with a fixed-point effects state machine.

BassoonTracker's player-only build is ~19.8 KB gzipped and plays `.mod`/`.xm`
in Web Audio. Docs: https://roverfromanimalcrossing.xyz/bassoontracker/docs/player
Source: https://github.com/steffest/BassoonTracker (MIT).

## Deliverables

1. `web/vendor/bassoonplayer.js` (+ its LICENSE as
   `web/vendor/bassoontracker-LICENSE`) — vendored, pinned, not fetched from a
   CDN at runtime. Record the exact version/commit you vendored in a comment.
2. `web/music.js` — a small module exposing roughly:
   `load(stage)`, `play()`, `stop()`, `resume()`, `setVolume(v)`, `unload()`.
3. Wiring in `web/XtGraphics.js` so the existing call sites work — see below.
4. `web/music.test.js` — whatever is testable under `node --test` without a
   browser (module parsing/loading, the stage->constants table, graceful
   no-op when Web Audio is absent). Do NOT fake a passing audio test.

**Do not modify** `music/`, `data/`, `stages/`, `music-baked/`, `java/`, or
`web/ibxm/`. Do not delete anything. Keep changes to existing files minimal.

## Two things to establish FIRST, and report before writing much code

1. **Loading from bytes, not a URL.** The docs only show
   `BassoonTracker.load(url, autoplay, callback)`. The modules are inside zips
   and the repo already has a zip reader (`web/vfs.js`: `readZip`/`parseZip`,
   returns a `Map` of name -> `Uint8Array`). Find the entry point that accepts
   an ArrayBuffer/Uint8Array already in memory (read the source — look for
   whatever `load()` calls after its fetch, e.g. a `processFile`/`handleFile`
   style function) and use that. If no such path exists, say so and stop before
   inventing one; extracting the `.mod` files at build time is an acceptable
   fallback but is my call, not yours.
2. **Headless/UI.** BassoonTracker is a full tracker app; the player build
   should not create a UI or canvas. Confirm `BassoonTracker.init(true)` (or
   whichever call) starts audio only, and that nothing appends DOM elements or
   grabs keyboard events — **this game already owns the keyboard, and a
   library stealing keydown would break the controls.** Report what you find.

## Per-stage constants

`xtGraphics.loadstrack` (`decompilation/java-src/xtGraphics.java:2987`) gives
each stage a `(gain, rate, bpmflex)` triple — stage 1 is `(240, 8400, 135)`,
stage 2 `(190, 9000, 145)`, most later ones `(x, 8000, 125)`. Transcribe all 32
plus `interface`/`party` into a table in `web/music.js`. They are already
extracted in `web/tools/BakeMusic.java` — **cross-check against the Java
source rather than trusting that file.**

Map them as far as the library allows:

- `gain` -> a Web Audio `GainNode` (the Java scales samples by `gain / 300.0f`,
  so `gain / 300` is the natural starting point; also apply
  `checkPoints.trackvol`, which `GameSparker.loadstage` already parses and
  clamps to 50..300).
- `bpmflex` -> the player's BPM/tempo control if it has one.
- `rate` -> in the Java this set the mixer's sample rate, which shifts pitch
  AND tempo together. If BassoonTracker has no equivalent, **say so and leave
  it unapplied rather than faking it** — a `playbackRate` hack would detune
  the music, which is worse than ignoring the parameter.

Report exactly which of the three you could apply and which you could not.

## Call sites to satisfy

`web/XtGraphics.js` already has `strack`, `loadedt`, `mutem` and, in
`playsounds()`, this logic ported from the Java:

```js
if (control.mutem !== this.mutem) {
  this.mutem = control.mutem;
  if (this.mutem) { if (this.loadedt) this.strack.stop(); }
  else if (this.loadedt) this.strack.resume();
}
```

So `strack` needs `stop()`/`resume()`, and `loadedt` must become true once a
track is loaded. Keep that shape — do not rewrite `playsounds()`.

Loading should be triggered where the stage is known and must **never block or
throw**: a missing module, an unsupported browser, or a decode failure costs
music and nothing else, exactly as `web/audio.js` already treats sound. Autoplay
policy applies — reuse the same first-keypress unlock `web/audio.js` does
rather than inventing a second one.

## Verify

- `cd web && node --test` — 116 pass today; all 116 must still pass.
- Headless browser check that the page still boots and the game still renders
  and responds to keys (see `AGENTS.md`'s chromium `--screenshot` recipe;
  `--enable-logging=stderr --vmodule=console=1` to read console errors). Audio
  will not sound headless — **do not claim it plays**; confirm only that
  nothing throws and the module decodes.
- State plainly that audible verification is outstanding and needs a human.

## Report

Files created/changed; the vendored version/commit and bundle size (raw and
gzipped); the load-from-bytes entry point you used; whether the player creates
DOM/keyboard handlers; which of gain/rate/bpmflex you applied and which you
could not; test results; the headless-boot result; and every divergence,
workaround or thing you could not verify. Do not report "gaps: none".
