import type { Log } from "./Render.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Plant
 *
 * The `live_plant` tool (CAN-2; Requirements/02 section 4; the design section
 * 3.4).
 *
 * @remarks
 *
 * Opens a planted board in the calling agent's per-agent state, enrolls the
 * pinned members, and starts expecting reports. The I5 3.3 prune twin lives
 * on `live_container_set`'s prune verb; the lease is never model-chosen (the
 * config's `plant.leaseTurns` is the only window source).
 */
/**
 * Build the tool definition (the CCR Retrieve.ts idiom).
 */
declare function _default(Agent: State, Append: Log): import("@deepseek-ai/dsh-tools").ToolDefinition;
