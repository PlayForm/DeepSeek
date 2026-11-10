import type Record from "../Interface/Record.js";
import type State from "../Interface/State.js";
import type Statistics from "../Interface/Statistics.js";
/**
 * @module Query
 *
 * The read side of the merge hook: one batch record, all batch records
 * (newest last), and the honest statistics.
 */
/**
 * One batch record by ID, or undefined.
 */
export declare const One: (State: State, Id: string) => Record | undefined;
/**
 * All batch records (newest last).
 */
export declare const All: (State: State) => Record[];
/**
 * The honest statistics over every persisted reply.
 */
export declare const Statistics: (State: State) => Statistics;
