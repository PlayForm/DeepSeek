import type State from "../Interface/State.js";
import Consume from "./Consume.js";
import Record from "./Record.js";

/**
 * @module Listen
 *
 * The bus registration (Function/Listen): the ingester's trace adapter,
 * registered from the service constructor (the class-form plugin's wiring
 * point).
 *
 * @remarks
 *
 * - batch/proposed - the proposal is recorded (Function/Record);
 * - batch/decision - the decision is consumed (Function/Consume), which
 *   applies the validated change through the content fence.
 *
 * The names are registered STRUCTURALLY (a loose `on` cast): `batch/proposed`
 * and `batch/decision` are declared by the decision hook's package, which this
 * package does not import (the self-contained rule). Both listeners are
 * fail-open: a dead consumer can never break the emit dispatch.
 */
/**
 * The listener signature the loose cast exposes.
 */
type Listen = (Name: string, Listener: (Payload: unknown) => void) => unknown;

export default (State: State): void => {
	const On = State.Context.on as unknown as Listen;
	On("batch/proposed", (Payload: unknown) => {
		try {
			// THE CALL-TIME MASTER SWITCH (the LIVE DISABLED posture): the
			// volatile switch is read at the moment of the call - a disabled
			// member drops the payload with ZERO ledger lines.
			switch (true) {
				case !State.Config.enabled:
					return;
				default:
					break;
			}
			Record(State, Payload);
		} catch {
			/* fail-open */
		}
	});
	On("batch/decision", (Payload: unknown) => {
		try {
			// The same call-time gate: a disabled member applies nothing and
			// journals nothing.
			switch (true) {
				case !State.Config.enabled:
					return;
				default:
					break;
			}
			void Consume(State, Payload);
		} catch {
			/* fail-open */
		}
	});
};
