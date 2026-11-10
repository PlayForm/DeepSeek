import type Stamp from "../Interface/Stamp.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Record
 *
 * The stamp write path: one recorded stamp updates the in-memory latest map
 * and the bounded ring, then persists both into the domain fire-and-forget.
 *
 * @remarks
 *
 * The caller is the SYNCHRONOUS listener - no awaits anywhere.
 *
 * - `State.Latest` is keyed by the path: the newest stamp per path overwrites
 *   the previous one (the latest-stamp-is-the-record rule).
 * - `State.Ring` keeps every stamp up to `State.MaxStamps`; the oldest is
 *   DROPPED (shifted) when the bound is exceeded and the drop is ledgered as
 *   `capped <path> (maxStamps <n>)` with the dropped stamp's path - never
 *   silently discarded.
 * - Persistence (only when the domain is open): the latest record is PUT
 *   under its path in the `stamps` table, the ring snapshot is PUT under the
 *   meta key `__ring` in the `ring` table. Every put is
 *   `void .catch(() => {})` - a storage failure can never reach the listener's
 *   synchronous path.
 */
declare function _default(State: State, Stamp: Stamp): void;
