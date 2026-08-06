// Client-authoritative state sync, with host-owned AI — who owns which car,
// which packets may be applied, and how far off the prediction was.
//
// The wire format lives in `netcodec.js`. The split is by reason to change:
// that file follows the Java, this one follows the topology.
//
// THE TRUST MODEL. Every client simulates its OWN car and ships the result as
// fact. The host runs no other player's inputs through its physics and
// arbitrates nothing; it is authoritative only for the BOTS, which have no
// client of their own to speak for them. Nothing is validated anywhere, so a
// modified client can declare itself at any position on the track. That is a
// deliberate trade for a private, no-backend game between people who know each
// other. Anti-cheat would require real host authority — guests sending INPUTS
// and the host simulating every car — which costs every player but the host a
// round trip of input lag on their own car.
//
// This replaced lockstep as the netplay topology. Nothing here touches PeerJS,
// WebRTC or the DOM: what can be wrong in a subtle, race-losing way is which
// car a client is allowed to speak for and whether a packet may be applied at
// all, and that is a pure function of what has arrived. `netpeer.js` carries
// the bytes, `netcodec.js` reads them, this decides what to do with them.
//
// WHY NOT LOCKSTEP. Lockstep gates every peer on the laggiest one, needs an
// N(N-1)/2 mesh, and cannot do drop-in joins. Its one real win — the AI
// syncing for free — is worth nothing once humans fill those slots. The
// original game is state-synced (`UDPMistro.setinfo`/`readinfo`,
// `GameSparker.java:1348`), and this is a transcription of that model: each
// client is authoritative for the cars it owns, sends their absolute state
// every tick, and folds everyone else's in as it arrives.
//
// Note this EXTRAPOLATES where the textbook state-sync design interpolates:
// remote cars are simulated forward from the newest snapshot rather than
// rendered ~100ms in the past between two snapshots that have both arrived,
// which trades a visible correction on packet loss for zero added latency.
//
// WHAT THE DETERMINISM WORK BUYS HERE. Under lockstep, determinism was
// load-bearing — a single divergent bit desynced the race. Under state sync it
// is what makes dead reckoning ACCURATE: between two packets a client
// simulates the remote car with the same code and the same PRNG discipline the
// owner is using, so the correction when the packet lands is nearly zero and
// nobody sees a rubber-band. Determinism went from a correctness requirement
// to a quality-of-correction one. None of it is wasted.

/**
 * Who is allowed to speak for a car.
 *
 * Humans own their own slot. Every bot belongs to the host, which is the
 * original's rule exactly (`GameSparker.java:1348`: `if (lan && im == 0)` the
 * host runs `preform()` for each bot and `setinfo`s the result). This is the
 * whole reason state sync scales where lockstep does not — a client that falls
 * behind delays only its own car.
 */
export function ownerOf(slot, humanSlots) {
  return humanSlots.includes(slot) ? slot : humanSlots[0];
}

/**
 * How far this client's dead reckoning had drifted before the correction.
 *
 * The honest health metric for state sync, and the replacement for lockstep's
 * hash comparison: under this topology the two clients are EXPECTED to
 * disagree between packets, so a hash mismatch means nothing and drift in game
 * units means everything. Reported in position units — the stage runs to
 * ±83000, a car is ~200 across, so a drift of single digits is invisible and
 * one in the hundreds is a rubber-band the player will see.
 */
export function driftOf(rec, contO) {
  const dx = rec.nums[0] - Math.trunc(contO.x);
  const dy = rec.nums[1] - Math.trunc(contO.y);
  const dz = rec.nums[2] - Math.trunc(contO.z);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * One client's view of the session: what it owns, and what it has heard.
 *
 * Ticks are absolute and start at 0 on both machines, so "tick N" needs no
 * clock agreement — the race begins when the peers have exchanged start.
 */
export class StateSync {
  /**
   * @param localIndex  this client's slot (host 0, guest 1..)
   * @param humanSlots  every slot driven by a person, host first
   * @param nplayers    total cars, humans and bots
   */
  constructor(localIndex, humanSlots, nplayers) {
    this.localIndex = localIndex;
    this.humanSlots = humanSlots.slice().sort((a, b) => a - b);
    this.nplayers = nplayers;
    this.isHost = localIndex === this.humanSlots[0];
    // Which slots this client is authoritative for and therefore transmits.
    this.owned = [];
    for (let i = 0; i < nplayers; i++) {
      if (ownerOf(i, this.humanSlots) === localIndex) this.owned.push(i);
    }
    // slot -> the highest tick whose state has been APPLIED. An unordered
    // channel will deliver an older redundant copy after a newer one, and
    // applying it would rewind a car the simulation has already moved past.
    this.appliedTick = new Map();
    // slot -> drift measured at the last correction, for diagnostics.
    this.drift = new Map();
  }

  /** True when `slot` is somebody else's to move and we only predict it. */
  isRemote(slot) {
    return ownerOf(slot, this.humanSlots) !== this.localIndex;
  }

  /**
   * Decide whether a received record may be applied.
   *
   * Two rules, both of which have bitten this project before:
   *  - never apply a tick at or before one already applied for that slot
   *    (the stale-duplicate rule);
   *  - never apply a record for a car we own. A malformed or hostile peer
   *    claiming slot 0 would otherwise teleport the host's own car, and more
   *    mundanely a loopback in a test harness would fight the local sim.
   */
  accepts(slot, tick) {
    if (!this.isRemote(slot)) return false;
    const last = this.appliedTick.get(slot);
    return last === undefined || tick > last;
  }

  /** Record that `slot`'s state for `tick` has been folded in. */
  markApplied(slot, tick, drift) {
    this.appliedTick.set(slot, tick);
    if (drift !== undefined) this.drift.set(slot, drift);
  }

  /** Largest drift seen at the most recent correction of any car. */
  worstDrift() {
    let worst = 0;
    for (const d of this.drift.values()) if (d > worst) worst = d;
    return worst;
  }
}
