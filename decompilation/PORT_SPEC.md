# PORT_SPEC.md — Need for Madness → JS + WebGL

Handoff spec for implementing a native browser port in a fresh session.
Everything here was measured against this repo, not assumed. See `AGENTS.md`
for the existing desktop patches and `web/README.md` for the CheerpJ path.

---

## Source of truth

`java-src/` holds the decompiled Java for every class in `Game.jar`, committed
to the repo. **This is the input to the entire port** — start there, not from
the jar.

It is decompiled from the **patched** `Game.jar`, so all seven desktop patches
in `AGENTS.md` are already present as readable source. Verified in this session:
`Madness.java` and `GameSparker.java` both recompile cleanly with
`javac -source 8 -target 8`, so procyon's output is trustworthy for this
codebase.

**45 of 47 files compile clean** with `javac -source 8 -target 8`. Two known
procyon artifacts, and one missing file — all documented in
`java-src/README.md`, along with regeneration steps:

- `Lobby.java:2609` — bad label. On the drop list, ignore.
- `ds/nfm/mod/ModSlayer.java:373` — unreachable statement. **In the keep set**
  (MOD player / audio); needs a one-line fix.
- `Globe.java` — absent. `Globe.class` is pathological for procyon (787MB RSS,
  no output). Multiplayer UI, on the drop list.

---

## Goal

Run the **racing game** at native speed in a browser, with audio. Drop the
editors and all networking.

Prior art in this repo: the CheerpJ port (`web/`) works and is playable, but is
**fill-bound** — fine with one car on screen, bad when many polygons are
visible. WebGL is the fix, and that is the reason for this port.

---

## Measured facts

Jar: 52 classes, 1.27MB bytecode, all class major version 50 (Java 6). No JNI,
no native code, no Java3D/LWJGL.

**JDK surface: 314 distinct methods.**

| Package | Methods | Notes |
| --- | --- | --- |
| `java/awt` | 147 | 42 are drawing (below); ~105 are widgets, mostly in dropped classes |
| `java/lang` | 53 | trivial |
| `java/io` | 41 | needs a virtual FS |
| `java/net` | 19 | **dropped** |
| `javax/sound/sampled` | 17 | needs WebAudio |
| `java/util/zip` | 10 | `images.zip`, `models.zip`, `sounds.zip` |
| `java/awt/event` | 7 | key + mouse |
| `java/applet` | 5 | trivial shim |

**The 42-method drawing surface is the whole renderer contract:**
`Graphics2D.{fillPolygon, drawPolygon, fillRect, drawRect, fillOval,
fillRoundRect, drawRoundRect, fill3DRect, drawLine, drawString, drawImage,
clearRect, setColor, setFont, setComposite, setRenderingHint, getFontMetrics,
scale, dispose}`, `Color.{brighter, darker, getRed, getGreen, getBlue, getRGB,
getHSBColor, RGBtoHSB}`, `FontMetrics.{getHeight, stringWidth}`,
`Image.{getGraphics, getWidth, getHeight}`, `MediaTracker.*`, `Toolkit.*`,
`AlphaComposite.getInstance`.

### Keep (~400KB)

`xtGraphics` (151KB, renderer + UI + some state), `GameSparker` (61KB, applet +
main loop), `ContO` (40KB), `Mad` (34KB), `Medium` (32KB), `Control` (24KB),
`Plane` (18KB), `Record` (15KB), `CheckPoints`, `Trackers`, `Wheels`,
`CarDefine`, `Madness`, plus `ibxm/` and `ds/nfm/` (MOD player) and `UlawUtils`.

### Drop (~640KB)

`Globe` (235KB), `StageMaker` (131KB), `CarMaker` (117KB), `Lobby` (114KB),
`Login` (43KB), `UDPMistro`, `udpServe`, `udpOnline`, `update`. This also
removes most of the AWT widget surface (`TextArea`, `FileDialog`, `PopupMenu`,
`Checkbox`) and all of `java/net`.

---

## Architecture

### 1. Transpile the core line-by-line

Java 6, no generics, no lambdas — mechanically translatable. **Do not
restructure.** The value of this approach is that the 3D math and physics are
carried over verbatim and stay diff-testable.

### 2. Reimplement `Graphics2D`, do not rewrite the renderer

There is **no renderer layer to extract.** Verified: `Plane.java` and
`ContO.java` interleave projection, per-face lighting, fog blending, colour
clamping and rasterization in a single pass — e.g. `Plane.java:973`:

```java
graphics2D.setColor(new Color(red, green, blue));
graphics2D.fillPolygon(array26, array27, this.n);
```

directly after the fog math. So the boundary is the **call site**, not the
class. Transpile `Plane`/`ContO`/`Medium` unchanged and make `fillPolygon`
append a triangle fan to a WebGL vertex buffer instead of rasterizing.

> ### ⚠ The one non-obvious constraint: painter's algorithm
>
> This renderer has **no depth buffer**. Occlusion comes entirely from
> submission order. Batching by material or texture — the obvious WebGL
> optimization — **will silently scramble depth** and draw cars through walls.
>
> **Put colour in a vertex attribute** so every polygon lands in one buffer in
> original submission order and the whole frame is one draw call. This is both
> the correct and the fast answer; do not reorder for any reason.

Text and images (`drawString`, `drawImage`) go to a 2D canvas overlay — do not
attempt them in WebGL.

### 3. Audio: ring buffer + AudioWorklet

`javax.sound.sampled` here is **not** fire-and-forget clips. `SourceDataLine`
(31 refs) is a continuously pitch-shifted PCM stream the game pushes into, and
`ibxm`/`ds/nfm/mod` is a software MOD tracker synthesizing sample-by-sample.

The synthesis math and `UlawUtils` decoding transpile like any other logic. Only
the **seam** needs rewriting: `SourceDataLine.write()` is a blocking push from
the game thread; WebAudio is a pull-based callback. Bridge with a ring buffer
feeding an AudioWorklet. Single-threaded JS means no cross-thread
synchronization is required — fill the buffer from the main loop.

Browsers require a user gesture before audio starts.

### 4. Virtual filesystem

`Madness.fpath` is a single static string prefixing all ~117 file accesses —
one lever for the whole game's IO. Back reads with `fetch`, writes
(`data/user.data`, `mycars/`, `mystages/`) with IndexedDB. `java.util.zip` maps
to `DecompressionStream('deflate-raw')`.

### 5. Main loop

`GameSparker.run()` is a `while(true)` with an adaptive pacer:

```java
long millis = Math.round(a) - (time3 - time2);
if (millis < n4) millis = n4;   // n4 = 15 in-race, 30 in menus
Thread.sleep(millis);
```

`a` self-tunes ±3.5ms per 10 frames toward 10 frames ≈ 400ms, floored at 5.0.
Convert to `requestAnimationFrame`. **Note the `n4` floor caps menus at 33fps**
regardless of render speed — drop it in the port.

---

## Correctness: the differential harness

This is the backbone, and it is what makes automated transpilation safe. Physics
bugs are transpilation bugs, and transpilation bugs **do** have an oracle: the
running Java game.

1. Replace `medium.random()` / `Math.random()` with an identical seeded PRNG in
   **both** the Java original and the JS port.
2. Drive a scripted, fixed-timestep input sequence (no wall-clock timing).
3. Dump per-tick state — car positions, velocities, rotations, collision flags —
   from both.
4. Diff. Divergence localizes the bad method immediately.

Build this **before** transpiling bulk logic, not after.

### Numeric hazards — the actual risk in Java→JS

Not typos. Silent semantic divergence:

- **`int` division truncates** in Java; `/` in JS gives a float. Every integer
  `/` needs `| 0` or `Math.trunc`.
- **`int` wraps at 32 bits.** JS numbers are doubles and don't. Use `| 0` after
  arithmetic that can overflow.
- **Java `float` is 32-bit**, JS has only doubles. Without `Math.fround` the
  port drifts gradually rather than failing loudly — which matters for physics
  integrating over frames.

Int arithmetic outnumbers float roughly 2:1 in the core classes (`ContO` 658 int
/ 402 float, `Medium` 810/260, `xtGraphics` 933/484), so these apply broadly.

---

## Phases

| # | Work | Est. | Gate |
| --- | --- | --- | --- |
| 0 | Persist decompiled sources (above) | 30 min | Blocking |
| 1 | Differential harness + seeded PRNG | 3–4 h | Must pass before phase 3 |
| 2 | WebGL `Graphics2D` + 2D text overlay | 4–6 h | Colour-as-attribute, order preserved |
| 3 | Transpile core classes | 4–8 h | Harness green |
| 4 | VFS + zip | 2–3 h | Menu loads |
| 5 | Audio: ring buffer, worklet, MOD | 4–6 h | No underrun clicks |
| 6 | Integration | open | Human play-testing |

**~2 days focused for the core game including audio.** The residual risk is
small AWT/IO surprises surfacing once it runs, not the translation itself.

TeaVM is the fallback if line-by-line transpilation goes badly: it compiles the
bytecode directly, so the numeric hazards above vanish entirely. It costs a
mini-AWT shim instead, and its green threads preserve the `Thread.sleep` loop.

---

## Using a subagent (`agy -p`)

Delegate **mechanical, specified, verifiable** work — per-method transpilation
against an exact signature, `Graphics2D` method bodies, VFS boilerplate, bulk
deletion of dropped classes — one bounded task per invocation, with the target
signature and expected semantics stated, then verify every result yourself.

Do **not** delegate the threading model, audio timing, the painter's-algorithm
ordering constraint, or anything numeric: those fail silently, and a small model
will return confident, plausible, wrong code that surfaces weeks later as "the
handling feels off."

### Calibrate before batching — mandatory

Never fan out across many classes on an unvalidated prompt template. A
systematic flaw (dropped `| 0`, reordered polygons, misread field semantics)
replicated across 20 files costs far more to find and unpick than it saved.

1. Pick **one representative class** with real numeric content — `Plane.java`
   is ideal: int/float mixing, per-face lighting, and a `fillPolygon` call site.
2. Delegate it alone.
3. Verify against the Java: read the diff **and** run it through the
   differential harness. Do not accept "it looks right."
4. Catalogue every systematic error and fold each one into the prompt template
   as an explicit rule.
5. Repeat on a second class. Only batch once a class comes back clean with no
   template changes.

Re-verify at intervals during the batch too — quality is not guaranteed
stationary across a long run. Restate the painter's-algorithm constraint in
**every** prompt that touches rendering; it is the failure that passes tests and
still draws cars through walls.

---

## Decision record — questions asked and answers reached

- **Is CheerpJ a good fit?** Yes — pure AWT, Java 6, no native code. Shipped and
  playable (`web/`), but fill-bound on polygon-heavy scenes.
- **Keep decompiled source, or re-decompile per change?** Keep it, and promote
  `Madness`/`GameSparker` to real source — both round-trip cleanly. ASM
  byte-poking was right for 3 surgical edits, wrong for the port's volume.
- **Was the CheerpJ slowness a bug or real?** Real, and mostly self-inflicted:
  the 2× offscreen buffer patch was ~95% of the frame cost, the scaled blit most
  of the rest. At 1:1 it is near-native — until polygon count rises.
- **Is a JS/WASM port feasible?** Yes. The drawing surface is only 42 methods;
  the 400KB of game logic is the bulk but transpiles mechanically.
- **Can an LLM do it in hours with self-tests?** Largely yes — with the
  differential harness. That was the correction to an earlier over-estimate:
  physics errors are transpilation errors and have an oracle.
- **Isn't only the renderer replaced, not the physics?** Correct, and it led to
  the right architecture: reimplement `Graphics2D` as a WebGL batcher rather
  than rewriting any renderer.
- **Why is audio hard?** Streaming `SourceDataLine` + a software MOD synth, not
  fire-and-forget clips.
- **Why can't audio be transpiled too?** It can. Only the blocking-push vs
  pull-callback seam needs rewriting — a ring buffer, a few hours, not days.
