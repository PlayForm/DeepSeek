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
