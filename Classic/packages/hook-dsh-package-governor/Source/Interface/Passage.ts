// Passage — the per-event hand-off between the module's transform (the chain
// pass, Function/Transform) and the update stage that follows it
// (Function/Follow). The factory's Continue owns the read, the write and the
// refresh, so the module communicates across that boundary through this small
// object, created fresh for every observed event and closed over by the
// transform and the follow-up:
//
//   Current — the DECODED manifest (Function/Decode), as read by the
//             factory's Continue; the update stage's Filter input.
//   Proceed — whether the update stage may follow the chain pass. Set true
//             on the no-change path (synchronously, inside the transform)
//             and inside the transform's `message` callback — which the
//             factory only calls after a SUCCESSFUL guarded write — so a
//             refused or failed rewrite (old Function/Govern returning
//             false, or a stale-version write error) leaves it false and the
//             update stage is skipped, byte-identically with the pre-refactor
//             behavior.
import type Manifest from "@Interface/Manifest.js";

export default interface Passage {
	/** The decoded manifest from the transform — the update stage's input. */
	Current: Manifest | null;
	/** Whether the update stage may follow the chain pass. */
	Proceed: boolean;
}
