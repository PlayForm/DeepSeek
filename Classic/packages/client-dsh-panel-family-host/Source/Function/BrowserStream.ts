// BrowserStream - the browser half's SSE trace face over the host's
// `GET /api/playform-family/trace` route. Each frame is `data: <json>` and
// the JSON is one trace envelope, so the stream is the browser equivalent of
// the host's D5 bus subscription: the frames are unshifted into a bounded
// newest-first ring and every arrival notifies the subscribers (the
// stable-until-event rule - no polling, no timer). The face matches the
// LiveTrace contract @playform/client-dsh-workspace-live resolves
// structurally (`live`, `tail`, `on`, `subscribe`, `dispose`). Without
// EventSource (tests run in Node) the documented static face is returned:
// `live: false`, an empty tail, no-op subscriptions - never an error. A
// malformed frame is ignored silently: the stream is a status surface, not a
// log store.
import type { PanelEnvelope } from "@Interface/Trace.js";

const BOUND = 200;

export default function BrowserStream(): {
	live: boolean;
	tail(): PanelEnvelope[];
	on(kind: string, listener: (envelope: PanelEnvelope) => void): () => void;
	subscribe(listener: () => void): () => void;
	dispose(): void;
} {
	switch (true) {
		case typeof EventSource === "undefined":
			return {
				live: false,
				tail: () => [],
				on: () => () => undefined,
				subscribe: () => () => undefined,
				dispose: () => undefined,
			};
		default: {
			const Source = new EventSource("/api/playform-family/trace");
			const Tail: PanelEnvelope[] = [];
			const Subscribers = new Set<() => void>();
			const KindListeners = new Map<string, Set<(envelope: PanelEnvelope) => void>>();
			const Publish = (Envelope: PanelEnvelope): void => {
				Tail.unshift(Envelope);
				while (Tail.length > BOUND) Tail.pop();
				for (const Subscriber of Subscribers) Subscriber();
				for (const Listener of KindListeners.get(Envelope.kind) ?? []) Listener(Envelope);
			};
			Source.onmessage = (Event) => {
				try {
					const Envelope = JSON.parse(Event.data) as PanelEnvelope;
					switch (true) {
						case typeof Envelope?.kind !== "string":
							break;
						default:
							Publish(Envelope);
					}
				} catch {
					// A malformed frame is ignored and logged nowhere.
				}
			};
			return {
				live: true,
				tail: () => [...Tail],
				on(kind, listener) {
					const Listeners = KindListeners.get(kind) ?? new Set();
					Listeners.add(listener);
					KindListeners.set(kind, Listeners);
					return () => Listeners.delete(listener);
				},
				subscribe(listener) {
					Subscribers.add(listener);
					return () => Subscribers.delete(listener);
				},
				dispose() {
					Source.close();
					Subscribers.clear();
					KindListeners.clear();
				},
			};
		}
	}
}
