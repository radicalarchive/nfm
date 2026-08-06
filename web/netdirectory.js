// The public game list, with no server anywhere.
//
// One well-known tracker identifier that every client sitting on the
// Multiplayer screen announces on. Hosts advertise their room; browsers ask
// who is there and collect the replies. That is the whole design, and it is
// only possible because p2pt discovers peers by identifier -- PeerJS could
// resolve a room code you already knew and offered no way to LEARN one, which
// is why the transport was swapped (see netpeer.js).
//
// WHAT THIS IS NOT. There is no registry, no authority and no persistence: the
// list is exactly the set of hosts currently holding this page open, and it is
// unauthenticated like everything else here -- anybody can announce a game that
// does not exist, or one whose name is a lie. The room CODE remains the
// load-bearing way in; the directory is a convenience on top of it.
//
// WHY ENTRIES EXPIRE RATHER THAN BEING WITHDRAWN. A host that closes its
// laptop sends nothing, so a list that only removed entries on request would
// accumulate ghosts forever. Every announcement carries a timestamp of its
// own arrival and is dropped when it goes stale; a live host re-announces well
// inside that window.

import { TRACKERS, TAG_MSG, loadP2PT, frame, asBytes } from './netpeer.js';

// Version the identifier. It is a wire protocol shared with every other copy
// of this game on the internet, and an incompatible change to the message
// shape needs a new room to happen in rather than a confusing half-parse.
const DIRECTORY_ID = 'nfm-directory-v1';

/** Re-announce this often; entries older than STALE_MS are dropped. */
const ANNOUNCE_MS = 5000;
const STALE_MS = 16000;

/**
 * A client's presence on the directory identifier.
 *
 * Both roles are the same object because they are the same connection: a host
 * that is also browsing (it is sitting on the same screen) answers queries and
 * lists other people's games at once.
 */
export class Directory {
  constructor({ onChange } = {}) {
    this.onChange = onChange || (() => {});
    this.p2 = null;
    this.peers = new Map();          // peer id -> peer object
    /** code -> { code, name, stage, players, max, at, ping } */
    this.games = new Map();
    /** What we advertise, or null when we are only browsing. */
    this.listing = null;
    this.timer = null;
    this.pings = new Map();          // peer id -> time the ping was sent
  }

  async start() {
    if (this.p2) return;
    const P2PT = await loadP2PT();
    this.p2 = new P2PT(TRACKERS, DIRECTORY_ID);
    this.p2.on('peerconnect', (peer) => {
      this.peers.set(peer.id, peer);
      // Ask what they have, tell them what we have, and time the round trip.
      this.#to(peer, { t: 'who' });
      if (this.listing) this.#to(peer, { t: 'game', ...this.listing });
      this.pings.set(peer.id, performance.now());
      this.#to(peer, { t: 'ping' });
    });
    this.p2.on('peerclose', (peer) => {
      this.peers.delete(peer.id);
      // Drop whatever that peer was advertising: a host that leaves the screen
      // should vanish from the list at once rather than linger until it goes
      // stale, which is the difference between a list that feels live and one
      // that feels wrong.
      for (const [code, g] of this.games) if (g.from === peer.id) this.games.delete(code);
      this.#changed();
    });
    this.p2.on('data', (peer, raw) => this.#recv(peer, asBytes(raw)));
    // Warnings are noise, not failure: one tracker refusing costs nothing
    // while another answers, and an unhandled 'error' on an EventEmitter
    // throws.
    this.p2.on('trackerwarning', (err) => console.warn('directory tracker:', err?.message || err));
    this.p2.on('warning', (err) => console.warn('directory tracker:', err?.message || err));
    this.p2.on('error', (err) => console.warn('directory:', err?.message || err));
    this.p2.start();
    this.timer = setInterval(() => this.#tick(), ANNOUNCE_MS);
  }

  #to(peer, obj) {
    try {
      if (peer.connected) peer.send(frame(TAG_MSG, obj));
    } catch { /* the peer went away between the check and the send */ }
  }

  #all(obj) {
    for (const peer of this.peers.values()) this.#to(peer, obj);
  }

  #recv(peer, bytes) {
    if (!bytes.length || bytes[0] !== TAG_MSG) return;   // p2pt's own '^' frames
    let msg;
    try { msg = JSON.parse(new TextDecoder().decode(bytes.subarray(1))); } catch { return; }
    switch (msg?.t) {
      case 'who':
        if (this.listing) this.#to(peer, { t: 'game', ...this.listing });
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
          from: peer.id,
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
        this.#to(peer, { t: 'pong' });
        return;
      case 'pong': {
        const sent = this.pings.get(peer.id);
        if (sent === undefined) return;
        const rtt = Math.round(performance.now() - sent);
        this.pings.delete(peer.id);
        for (const g of this.games.values()) if (g.from === peer.id) g.ping = rtt;
        this.#changed();
        return;
      }
      default:
    }
  }

  #tick() {
    if (this.listing) this.#all({ t: 'game', ...this.listing });
    // Ask the trackers again rather than waiting for their own announce
    // interval, which is theirs to choose and is often a minute or more. A
    // host that opened a room ten seconds ago is invisible until somebody
    // re-announces, which is most of why the list felt unreliable.
    try { this.p2?.requestMorePeers?.(); } catch { /* tracker is down; the next tick retries */ }
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

  stop() {
    this.withdraw();
    clearInterval(this.timer);
    this.timer = null;
    try { this.p2?.destroy(); } catch { /* already gone */ }
    this.p2 = null;
    this.peers.clear();
    this.games.clear();
  }
}
