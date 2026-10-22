// Service - the `workspaceReflect` service (Function/Service): extends the
// cordis Service base and is REGISTERED FROM APPLY (the loader contract for
// the object-form plugin: apply constructs the service; the Service base
// constructor calls ctx.reflect.provide("workspaceReflect", this), so
// `ctx.workspaceReflect` resolves). Declaration merging below gives the
// typed accessor.
//
// The methods are thin delegates (one Function module each), each a ONE-CALL
// reflective operation returning the reply union (the reply is part of the
// type):
//
//   rename(op)   - the AST-aware rename across the affected references;
//   connect(op)  - connect two blocks/files with a reference;
//   replace(op)  - replace a block's span with new text;
//   act(op)      - the dispatch by the operation's kind.
import { Service, type Context } from "@deepseek-ai/cordis";
import Connect from "@Function/Connect.js";
import Rename from "@Function/Rename.js";
import Replace from "@Function/Replace.js";
import type { Operation } from "@Interface/Operation.js";
import type Reply from "@Interface/Reply.js";
import type State from "@Interface/State.js";

export default class WorkspaceReflect extends Service {
	/** The apply-built state the methods read and write. */
	State: State;

	constructor(Context: Context, State: State) {
		super(Context, "workspaceReflect");
		this.State = State;
	}

	/** The reflective rename: one call across the affected references. */
	rename(Operation: Extract<Operation, { kind: "rename" }>): Promise<Reply> {
		return Rename(this.State, Operation);
	}

	/** The reflective connect: one call joining two blocks/files. */
	connect(Operation: Extract<Operation, { kind: "connect" }>): Promise<Reply> {
		return Connect(this.State, Operation);
	}

	/** The reflective replace: one call replacing a block's span. */
	replace(Operation: Extract<Operation, { kind: "replace" }>): Promise<Reply> {
		return Replace(this.State, Operation);
	}

	/** The dispatch by the operation's kind (the single-call entry). */
	act(Operation: Operation): Promise<Reply> {
		switch (Operation.kind) {
			case "rename":
				return Rename(this.State, Operation);
			case "connect":
				return Connect(this.State, Operation);
			default:
				return Replace(this.State, Operation);
		}
	}
}

// Declaration merging: the typed accessor on the cordis Context.
declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The workspace-reflect service (registered from apply). */
		workspaceReflect: WorkspaceReflect;
	}
}
