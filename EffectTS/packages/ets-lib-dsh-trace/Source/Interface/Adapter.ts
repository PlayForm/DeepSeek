/**
 * @module Adapter
 *
 * Describes the trace bus contract an adapter programs against: `emit` a
 * draft, `on` a named event (the returned disposer stops delivery).
 *
 * @remarks
 * The service (`ctx.trace`, provided by `@playform/ets-plugin-dsh-factory`)
 * implements it; every plugin's `Source/Trace/` adapter consumes it
 * structurally, so no plugin imports another plugin.
 */
import type Draft from "./Draft.js";
import type Envelope from "./Envelope.js";

export default interface Adapter {
	/**
	 * Publishes one draft; the bus completes the envelope and dispatches it.
	 */
	emit(Draft: Draft): void;

	/**
	 * Subscribes to one event name; the returned disposer unsubscribes.
	 */
	on(Name: string, Listener: (Envelope: Envelope) => void): () => void;
}
