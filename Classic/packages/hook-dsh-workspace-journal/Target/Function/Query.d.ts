import type BatchRecord from "@Interface/Batch.js";
import type EntryRecord from "@Interface/Entry.js";
import type State from "@Interface/State.js";
/** One batch by ID, or undefined. */
export declare const Batch: (State: State, BatchId: string) => BatchRecord | undefined;
/** All batch records (ring order, oldest first). */
export declare const Batches: (State: State) => BatchRecord[];
/** One batch's entries (the revert data), file order. */
export declare const Entries: (State: State, BatchId: string) => EntryRecord[];
/** The statistics triple. */
export declare const Statistics: (State: State) => {
    batches: number;
    entries: number;
    applying: number;
};
