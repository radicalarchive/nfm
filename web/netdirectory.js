// The public game list, with no server anywhere.
//
// Every client on the Multiplayer screen is on the one swarm (see netpeer.js),
// so the list is not a network of its own -- it is a conversation over
// connections the page already has. Hosts advertise their room; browsers ask
// who is there and collect the replies.
//
// WHAT THIS IS NOT. There is no registry, no authority and no persistence: the
// list is exactly the set of hosts currently holding this page open, and it is
// unauthenticated like everything else here -- anybody can announce a game that
// does not exist, or one whose name is a lie. The room CODE remains the
// load-bearing way in; the directory is a convenience on top of it.
//
// WHY ENTRIES EXPIRE RATHER THAN BEING WITHDRAWN. A host that closes its
// laptop sends nothing, so a list that only removed entries on request would
// accumulate ghosts forever. Every announcement carries a timestamp of its own
// arrival and is dropped when it goes stale; a live host re-announces well
// inside that window. `peerclose` removes the entry immediately in the case
// the swarm does notice.
//
// WHAT IT USED TO DO. It ran its own p2pt on a second identifier and called
// `requestMorePeers()` every 5s to fight a list that felt unreliable. Both are
// gone: the second swarm was itself the cause (netpeer.js's header has the
// mechanism), and the polling was redundant anyway -- a tracker pushes a
// NEWCOMER's offers to everyone already in the swarm, measured at ~120ms, so
// sitting still is enough to be found.

import { TAG_DIR, mesh, frame } from './netpeer.js';

/** Re-announce this often; entries older than STALE_MS are dropped. */
const ANNOUNCE_MS = 5000;
const STALE_MS = 16000;

/**
 * A client's presence on the game list.
 *
 * Both roles are the same object because they are the same connection: a host
 * that is also browsing (it is sitting on the same screen) answers queries and
 * lists other people's games at once.
 */
export class Directory {
  constructor({ onChange } = {}) {
    this.onChange = onChange || (() => {});
    /** code -> { code, name, stage, players, max, from, at, ping } */
    this.games = new Map();
    /** What we advertise, or null when we are only browsing. */
    this.listing = null;
    this.timer = null;
    this.pings = new Map();          // peer id -> time the ping was sent
    this.started = false;
  }

  async start() {
    if (this.started) return;
    this.started = true;
    this._onDir = (msg, id) => this.#recv(msg, id);
    this._onPeer = (id, gone) => (gone ? this.#gone(id) : this.#greet(id));
    mesh.dirHandlers.add(this._onDir);
    mesh.peerHandlers.add(this._onPeer);
    await mesh.start();
    // Anyone already connected -- the swarm may have been up since the page
    // reached the multiplayer screen, and joining a room does not leave it.
    for (const id of mesh.ids()) this.#greet(id);
    this.timer = setInterval(() => this.#tick(), ANNOUNCE_MS);
  }

  /** Ask what they have, tell them what we have, and time the round trip. */
  #greet(id) {
    this.#to(id, { t: 'who' });
    if (this.listing) this.#to(id, { t: 'game', ...this.listing });
    this.pings.set(id, performance.now());
    this.#to(id, { t: 'ping' });
  }

  /**
   * Drop whatever a departing peer was advertising: a host that leaves the
   * screen should vanish from the list at once rather than linger until it
   * goes stale, which is the difference between a list that feels live and one
   * that feels wrong.
   */
  #gone(id) {
    let dropped = false;
    for (const [code, g] of this.games) if (g.from === id) { this.games.delete(code); dropped = true; }
    if (dropped) this.#changed();
  }

  #to(id, obj) {
    mesh.send(id, frame(TAG_DIR, obj));
  }

  #all(obj) {
    mesh.broadcast(frame(TAG_DIR, obj));
  }

  #recv(msg, id) {
    switch (msg?.t) {
      case 'who':
        if (this.listing) this.#to(id, { t: 'game', ...this.listing });
        return;
      case 'game': {
        if (!msg.code) return;
        const was = this.games.get(msg.code);
        this.games.set(msg.code, {
          code: String(msg.code).slice(0, 8),
          name: String(msg.name || 'a game').slice(0, 24),
          stage: msg.stage | 0,
          players: msg.players | 0,
          max: msg.max | 0,
          from: id,
          at: performance.now(),
          ping: was?.ping,
        });
        this.#changed();
        return;
      }
      case 'gone':
        if (this.games.delete(msg.code)) this.#changed();
        return;
      case 'ping':
        this.#to(id, { t: 'pong' });
        return;
      case 'pong': {
        const sent = this.pings.get(id);
        if (sent === undefined) return;
        const rtt = Math.round(performance.now() - sent);
        this.pings.delete(id);
        for (const g of this.games.values()) if (g.from === id) g.ping = rtt;
        this.#changed();
        return;
      }
      default:
        // 'find'/'here' share this channel and belong to netpeer.js.
    }
  }

  #tick() {
    if (this.listing) this.#all({ t: 'game', ...this.listing });
    // Expire the silent. A host whose browser was closed cannot tell us.
    const now = performance.now();
    let dropped = false;
    for (const [code, g] of this.games) {
      if (now - g.at > STALE_MS) { this.games.delete(code); dropped = true; }
    }
    if (dropped) this.#changed();
  }

  #changed() {
    this.onChange(this.list());
  }

  /** Every game we currently believe in, most players first. */
  list() {
    return [...this.games.values()].sort((a, b) => b.players - a.players);
  }

  /**
   * Advertise a room. Call again whenever anything in it changes -- a player
   * joining is the whole reason someone is watching the list.
   */
  announce(listing) {
    this.listing = listing;
    this.#all({ t: 'game', ...listing });
  }

  /** Stop advertising, and say so rather than waiting to go stale. */
  withdraw() {
    if (!this.listing) return;
    const code = this.listing.code;
    this.listing = null;
    this.#all({ t: 'gone', code });
  }

  /**
   * Stop listing games. The SWARM stays up -- a lobby or a race may be running
   * on it, and it is also how we will be found next time.
   */
  stop() {
    this.withdraw();
    clearInterval(this.timer);
    this.timer = null;
    mesh.dirHandlers.delete(this._onDir);
    mesh.peerHandlers.delete(this._onPeer);
    this.games.clear();
    this.pings.clear();
    this.started = false;
  }
}
