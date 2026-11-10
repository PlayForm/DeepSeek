import type State from "../Interface/State.js";
import type { Log } from "../Interface/State.js";
export default _default;
/**
 * @module ToolExpand
 *
 * The `workspace_expand` tool: the connected nodes and edges of one node.
 *
 * @remarks
 *
 * V4-1 §3.4: a node id, optional edge kinds and depth in, the neighbors
 * out (references, calls, imports, tests). The W1 graph serves the
 * contains/imports kinds it parses; a requested deferred kind yields an
 * honest empty set, never a fake edge. The disabled plugin no-ops to a
 * clear refusal (the IDLE-forever posture).
 */
declare function _default(State_: State, Append: Log): import("@deepseek-ai/dsh-tools").ToolDefinition;
