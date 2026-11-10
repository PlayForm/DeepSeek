import type BatchRecord from "../Interface/Batch.js";
import type EntryRecord from "../Interface/Entry.js";
import type State from "../Interface/State.js";
/**
 * @module Query
 *
 * The read paths: one batch, the open batches, one batch's entries, and the
 * statistics triple.
 *
 * @remarks
 *
 * Pure reads over the in-memory maps; the domain persistence is never
 * touched.
 */
/**
 * One batch by ID, or undefined.
 */
export declare const Batch: (State: State, BatchId: string) => BatchRecord | undefined;
/**
 * All batch records (ring order, oldest first).
 */
export declare const Batches: (State: State) => BatchRecord[];
/**
 * One batch's entries (the revert data), file order.
 */
export declare const Entries: (State: State, BatchId: string) => EntryRecord[];
/**
 * The statistics triple.
 */
export declare const Statistics: (State: State) => {
    batches: number;
    entries: number;
    applying: number;
};
