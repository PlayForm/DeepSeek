// Claim - the one-apply-per-DECISION gate (Function/Claim): the claim is
// taken SYNCHRONOUSLY, before any await, so the same decision arriving twice
// (the tool's direct handoff and the `batch/decision` event, or the same
// event delivered by two channels) applies EXACTLY once and every caller
// receives the same honest result.
//
// The claim key is the decision's identity - the proposal, the outcome and
// the decision's own timestamp - so a REPEATED delivery collapses while a
// genuinely NEW decision on the same proposal (the user denying after an
// approval, a re-decision after an edit) still runs and reports honestly.
//
// The map holds the claimed promise: the first caller starts the apply, the
// later callers await the same promise. `WhenIdle` drains it for the smokes
// (no sleeps, no timers).
import type Decision from "../Interface/Decision.js";
import type Proposal from "../Interface/Proposal.js";
import type Result from "../Interface/Result.js";
import type State from "../Interface/State.js";
import ApplyFn from "./Apply.js";
import JournalFn from "./Journal.js";
import OutcomeFn from "./Outcome.js";

/** The decision's identity: one apply per (proposal, outcome, at). */
export const Key = (Decision: Decision): string =>
	`${Decision.proposal}:${Decision.outcome}:${Decision.at}`;

export default (State: State, Proposal: Proposal, Decision: Decision): Promise<Result | null> => {
	const Claimed = State.Pending.get(Key(Decision));
	switch (true) {
		case Claimed !== undefined:
			// This exact decision is already in flight or settled: the claim is
			// the idempotency fence, never a second write.
			return Claimed;
		default:
			break;
	}
	const Run = ApplyFn(State, Proposal, Decision)
		.then((Result) => {
			OutcomeFn(State, Proposal, Decision, Result);
			return Result;
		})
		.catch((Error: unknown) => {
			JournalFn(State, "recovery-required", Proposal.id, "", String(Error));
			return null;
		});
	State.Pending.set(Key(Decision), Run);
	return Run;
};
