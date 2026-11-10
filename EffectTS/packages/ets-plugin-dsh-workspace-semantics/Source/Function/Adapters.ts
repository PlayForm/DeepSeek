import Register from "@Function/Register.js";
import type State from "@Interface/State.js";
import Catalog from "@Variable/Adapters.js";

/**
 * @module Adapters
 *
 * The opt-in any-file adapter registration: each configured NAME is resolved
 * through the catalog (Variable/Adapters) and registered.
 *
 * @remarks
 *
 * Registration goes through the same Function/Register the service's `adapt()`
 * uses, so every registration keeps its byte-exact
 * `adapters registered (N extensions)` line. The names are validated at load
 * (Function/Apply's Validate), so an unknown name never reaches this module.
 */
export default (State: State, Names: string[]): void => {
	for (const Name of Names) {
		const Adapter = (Catalog as Record<string, (typeof Catalog)[keyof typeof Catalog]>)[Name];
		switch (true) {
			case Adapter === undefined:
				// Unreachable after the load-time validation; the guard keeps a
				// hot config refresh from registering a hole.
				break;
			default:
				Register(State, Adapter);
		}
	}
};
