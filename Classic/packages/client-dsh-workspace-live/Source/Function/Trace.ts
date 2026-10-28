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
//
// THE BUS IS RESOLVED ON FIRST USE, NOT AT CONSTRUCTION. The client graph is
// composed in dependency order, so the panel-family host that provides the
// browser `trace` service may apply AFTER this plugin; a construction-time
// capture would freeze the static face forever. The tab mounts on a click,
// long after every plugin applied, so the first `tail()` / `live` read is the
// earliest moment the bus is guaranteed to be observable.
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
	const Tail: TraceEnvelope[] = [];
	const Listeners = new Set<() => void>();
	const Unsubscribes: (() => void)[] = [];
	let Bus: Bus | undefined;
	const Publish = (Envelope: TraceEnvelope): void => {
		Tail.unshift(Envelope);
		while (Tail.length > Bound) Tail.pop();
		for (const Listener of Listeners) Listener();
	};
	/** Resolve the bus once, seed the tail from its ring, and subscribe. */
	const Attach = (): void => {
		switch (true) {
			case Bus !== undefined:
				return;
			default:
				break;
		}
		const Candidate = ctx.get(Names.service);
		const Found = IsBus(Candidate) ? Candidate : undefined;
		switch (true) {
			case Found === undefined:
				return;
			default:
				Bus = Found;
		}
		const Seed =
			typeof Found.ring === "function"
				? Found.ring(Bound).filter((Envelope) =>
						(Names.kinds as readonly string[]).includes(Envelope.kind),
					)
				: [];
		Tail.push(...Seed.slice(0, Bound));
		for (const Kind of Names.kinds) Unsubscribes.push(Found.on(Kind, Publish));
	};
	return {
		get live() {
			Attach();
			return Bus !== undefined;
		},
		tail() {
			Attach();
			return [...Tail];
		},
		subscribe(Listener) {
			Attach();
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
