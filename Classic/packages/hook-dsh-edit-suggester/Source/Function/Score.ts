// Score - the confidence and the gate. The edit suggester reuses the search
// consumer's algebra (the same sigmoid, the same candidate scoring, the same
// noise control) with a static knowledge: the history term is neutral
// (1/3, the Laplace prior with zero observations) because this PoC carries
// no learned layer - the pack is the repo's convention as DATA (plan section
// 8.2), and the learning (the ETS twin and the replay) is the end-phase.
//
//   k = sigmoid(sum(weights) + b), b = -0.6;
//   score(c) = 0.35*scope + 0.25*prior + 0.25*literal + 0.15*history
//            - 0.20*recent, with literal = the neutral 0.5 and history = 1/3.
//
// The gate: "abstain" below the family's threshold or when every companion
// is already touched this turn; "suppress" for cooldown/dedupe/cap; "emit"
// for the ordered, capped companion list.
import type { Candidate, Detection, Verdict } from "../Interface/Execution.js";

/** The plan's bias: a single weak signal stays under the default threshold. */
const Bias = -0.6;

/** The neutral literal score (no generated index in this consumer). */
const NeutralLiteral = 0.5;

/** The neutral history (the Laplace rate with zero observations). */
const NeutralHistory = 1 / 3;

/** The candidate score weights. */
const Weights = { Scope: 0.35, Prior: 0.25, Literal: 0.25, History: 0.15, Recent: 0.2 };

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
	/** The excluded directories (an edit or a companion inside them is out of scope). */
	Exclude: string[];
}

/** sigmoid. */
const Sigmoid = (X: number): number => 1 / (1 + Math.exp(-X));

/** Whether a path sits inside one of the excluded directories. */
const Excluded = (Path: string, Exclude: string[]): boolean =>
	Exclude.some((Dir) => Path === Dir || Path.startsWith(`${Dir}/`) || Path.includes(`/${Dir}/`));

/** The companion-set dedupe key: the family plus its sorted paths. */
const Key = (Family: string, Paths: string[]): string =>
	`${Family}:${Paths.slice().sort().join("|")}`;

export default (
	/** The ranked detections (Detect's output). */
	Detections: Detection[],
	/** The edited path (dropped from the companion list and counted as touched). */
	EditPath: string,
	/** The gate input. */
	Input: Gate,
): Verdict => {
	const Winner = Detections[0];
	if (Winner === undefined) {
		return { action: "abstain", reason: "no-signal", kappa: 0, candidates: [] };
	}
	const Kappa = Sigmoid(Winner.evidence + Bias);
	const Threshold = Math.max(Winner.family.threshold, Input.Threshold);
	if (Kappa < Threshold) {
		return { action: "abstain", reason: "low-confidence", kappa: Kappa, candidates: [] };
	}
	// The companion list: the winner's targets, minus the edited path itself,
	// minus the companions already touched this turn, minus the out-of-scope.
	const Scored: Candidate[] = [];
	const Paths = new Set<string>();
	for (const Target of Winner.family.targets) {
		if (Paths.has(Target.path) || Target.path === EditPath) {
			continue;
		}
		if (Excluded(Target.path, Input.Exclude) || Excluded(EditPath, Input.Exclude)) {
			continue;
		}
		if (Input.Touched.has(Target.path)) {
			continue;
		}
		Paths.add(Target.path);
		Scored.push({
			path: Target.path,
			kind: Target.kind,
			reason: Target.reason,
			// The recent term is not used in this PoC: a companion touched this
			// turn is dropped outright above, so recent(c) has no survivor to
			// penalize.
			score:
				Weights.Scope * 1.0 +
				Weights.Prior * Target.prior +
				Weights.Literal * NeutralLiteral +
				Weights.History * NeutralHistory,
		});
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
