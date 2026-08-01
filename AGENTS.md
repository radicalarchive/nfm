# AGENTS.md — Need for Madness (nfm)

## Project
A 2015 Java game being ported to run natively in the browser as JS + WebGL.
The original source was never released; `java-src/` is decompiled bytecode and
is the reference for the port, not a build input.

The **JS/WebGL port under `js/` is the active work.** The patched `Game.jar`
still exists and still runs — it is the reference implementation you compare
against when the port looks wrong.

## Read these first
- `WORK.md` — discoveries and gotchas, one line each, newest at the bottom.
  **Append to it whenever you learn something a future agent would waste an
  hour rediscovering.** Especially when a measurement overturns something
  already written there: strike the old entry, don't delete it.
- `TASKS.md` — what is done, what is next, what is blocked.
- `js/TRANSPILE_SPEC.md` — the contract for turning decompiled Java into JS
  (int wrapping, float32 rounding, compound-assignment classification).
- `PORT_SPEC.md` — the original plan. `TASKS.md` supersedes its status, but its
  **subagent delegation methodology is still live and still binding** — read
  "Using a subagent" and "Calibrate before batching" before delegating any part
  of the remaining `xtGraphics` menu work.

## Layout
- `js/` — the port. `main.html` is the game, `index.html` is the A/B test index.
- `js/tools/` — Java probes that drive the real classes by reflection, for
  differential testing against the port.
- `java-src/` — decompiled originals. Read-only reference.
- `data/`, `stages/`, `mycars/`, `mystages/`, `music/` — game assets, byte-identical
  to the original and **not to be modified**; the port reads them as-is.
- `Game.jar` — patched desktop jar. `Game.jar.bak` is pristine, do not modify.
- `start.sh` — runs the desktop game (the visual reference).

## Running the port
```sh
python3 -m http.server 8123        # from the repo root
# then open http://localhost:8123/js/main.html
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
node --test                        # 99 tests; unit + differential + integration
```

Headless render, to confirm something actually draws:
```sh
chromium --headless=new --no-sandbox --enable-unsafe-swiftshader \
  --window-size=900,506 --virtual-time-budget=90000 \
  --screenshot=out.png --hide-scrollbars \
  "http://localhost:8123/js/main.html?players=8&res=1&bench=0"
compare -metric AE before.png out.png /dev/null     # 0 = pixel-identical
```
`--screenshot` is required — without it rAF never fires and the page looks
hung. Add `--enable-logging=stderr --vmodule=console=1` to read `console.log`.

Performance, in a real browser (headless timings are meaningless: virtual time
does not advance `performance.now()` within a task):
```
main.html?stats=1&bench=3          # 3s warmup, 3s average, then freezes
```

## Measuring performance — read this before optimising
- **Physics is not the bottleneck.** 0.6–1.7 ms/tick. Drawing is 15–25 ms.
- Time `draw()` and `simulate()` separately. `GameSparker.tick()` is the two of
  them in sequence; timing it as a unit charges everything to "sim".
- With `interp=0` the game draws only on a tick, so **fps is pinned at 18.9 by
  construction** — it cannot show a rendering difference. Use the ms figures.
- `?raster=0` no-ops the emit calls while leaving projection running, to split
  draw into its two halves.
- Node microbenchmarks are fine for ratios, wrong for absolutes: a different
  JIT, and `drawString`/`drawImage` are already no-ops through the null 2D
  context, so they flatter the batcher.

## The one invariant that must not break
There is **no depth buffer**. Occlusion is submission order and nothing else.
Colour is a vertex attribute, the whole frame is one draw call, and the depth
sort in `GameSparker.draw()` consumes `ContO.dist`. Do not batch by material,
do not sort, do not split primitive types into separate passes. Any of those
still looks plausible in a screenshot, which is what makes it dangerous. See
the banner at the top of `js/graphics.js`.

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
