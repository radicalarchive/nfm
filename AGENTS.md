# AGENTS.md — Need for Madness (nfm)

## Project
A 2015 Java game (`Game.jar`) being patched to run on modern Java and modern displays.
Original source is not available; all patches are bytecode edits via ASM.

## Layout
- `Game.jar` — patched jar (what `start.sh` runs)
- `Game.jar.bak` — original, untouched, do not modify
- `Game.jar.prev` — previous patched iteration (rollback one step)
- `start.sh` — launches the game: `java -Xms512M -Xmx512M -jar Game.jar manar`
- `Madness.sh` — original launcher (references the long-removed `openjdk-7-jre`; ignore)
- `data/` — game assets (images.zip, models.zip, sounds.zip, *.gif, full_screen.data)
- `music/`, `mycars/`, `mystages/`, `stages/` — runtime data dirs

## Running the game
```sh
./start.sh
```
The `nfm` screen session often has the game running. Inspect with:
```sh
screen -S nfm -X hardcopy -h /tmp/opencode/nfm_full.txt && tail -100 /tmp/opencode/nfm_full.txt
```

## Java environment
- System Java: OpenJDK 19 (Debian). `java`/`javac` on PATH.
- Original jar targets Java 6 (class major version 50).
- Recompiled classes use `-source 8 -target 8` (major 52) — runs fine on 19.

## Patches applied to `Game.jar`

### `Madness.class`
1. **`runFinalizersOnExit` removal** — `main()` called `System.runFinalizersOnExit(true)`, removed in Java 18. NOP'd the 4-byte `iconst_1; invokestatic` at bytecode offset 6461 (file offset). Patch is literal byte replacement: `04 b8 00 02` → `00 00 00 00`.
2. **`gofullscreen()` bitDepth filter** — Display modes filtered with `getBitDepth() < 16`; modern X11 returns `-1` (BIT_DEPTH_MULTI), rejecting all modes → AIOOBE. Patched `bipush 16` → `bipush -2` (file offset 7171) so all depths pass.

### `GameSparker.class`
All edits via ASM tree API (`org.objectweb.asm.tree`). Patcher source: `/tmp/opencode/Patcher.java`.
3. **`keyDown`/`keyUp` null guard** — `u[0]` is null in the main menu (array allocated empty, filled on race start). Prepended `if (u==null || u.length==0 || u[0]==null) return false;` to both methods.
4. **High-res offscreen buffer** — `init()` changed `createImage(800, 450)` → `createImage(1600, 900)` and inserted `rd.scale(2.0, 2.0)` after `putfield rd`. Vector primitives (polygons/text/lines) now rasterize at 2× crisply; raster menu images upscale (soft, not grainy — expected).
5. **Fullscreen scaled blit** — `paint()` had 4 sites using 4-arg `drawImage(offImage, x, y, obs)` (native size → black box). Replaced each with 10-arg `drawImage(offImage, 0,0,1600,900, dx1,dy1,dx2,dy2, obs)` where dest rect uses `apx`/`apy`/`apmult` to scale-to-fit.
6. **Auto-fill in fullscreen** — `paint()` now sets `reqmult = 1.0f` when `Madness.fullscreen && reqmult == 0.0f`, so fullscreen fills the screen without dragging the slider.
7. **Default slider to max** — constructor `reqmult = 0.0f` → `1.0f` (file offset 20833: `fconst_0` → `fconst_1`). Windowed mode also fills on startup.

## Rebuilding the jar
```sh
# 1. Apply ASM patches to pristine GameSparker.class
java -cp .:/usr/share/java/asm.jar:/usr/share/java/asm-tree.jar \
  Patcher /tmp/opencode/orig/GameSparker.class /tmp/opencode/build/GameSparker.class
# 2. Apply Madness.class literal byte patches (python3 — see Patcher.java history)
# 3. Repack
cd /tmp/opencode/build && zip -rq /tmp/opencode/Game.new.jar . && cp /tmp/opencode/Game.new.jar Game.jar
```
The build dir (`/tmp/opencode/build/`) is a full unzipped jar with signature files already stripped (`META-INF/SERVER2.SF`, `SERVER2.RSA`). Manifest is preserved.

## Verification
After any change:
```sh
timeout 10 java -jar Game.jar manar 2>&1 | head
# Expect: no output, exit 124 (timeout). Exceptions = regression.
```
Then have the user run interactively in the `nfm` screen and report visual issues.

## Useful commands
```sh
javap -p -c -classpath /tmp/opencode/build <Class>            # disassemble
javap -v -classpath /tmp/opencode/build <Class> | grep '#N'  # constant pool lookup
java -jar extracted/usr/share/java/procyon-decompiler.jar -o /tmp/opencode/decompiled /tmp/opencode/build/<Class>.class
```

## Key class roles (do not touch except GameSparker/Madness)
- `xtGraphics` — scene/UI renderer (Java2D primitives, fonts, images)
- `ContO`, `Plane`, `Medium` — 3D cars, polygons, track
- `CheckPoints`, `Trackers`, `Mad`, `Record` — race logic
- `Control` — per-player input state (`u[]` array of these)

## Known limitations
- Menu bitmaps (670×400 JPEGs) are inherently low-res; bilinear smoothing is intentionally NOT applied (user declined). Patch would be one line in `init()`: `rd.setRenderingHint(KEY_INTERPOLATION, VALUE_INTERPOLATION_BILINEAR)`.
- Fullscreen on Linux X11 uses `setFullScreenWindow` which behaves inconsistently across WMs.
- ASM's `COMPUTE_FRAMES` requires a `getCommonSuperClass` override returning `"java/lang/Object"` to avoid runtime classloader lookups.

## CheerpJ (browser port, not started)
The game could run in a browser via CheerpJ (Java→Wasm, AWT/Swing support). Same bytecode patches apply. `Madness` is an `Applet` subclass launched via `main()`.