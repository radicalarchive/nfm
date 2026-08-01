# java-src/ — decompiled game source

Procyon 0.6.0 output for `Game.jar`, committed as the input to the browser port.
See `../PORT_SPEC.md`.

**Decompiled from the patched `Game.jar`**, so all seven desktop patches in
`../AGENTS.md` are already present as readable source. This is reference and
port input — the jar remains the build artifact, and nothing here is currently
compiled back into it.

## Verification status

45 of 47 files compile clean with `javac -source 8 -target 8`. Two are broken by
known procyon control-flow artifacts:

| File | Error | Impact |
| --- | --- | --- |
| `Lobby.java:2609` | `not a loop label: Label_32727_Outer` | **None** — multiplayer, on the port's drop list |
| `ds/nfm/mod/ModSlayer.java:373` | `unreachable statement` (a `break` after `break Label_1262`) | **Must fix** — MOD player, part of audio, which the port keeps. One-line deletion |

Verify with:

```sh
javac -nowarn -source 8 -target 8 -cp <unpacked-jar-dir> -d /tmp/out $(find . -name '*.java')
```

## Known gaps

- **`Globe.java` is missing.** `Globe.class` (235KB) is pathological for
  procyon — it consumed 787MB RSS at 190% CPU for minutes and emitted a
  zero-byte file. It is multiplayer UI and on the drop list, so it was excluded
  rather than blocking the other 51 classes. Decompile it separately with a
  large heap if it is ever needed.
- Procyon emits anonymous inner classes **both** inline in the outer file and as
  separate `Outer$N.java` files. The duplicates were deleted; they are already
  present inside `Madness.java` and `GameSparker.java`.

## Regenerating

```sh
mkdir -p /tmp/j && cd /tmp/j && unzip -oq /path/to/Game.jar
java -jar /usr/share/java/procyon-decompiler.jar -o java-src \
  $(find . -name '*.class' | sed 's|^\./||' | grep -v '^Globe.class$')
rm -f java-src/*\$*.java
```

Classes must be listed explicitly — passing a directory fails with
`Failed to load class`.
