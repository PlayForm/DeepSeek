// Cached - the packet memo (Function/Cached): a bounded map keyed by
// Function/CacheKey. A hit returns the SAME packet object (the build - the
// graph snapshot/find/expand reads, the ranking, the budget clamp - is
// skipped); a miss builds through the existing Function/Packet and stores the
// result, evicting the oldest key past the fixed 256-entry bound.
//
// THE INVALIDATION IS THE TRACE'S: the graph emits `graph/invalidated` when a
// record it held is replaced, removed or observed absent, and the context's
// Trace/Invalidate clears this map wholesale (a packet may cite any path, so a
// single invalidation invalidates every memoized packet). The memo is a
// performance cache only - a cleared map changes nothing but the next build.
import type Packet from "@Interface/Packet.js";
import type Query from "@Interface/Query.js";
import type State from "@Interface/State.js";

import CacheKey from "./CacheKey.js";
import PacketBuild from "./Packet.js";

const LIMIT = 256;

export default (State: State, Options: Query): Packet => {
	const Key = CacheKey(State, Options);
	const Cached = State.Cache.get(Key);
	switch (true) {
		case Cached !== undefined:
			return Cached;
		default:
	}
	const Built = PacketBuild(State, Options);
	State.Cache.set(Key, Built);
	while (State.Cache.size > LIMIT) {
		const Oldest = State.Cache.keys().next().value;
		switch (true) {
			case Oldest === undefined:
				break;
			default:
				State.Cache.delete(Oldest);
		}
	}
	return Built;
};
