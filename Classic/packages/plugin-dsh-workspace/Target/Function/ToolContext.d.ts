import type State from "../Interface/State.js";
import type { Log } from "../Interface/State.js";
export default _default;
/**
 * @module ToolContext
 *
 * The `workspace_context` tool: a node id or a query and a token budget in,
 * the ORIENTATION PACKET out.
 *
 * @remarks
 *
 * V4-1 §3.4 + §3.5. The orient step of the orient -> drill -> act loop, in the
 * fixed WORKSPACE/SCOPE/MAP/FOCUS/NEIGHBORS/EVIDENCE/OPEN/STALE grammar,
 * bounded, ranked by edge strength, always versioned. A stale caller version
 * sets the STALE line. The disabled plugin no-ops to a clear refusal.
 */
declare function _default(State_: State, Append: Log): import("@deepseek-ai/dsh-tools").ToolDefinition;
