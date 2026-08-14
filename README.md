# Need for Madness WebGL Port

![icon](data/icon.png)

[Play here!](https://radicalarchive.github.io/nfm)

This is a WIP unofficial port of NFM to the web.  Currently gameplay/physics are implemented, with full game GUI coming soon.  The original game JAR files were decompiled and Java transcribed line-by-line to JS with Claude Opus, using WebGL for rendering.  

This repo also contains a patched version of the original game to run on modern Java (run `./start.sh`).

Both the Java and JS versions have a few enhancements to increase game resolution and FPS from the original hardcoded 800x450/19fps.


## Architecture

- **`web/`** — the JS/WebGL port. `main.html` is the game; the launcher at the
  repo root points at it. Everything the browser loads lives here or in the
  shared data directories.
- **`java/`** — the original game: the patched `Game.jar` that `start.sh` runs,
  the pristine `Game.jar.bak`, and the previous build for rollback. This is the
  reference implementation the port is compared against, not a build input.
- **`decompilation/`** — the decompiled Java (`java-src/`), the porting
  contract (`PORT_SPEC.md`), and the records of the delegated transcription
  jobs (`agy_tmp`, `agy_batch_tmp`). Read-only history and reference.
- **`data/`, `stages/`, `mycars/`, `mystages/`, `music/`** — game assets, byte
  identical to the original and **not to be modified**. They stay at the root
  because both the jar and the port read them.


- `AGENTS.md` - how to run, deploy, measure and verify; the invariants
- `WORK.md` - discoveries and gotchas, newest last — including several measurements that overturned earlier conclusions
- `TASKS.md` - what is done, what is next, what is blocked
-`web/TRANSPILE_SPEC.md` - the Java→JS contract
- `decompilation/PORT_SPEC.md` - the original plan, and the still-binding rules for delegating work

## Roadmap
- [x] basic game rendering
- [x] basic game playability and physics
- [x] in-game HUD
- [ ] sound
- [ ] game menus
- [ ] private online multiplayer
- [ ] upgrade ints to floats :o
