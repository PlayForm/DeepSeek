export default interface DomainHandle {
    /** Close the domain (the storage effect's disposer). */
    close(): Promise<void>;
    /** One table of the domain. */
    table(name: string): {
        put(key: string, value: unknown): Promise<void>;
        entries(): IterableIterator<[string, unknown]>;
    };
}
