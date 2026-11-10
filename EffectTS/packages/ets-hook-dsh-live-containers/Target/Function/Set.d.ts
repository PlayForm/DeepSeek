import type { Log } from "./Render.js";
import type State from "../Interface/State.js";
export default _default;
/**
 * @module Set
 *
 * Builds the `live_container_set` tool, the per-agent state writer.
 *
 * @remarks
 *
 * The `live_container_set` tool (the template host's per-agent state writer;
 * Requirements/03 section 2 + the wave-2 verbs). Mutates per-agent state ONLY - never the
 * config file. The wave-2 verbs (I6 section 5):
 *
 * - `accept=<sid>` - instantiate the stored, clamped configuration verbatim
 * - `dismiss=<sid>` - withdraw the suggestion (or the dormant block)
 * - `plant=<id>` - instantiate a catalog preset into the per-agent state
 * - `prune=<plantId>/<agentId>` - drop a stale member from the board's expect
 * - `expect=<n>` - the plant's expected member count (with plant=)
 * - `<key>=<value>` - a per-agent template variable
 *
 * Unknown targets log and no-op. Any other action while a suggestion is open also
 * dismisses it (the model moved on - I6 5.2).
 */
/**
 * Build the tool definition (the CCR Retrieve.ts idiom: this file only BUILDS it; the
 * registration call lives in Apply).
 */
declare function _default(Agent: State, Append: Log): import("@deepseek-ai/dsh-tools").ToolDefinition;
