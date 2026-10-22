// Bind - the service's bind path (Function/Bind): register one EXACT
// candidate as a pending binding. The exact-approval semantics:
//
//   * the candidate must carry a non-empty path, a non-empty fingerprint and
//     a non-empty version - a candidate missing its identity is rejected
//     (decision `rejected`, ledger `rejected <path> (<reason>)`), never
//     bound with made-up values;
//   * with config `requireConstraints` (the default), a candidate without at
//     least one constraint is rejected - the constraints travel with the
//     approval (APPROVE.md), so an approval without a stated constraint set
//     is not an approval;
//   * the binding id is `ap-<sequence>`; the sequence is the plugin's own
//     monotonic counter, never a wall clock.
import Record from "@Function/Record.js";
import type Binding from "@Interface/Binding.js";
import type Candidate from "@Interface/Candidate.js";
import type State from "@Interface/State.js";

export default (State: State, Candidate: Candidate): Binding => {
	const Path = String(Candidate.path ?? "");
	const Fingerprint = String(Candidate.fingerprint ?? "");
	const Version = String(Candidate.version ?? "");
	const Constraints = Array.isArray(Candidate.constraints)
		? Candidate.constraints.map((Constraint) => String(Constraint))
		: [];
	const Reject = (Reason: string): Binding => {
		State.Factory.Append(State, `rejected ${Path} (${Reason})`);
		const Rejected: Binding = {
			id: `ap-${State.Sequence}`,
			path: Path,
			fingerprint: Fingerprint,
			version: Version,
			constraints: Constraints,
			summary: String(Candidate.summary ?? ""),
			decision: "rejected",
			committedBy: undefined,
			sequence: State.Sequence,
		};
		Record(State, Rejected);
		return Rejected;
	};
	switch (true) {
		case Path.length === 0 || Fingerprint.length === 0 || Version.length === 0:
			return Reject("candidate identity incomplete");
		case State.RequireConstraints && Constraints.length === 0:
			return Reject("no constraints");
		default:
	}
	State.Sequence += 1;
	const Binding: Binding = {
		id: `ap-${State.Sequence}`,
		path: Path,
		fingerprint: Fingerprint,
		version: Version,
		constraints: Constraints,
		summary: String(Candidate.summary ?? ""),
		decision: "pending",
		committedBy: undefined,
		sequence: State.Sequence,
	};
	State.Factory.Append(State, `bound ${Binding.id} ${Path} fingerprint ${Fingerprint}`);
	Record(State, Binding);
	return Binding;
};
