import type State from "../Interface/State.js";
/** The fields the journal line reads (satisfied by both proposal shapes). */
interface Record {
    id: string;
    digest: string;
    targets: readonly unknown[];
}
export default _default;
declare function _default(State: State, Proposal: Record | null, Note: string, Event?: string): void;
