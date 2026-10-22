// Register - the adapter registry (Function/Register): one adapter entry per
// extension it owns, keyed by the lowercased dotted extension. The adapters
// are the any-file seam (ANY-FILE-ADAPTERS: think adapters, think graphs) -
// the default TypeScript adapter registers at apply; callers add more through
// the service's adapt(). Re-registering an extension REPLACES the adapter
// (the last registration wins) with one ledger line.
import type Adapter from "@Interface/Adapter.js";
import type State from "@Interface/State.js";

export default (State: State, Adapter: Adapter): void => {
	for (const Extension of Adapter.extensions) {
		State.Adapters.set(Extension.toLowerCase(), Adapter);
	}
	State.Factory.Append(State, `adapters registered (${State.Adapters.size} extensions)`);
};
