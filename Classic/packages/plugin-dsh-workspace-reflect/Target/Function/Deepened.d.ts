import type SemanticsHandle from "../Interface/Semantics.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Service: SemanticsHandle, Path: string, Lines: string[], From: number, To: number, Old: string, New: string): Promise<{
    Text: string;
    Edits: number;
} | undefined>;
