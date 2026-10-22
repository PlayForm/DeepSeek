// Focus - the caller's focus tracker (Function/Focus): remember the last
// focus per caller so the staleness contract ("the version the caller held,
// if it differs") can compare a later packet against the version the caller
// last saw. The map is per-apply state, bounded by the same maxWatch-style
// discipline: the oldest caller entry is dropped when the map exceeds 256
// callers (a fixed implementation bound, recorded here, not a config knob).
import type State from "@Interface/State.js";

const CALLER_LIMIT = 256;

export default (State: State, Caller: string, Id: string, Version: string): void => {
	switch (true) {
		case Caller.length === 0:
			return;
		default:
	}
	State.Focus.delete(Caller);
	while (State.Focus.size >= CALLER_LIMIT) {
		const Oldest = State.Focus.keys().next().value;
		switch (true) {
			case Oldest === undefined:
				break;
			default:
				State.Focus.delete(Oldest);
		}
	}
	State.Focus.set(Caller, { id: Id, version: Version });
};
