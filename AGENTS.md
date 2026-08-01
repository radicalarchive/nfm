# AGENTS.md — Need for Madness (nfm)

## Project
A 2015 Java game being ported to run natively in the browser as JS + WebGL.
The original source was never released; `decompilation/java-src/` is decompiled bytecode and
is the reference for the port, not a build input.

The **JS/WebGL port under `web/` is the active work.** The patched `Game.jar`
still exists and still runs — it is the reference implementation you compare
against when the port looks wrong.

## Read these first
- `WORK.md` — discoveries and gotchas, one line each, newest at the bottom.
  **Append to it whenever you learn something a future agent would waste an
  hour rediscovering.** Especially when a measurement overturns something
  already written there: strike the old entry, don't delete it.
- `TASKS.md` — what is done, what is next, what is blocked.
- `web/TRANSPILE_SPEC.md` — the contract for turning decompiled Java into JS
  (int wrapping, float32 rounding, compound-assignment classification).
- `decompilation/PORT_SPEC.md` — the original plan. `TASKS.md` supersedes its status, but its
  **subagent delegation methodology is still live and still binding** — read
  "Using a subagent" and "Calibrate before batching" before delegating any part
  of the remaining `xtGraphics` menu work.

## Layout
- `index.html` — the launcher (car/stage picker; advanced settings collapsed).
- `web/` — the port. `main.html` is the game itself.
- `web/tools/` — Java probes that drive the real classes by reflection, for
  differential testing against the port.
- `decompilation/` — decompiled originals (`java-src/`), `PORT_SPEC.md`, and
  the delegated-job records. Read-only reference.
- `java/` — the patched jar and its history.
- `data/`, `stages/`, `mycars/`, `mystages/`, `music/` — game assets, byte-identical
  to the original and **not to be modified**; the port reads them as-is.
- `java/Game.jar` — patched desktop jar. `java/Game.jar.bak` is pristine, do not modify.
- `start.sh` — runs the desktop game (the visual reference).

## Running the port
```sh
python3 -m http.server 8123        # from the repo root
# then open http://localhost:8123/  (or /web/main.html to skip the launcher)
```
`vfs.detectFpath()` probes `./` then `../`, so it works from either layout.

### Deploying
```sh
./deploy.sh                        # -> cop:/www/nfm/ (a flat tree)
```
Mirrors with `rsync --delete` and stamps every ES module import with a content
hash. **The stamping is not optional:** the host sends no `Cache-Control`, so a
module graph otherwise goes stale one file at a time and you debug last
deploy's code.

## Verifying a change
Three levels, cheapest first.

```sh
cd web && node --test              # 104 tests; unit + differential + integration
```

Headless render, to confirm something actually draws:
```sh
chromium --headless=new --no-sandbox --enable-unsafe-swiftshader \
  --window-size=900,506 --virtual-time-budget=90000 \
  --screenshot=out.png --hide-scrollbars \
  "http://localhost:8123/web/main.html?players=8&res=1&bench=0"
compare -metric AE before.png out.png /dev/null     # 0 = pixel-identical
```
`--screenshot` is required — without it rAF never fires and the page looks
hung. Add `--enable-logging=stderr --vmodule=console=1` to read `console.log`.

Performance, in a real browser (headless timings are meaningless: virtual time
does not advance `performance.now()` within a task):
```
web/main.html?stats=1&bench=3          # 3s warmup, 3s average, then freezes
```

## Measuring performance — read this before optimising

Every wrong conclusion in this project's history came from a measurement
artifact, not from a wrong theory. In order of how much time each one cost:

- **fps cannot show a rendering difference.** With `interp=0` the game draws
  only on a tick, so fps is pinned at 18.9 by construction. Use the ms figures.
  An A/B compared by fps in this mode is measuring nothing.
- **Normalise by scene weight.** Draw cost swings ~60% with where the car is.
  Compare `ns/vert submitted`, never `ms/frame`, or you will conclude that
  removing work made the frame slower — which has happened here.
- **Diagnostic stubs must still count.** `?geom=0` counts its input even though
  it emits nothing; a stub that reports a zero scene cannot be normalised
  against a normal run.
- **Time `draw()` and `simulate()` separately.** `GameSparker.tick()` is the
  two in sequence; timing it as a unit charges everything to "sim".
- **Projected ≠ submitted ≠ emitted.** `Plane.d` transforms 12–20 vertices per
  face before culling decides whether to submit any (1.44x), and the batcher
  fans polygons into triangles (~4x). The benchmark reports all three; the
  projected count is the one a vertex shader would address.
- **Nothing counts the even-odd scanline fill**, whose cost is proportional to
  polygon AREA. A scene with checkpoint glyphs on it costs more with no counter
  changing.
- **Node is exact for scene shape, not for time.** Face and vertex counts
  reproduce the browser to within 0.1%, so get ratios and counts under node
  with no browser round trip. Absolute timings need a real browser: node's JIT
  differs and its null 2D context already no-ops the overlay.

Stubs: `?overlay=0` (Canvas2D), `?geom=0` (batcher), `?raster=0` (both).
Counters in the benchmark line: objects drawn/considered, faces, projected and
submitted vertices.

## The one invariant that must not break
There is **no depth buffer**. Occlusion is submission order and nothing else.
Colour is a vertex attribute, the whole frame is one draw call, and the depth
sort in `GameSparker.draw()` consumes `ContO.dist`. Do not batch by material,
do not sort, do not split primitive types into separate passes. Any of those
still looks plausible in a screenshot, which is what makes it dangerous. See
the banner at the top of `web/graphics.js`.

## The desktop jar (reference implementation)
All patches are ASM bytecode edits; there is no source to rebuild from.

### `Madness.class`
1. **`runFinalizersOnExit` removal** — removed in Java 18. NOP'd the 4-byte
   `iconst_1; invokestatic` at file offset 6461: `04 b8 00 02` → `00 00 00 00`.
2. **`gofullscreen()` bitDepth filter** — modern X11 returns `-1` from
   `getBitDepth()`, so a `< 16` filter rejected every mode and threw AIOOBE.
   Patched `bipush 16` → `bipush -2` at file offset 7171.

### `GameSparker.class` (ASM tree API)
3. **`keyDown`/`keyUp` null guard** — `u[0]` is null in the menu; prepended
   `if (u==null || u.length==0 || u[0]==null) return false;`.
4. **High-res offscreen buffer** — `createImage(800,450)` → `(1600,900)` plus
   `rd.scale(2.0, 2.0)`.
5. **Fullscreen scaled blit** — four 4-arg `drawImage` sites replaced with the
   10-arg form, dest rect from `apx`/`apy`/`apmult`.
6. **Auto-fill in fullscreen** — `reqmult = 1.0f` when `Madness.fullscreen`.
7. **Default slider to max** — constructor `fconst_0` → `fconst_1` at offset 20833.

Rebuild: apply the ASM patcher to a pristine `GameSparker.class`, apply the
`Madness.class` byte patches, repack with `zip` (signature files already
stripped from the build dir). Verify with:
```sh
timeout 10 java -jar Game.jar manar 2>&1 | head    # expect no output, exit 124
```

## Useful commands
```sh
javap -p -c -classpath <dir> <Class>                       # disassemble
java -jar procyon-decompiler.jar -o out/ <Class>.class     # decompile
unzip -l data/images.zip                                   # asset inventory
```
