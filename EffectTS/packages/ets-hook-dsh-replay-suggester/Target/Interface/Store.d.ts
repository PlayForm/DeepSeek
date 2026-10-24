import type Entry from "./Entry.js";
export default interface Store {
    /** The snapshot schema version (1). */
    version: number;
    /** When the snapshot was last written (epoch milliseconds). */
    savedAt: number;
    /** The entries, newest first, bounded by the history depth. */
    entries: Entry[];
}
