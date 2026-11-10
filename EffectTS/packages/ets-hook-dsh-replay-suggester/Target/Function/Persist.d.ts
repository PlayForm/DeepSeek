import type Entry from "../Interface/Entry.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Persist
 *
 * The durable write of one recorded call (Function/Persist): the storage
 * domain when it is open, the JSON fallback otherwise.
 *
 * @remarks
 * Serialised on the store chain by Function/Record, so two calls in one turn
 * can never interleave their writes, and the smokes' Flush seam sees every
 * write.
 *
 * THE DOMAIN WRITE: put the entry under its `seq` key, then prune the oldest
 * keys so the table never exceeds `historyDepth` (the ring's bound is the
 * store's bound - a bounded store, not a growing log). The meta timestamp is
 * rewritten on every write (the snapshot marker, the pattern precedent).
 *
 * THE LEDGER: one byte-exact line per recorded call -
 * `recorded <intent> <path> (<n> in store)` - so the producer's work is
 * measurable from the ledger alone. The count is the mirror's length AFTER
 * the append (the bounded size, never the lifetime total).
 */
declare function _default(
/** The plugin state (the handle, the mirror, the record path, the ledger). */
State: State, 
/** The entry just recorded (its intent is final by now). */
Entry_: Entry, 
/** The bounded store size right after this append (captured at record time). */
Size: number): Promise<void>;
