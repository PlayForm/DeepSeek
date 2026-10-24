// Live - the panel's bounded tail over the D5 trace. One instance per client
// apply: it seeds from the bus's recent ring when the host exposes one (the
// panel attaches mid-session, so the held history is the honest starting
// status), then subscribes to the event names the adapters follow and keeps
// the recent envelopes NEWEST FIRST (the same order the factory's `ring`
// uses), bounded to eight lines - the trace is a status surface, not a log
// store. Sections subscribe to re-render on each new envelope; dispose()
// drops every subscription with the plugin. Without a trace the tail stays
// empty and every subscription is a no-op (the static fallback).
import type { PanelEnvelope } from "@Interface/Panel.js";
import type { PanelLive, PanelTrace } from "@Interface/Trace.js";

const Bound = 8;

export default function Live(Trace: PanelTrace | undefined, Kinds: readonly string[]): PanelLive {
	const Tail: PanelEnvelope[] = [];
	const Seed =
		Trace?.ring === undefined
			? []
			: Trace.ring(Bound).filter((Envelope) => Kinds.includes(Envelope.kind));
	Tail.push(...Seed.slice(0, Bound));
	const Listeners = new Set<() => void>();
	const Publish = (Envelope: PanelEnvelope): void => {
		Tail.unshift(Envelope);
		while (Tail.length > Bound) Tail.pop();
		for (const Listener of Listeners) Listener();
	};
	const Unsubscribes: Array<() => void> =
		Trace === undefined ? [] : Kinds.map((Kind) => Trace.on(Kind, Publish));
	return {
		tail() {
			return [...Tail];
		},
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
