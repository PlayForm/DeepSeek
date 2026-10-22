// Defaults - the hook's EMBEDDED PATTERN PACK (a Variable: one constant).
// The plan's pack-as-data contract (SEARCH-SUGGESTER-PLUGIN.md §8.2), the
// replay consumer's projection (§9.3): the session history is the training
// corpus, and this consumer answers "the last time this was done, what was
// touched and how was it verified". The regexes are sources here and
// compiled once at apply (Function/Apply) - the hot path never compiles one.
//
// The intent:
//
//   Repeat - "have I done this before": a search or modification call whose
//            probe matches a history record. The record supplies the
//            candidates (the files touched last time) and the verification
//            command; the static target set below is the abstention-era
//            fallback shape and never fires on its own, because a replay
//            answer without a record is a guess, and the plan forbids the
//            guess (§2.4: novel behavior = abstain).
import type Pack from "@Interface/Pack.js";

export default {
	pack: "replay",
	version: 1,
	intents: [
		{
			id: "Repeat",
			priority: 1,
			threshold: 0.75,
			signals: [
				{
					rule: "search-shape",
					pattern: "grep|glob|read|bash|edit|write",
					weight: 0.5,
				},
				{
					rule: "literal-shape",
					pattern: '"[^"]+\\.(?:ts|tsx|js|mjs|md|json)"',
					weight: 0.4,
				},
				{
					rule: "context-shape",
					pattern: "pattern|file_path|command",
					weight: 0.3,
				},
			],
			// The static fallback set: NEVER emitted for Repeat (a replay
			// answer without a record is a guess). Kept for the pack schema's
			// completeness; Function/Apply abstains instead of using it.
			targets: [],
			note: "the recall is the answer; without a record the hook abstains.",
		},
	],
} satisfies Pack;
