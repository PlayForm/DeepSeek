import type Entry from "../Interface/Entry.js";
/** The load result: how many records, or why there are none. */
export interface LoadResult {
    loaded: number;
    error?: string;
}
/** One entry's new default record. */
export declare const Fresh: (Name: string, Now: number, CreatedBy: Entry["createdBy"]) => Entry;
export default class Usage {
    /** The store path (expanded by the service). */
    private Path;
    /** The live records, keyed by entry name. */
    private Rows;
    constructor(Path_: string);
    /** Load the sidecar; never throws. */
    Load(): Promise<LoadResult>;
    /** One record, or undefined. */
    Get(Name: string): Entry | undefined;
    /** Every record, sorted by name (the report's stable order). */
    All(): Entry[];
    /** Insert or replace one record. */
    Put(Entry_: Entry): void;
    /** Replace the whole store (the load and the restore paths). */
    Reset(Entries: readonly Entry[]): void;
    /** Count one interaction against an entry, creating it on first sight. */
    Touch(Name: string, Kind: "use" | "view" | "patch", Now: number): Entry;
    /** Persist the store; the caller owns the flush chain. */
    Save(): Promise<void>;
}
