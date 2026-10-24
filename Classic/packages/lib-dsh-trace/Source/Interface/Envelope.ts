// Envelope - the ONE shape every trace emission carries (D5):
// `{ trace, kind, at, actor, payload }`.
//
//   * `trace` is the emission's correlation id: the bus assigns
//     `trace-<sequence>` when the emitter supplies none, so a correlated chain
//     can pass its own id through;
//   * `kind` is the event name (Names, or a future event);
//   * `at` is the emission time in epoch milliseconds (the bus assigns it when
//     the emitter supplies none; no timer is ever created on the hot path);
//   * `actor` is the optional emitting actor object (the same object identity
//     the fs/observed events carry);
//   * `payload` is the event's own shape (the observe stamp, the graph record
//     facts).
export default interface Envelope {
	/** The emission's correlation id (`trace-<sequence>` when the bus assigned it). */
	trace: string;
	/** The event name. */
	kind: string;
	/** The emission time in epoch milliseconds. */
	at: number;
	/** The emitting actor object, when the emitter carried one. */
	actor?: object;
	/** The event's own payload. */
	payload: Record<string, unknown>;
}
