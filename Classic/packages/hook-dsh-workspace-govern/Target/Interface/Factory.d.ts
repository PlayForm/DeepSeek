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
}
