// Trace - the live view's trace contract. The D5 envelope is mirrored
// structurally from @playform/lib-dsh-trace (the package never imports the
// library): the view reads only the correlation id, the event name, and the
// payload. A `LiveTrace` is the bounded, newest-first tail the view renders
// plus the subscription the tab/section use to re-render on a new envelope -
// the stable-until-event rule applied to the trace: a new tail is emitted
// ONLY when an envelope arrives, never on a timer.
export type TraceEnvelope = {
	trace: string;
	kind: string;
	at: number;
	actor?: object;
	payload: Record<string, unknown>;
};

export default interface LiveTrace {
	/** Whether a trace bus was exposed (false = the documented static state). */
	readonly live: boolean;
	/** The recent envelopes, newest first, bounded by the Config maxEvents. */
	tail(): TraceEnvelope[];
	/** Watch for a new envelope; the returned disposer unsubscribes. */
	subscribe(listener: () => void): () => void;
	/** Drop every bus subscription with the plugin. */
	dispose(): void;
}
