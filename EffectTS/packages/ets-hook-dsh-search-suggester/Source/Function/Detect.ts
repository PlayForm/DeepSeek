// Detect - the deterministic classifier (plan section 4.3): a pure function
// over (call, ring, userText, pack) -> the ranked detections. No LLM in the
// hot path; the rules are the pack's regex sources compiled here per call
// (the hot path's compiled-once optimization is the end-phase's measured
// concern; the PoC keeps one pure function); the cost is O(10 intents x ~3
// rules) plus a map lookup - no I/O, no allocation beyond the detections.
//
// The matching rules (plan section 3.8, ordered R1-R13):
//   * each intent's call signals are matched against the call text (the
//     grep/glob pattern, the read file_path, or the first search-shaped bash
//     segment) and its path - a matched signal adds its weight;
//   * R12 context: the user text contains the intent's context word - +0.3;
//   * R13 loop: the same intent detected in 2 of the last 4 calls with no
//     edit between - +0.2 (the model is searching in circles);
//   * an intent with zero evidence and no loop is not a candidate.
//
// The winner (highest priority among matches) and the runner-up (folded into
// one note only when its kappa is within 0.1) are chosen by Score, which owns
// the kappa math; Detect only ranks.
import type { CallView, Detection, Intent } from "../Interface/Execution.js";

/** The keywords that trigger the R12 context bonus per intent id. */
const CONTEXT_WORDS: Record<string, string> = {
	Version: "bump|release|version",
	Path: "rename|move|path",
	Ledger: "ledger|log",
	Config: "config|setting",
	Dependency: "install|dependency|package",
	Test: "test|suite|fail",
	Symbol: "define|symbol|function",
	Doc: "docs|document|readme",
	Usage: "uses|who uses",
	Owner: "owner|handoff",
};

export default (
	/** The pack: the intents in priority order. */
	Pack: Intent[],
	/** The current judged call. */
	Call: CallView,
	/** The ring: the last calls' intent ids, oldest first (the most recent 4 are read). */
	Intents: string[],
	/** The user text (the latest user message), lowercased. */
	UserText: string,
): Detection[] => {
	const Recent = Intents.slice(-4);
	const Detections: Detection[] = [];
	for (const Intent of Pack) {
		// The call evidence: the sum of the matched call signals' weights.
		const Evidence = Intent.signals.reduce((Sum, Signal) => {
			if (Signal.source !== undefined) {
				return Sum;
			}
			const Pattern = new RegExp(Signal.pattern);
			return (
				Sum +
				(Pattern.test(Call.text) || (Call.path !== "" && Pattern.test(Call.path))
					? Signal.weight
					: 0)
			);
		}, 0);
		// R12 context: the user text contains the intent's context word.
		const Word = CONTEXT_WORDS[Intent.id];
		const Context =
			Word !== undefined && new RegExp(`\\b(?:${Word})\\b`).test(UserText) ? 0.3 : 0;
		// R13 loop: the same intent in 2 of the last 4 calls (no edit between is
		// enforced by the caller: an edit call clears the ring's loop credit).
		const Loop = Recent.filter((Id) => Id === Intent.id).length >= 2 ? 0.2 : 0;
		if (Evidence === 0 && Context === 0 && Loop === 0) {
			continue;
		}
		Detections.push({ intent: Intent, evidence: Evidence, context: Context, loop: Loop });
	}
	// Rank: the total score first, ties broken by priority (lower wins).
	return Detections.sort(
		(Left, Right) =>
			Right.evidence +
				Right.context +
				Right.loop -
				(Left.evidence + Left.context + Left.loop) ||
			Left.intent.priority - Right.intent.priority,
	);
};
