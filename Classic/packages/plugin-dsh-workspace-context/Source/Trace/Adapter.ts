import type State from "@Interface/State.js";
import { Names, type Adapter, type Envelope } from "@playform/lib-dsh-trace";

import Invalidate from "./Invalidate.js";

/**
 * @module Adapter
 *
 * The context's trace adapter (D5): consume `graph/invalidated` to
 * invalidate the packet memo.
 *
 * @remarks
 *
 * The bus (`ctx.trace`) is provided by @playform/plugin-dsh-factory, which
 * the context already injects; the adapter resolves it through the factory's
 * probe-once `Seam` accessor (`ctx.get("trace")`), so a context without the
 * bus (a bare fixture) behaves exactly as before and subscribes to nothing.
 *
 * Wired from apply on EVERY mount (the live disabled posture: the consumer
 * answers the disabled posture at call time - `Trace/Invalidate` reads
 * State.On when the event arrives), and the subscription is registered on the
 * fiber effect so an unload drops it.
 */
export default (State: State): void => {
	try {
		const Trace = State.Factory.Seam(State, Names.service) as Adapter | undefined;
		switch (true) {
			case Trace === undefined:
				return;
			default:
		}
		const Dispose = Trace.on(Names.invalidated, (Envelope: Envelope) =>
			Invalidate(State, Envelope),
		);
		State.Context.effect?.(() => () => Dispose(), "context-trace");
	} catch {
		/* the trace is optional - the packet still builds */
	}
};
