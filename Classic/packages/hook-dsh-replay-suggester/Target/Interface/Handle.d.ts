export default interface Handle {
    /** Release the domain (the storage effect's disposer; idempotent). */
    close(): Promise<void>;
    /** Resolve one declared table handle. */
    table(Name: string): Table;
}
/** One declared table's KV facet (the subset this hook uses). */
export interface Table {
    /** Insert or overwrite one record durably. */
    put(Key: string, Value: unknown): Promise<void>;
    /** Delete one record durably; true when it existed. */
    delete(Key: string): Promise<boolean>;
    /** Read one record synchronously from the domain's memory. */
    get(Key: string): unknown;
    /** Snapshot iterator over the `[key, record]` pairs. */
    entries(): IterableIterator<[string, unknown]>;
    /** Snapshot iterator over the keys. */
    keys(): IterableIterator<string>;
    /** The current record count. */
    readonly size: number;
}
