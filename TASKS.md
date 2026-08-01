# TASKS.md — remaining work on the JS/WebGL port

See `WORK.md` for gotchas, `js/TRANSPILE_SPEC.md` for the transpilation
contract, `AGENTS.md` for how to run, deploy and measure.

Status key: `[x]` done · `[~]` in progress · `[ ]` not started · `[!]` blocked/needs a human

---

## Done

- [x] Java-semantics runtime (`js/java.js`) — idiv/i32/trunc/fr, JavaRandom, Color
- [x] VFS + zip reader (`js/vfs.js`) — fetch, `DecompressionStream`, fpath autodetect
- [x] WebGL `Graphics2D` (`js/graphics.js`) — colour-as-attribute, one draw call, even-odd fill
- [x] Transpile: `Plane`, `Medium`, `Trackers`, `Wheels`, `CheckPoints`, `ContO`, `Record`, `Control`, `CarDefine`, `Mad`
- [x] Race harness (`js/GameSparker.js`) — `loadbase`, `loadstage`, `fase == 0` tick
- [x] Browser shell (`js/main.js`, `js/main.html`) — rAF pacing, keyboard, scale-to-fit
- [x] Audit `ContO`/`Record`/`Control` against §2/§2b
- [x] Fix black skybox, checkpoint flash (`*= (int)<float>` artifacts)
- [x] Fix tick rate (530ms/10 frames, not the 400ms menu figure)
- [x] Fix glyph fill (even-odd; keyhole counters in O/A/R)
- [x] `xtGraphics.stat()` — the in-race HUD. 11 multiplayer/clan/LAN branches
      deliberately skipped, each marked `// TODO not ported:` at the site.
- [x] `CarDefine.loadcar()` — un-stubbed; IO seam takes the file text as a parameter
- [x] **HUD image assets** (`js/images.js`) — decode from images.zip, port
      `loadsnap()` (per-stage tint + grey-ramp-as-alpha). Watch the mixed
      backgrounds: some assets are opaque 192-grey, later ones use GIF index
      transparency.
- [x] Deploy script with cache-stamped module imports (`deploy.sh`)
- [x] Benchmark harness — `?bench=`, fixed window, freezes on completion
- [x] Packed vertex colour (uint32, 12 bytes/vertex). Measured ~3%.

---

## Performance

Measured, 8 cars, stage 1, res=2 — see `WORK.md` for the full numbers:

| | cost | share |
|---|---|---|
| `simulate()` | 0.6–1.7 ms/tick | 2–7% |
| `draw()` | 15–25 ms/frame | the rest |

Draw tracks vertex count at ~0.25 µs/vert. ~40k of the ~100k verts are static
stage geometry, re-projected on the CPU every frame because the camera moves.

- [ ] **Split the browser's draw cost between geometry batching and the 2D
      overlay.** `?raster=0` currently stubs both, so the ~11.5 ms it removes
      in-browser is unattributed. Node says the batcher is only ~24% of draw,
      but node's null 2D context already no-ops `drawString`/`drawImage`, so
      the two disagree for a reason. Needs a stub that separates them. ~10 LOC,
      and it decides whether triangulation work is worth anything.
- [ ] **GPU-side projection.** `Plane.d()` does `rot`/`xs`/`ys` per vertex on
      the CPU every frame; this is the confirmed majority of draw in both
      measurements. Worth ~2x on its own, and it is what would make
      interpolation affordable — per-object transforms as uniforms means
      interpolating costs a lerp instead of a full CPU redraw.
      The `TASKS.md` note that used to live here claimed the painter's sort
      blocks this because it consumes `ContO.dist`. It does not: `dist` is
      per-OBJECT (126 of them), not per-vertex, and can stay CPU-side
      untouched while only the vertex transform moves. Still a large change —
      several hundred lines across `graphics.js` and `Plane.js`.
- [ ] Cache polygon triangulation topology at load instead of re-deriving
      convexity and ear-clipping per frame. Blocked on the split above; may be
      worth nothing.
- [x] ~~Widen array pooling~~ — measured no difference in gameplay. Dropped.

## Rendering / correctness

- [ ] **Interpolation jitter.** The car visibly jitters under `?interp=1`; the
      camera does not, which rules out the camera-blend theory. Blending
      x/y/z/xz/xy/zy is evidently not capturing all of the car's per-tick
      state. Off by default. This is the only route past 18.9 fps, so it
      matters more than "off by default" suggests.
- [ ] **Seeded PRNG on the Java side.** `Medium.random()` bottoms out in
      unseeded `Math.random()`, so `contO.zy`/`xy` cannot be verified against a
      probe. Patch + recompile `Medium.class` with a seeded LCG matching
      `js/java.js`, then extend `MadProbe`. Unblocks full verification of `Mad`.
- [ ] Cars all render as the same model when `?car=` is set, since main.js
      assigns one car to all 8 slots. The original varies them per slot.

## Deferred by earlier decision

- [ ] Audio — ring buffer + AudioWorklet + the `ibxm`/`ds.nfm.mod` tracker.
      `XtGraphics.crash/scrape/gscrape/skid` are named no-op stubs ready for it.
- [ ] Menus, car select, stage select — the other ~9600 lines of `xtGraphics`.
      Genuine brute work; the one part of this port that would suit a subagent.
      **Follow `PORT_SPEC.md`'s "Calibrate before batching" procedure** — one
      representative class first, catalogue every systematic error into the
      template, and only then fan out. See also the warning in `WORK.md` about
      subagents editing tests green.
- [ ] `CarMaker` / `StageMaker` — on PORT_SPEC's drop list.

## Known gaps / risks

- [!] `Mad`'s `zy`/`xy` are unverified pending the seeded-PRNG task above.
      Everything else in `Mad` matches Java exactly for 300 ticks.
- [!] A headless coast test showed `skid` sticking at 2 and speed pinning at
      18.0 where Java reaches 0. Not reproduced in gameplay; may be an artifact
      of the synthetic probe state. Worth revisiting.
- [ ] Glyph shimmer at distance is believed authentic (`Plane.java:742` culls
      sub-3px faces; `:261` is a 12/20-vertex LOD switch) — wants a side-by-side
      against `./start.sh` to confirm.
