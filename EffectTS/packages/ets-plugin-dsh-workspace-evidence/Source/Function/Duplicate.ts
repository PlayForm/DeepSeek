// Duplicate - the repeat-event guard (Function/Duplicate): the COALESCER. A
// repeat event for the same path that carries the SAME version within the
// window on the module's clock announces a file state that was already
// processed (the version token identifies the file state), so it is dropped
// before any work: no invalidation pass, no stale marking, no storage put,
// no ledger line. A different version - or a repeat outside the window - is
// processed normally, so the LAST distinct version always wins. The clock is
// the monitor's pattern: `State.Now` (the test seam) when set, otherwise the
// wall clock; there is NO timer anywhere (the family's no-real-timers rule).
//
// The guard keeps one entry per path in `State.Seen` (the version plus the
// clock stamp of the processing). The map is capped at `Limit` with a silent
// eviction of the oldest entry: a MISSING entry always processes, so the cap
// can never skip a first sighting. The guard lives on the fs/observed
// listener only: the service's explicit `invalidate` calls are never
// coalesced.

import type State from "@Interface/State.js";

// The coalescing window in milliseconds: a repeat inside the window that
// carries the same version is dropped.
const Window = 2000;

// The seen map's entry cap (the oldest entry is evicted silently).
const Limit = 2048;

export default (State: State, Path: string, Version: string): boolean => {
	const Now = typeof State.Now === "function" ? Number(State.Now()) : Date.now();
	const Seen = State.Seen;
	const Previous = Seen.get(Path);
	switch (true) {
		case Previous !== undefined && Previous.version === Version && Now - Previous.at < Window:
			return true;
		default:
	}
	while (Seen.size >= Limit) {
		const Oldest = Seen.keys().next().value;
		switch (true) {
			case Oldest === undefined:
				break;
			default:
				Seen.delete(Oldest);
		}
	}
	Seen.delete(Path);
	Seen.set(Path, { version: Version, at: Now });
	return false;
};
