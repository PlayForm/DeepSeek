import type { PostToolDecision } from "@deepseek-ai/dsh-tools";
import type State from "../Interface/State.js";
/** The structural tool execution: only the fields the delegate reads. */
type Execution = {
    name?: unknown;
    callId?: unknown;
    agent?: unknown;
};
/** The structural tool execution result: only the content basis. */
type Result = {
    content?: unknown;
};
export default _default;
declare function _default(Exec: Execution, Result: Result, Next: () => Promise<PostToolDecision>, State: State): Promise<PostToolDecision>;
