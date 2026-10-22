// Score - the confidence and the gate (plan sections 3.5-3.7, 4.7):
//
//   k = sigmoid(sum(weights) + b), b = -0.6, so a single weak signal does not
//   cross the default threshold;
//
//   score(c) = 0.35*scope(c) + 0.25*prior(c) + 0.25*literal(c)
//            + 0.15*history(c) - 0.20*recent(c)
//
//   scope(c)   = 1.0 exact in scope, 0.7 in-scope glob, 0.3 out of scope;
//   prior(c)   = the pack's prior (1.0 canonical, 0.6 family, 0.3 fallback);
//   literal(c) = 0.5 while the generated index (end-phase P2) has not proven
//                the digest - the neutral half, never a zero that would
//                starve the candidate list;
//   history(c) = the Laplace rate (followed+1)/(count+2) from the knowledge;
//   recent(c)  = 1.0 if c was suggested within the cooldown window.
//
// The gate (plan 2.4 + 4.7): the verdict is
//   "abstain"  - below the intent's threshold, or the candidate list is empty
//                (the algebra's identity element is silence);
//   "suppress" - the confidence passes but the noise control holds it back
//                (cooldown, dedupe, per-turn cap);
//   "emit"     - the ordered, capped candidate list with the intent's k.
import type { Candidate, Detection, KnowledgeRow, Verdict } from "../Interface/Execution.js";

/** The plan's bias: a single weak signal stays under the default threshold. */
const Bias = -0.6;

/** The neutral literal score while the generated index has not proven a digest. */
const NeutralLiteral = 0.5;

/** The candidate score weights (plan section 3.7). */
const Weights = { Scope: 0.35, Prior: 0.25, Literal: 0.25, History: 0.15, Recent: 0.2 };

/** The gate input, built by Apply from the per-agent state and the config. */
export interface Gate {
	/** The intent ids that emitted within the cooldown window. */
	Cooled: string[];
	/** The dedupe keys ("intent:candidate-set-hash") already noted this turn. */
	Noted: Set<string>;
	/** The candidate paths suggested within the cooldown window. */
	Recent: Set<string>;
	/** Notes emitted this turn. */
	Notes: number;
	/** The per-turn cap. */
	MaxNotes: number;
	/** The config's threshold (the non-destructive default). */
	Threshold: number;
	/** The candidate cap. */
	MaxCandidates: number;
	/** The excluded directories (a candidate inside them is out of scope). */
	Exclude: string[];
	/** The history lookup (the knowledge's Laplace inputs). */
	History: (Intent: string, Path: string) => KnowledgeRow | undefined;
}

/** sigmoid. */
const Sigmoid = (X: number): number => 1 / (1 + Math.exp(-X));

/** Whether a candidate path sits inside one of the excluded directories. */
const Excluded = (Path: string, Exclude: string[]): boolean =>
	Exclude.some((Dir) => Path === Dir || Path.startsWith(`${Dir}/`) || Path.includes(`/${Dir}/`));

/** The candidate-set dedupe key: the intent plus its sorted paths. */
const Key = (Intent: string, Paths: string[]): string =>
	`${Intent}:${Paths.slice().sort().join("|")}`;

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
	const Evidence = Winner.evidence + Winner.context + Winner.loop;
	const Kappa = Sigmoid(Evidence + Bias);
	// The intent's own gate: the destructive pack rows override the config's.
	const Threshold = Math.max(Winner.intent.threshold, Input.Threshold);
	// The runner-up folds into one note only when its kappa is within 0.1.
	const Second = Detections[1];
	const SecondKappa =
		Second === undefined ? 0 : Sigmoid(Second.evidence + Second.context + Second.loop + Bias);
	const Merged = Second !== undefined && Kappa - SecondKappa <= 0.1 ? Second : undefined;
	if (Kappa < Threshold) {
		return { action: "abstain", reason: "low-confidence", kappa: Kappa, candidates: [] };
	}
	// The candidate list: the winner's targets, then the merged intent's,
	// deduped by path, scored, sorted, capped.
	const Rows = [...Winner.intent.targets, ...(Merged?.intent.targets ?? [])];
	const Paths = new Set<string>();
	const Scored: Candidate[] = [];
	for (const Target of Rows) {
		if (Paths.has(Target.path) || Excluded(Target.path, Input.Exclude)) {
			continue;
		}
		Paths.add(Target.path);
		const Row = Input.History(Winner.intent.id, Target.path);
		// The scope: the pack rows are scope-defined by construction, so an
		// exact in-scope candidate scores 1.0 (the 0.7/0.3 tiers arrive with
		// the generated index, end-phase P2).
		const Scope = 1.0;
		const History = Row === undefined ? 1 / 3 : (Row.followed + 1) / (Row.count + 2);
		const Recent = Input.Recent.has(Target.path) ? 1.0 : 0.0;
		Scored.push({
			path: Target.path,
			kind: Target.kind,
			reason: Target.reason,
			score:
				Weights.Scope * Scope +
				Weights.Prior * Target.prior +
				Weights.Literal * NeutralLiteral +
				Weights.History * History -
				Weights.Recent * Recent,
		});
	}
	// The family globs: one aggregate row, appended after the exact targets.
	for (const Glob of Winner.intent.familyGlobs) {
		if (!Paths.has(Glob)) {
			Paths.add(Glob);
			Scored.push({ path: Glob, kind: "family", reason: "the long tail", score: 0.4 });
		}
	}
	Scored.sort((Left, Right) => Right.score - Left.score);
	const Candidates = Scored.slice(0, Input.MaxCandidates);
	if (Candidates.length === 0) {
		return { action: "abstain", reason: "ambiguous-target", kappa: Kappa, candidates: [] };
	}
	// The noise control (plan 4.7): cooldown, dedupe, per-turn cap.
	if (Input.Cooled.includes(Winner.intent.id)) {
		return { action: "suppress", reason: "cooldown", kappa: Kappa, candidates: [] };
	}
	if (
		Input.Noted.has(
			Key(
				Winner.intent.id,
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
