import type { FsObservation, FsTarget } from "@deepseek-ai/dsh-fs";
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The plugin-factory service (@playform/plugin-dsh-factory). */
        pluginFactory: import("@playform/plugin-dsh-factory").default;
    }
}
export default interface FactoryHandle {
    /** The State builder: cell unwrap + shared fields + module extras. */
    State(Context: unknown, Config: unknown, Setup: unknown): unknown;
    /** The ledger: logger first, then the durable file; never throws. */
    Append(State: unknown, Message: string): void;
    /** The exclusion match (the factory's segment match). */
    Match(Path: string, List: string[] | null | undefined): boolean;
    /** The fs/observed registration on the ROOT context. */
    Wire(Context: unknown, State: unknown, Observe: (Target: FsTarget, Observation: FsObservation, Actor: object | undefined) => void): void;
}
