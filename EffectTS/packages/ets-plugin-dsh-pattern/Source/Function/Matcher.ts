// Matcher - the ranked match (Function/Matcher). A lookup plus arithmetic,
// never an LLM call (PATTERN-GRAPH-PLUGIN.md risk 5). Score weights: the
// keyword overlap 0.6, the trigger's tool match 0.2, the stored confidence
// 0.2. Two abstention paths, both producing the EMPTY result (risk 1: the
// wrong suggestion is worse than none):
//   threshold - every score below Knobs.matchThreshold drops;
//   ambiguity - when the top two scores sit within Knobs.ambiguityEpsilon,
//     the result is empty: two patterns matching equally is not a decision.
import type Knobs from "@Interface/Config.js";
import type { MatchResult } from "@Interface/Match.js";
import type Pattern from "@Interface/Pattern.js";

const Overlap = (Pattern_: Pattern, Text: string): number => {
	const Words = Text.toLowerCase();
	let Hits = 0;
	for (const Keyword of Pattern_.trigger.keywords) {
		if (Keyword.length > 0 && Words.includes(Keyword.toLowerCase())) {
			Hits += 1;
		}
	}
	const Total = Math.max(Pattern_.trigger.keywords.length, 1);
	return Hits / Total;
};

export default (
	Candidates: Pattern[],
	Context: { tool?: string | undefined; text?: string | undefined },
	Knobs: Knobs,
): MatchResult[] => {
	const Scored: MatchResult[] = [];
	for (const Pattern_ of Candidates) {
		const Keyword = Context.text ? Overlap(Pattern_, Context.text) : 0;
		const Tool =
			Pattern_.trigger.tool && Context.tool && Pattern_.trigger.tool === Context.tool ? 1 : 0;
		const Total = 0.6 * Keyword + 0.2 * Tool + 0.2 * Pattern_.confidence;
		if (Total >= Knobs.matchThreshold) {
			Scored.push({ pattern: Pattern_, score: Total });
		}
	}
	Scored.sort(
		(Left, Right) =>
			Right.score - Left.score || Left.pattern.id.localeCompare(Right.pattern.id),
	);
	const Top = Scored.slice(0, Math.max(Knobs.maxMatches, 1));
	// Ambiguity: the top two within epsilon -> the empty result.
	const [First, Second] = Top;
	if (
		First !== undefined &&
		Second !== undefined &&
		Second.score - First.score <= Knobs.ambiguityEpsilon
	) {
		return [];
	}
	return Top;
};
