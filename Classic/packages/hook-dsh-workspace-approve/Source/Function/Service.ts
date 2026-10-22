// Service - the `workspaceApprove` service (Function/Service): extends the
// cordis Service base and is REGISTERED FROM APPLY (the loader contract for
// the object-form plugin: apply constructs the service; the Service base
// constructor calls ctx.reflect.provide("workspaceApprove", this), so
// `ctx.workspaceApprove` resolves). Declaration merging below gives the
// typed accessor.
//
// The methods are thin delegates (one Function module each):
//
//   bind(candidate)              - register an exact candidate as pending;
//   approve(id, who, constraints?) / deny(id, who) / revoke(id, who)
//                                - the human decision paths;
//   check(request)               - the merge/execute side's exactness check;
//   binding(id) / bindings(limit?) / statistics() - the read surface.
import { Service, type Context } from "@deepseek-ai/cordis";
import BindFn from "@Function/Bind.js";
import Check from "@Function/Check.js";
import Decide from "@Function/Decide.js";
import { ById, Ring, Statistics } from "@Function/Query.js";
import type Binding from "@Interface/Binding.js";
import type Candidate from "@Interface/Candidate.js";
import type CheckResult from "@Interface/Check.js";
import type Request from "@Interface/Request.js";
import type State from "@Interface/State.js";

export default class WorkspaceApprove extends Service {
	/** The apply-built state the methods read and write. */
	State: State;

	constructor(Context: Context, State: State) {
		super(Context, "workspaceApprove");
		this.State = State;
	}

	/** Register an exact candidate as a pending binding. */
	bind(Candidate: Candidate): Binding {
		return BindFn(this.State, Candidate);
	}

	/** Approve a pending binding; a changed constraint set rejects. */
	approve(Id: string, Who: string, Constraints?: string[]): Binding | undefined {
		return Decide(this.State, Id, "approve", Who, Constraints);
	}

	/** Deny a pending binding. */
	deny(Id: string, Who: string): Binding | undefined {
		return Decide(this.State, Id, "deny", Who, undefined);
	}

	/** Revoke an approved binding. */
	revoke(Id: string, Who: string): Binding | undefined {
		return Decide(this.State, Id, "revoke", Who, undefined);
	}

	/** The exactness check for the merge/execute side. */
	check(Req: Request): CheckResult {
		return Check(this.State, Req);
	}

	/** One binding by id, or undefined. */
	binding(Id: string): Binding | undefined {
		return ById(this.State, Id);
	}

	/** The ring, newest first (an optional limit slices the head). */
	bindings(Limit?: number): Binding[] {
		return Ring(this.State, Limit);
	}

	/** The statistics triple. */
	statistics(): { bindings: number; byId: number; sequence: number } {
		return Statistics(this.State);
	}
}

// Declaration merging: the typed accessor on the cordis Context.
declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The workspace-approve hook's service (registered from apply). */
		workspaceApprove: WorkspaceApprove;
	}
}
