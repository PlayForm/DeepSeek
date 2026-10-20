import type { Log } from "@Function/Render.js";
import type State from "@Interface/State.js";
/** Build the live_monitor tool definition. */
export declare const Monitor: (Agent: State, Append: Log) => import("@deepseek-ai/dsh-tools").ToolDefinition;
/** Build the live_monitor_check tool definition. */
export declare const Check: (Agent: State, Append: Log) => import("@deepseek-ai/dsh-tools").ToolDefinition;
