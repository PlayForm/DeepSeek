export interface HeuristicValues {
    /** The call matched the family's path rules (1.00 in this consumer). */
    scope: number;
    /** The graph-distance placeholder (0.50 - no graph service in this consumer). */
    graph: number;
    /** The pack's prior for the companion (1.0 canonical, 0.6 family, 0.3 fallback). */
    prior: number;
    /** The literal proof of the companion (0.50 - no generated index in this consumer). */
    literal: number;
    /** The learned per-COMPANION accept rate (neutral 1/3 with no observation). */
    history: number;
    /** The learned per-FAMILY accept rate (neutral 1/3 with no observation). */
    accept: number;
}
/** One companion row of a decision: the path, its score, and the values used. */
export interface CompanionDecision {
    /** The companion path or glob. */
    path: string;
    /** The weighted score the row was ranked by. */
    score: number;
    /** The six pickable heuristic values this row contributed. */
    heuristics: HeuristicValues;
}
export default interface Decision {
    /** The pack family that won the detection. */
    family: string;
    /** The family's confidence kappa. */
    kappa: number;
    /** The ranked companion rows (empty only when the family has no target left). */
    companions: CompanionDecision[];
    /** The EFFECTIVE weight table the score used (disabled names carry 0). */
    weights: HeuristicValues;
    /** The enabled heuristic names, canonical order. */
    enabled: string[];
    /** The outcome placeholder: "pending", then the follow-through's verdict. */
    outcome: "pending" | "accepted" | "rejected";
    /** The store that answered: the shared pattern service or the memory fallback. */
    store: "pattern" | "memory";
}
