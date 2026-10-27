import type IndexSummary from "@Interface/IndexSummary.js";
import type State from "@Interface/State.js";
export default _default;
declare function _default(StateRef: State, Root?: string, Options?: {
    maxFiles?: number;
}): Promise<IndexSummary>;
