// The transport half of netplay: PeerJS, WebRTC, and the handshake.
//
// Kept apart from netsession.js so the sync rules stay testable under node.
// Nothing here decides anything about the simulation; it moves bytes and
// reports connection state.
//
// There is no backend of ours. Signalling (the SDP exchange) runs over PeerJS's
// free public broker, which is the one third party in the whole design, and it
// is only needed to *establish* the connection -- once the DataChannel is open
// the traffic is peer to peer and the broker could vanish mid-race without
// anyone noticing. That is what makes this deployable on GitHub Pages.

const PEER_SCRIPT = './vendor/peerjs.js';

// Room codes are typed and read aloud, so no 0/O or 1/I/l.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
// PeerJS ids are global to the broker, so a bare six-letter code would collide
// with every other project using the public server. Namespace it.
const ID_PREFIX = 'nfm-';

export function makeRoomCode(len = 6) {
  const out = [];
  const bytes = new Uint8Array(len);
  (globalThis.crypto || {}).getRandomValues?.(bytes);
  for (let i = 0; i < len; i++) {
    out.push(CODE_ALPHABET[(bytes[i] || Math.floor(Math.random() * 256)) % CODE_ALPHABET.length]);
  }
  return out.join('');
}

let peerLoaded = null;

/**
 * Load the vendored PeerJS once.
 *
 * It is an IIFE that assigns `window.Peer`, not an ES module, so this is an
 * import for side effects. Deliberately dynamic and lazy: a static import
 * would run at module load, and `web/vendor/bassoonplayer.js` has already
 * taught this project that a vendored bundle touching `window` at import time
 * breaks every node test that transitively imports it.
 */
async function loadPeer() {
  if (peerLoaded) return peerLoaded;
  peerLoaded = (async () => {
    await import(PEER_SCRIPT);
    if (!globalThis.Peer) throw new Error('PeerJS did not define window.Peer');
    return globalThis.Peer;
  })();
  return peerLoaded;
}

/**
 * One end of a session.
 *
 * The topology is a STAR centred on the host: the host holds one connection
 * per guest, and a guest holds exactly one, to the host. Guests never speak to
 * each other directly -- the host relays. That is what keeps this cheap as
 * players are added, and it suits state sync specifically: a guest transmits
 * only its own car however many players there are, so its upload is flat,
 * while only the host's scales. A full mesh would be N(N-1)/2 connections and
 * N-1 uploads per guest for no gain, since the packets are absolute state and
 * a relayed copy is worth exactly as much as a direct one.
 *
 * The cost is that guest-to-guest traffic takes two hops. Dead reckoning
 * covers that latency; see netsession.js.
 */
export class NetPeer {
  constructor({ onData, onStatus, onClose } = {}) {
    /** @type {(bytes:any, from:number) => void} `from` indexes `conns`. */
    this.onData = onData || (() => {});
    this.onStatus = onStatus || (() => {});
    this.onClose = onClose || (() => {});
    this.peer = null;
    /** Host: one per guest. Guest: exactly one, to the host. */
    this.conns = [];
    this.code = null;
    this.localIndex = 0;
    this.open = false;
    // Connections that arrive before anyone is waiting for them. A guest can
    // complete its handshake while the host is still awaiting an earlier one,
    // and dropping that connection would strand the player.
    this.pending = [];
    this.waiters = [];
  }

  #status(s) {
    this.onStatus(s);
  }

  #bind(conn) {
    const idx = this.conns.length;
    this.conns.push(conn);
    conn.on('data', (d) => this.onData(d, idx));
    conn.on('close', () => this.onClose('peer closed the connection', idx));
    conn.on('error', (e) => this.onClose('connection error: ' + e, idx));
    return idx;
  }

  /** Host: create the room and start accepting. Resolves once the broker has us. */
  async openRoom(code = makeRoomCode()) {
    const Peer = await loadPeer();
    this.code = code;
    this.localIndex = 0;
    this.#status(`opening room ${code}...`);
    this.peer = new Peer(ID_PREFIX + code);
    await new Promise((resolve, reject) => {
      this.peer.on('open', resolve);
      this.peer.on('error', reject);
    });
    // Listen for the WHOLE session, not just for the next guest: registering
    // this once and queueing arrivals is what allows more than one of them.
    this.peer.on('connection', (conn) => {
      conn.on('open', () => {
        const idx = this.#bind(conn);
        this.open = true;
        const w = this.waiters.shift();
        if (w) w(idx); else this.pending.push(idx);
      });
    });
    this.#status(`room ${code} open — waiting for players`);
    return code;
  }

  /** Host: resolve with the index of the next guest to finish connecting. */
  accept() {
    if (this.pending.length) return Promise.resolve(this.pending.shift());
    return new Promise((resolve) => this.waiters.push(resolve));
  }

  /** Guest: join an existing room. */
  async join(code) {
    const Peer = await loadPeer();
    this.code = code;
    this.#status(`connecting to ${code}...`);
    this.peer = new Peer();
    await new Promise((resolve, reject) => {
      this.peer.on('open', resolve);
      this.peer.on('error', reject);
    });
    // Unreliable and unordered: state packets are absolute and self-
    // superseding, so a lost one needs no retransmission -- the next one
    // replaces it entirely, and a resend would only deliver stale data late.
    const conn = this.peer.connect(ID_PREFIX + code, { reliable: false, ordered: false });
    await new Promise((resolve, reject) => {
      conn.on('open', resolve);
      conn.on('error', reject);
      this.peer.on('error', reject);
    });
    this.#bind(conn);
    this.open = true;
    this.#status('connected');
    return conn;
  }

  /** Send to every connection. */
  send(data) {
    for (let i = 0; i < this.conns.length; i++) this.sendTo(i, data);
  }

  /**
   * Send to one connection.
   *
   * `except` on the broadcast path is what makes the host's relay safe: a
   * packet echoed back to the guest that sent it would be a record for a car
   * that guest owns, and while netsession.js refuses those, spending the
   * bandwidth to be refused is pointless.
   */
  sendTo(i, data) {
    const conn = this.conns[i];
    if (!this.open || !conn) return;
    try {
      conn.send(data);
    } catch {
      // A send failing mid-race must not take the frame loop down with it;
      // the next tick's packet supersedes this one anyway.
    }
  }

  /** Send to every connection but one. The host's relay path. */
  broadcastExcept(skip, data) {
    for (let i = 0; i < this.conns.length; i++) if (i !== skip) this.sendTo(i, data);
  }

  close() {
    this.open = false;
    for (const c of this.conns) { try { c.close(); } catch { /* already gone */ } }
    try { this.peer?.destroy(); } catch { /* already gone */ }
  }
}
