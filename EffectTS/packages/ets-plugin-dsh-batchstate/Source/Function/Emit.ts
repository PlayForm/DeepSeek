// Emit - the batch/state-change emission (Function/Emit): the plan's
// broadcast event (BATCH-STATE-PLUGIN.md section 2.1). Emitted AFTER the
// state is updated and persisted; the consumers are the splice trigger and
// ANY agent listening. Contained: a failed emission is swallowed (the
// family's silence invariant - a dead listener can never break a state
// change), the failure is logged best-effort.
import type Change from "@Interface/Change.js";
import type State from "@Interface/State.js";

export default (State: State, Change: Change): void => {
	try {
		State.Context.emit("batch/state-change", Change);
	} catch (Cause) {
		try {
			State.Context.logger.warn(
				`${State.Module}: emit failed (${
					Cause instanceof Error ? Cause.message : String(Cause)
				})`,
			);
		} catch {
			/* even the failure log is best-effort */
		}
	}
};
