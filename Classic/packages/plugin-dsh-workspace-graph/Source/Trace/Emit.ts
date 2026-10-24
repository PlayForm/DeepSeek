// Emit - the graph's trace emission: resolve the family's bus through the
// context probe (`ctx.get("trace")`, the factory's optional-service posture -
// the graph does not inject the factory) and publish one draft. The bus is
// OPTIONAL: an absent service, an unmounted factory or a throwing probe is a
// silent skip - the graph's own work (the store, the ledger) is already done
// and a trace failure can never reach it.
import type State from "@Interface/State.js";
import { Names, type Adapter, type Draft } from "@playform/lib-dsh-trace";

export default (StateRef: State, Draft: Draft): void => {
	try {
		const Trace = (StateRef.Context as unknown as { get?: (Name: string) => unknown }).get?.(
			Names.service,
		) as Adapter | undefined;
		Trace?.emit(Draft);
	} catch {
		/* the trace is optional - the graph's work is already done */
	}
};
