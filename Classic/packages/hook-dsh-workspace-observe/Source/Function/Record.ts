// Record - the stamp write path (Function/Record): one recorded stamp
// updates the in-memory latest map and the bounded ring, then persists both
// into the domain fire-and-forget (the caller is the SYNCHRONOUS listener -
// no awaits anywhere).
//
//   * `State.Latest` is keyed by the path: the newest stamp per path
//     overwrites the previous one (the latest-stamp-is-the-record rule).
//   * `State.Ring` keeps every stamp up to `State.MaxStamps`; the oldest is
//     DROPPED (shifted) when the bound is exceeded and the drop is ledgered
//     as `capped <path> (maxStamps <n>)` with the dropped stamp's path -
//     never silently discarded.
//   * Persistence (only when the domain is open): the latest record is PUT
//     under its path in the `stamps` table, the ring snapshot is PUT under
//     the meta key `__ring` in the `ring` table. Every put is
//     `void .catch(() => {})` - a storage failure can never reach the
//     listener's synchronous path.
import type Stamp from "@Interface/Stamp.js";
import type State from "@Interface/State.js";

import Adapter from "../Trace/Adapter.js";

export default (State: State, Stamp: Stamp): void => {
	State.Latest.set(Stamp.path, Stamp);
	State.Ring.push(Stamp);
	while (State.Ring.length > State.MaxStamps) {
		const Dropped = State.Ring.shift();
		if (Dropped !== undefined) {
			State.Factory.Append(State, `capped ${Dropped.path} (maxStamps ${State.MaxStamps})`);
		}
	}
	try {
		const Handle = State.Handle;
		if (Handle !== undefined) {
			void Handle.table("stamps")
				.put(Stamp.path, Stamp)
				.catch(() => {
					/* record writes best-effort */
				});
			void Handle.table("ring")
				.put("__ring", [...State.Ring])
				.catch(() => {
					/* record writes best-effort */
				});
		}
	} catch {
		/* storage optional - never on the listener's path */
	}
	// The trace emission (D5: the observe hook is the indexer's first source):
	// one `observe/stamp` per recorded stamp, after the ledger line and the KV
	// write are final. The adapter is contained and the bus is optional (an
	// absent service emits nothing), so the synchronous recorder's discipline
	// is unchanged.
	Adapter(State, Stamp);
};
