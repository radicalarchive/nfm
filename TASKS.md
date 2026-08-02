# TASKS.md — remaining work on the JS/WebGL port

See `WORK.md` for gotchas, `web/TRANSPILE_SPEC.md` for the transpilation
contract, `AGENTS.md` for how to run, deploy and measure.

Status key: `[x]` done · `[~]` in progress · `[ ]` not started · `[!]` blocked/needs a human

---

## Done

- [x] Java-semantics runtime (`web/java.js`) — idiv/i32/trunc/fr, JavaRandom, Color
- [x] VFS + zip reader (`web/vfs.js`) — fetch, `DecompressionStream`, fpath autodetect
- [x] WebGL `Graphics2D` (`web/graphics.js`) — colour-as-attribute, one draw call, even-odd fill
- [x] Transpile: `Plane`, `Medium`, `Trackers`, `Wheels`, `CheckPoints`, `ContO`, `Record`, `Control`, `CarDefine`, `Mad`
- [x] Race harness (`web/GameSparker.js`) — `loadbase`, `loadstage`, `fase == 0` tick
- [x] Browser shell (`web/main.js`, `web/main.html`) — rAF pacing, keyboard, scale-to-fit
- [x] Audit `ContO`/`Record`/`Control` against §2/§2b
- [x] Fix black skybox, checkpoint flash (`*= (int)<float>` artifacts)
- [x] Fix tick rate (530ms/10 frames, not the 400ms menu figure)
- [x] Fix glyph fill (even-odd; keyhole counters in O/A/R)
- [x] `xtGraphics.stat()` — the in-race HUD. 11 multiplayer/clan/LAN branches
      deliberately skipped, each marked `// TODO not ported:` at the site.
- [x] `CarDefine.loadcar()` — un-stubbed; IO seam takes the file text as a parameter
- [x] **HUD image assets** (`web/images.js`) — decode from images.zip, port
      `loadsnap()` (per-stage tint + grey-ramp-as-alpha). Watch the mixed
      backgrounds: some assets are opaque 192-grey, later ones use GIF index
      transparency.
- [x] Deploy script with cache-stamped module imports (`deploy.sh`)
- [x] Benchmark harness — `?bench=`, fixed window, freezes on completion
- [x] Packed vertex colour (uint32, 12 bytes/vertex). Measured ~3%.

---

## Performance

Measured on the target machine, stage 1, res=2. `simulate()` is 0.6–2.5 ms/tick
(2–7%); **drawing is everything else.** Draw breaks down as:

| layer | share | isolate with |
|---|---|---|
| Canvas2D overlay (HUD text/images) | 1.8% | `?overlay=0` |
| geometry batching (triangulation, vertex writes) | 19% | `?geom=0` |
| projection + traversal (`Plane.d`) | 81% | `?raster=0` |

Cost model: `draw ≈ fixed + ~1.0–1.3us per PROJECTED vertex`. Projected is not
submitted — `Plane.d` transforms 12–20 vertices per face before culling decides
whether to submit any, so ~14,800 are projected to submit ~10,300. Do NOT trust
a fitted intercept: the within-run regression is ill-conditioned (R² 0.07–0.29,
and it has returned a negative fixed cost). Measure fixed costs with `?prof=1`.

- [x] **Account for the ~9.8 ms fixed term.** It was `medium.d()`, and most of
      it was the O(height) scanline fill rather than the backdrop's geometry —
      the trapezoid fill cut the backdrop 6.08 -> 3.83 ms on its own. What
      remains of it (~3.8 ms of sky/ground bands, mountains, clouds) has no
      single hotspot; further gains there mean fewer gradient bands (a visual
      change) or moving the gradient to a fragment shader.
- [x] **Trapezoid fill for concave/self-intersecting polygons.** One trapezoid
      per span per band instead of one quad per pixel row. Emitted verts
      57,069 -> 37,269 (-35%), normalised cost -12%. Exact even-odd, verified
      against a point-in-polygon truth; `?fill=scan` restores the old path.
- [ ] ~~Account for the fixed term~~ (superseded) It scales with nothing, and node
      shows only 1.4 ms fixed on the identical scene. Two candidates: the
      even-odd scanline fill, whose cost is proportional to polygon AREA and
      which no counter tracks; or the fit itself, since two points 1.7x apart
      extrapolate an intercept badly. Settle this BEFORE the shader rewrite —
      if it is real it may be a smaller change for a similar win, and if it is
      an artifact the shader payoff is larger than currently estimated.
- [ ] **GPU-side projection.** The only term that provably scales, and the
      majority of draw. Budget ~2–3x on draw, not 5x. It is also what would
      make interpolation affordable: per-object transforms as uniforms means
      interpolating costs a lerp instead of a full CPU redraw.
      The old note claiming the painter's sort blocks this was wrong: `dist` is
      per-OBJECT (126 of them), not per-vertex, and stays CPU-side untouched
      while only the vertex transform moves. Still several hundred lines across
      `graphics.js` and `Plane.js`.
- [ ] Cache polygon triangulation topology at load rather than re-deriving
      convexity per frame. Worth at most the batcher's ~13%, and the trapezoid
      work already took the expensive part of it.
- [x] ~~Widen array pooling~~ — **pooling is a 30% PESSIMISATION**
      (10.96 → 14.27 ms, node, identical scene). The earlier "1.13x" figure and
      the in-game A/B that showed no difference were both wrong; the A/B
      compared fps, which is pinned at 18.9. Leave `?pool=` off.
- [x] Packed vertex colour (uint32, 12 bytes/vertex). ~3%, pixel-identical.
- [x] MSAA off above res=1 (~12%); overlay no longer scales with `?res=`.

## Launcher (`index.html` + `web/preview.js`)

- [x] Car/stage picker with names, live rotating 3D car preview (the game's own
      car-select camera and car-maker spin), stat bars from CarDefine's tables,
      the NFM face keyed as `loadude` keys it, and a collapsed advanced panel
      carrying every query parameter.
- [x] Stage-specific opponent grid (`xtGraphics.sortcars`).
- [x] Overhead stage preview rendered with the real renderer (`m.trk = 2`).
- [ ] **Stage 8 renders nothing in the overhead view** and falls back to the
      flat map. 172 objects pass the object-level gates and emit 24 vertices;
      the cause is inside `Plane.d`'s face culling at ~91k depth and is not
      understood. Stages needing more than 85k depth all take the fallback,
      so any large stage is affected.
- [ ] Reported but unconfirmed: "some tracks have textures extending off
      screen" (stage 9). Not reproduced since the camera-clearance fix; needs
      a look with fresh eyes.

## Rendering / correctness

- [x] **Stop patching per-effect state field by field — mark the pass instead.**
      Done, and it took TWO mechanisms because the effects break in two ways.
      **Counters:** `Medium.interpolating` marks the redraw and each effect
      guards its own advance at the mutation (`if (!this.m.interpolating)`) —
      repair sparkle, dust stages and drift, crash-spark spawn/velocity/stage
      (every interpolated frame was seeding another 100 sparks), the electric
      ring's `elc`, checkpoint flicker, lightning, `noelec`, star twinkle, and
      `Plane`'s whole damage animation (`embos`, and the `chip` debris with
      its own velocity integration) which no list had ever covered.
      **Shape:** effects roll their geometry straight out of `random()`, so a
      redraw drew a *different* random shape rather than a later one — that is
      what made the repair ring's electricity buzz. Fixed once, centrally:
      `Medium.random()` records the tick draw's sequence and an interpolated
      pass replays it, armed in `Medium.d()` (always draw's first call). No
      per-call-site caching, which matters because `Plane.s()` alone has ~30
      shape-rolling randoms.
      `OBJ_STATE`, `OBJ_ARRAYS` and the effect half of `MED_STATE` are gone
      from `main.js`, which now snapshots draw's one real output, `ContO.dist`.
      Regression test pins both halves: *"an interpolated draw advances no
      per-effect animation state"* also asserts two interpolated frames of one
      tick are vertex-identical.
      The stronger version is still open: don't re-execute `draw()` at all,
      keep the tick's vertex buffer and re-project it, which removes the class
      outright rather than requiring the guard to be remembered.

- [x] HUD vanished with `?interp=1` — `rd.begin()` clears the 2D overlay, and
      the interpolated redraw ran it after `simulate()` had drawn the HUD
      there. Interpolated frames now pass `keepOverlay`.
- [x] **Interpolation jitter — fixed, and interpolation is now the default.**
      Cause: `Medium.sin`/`cos` index a
      360-entry table by whole degrees, so blended headings were rounded to 1
      degree — ~13px of yaw — giving smooth translation with stepped rotation.
      Hence jitter on turns only. Both now interpolate between table entries
      for fractional arguments; integers take the old branch, so the
      simulation is unchanged. Confirmed smooth in play, so `?interp=1` is now
      the default and the game renders at display rate (~58fps measured)
      instead of the 18.9fps tick rate. `?interp=0` restores tick-rate drawing.
      `cam=` is gone: re-derive was structurally unfixable, since `follow()` is
      a stateful ease rather than a function of the interpolation fraction and
      lurched once per tick regardless.
- [ ] **Seeded PRNG on the Java side.** `Medium.random()` bottoms out in
      unseeded `Math.random()`, so `contO.zy`/`xy` cannot be verified against a
      probe. Patch + recompile `Medium.class` with a seeded LCG matching
      `web/java.js`, then extend `MadProbe`. Unblocks full verification of `Mad`.
- [x] Stage-specific opponent grid — `xtGraphics.sortcars()` ported. Draws
      slots 1..6 by rejection sampling biased toward faster cars in later
      stages, then forces specific opponents for stages 10/12/14/15/16.
      `?cars=same` restores one-car-for-everyone.
- [ ] Car stats bugs in index.html - index shows 4 stats, but there are 6
    - the values shown in the sliders dont match the game


## Remaining Tasks

- [x] Backend: `web/audio.js` decodes sounds.zip into AudioBuffers and plays
      one-shots. Autoplay-gesture unlock on first key press; missing zip or
      absent Web Audio costs sound and nothing else.
- [x] `crash` / `skid` / `scrape` / `gscrape` ported from xtGraphics.java
      (9289-9430), rotation counters and `bfXXX` debounce included.
- [x] **A sound effect plays once per race, then never again** — fixed by
      `playsounds()` below, which decrements the `bfXXX` counters. Covered by
      *"playsounds decrements the sound debounce counters"*, which asserts a
      second crash actually sounds rather than just checking the field.
- [x] **`playsounds()` — ported** (`XtGraphics.playsounds`), with
      `sparkeng()` and `stopairs()`, called once per tick from the end of
      `GameSparker.simulate()`. It decrements every `bfXXX` debounce counter
      and drives the engine and air loops. Two tests pin it: the counters
      clearing, and the tick actually calling the pump — porting the method
      and leaving it unreferenced would otherwise pass everything.
      **Not ported:** the `multion==2/3` branch that mirrors player 0's mute
      flags onto a remote player, and the `app.applejava` clip-reopen
      workaround; both marked `// TODO not ported:` at the site.
- [~] **Engine sound.** The looping clip type is in (`web/audio.js`:
      `loop`/`stopLoop`/`isLooping`/`stopAllLoops`; muting cuts live loops),
      the 25 numbered samples and `air0`-`air5` decode, and `sparkeng()` holds
      exactly one of five engine clips looping per rev band. **Unverified by
      ear** — needs a listen in a real browser, which is the only oracle here.
      `checkopen()`'s clip reopening is deliberately not ported; Web Audio has
      no equivalent failure to work around.
- [~] Remaining one-shots: all now bound to real clips via `XtGraphics._clip`
      rather than `{play(){}}` stubs, so `firewasted` (fired from
      `playsounds()`) and `carfixed` (already called from `Mad`) work.
      `checkpoint`, `wasted`, `powerup` and the `one`/`two`/`three`/`go`
      countdown are wired but still have no call site in the port — those live
      in race-state code that is not ported yet.
- [ ] **Music — the `ibxm`/`ds.nfm.mod` tracker.** Delegation spec written:
      `decompilation/MUSIC_PORT_SPEC.md`. Self-contained (no renderer contact,
      no shared game state) and, unusually for this port, it has an exact
      oracle — render N seconds of PCM through the real classes by reflection
      and diff against the JS as integers. Bounded as calibrate-before-batching
      requires; the AudioWorklet wiring stays with a human.
- [ ] Menus, car select, stage select — the other ~9600 lines of `xtGraphics`.
      Genuine brute work; the one part of this port that would suit a subagent.
      **Follow `decompilation/PORT_SPEC.md`'s "Calibrate before batching" procedure** — one
      representative class first, catalogue every systematic error into the
      template, and only then fan out. See also the warning in `WORK.md` about
      subagents editing tests green.
- [ ] `CarMaker` / `StageMaker` — on decompilation/PORT_SPEC.md's drop list.

## Known gaps / risks

- [!] `Mad`'s `zy`/`xy` are unverified pending the seeded-PRNG task above.
      Everything else in `Mad` matches Java exactly for 300 ticks.
- [!] A headless coast test showed `skid` sticking at 2 and speed pinning at
      18.0 where Java reaches 0. Not reproduced in gameplay; may be an artifact
      of the synthetic probe state. Worth revisiting.
- [ ] Glyph shimmer at distance is believed authentic (`Plane.java:742` culls
      sub-3px faces; `:261` is a 12/20-vertex LOD switch) — wants a side-by-side
      against `./start.sh` to confirm.
