// Decision - the D8 decision record: what the suggester decided, on which
// pickable heuristic values, with which weights, and what became of it
// (completion spec 00-OVERVIEW D8 + 03-SUGGESTERS section 2).
//
// ONE RECORD PER DECISION, and a decision is either an emitted note or a
// GATED SILENCE worth learning from (`low-confidence`, `already-touched`). A
// record carries:
//
//   family      - the pack family that won the detection;
//   kappa       - the family's confidence (the sigmoid gate value);
//   companions  - the ranked companion rows, each with its score and the SIX
//                 pickable heuristic values (scope, graph, prior, literal,
//                 history, accept) that produced it;
//   weights     - the EFFECTIVE weight table (a disabled heuristic carries 0);
//   enabled     - the enabled heuristic names, in the canonical order;
//   outcome     - the placeholder the follow-through fills: "pending" at
//                 record time, then "accepted" or "rejected" when the window
//                 closes (the note's own record is re-stored with the verdict);
//   store       - which learning store answered: "pattern" (the shared
//                 pattern service) or "memory" (the bounded fallback).
//
// The record is the family's learning material: a later wave (or a local
// model) can replay it to re-weight the heuristics without touching the hot
// path. It is stored through the pattern service when one is present
// (Function/Store) and in the bounded memory ring otherwise.
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
