import type ReferenceNode from "../Interface/ReferenceNode.js";
import type State from "../Interface/State.js";
declare const _default: {
    /** The reference list of the path's model (empty when unresolved). */
    References(State: State, Path: string): ReferenceNode[];
    /** The statistics triple: index size, revision, adapter count. */
    Statistics(State: State): {
        paths: number;
        revision: number;
        adapters: number;
    };
};
export default _default;
