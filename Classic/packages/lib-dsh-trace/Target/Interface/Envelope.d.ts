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
