// The transport half of netplay: peer discovery, WebRTC, and the join
// handshake's plumbing.
//
// Kept apart from netsession.js so the sync rules stay testable under node.
// Nothing here decides anything about the simulation; it moves bytes and
// reports connection state.
//
// There is no backend of ours. Signalling runs over public WebTorrent
// WebSocket trackers via p2pt, which is the only third party in the design and
// is needed only to ESTABLISH connections -- once the DataChannels are open the
// traffic is peer to peer and every tracker could vanish mid-race without
// anyone noticing. That is what keeps this deployable on static hosting.
//
// WHY p2pt AND NOT PeerJS (swapped 2026-08-06). PeerJS resolves an id you
// already know and offers no way to LEARN one: its broker's peer-listing
// endpoint is disabled on the public server, so a room list was impossible
// without either squatting a hardcoded id or running a registry of our own.
// p2pt announces on a tracker under an IDENTIFIER and the tracker hands back
// everyone else announcing the same one, which is exactly the rendezvous that
// was missing -- a room is an identifier, and a future game browser is one
// well-known identifier that every idle client announces on.
//
// WHAT IT COSTS. p2pt builds on simple-peer's default DataChannel, which is
// RELIABLE and ORDERED; the PeerJS version ran state on an unreliable,
// unordered channel and lobby traffic on a second reliable one. Measured with
// `netloop.mjs <ticks> <loss> <latency> <reorder> <humans> reliable`, which
// emulates head-of-line blocking: at 0-2% loss reliable is BETTER than
// unreliable (steady-state residual 22 -> 3 units clean, 46 -> 9 at 2%),
// because retransmission costs less than the unordered channel's reordering.
// It degrades above ~10% loss (residual 101 units, stalls to 11 ticks) and
// badly at 30% (354 units, 19-tick stalls) -- a regime where the game is
// already unpleasant. The trade was taken deliberately for the discovery.
//
// THE TOPOLOGY IS NOW A MESH, not a star. Every peer on an identifier
// discovers every other, so a guest sends its own car straight to the other
// guests instead of paying a second hop through the host. The host still
// assigns slots and owns the bots (`GameSparker.java:1348`) -- that is
// ownership, not routing. There is no relay any more, and nothing should
// reintroduce one: a relayed copy alongside a direct one is a duplicate, and
// while `StateSync.accepts()` refuses it on the tick rule, spending the
// bandwidth to be refused is pointless.

// Reachability checked from the target machine 2026-08-06; the other commonly
// listed trackers (novage, sloppyta, files.fm) refused or timed out. Several
// are listed on purpose -- p2pt announces on all of them and dedupes the peers
// it is handed, so one tracker going down costs nothing.
export const TRACKERS = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.webtorrent.dev',
  'wss://tracker.btorrent.xyz',
];

// Frames are tagged so one channel can carry both kinds of traffic; the
// directory in netdirectory.js reuses the tags and the loader, because it is
// the same p2pt talking to a different identifier.
// Room codes are typed and read aloud, so no 0/O or 1/I/l.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
// The identifier is hashed into a torrent info-hash and announced to PUBLIC
// trackers, so it must not collide with another project's. Namespace it.
const ID_PREFIX = 'nfm-';

// Frame tags. One DataChannel now carries both kinds of traffic, so the first
// byte says which. 0x5E ('^') is p2pt's own JSON framing -- we never send it,
// and we ignore anything wearing it, so the two layers cannot be confused.
export const TAG_STATE = 0x02;
export const TAG_MSG = 0x03;

// How long to look for a room before giving up. Tracker announce plus ICE is
// a few seconds on a good day; a code typed one character wrong waits this
// long and then says so, which is better than hanging forever.
const JOIN_TIMEOUT_MS = 45000;

export function makeRoomCode(len = 6) {
  const out = [];
  const bytes = new Uint8Array(len);
  (globalThis.crypto || {}).getRandomValues?.(bytes);
  for (let i = 0; i < len; i++) {
    out.push(CODE_ALPHABET[(bytes[i] || Math.floor(Math.random() * 256)) % CODE_ALPHABET.length]);
  }
  return out.join('');
}

let libLoaded = null;

/**
 * Load the vendored p2pt once.
 *
 * Deliberately dynamic and lazy. A static import would run at module load, and
 * `web/vendor/bassoonplayer.js` has already taught this project that a
 * vendored bundle touching `window` at import time breaks every node test that
 * transitively imports it.
 */
export async function loadP2PT() {
  if (libLoaded) return libLoaded;
  libLoaded = import('./vendor/p2pt.js').then((m) => m.default);
  return libLoaded;
}

/**
 * Tag a payload so the receiver knows which layer it belongs to.
 *
 * Binary is checked FIRST and deliberately: a Uint8Array is `typeof 'object'`,
 * so an object test written first JSON-stringifies every state packet into
 * `{"0":12,"1":88,...}`. It still sends, still arrives and still parses as a
 * frame -- `decodePacket` merely returns null and the race runs on dead
 * reckoning forever, with the lobby and chat working perfectly throughout.
 */
export function frame(tag, payload) {
  const body = ArrayBuffer.isView(payload) ? payload
    : new TextEncoder().encode(typeof payload === 'string' ? payload : JSON.stringify(payload));
  const out = new Uint8Array(body.length + 1);
  out[0] = tag;
  out.set(body, 1);
  return out;
}

export const asBytes = (d) => (d instanceof ArrayBuffer ? new Uint8Array(d)
  : ArrayBuffer.isView(d) ? new Uint8Array(d.buffer, d.byteOffset, d.byteLength)
  : new TextEncoder().encode(String(d)));

/**
 * One end of a session.
 *
 * `conns` is every peer this client is connected to, in the order they
 * connected, and an index into it is what `from` means in every callback. On
 * the host that order is join order, so it is also what maps a guest to the
 * slot it was given; the caller records the mapping rather than assuming it,
 * because on a GUEST the array holds the host and the other guests mixed
 * together.
 */
export class NetPeer {
  constructor({ onData, onMessage, onStatus, onClose } = {}) {
    /** @type {(bytes:Uint8Array, from:number) => void} state frames. */
    this.onData = onData || (() => {});
    /**
     * @type {(msg:any, from:number) => void} lobby/chat frames.
     *
     * An ACCESSOR, because messages arrive before anyone is listening. A guest
     * greets the moment its channel opens, which can be while the host is
     * still inside `openRoom()` and has not built its Lobby yet -- and a
     * greeting is sent ONCE, so dropping it strands that player permanently:
     * it never gets a slot, keeps localIndex -1, and its chat goes out as slot
     * 0, which is the host's. That presents as the host seeing its own name on
     * someone else's line. Early messages are queued and delivered when a
     * handler is attached.
     */
    this._onMessage = onMessage || null;
    this._earlyMsgs = [];
    /**
     * @type {(from:number) => void} a peer finished connecting.
     *
     * A guest needs this because it cannot tell which peer is the host: on a
     * mesh it meets the other GUESTS too, and in whatever order the trackers
     * and ICE happen to produce. So it greets everyone and re-greets whoever
     * turns up late, and the host is simply whoever answers.
     */
    this.onPeer = null;
    this.onStatus = onStatus || (() => {});
    this.onClose = onClose || (() => {});
    this.p2 = null;
    /** Every connected peer, in connection order. */
    this.conns = [];
    this.byId = new Map();
    this.code = null;
    this.localIndex = 0;
    this.open = false;
    /** A guest's index for the host, learned from who answers the greeting. */
    this.hostIndex = -1;
    // Peers that arrive before anyone is waiting for them. A guest can finish
    // connecting while the host is still awaiting an earlier one, and dropping
    // that arrival would strand the player.
    this.pending = [];
    this.waiters = [];
  }

  set onMessage(fn) {
    this._onMessage = fn;
    if (!fn) return;
    const queued = this._earlyMsgs;
    this._earlyMsgs = [];
    for (const [msg, from] of queued) fn(msg, from);
  }

  get onMessage() {
    return this._onMessage;
  }

  #deliver(msg, from) {
    if (this._onMessage) this._onMessage(msg, from);
    else this._earlyMsgs.push([msg, from]);
  }

  #status(s) {
    this.onStatus(s);
  }

  /**
   * Bind a peer, or recognise one we already know.
   *
   * p2pt can hand the same peer id back on a different channel (one per
   * tracker that reported it), so this is keyed on the id: a second sighting
   * updates the object we send through and keeps the index it already had.
   */
  #add(peer) {
    let idx = this.byId.get(peer.id);
    if (idx === undefined) {
      idx = this.conns.length;
      this.byId.set(peer.id, idx);
      this.conns.push(peer);
      this.open = true;
      const w = this.waiters.shift();
      if (w) w(idx); else this.pending.push(idx);
      this.onPeer?.(idx);
    } else {
      this.conns[idx] = peer;
    }
    this.#status(`connected to ${this.conns.length} peer(s)`);
  }

  #drop(peer) {
    const idx = this.byId.get(peer.id);
    if (idx === undefined) return;
    this.onClose('peer left the room', idx);
  }

  /** Attach to the room named by `code`. Host and guest differ only in what they wait for. */
  async #enter(code) {
    const P2PT = await loadP2PT();
    this.code = code;
    this.p2 = new P2PT(TRACKERS, ID_PREFIX + code);
    this.p2.on('peerconnect', (peer) => this.#add(peer));
    this.p2.on('peerclose', (peer) => this.#drop(peer));
    // Every frame arrives here, including p2pt's own '^' JSON, which we never
    // send and therefore never expect.
    this.p2.on('data', (peer, raw) => {
      const bytes = asBytes(raw);
      const from = this.byId.get(peer.id);
      if (from === undefined || !bytes.length) return;
      if (bytes[0] === TAG_STATE) this.onData(bytes.subarray(1), from);
      else if (bytes[0] === TAG_MSG) {
        let msg;
        try {
          msg = JSON.parse(new TextDecoder().decode(bytes.subarray(1)));
        } catch { return; }   // a peer sending garbage is not ours to crash on
        this.#deliver(msg, from);
      }
    });
    // A tracker warning is NOT a failure: p2pt announces on several trackers
    // and one of them refusing, or answering with something unparseable
    // ("invalid action in WS response: undefined"), costs nothing as long as
    // another answers. Surfacing these as STATUS put a raw library error in
    // front of the player at the exact moment they pressed Host, which reads
    // as the room having failed to open when it is about to succeed.
    this.p2.on('trackerwarning', (err) => console.warn('tracker:', err?.message || err));
    this.p2.on('warning', (err) => console.warn('tracker:', err?.message || err));
    // Resolves when a tracker has taken our announce, which is the point at
    // which other peers can find us. It is NOT a peer connection.
    const announced = new Promise((resolve) => this.p2.once('trackerconnect', resolve));
    this.p2.start();
    await announced;
  }

  /** Host: open the room and start accepting. Resolves once we are announced. */
  async openRoom(code = makeRoomCode()) {
    this.localIndex = 0;
    this.#status(`opening room ${code}...`);
    await this.#enter(code);
    this.#status(`room ${code} open — waiting for players`);
    return code;
  }

  /** Host: resolve with the index of the next peer to finish connecting. */
  accept() {
    if (this.pending.length) return Promise.resolve(this.pending.shift());
    return new Promise((resolve) => this.waiters.push(resolve));
  }

  /**
   * Guest: join an existing room.
   *
   * Resolves once SOMEBODY in the room has connected, which is not necessarily
   * the host -- on a mesh a late guest can meet an earlier guest first. Who
   * the host is comes out of the handshake above this, not out of the
   * transport.
   */
  async join(code) {
    this.localIndex = -1;                     // "not the host" until slotted
    this.#status(`looking for room ${code}...`);
    await this.#enter(code);
    const idx = await Promise.race([
      this.accept(),
      new Promise((_, reject) => setTimeout(
        () => reject(new Error(`no room ${code} found — check the code`)), JOIN_TIMEOUT_MS)),
    ]);
    this.#status('connected');
    return this.conns[idx];
  }

  /**
   * The live channel for a peer.
   *
   * p2pt keeps every channel it has for an id and any one of them may have
   * died, so fall back to a sibling rather than sending into a closed one.
   */
  #live(idx) {
    const peer = this.conns[idx];
    if (!peer) return null;
    if (peer.connected) return peer;
    for (const alt of Object.values(this.p2?.peers?.[peer.id] || {})) {
      if (alt.connected) return alt;
    }
    return null;
  }

  #raw(idx, frame) {
    const peer = this.#live(idx);
    if (!this.open || !peer) return;
    try {
      peer.send(frame);
    } catch {
      // A send failing mid-race must not take the frame loop down with it; the
      // next tick's packet supersedes this one anyway.
    }
  }

  /** Send state to every peer. */
  send(data) {
    const f = frame(TAG_STATE, data);
    for (let i = 0; i < this.conns.length; i++) this.#raw(i, f);
  }

  /** Send state to one peer. */
  sendTo(i, data) {
    this.#raw(i, frame(TAG_STATE, data));
  }

  /**
   * Send a lobby/chat message. Reliable and ordered, like everything else on
   * this transport.
   *
   * Framed by us rather than through p2pt's `send()`, which wraps a message in
   * its own JSON envelope and registers a response callback that nothing ever
   * resolves -- a small leak per message, and a chunking layer these messages
   * are far too short to need. The 16KB DataChannel limit therefore applies
   * directly: lobby and chat traffic must stay well under it.
   */
  sendMessage(data, i) {
    const f = frame(TAG_MSG, data);
    const to = i === undefined ? this.conns.map((_, n) => n) : [i];
    for (const n of to) this.#raw(n, f);
  }

  close() {
    this.open = false;
    try { this.p2?.destroy(); } catch { /* already gone */ }
  }
}
