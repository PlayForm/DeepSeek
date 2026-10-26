import type Configuration from "../Interface/Config.js";
import type Entry from "../Interface/Entry.js";
/** What one pass moved. */
export interface Curation {
    /** Entries that went `active -> stale`. */
    stale: string[];
    /** Entries that were archived (a rename into the archive root). */
    archived: string[];
}
/** The idle age of one entry, in days. */
export declare const Idle: (Entry_: Entry, Now: number) => number;
export default _default;
declare function _default(Entries: readonly Entry[], Knobs: Configuration, Now: number): Curation;
