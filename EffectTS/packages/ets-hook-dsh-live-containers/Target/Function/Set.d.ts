import type State from "../Interface/State.js";
import type { Log } from "./Render.js";
export default _default;
/** Build the tool definition (the ccr Retrieve.ts idiom: this file only
 * BUILDS it; the registration call lives in Apply). */
declare function _default(Agent: State, Append: Log): import("@deepseek-ai/dsh-tools").ToolDefinition;
