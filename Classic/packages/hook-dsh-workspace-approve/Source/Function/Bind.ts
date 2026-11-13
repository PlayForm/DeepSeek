import Record from "@Function/Record.js";
import type Binding from "@Interface/Binding.js";
import type Candidate from "@Interface/Candidate.js";
import type State from "@Interface/State.js";

/**
 * @module Bind
 *
 * The service's bind path: register one EXACT candidate as a pending binding.
 *
 * @remarks
 *
 * The exact-approval semantics:
 *
 * - The candidate must carry a non-empty path, a non-empty fingerprint and a
 *   non-empty version - a candidate missing its identity is rejected (decision
 *   `rejected`, ledger `rejected <path> (<reason>)`), never bound with made-up
 *   values.
 * - With config `requireConstraints` (the default), a candidate without at
 *   least one constraint is rejected - the constraints travel with the approval
 *   (APPROVE.md), so an approval without a stated constraint set is not an
 *   approval.
 * - The binding id is `ap-<sequence>`; the sequence is the plugin's own
 *   monotonic counter, never a wall clock.
 *
 * The CALL-TIME master switch: a disabled hook refuses with `undefined` and
 * ZERO ledger lines (the live-flip law - State.On is read at the moment of
 * the call, never captured at mount).
 */
export default (State: State, Candidate: Candidate): Binding | undefined => {
	switch (true) {
		case State.On === false:
			return undefined;
		default:
	}
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
