import type State from "../Interface/State.js";
/** The minimal structural view of a resolved directory target. */
interface Target {
    targetKey: string;
    displayPath: string;
}
export default _default;
declare function _default(StateRef: State, Root: Target, Maximum: number): Promise<{
    candidates: string[];
    capped: boolean;
}>;
