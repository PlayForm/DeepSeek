// Service - the `workspaceAudit` service (Function/Service): extends the
// cordis Service base and is REGISTERED FROM APPLY (so `ctx.workspaceAudit`
// resolves). Declaration merging below gives the typed accessor.
//
// The methods are thin delegates (one Function module each):
//
//   line(input)          - record any traceability-graph node's line;
//   assessment(operation, verdict) - close the loop: the IntentAssessment
//                          line against the IntentSpecification's
//                          satisfaction contract;
//   chain(operation)     - one operation's lines, in order;
//   lines(limit?)        - the ring, newest first;
//   statistics()         - { operations, lines, sequence }.
import { Service, type Context } from "@deepseek-ai/cordis";
import * as Query from "@Function/Query.js";
import Write from "@Function/Write.js";
import type Line from "@Interface/Line.js";
import type State from "@Interface/State.js";

export default class WorkspaceAudit extends Service {
	/** The apply-built state the methods read and write. */
	State: State;

	constructor(Context: Context, State: State) {
		super(Context, "workspaceAudit");
		this.State = State;
	}

	/** Record one line of the traceability graph. */
	line(Input: {
		operation: string;
		parent?: string;
		category: Line["category"];
		path?: string;
		outcome?: Line["outcome"];
		assessment?: string;
	}): Line {
		return Write(this.State, {
			operation: Input.operation,
			parent: Input.parent ?? "",
			category: Input.category,
			path: Input.path ?? "",
			outcome: Input.outcome ?? "pending",
			...(Input.assessment === undefined ? {} : { assessment: Input.assessment }),
		});
	}

	/** Close the loop: the IntentAssessment line for one operation, recording
	 *  whether its IntentSpecification was satisfied. */
	assessment(Operation: string, Satisfied: boolean, Detail = ""): Line {
		return Write(this.State, {
			operation: Operation,
			parent: "",
			category: "intent-assessment",
			path: "",
			outcome: Satisfied ? "success" : "failure",
			assessment: Satisfied
				? "satisfied"
				: `unsatisfied${Detail === "" ? "" : `: ${Detail}`}`,
		});
	}

	/** One operation's audit chain, in recording order. */
	chain(Operation: string): Line[] {
		return Query.Chain(this.State, Operation);
	}

	/** The ring, newest first (an optional limit slices the head). */
	lines(Limit?: number): Line[] {
		return Query.Lines(this.State, Limit);
	}

	/** The statistics triple. */
	statistics(): { operations: number; lines: number; sequence: number } {
		return Query.Statistics(this.State);
	}
}

// Declaration merging: the typed accessor on the cordis Context.
declare module "@deepseek-ai/cordis" {
	interface Context {
		/** The workspace-audit hook's service (registered from apply). */
		workspaceAudit: WorkspaceAudit;
	}
}
