# TASKS.md — remaining work on the JS/WebGL port

Checked off as completed. See `WORK.md` for gotchas, `js/TRANSPILE_SPEC.md`
for the transpilation contract, `PORT_SPEC.md` for the original plan.

Status key: `[x]` done · `[~]` in progress · `[ ]` not started · `[!]` blocked/needs a human

---

## Done

- [x] Java-semantics runtime (`js/java.js`) — idiv/i32/trunc/fr, JavaRandom, Color
- [x] VFS + zip reader (`js/vfs.js`) — fetch, `DecompressionStream`, fpath autodetect
- [x] WebGL `Graphics2D` (`js/graphics.js`) — colour-as-attribute, one draw call, even-odd fill
- [x] Transpile: `Plane`, `Medium`, `Trackers`, `Wheels`, `CheckPoints`, `ContO`, `Record`, `Control`, `CarDefine`, `Mad`
- [x] Race harness (`js/GameSparker.js`) — `loadbase`, `loadstage`, `fase == 0` tick
- [x] Browser shell (`js/main.js`, `js/index.html`) — rAF pacing, keyboard, scale-to-fit
- [x] Audit `ContO`/`Record`/`Control` against §2/§2b — found + fixed a Case A/B
      misclassification on `ContO.wh` and 4 unwrapped sum-of-squares
- [x] Fix black skybox, checkpoint flash (`*= (int)<float>` artifacts)
- [x] Fix tick rate (530ms/10 frames, not the 400ms menu figure)
- [x] Fix glyph fill (even-odd; keyhole counters in O/A/R)
- [x] 2x render resolution + `?res=`
- [x] Frame interpolation + `?interp=`, `?cam=`, `?maxfps=`, `?stats=`, `?pool=`

---

## Next up

- [x] **`xtGraphics.stat()` — the in-race HUD.** Ported; ~155 triangles/frame.
      11 branches deliberately skipped, each marked `// TODO not ported:` at the
      site — all multiplayer / clan / LAN / spectator / chat. Verified drawing.
- [x] **`CarDefine.loadcar()` — un-stub.** Done; IO seam takes the file text as
      a parameter. Two compound-assignment sites classified Case A from bytecode.
- [ ] **Image loader for HUD assets.** `stat()` draws several `.gif`s from
      `data/` and `images.zip`; those calls are null-guarded no-ops today, so the
      HUD shows its vector parts only. Needs `createImageBitmap` plus the
      existing zip reader, then remove the guards.
- [ ] **Seeded PRNG on the Java side.** `Medium.random()` bottoms out in
      unseeded `Math.random()`, so `contO.zy`/`xy` cannot be verified against a
      probe (see WORK.md). Patch + recompile `Medium.class` with a seeded LCG
      matching `js/java.js`'s, then extend `MadProbe` to pin zy/xy too. This is
      PORT_SPEC phase 1 and it unblocks full verification of `Mad`.

## Performance (do NOT delegate — touches the ordering constraint)

- [ ] **GPU-side projection.** `Plane.d()` does `rot`/`xs`/`ys` per vertex on
      the CPU every frame; `simulate()` measures 10.3ms vs `draw()`'s 3.1ms.
      Moving projection to a vertex shader would collapse most of that. Care
      required: the painter's-algorithm sort consumes `ContO.dist`, which is
      computed CPU-side during projection today.
- [ ] Widen array pooling beyond `Plane.d`'s six hot arrays (measured 1.13x,
      bit-identical). Modest — GC is evidently not the main cost.

## Deferred by earlier decision

- [ ] Audio — ring buffer + AudioWorklet + the `ibxm`/`ds.nfm.mod` tracker.
      `XtGraphics.crash/scrape/gscrape/skid` are named no-op stubs ready for it.
- [ ] Menus, car select, stage select — the other ~9600 lines of `xtGraphics`.
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
