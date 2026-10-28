import type { Log } from "./Render.js";
import type State from "../Interface/State.js";
/** Build the tool definition (the CCR Retrieve.ts idiom: this file only
 * BUILDS it; the registration call lives in Apply). */
declare const _default: (Agent: State, Append: Log) => import("@deepseek-ai/dsh-tools").ToolDefinition;
export default _default;
