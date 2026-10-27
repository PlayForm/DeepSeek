import type { Log } from "@Function/Render.js";
import type State from "@Interface/State.js";
export default _default;
/** Build the tool definition (the CCR Retrieve.ts idiom: this file only
 * BUILDS it; the registration call lives in Apply). */
declare function _default(Agent: State, Append: Log): import("@deepseek-ai/dsh-tools").ToolDefinition;
