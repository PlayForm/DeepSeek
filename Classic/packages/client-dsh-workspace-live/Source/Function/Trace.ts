// Trace - the live view's source over the D5 bus. The bus is the factory's
// `ctx.trace` service; the client half resolves it structurally (only `on`
// is required, `ring` is used when present), seeds the tail from the recent
// ring when the bus exposes one (the panel attaches mid-session, so the held
// history is the honest starting state), then subscribes to the names in
// Variable/Trace.ts and keeps the envelopes NEWEST FIRST, bounded by the
// Config maxEvents - the tail is a status surface, not a log store. Every
// new envelope notifies the subscribers (the stable-until-event rule: no
// polling, no timer). Without a bus the tail is empty, `live` is false, and
// every subscription is a no-op - the documented static state, never an
// error.
import type { Context } from "@deepseek-ai/cordis";
import type LiveTrace from "@Interface/Trace.js";
import type { TraceEnvelope } from "@Interface/Trace.js";
import Names from "@Variable/Trace.js";

type Bus = {
	on(kind: string, listener: (envelope: TraceEnvelope) => void): () => void;
	ring?(limit?: number): TraceEnvelope[];
};

const IsBus = (Candidate: unknown): Candidate is Bus =>
	typeof Candidate === "object" &&
	Candidate !== null &&
	typeof (Candidate as Bus).on === "function";

export default function Trace(ctx: Context, Bound: number): LiveTrace {
	const Candidate = ctx.get(Names.service);
	const Bus = IsBus(Candidate) ? Candidate : undefined;
	const Tail: TraceEnvelope[] = [];
	const Listeners = new Set<() => void>();
	const Seed =
		Bus !== undefined && typeof Bus.ring === "function"
			? Bus.ring(Bound).filter((Envelope) =>
					(Names.kinds as readonly string[]).includes(Envelope.kind),
				)
			: [];
	Tail.push(...Seed.slice(0, Bound));
	const Publish = (Envelope: TraceEnvelope): void => {
		Tail.unshift(Envelope);
		while (Tail.length > Bound) Tail.pop();
		for (const Listener of Listeners) Listener();
	};
	const Unsubscribes = Bus === undefined ? [] : Names.kinds.map((Kind) => Bus.on(Kind, Publish));
	return {
		live: Bus !== undefined,
		tail: () => [...Tail],
		subscribe(Listener) {
			Listeners.add(Listener);
			return () => Listeners.delete(Listener);
		},
		dispose() {
			for (const Unsubscribe of Unsubscribes) Unsubscribe();
			Unsubscribes.length = 0;
			Listeners.clear();
		},
	};
}
