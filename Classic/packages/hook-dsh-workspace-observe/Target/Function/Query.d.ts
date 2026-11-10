/**
 * @module Query
 *
 * The read surface of the hook's state: the latest stamp per path, the ring
 * newest-first, and the statistics triple.
 *
 * @remarks
 * Pure in-memory reads over State; never touches storage or the filesystem.
 */
import type Stamp from "../Interface/Stamp.js";
import type State from "../Interface/State.js";
/**
 * The latest stamp for one path, or undefined.
 */
export declare const Latest: (State: State, Path: string) => Stamp | undefined;
/**
 * The ring, NEWEST first; an optional limit slices the head.
 */
export declare const Ring: (State: State, Limit: number | undefined) => Stamp[];
/**
 * The statistics triple: distinct paths, ring depth, the current sequence.
 */
export declare const Statistics: (State: State) => {
    paths: number;
    stamps: number;
    sequence: number;
};
