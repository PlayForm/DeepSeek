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
 * facility (the live-containers registration posture). The tool delegates to
 * the packet builder (Function/Packet) and renders the packet's text form
 * (Function/Render); it never writes.
 */
declare function _default(Agent: State): import("@deepseek-ai/dsh-tools").ToolDefinition;
