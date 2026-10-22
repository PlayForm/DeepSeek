// Classify - the task-type inference (ROUTING-ENFORCER-PLUGIN.md section
// 2.1): when the orchestrator does NOT declare a role, the plugin derives it
// from the task's shape using the keyword table. Pure and deterministic: the
// same spec text and the same table always produce the same role.
//
// Order matters and is documented: the planner keywords are scanned FIRST
// (a "design the fix" task is planning, not coding), then coder, then
// explorer - a later scan can never downgrade an earlier match. Matching is
// a case-insensitive substring test on the spec text; the word boundaries
// are deliberately loose so inflections ("redesign", "implementation")
// match their stems. No match and no declared type: the caller falls back
// to the policy's default role.
import type { KeywordTable, Role } from "@Interface/Policy.js";

export default (Spec: string, Keywords: KeywordTable): Role | undefined => {
	const Text = Spec.toLowerCase();
	// The scan order: planner, coder, explorer (a later scan never downgrades
	// an earlier match).
	const Order: Role[] = ["planner", "coder", "explorer"];
	for (const Role of Order) {
		const Words = Keywords[Role] ?? [];
		for (const Word of Words) {
			if (Text.includes(Word.toLowerCase())) {
				return Role;
			}
		}
	}
	return undefined;
};
