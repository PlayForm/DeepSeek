import type Factory from "@playform/ets-plugin-dsh-factory";
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The plugin-factory service (@playform/ets-plugin-dsh-factory). */
        pluginFactory: Factory;
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
    Wire(Context: unknown, State: unknown, Observe: unknown): void;
}
