// Decide - build one D8 decision record and hand it to the learned layer
// (completion spec 00-OVERVIEW D8: "every heuristic and every decision
// pickable and logged"; 03-SUGGESTERS section 2: "every decision records
// { heuristic, weight, value, outcome }").
//
// The record is built from the values the score ALREADY used - the same
// CompanionDecision rows the note was ranked from, or the would-be rows a
// gated silence measured - plus the effective weight table and the enabled
// list. Its outcome starts as the placeholder `pending`; the follow-through
// fills it through Learning.Resolve when the window closes (accepted or
// rejected), so the stored record ends with the verdict. A SILENCE's record
// stays `pending` by design: no note was emitted, so there is no window to
// close - the placeholder is the honest "no outcome exists".
import type Decision from "../Interface/Decision.js";
import type { CompanionDecision, HeuristicValues } from "../Interface/Decision.js";
import type Learning from "../Interface/Learning.js";

export default (
	/** The learned layer (the store that persists the record). */
	Learning: Learning,
	/** The pack family that won the detection. */
	Family: string,
	/** The family's confidence kappa. */
	Kappa: number,
	/** The ranked rows the score produced (or the silence's would-be rows). */
	Companions: CompanionDecision[],
	/** The effective weight table plus the enabled heuristic names. */
	Table: { enabled: string[]; weights: HeuristicValues },
): Decision => {
	const Record: Decision = {
		family: Family,
		kappa: Kappa,
		companions: Companions,
		weights: Table.weights,
		enabled: Table.enabled,
		outcome: "pending",
		store: Learning.Store(),
	};
	Learning.Remember(
		Family,
		Companions.map((Companion) => Companion.path),
		Record,
	);
	return Record;
};
