import type Entry from "../Interface/Entry.js";
/**
 * @module Store
 *
 * The compression store: an in-memory LRU keyed by hash + TTL eviction + an
 * OPTIONAL JSONL disk journal.
 *
 * @remarks
 *
 * The plan §3: NOT the factory's storage journal - that is a typed LIFECYCLE
 * ledger; reusing it for MB-size BLOBs would corrupt the governance domain's
 * contract; the factory journal keeps only the plugin's lifecycle/ledger
 * lines.
 *
 *   - LRU: `storeBudgetBytes` cap (default 256 MiB, Aphrodite's inline
 *     store). The victim is the entry with the SMALLEST lastAccessed; the
 *     just-inserted entry is never evicted (an oversized single entry may
 *     exceed the budget alone rather than evict itself - the marker it
 *     backs must stay retrievable).
 *   - TTL: `ttlSeconds` (default 3600). An entry at or past its `ttlAt` is
 *     expired: dropped on insert (sweep before insert) and on access - a Get
 *     reports `gone: "expired"` so the retrieval tool can say so.
 *   - Journal (opt-in via `journalPath`; "" = memory-only, Aphrodite's
 *     inline mode): one JSONL record per store,
 *     `{hash, type, size, ttlAt, payload}`, payload = base64 of the
 *     content's JSON serialization. Appended on every Put; LOADED + COMPACTED
 *     (expired records dropped) on boot, so a restart restores the surviving
 *     entries. Plain-fs like the ledger append - the plugin's own diagnostic
 *     file, never a governed write.
 *
 * All fs is best-effort and contained: the store must never break dispatch -
 * a journal read/write failure degrades to memory-only. The store returns
 * its evictions to the CALLER: the ledger strings are the module's own
 * (Function/Apply composes them via Factory.Append), the store logs nothing.
 */
/**
 * One eviction reported to the caller (the reason tags the ledger line).
 */
export type Eviction = {
    hash: string;
    reason: "ttl" | "budget";
};
/**
 * The Get outcome: the found entry (lastAccessed refreshed) or the gone
 * reason the retrieval tool turns into its self-describing error.
 */
export type Lookup = {
    found: Entry;
} | {
    gone: "expired" | "unknown";
};
export default class Store {
    /**
     * The live entries, keyed by hash (insertion order = LRU tiebreak).
     */
    Entries: Map<string, Entry>;
    /**
     * The total byte size of the live entries (the LRU's accounting).
     */
    Bytes: number;
    /**
     * The journal path; "" = memory-only.
     */
    Path: string;
    constructor(JournalPath: string);
    /**
     * Boot: load the journal, drop the expired records, compact the file.
     */
    Load(): void;
    /**
     * Insert one entry: sweep the expired, evict the LRU over budget, append
     * the journal record. Returns every eviction for the caller's ledger.
     */
    Put(Entry: Entry): Eviction[];
    /**
     * The configured budget (read live so a volatile re-tune lands on the next insert).
     */
    private Budget;
    /**
     * The budget override, injected by Apply on every Put (the volatile cell).
     */
    BudgetBytes: number | undefined;
    /**
     * Look up one hash: found (lastAccessed refreshed) or the gone reason.
     */
    Get(Hash: string): Lookup;
    /**
     * The current entry count and byte size (the stats surface).
     */
    Stats(): {
        count: number;
        bytes: number;
    };
    /**
     * Drop every expired entry (used before insert).
     */
    private Sweep;
    /**
     * The LRU victim: the smallest lastAccessed (insertion order breaks ties).
     */
    private lru;
    private drop;
    /**
     * Append the JSONL record (best-effort, contained).
     */
    private Journal;
}
