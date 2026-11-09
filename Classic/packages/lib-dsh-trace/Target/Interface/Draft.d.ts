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
