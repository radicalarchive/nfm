# JOB — ibxm calibration step 2: `Sample.java` + `Envelope.java`

You are transpiling Java to JavaScript for a browser port of the game "Need for
Madness". Work in `/home/evan/games/nfm`. Execute this brief exactly.

**This is step 2 of the ibxm port. Step 1 (`Data.java`) is done, verified
against the real Java, and committed.** Do these two files and stop.

## What changed since step 1 — read this first

Your `Data.js` was verified sample-for-sample against the real class and was
correct. Two defects were found and fixed afterwards, and **both are the kind
this step will hit again**, so the current `web/ibxm/Data.js` is your reference,
not the version you left:

1. **Typed-array signedness at the boundary.** The constructor took the caller's
   array as-is. Java's `byte[]` is SIGNED, and `sByte()` returns the raw
   element, so the `Uint8Array` that `web/vfs.js`'s zip reader actually produces
   read `130` where Java reads `-126`. The sample decoders survived it by luck
   (`<< 8` into an `Int16Array` is modular), which is what made it dangerous —
   in ibxm that value is a sample's finetune, so the symptom is a detuned note
   and nothing thrown. **Rule: at every boundary where an array enters or
   leaves, make the element type match the Java's declared type — `byte[]` is
   `Int8Array`, `short[]` is `Int16Array`, `int[]` is `Int32Array`. Do not rely
   on a downstream truncation to hide a wrong view type, and write a test that
   passes the array type the real caller will pass.**

2. **Do not port a fallback that the Java never takes.** `strCp850` caught
   `UnsupportedEncodingException` and returned Latin-1. Node has no `Cp850`
   decoder, so the JS took that branch every time — but a real JVM always has
   Cp850, so in Java the branch is dead code. Taking it was a divergence, not a
   port. It now carries the 128-entry table the JVM itself printed. **Rule: if
   a Java catch/fallback path is unreachable on a normal JVM, the JS must
   reproduce the path Java ACTUALLY takes, not the fallback.**

3. **Probes must print strings and arrays as NUMBERS, never as text.** The first
   `DataProbe` printed Cp850 text; the literals came back into the test as UTF-8
   for a different character and produced a fake mismatch that had to be
   debugged. `web/tools/DataProbe.java` now has a `codes()` helper — do the
   same.

## Step 1 — read the contract

Read `web/TRANSPILE_SPEC.md` IN FULL, then `decompilation/MUSIC_PORT_SPEC.md`.
The rules that cause SILENT failure here:

- **§0** transpile LINE BY LINE. Keep procyon's local names (`n`, `n2`, `idx`,
  `sam`...). Do not restructure, rename, modernise, or "fix" apparent bugs.
- **§1** `idiv` / `trunc` / `fr` / `Math.imul`. Java `float` is not JS `number`
  — `fr()` at EACH binary operation. **`double` is NOT `float`**: this file
  mixes them (`calculateSincTable` is all `double` math, the mixer is int), and
  a `double` expression must NOT get `fr()`. Check each declaration.
- **§2** procyon decompiles compound assignment WRONG. Grep for `+= (int)(` and
  `-= (int)(`, list every hit, handle each per §2, report them all.
- **§2b** EVERY int operation wraps at 32 bits — the ADDITION as well as the
  multiply. Wrap whole expressions in `i32()`. Use `Math.imul` ONLY when BOTH
  operands are declared `int`; on a float operand it silently zeroes.
  **This file is fixed-point: `FP_SHIFT`/`FP_ONE`/`FP_MASK` arithmetic is where
  a dropped wrap turns into a click or a detuned note rather than an error.**
- **§2c** NEVER weaken a test to make it pass. If the probe disagrees, YOUR CODE
  IS WRONG — disassemble and fix the code. If you truly cannot reconcile it,
  leave it FAILING, mark it `test.todo`, and say so loudly.
- **§3** preserve the game's own bugs verbatim.

## Step 2 — reference implementations

- `web/ibxm/Data.js` — step 1, as corrected. Match this style.
- `web/ibxm/Data.test.js` — the differential test shape, including asserting
  through the repo's own `vfs.js` zip reader rather than shelling out.
- `web/tools/DataProbe.java` — the probe shape, including `codes()`.
- `web/java.js` — the helper library you MUST use. Do NOT edit it.

## Step 3 — the deliverables

Exactly these, and nothing else:

1. `web/ibxm/Sample.js` — from `decompilation/java-src/ibxm/Sample.java`
2. `web/ibxm/Envelope.js` — from `decompilation/java-src/ibxm/Envelope.java`
3. `web/tools/SampleProbe.java` — reflection probe driving the **real**
   `ibxm.Sample` and `ibxm.Envelope` out of `java/Game.jar`. `package tools;`,
   run as `tools.SampleProbe`.
4. `web/ibxm/Sample.test.js` and `web/ibxm/Envelope.test.js` — differential
   tests, EXACT INTEGERS, expected values from the probe.

**DO NOT** start `IBXM.java`, `Module.java`, `Channel.java`, `Instrument.java`,
`Note.java`, `Pattern.java` or `GlobalVol.java`. **DO NOT** modify any other
file — not `Data.js`, not `TASKS.md`, not `WORK.md`, not any existing test.

## Step 4 — what to probe, specifically

`Sample.java` is the interpolating mixer and the hard part of this step:

- `SINC_TABLES` / `calculateSincTables` / `calculateSincTable` are computed at
  class-init in `double` and stored as `short[]`. **Verify the tables
  element-for-element against the Java before anything else** — every mixed
  sample depends on them, and a table off by one LSB sounds fine and is wrong.
- `resample`/`mix`-style methods: drive them with real sample data from a
  module and compare the OUTPUT BUFFER as exact integers, not just a few
  scalars. Include a loop point, a non-zero `fineTune`/`relNote`, and a step
  rate that is not a whole number, so the fixed-point fraction actually
  exercises.
- Include NEGATIVE sample values and magnitudes that overflow int32.
- `Envelope.java` is small: probe `calculateTick`/interpolation at points BEFORE
  the first node, BETWEEN nodes, exactly ON a node, AFTER the last node, and
  with sustain/loop set.

The module bytes: each track is a zip under `music/` — `music/stage1.zip`
contains `stage1.mod`. Feed the SAME bytes to both sides.

The unpacked jar is at
`/tmp/claude-1000/-home-evan-games-nfm/b996c443-7979-4ad9-bdaf-6b6b9854b370/scratchpad/jar`
(if missing: `mkdir -p <dir> && cd <dir> && unzip -oq /home/evan/games/nfm/java/Game.jar`).

```sh
javac -cp <JAR_DIR> -d /tmp/probe SampleProbe.java
java -cp /tmp/probe:<JAR_DIR> tools.SampleProbe
javap -p -c -cp <JAR_DIR> ibxm.Sample      # when a value disagrees
```

Then: `cd /home/evan/games/nfm/web && node --test`.
**112 tests pass today. All 112 must still pass**, plus yours.

## Step 5 — report

- files created; the exact probe command and its output;
- test pass/fail counts;
- EVERY compound-assignment site and how you handled each;
- every place you had to decide `float` vs `double`, and why;
- every array whose element type you had to pin, and what the real caller passes;
- every divergence, workaround, stub, or thing you could NOT verify;
- every systematic error you corrected in your own first attempt.

Do not report "gaps: none" — a previous job did that while having silently
stubbed a method to return its own failure code. A gap you flag is cheap.
