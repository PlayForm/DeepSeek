// Would - the WOULD-BE companion rows of a gated silence: the family's
// remaining companions measured exactly as the score would have measured
// them, ranked and capped like an emitted note.
//
// A silence is worth learning from when the family matched but the gate held
// (`low-confidence`) or when every companion was already touched
// (`already-touched`): the decision is real, it just did not become a note.
// The rows come from Function/Measure - the same leaf the score uses - so the
// recorded values of a silence and of an emission cannot disagree.
import type { CompanionDecision } from "../Interface/Decision.js";
import type { Family } from "../Interface/Execution.js";
import Measure, { type MeasureInput } from "./Measure.js";

export default (
	/** The winning family (already existence-filtered). */
	Family: Family,
	/** The measure input (the effective weights and the learned rates). */
	Input: MeasureInput,
	/** The companion cap (config `maxCompanions`). */
	Limit: number,
): CompanionDecision[] => {
	const Scored = Family.targets.flatMap((Target) => {
		const Measured = Measure(Target, Input);
		return Measured === undefined ? [] : [Measured];
	});
	Scored.sort((Left, Right) => Right.score - Left.score);
	return Scored.slice(0, Limit);
};
