import type Factory from "@playform/plugin-dsh-factory";
/**
 * @module Factory
 *
 * The slice of the factory service the batch-state plugin consumes.
 *
 * @remarks
 *
 * Structural, so a test context can serve the REAL built factory and any future factory refactor
 * keeps the consumer honest (the observe package's precedent). The augmentation below publishes
 * the typed vocabulary on the cordis Context, so `ctx.pluginFactory` is fully typed at every
 * consumption site (the observe/pinner precedent).
 */
declare module "@deepseek-ai/cordis" {
    interface Context {
        /**
         * The plugin-factory service (@playform/plugin-dsh-factory).
         */
        pluginFactory: Factory;
    }
}
export default interface FactoryHandle {
    /**
     * The State builder: cell unwrap + shared fields + module extras.
     */
    State(Context: unknown, Config: unknown, Setup: unknown): unknown;
    /**
     * The ledger: logger first, then the durable file; never throws.
     */
    Append(State: unknown, Message: string): void;
    /**
     * The optional storage-domain open (P5): probe, define, open, restore, or one loud line.
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
