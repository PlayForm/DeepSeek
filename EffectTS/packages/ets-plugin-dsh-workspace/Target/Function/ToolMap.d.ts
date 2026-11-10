import type State from "../Interface/State.js";
import type { Log } from "../Interface/State.js";
export default _default;
/**
 * @module ToolMap
 *
 * The `workspace_map` tool: the workspace's modules and hot symbols.
 *
 * @remarks
 *
 * V4-1 §3.4: a path or module and a depth in, the top-level modules, the
 * file count, the entry points and the hot symbols out - a compact table
 * plus the ids, never full file bodies. One canonical JSON value; the
 * presenter is pure. The disabled plugin no-ops to a clear refusal (the
 * IDLE-forever posture).
 */
declare function _default(State_: State, Append: Log): import("@deepseek-ai/dsh-tools").ToolDefinition;
