// The pre-race session: who is in the room, what they are driving, what is
// being said, and the one message that turns all of that into a race.
//
// WHY THIS IS NOT IN THE RACE LOOP. Everything here has to finish BEFORE a
// world exists. The host decides seed, stage, grid and slot assignment and
// ships them verbatim, because `sortcars()` consumes randoms: a client that
// regenerated any of it would advance its PRNG differently and disagree about
// the world before the lights went out. So a lobby is a pre-boot screen by
// construction, not a pause menu -- there is nowhere in the frame loop to put
// one.
//
// WHY IT IS A MODULE AND NOT PART OF THE LAUNCHER. Two callers drive the same
// protocol: the launcher's lobby screen, where a person presses Start, and
// `main.js`'s URL path (`?net=host&humans=N`), which starts as soon as the
// expected players have arrived and is what the browser tests drive. Writing
// the handshake twice would let the two drift, and a protocol that differs
// between the tested path and the shipped one is worse than no test.
//
// THE TRUST MODEL is the same as the race's: the host is believed about the
// room and every player about themselves. Nothing is validated. See
// netsession.js.

import { XtGraphics } from './XtGraphics.js';
import { CarDefine } from './CarDefine.js';
import { setSeed } from './java.js';

/** Cars on the grid, humans included. The game's own maximum. */
export const MAX_PLAYERS = 8;

/**
 * Draw the opponent grid the way the host will build it.
 *
 * Kept here because it must happen exactly once, on the host, and travel as
 * data: `sortcars()` rejection-samples out of the shared PRNG, so a guest that
 * called this would be at a different point in the stream forever after.
 */
export function drawGrid(seed, stage, myCar) {
  setSeed(seed);
  const tmp = new XtGraphics();
  tmp.cd = new CarDefine([], null, null, null);
  tmp.sc[0] = myCar;
  tmp.sortcars(stage);
  const cars = [];
  for (let i = 0; i < MAX_PLAYERS; i++) cars[i] = tmp.sc[i];
  return cars;
}

/**
 * One end of a lobby.
 *
 * The host holds the roster and is the only writer of it; guests render
 * whatever roster they were last sent. That is deliberate and is the same rule
 * slot assignment follows -- two clients that each maintained their own view
 * would eventually disagree about who is in slot 2, and nothing downstream
 * would notice until both drove the same car.
 */
export class Lobby {
  /**
   * @param net        a connected NetPeer
   * @param isHost     whether this client owns the roster
   * @param name       display name
   * @param car        chosen car slot
   * @param seed/stage/players  the host's race settings (ignored on a guest)
   * @param autoStart  host only: start as soon as this many humans are in.
   *                   0 means a person will press Start.
   */
  constructor({ net, isHost, name, car, seed = 12345, stage = 1,
                players = 7, autoStart = 0 }) {
    this.net = net;
    this.isHost = isHost;
    this.seed = seed;
    this.stage = stage;
    this.players = players;
    this.autoStart = autoStart;
    this.started = false;
    this._myName = String(name || (isHost ? 'Host' : 'Player')).slice(0, 12);
    this._myCar = car;
    /**
     * [{ slot, name, car, conn }] — `conn` indexes NetPeer.conns, and is -1
     * for ourselves. The host seats itself immediately; a guest has no roster
     * at all until the host sends one, which is what keeps a single writer.
     */
    this.roster = isHost ? [{ slot: 0, name: this._myName, car, conn: -1 }] : [];
    this.chat = [];
    /** @type {() => void} */
    this.onRoster = () => {};
    /** @type {(who:string, text:string) => void} */
    this.onChat = () => {};
    this.localIndex = isHost ? 0 : -1;
    // Resolves with the agreed race config. Everything the world is built from
    // crosses the wire in ONE message, so there is no window in which a client
    // has some of the host's decisions and not others.
    this.ready = new Promise((resolve) => { this._go = resolve; });

    net.onMessage = (msg, from) => this.#recv(msg, from);
    if (isHost) {
      // Greet late arrivals: a guest that connects after our first roster
      // broadcast would otherwise sit looking at an empty room until somebody
      // else joined. Cheap, and it makes the join independent of timing.
      net.onPeer = () => this.#broadcastRoster();
    } else {
      // The guest cannot pick the host out of its peers -- on a mesh it meets
      // the other guests too, in tracker order -- so it greets the room and
      // the host is whoever answers. Late arrivals are greeted as they appear,
      // because the host may not be the first peer we meet.
      const hello = () => ({ t: 'hello', name: this._myName, car: this._myCar });
      net.sendMessage(hello());
      net.onPeer = (idx) => net.sendMessage(hello(), idx);
      // Keep greeting until we are seated. The transport now queues a greeting
      // that arrives before the host is listening, so this is a safety net
      // rather than the mechanism -- but an unanswered hello is unrecoverable
      // (the guest stays slot-less and its chat goes out as slot 0, wearing
      // the host's name), and a retry costs one small message every 2s.
      this._greeter = setInterval(() => {
        if (this.localIndex >= 0 || this.started) { clearInterval(this._greeter); return; }
        net.sendMessage(hello());
      }, 2000);
    }
  }

  get me() {
    return this.roster.find((p) => p.slot === this.localIndex);
  }

  /** Everyone's slot is their index in `roster`; the host is always 0. */
  #assignSlots() {
    this.roster.forEach((p, i) => { p.slot = i; });
  }

  #broadcastRoster() {
    if (!this.isHost) return;
    this.#assignSlots();
    const players = this.roster.map((p) => ({ slot: p.slot, name: p.name, car: p.car }));
    // Each guest is told which of those entries is ITSELF. The rest of the
    // message is identical, but localIndex differs, so this cannot be one
    // broadcast.
    for (const p of this.roster) {
      if (p.conn < 0) continue;
      this.net.sendMessage({ t: 'roster', players, stage: this.stage,
                             nplayers: this.players, localIndex: p.slot }, p.conn);
    }
    this.onRoster();
    if (this.autoStart && this.roster.length >= this.autoStart) this.start();
  }

  #recv(msg, from) {
    if (!msg) return;
    switch (msg.t) {
      case 'hello': {
        if (!this.isHost) return;
        // Idempotent: a guest re-greets every peer it meets, so the same hello
        // arrives more than once and must not seat the player twice.
        let p = this.roster.find((q) => q.conn === from);
        if (!p) {
          if (this.roster.length >= Math.min(this.players, MAX_PLAYERS)) return;  // room full
          p = { slot: this.roster.length, name: '', car: 1, conn: from };
          this.roster.push(p);
        }
        p.name = String(msg.name || `Player ${p.slot + 1}`).slice(0, 12);
        if (Number.isInteger(msg.car)) p.car = msg.car;
        this.#broadcastRoster();
        return;
      }
      case 'setcar': {
        if (!this.isHost) return;
        const p = this.roster.find((q) => q.conn === from);
        if (!p || !Number.isInteger(msg.car)) return;
        p.car = msg.car;
        this.#broadcastRoster();
        return;
      }
      case 'roster': {
        if (this.isHost) return;                 // only the host writes it
        clearInterval(this._greeter);
        this.roster = msg.players.map((p) => ({ ...p, conn: -1 }));
        this.localIndex = msg.localIndex;
        this.stage = msg.stage;
        this.players = msg.nplayers;
        this.onRoster();
        return;
      }
      case 'chat': {
        const who = this.roster.find((p) => p.slot === msg.slot)?.name
          || `Player ${msg.slot + 1}`;
        const text = String(msg.text).slice(0, 120);
        this.chat.push([who, text]);
        this.onChat(who, text);
        // On a mesh a line reaches every peer directly; the host forwarding it
        // would only deliver a duplicate.
        return;
      }
      case 'start': {
        if (this.isHost || this.started) return;
        this.started = true;
        clearInterval(this._greeter);
        this.net.onPeer = null;
        this._go({
          seed: msg.seed, stage: msg.stage, players: msg.players,
          cars: msg.cars, humanSlots: msg.humanSlots, names: msg.names,
          localIndex: msg.localIndex, room: this.net.code,
        });
        return;
      }
      default:
    }
  }

  /** Say something in the lobby. Delivered to everyone including ourselves. */
  say(text) {
    const clean = String(text).trim().slice(0, 120);
    if (!clean) return;
    const slot = this.localIndex < 0 ? 0 : this.localIndex;
    this.net.sendMessage({ t: 'chat', slot, text: clean });
    const who = this.me?.name || 'me';
    this.chat.push([who, clean]);
    this.onChat(who, clean);
  }

  /** Change the car we are driving. The host owns the roster, so it is told. */
  setCar(car) {
    if (this.isHost) {
      this.roster[0].car = car;
      this.#broadcastRoster();
    } else {
      this._myCar = car;
      const me = this.me;
      if (me) me.car = car;
      this.net.sendMessage({ t: 'setcar', car });
      this.onRoster();
    }
  }

  /** Host: change the stage everyone will race. */
  setStage(stage) {
    if (!this.isHost) return;
    this.stage = stage;
    this.#broadcastRoster();
  }

  /** Host: change how many cars are on the grid, humans included. */
  setPlayers(n) {
    if (!this.isHost) return;
    this.players = Math.max(this.roster.length, Math.min(MAX_PLAYERS, n));
    this.#broadcastRoster();
  }

  /**
   * Host: begin. Draws the grid, tells each guest its own slot, and resolves
   * `ready` for everyone.
   *
   * The grid is drawn here and shipped rather than re-derived from the seed on
   * each client, for the PRNG reason at the top of this file.
   */
  start() {
    if (!this.isHost || this.started) return;
    this.started = true;
    this.net.onPeer = null;
    this.#assignSlots();
    const humanSlots = this.roster.map((p) => p.slot);
    const names = this.roster.map((p) => p.name);
    // Never fewer cars than people. A room of six in a four-car race would
    // otherwise seat two players in slots no world has.
    const players = Math.max(this.roster.length, Math.min(MAX_PLAYERS, this.players));
    const cars = drawGrid(this.seed, this.stage, this.roster[0].car);
    for (const p of this.roster) cars[p.slot] = p.car;

    for (const p of this.roster) {
      if (p.conn < 0) continue;
      this.net.sendMessage({
        t: 'start', seed: this.seed, stage: this.stage, players,
        cars, humanSlots, names, localIndex: p.slot,
      }, p.conn);
    }
    this._go({ seed: this.seed, stage: this.stage, players, cars, humanSlots,
               names, localIndex: 0, room: this.net.code });
  }
}
