import type Reply from "@Interface/Reply.js";
import type State from "@Interface/State.js";
interface Observed {
    target: unknown;
    version: string;
    lines: string[];
}
export default _default;
declare function _default(State: State, Path: string): Promise<{
    Ok: true;
    Observed: Observed;
} | {
    Ok: false;
    Reply: Reply;
}>;
