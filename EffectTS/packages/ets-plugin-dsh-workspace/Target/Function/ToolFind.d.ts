import type State from "../Interface/State.js";
import type { Log } from "../Interface/State.js";
export default _default;
/**
 * @module ToolFind
 *
 * The `workspace_find` tool: the graph's matching nodes as compact rows.
 *
 * @remarks
 *
 * V4-1 §3.4: a name (EXACT) or a pattern (a case-insensitive SUBSTRING over
 * the node id and the node name - the graph's frozen contract,
 * Function/Find.ts; never a glob), a kind and a limit in, the matching
 * nodes with id, path, span, kind out - a compact table plus the ids.
 * Pagination is by CURSOR (the id of the last node of the previous page),
 * never by offset. The disabled plugin no-ops to a clear refusal (the
 * IDLE-forever posture).
 */
declare function _default(State_: State, Append: Log): import("@deepseek-ai/dsh-tools").ToolDefinition;
