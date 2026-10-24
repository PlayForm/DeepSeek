// Listen - the bus registration (Function/Listen): the ingester's trace
// adapter, registered from the service constructor (the class-form plugin's
// wiring point).
//
//   batch/proposed - the proposal is recorded (Function/Record);
//   batch/decision - the decision is consumed (Function/Consume), which
//                    applies the validated change through the content fence.
//
// The names are registered STRUCTURALLY (a loose `on` cast): `batch/proposed`
// and `batch/decision` are declared by the decision hook's package, which
// this package does not import (the self-contained rule). Both listeners are
// fail-open: a dead consumer can never break the emit dispatch.
import type State from "../Interface/State.js";
import Consume from "./Consume.js";
import Record from "./Record.js";

/** The listener signature the loose cast exposes. */
type Listen = (Name: string, Listener: (Payload: unknown) => void) => unknown;

export default (State: State): void => {
	const On = State.Context.on as unknown as Listen;
	On("batch/proposed", (Payload: unknown) => {
		try {
			Record(State, Payload);
		} catch {
			/* fail-open */
		}
	});
	On("batch/decision", (Payload: unknown) => {
		try {
			void Consume(State, Payload);
		} catch {
			/* fail-open */
		}
	});
};
