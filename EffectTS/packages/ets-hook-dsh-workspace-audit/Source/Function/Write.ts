// Write - the line-recording path (Function/Write): build the AuditLine
// from the caller's input, assign the monotonic id/sequence, ledger it, and
// persist it (Function/Record). This is the ONE path every line takes -
// the listener's and the service's - so the id format and the ledger line
// format have exactly one definition.
//
// The ledger line format (module-owned, byte-stable):
//   audit <category> <operation> (<outcome>) <path>
//   with an assessment suffix for intent-assessment lines:
//   audit intent-assessment <operation> (satisfied|unsatisfied) <assessment>
import Record from "@Function/Record.js";
import type Line from "@Interface/Line.js";
import type State from "@Interface/State.js";

export default (
	State: State,
	Input: {
		operation: string;
		parent: string;
		category: Line["category"];
		path: string;
		outcome: Line["outcome"];
		assessment?: string;
	},
): Line => {
	State.Sequence += 1;
	const Entry: Line = {
		id: `a${State.Sequence}`,
		operation: Input.operation,
		parent: Input.parent,
		category: Input.category,
		path: Input.path,
		outcome: Input.outcome,
		assessment: Input.assessment ?? "",
		sequence: State.Sequence,
		at: Date.now(),
	};
	// The ledger line: the accountability record in human-readable form.
	// An assessment line renders its verdict; everything else renders the
	// outcome.
	const Verdict =
		Input.category === "intent-assessment"
			? Input.assessment === ""
				? "unsatisfied"
				: Input.assessment
			: Input.outcome;
	State.Factory.Append(
		State,
		`audit ${Input.category} ${Input.operation} (${Verdict}) ${Input.path}`,
	);
	Record(State, Entry);
	return Entry;
};
