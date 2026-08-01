# TRANSPILE_SPEC.md — rules for transpiling java-src/*.java to js/*.js

Read this in full before writing a line. Every rule here was derived by running
the real Java and diffing, not by reasoning about it. Two of them (§2, §3) are
bugs that were actually caught this way after "looking right".

Reference implementations already verified against Java: `js/Plane.js`,
`js/Medium.js`, `js/Trackers.js`. Match their style exactly.

---

## 0. The prime directive

**Transpile line by line. Do not restructure, rename, simplify, or "fix".**

Keep procyon's local names (`array`, `array2`, `n36`, `abs3`) even though they
are ugly. The entire value of this approach is that the JS file diffs against
the Java file side by side. A reviewer must be able to put them in two panes
and scan.

Do not:
- rename locals to meaningful names
- collapse repeated blocks into helpers (one exception, §9)
- reorder statements, even when order looks irrelevant
- fix apparent bugs (§3)
- add features, logging, or error handling

---

## 1. Numeric semantics — the core rules

Import from `./java.js`:
`idiv, i32, trunc, fr, jround, intArray, floatArray, objArray, random, JavaRandom, RGBtoHSB, HSBtoRGB`

| Java | JS | Why |
| --- | --- | --- |
| `int / int` | `idiv(a, b)` | Java truncates toward zero; JS `/` yields a float |
| `(int) someFloat` | `trunc(x)` | truncates toward zero, saturates at int32 bounds (does NOT wrap) |
| `int * int` that can exceed 2^31 | `Math.imul(a, b)` | exact int32 wrapping multiply |
| `int + int` / `int - int` that can exceed 2^31 | `i32(a + b)` | **`Math.imul` alone is not enough — see §2b** |
| any `float`-typed intermediate | `fr(x)` | Java `float` is 32-bit; JS has only doubles |
| `int[]` field | `intArray(n)` | Int32Array: wrapping + truncation on every store, free |
| `float[]` field | `floatArray(n)` | Float32Array: float32 rounding on every store, free |
| `Object[]` / nested | `objArray(n)` | null-filled |
| `Math.round(f)` | `jround(x)` | `floor(x + 0.5)` |
| `Math.random()` | `random()` | seeded; deterministic runs |
| `new java.util.Random(seed)` | `new JavaRandom(seed)` | exact JDK LCG, verified |
| `Color.RGBtoHSB` | `RGBtoHSB(r,g,b,out)` | writes into a Float32Array(3) |
| `Color.getHSBColor` | `HSBtoRGB(h,s,b)` | returns packed `0xRRGGBB` |

### Where `fr()` actually matters

`Medium.sin(i)` and `Medium.cos(i)` return **`float`** (they index a
`float[360]` table). So *any* expression mixing them is float32 arithmetic in
Java, rounded at **every** binary operation. This is the single most common
source of silent drift.

```java
array[i] = n + (int)((n5 - n) * this.m.cos(n3) - (n6 - n2) * this.m.sin(n3));
```
becomes
```js
array[i] = n + trunc(fr(fr((n5 - n) * cos) - fr((n6 - n2) * sin)));
//                   ^^ the subtraction is ALSO rounded
```

Round each binary op, innermost first. Getting this wrong does not fail a
smoke test — it drifts slowly over frames, which is far worse.

---

## 2. ⚠ Compound assignment — procyon decompiles this WRONG

**This is the rule that will bite you. It bit the reference implementation.**

Procyon emits:

```java
this.clds[i] += (int)(this.clds[i] * (this.snap[i] / 100.0f));
```

The actual bytecode is `i2f, i2f, i2f, fdiv, fmul, fadd, f2i, iastore` — the
**left-hand side is converted to float, added, and truncated ONCE at the end.**
Java's compound-assignment rule inserts an implicit narrowing cast, so the real
source was `x += <float expr>` and procyon rendered the implicit cast as an
explicit one *in the wrong place*.

So this:
```js
this.clds[i] += trunc(fr(this.clds[i] * fr(this.snap[i] / 100.0)));   // WRONG
```
must be:
```js
this.clds[i] = trunc(fr(this.clds[i] + fr(this.clds[i] * fr(this.snap[i] / 100.0))));
```

Worked example: base 219, snap −5.
- wrong: `219 + trunc(-10.95)` = `219 - 10` = **209**
- right: `trunc(219 - 10.95)` = `trunc(208.05)` = **208**  ← what Java prints

### ⚠ The rule — and it is NOT unconditional. CHECK THE BYTECODE, PER SITE.

`lvalue += (int)(expr)` from procyon is **ambiguous**. It compiles from two
different sources, and only one of them is an artifact. You cannot tell which
from the decompiled text — you must disassemble.

**Case A — implicit narrowing (procyon artifact). Must be rewritten.**
Source was `x += <float expr>`; javac inserted the narrowing cast.
Bytecode signature: the LHS is loaded and **converted to float/double before
the add**, with a single truncation at the very end.

```
getfield x ; i2f ; <expr> ; fadd ; f2i ; putfield x
         ^^^^^^^                   ^^^ one truncation, after the add
```
```js
x = trunc(fr(x + expr));     // correct for Case A
```

**Case B — explicit cast in the original source. Already correct, leave it.**
Bytecode signature: the expression is truncated **on its own**, then an
integer add.

```
getfield x ; <expr> ; d2i ; iadd ; putfield x
                      ^^^^^^^^^^ truncate first, THEN integer add
```
```js
x += trunc(expr);            // correct for Case B — do NOT "fix" this
```

**The discriminator is whether `i2f`/`i2d` appears on the LHS load.**
Case A converts the left side; Case B does not.

Worked example of Case A — `Medium.setsky`, base 219, snap −5:
- wrong: `219 + trunc(-10.95)` = `219 - 10` = **209**
- right: `trunc(219 - 10.95)` = `trunc(208.05)` = **208**  ← what Java prints

Worked example of Case B — `Mad.java:1494`, `contO.zy += (int)(...)`:
bytecode is `getfield ContO.zy ; ... ; d2i ; iadd ; putfield`, so
`contO.zy += trunc(expr)` is right and rewriting it would introduce a bug.

There are ~45 such sites in the keep set, 23 in `Mad.java` alone. **Grep for
`+= (int)(` and `-= (int)(`, then disassemble each one and classify it A or B.**
Report the classification per site. Guessing is not acceptable in either
direction.

If the operand is genuinely integer-valued (no float or double anywhere in it),
a plain `+=` is correct and no disassembly is needed.

---

## 2b. ⚠ EVERY int operation wraps, not just the multiplies

`Math.imul` fixes the multiply and then people stop. The **addition wraps too**.

```java
return (n - n2) * (n - n2) + (n3 - n4) * (n3 - n4);   // imul, imul, iadd
```

```js
return Math.imul(n - n2, n - n2) + Math.imul(n3 - n4, n3 - n4);        // WRONG
return i32(Math.imul(n - n2, n - n2) + Math.imul(n3 - n4, n3 - n4));   // right
```

For `py(50000, 0, 50000, 0)`: Java gives **705032704**, the unwrapped JS gives
**-3589934592**.

This is not a theoretical edge case. Stage coordinates run to ±83000
(`grep 'set(' stages/*.txt`), so far pairs overflow routinely, and in
`Trackers.devidetrackers()` the wrapped value can land back inside the
`py < 20250000 && py > 0` guard — which puts a distant tracker into a sector
and changes collision behaviour. The original game does exactly this.

**Read the bytecode.** `iadd` / `isub` / `imul` all wrap. Wrap the whole
integer expression once at the outermost level, not each term.

---

## 2d. ⚠ Some Java state is NOT reproducible — recognise it before chasing it

`Medium.random()` bottoms out in `java.lang.Math.random()`, which is
**unseeded**. Any field the Java perturbs through it is non-deterministic *on
the Java side*, so a probe cannot produce a stable expected value for it.

Measured: three consecutive runs of the identical `MadProbe` gave
`contO.zy` = 0, −1, −1 at tick 50 and `contO.xy` = −7, −6, −7 at tick 300,
while `x`, `y`, `z`, `xz`, `speed`, `pzy`, `pxy` were byte-identical every run.

So before concluding "my port has a drift bug", **run the Java probe three
times.** If the field moves between Java runs, the port is not the problem and
no amount of `fr()` hunting will fix it.

Handle it by asserting the deterministic fields and documenting — prominently,
in the test — which fields are excluded and why. That is NOT a §2c violation:
§2c forbids weakening an assertion that *could* hold. This is declining to
assert something that provably cannot.

The real fix is PORT_SPEC's phase 1: replace `Math.random()` with an identical
seeded PRNG on **both** sides, which means patching and recompiling
`Medium.class` so the Java probe becomes deterministic too. Until that exists,
say so rather than faking it.

---

## 2c. ⚠ NEVER weaken a test to make it pass

This happened on the first delegated class and must not happen again.

The agent wrote an overflow test from real probe values, saw it fail, and
**deleted the failing inputs, substituted inputs that passed, and moved the
Java values into a comment** — with a rationalisation that the failing range
"never occurs in the game". The range did occur, and the code was wrong.

When your test disagrees with the probe:

1. The probe is right. Your code is wrong. Start from that assumption.
2. Disassemble the method (`javap -p -c`) and find the exact opcode sequence.
3. Fix the **code**.

You may **never**:
- change the test's inputs to avoid a failure
- loosen `strictEqual` to a tolerance
- move an expected value into a comment
- delete a case
- argue that the failing range is unrealistic

If after disassembling you genuinely cannot reconcile it, **leave the test
failing**, mark it `test.todo`, and say so loudly in your report. A red test
is information. A green test that was edited until it went green is a lie, and
it is worse than no test at all.

### Do not copy a bug from the reference files

The same job justified its wrong `py()` by pointing out that `Trackers.js`
did the same thing. It was right that `Trackers.js` was wrong — and that was
worth reporting, which it did. But it then **matched the bug instead of the
Java**. The Java is the only oracle. If a reference file disagrees with the
bytecode, the reference file is wrong: implement it correctly and say so in
your report.

---

## 3. ⚠ Preserve the game's bugs verbatim

`(int)` casts of float literals appear in the original and are **not** typos to
fix. They evaluate to the truncated integer:

```java
r6 *= (int)1.6;      // (int)1.6 == 1  -> multiply by ONE, a no-op
r3 *= (int)0.991;    // (int)0.991 == 0 -> ZEROES the colour
```

Transpile these as `Math.imul(r6, 1)` and `Math.imul(r3, 0)` with a comment
saying it is the game's behaviour and not a slip. Do **not** write `1.6`.
Somebody will "fix" it otherwise, and the output will stop matching.

Likewise do not fix off-by-ones, unreachable branches, or dead stores.

---

## 4. Graphics calls

The `Graphics2D` shim (`js/graphics.js`) takes unpacked components:

| Java | JS |
| --- | --- |
| `g.setColor(new Color(r, g, b))` | `g.setColor(r, g, b)` |
| `g.setColor(Color.getHSBColor(h,s,b))` | unpack `HSBtoRGB` into three components |
| `g.fillPolygon(xs, ys, n)` | same signature |
| `g.drawPolygon(xs, ys, n)` | same signature |
| `g.fillRect / drawRect / drawLine` | same |
| `g.setComposite(AlphaComposite.getInstance(rule, a))` | `g.setComposite(a)` |
| `g.setRenderingHint(...)` | `g.setRenderingHint()` — no-op |

### ⚠ PAINTER'S ALGORITHM — never violate this

There is **no depth buffer**. Occlusion comes entirely from the order in which
`fillPolygon` / `drawPolygon` are called. `GameSparker`'s race tick explicitly
depth-sorts objects, and `Plane.d()` sorts faces within an object.

Therefore:
- never reorder drawing calls
- never hoist a draw out of a branch
- never batch or group draws by colour, type, or anything else
- never merge two loops that each draw

This is the failure that passes every test and still draws cars through walls.

---

## 5. Class shape

```js
import { idiv, trunc, fr, intArray, floatArray, objArray } from './java.js';

export class Foo {
  constructor(...) {
    // field initialisers in the SAME ORDER procyon lists them
  }
  someMethod(a, b) { ... }
}
```

- `final` → drop
- `this.` stays
- Java `boolean[]` → `new Array(n).fill(false)`
- nested `int[a][b]` → array of `Int32Array` (see the `int2/int3/int4` helpers
  at the top of `Medium.js`; copy them if you need them)
- inner/anonymous classes: hoist to a module-level function, comment why
- Java `long` arithmetic: plain numbers, but use `Math.trunc(a/b)` for division
  (see `ldiv` in `Medium.js`). Values in this codebase stay well inside 2^53.
- `String.charAt(i)` → `s[i]`; `s.startsWith` / `.trim` / `.indexOf` are the same
- `Integer.valueOf(s)` / `Integer.parseInt(s)` → `parseInt(s, 10)`
- `Float.valueOf(s)` → `parseFloat(s)`

---

## 6. Verification — MANDATORY, and it is not optional or approximate

You must diff your output against the **real Java class**, not against your
reading of it. The jar is unpacked and the technique is proven.

```sh
# 1. unpack (already done at $JAR_DIR, else:)
mkdir -p /tmp/jar && cd /tmp/jar && unzip -oq /home/evan/games/nfm/Game.jar

# 2. write a probe that drives the real class through reflection
#    (fields are package-private, so setAccessible(true) is required)
javac -cp /tmp/jar -d /tmp/probe Probe.java
java -cp /tmp/probe:/tmp/jar Probe
```

A probe looks like this (see the pattern that caught the §2 bug):

```java
Object m = Class.forName("Medium").getDeclaredConstructor().newInstance();
Field f = m.getClass().getDeclaredField("clds"); f.setAccessible(true);
Method x = m.getClass().getDeclaredMethod("setsky", int.class, int.class, int.class);
x.setAccessible(true);
x.invoke(m, 207, 232, 255);
System.out.println(java.util.Arrays.toString((int[]) f.get(m)));
```

Then drive your JS the same way and compare **exact integers**, not "close".

Write the comparison up as a `node:test` file, `js/<Class>.test.js`, with the
Java-produced values as literals and a comment saying they came from the probe.
Follow `js/Plane.test.js` and `js/java.test.js` for style.

**Pick inputs that exercise negatives, and magnitudes large enough to overflow
int32**, because that is where truncation-vs-floor, §2 and §2b show up.
Small all-positive inputs will happily agree while the code is wrong.

### Coverage: probe the method that does the work

The first delegated class probed only the small leaf helpers and skipped the
class's main method, because it needed stub objects to call. That is the method
most worth verifying, and "it was awkward to set up" is not a reason to skip it.

Build the stubs. Plain object literals with the fields the method touches are
enough — you do not need real collaborator classes, and JS does not care.
Construct the equivalent stubs on the Java side with reflection.

If a method genuinely cannot be driven, say so **explicitly and prominently**
in your report, name the method, and explain what blocked you. Do not let it
pass silently behind a green suite of leaf-helper tests.

If a value disagrees, do **not** adjust the test to match your code.
Disassemble the method and find out what Java actually does:

```sh
javap -p -c -cp /tmp/jar Medium | sed -n '/void setsky/,/void setcloads/p'
```

`f2i` / `i2f` / `idiv` / `fdiv` in the bytecode tell you exactly where the
truncations and float conversions are.

---

## 7. What to hand back

- the `js/<Class>.js` file
- the `js/<Class>.test.js` file, passing
- the probe source, saved under `js/tools/`
- a short note listing: every `+= (int)(` site you found and how you handled it;
  every preserved bug; anything in the Java you could not explain

State plainly if you could not verify something. A gap you flag is cheap; a
gap you paper over costs days.

---

## 8. Do not touch

- `js/java.js`, `js/graphics.js`, `js/vfs.js` — verified, shared. If you think
  one needs a change, say so in your report instead of editing it.
- any file outside `js/`
- `data/`, `Game.jar` — read-only

---

## 9. The one allowed exception to §0

If the Java contains two blocks that are **provably character-identical apart
from a couple of index constants**, you may fold them into one private method,
**provided** the call sites preserve the original order and you comment what
was folded and why. See `Medium.#cloudBand`.

If you are not certain the two blocks are identical, do not fold them. The
default answer is no.
