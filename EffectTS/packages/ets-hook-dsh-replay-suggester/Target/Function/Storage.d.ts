import type State from "../Interface/State.js";
export default _default;
/**
 * @module Storage
 *
 * The storage-domain open and recovery (Function/Storage), the PRIMARY tier of
 * the recall store.
 *
 * @remarks
 *
 * THE DOMAIN: `replay_history`, version 1, per-record layout,
 * backup-and-skip invalid records, and NO `compatibleVersions` - the library
 * rejects an entry that is not strictly BELOW the declared version, so `[1]`
 * against version 1 throws at load (the family's learned rule). TWO tables:
 * - `history` - one record per entry: key `String(seq)`, value the Entry;
 * - `meta` - ONE record `__savedAt`: the snapshot timestamp.
 *
 * The recovery lands in the SAME Function/Restore the JSON fallback uses, so
 * the byte-exact `store recovered <n> entries (<source>)` line, the newest-N
 * bound and the malformed-row skip are identical on both tiers.
 *
 * Best-effort and detached (the family's P5-style posture): the open runs on
 * the store chain from Apply, and every failure is contained here. A PRESENT
 * facility whose open fails is LOUD: one best-effort ledger line
 * `store open failed: <reason>`, then the JSON fallback recovers (the
 * documented degraded store) - never rethrown.
 *
 * The dynamic imports keep the optional storage packages off the module-load
 * path (a module-level import of an unresolvable package would crash the
 * whole bundle load - the factory's live-verified pitfall).
 */
declare function _default(
/**
 * The plugin state (the mirror, the handle, the ledger).
 */
State: State, 
/**
 * The probed storage facility (ctx.storage.domain or ctx.storageDomain).
 */
Facility: unknown): Promise<void>;
