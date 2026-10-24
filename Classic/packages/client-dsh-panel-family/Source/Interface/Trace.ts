// Trace - the panel's live status source contract. The D5 bus is the
// factory's `ctx.trace` service (Classic/packages/plugin-dsh-factory/
// Source/Interface/Trace.ts); a client-side host that exposes it in the
// browser supplies the same `on`/`ring` face. The panel consumes ONLY these
// two methods: it subscribes to the event names the adapters declare and
// reads the bounded ring, so the panel never needs the host's emit/flush/
// dispose halves and never imports the trace library or the factory.
import type { PanelEnvelope } from "./Panel.js";

// The live status source: subscribe to one trace event name (the returned
// disposer unsubscribes) and optionally read the bounded recent-envelope ring
// (newest first).
export type PanelTrace = {
	on: (kind: string, listener: (envelope: PanelEnvelope) => void) => () => void;
	ring?: (limit?: number) => PanelEnvelope[];
};

// The panel's own bounded tail over the trace: the recent envelopes the
// adapters follow, newest first, plus the subscription the sections use to
// re-render. Created once per client apply and disposed with the plugin.
export type PanelLive = {
	tail: () => PanelEnvelope[];
	subscribe: (listener: () => void) => () => void;
	dispose: () => void;
};
