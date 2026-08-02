// The transport half of netplay: PeerJS, WebRTC, and the handshake.
//
// Kept apart from netsync.js so that the rules of lockstep stay testable under
// node. Nothing here decides anything about the simulation; it moves bytes and
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
 * One end of a two-player session.
 *
 * Host and guest differ only in who waits and who dials; after `ready`
 * resolves the two are symmetric and the caller cannot tell them apart except
 * by `localIndex`.
 */
export class NetPeer {
  constructor({ onData, onStatus, onClose } = {}) {
    this.onData = onData || (() => {});
    this.onStatus = onStatus || (() => {});
    this.onClose = onClose || (() => {});
    this.peer = null;
    this.conn = null;
    this.code = null;
    this.localIndex = 0;
    this.open = false;
  }

  #status(s) {
    this.onStatus(s);
  }

  #bind(conn) {
    this.conn = conn;
    conn.on('data', (d) => this.onData(d));
    conn.on('close', () => { this.open = false; this.onClose('peer closed the connection'); });
    conn.on('error', (e) => { this.open = false; this.onClose('connection error: ' + e); });
  }

  /**
   * Create a room and wait for one guest.
   * @returns {Promise<object>} the guest's hello payload
   */
  async host(code = makeRoomCode()) {
    const Peer = await loadPeer();
    this.code = code;
    this.localIndex = 0;
    this.#status(`opening room ${code}...`);
    this.peer = new Peer(ID_PREFIX + code);
    await new Promise((resolve, reject) => {
      this.peer.on('open', resolve);
      this.peer.on('error', reject);
    });
    this.#status(`room ${code} open — waiting for a player`);
    const conn = await new Promise((resolve, reject) => {
      this.peer.on('connection', resolve);
      this.peer.on('error', reject);
    });
    await new Promise((resolve) => conn.on('open', resolve));
    this.#bind(conn);
    this.open = true;
    this.#status('player connected');
    return conn;
  }

  /** Join an existing room. */
  async join(code) {
    const Peer = await loadPeer();
    this.code = code;
    this.localIndex = 1;
    this.#status(`connecting to ${code}...`);
    this.peer = new Peer();
    await new Promise((resolve, reject) => {
      this.peer.on('open', resolve);
      this.peer.on('error', reject);
    });
    // Unreliable and unordered: lockstep packets carry their own redundancy
    // (see netsync.REDUNDANCY), so retransmission would only add latency to
    // data that is already stale by the time it arrives.
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

  send(data) {
    if (this.open && this.conn) {
      try {
        this.conn.send(data);
      } catch {
        // A send failing mid-race must not take the frame loop down with it;
        // the next packet's redundancy covers the gap anyway.
      }
    }
  }

  close() {
    this.open = false;
    try { this.conn?.close(); } catch { /* already gone */ }
    try { this.peer?.destroy(); } catch { /* already gone */ }
  }
}
