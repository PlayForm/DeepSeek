// Deepen - the deepener registry (Function/Deepen): one deepener entry per
// extension it owns, keyed by the lowercased dotted extension. The registry is
// SILENT on purpose - the byte-exact `adapters registered (N extensions)` line
// counts the adapter registry only, and the deepener is an answer quality, not
// a file-type registration; the evidence that a deepener answered is the
// `deepened <path> (<n> references via <name>)` line on the resolve path.
// Re-registering an extension REPLACES the deepener (the last registration
// wins).
import type Deepening from "@Interface/Deepening.js";
import type State from "@Interface/State.js";

export default (State: State, Deepening: Deepening): void => {
	for (const Extension of Deepening.extensions) {
		State.Deepenings.set(Extension.toLowerCase(), Deepening);
	}
};
