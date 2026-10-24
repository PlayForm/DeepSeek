import type State from "../Interface/State.js";
export default _default;
declare function _default(
/** The built per-apply state (the knowledge, the TTL, the pack). */
State: State, 
/** The ledger append (the factory's Append, bound by Apply). */
Append: (Message: string) => void): import("@deepseek-ai/dsh-tools").ToolDefinition;
