// Check - the FOUR INDEPENDENT MEANS-CHECKS (Function/Check), one pure
// function of the proposal (the intent-model semantics: an intent must not
// authorize its own means - the gate runs the independent checks BEFORE any
// AuthorizationDecision, and the intent is never the permission):
//
//   contributes      - the proposal declares a non-empty contribution (the
//                      obligation evaluates "n/a" for a synthesized proposal:
//                      the operate family has not attached a record yet, and
//                      a plain tool call is not a declared intent);
//   scope            - the target matches at least one glob of the
//                      authorized-scope allowlist ("n/a" when the allowlist
//                      is empty = unrestricted); UNEVALUABLE (a match error)
//                      is the recovery table's scope row: fail-closed;
//   preconditions    - an explicitly unsatisfied precondition DENIES;
//                      unevaluable (missing) preconditions are the recovery
//                      table's row.
//
// The outcome per obligation is one of: "satisfied", "denied", "n/a",
// "recovery" (the row's behavior was applied). The policy lookup lives in
// Function/Policy, the table in Function/Recovery - Check stays pure.
import type { Obligations, Outcome } from "@Interface/Check.js";
import type Proposal from "@Interface/Proposal.js";
import type State from "@Interface/State.js";

import Glob from "./Glob.js";
import Recovery from "./Recovery.js";

export default (State: State, Proposal_: Proposal): Obligations => {
	const Table = Recovery(State.RecoveryRules);
	const Obligations: Obligations = {
		contributes: "n/a",
		scope: "n/a",
		preconditions: "n/a",
	};
	// contributes: declared and non-empty -> satisfied; declared and empty
	// -> denied; not declared -> n/a.
	if (!Proposal_.declared) {
		Obligations.contributes = "n/a";
	} else {
		Obligations.contributes = Proposal_.contribution.length > 0 ? "satisfied" : "denied";
	}
	// scope: no allowlist -> n/a; a match hit -> satisfied; no hit -> denied;
	// an unevaluable match -> the recovery row (fail-closed -> denied,
	// fail-open -> recovery).
	if (State.Scope.length === 0) {
		Obligations.scope = "n/a";
	} else {
		let Matched: boolean | undefined;
		try {
			Matched = State.Scope.some((Pattern) => Glob(Proposal_.target, Pattern));
		} catch {
			Matched = undefined;
		}
		if (Matched === undefined) {
			Obligations.scope = Table.scope === "fail-open" ? "recovery" : "denied";
		} else {
			Obligations.scope = Matched ? "satisfied" : "denied";
		}
	}
	// preconditions: every declared precondition explicitly unsatisfied ->
	// denied; no preconditions attached -> the recovery row (fail-open ->
	// recovery, fail-closed -> denied).
	const Pre = Proposal_.preconditions;
	if (Pre === undefined) {
		Obligations.preconditions = Table.preconditions === "fail-open" ? "recovery" : "denied";
	} else {
		const Failed = Pre.find((Condition) => Condition.satisfied === false);
		Obligations.preconditions =
			Failed === undefined ? "satisfied" : (`denied:${Failed.name}` as Outcome);
	}
	return Obligations;
};
