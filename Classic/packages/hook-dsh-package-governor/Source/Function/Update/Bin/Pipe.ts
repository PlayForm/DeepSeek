import type State from "@Interface/State.js";

/**
 * @module Pipe
 *
 * Handles one collected stream chunk: the ledger line (the smoke's arbiter) and, when a job
 * ring is attached (P1), the same text into the ring.
 */
export default (State: State, Text: string, Emit: ((text: string) => void) | undefined): void => {
	State.Factory.Append(State, Text);
	try {
		Emit?.(Text);
	} catch {
		/* ring append best-effort */
	}
};
