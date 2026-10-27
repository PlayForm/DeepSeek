import type Binding from "../Interface/Binding.js";
import type State from "../Interface/State.js";
/** One binding by id, or undefined. */
export declare const ById: (State: State, Id: string) => Binding | undefined;
/** The ring, NEWEST first; an optional limit slices the head. */
export declare const Ring: (State: State, Limit: number | undefined) => Binding[];
/** The statistics triple: distinct bindings, ring depth, the current
 *  sequence. */
export declare const Statistics: (State: State) => {
    bindings: number;
    byId: number;
    sequence: number;
};
