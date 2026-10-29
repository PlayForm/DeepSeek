// Outcome - the feedback handoff (Function/Outcome): a batch outcome
// (applied / rejected) feeds the honest-feedback journal and summary. The
// plan defers this to the caller side, and the ingester IS the caller that
// owns the outcome: it alone knows whether the write path applied, conflicted
// or required recovery.
//
// The feedback service (`ctx.feedback`, plugin-dsh-feedback) is probed at
// use time (the family's optional-service rule): absent = a silent skip, the
// ingester's own journal still records the apply.
import type Decision from "../Interface/Decision.js";
import type Proposal from "../Interface/Proposal.js";
import type Result from "../Interface/Result.js";
import type State from "../Interface/State.js";

/** The slice of the feedback service the handoff uses (structural). */
interface Feedback {
	Outcome?: (
		Session: string,
		AgentId: string,
		Proposal: string,
		Outcome: string,
		Detail: string,
	) => unknown;
}

export default (State: State, Proposal: Proposal, Decision: Decision, Result: Result): void => {
	const Holder = State.Context as unknown as { get?: (Name: string) => unknown };
	const Service = Holder?.get?.("feedback") as Feedback | undefined;
	switch (true) {
		case typeof Service?.Outcome !== "function":
			return;
		default:
			break;
	}
	const Outcome =
		Result.applied > 0 && Result.conflicts === 0 && Result.recovery === 0
			? "applied"
			: "rejected";
	try {
		Service.Outcome(
			Proposal.origin ?? "",
			Proposal.origin ?? "",
			Decision.proposal,
			Outcome,
			`applied ${Result.applied}, conflicts ${Result.conflicts}, recovery ${Result.recovery}`,
		);
	} catch {
		/* the feedback hop is best-effort - the apply already happened */
	}
};
