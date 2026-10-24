import type Decision from "../Interface/Decision.js";
import type { CompanionDecision, HeuristicValues } from "../Interface/Decision.js";
import type Learning from "../Interface/Learning.js";
export default _default;
declare function _default(
/** The learned layer (the store that persists the record). */
Learning: Learning, 
/** The pack family that won the detection. */
Family: string, 
/** The family's confidence kappa. */
Kappa: number, 
/** The ranked rows the score produced (or the silence's would-be rows). */
Companions: CompanionDecision[], 
/** The effective weight table plus the enabled heuristic names. */
Table: {
    enabled: string[];
    weights: HeuristicValues;
}): Decision;
