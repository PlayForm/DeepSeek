// Adapter - the graph's trace adapter (D5: the graph is the indexer's first
// consumer): it subscribes to `observe/stamp` on the family's bus, builds the
// ONE detached loop (the library's Loop: a coalescing queue keyed by path, one
// in-flight task per key, no timers, fail-open) whose run is the existing
// per-file entry (Function/Reindex -> Function/Index), and registers the
// disposer on the fiber effect so an unload drops the subscription and the
// loop.
//
// Wired ONCE from the service constructor and ONLY when the graph is enabled
// at construction: a disabled graph wires nothing at all (the IDLE-forever
// posture).
//
// THE BUS IS PROBED, NOT INJECTED: the service is provided by
// @playform/ets-plugin-dsh-factory, which the graph's package already depends on
// but does not inject (the loader contract's `inject` list stays
// ["fs", "storage"] - the graph's direct-construction smokes and its
// standalone use are unchanged). The factory's bundle must load first (the
// family's dependency-order rule: the hooks wait for the factory's services).
// The probe runs first; when the service is not there yet, the adapter binds
// through `ctx.inject(["trace"], ...)` - the loader's late-binding form - so a
// slower factory still wires the graph instead of leaving it deaf. Without a
// bus at all, the graph wires nothing rather than guessing.
import Reindex from "@Function/Reindex.js";
import type State from "@Interface/State.js";
import { Loop, Names, type Adapter, type Envelope } from "@playform/ets-lib-dsh-trace";

import Consume from "./Consume.js";

/** The structural view of the two seams the adapter uses (the fake ctx
 *  provides them optionally; the real context always does). */
interface Seams {
	get?: (Name: string) => unknown;
	inject?: (Names: string[], Setup: (Context: Seams) => void) => unknown;
	effect?: (Setup: () => () => void, Label?: string) => unknown;
}

export default (StateRef: State): void => {
	const Context = StateRef.Context as unknown as Seams;
	/** Wire the bus on the context that owns the subscription (the graph's
	 *  fiber, or the injected sub-fiber when the bus arrived late). */
	const Attach = (Trace: Adapter, Owner: Seams): void => {
		StateRef.Loop = Loop((Path: string) => Reindex(StateRef, Path));
		const Dispose = Trace.on(Names.observe, (Envelope: Envelope) =>
			Consume(StateRef, Envelope),
		);
		Owner.effect?.(
			() => () => {
				Dispose();
				StateRef.Loop?.Dispose();
			},
			"graph-trace",
		);
	};
	try {
		const Trace = Context.get?.(Names.service) as Adapter | undefined;
		switch (true) {
			case Trace !== undefined:
				Attach(Trace, Context);
				return;
			default:
		}
		Context.inject?.([Names.service], (Sub: Seams) => {
			const Late = (Sub.get?.(Names.service) ?? (Sub as { trace?: unknown }).trace) as
				Adapter | undefined;
			switch (true) {
				case Late === undefined:
					return;
				default:
			}
			Attach(Late, Sub);
		});
	} catch {
		/* the trace is optional - a probe failure wires nothing */
	}
};
