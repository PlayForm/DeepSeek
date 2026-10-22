// Record - the binding write path (Function/Record): one recorded binding
// updates the in-memory by-id map and the bounded ring, then persists both
// into the domain fire-and-forget.
//
//   * `State.ById` is keyed by the binding id: the newest version of a
//     binding (a decision update) replaces the previous one in place.
//   * `State.Ring` keeps every binding up to `State.MaxBindings`; the oldest
//     is DROPPED (shifted) when the bound is exceeded and the drop is
//     ledgered as `capped <id> (maxBindings <n>)` - never silently
//     discarded (the eviction disposition `evict`, applied FIFO).
//   * Persistence (only when the domain is open): the binding is PUT under
//     its id in the `bindings` table, the ring snapshot is PUT under the
//     meta key `__ring` in the `ring` table. Every put is
//     `void .catch(() => {})` - a storage failure can never reach the
//     caller's synchronous path.
import type Binding from "@Interface/Binding.js";
import type State from "@Interface/State.js";

export default (State: State, Binding: Binding): void => {
	State.ById.set(Binding.id, Binding);
	State.Ring.push(Binding);
	while (State.Ring.length > State.MaxBindings) {
		const Dropped = State.Ring.shift();
		if (Dropped !== undefined) {
			State.Factory.Append(State, `capped ${Dropped.id} (maxBindings ${State.MaxBindings})`);
		}
	}
	try {
		const Handle = State.Handle;
		if (Handle !== undefined) {
			void Handle.table("bindings")
				.put(Binding.id, Binding)
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
		/* storage optional - never on the caller's path */
	}
};
