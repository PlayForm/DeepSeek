// Passage — the per-event hand-off between the module's transform (the
// chain pass, Function/Transform) and the update stage that follows it
// (Function/Observe → Filter/Dispatch) — the SAME ROLE as the package.json
// governor's Interface/Passage (the naming unification, P4): created fresh
// for every observed event and closed over by the transform and the
// follow-up. The cargo's passage carries its own fields (the decoded
// manifest, the resolved update-policy path and the refusal flag — the
// governor's carries Current + Proceed): the shapes differ, the ROLE and
// the name are now uniform.
//
//   Manifest — the decoded manifest (Function/Decode), as read by the
//             factory's Continue; the update stage's Filter input.
//   Policy   — the resolved update-policy path (Function/Resolve,
//             first-wins — engine input), recorded by the transform and
//             reused by the update stage (one resolution per event).
//   Refused  — set when the rewrite was REFUSED (a section intruder or a
//             Pin refusal): the pre-refactor flow skipped the update stage
//             entirely in that case, and Function/Observe honors the flag
//             the same way.
import type Manifest from "@Interface/Manifest.js";

export default interface Passage {
	/** The decoded manifest from the transform — the update stage's input. */
	Manifest: Manifest | null;
	/** The resolved update-policy path (Function/Resolve — first-wins). */
	Policy: string;
	/** Set when the rewrite was REFUSED (a section intruder or a Pin
	 *  refusal): the pre-refactor flow skipped the update stage entirely in
	 *  that case, and the module's Observe honors this flag the same way. */
	Refused: boolean;
}
