import type Line from "@Interface/Line.js";
import type State from "@Interface/State.js";
import { Capped, Ring } from "@playform/lib-dsh-core";

/**
 * @module Record
 *
 * The audit line write path: one recorded line updates the in-memory chain
 * map and the bounded ring, then persists both into the domain
 * fire-and-forget.
 *
 * @remarks
 *
 * The listener is a synchronous recorder; the service's async path awaits the
 * first put via Write.
 *
 * - `State.Chains` is keyed by the operation ID: the lines of one operation,
 *   in recording order (the chain view).
 * - `State.Ring` keeps every line up to `State.MaxLines`; the oldest is
 *   DROPPED (shifted) when the bound is exceeded and the drop is ledgered as
 *   `capped <id> (maxLines <n>)` - never silently discarded. The ring
 *   mechanics and the `capped` line live in the core (`Ring`, `Capped` in
 *   `@playform/lib-dsh-core`); this file supplies the chain map and the
 *   persistence puts.
 * - Persistence (only when the domain is open): the line is PUT under its id
 *   in the `lines` table, the ring snapshot is PUT under the meta key
 *   `__ring` in the `ring` table. Every put is `void .catch(() => {})` - a
 *   storage failure can never reach the listener's synchronous path.
 */
export default (State: State, Entry: Line): void => {
	const Chain = State.Chains.get(Entry.operation) ?? [];
	Chain.push(Entry);
	State.Chains.set(Entry.operation, Chain);
	const Dropped = Ring(State.Ring, Entry, State.MaxLines);
	switch (true) {
		case Dropped !== undefined:
			State.Factory.Append(State, Capped(Dropped.id, "Lines", State.MaxLines));
			break;
	}
	try {
		const Handle = State.Handle;
		if (Handle !== undefined) {
			void Handle.table("lines")
				.put(Entry.id, Entry)
				.catch(() => {
					/* line writes best-effort */
				});
			void Handle.table("ring")
				.put("__ring", [...State.Ring])
				.catch(() => {
					/* ring write best-effort */
				});
		}
	} catch {
		/* storage optional - never on the listener's path */
	}
};
