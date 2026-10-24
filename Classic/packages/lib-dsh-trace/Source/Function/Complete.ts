// Complete - the envelope completion: fill the bus-assigned fields. The trace
// id is the bus's monotonic sequence (`trace-<n>`) unless the emitter supplied
// one (a correlated chain); `at` is the emitter's stamp when supplied, else
// the epoch-millisecond clock. No timer is ever created here - the hot path
// only reads the clock, it never schedules.
import type Draft from "@Interface/Draft.js";
import type Envelope from "@Interface/Envelope.js";

export default (Draft: Draft, Sequence: number): Envelope => ({
	trace:
		typeof Draft.trace === "string" && Draft.trace.length > 0
			? Draft.trace
			: `trace-${Sequence}`,
	kind: Draft.kind,
	at: typeof Draft.at === "number" ? Draft.at : Date.now(),
	...(Draft.actor === undefined ? {} : { actor: Draft.actor }),
	payload: Draft.payload,
});
