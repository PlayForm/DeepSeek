/**
 * @module Measure
 *
 * Measures one pack companion into a scored decision row.
 *
 * @remarks
 * One companion becomes the six pickable heuristic values and the weighted score
 * (completion spec 03-SUGGESTERS section 2; D8).
 *
 * ```
 * score(c) = sum over the enabled heuristics of weight(h) * value(h)
 * ```
 *
 * The values are the documented placeholders of this consumer plus the two learned rates:
 *
 * - `scope` = 1.00 - the call matched the family's path rules (Detect);
 * - `graph` = 0.50 - the neutral graph-distance placeholder: this consumer does not read a
 *   graph service, so the value is the documented neutral and the default weight is 0;
 * - `prior` = the pack's prior for the companion;
 * - `literal` = 0.50 - the neutral literal (no generated index here);
 * - `history` = the learned per-COMPANION accept rate (neutral 1/3);
 * - `accept` = the learned per-FAMILY accept rate (neutral 1/3).
 *
 * With the default table (0.35/0.00/0.25/0.25/0.15/0.00) and no learning store the score is
 * exactly the PoC's 0.35*1 + 0.25*prior + 0.25*0.5 + 0.15*(1/3).
 *
 * The row is also the DECISION RECORD's unit: a gated silence measures the family's
 * would-be companions through this same leaf, so the recorded values and the emitted ones
 * can never disagree.
 */
import type { CompanionDecision, HeuristicValues } from "../Interface/Decision.js";
import type { Target } from "../Interface/Execution.js";
/**
 * The measure input: the effective weights and the learned-rate lookups.
 */
export interface MeasureInput {
    /**
     * The EFFECTIVE weight table (`Function/Weights`).
     */
    weights: HeuristicValues;
    /**
     * The learned per-companion rate lookup (`Function/Store`).
     */
    rate: (Path: string) => number;
    /**
     * The learned per-family rate (read once per call).
     */
    familyRate: number;
    /**
     * The excluded directories (a companion or a call inside them is out of scope).
     */
    exclude: string[];
    /**
     * The judged call's path (never its own companion).
     */
    callPath: string;
}
export default _default;
declare function _default(
/**
 * The pack companion.
 */
Target: Target, 
/**
 * The measure input.
 */
Input: MeasureInput): CompanionDecision | undefined;
