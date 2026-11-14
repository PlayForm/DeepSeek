/**
 * @module Factory
 *
 * The slice of the factory service (@playform/plugin-dsh-factory) the
 * pattern plugin consumes.
 *
 * @remarks
 *
 * Structural, so a test context can serve the REAL built factory and any
 * future factory refactor keeps the consumer honest (the batch-state and
 * live-containers precedent). The service acquires the instance through a
 * soft `ctx.get` probe (the `inject` static stays empty - the loader
 * contract the smokes pin), so the field is optional at the probe and the
 * absent-factory mount degrades to the JSON fallback.
 */
export default interface FactoryHandle {
    /**
     * The optional storage-domain open (P5): probe, define, open, restore, or
     * one loud line.
     */
    OpenDomain(State: unknown, Facility: unknown, Spec: {
        Name: string;
        Version: number;
        Tables: Record<string, unknown>;
        Compatible?: number[];
        Line: (Cause: unknown) => string;
        Restore?: (Handle: unknown) => void;
    }): Promise<unknown>;
}
