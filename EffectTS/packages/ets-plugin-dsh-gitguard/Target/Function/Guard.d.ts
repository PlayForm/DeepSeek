import type { PreToolDecision, ToolExecution } from "@deepseek-ai/dsh-tools";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Payload: ToolExecution, Next: () => Promise<PreToolDecision>): Promise<PreToolDecision>;
