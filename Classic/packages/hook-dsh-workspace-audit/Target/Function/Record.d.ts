/**
 * @module Record
 *
 * The audit line write path: one recorded line updates the in-memory chain
 * map and the bounded ring, then persists both into the domain
 * fire-and-forget.
 *
 * @remarks
 * The listener is a synchronous recorder; the service's async path awaits the
 * first put via Write.
 *
 * - `State.Chains` is keyed by the operation ID: the lines of one operation,
 *   in recording order (the chain view).
 * - `State.Ring` keeps every line up to `State.MaxLines`; the oldest is
 *   DROPPED (shifted) when the bound is exceeded and the drop is ledgered as
 *   `capped <id> (maxLines <n>)` - never silently discarded.
 * - Persistence (only when the domain is open): the line is PUT under its id
 *   in the `lines` table, the ring snapshot is PUT under the meta key
 *   `__ring` in the `ring` table. Every put is `void .catch(() => {})` - a
 *   storage failure can never reach the listener's synchronous path.
 */
import type Line from "../Interface/Line.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Entry: Line): void;
