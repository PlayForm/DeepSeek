import type Entry from "../Interface/Entry.js";
/**
 * @module Usage
 *
 * The usage store: one record per corpus entry, loaded once, written through the service's flush chain.
 *
 * @remarks
 *
 * THE STORE IS A SIDECAR, never the corpus itself: the corpus is directories
 * of markdown a human reads and edits, so bookkeeping must live beside it
 * where a bad write cannot corrupt a skill. The path is one JSON file
 * (`~/.dsh/lesson/usage.json`), and every failure mode of that file is
 * NON-FATAL, in this order:
 *
 * - missing -> an empty store (a fresh install)
 * - unreadable -> an empty store + the reason returned to the caller
 * - unparseable -> an empty store + the reason (a truncated write)
 * - wrong shape -> an empty store + the reason
 *
 * A store that failed to load is NOT silently rewritten: the service records
 * the failure in the ledger, and the next Save replaces the file. Losing
 * usage history costs a stale pass nothing (a record with no history is
 * young), while refusing to run costs the review entirely.
 */
/**
 * The load result: how many records, or why there are none.
 */
export interface LoadResult {
    /**
     * How many records loaded.
     */
    loaded: number;
    /**
     * Why nothing loaded, when the load failed.
     */
    error?: string;
}
/**
 * One entry's new default record.
 */
export declare const Fresh: (Name: string, Now: number, CreatedBy: Entry["createdBy"]) => Entry;
export default class Usage {
    /**
     * The store path (expanded by the service).
     */
    private Path;
    /**
     * The live records, keyed by entry name.
     */
    private Rows;
    constructor(Path_: string);
    /**
     * Load the sidecar; never throws.
     */
    Load(): Promise<LoadResult>;
    /**
     * One record, or undefined.
     */
    Get(Name: string): Entry | undefined;
    /**
     * Every record, sorted by name (the report's stable order).
     */
    All(): Entry[];
    /**
     * Insert or replace one record.
     */
    Put(Entry_: Entry): void;
    /**
     * Replace the whole store (the load and the restore paths).
     */
    Reset(Entries: readonly Entry[]): void;
    /**
     * Count one interaction against an entry, creating it on first sight.
     */
    Touch(Name: string, Kind: "use" | "view" | "patch", Now: number): Entry;
    /**
     * Persist the store; the caller owns the flush chain.
     */
    Save(): Promise<void>;
}
