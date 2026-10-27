import type Stamp from "../Interface/Stamp.js";
import type State from "../Interface/State.js";
/** The latest stamp for one path, or undefined. */
export declare const Latest: (State: State, Path: string) => Stamp | undefined;
/** The ring, NEWEST first; an optional limit slices the head. */
export declare const Ring: (State: State, Limit: number | undefined) => Stamp[];
/** The statistics triple: distinct paths, ring depth, the current sequence. */
export declare const Statistics: (State: State) => {
    paths: number;
    stamps: number;
    sequence: number;
};
