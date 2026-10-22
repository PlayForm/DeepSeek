// Recovery - the FAIL-OPEN RECOVERY TABLE (the honest recovery, v4.1 section
// 3.9: per-obligation failure behavior). One row per obligation; the
// behavior decides what happens when the obligation CANNOT be evaluated
// (not when it evaluates to a denial - an honest denial is a denial):
//
//   contributes   -> fail-open   (an unevaluable contribution check passes;
//                                  the operate family owns the intent, the
//                                  gate owns the means - a broken means-
//                                  check must not block the workspace);
//   scope         -> fail-closed (an unevaluable authorized-scope check
//                                  DENIES - the gate is the enforcement
//                                  boundary, and scope is the boundary
//                                  itself; failing open would leave the
//                                  boundary unguarded);
//   policy        -> fail-open   (a policy-table read failure passes - the
//                                  gate never blocks on its own config);
//   preconditions -> fail-open   (unevaluable preconditions pass; the
//                                  proposal carries them honestly and an
//                                  explicitly FALSE precondition denies -
//                                  that is evaluation, not failure).
//
// A config override (config `recovery`) replaces one row; an unknown
// obligation or behavior in an override is ignored, never guessed.
import type RecoveryRule from "@Interface/Recovery.js";

/** The per-obligation failure behavior. */
export type Behavior = "fail-open" | "fail-closed";

/** The resolved table, one named row per obligation. */
export interface Table {
	contributes: Behavior;
	scope: Behavior;
	policy: Behavior;
	preconditions: Behavior;
}

const DEFAULTS: Table = {
	contributes: "fail-open",
	scope: "fail-closed",
	policy: "fail-open",
	preconditions: "fail-open",
};

export default (Overrides: RecoveryRule[]): Table => {
	const Table = { ...DEFAULTS };
	for (const Rule of Overrides) {
		if (Rule && Rule.obligation in DEFAULTS) {
			if (Rule.behavior === "fail-open" || Rule.behavior === "fail-closed") {
				Table[Rule.obligation] = Rule.behavior;
			}
		}
	}
	return Table;
};
