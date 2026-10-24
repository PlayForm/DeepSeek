// Adapter - the observe hook's trace adapter (D5: the first source of the
// indexer): on each recorded stamp, emit `observe/stamp` on the family's bus.
//
// THE BUS IS OPTIONAL HERE: the service (`ctx.trace`) is provided by
// @playform/ets-plugin-dsh-factory, and the hook already injects the factory - the
// adapter resolves the bus through the factory's probe-once `Seam` accessor
// (`ctx.get("trace")`), so a context without the bus (a bare fixture, an
// unmounted factory) records stamps exactly as before and emits nothing. The
// emit never throws into the recorder: the adapter is one contained call and
// the bus itself is fail-open.
import type Stamp from "@Interface/Stamp.js";
import type State from "@Interface/State.js";
import { Names, type Adapter } from "@playform/ets-lib-dsh-trace";

import Contract from "./Contract.js";

export default (State: State, Stamp: Stamp): void => {
	try {
		const Trace = State.Factory.Seam(State, Names.service) as Adapter | undefined;
		Trace?.emit(Contract(Stamp));
	} catch {
		/* the stamp is already recorded; the trace is best-effort */
	}
};
