import type Line from "@Interface/Line.js";
import type State from "@Interface/State.js";
/** One operation's audit chain, in recording order. */
export declare const Chain: (State: State, Operation: string) => Line[];
/** The ring, newest first (an optional limit slices the head). */
export declare const Lines: (State: State, Limit?: number) => Line[];
/** The statistics triple. */
export declare const Statistics: (State: State) => {
    operations: number;
    lines: number;
    sequence: number;
};
