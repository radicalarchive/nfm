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

## Car editor + browser storage (branch `careditor`)

See `decompilation/CAREDITOR_PORT_SPEC.md` for the chunk table and the
delegation contract; `decompilation/agy_careditor <chunk>` runs one.

- [x] Browser storage (`web/carstore.js`) — IndexedDB `name -> .rad text`,
      stored cars shadow the four shipped in `mycars/`, and it supplies the
      listing `CarDefine.loadcarmaker()` gets from `File.list()` on the desktop.
- [x] Race a custom car: `web/main.html?mycar=<name>`, and the launcher lists,
      previews, imports and deletes them.
- [x] Chunk `shape` (calibration) — regx, regz, roofsqsh, crash, setheme, py, rot, xs, ys
- [x] Chunk `files` — IO seam + the `.rad` parser
- [x] Chunk `ui` — hidefields, movefield, drawms, stringbutton, ovbutton
- [x] Chunk `ctachm` — the editor's draw and hit-testing pass
- [x] Chunk `tab2` (1,600 lines — split if it comes back thin), `tab0`, `tab1`,
      `tab3`, `input`, `boot`
- [x] ~~The editor shell driving the transpiled panes headlessly.~~ Built, then
      thrown away: running the applet's panes for their button rects inherited
      the applet's UI (Scale and Align sharing a pane, Apply/Save pairs, a
      paginating physics tab) and most of the work went into the bridge rather
      than the editor. See WORK.md 2026-08-03.
- [x] The editor proper (`web/careditor/rad.js` + `editor.js`): the `.rad` text
      is the model, every control reads and rewrites it live, one Save, and the
      preview is the game's own `ContO`.
- [x] Wire save -> `carstore.writeCar` and Test Drive -> `?mycar=`.
- [x] Embed `stat()`/`physics()` in the sixteen base cars
      (`web/tools/embedstats.mjs`) so they are editable and a car saved from one
      is raceable.
- [ ] Retrofit the original sixteen to READ their handling from those embedded
      lines instead of `CarDefine`'s constructor tables, so the `.rad` is the
      single source of truth — the tool reports which fields do not yet
      round-trip (`moment`, `comprad`, `outdam`, `powerloss`, `airs`/`airc` are
      derived from stats and geometry, not from `physics()`).
- [ ] Keyboard navigation, consistently, across the launcher, the editor and
      the in-game menus. The editor's tabs already follow the WAI-ARIA tablist
      pattern (roving tabindex, arrows between tabs) — make that the house
      style rather than a one-off.

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
      majority of draw. Budget ~2–3x on draw, not 5x. **But it will not fix
      the fps DIPS:** `?res=1` dips noticeably less than `?res=2` on the same
      scene, so the dips scale with pixels and are fill/overdraw-bound, which
      a vertex shader does not touch. Average frame cost is what improves. It is also what would
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
- [x] Audio volume settings — sfx and music volume sliders in the advanced panel,
      piped to the audio and music modules.
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
- [x] Car stats bugs in index.html — the launcher showed four invented stats
      normalised against the roster maximum. Replaced with the car-select
      screen's own six bars and its own absolute formulas
      (`xtGraphics.java:6096-6131`): Top Speed, Acceleration, Handling,
      Stunts, Strength, Endurance.


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
- [x] **Engine sound.** The looping clip type is in (`web/audio.js`:
      `loop`/`stopLoop`/`isLooping`/`stopAllLoops`; muting cuts live loops),
      the 25 numbered samples and `air0`-`air5` decode, and `sparkeng()` holds
      exactly one of five engine clips looping per rev band.
      **Confirmed by ear in a real browser (2026-08-01) — the only oracle that
      counts for audio.** `checkopen()`'s clip reopening is deliberately not
      ported; Web Audio has no equivalent failure to work around.
- [x] **Race start and finish wired up.** `resetstat()` now ports the whole
      per-race reset (`xtGraphics.java:1484`), not just the music load; its
      `starcnt = 130` / `gocnt = 3` are what arm the intro fly-by and the
      3-2-1-GO. Both sequences were already ported in `GameSparker.simulate`
      and `stat()` but unreachable with the counter left at zero. The
      end-of-race overlays (`youwon`, `youlost`, `yourwasted`, `youwastedem`)
      and the countdown's `d1/d2/d3.png` faces now load in `images.js`;
      `gamefinished`/`disco`/`wgame` stay out, being multion-only in the
      Java's own `snap()`. `fase == -2` -- the Java's leave-the-race signal --
      returns to the launcher, since the menus are not ported.
- [~] Remaining one-shots: all now bound to real clips via `XtGraphics._clip`
      rather than `{play(){}}` stubs, so `firewasted` (fired from
      `playsounds()`) and `carfixed` (already called from `Mad`) work.
      `checkpoint`, `wasted`, `powerup` and the `one`/`two`/`three`/`go`
      countdown are wired but still have no call site in the port — those live
      in race-state code that is not ported yet.
- [x] **Music — done, without porting the tracker.** `web/music.js` plays the
      game's own `.mod` modules through **BassoonTracker**, a pure-JS MOD/XM
      player vendored into `web/vendor/` (48.8 KB raw, **16.3 KB gzipped**,
      MIT). Wired to the existing `strack`/`loadedt`/`mutem` call sites, so
      `playsounds()` is untouched; `resetstat()` loads the stage track and
      handles `loadstrack`'s one special case (stage 27 is `party.zip` when
      `gmode == 2`). All 34 `[gain, rate, bpmflex]` triples are transcribed and
      **verified against the Java by a test that parses `loadstrack` itself** —
      a shape-only test would pass with every number wrong.
      `gain/300` maps to the master gain. `rate` is deliberately NOT applied:
      it set the mixer's sample rate, shifting pitch and tempo together, and
      faking it with `playbackRate` would detune the music. `trackvol` is
      accepted and ignored, because `loadstrack` only uses it for custom
      `mystages/mymusic` tracks (where it IS the gain), not for stock stages.
      **Costs 3.3 MB — the modules already in the repo — versus 54 MB of Opus
      or 203 MB of FLAC for pre-rendering, or ~2,500 lines to port `ibxm`.**
      Verified: 119/119 tests, and a headless browser boot where the module
      fetches, unzips and parses with no warning. **Audible check outstanding**
      — headless Chromium produces no sound, so someone has to listen.
      Not sample-identical to the desktop game: BassoonTracker's mixer is not
      `ibxm`'s. Uses a `ScriptProcessorNode` (deprecated but functional).
- [x] ~~Port the `ibxm` tracker~~ — **no longer needed.** `Data`, `Sample` and
      `Envelope` are ported and verified (steps 1-2, kept: they cost nothing to
      keep and are the reference if bit-exactness is ever wanted), but
      `Channel`/`Module`/`IBXM` and the `RadicalMod` wrapper layer are dropped.
- [x] ~~Pre-render the soundtrack at build time~~ — built and working
      (`tools/bake-music.sh`, `web/tools/BakeMusic.java`, output gitignored),
      but superseded: 203 MB FLAC / 54 MB Opus against 3.3 MB of modules.
      Kept as a fallback. Its loop points come from `rollBackPos`/`rollBackTrig`
      and needed a fix — `SuperClip` compares the latter against bytes
      REMAINING, so loop end is `length - rollBackTrig`, not `rollBackTrig`.
- [ ] Menus, car select, stage select — the other ~9600 lines of `xtGraphics`.
      Genuine brute work; the one part of this port that would suit a subagent.
      **Follow `decompilation/PORT_SPEC.md`'s "Calibrate before batching" procedure** — one
      representative class first, catalogue every systematic error into the
      template, and only then fan out. See also the warning in `WORK.md` about
      subagents editing tests green.
- [ ] `CarMaker` / `StageMaker` — on decompilation/PORT_SPEC.md's drop list.

## Netplay (private multiplayer)

Decided 2026-08-02, nothing built yet. Static hosting only (GitHub Pages), so
there is no backend of ours anywhere in this design.

- **Transport:** PeerJS over its free public broker, WebRTC DataChannel in
  unreliable/unordered mode, each packet carrying the last ~8 ticks of input so
  a drop self-heals without retransmission. Manual copy-paste of offer/answer
  stays worth keeping as a fallback that depends on nobody.
- **Sync:** lockstep with a fixed input delay. Rollback is wanted later, so
  keep the world's snapshot/restore path (`main.js`'s `capture`/`restore`)
  general rather than assuming inputs never need re-simulating.
- **First cut:** 2 players, join by URL room code, AI fills slots 2-6. No
  lobby, chat or player list — those are in the ~9600 unported `xtGraphics`
  lines and the 11 skipped multiplayer branches of `stat()`.
- [x] **Determinism groundwork** — done. Seeded sim/draw PRNG split (`java.js`),
      baked `trig.js` tables, and a test that two runs reach bit-identical
      state whatever they draw. Confirmed it fails with the split disabled.
- [x] **Prototype works.** `netsync.js` (lockstep
      rules, 12 tests), `netpeer.js` (PeerJS transport), launcher UI, and
      `web/tools/netloop.mjs`, which runs two clients in separate processes
      through a lossy relay. **Syncs for ~1118 ticks (~60s of racing), then
      diverges via collision damage.** The lead is recorded: the collision
      MESH already differs at tick 3, long before any position does, and
      nothing in Mad writes it in those ticks — so the cause is at or near
      world construction, not in the tick loop. Untested end to end in a
      browser: PeerJS could not be exercised headlessly, because
      `--virtual-time-budget` starves the real network.
- [x] ~~Determinism groundwork, FIRST and verified on its own.~~ A desync found
      after the transport exists is very hard to attribute; found now it is a
      unit test. Two parts:
      - Seed `Medium.random()`. Note it is consumed by the DRAW path too
        (`Plane.s()` rolls ~30 per face, and the interpolation replay already
        records and replays that sequence), so sim and draw need SEPARATE
        streams or two clients rendering different numbers of interpolated
        frames will desync the simulation.
      - Bake `Medium`'s `tsin`/`tcos` as literal float32 constants. They are
        built from `Math.sin`/`Math.cos` at init, which are not guaranteed
        bit-identical across JS engines, and players will be on different ones.
      - Acceptance: two independently built worlds tick 1000 times to
        bit-identical state, asserted in a test.
- [ ] **Reconsider lockstep before adding a 3rd player.** The original is
      host-authoritative state sync: `UDPMistro.setinfo()` sends inputs AND
      absolute state per car per tick, and the host simulates the bots
      (`GameSparker.java:1348`). Lockstep gates every peer on the laggiest one,
      needs an N(N-1)/2 mesh and can't do drop-in, and its one big win — the AI
      syncing for free — is worth nothing once humans fill those slots.
      Switching costs `netsync.js` and its 12 tests (~20-25% of the netplay
      work); `netpeer.js`, the launcher UI, `browser2p.mjs` and every
      determinism fix survive — determinism is what would make state sync's
      dead reckoning accurate enough that corrections never show.
      - Write the transport fresh in JS: `UDPMistro`/`udpServe`/`udpOnline` are
        DatagramSocket plumbing and a stringly-typed relay protocol with no
        browser analogue. But transcribe `setinfo`/`getinfo` closely — which
        fields are authoritative per car, and how the receive side folds them
        back into `Mad`/`ContO`, is real game logic.

## Known gaps / risks

- [!] `Mad`'s `zy`/`xy` are unverified pending the seeded-PRNG task above.
      Everything else in `Mad` matches Java exactly for 300 ticks.
- [!] A headless coast test showed `skid` sticking at 2 and speed pinning at
      18.0 where Java reaches 0. Not reproduced in gameplay; may be an artifact
      of the synthetic probe state. Worth revisiting.
- [ ] Glyph shimmer at distance is believed authentic (`Plane.java:742` culls
      sub-3px faces; `:261` is a 12/20-vertex LOD switch) — wants a side-by-side
      against `./start.sh` to confirm.
- [ ] BassoonTracker's `ScriptProcessorNode` can starve and stutter under heavy load; needs an `AudioWorklet` port (or fallback to pre-rendered audio).
