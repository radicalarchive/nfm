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
// ONE SWARM (2026-08-06). Every client announces on a single well-known
// identifier and meets everyone else on it. A ROOM IS A LABEL CARRIED IN
// FRAMES, not a tracker identifier of its own.
//
// The room-as-identifier design that this replaces made hosting and joining
// each a full tracker rendezvous, and measured 10-40 seconds against ~1s for
// the swarm you are already in. Two separate things were wrong with it:
//   - By the time you click a game in the list you are ALREADY connected to
//     that host over the directory swarm. Joining threw that connection away
//     and rebuilt the identical link under a different name.
//   - bittorrent-tracker pools websockets per tracker URL across every p2pt in
//     the page, and p2pt's `setIdentifier()` is async and unawaited, so the
//     SECOND swarm's first announce went out with no `info_hash`. The tracker
//     rejected it with a message carrying no `action` field, which
//     bittorrent-tracker treats as a socket error: it destroyed that tracker
//     and reconnected on a 10s + up-to-300s backoff, taking the directory down
//     with the room. That is what "the game list is unreliable" was.
// `makeP2PT()` below fixes the second one and is kept, because the race is
// real and would return the moment anything opened a second swarm.
//
// So: joining a listed game is now a MESSAGE, not a network operation, and it
// cannot fail on tracker backoff. Joining by code is a query broadcast on the
// swarm ('find'/'here'), which is the only case that still waits for anything.
//
// WHAT IT COSTS. Everyone idle on the multiplayer screen meshes with everyone
// else idle there, not just with their own game -- fine at this game's scale,
// quadratic if it ever isn't. `lock()` bounds it: when a race starts we stop
// announcing and drop every peer that is not in the room, so a racing client
// holds exactly its own players. Measured with 2-3 peers, NOT with 20; the
// mesh cost at that size is unknown and is the thing to watch.
//
// The room code also stops being a separate rendezvous and becomes an in-band
// credential the host checks. That is a real reduction in separation and a
// small one: the design is unauthenticated throughout, and the code was never
// secret from the trackers.
//
// WHAT IT COSTS ON THE WIRE. Frames carry `[tag][len][room]` instead of
// `[tag]`, so a state packet grows by 7 bytes. State is ~40 bytes per car per
// tick, so this is noise next to the header of the packet it rides in.
//
// WHY p2pt AND NOT PeerJS (swapped 2026-08-06). PeerJS resolves an id you
// already know and offers no way to LEARN one: its broker's peer-listing
// endpoint is disabled on the public server, so a room list was impossible
// without either squatting a hardcoded id or running a registry of our own.
// p2pt announces on a tracker under an IDENTIFIER and the tracker hands back
// everyone else announcing the same one, which is what makes both the game
// browser and this design possible at all.
//
// WHAT THE TRANSPORT GIVES US. p2pt builds on simple-peer's default
// DataChannel, which is RELIABLE and ORDERED. Measured with
// `netloop.mjs <ticks> <loss> <latency> <reorder> <humans> reliable`, which
// emulates head-of-line blocking: at 0-2% loss reliable is BETTER than
// unreliable (steady-state residual 22 -> 3 units clean, 46 -> 9 at 2%),
// because retransmission costs less than the unordered channel's reordering.
// It degrades above ~10% loss (residual 101 units, stalls to 11 ticks) and
// badly at 30% (354 units, 19-tick stalls) -- a regime where the game is
// already unpleasant.
//
// THE TOPOLOGY IS A MESH, not a star. Every peer meets every other, so a guest
// sends its own car straight to the other guests instead of paying a second
// hop through the host. The host still assigns slots and owns the bots
// (`GameSparker.java:1348`) -- that is ownership, not routing. There is no
// relay, and nothing should reintroduce one: a relayed copy alongside a direct
// one is a duplicate, and while `StateSync.accepts()` refuses it on the tick
// rule, spending the bandwidth to be refused is pointless.

// Reachability checked from the target machine 2026-08-06; the other commonly
// listed trackers (novage, sloppyta, files.fm) refused or timed out. Several
// are listed on purpose -- p2pt announces on all of them and dedupes the peers
// it is handed, so one tracker going down costs nothing.
export const TRACKERS = [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.webtorrent.dev',
  'wss://tracker.btorrent.xyz',
];

// The trackers are SIGNALLING, not traversal: they carry the offer/answer that
// introduces two peers and say nothing about whether those peers can reach
// each other. That is ICE's job, and it needs STUN to discover the public
// ip:port a NAT has assigned. p2pt constructs itself with
// `_rtcConfig = { iceServers: [] }` and hands that to every peer it creates,
// OVERRIDING simple-peer's own STUN defaults, so without this list an offer
// carries `typ host` candidates only -- which is all two tabs on one machine
// or two players on a LAN ever need, and nothing across the internet.
//
// STUN is not sufficient in general: two symmetric NATs need a TURN relay, and
// there is no free public one to point at. `chrome://webrtc-internals` during
// a join is how to tell the two apart -- an `srflx` candidate means STUN
// worked, and no selected candidate pair after that means TURN is what is
// missing.
export const ICE_SERVERS = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:global.stun.twilio.com:3478'] },
];

// The one identifier. It is hashed into a torrent info-hash and announced to
// PUBLIC trackers, so it must not collide with another project's: namespace it
// and version it, because the frame layout below is a wire protocol shared
// with every other copy of this game on the internet.
export const SWARM_ID = 'nfm-v1';

// Room codes are typed and read aloud, so no 0/O or 1/I/l.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

// Frame tags. One DataChannel carries every kind of traffic, so the first byte
// says which. 0x5E ('^') is p2pt's own JSON framing -- we never send it, and we
// ignore anything wearing it, so the two layers cannot be confused.
//
// TAG_DIR is swarm-wide and carries no room: the game list, and the 'find'
// query that turns a typed code into a peer. The other two are addressed to a
// room, which is what lets one connection serve the lobby you are in, the race
// you are running, and the list you are still browsing.
export const TAG_DIR = 0x01;
export const TAG_STATE = 0x02;
export const TAG_MSG = 0x03;

// How long to look for a room by CODE before giving up. Only the typed-code
// path waits at all -- clicking a listed game is a message to a peer already
// connected -- and a code typed one character wrong must say so rather than
// hang forever.
const JOIN_TIMEOUT_MS = 20000;

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
 * Build a p2pt on an identifier, with the identifier's hash already resolved.
 *
 * NOT a convenience wrapper. `new P2PT(urls, id)` calls an ASYNC
 * `setIdentifier()` and does not await it, and `start()` awaits the hash
 * PROMISE rather than that method -- so `_infoHashBinary`, which the announce
 * actually reads, is still undefined when the first announce is assembled. It
 * gets away with that whenever the websocket has to be opened first, because
 * the announce is deferred to the socket's `connect` and the hash lands long
 * before; it does NOT get away with it when the socket is already open.
 *
 * Only one swarm exists now, so nothing in this file trips it any more. Keep
 * it anyway: the cost is one await, and the failure mode is a tracker
 * destroyed for minutes (see the header) rather than anything that looks like
 * a bug in our code.
 */
export async function makeP2PT(identifier) {
  const P2PT = await loadP2PT();
  const p2 = new P2PT(TRACKERS);
  // Read when a peer is created, so it must be set before the first announce.
  p2._rtcConfig = { iceServers: ICE_SERVERS };
  await p2.setIdentifier(identifier);
  return p2;
}

/**
 * Tag a payload, and address it to a room if it belongs to one.
 *
 * Binary is checked FIRST and deliberately: a Uint8Array is `typeof 'object'`,
 * so an object test written first JSON-stringifies every state packet into
 * `{"0":12,"1":88,...}`. It still sends, still arrives and still parses as a
 * frame -- `decodePacket` merely returns null and the race runs on dead
 * reckoning forever, with the lobby and chat working perfectly throughout.
 */
export function frame(tag, payload, room = '') {
  const body = ArrayBuffer.isView(payload) ? payload
    : new TextEncoder().encode(typeof payload === 'string' ? payload : JSON.stringify(payload));
  const label = tag === TAG_DIR ? new Uint8Array(0) : new TextEncoder().encode(room);
  const head = tag === TAG_DIR ? 1 : 2 + label.length;
  const out = new Uint8Array(head + body.length);
  out[0] = tag;
  if (tag !== TAG_DIR) {
    out[1] = label.length;
    out.set(label, 2);
  }
  out.set(body, head);
  return out;
}

/** Split a frame back into `{ tag, room, body }`, or null if it is not ours. */
export function unframe(bytes) {
  if (!bytes.length) return null;
  const tag = bytes[0];
  if (tag === TAG_DIR) return { tag, room: '', body: bytes.subarray(1) };
  if (tag !== TAG_STATE && tag !== TAG_MSG) return null;
  const n = bytes[1];
  if (bytes.length < 2 + n) return null;
  return {
    tag,
    room: new TextDecoder().decode(bytes.subarray(2, 2 + n)),
    body: bytes.subarray(2 + n),
  };
}

export const asBytes = (d) => (d instanceof ArrayBuffer ? new Uint8Array(d)
  : ArrayBuffer.isView(d) ? new Uint8Array(d.buffer, d.byteOffset, d.byteLength)
  : new TextEncoder().encode(String(d)));

const json = (bytes) => {
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { return null; }        // a peer sending garbage is not ours to crash on
};

/**
 * The swarm: one p2pt, every peer, and the demultiplexer.
 *
 * A module singleton because it is a property of the PAGE, not of a room: the
 * launcher browses, hosts and races without ever leaving it, and a second
 * instance would reintroduce the pooled-socket bug described at the top.
 */
class Mesh {
  constructor() {
    this.p2 = null;
    this.starting = null;
    /** peer id -> the most recent peer object p2pt gave us for it. */
    this.peers = new Map();
    /** Rooms we are in: code -> NetPeer. */
    this.rooms = new Map();
    /** Swarm-wide (TAG_DIR) listeners: (msg, peerId) => void. */
    this.dirHandlers = new Set();
    /** New-peer listeners: (peerId) => void. */
    this.peerHandlers = new Set();
    /**
     * Once a race starts we stop announcing and refuse everyone outside it.
     * null means open. See `lock()`.
     */
    this.allowed = null;
  }

  /** Join the swarm. Idempotent, and safe to call from several places at once. */
  start() {
    if (this.starting) return this.starting;
    this.starting = (async () => {
      const p2 = await makeP2PT(SWARM_ID);
      p2.on('peerconnect', (peer) => this.#add(peer));
      p2.on('peerclose', (peer) => this.#drop(peer));
      p2.on('data', (peer, raw) => this.#recv(peer, asBytes(raw)));
      // A tracker warning is NOT a failure: p2pt announces on several trackers
      // and one refusing costs nothing while another answers. Surfacing these
      // to the player put a raw library error on screen at the exact moment
      // they pressed Host, which reads as the room having failed to open.
      p2.on('trackerwarning', (err) => console.warn('tracker:', err?.message || err));
      p2.on('warning', (err) => console.warn('tracker:', err?.message || err));
      p2.on('error', (err) => console.warn('swarm:', err?.message || err));
      // Resolves when a tracker has taken our announce, which is the point at
      // which other peers can find us. It is NOT a peer connection.
      const announced = new Promise((resolve) => p2.once('trackerconnect', resolve));
      this.p2 = p2;
      p2.start();
      await announced;
      return p2;
    })();
    return this.starting;
  }

  #add(peer) {
    if (this.allowed && !this.allowed.has(peer.id)) {
      // Racing. A stranger that finds us mid-race is nothing to us, and a
      // connection we do not use is bandwidth we cannot afford.
      try { peer.destroy(); } catch { /* already gone */ }
      return;
    }
    // p2pt can hand the same peer id back on a different channel (one per
    // tracker that reported it), so a second sighting REPLACES the object we
    // send through and is not a new peer.
    const known = this.peers.has(peer.id);
    this.peers.set(peer.id, peer);
    if (known) return;
    for (const fn of this.peerHandlers) fn(peer.id);
  }

  #drop(peer) {
    if (!this.peers.delete(peer.id)) return;
    for (const room of this.rooms.values()) room._peerGone(peer.id);
    for (const fn of this.peerHandlers) fn(peer.id, true);
  }

  #recv(peer, bytes) {
    const f = unframe(bytes);
    if (!f) return;
    if (f.tag === TAG_DIR) {
      const msg = json(f.body);
      if (msg) for (const fn of this.dirHandlers) fn(msg, peer.id);
      return;
    }
    // Traffic for a room we are not in is not an error: everyone on the swarm
    // is in somebody's lobby, and this is how a frame stays addressed without
    // a second connection per room.
    this.rooms.get(f.room)?._recv(f.tag, f.body, peer.id);
  }

  /**
   * The live channel for a peer.
   *
   * p2pt keeps every channel it has for an id and any one of them may have
   * died, so fall back to a sibling rather than sending into a closed one.
   */
  #live(id) {
    const peer = this.peers.get(id);
    if (!peer) return null;
    if (peer.connected) return peer;
    for (const alt of Object.values(this.p2?.peers?.[id] || {})) {
      if (alt.connected) return alt;
    }
    return null;
  }

  send(id, bytes) {
    const peer = this.#live(id);
    if (!peer) return;
    try {
      peer.send(bytes);
    } catch {
      // A send failing mid-race must not take the frame loop down with it; the
      // next tick's packet supersedes this one anyway.
    }
  }

  broadcast(bytes) {
    for (const id of this.peers.keys()) this.send(id, bytes);
  }

  /** Everyone we are connected to, in no particular order. */
  ids() {
    return [...this.peers.keys()];
  }

  /**
   * Bound the mesh to the players in one race.
   *
   * Stops announcing (`setInterval(0)` clears the timer without setting a new
   * one) so no new peer is handed our offers, and drops the ones we are not
   * racing. Existing connections and the trackers' sockets are untouched --
   * the race must survive every tracker going away, which it does, because by
   * now the trackers have nothing left to do.
   */
  lock(ids) {
    this.allowed = new Set(ids);
    for (const t of Object.values(this.p2?.trackers || {})) {
      try { t.setInterval(0); } catch { /* tracker already destroyed */ }
    }
    for (const [id, peer] of this.peers) {
      if (this.allowed.has(id)) continue;
      this.peers.delete(id);
      try { peer.destroy(); } catch { /* already gone */ }
    }
  }
}

export const mesh = new Mesh();

/**
 * One end of a session, scoped to one room.
 *
 * `conns` is the room's members, in the order they joined, and an index into
 * it is what `from` means in every callback. On the host that order is join
 * order, so it is also what maps a guest to the slot it was given; the caller
 * records the mapping rather than assuming it, because on a GUEST the array is
 * seeded from the host's roster and holds the host and the other guests mixed
 * together.
 *
 * Membership is EXPLICIT, and that is the point of the rewrite: a guest is a
 * member because the host seated it, not because it happens to be on the
 * swarm. Without that, a lobby broadcast would go to every browser idling on
 * the multiplayer screen.
 */
export class NetPeer {
  constructor({ onData, onMessage, onStatus, onClose } = {}) {
    /** @type {(bytes:Uint8Array, from:number) => void} state frames. */
    this.onData = onData || (() => {});
    /**
     * @type {(msg:any, from:number) => void} lobby/chat frames.
     *
     * An ACCESSOR, because messages arrive before anyone is listening. A guest
     * greets the moment it is seated, which can be while the host is still
     * inside `openRoom()` and has not built its Lobby yet -- and a greeting is
     * sent ONCE, so dropping it strands that player permanently: it never gets
     * a slot, keeps localIndex -1, and its chat goes out as slot 0, which is
     * the host's. That presents as the host seeing its own name on someone
     * else's line. Early messages are queued and delivered when a handler is
     * attached.
     */
    this._onMessage = onMessage || null;
    this._earlyMsgs = [];
    /** @type {(from:number) => void} a peer joined the room. */
    this.onPeer = null;
    this.onStatus = onStatus || (() => {});
    this.onClose = onClose || (() => {});
    /** Room members' peer ids, in join order. Index = the `from` of a frame. */
    this.conns = [];
    this.byId = new Map();
    this.code = null;
    this.localIndex = 0;
    this.open = false;
    this.isHost = false;
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

  #status(s) {
    this.onStatus(s);
  }

  /** Seat a peer in this room, or return the index it already has. */
  #member(id) {
    let idx = this.byId.get(id);
    if (idx !== undefined) return idx;
    idx = this.conns.length;
    this.byId.set(id, idx);
    this.conns.push(id);
    this.open = true;
    this.#status(`connected to ${this.conns.length} peer(s)`);
    this.onPeer?.(idx);
    return idx;
  }

  /** Called by the mesh when a frame for this room arrives. */
  _recv(tag, body, id) {
    // Only members are heard. The one exception is the host taking a 'hello'
    // from a peer it has not seated yet -- that IS the request to be seated,
    // and it is how join-by-listing works with no prior exchange at all.
    let from = this.byId.get(id);
    if (from === undefined) {
      if (!this.isHost || tag !== TAG_MSG) return;
      const msg = json(body);
      if (msg?.t !== 'hello') return;
      from = this.#member(id);
      if (this._onMessage) this._onMessage(msg, from);
      else this._earlyMsgs.push([msg, from]);
      return;
    }
    if (tag === TAG_STATE) { this.onData(body, from); return; }
    const msg = json(body);
    if (!msg) return;
    if (this._onMessage) this._onMessage(msg, from);
    else this._earlyMsgs.push([msg, from]);
  }

  /** Called by the mesh when a peer leaves the swarm entirely. */
  _peerGone(id) {
    const idx = this.byId.get(id);
    if (idx === undefined) return;
    this.onClose('peer left the room', idx);
  }

  /**
   * Host: open a room.
   *
   * Local except for being on the swarm at all: there is no second rendezvous
   * to wait for, which is the whole point. Guests arrive by sending a 'hello'
   * addressed to this room.
   */
  async openRoom(code = makeRoomCode()) {
    this.isHost = true;
    this.localIndex = 0;
    this.code = code;
    mesh.rooms.set(code, this);
    // Answer the swarm's 'find' query. Only the host answers, so a code that
    // nobody is hosting produces silence and the asker's timeout, rather than
    // a wrong answer from someone who merely saw the room listed.
    this._answerFind = (msg, id) => {
      if (msg?.t === 'find' && msg.code === code) {
        mesh.send(id, frame(TAG_DIR, { t: 'here', code }));
      }
    };
    mesh.dirHandlers.add(this._answerFind);
    await mesh.start();
    this.#status(`room ${code} open — waiting for players`);
    return code;
  }

  /**
   * Guest: join a room.
   *
   * `hostId` is the peer that advertised it, which the game list already knows
   * -- then this is pure bookkeeping and completes in microseconds. Without
   * one (a typed code, or a `?room=` link) we ask the swarm: 'find' goes to
   * everyone we are connected to and to everyone we meet afterwards, and the
   * room's host answers 'here'.
   */
  async join(code, hostId = null) {
    this.isHost = false;
    this.localIndex = -1;                     // "not the host" until slotted
    this.code = code;
    mesh.rooms.set(code, this);
    this.#status(`looking for room ${code}...`);
    await mesh.start();

    const id = hostId || await this.#find(code);
    this.#member(id);
    this.#status('connected');
    return id;
  }

  /** Ask the swarm who is hosting `code`. Resolves with that peer's id. */
  #find(code) {
    return new Promise((resolve, reject) => {
      const ask = frame(TAG_DIR, { t: 'find', code });
      const onDir = (msg, id) => {
        if (msg?.t !== 'here' || msg.code !== code) return;
        done();
        resolve(id);
      };
      // A host we have not met yet is the normal case for a typed code: we
      // announced seconds ago and the swarm is still introducing us.
      const onPeer = (id, gone) => { if (!gone) mesh.send(id, ask); };
      // And re-ask on a timer, because the host may not be listening YET: a
      // rematch has both sides reloading the launcher and reopening the same
      // room, so whoever gets back first asks into an empty swarm.
      const again = setInterval(() => mesh.broadcast(ask), 2000);
      const timer = setTimeout(() => {
        done();
        reject(new Error(`no room ${code} found — check the code`));
      }, JOIN_TIMEOUT_MS);
      const done = () => {
        clearTimeout(timer);
        clearInterval(again);
        mesh.dirHandlers.delete(onDir);
        mesh.peerHandlers.delete(onPeer);
      };
      mesh.dirHandlers.add(onDir);
      mesh.peerHandlers.add(onPeer);
      mesh.broadcast(ask);
    });
  }

  /**
   * Guest: adopt the membership the host published.
   *
   * A guest cannot discover the room's other guests for itself -- everyone on
   * the swarm looks alike from here -- so the roster carries their peer ids and
   * this is what turns them into somewhere to send state. Called on every
   * roster, so a player who joins later is picked up without a second path.
   */
  setMembers(ids) {
    for (const id of ids) {
      if (id && id !== mesh.p2?._peerId) this.#member(id);
    }
  }

  /** The peer id we send to for a given room index, for publishing a roster. */
  idOf(i) {
    return this.conns[i] ?? null;
  }

  /**
   * Our own peer id.
   *
   * The host publishes it in the roster so every client can build the same
   * slot-to-peer map, which is what turns "a connection dropped" into "slot 3
   * disconnected" -- room indices differ per client and cannot carry that.
   */
  selfId() {
    return mesh.p2?._peerId ?? null;
  }

  #raw(idx, bytes) {
    const id = this.conns[idx];
    if (!this.open || !id) return;
    mesh.send(id, bytes);
  }

  /** Send state to every member. */
  send(data) {
    const f = frame(TAG_STATE, data, this.code);
    for (let i = 0; i < this.conns.length; i++) this.#raw(i, f);
  }

  /** Send state to one member. */
  sendTo(i, data) {
    this.#raw(i, frame(TAG_STATE, data, this.code));
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
    const f = frame(TAG_MSG, data, this.code);
    if (i !== undefined) { this.#raw(i, f); return; }
    for (let n = 0; n < this.conns.length; n++) this.#raw(n, f);
  }

  /**
   * Wait for what we have sent to actually leave, up to `ms`.
   *
   * Matters exactly once: the goodbye sent on the way out of a race, where the
   * page reloads immediately afterwards. `send()` only queues into the
   * DataChannel, so a reload can take the connection down with the message
   * still in the buffer -- and losing THAT message is what leaves the other
   * players waiting on a car nobody will ever transmit again.
   */
  async flush(ms = 250) {
    const deadline = Date.now() + ms;
    for (;;) {
      let pending = 0;
      for (const id of this.conns) {
        const ch = mesh.peers.get(id)?._channel;
        pending += ch?.bufferedAmount || 0;
      }
      if (!pending || Date.now() > deadline) return;
      await new Promise((r) => setTimeout(r, 20));
    }
  }

  /**
   * The race is starting: nobody else is coming, and nobody outside it matters.
   * See `Mesh.lock()`.
   */
  lock() {
    mesh.lock(this.conns);
  }

  /** Leave the room. The swarm itself stays up; the page is still using it. */
  close() {
    this.open = false;
    if (this._answerFind) mesh.dirHandlers.delete(this._answerFind);
    if (this.code) mesh.rooms.delete(this.code);
  }
}
