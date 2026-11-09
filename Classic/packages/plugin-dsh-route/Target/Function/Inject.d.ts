import type { PreToolDecision, ToolExecution } from "@deepseek-ai/dsh-tools";
import type Route from "../Interface/Route.js";
import type State from "../Interface/State.js";
/** The ledger line (the audit format, section 2.3 + exploration item 5).
 * Byte-stable template: `route <taskType> <source> <provider> <model> <effort>`. */
export declare const LedgerLine: (Route_: Route) => string;
export default _default;
declare function _default(State: State, Exec: ToolExecution, Next: () => Promise<PreToolDecision>, Append: (Message: string) => void): Promise<PreToolDecision>;
