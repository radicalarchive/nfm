# CAREDITOR_PORT_SPEC.md — porting `CarMaker` to the JS/WebGL build

A bounded job spec for `agy -p`, in the shape `decompilation/agy_tmp` and
`MUSIC_PORT_SPEC.md` already use. Read `PORT_SPEC.md` §"Using a subagent" and
§"Calibrate before batching" first — they are binding, and the calibration
procedure is not optional. `web/TRANSPILE_SPEC.md` is the contract for every
line of code produced here.

## What this is

`PORT_SPEC.md` put the editors on the drop list. That decision is now reversed
for the **car** editor: the goal is to edit a car in the browser, store it in
the browser, and race it in the ported game without a desktop Java install
anywhere in the loop. The stage editor (`StageMaker`) stays dropped.

```
decompilation/java-src/CarMaker.java   5,839 lines, one class, 151 fields
```

Target: `web/careditor/*.js` (the transpiled chunks) + `web/careditor.html`
(the shell) + a browser storage backend shared with the game.

## Measured facts

Counted in this repo, not assumed.

- **One class, 151 fields, two enormous methods.** `run()` is lines 355–2920
  (2,566 lines) and `ctachm()` is 2921–4351 (1,430 lines). Together they are
  68% of the file. Everything else is ≤330-line helpers.
- **`run()` is not a state machine over `fase`** — unlike `xtGraphics`. It is
  `while (!exwist)` wrapping four flat `if (this.tab == N)` blocks, N = 0..3,
  then `drawms(); ctachm(); repaint();`. The tab blocks do not fall through and
  do not share locals with each other; only `int n`, declared at line 398, and
  the loop's own condition cross the boundary. That is what makes line-range
  chunking safe here.
- **The tabs are:** 0 = car file management (select / new / rename / import
  Wavefront OBJ / export), 1 = the code editor pane (font, theme, find and
  replace, polygon count, mirror/show selection), 2 = the 3D editor proper
  (1,600 lines: colours as HSB + RGB, scale, align, wheels, stats, crash-look
  test), 3 = stats/settings.
- **`ContO`, `Medium`, `Trackers`, `Wheels`, `CarDefine` are already ported and
  verified** under `web/`. The editor's 3D view is those classes; it is not a
  second renderer. Nothing in this job re-implements them.
- **`CarDefine.loadcar()` already establishes the IO seam** (`web/CarDefine.js:713`):
  the function takes the file text as a parameter rather than reading disk. The
  editor's `loadfile`/`savefile` follow that seam exactly.
- **The `.rad` format is line-oriented ASCII** — `1stColor(78,94,238)`,
  `ScaleX(145)`, `<p> c(r,g,b) p(x,y,z)... </p>`. 292–1,276 lines per car in
  `mycars/`. The parser is `getvalue` / `getSvalue` / `objvalue`; the whole
  editor rests on those three functions round-tripping byte-for-byte.
- **AWT widget surface is real but small**: `TextArea` (the code editor),
  `TextField` ×19, `PopupMenu`, `FileDialog`, `JOptionPane`. These are the only
  parts with no existing analogue in the port.
- **`java/net` and `java.awt.datatransfer` appear** (server stat validation,
  clipboard). Both are **dropped**: no upload, no server stat check, no
  `servervalue`/`serverSvalue` round trip. Stats are whatever the local file
  says. Every drop site gets a `// TODO not ported:` comment, matching how
  `xtGraphics.stat()` handled its 11 multiplayer branches.

## Why this is a viable delegation candidate

- The numeric core it manipulates (`ContO`, `Medium`) is **already ported and
  differentially tested**, so a chunk that breaks the geometry breaks an
  existing test rather than drifting silently.
- The parser has an **exact oracle**: four real `.rad` files in `mycars/`, and
  the real Java class to parse them by reflection. Values must match as exact
  integers and strings, not "close".
- The chunk boundaries are mechanical line ranges with a verified single
  crossing local, so chunks compose without redesign.

## Why it is still not trivial

- **§2 compound assignment.** `regx` opens with `this.hitmag += (int)a;` where
  `a` is a `float` parameter — the exact trap procyon gets wrong. Chunk `shape`
  exists to find out whether a delegated model handles it, before any other
  chunk runs.
- **151 fields in one object.** Chunks must agree on field names and types or
  they will not stitch. Every job is required to report the fields it touched
  with their declared Java types; that list is the stitching contract.
- **The widgets carry state the drawing reads back** (`TextArea.getText()`,
  `TextField.getText()`, `Smenu.select()`). A chunk that fakes a widget rather
  than reading the shared state object will look right alone and be wrong in
  place.

## Chunks

Run with `decompilation/agy_careditor <chunk>`. Order matters: `shape` is the
calibration chunk and nothing else may start until it comes back clean and the
prompt template has absorbed every systematic error it revealed.

| chunk | CarMaker.java lines | output | what it is |
|---|---|---|---|
| `shape` | 4682–4997 | `shape.js` | **calibration.** regx, regz, roofsqsh, crash, setheme, py, rot, xs, ys — the deformation math |
| `files` | 4352–4681, 5473–5633 | `files.js` | setupo, loadfile, savefile, new/del/rencar, settings, checko, and the `.rad` parser |
| `ui` | 5158–5232, 5645–5795 | `ui.js` | hidefields, movefield, drawms, stringbutton, ovbutton — the widget layer |
| `input` | 5251–5398, 5796–5839 | `input.js` | paint/update, mouse and key handlers, actionPerformed |
| `tab0` | 430–691 | `tab0.js` | car file management pane |
| `tab1` | 692–877 | `tab1.js` | code editor pane |
| `tab2` | 878–2477 | `tab2.js` | the 3D editor — colours, scale, align, wheels, stats, crash test |
| `tab3` | 2478–2858 | `tab3.js` | stats / settings pane |
| `ctachm` | 2921–4351 | `ctachm.js` | the editor's own draw + hit-testing pass |
| `boot` | 355–429, 2859–2920, 4998–5157, 5399–5472, 5634–5644 | `boot.js` | run() head and tail, init, loadsounds, loadbase, getImage |

`tab2` is 1,600 lines and will need splitting again once `shape` has told us
how much a single job reliably handles. Do not split it on a guess.

## The verification oracle — insist on this

1. A Java reflection probe under `web/tools/` drives the **real** `CarMaker`
   out of `java/Game.jar`, headless, with fields poked in directly
   (`setAccessible(true)`; the constructor touches AWT, so allocate the
   instance rather than calling it).
2. The same inputs go through the JS port.
3. Diff as **exact integers and exact strings**. For `files`, parse all four
   `mycars/*.rad` through both sides and diff every extracted value.

"It looks right in the editor" is not verification. `WORK.md` records delegated
jobs editing tests to make them pass **twice**, and one silently stubbing
`CarDefine.loadcar` to return its own failure code while reporting no gaps.
Diff every returned file against the Java before believing any report.

## Storage — the part that is NOT delegated

`vfs.js` today is read-only (`web/vfs.js:8`). Custom cars need writes, and this
is the piece that makes the editor worth having: a car saved in the editor must
appear in the launcher's car picker and be raceable.

- Backend: **IndexedDB**, one store of `name -> .rad text`, wrapped behind the
  same `Madness.fpath`-style seam the rest of the port uses so `mycars/` reads
  hit the browser store first and the shipped files second.
- The four files in `mycars/` stay shipped and read-only; a saved car with the
  same name shadows them.
- Import/export as `.rad` text so cars move between the browser and the desktop
  game unchanged.

This touches the live game's load path and the launcher, so it is written and
tested here, not delegated.
