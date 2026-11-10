import type { Context } from "@deepseek-ai/cordis";
import type HostTrace from "@Interface/Trace.js";
import type { PanelEnvelope } from "@Interface/Trace.js";

/**
 * @module Trace
 *
 * The host panel's trace adapter: the optional `trace` bus of the surrounding context, re-exposed
 * as the package's own `HostTrace` surface.
 *
 * @remarks
 *
 * The function resolves `ctx.get("trace")` and validates it with `IsBus`: a candidate is a bus when
 * it is a non-null object with an `on` function. Anything else yields `undefined`, so the panel
 * host degrades to no trace rather than throwing.
 *
 * The adapter wraps the bus in two methods: `on` forwards the kind and the listener and lets the
 * bus's own unsubscribe return propagate, while `ring` calls the bus's optional `ring` when it is
 * a function and returns an empty `PanelEnvelope[]` otherwise, so a bus without a ring buffer is
 * not a failure.
 */
type Bus = {
	on(kind: string, listener: (envelope: PanelEnvelope) => void): () => void;
	ring?(limit?: number): PanelEnvelope[];
};

const IsBus = (Candidate: unknown): Candidate is Bus =>
	typeof Candidate === "object" &&
	Candidate !== null &&
	typeof (Candidate as Bus).on === "function";

export default function Trace(ctx: Context): HostTrace | undefined {
	const Bus = ctx.get("trace");
	switch (true) {
		case !IsBus(Bus):
			return undefined;
		default:
			return {
				on: (kind, listener) => Bus.on(kind, listener),
				ring: (limit) => (typeof Bus.ring === "function" ? Bus.ring(limit) : []),
			};
	}
}
