import type { HeuristicValues } from "../Interface/Decision.js";
export default _default;
/**
 * @module Weights
 *
 * Resolves the config's enabled list and weight table into the EFFECTIVE table.
 *
 * @remarks
 *
 * The pickable-weight resolver: the config's enabled list plus its weight table, resolved
 * to the EFFECTIVE table the score and the decision record use (completion spec D8:
 * "every heuristic and every decision pickable").
 *
 * - a name NOT in the enabled list is dropped: its effective weight is 0;
 * - a name in the list takes the config's weight, else the default table's;
 * - a config name outside the six known heuristics is ignored (the schema cannot know
 *   the vocabulary, so the resolver owns it).
 *
 * The resolver runs per judged call (the config cells are volatile), so a hot edit to
 * `heuristics` or `weights` lands on the next call without a remount.
 */
declare function _default(
/**
 * The enabled heuristic names (config `heuristics`, volatile).
 */
Enabled: string[], 
/**
 * The configured weight table (config `weights`, volatile).
 */
Configured: Record<string, number>): {
    enabled: string[];
    weights: HeuristicValues;
};
