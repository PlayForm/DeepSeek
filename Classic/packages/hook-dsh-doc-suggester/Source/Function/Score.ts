// Score - the confidence and the gate (completion spec D8 + 03-SUGGESTERS
// section 2: the pickable heuristic scorer).
//
//   k = sigmoid(evidence + b), b = -0.6;
//   score(c) = sum over the ENABLED heuristics of weight(h) * value(h)
//
// The six pickable heuristics (Variable/Heuristics) and their default weights
// (Variable/Weights) are:
//
//   scope   0.35   the call matched the family's path rules (1.00);
//   graph   0.00   the graph-distance placeholder (0.50, no graph service here);
//   prior   0.25   the pack's prior for the companion;
//   literal 0.25   the neutral literal (0.50, no generated index here);
//   history 0.15   the LEARNED per-companion accept rate (neutral 1/3);
//   accept  0.00   the LEARNED per-family accept rate (neutral 1/3).
//
// The default row reproduces the PoC formula exactly:
// 0.35*1 + 0.25*prior + 0.25*0.5 + 0.15*(1/3). A missing learning store
// answers the neutral 1/3, so the default score is unchanged byte-for-byte; a
// present one moves the history/accept terms, and the config's
// `heuristics`/`weights` make any term pickable (a disabled name is dropped
// from the sum).
//
// The gate: "abstain" below the family's threshold, or when every companion
// is already touched this turn, or when the candidate list is empty;
// "suppress" for cooldown/dedupe/cap; "emit" for the ordered, capped list.
// Every row is measured by Function/Measure, the same leaf a gated silence's
// decision record uses.
import type { Candidate, Detection, Verdict } from "../Interface/Execution.js";
import Measure, { type MeasureInput } from "./Measure.js";

/** The plan's bias: a single weak signal stays under the default threshold. */
const Bias = -0.6;

/** The gate input, built by Apply from the per-agent state and the config. */
export interface Gate {
	/** The family ids that emitted within the cooldown window. */
	Cooled: string[];
	/** The dedupe keys already noted this turn. */
	Noted: Set<string>;
	/** The paths touched since the last user message (already-touched companions are dropped). */
	Touched: Set<string>;
	/** Notes emitted this turn. */
	Notes: number;
	/** The per-turn cap. */
	MaxNotes: number;
	/** The config's threshold. */
	Threshold: number;
	/** The companion cap. */
	MaxCompanions: number;
	/** The measure input: the effective weights and the learned-rate lookups. */
	Measure: MeasureInput;
}

/** sigmoid. */
const Sigmoid = (X: number): number => 1 / (1 + Math.exp(-X));

/** The companion-set dedupe key: the family plus its sorted paths. */
const Key = (Family: string, Paths: string[]): string =>
	`${Family}:${Paths.slice().sort().join("|")}`;

export default (
	/** The ranked detections (Detect's output). */
	Detections: Detection[],
	/** The gate input. */
	Input: Gate,
): Verdict => {
	const Winner = Detections[0];
	if (Winner === undefined) {
		return { action: "abstain", reason: "no-signal", kappa: 0, candidates: [] };
	}
	const Kappa = Sigmoid(Winner.evidence + Bias);
	// The existence filter runs BEFORE the gate: a family whose whole
	// companion set is absent from the workspace is a structural silence, not
	// a confidence one, so `no-companions` wins over the threshold.
	if (Winner.family.targets.length === 0) {
		return { action: "abstain", reason: "no-companions", kappa: Kappa, candidates: [] };
	}
	const Threshold = Math.max(Winner.family.threshold, Input.Threshold);
	if (Kappa < Threshold) {
		return { action: "abstain", reason: "low-confidence", kappa: Kappa, candidates: [] };
	}
	// The companion list: the winner's targets, minus the call's own path,
	// minus the companions already touched this turn, minus the out-of-scope
	// (Function/Measure owns the last two), measured and ranked.
	const Scored: Candidate[] = [];
	const Paths = new Set<string>();
	for (const Target of Winner.family.targets) {
		if (Paths.has(Target.path)) {
			continue;
		}
		if (Input.Touched.has(Target.path)) {
			continue;
		}
		const Measured = Measure(Target, Input.Measure);
		if (Measured === undefined) {
			continue;
		}
		Paths.add(Target.path);
		Scored.push({ ...Measured, kind: Target.kind, reason: Target.reason });
	}
	Scored.sort((Left, Right) => Right.score - Left.score);
	const Candidates = Scored.slice(0, Input.MaxCompanions);
	if (Candidates.length === 0) {
		return { action: "abstain", reason: "already-touched", kappa: Kappa, candidates: [] };
	}
	if (Input.Cooled.includes(Winner.family.id)) {
		return { action: "suppress", reason: "cooldown", kappa: Kappa, candidates: [] };
	}
	if (
		Input.Noted.has(
			Key(
				Winner.family.id,
				Candidates.map((C) => C.path),
			),
		)
	) {
		return { action: "suppress", reason: "dedupe", kappa: Kappa, candidates: [] };
	}
	if (Input.Notes >= Input.MaxNotes) {
		return { action: "suppress", reason: "cap", kappa: Kappa, candidates: [] };
	}
	return { action: "emit", reason: "", kappa: Kappa, candidates: Candidates };
};

/** The dedupe key for an emitted note (Apply records it for the next call). */
export const NoteKey = Key;
