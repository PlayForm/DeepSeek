// Service - the `workspaceEvidence` service (Function/Service): extends the
// cordis Service base and is REGISTERED FROM APPLY (the loader contract for
// the object-form plugin: apply constructs the service; the Service base
// constructor calls ctx.reflect.provide("workspaceEvidence", this), so
// `ctx.workspaceEvidence` resolves). Declaration merging below gives the
// typed accessor.
//
// The methods are thin delegates (one Function module each):
//
//   validate(id, kind, subject, dependencies, verdict?)
//                      - record one validation object (the claim's proof
//                        record; a revalidation supersedes the old object);
//   check(id)           - the object's current status or undefined;
//   invalidate(key)     - the Acar seam: mark every object depending on the
//                        key stale (explicit form of the fs/observed seam);
//   list(status?)       - the objects, optionally filtered by status;
//   statistics()        - { validations, fresh, stale, superseded, sequence }.
import { Service, type Context } from "@deepseek-ai/cordis";
import Declare from "@Function/Declare.js";
import Invalidate from "@Function/Invalidate.js";
import Ledger from "@Function/Ledger.js";
import type State from "@Interface/State.js";
import type { TruthKind } from "@Interface/TruthKind.js";
import type Validation from "@Interface/Validation.js";

export default class WorkspaceEvidence extends Service {
	/** The apply-built state the methods read and write. */
	State: State;

	constructor(Context: Context, State: State) {
		super(Context, "workspaceEvidence");
		this.State = State;
	}

	/** Record one validation object (a revalidation supersedes the old). */
	validate(
		Id: string,
		Kind: TruthKind,
		Subject: string,
		Dependencies: string[],
		Verdict: "verified" | "unverified" = "unverified",
	): Validation {
		return Declare(this.State, Id, Kind, Subject, Dependencies, Verdict);
	}

	/** The object's current status, or undefined for an unknown id. */
	check(Id: string): Validation["status"] | undefined {
		return Ledger.Check(this.State, Id);
	}

	/** The Acar seam: mark every object depending on the key stale. */
	invalidate(Key: string): number {
		return Invalidate(this.State, Key);
	}

	/** The objects, optionally filtered by status, oldest first. */
	list(Status?: Validation["status"]): Validation[] {
		return Ledger.List(this.State, Status);
	}

	/** The statistics pentuple. */
	statistics(): {
		validations: number;
		fresh: number;
		stale: number;
		superseded: number;
		sequence: number;
	} {
		return Ledger.Statistics(this.State);
	}
}

// Declaration merging: the typed accessor on the cordis Context.
declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The workspace-evidence service (registered from apply). */
		workspaceEvidence: WorkspaceEvidence;
	}
}
