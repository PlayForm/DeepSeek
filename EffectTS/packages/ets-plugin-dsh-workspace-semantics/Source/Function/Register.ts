// Register - the adapter registry (Function/Register): one adapter entry per
// registration key it owns - the lowercased dotted EXTENSION, or the exact
// BASENAME for a file adapter (package.json). The adapters are the any-file
// seam (ANY-FILE-ADAPTERS: think adapters, think graphs) - the default
// TypeScript adapter registers at apply; callers add more through the
// service's adapt() or the config `adapters` names. Re-registering a key
// REPLACES the adapter (the last registration wins) with one ledger line; the
// count in the line is the registry size (extensions plus file names).
import type Adapter from "@Interface/Adapter.js";
import type State from "@Interface/State.js";

export default (State: State, Adapter: Adapter): void => {
	for (const Extension of Adapter.extensions) {
		State.Adapters.set(Extension.toLowerCase(), Adapter);
	}
	for (const File of Adapter.files ?? []) {
		State.Adapters.set(File, Adapter);
	}
	State.Factory.Append(State, `adapters registered (${State.Adapters.size} extensions)`);
};
