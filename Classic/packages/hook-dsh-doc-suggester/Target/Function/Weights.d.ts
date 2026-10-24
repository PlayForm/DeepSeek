import type { HeuristicValues } from "../Interface/Decision.js";
export default _default;
declare function _default(
/** The enabled heuristic names (config `heuristics`, volatile). */
Enabled: string[], 
/** The configured weight table (config `weights`, volatile). */
Configured: Record<string, number>): {
    enabled: string[];
    weights: HeuristicValues;
};
