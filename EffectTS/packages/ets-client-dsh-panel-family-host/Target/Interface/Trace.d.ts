export type PanelEnvelope = {
    trace: string;
    kind: string;
    at: number;
    actor?: object;
    payload: Record<string, unknown>;
};
export default interface Trace {
    /** Subscribe to one trace event name; the returned disposer unsubscribes. */
    on(kind: string, listener: (envelope: PanelEnvelope) => void): () => void;
    /** The bounded recent envelopes, newest first (empty when the bus has no ring). */
    ring(limit?: number): PanelEnvelope[];
}
