# JOB — ibxm calibration step 1: `Data.java`

You are transpiling Java to JavaScript for a browser port of the game "Need for
Madness". Work in `/home/evan/games/nfm`. Execute this brief exactly; it is the
whole job. **This is calibration step 1 of the ibxm music port, and step 1
only.**

## Step 1 — read the contract

Read `web/TRANSPILE_SPEC.md` IN FULL. It is the contract, not a suggestion.
Then read `decompilation/MUSIC_PORT_SPEC.md` IN FULL, and the sections
"Using a subagent" and "Calibrate before batching" in
`decompilation/PORT_SPEC.md`. Also read `WORK.md` — the entries about delegated
jobs and about probes will save you a wasted run.

The rules that most often cause SILENT failure here:

- **§0** transpile LINE BY LINE. Keep procyon's local variable names (`n`,
  `n2`, `b`, `array`...). Do not restructure, rename, modernise, simplify, or
  "fix" apparent bugs.
- **§1** numeric semantics: `idiv` / `trunc` / `fr` / `Math.imul`. Java `float`
  is not JS `number` — apply `fr()` at EACH binary operation, not once at the
  end. **Java `byte` is SIGNED**, and sign extension is what decides whether
  audio data plays or screams.
- **§2** procyon decompiles compound assignment WRONG. Read the worked example.
  Before writing any code, grep the Java for `+= (int)(` and `-= (int)(`, list
  every hit, and handle each per §2.
- **§2b** EVERY int operation wraps at 32 bits — the ADDITION as well as the
  multiply. `Math.imul` on the terms is not sufficient; wrap the whole
  expression in `i32()`. Use `Math.imul` ONLY when BOTH operands are declared
  `int` in the Java: check the field's declared type. `Math.imul` on a float
  operand silently zeroes it, and that exact bug meant no car in the game ever
  collided.
- **§2c** NEVER weaken a test to make it pass. Do not change inputs, loosen
  assertions, move expected values into comments, or delete cases. If the probe
  disagrees with your code, YOUR CODE IS WRONG — disassemble and fix the code.
  If you genuinely cannot reconcile it, leave the test FAILING, mark it
  `test.todo`, and say so loudly in your report.
- **§3** preserve the game's own bugs verbatim, including `(int)` casts of
  float literals.

## Step 2 — match the existing style

Read these already-verified files and match them exactly in shape and comment
density:

- `web/java.js` — the helper library you MUST use. Do NOT edit it.
- `web/Plane.js` and `web/Plane.test.js` — reference transpilation and test
- `web/Trackers.js` — small reference
- `web/CheckPoints.js` — another small reference
- `web/tools/` — reference reflection probes

## Step 3 — the deliverables

Exactly these three files, and nothing else:

1. `web/ibxm/Data.js` — line-by-line from
   `decompilation/java-src/ibxm/Data.java`
2. `web/tools/DataProbe.java` — a reflection probe driving the **real** ibxm
   `Data` class out of `java/Game.jar`. Declare `package tools;` and run it as
   `tools.DataProbe`. Fields are package-private: use
   `getDeclaredField`/`getDeclaredMethod` + `setAccessible(true)`.
3. `web/ibxm/Data.test.js` — a `node:test` differential test comparing the JS
   against the probe's output as EXACT INTEGERS, with the literal numbers the
   probe printed as the expected values and a comment saying they came from the
   probe.

**DO NOT** start `Sample.java`, `Envelope.java`, `IBXM.java`, `Module.java`,
`Channel.java`, `Instrument.java`, `Note.java`, `Pattern.java` or
`GlobalVol.java`. Stopping after `Data.java` is the entire point of a
calibration step: a systematic error replicated across eleven files costs far
more to unpick than it saved.

**DO NOT** modify any other file — not `TASKS.md`, not `WORK.md`, not
`AGENTS.md`, not any existing source or test.

## Step 4 — the module data

**There is no `ds.nfm.mod`.** Each track is its own zip under `music/`:
`music/stage1.zip` contains `stage1.mod`, `music/interface.zip` contains
`interface.mod`, and so on through `stage32.zip`. Unzip one to get real bytes
to feed the probe, and feed the SAME bytes to both sides.

`Data.java` is nearly all sign-extension traps, which is exactly why it was
chosen to calibrate on: it reads UNSIGNED bytes and little-endian shorts out of
a signed-byte array. Your probe MUST exercise bytes with the high bit SET
(0x80..0xFF) and values large enough to overflow int32, and include negative
values. Small all-positive inputs agree happily while the code is wrong.

## Step 5 — verify against the real Java

The unpacked jar is at
`/tmp/claude-1000/-home-evan-games-nfm/b996c443-7979-4ad9-bdaf-6b6b9854b370/scratchpad/jar`
(if missing: `mkdir -p <dir> && cd <dir> && unzip -oq /home/evan/games/nfm/java/Game.jar`).

```sh
javac -cp <JAR_DIR> -d /tmp/probe DataProbe.java
java -cp /tmp/probe:<JAR_DIR> tools.DataProbe
```

Run the probe more than once before believing a mismatch.

If a value disagrees, do NOT adjust the test to match your code. Disassemble
and find out what Java actually does:

```sh
javap -p -c -cp <JAR_DIR> ibxm.Data
```

`f2i` / `i2f` / `idiv` / `fdiv` in the bytecode show exactly where truncations
and float conversions happen.

Then run the suite:

```sh
cd /home/evan/games/nfm/web && node --test
```

**105 tests pass today. All 105 must still pass**, plus yours.

## Step 6 — report

State, concretely:

- the files you created;
- the exact probe command and its output;
- test pass/fail counts;
- EVERY compound-assignment site and how you handled each;
- every preserved bug;
- every divergence, workaround, stub, or thing you could NOT verify — an
  explicit list;
- **every systematic error you had to correct in your own first attempt.**
  This is calibration data: the next job's prompt is written from it.

Do not report "gaps: none". A previous delegated job reported exactly that
while having silently stubbed a method to return its own failure code, and
another edited tests green — twice. A gap you flag is cheap; a gap you paper
over costs days.
