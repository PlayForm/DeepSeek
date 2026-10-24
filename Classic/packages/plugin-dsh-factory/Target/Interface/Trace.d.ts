import type { Adapter, Envelope } from "@playform/lib-dsh-trace";
export default interface Trace extends Adapter {
    /** The deterministic settle seam: the bus dispatches synchronously, so this resolves at once. */
    flush(): Promise<void>;
    /** The bounded ring of recent envelopes, NEWEST first (an optional limit slices the head). */
    ring(Limit?: number): Envelope[];
    /** The unload path: stop dispatch, drop every listener; never throws. */
    dispose(): void;
}
