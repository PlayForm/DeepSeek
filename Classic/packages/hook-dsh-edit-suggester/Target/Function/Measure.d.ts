import type { CompanionDecision, HeuristicValues } from "../Interface/Decision.js";
import type { Target } from "../Interface/Execution.js";
/** The measure input: the effective weights and the learned-rate lookups. */
export interface MeasureInput {
    /** The EFFECTIVE weight table (Function/Weights). */
    weights: HeuristicValues;
    /** The learned per-companion rate lookup (Function/Store). */
    rate: (Path: string) => number;
    /** The learned per-family rate (read once per call). */
    familyRate: number;
    /** The excluded directories (a companion or a call inside them is out of scope). */
    exclude: string[];
    /** The judged call's path (never its own companion). */
    callPath: string;
}
export default _default;
declare function _default(
/** The pack companion. */
Target: Target, 
/** The measure input. */
Input: MeasureInput): CompanionDecision | undefined;
