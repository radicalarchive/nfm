# web/ — CheerpJ browser port (first smoke test)

Goal of this directory is narrow: find out how far the **existing, unmodified**
`Game.jar` gets in a browser. Nothing here patches the game; the desktop path
(`./start.sh`) is untouched.

## Running

```sh
python3 web/serve.py        # serves the repo root on :8000
```

Then open <http://localhost:8000/web/>.

**Do not use `python3 -m http.server`.** It has no HTTP Range support — it
ignores the header and returns 200 with the whole body. CheerpJ reads jars with
range requests, and a full body where it expects a 206 leaves it unable to parse
the archive, which surfaces as the misleading:

```
Error: Could not find or load main class Madness
```

`serve.py` is `SimpleHTTPRequestHandler` plus Range handling (and `no-store`, so
a rebuilt jar is never cached). It serves the **repository root** regardless of
where it's invoked from, because CheerpJ maps `/app/` to the web server root and
the page asks for `/app/Game.jar` and `/app/data/...`.

The log strip along the bottom reports each stage. Add `?quiet=1` to hide it.

## nfm.jar — the browser build (what the page runs by default)

`web/nfm.jar` (generated, gitignored) is `Game.jar` with the two desktop
display patches reverted, because both are expensive under CheerpJ:

| Patch | Desktop | Browser build |
| --- | --- | --- |
| #4 2× offscreen buffer | `createImage(1600,900)` + `rd.scale(2,2)` | `createImage(800,450)`, no scale |
| #7 slider defaults to max | `reqmult = 1.0f` | `reqmult = 0.0f` |

Measured on CheerpJ, menus first: the 2× buffer cost ~95% of the frame budget
(~4fps → near the desktop figure), and the scaled blit cost most of what was
left. With both reverted, `apmult = 1.0f + n3 * reqmult` collapses to `1.0f`,
`paint()` blits 800×450 → 800×450, and it runs at near-native speed.

### Display size is not render scale

These are independent, and conflating them clips the frame:

- **Render scale** is `reqmult`. At 0, `apmult` is pinned to `1.0f` and the
  game always blits 800×450 → 800×450, whatever the window size.
- **Display size** is what `cheerpjCreateDisplay` gets. `Madness.main()` calls
  `frame.setMinimumSize(930, 586)` and `setExtendedState(6)` (MAXIMIZED_BOTH),
  so anything smaller than 930×586 clips the AWT frame — the `STAGE MAKER`
  button disappears off the right and the bottom edge is cut.

The page therefore defaults the display to the **viewport size** (floor
930×586). The game renders 1:1 in the middle, letterboxed in black — the same
as the desktop with the size slider at "Original".

To fill the screen without giving the speed back, use `?fit=1`: a 930×586
display, CSS-transformed to fit. GPU-composited, free per frame.
**Unverified for input** — CheerpJ may not map mouse coordinates through a CSS
transform. If clicks land in the wrong place, that's the cause.

`Game.jar` is untouched and remains the desktop artifact.

## baseline.jar — the 1× A/B build

`web/baseline.jar` (generated, gitignored) is `Game.jar` with **only** patch #4
reverted — the 2× offscreen buffer. Everything else, including the
`runFinalizersOnExit` NOP, is intact.

```
http://localhost:8000/web/?jar=/app/web/baseline.jar
```

Compare against the normal `http://localhost:8000/web/`. The difference is
purely `createImage(1600,900)` + `rd.scale(2,2)` + 1600×900 blit source rects
versus 800×450 throughout, so a frame-rate gap between the two is the 2× patch's
cost under CheerpJ and nothing else.

Do **not** use `Game.jar.bak` as a baseline: CheerpJ implements
`System.runFinalizersOnExit` as a throw, so the unpatched original dies in
`main()` before the applet is ever constructed.

Rebuilding it (from the decompiled-source workflow, not ASM):

```sh
# 1x variant of the patched GameSparker
sed -e 's/this\.offImage = this\.createImage(1600, 900);/this.offImage = this.createImage(800, 450);/' \
    -e 's/(this\.rd = (Graphics2D)this\.offImage\.getGraphics())\.scale(2\.0, 2\.0);/this.rd = (Graphics2D)this.offImage.getGraphics();/' \
    -e 's/, 0, 0, 1600, 900, this);/, 0, 0, 800, 450, this);/' \
    GameSparker.java > GameSparker1x.java
javac -source 8 -target 8 -cp <unpacked-jar> -d out GameSparker1x.java
cp Game.jar web/baseline.jar && (cd out && zip -q ../web/baseline.jar 'GameSparker.class' 'GameSparker$1.class')
```

## Knobs

Query-string parameters, so alternatives can be tried without editing files:

| Param | Default | Meaning |
| --- | --- | --- |
| `path` | `/app/` | Value for `Madness.fpath`, prefixed onto every file access. `?path=` (empty) falls back to CWD-relative. |
| `w`, `h` | `930`, `586` | CheerpJ display size (native frame size). |
| `jar` | `/app/Game.jar` | Jar to run. |
| `quiet` | — | `1` hides the log strip. |

## How the path argument works

`Madness.main()` joins `argv` into the static `fpath`, which prefixes all ~117
file accesses in the codebase. It then validates the prefix:

```java
else if (!new File("" + Madness.fpath + "data/models.zip").exists()) {
    Madness.fpath = "";
}
```

If `/app/` reads don't work under CheerpJ, `fpath` silently resets to `""` and
the game fails to load its assets **without an error message**. That's the first
thing to suspect on a blank screen.

`start.sh` passes `manar`, which is special-cased to force `fpath=""` and write
the `data/manar.ok` marker. That marker already exists in the repo and nothing
else reads it, so the page passes a real path instead.

## Known-broken, expected

Not bugs to chase on the first run — these are known-dead in a browser and are
the follow-up work:

- **Fullscreen.** `Madness.gofullscreen()` uses `GraphicsDevice.setDisplayMode` /
  `setFullScreenWindow`. Needs neutering, then replacing with canvas fullscreen.
- **`checknupdate(36)`**, called at the end of `main()`, loops over
  `http://multiplayer.needformadness.com/update/N.txt`. Cross-origin, and the
  host is long dead. It runs *after* `applet.start()`, so it should only stall
  rather than block the game — but if the page hangs late in boot, this is why.
  It also writes `Game.jar` on success, so it wants removing regardless.
- **Multiplayer.** `Socket` / `DatagramSocket` in `Lobby`, `Login`, `UDPMistro`,
  `udpServe`. No raw TCP/UDP in a browser; the servers are gone anyway.
- **`Runtime.exec`** (5 sites) and **`Desktop.browse`** (4 sites), from
  `advopen` / `openurl`. No process or shell exists.
- **Writes.** `/app/` is read-only HTTP. Saves (`data/user.data`, `mycars/`,
  `mystages/`) need CheerpJ's `/files/` mount, which is IndexedDB-backed, plus a
  first-run copy of the seed files.
- **CarMaker / StageMaker** lean on `FileDialog`, `PopupMenu`, `TextField`,
  `TextArea`, `JOptionPane`. Lowest priority; the race game is the deliverable.

## What to actually watch for

1. **Does the menu draw at all**, and how long until it does.
2. **Frame rate in a race.** The renderer is software 3D via Java2D primitives
   with antialiasing on. The 2× offscreen buffer patch (1600×900) quadruples
   fill cost — if it's slow, reverting that for the browser is the first lever.
3. **Audio.** `javax.sound.sampled` plus the `ibxm` MOD player, mixing in Java.
   Browsers also require a user gesture before audio starts.
