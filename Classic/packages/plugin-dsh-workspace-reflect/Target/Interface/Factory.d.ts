export default interface FactoryHandle {
    /** The State builder: cell unwrap + shared fields + module extras. */
    State(Context: unknown, Config: unknown, Setup: unknown): unknown;
    /** The ledger: logger first, then the durable file; never throws. */
    Append(State: unknown, Message: string): void;
    /** The guarded write: the explicit replaceIfVersion intent (the version
     *  fence), the P4 sandbox policy, the stash pre-registration. Throws on
     *  a version conflict or a write failure - the caller maps the failure
     *  to the reply union. */
    GuardedWrite(State: unknown, Target: unknown, Content: string, Version: string, Signal?: AbortSignal): Promise<{
        operation: string;
        version: string;
    }>;
}
