import type ReferenceNode from "../Interface/ReferenceNode.js";
import type State from "../Interface/State.js";
/**
 * @module Query
 *
 * The read-only projections: the reference list of one path's model and the
 * service's statistics triple.
 *
 * @remarks
 *
 * No I/O, no building, no throwing: an unknown path answers honestly with an
 * empty list.
 */
declare const _default: {
    /**
     * The reference list of the path's model (empty when unresolved).
     */
    References(State: State, Path: string): ReferenceNode[];
    /**
     * The statistics triple: index size, revision, adapter count.
     */
    Statistics(State: State): {
        paths: number;
        revision: number;
        adapters: number;
    };
};
export default _default;
