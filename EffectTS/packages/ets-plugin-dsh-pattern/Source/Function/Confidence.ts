// Confidence - the arithmetic on one pattern's confidence (Function/
// Confidence). Record deltas per outcome (clamped to 0..1) and the
// half-life decay for the stale-pattern rule (PATTERN-GRAPH-PLUGIN.md risk
// 8): a pattern not updated for n half-lives decays halfway toward the
// neutral 0.5 floor each half-life, never below it.
import type Knobs from "@Interface/Config.js";
import type { Outcome } from "@Interface/Outcome.js";
import type Pattern from "@Interface/Pattern.js";

const Clamp = (Value: number): number => Math.min(1, Math.max(0, Value));

export const ApplyOutcome = (Pattern_: Pattern, Outcome: Outcome, Knobs: Knobs): number => {
	let Delta = 0;
	switch (Outcome) {
		case "accepted":
			Delta = Knobs.acceptBonus;
			break;
		case "rejected":
			Delta = -Knobs.rejectPenalty;
			break;
		case "applied":
			Delta = Knobs.appliedBonus;
			break;
		case "failed":
			Delta = -Knobs.failedPenalty;
			break;
	}
	return Clamp(Pattern_.confidence + Delta);
};

/** The decayed confidence toward the neutral 0.5 floor. */
export const Decay = (Pattern_: Pattern, Now: number, HalfLifeDays: number): number => {
	const HalfLife = Math.max(HalfLifeDays, 0.001) * 86400000;
	const Elapsed = Math.max(Now - Pattern_.updatedAt, 0);
	const Steps = Elapsed / HalfLife;
	const Factor = Math.pow(0.5, Steps);
	return 0.5 + (Pattern_.confidence - 0.5) * Factor;
};

export const Touch = (Pattern_: Pattern, Now: number): void => {
	Pattern_.updatedAt = Now;
};
