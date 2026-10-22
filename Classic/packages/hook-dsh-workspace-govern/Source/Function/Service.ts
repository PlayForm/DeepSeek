// Service - the `workspaceGovern` service (Function/Service): extends the
// cordis Service base and is REGISTERED FROM APPLY (the loader contract for
// the object-form plugin: apply constructs the service; the Service base
// constructor calls ctx.reflect.provide("workspaceGovern", this), so
// `ctx.workspaceGovern` resolves). Declaration merging below gives the typed
// accessor.
//
// The methods are thin delegates (one Function module each):
//
//   gate(proposal)   - run the four independent means-checks and return the
//                      gate decision (the same Decide path the waterfall
//                      uses; the proposals become the effects ONLY through
//                      the gates, and this method is that gate for any
//                      consumer that holds a proposal record);
//   decisions(limit) - the decision ring, newest first;
//   statistics()     - { decisions, sequence }.
import { Service, type Context } from "@deepseek-ai/cordis";
import type Decision from "@Interface/Decision.js";
import type Proposal from "@Interface/Proposal.js";
import type State from "@Interface/State.js";

import Decide from "./Decide.js";

export default class WorkspaceGovern extends Service {
	/** The apply-built state the methods read and write. */
	State: State;
	/** The ledger sink the gate writes through. */
	Append: (Message: string) => void;

	constructor(Context: Context, State: State, Append: (Message: string) => void) {
		super(Context, "workspaceGovern");
		this.State = State;
		this.Append = Append;
	}

	/** Run the gate on one proposal record. */
	gate(Proposal_: Proposal): Decision {
		return Decide(this.State, Proposal_, this.Append);
	}

	/** The decision ring, newest first (an optional limit slices the head). */
	decisions(Limit?: number): Decision[] {
		const Ring = [...this.State.Decisions].reverse();
		return Limit === undefined ? Ring : Ring.slice(0, Limit);
	}

	/** The statistics pair. */
	statistics(): { decisions: number; sequence: number } {
		return { decisions: this.State.Decisions.length, sequence: this.State.Sequence };
	}
}

// Declaration merging: the typed accessor on the cordis Context.
declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The workspace-govern hook's service (registered from apply). */
		workspaceGovern: WorkspaceGovern;
	}
}
