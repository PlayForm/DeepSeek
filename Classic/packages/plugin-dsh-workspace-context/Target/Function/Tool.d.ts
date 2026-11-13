import type State from "../Interface/State.js";
export default _default;
/**
 * @module Tool
 *
 * The model-facing surface (Function/Tool): the `workspace_context` tool,
 * read-only, one canonical JSON value, a pure presenter.
 *
 * @remarks
 *
 * V4-1 section 3.4. Registered from apply through the context's `tools`
 * facility (the live-containers registration posture) on EVERY mount. The
 * tool delegates to the packet builder (Function/Packet) and renders the
 * packet's text form (Function/Render); it never writes.
 *
 * THE DISABLED ANSWER: the flag is read at CALL time (State.On, refreshed in
 * place by the factory's volatile listener) - when it is false the execute
 * refuses with
 * `workspace_context: the context plugin is disabled (enabled=false)` and
 * writes no ledger line.
 */
declare function _default(Agent: State): import("@deepseek-ai/dsh-tools").ToolDefinition;
