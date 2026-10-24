// Trace - the trace-bus service body (Function/Trace): the ONE bus the family
// shares, provided as `ctx.trace` by the factory's constructor (the factory is
// the family's shared-machinery owner; the vocabulary and the detached loop
// live in @playform/lib-dsh-trace, the service lives here - D5: no separate
// indexer process and no separate indexer plugin).
//
// The contract:
//
//   * `emit(draft)` - complete the envelope through the library's Complete
//     (the bus assigns `trace-<n>` and `at` when the emitter supplied none),
//     push it into the bounded ring, and dispatch it to the listeners
//     registered for its kind. EVERY listener runs inside its own try/catch and
//     the whole body is one try/catch: `emit` NEVER throws into a caller (the
//     caller is a synchronous fs/observed listener).
//   * `on(name, listener)` - subscribe; the returned disposer unsubscribes and
//     is idempotent. A subscription after `dispose` returns a no-op disposer.
//   * `flush()` - the deterministic settle seam. The bus dispatches
//     synchronously, so it resolves immediately (no timer, no queue here - the
//     coalescing belongs to the adapters' detached loops).
//   * `ring(limit?)` - the bounded recent envelopes, NEWEST first (the smoke
//     surface; the bound is the library's fixed `Bound`, not a config knob).
//   * `dispose()` - the unload path: drop every listener, stop dispatch. A
//     late emit or subscription is a contained no-op (the service may be
//     unmounted while an adapter still holds it).
import type Trace from "@Interface/Trace.js";
import { Bound, Complete, IsEnvelope, type Draft, type Envelope } from "@playform/lib-dsh-trace";

export default (): Trace => {
	const Listeners = new Map<string, Set<(Envelope: Envelope) => void>>();
	const Ring: Envelope[] = [];
	let Sequence = 0;
	let Disposed = false;
	const emit = (Draft: Draft): void => {
		try {
			switch (true) {
				case Disposed:
				case Draft === null || typeof Draft !== "object":
				case typeof Draft.kind !== "string" || Draft.kind.length === 0:
				case Draft.payload === null || typeof Draft.payload !== "object":
					return;
				default:
			}
			Sequence += 1;
			const Envelope = Complete(Draft, Sequence);
			switch (true) {
				case !IsEnvelope(Envelope):
					return;
				default:
			}
			Ring.push(Envelope);
			while (Ring.length > Bound) {
				Ring.shift();
			}
			const Subscribers = Listeners.get(Envelope.kind);
			switch (true) {
				case Subscribers === undefined:
					return;
				default:
			}
			for (const Listener of [...Subscribers]) {
				try {
					Listener(Envelope);
				} catch {
					/* one failing listener never silences the rest */
				}
			}
		} catch {
			/* emit never throws into a caller */
		}
	};
	const on = (Name: string, Listener: (Envelope: Envelope) => void): (() => void) => {
		switch (true) {
			case Disposed:
			case typeof Listener !== "function":
				return () => undefined;
			default:
		}
		let Subscribers = Listeners.get(Name);
		if (Subscribers === undefined) {
			Subscribers = new Set();
			Listeners.set(Name, Subscribers);
		}
		Subscribers.add(Listener);
		return () => {
			Subscribers.delete(Listener);
		};
	};
	const flush = async (): Promise<void> => {
		await Promise.resolve();
	};
	const ring = (Limit?: number): Envelope[] =>
		[...Ring].reverse().slice(0, Limit === undefined ? Bound : Limit);
	const dispose = (): void => {
		try {
			Disposed = true;
			Listeners.clear();
		} catch {
			/* the unload path never throws */
		}
	};
	return { emit, on, flush, ring, dispose };
};
