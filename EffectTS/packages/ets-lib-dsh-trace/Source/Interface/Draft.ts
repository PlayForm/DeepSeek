// Draft - what an adapter hands the bus: the envelope's required content
// without the bus-assigned fields. `trace` and `at` are optional: an emitter
// may supply them (a correlated chain, a deterministic smoke) and the bus
// completes the rest (Function/Complete).
export default interface Draft {
	/** The event name. */
	kind: string;
	/** The event's own payload. */
	payload: Record<string, unknown>;
	/** The emitting actor object, when one applies. */
	actor?: object;
	/** The correlation id, when the emitter supplies one. */
	trace?: string;
	/** The emission time in epoch milliseconds, when the emitter supplies one. */
	at?: number;
}
