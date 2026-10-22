// Service - the `workspaceOperate` service (Function/Service): extends the
// cordis Service base and is REGISTERED FROM APPLY (the loader contract for
// the object-form plugin: apply constructs the service; the Service base
// constructor calls ctx.reflect.provide("workspaceOperate", this), so
// `ctx.workspaceOperate` resolves). Declaration merging below gives the
// typed accessor.
//
// The methods are thin delegates (one Function module each):
//
//   proposeRename(input) / proposeConnect(input) / proposeReplace(input)
//                          - the resolution rules + the refusal-to-guess;
//   list(filter?)          - the filtered proposal table;
//   get(id)                - one proposal or undefined;
//   withdraw(id)           - mark one proposal withdrawn;
//   statistics()           - the honest counts.
import { Service, type Context } from "@deepseek-ai/cordis";
import Propose from "@Function/Propose.js";
import * as Query from "@Function/Query.js";
import Withdraw from "@Function/Withdraw.js";
import type Filter from "@Interface/Filter.js";
import type Outcome from "@Interface/Outcome.js";
import type Proposal from "@Interface/Proposal.js";
import type State from "@Interface/State.js";
import type Statistics from "@Interface/Statistics.js";

export default class WorkspaceOperate extends Service {
	/** The apply-built state the methods read and write. */
	State: State;

	constructor(Context: Context, State: State) {
		super(Context, "workspaceOperate");
		this.State = State;
	}

	/** Propose a rename through the resolution rules. */
	proposeRename(Input: unknown): Promise<Outcome> {
		return Propose(this.State, "rename", Input);
	}

	/** Propose a connect through the resolution rules. */
	proposeConnect(Input: unknown): Promise<Outcome> {
		return Propose(this.State, "connect", Input);
	}

	/** Propose a replace through the resolution rules. */
	proposeReplace(Input: unknown): Promise<Outcome> {
		return Propose(this.State, "replace", Input);
	}

	/** The filtered proposal table. */
	list(Filter?: Filter): Proposal[] {
		return Query.List(this.State, Filter);
	}

	/** One proposal by id, or undefined. */
	get(Id: string): Proposal | undefined {
		return Query.One(this.State, Id);
	}

	/** Mark one proposal withdrawn. */
	withdraw(Id: string): boolean {
		return Withdraw(this.State, Id);
	}

	/** The honest statistics. */
	statistics(): Statistics {
		return Query.Statistics(this.State);
	}
}

// Declaration merging: the typed accessor on the cordis Context.
declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The workspace-operate hook's service (registered from apply). */
		workspaceOperate: WorkspaceOperate;
	}
}
