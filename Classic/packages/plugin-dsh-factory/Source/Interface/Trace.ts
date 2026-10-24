// Trace - the typed view of the `ctx.trace` service the factory provides. The
// emit/on contract is the trace library's `Adapter` (so every plugin's
// Source/Trace/ adapter programs against the same shape); the factory adds the
// service's own seams: `flush` (a settled promise for deterministic smokes -
// the bus dispatches synchronously), `ring` (the bounded recent-envelope ring
// the smokes read back, newest first) and `dispose` (the unload path: stop
// dispatch and drop every listener; a late emit is a contained no-op).
import type { Adapter, Envelope } from "@playform/lib-dsh-trace";

export default interface Trace extends Adapter {
	/** The deterministic settle seam: the bus dispatches synchronously, so this resolves at once. */
	flush(): Promise<void>;
	/** The bounded ring of recent envelopes, NEWEST first (an optional limit slices the head). */
	ring(Limit?: number): Envelope[];
	/** The unload path: stop dispatch, drop every listener; never throws. */
	dispose(): void;
}
