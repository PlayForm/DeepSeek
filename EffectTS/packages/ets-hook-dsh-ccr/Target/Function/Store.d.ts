import type Entry from "../Interface/Entry.js";
export type Eviction = {
    hash: string;
    reason: "ttl" | "budget";
};
export type Lookup = {
    found: Entry;
} | {
    gone: "expired" | "unknown";
};
export default class Store {
    /** The live entries, keyed by hash (insertion order = LRU tiebreak). */
    Entries: Map<string, Entry>;
    /** The total byte size of the live entries (the LRU's accounting). */
    Bytes: number;
    /** The journal path; "" = memory-only. */
    Path: string;
    constructor(JournalPath: string);
    /** Boot: load the journal, drop the expired records, compact the file. */
    Load(): void;
    /** Insert one entry: sweep the expired, evict the LRU over budget, append
     *  the journal record. Returns every eviction for the caller's ledger. */
    Put(Entry: Entry): Eviction[];
    /** The configured budget (read live so a volatile re-tune lands on the next insert). */
    private Budget;
    /** The budget override, injected by Apply on every Put (the volatile cell). */
    BudgetBytes: number | undefined;
    /** Look up one hash: found (lastAccessed refreshed) or the gone reason. */
    Get(Hash: string): Lookup;
    /** The current entry count and byte size (the stats surface). */
    Stats(): {
        count: number;
        bytes: number;
    };
    /** Drop every expired entry (used before insert). */
    private Sweep;
    /** The LRU victim: the smallest lastAccessed (insertion order breaks ties). */
    private lru;
    private drop;
    /** Append the JSONL record (best-effort, contained). */
    private Journal;
}
