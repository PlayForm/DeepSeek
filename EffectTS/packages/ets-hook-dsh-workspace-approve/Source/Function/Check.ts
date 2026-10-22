// Check - the merge/execute side of the exact-approval contract
// (Function/Check): does an APPROVED binding cover THIS EXACT change set?
//
// The guard chain, in order (each outcome its own honest decision):
//   1. no binding for the path + fingerprint -> `unbound`;
//   2. a binding exists but is not `approved` -> its own decision
//      (`pending`/`denied`/`rejected`/`revoked`/`invalidated`);
//   3. an approved binding whose version differs from the request's ->
//      `stale` - the candidate changed after the approval; an intent must
//      not authorize its own means (the approval of an intention never
//      authorizes the implementation produced later);
//   4. otherwise -> `approved`.
//
// AN INTENT MUST NOT AUTHORIZE ITS OWN MEANS: this check validates the
// implementation against the approved candidate, it never grants authority
// by itself - the authority licensing happened earlier in the flow.
import type Binding from "@Interface/Binding.js";
import type Check from "@Interface/Check.js";
import type Request from "@Interface/Request.js";
import type State from "@Interface/State.js";

export default (State: State, Request: Request): Check => {
	const Path = String(Request.path ?? "");
	const Fingerprint = String(Request.fingerprint ?? "");
	const Version = String(Request.version ?? "");
	// Newest-first: the ring holds the bindings in creation order, the latest
	// decision for the exact candidate is the one that counts.
	const Found = [...State.Ring]
		.reverse()
		.find(
			(Candidate: Binding) =>
				Candidate.path === Path && Candidate.fingerprint === Fingerprint,
		);
	const Result = (Decision: Check["decision"], Reason: string): Check => {
		State.Factory.Append(State, `checked ${Path} (${Decision})`);
		return {
			bound: Found !== undefined,
			decision: Decision,
			id: Found !== undefined ? Found.id : undefined,
			reason: Reason,
		};
	};
	switch (true) {
		case Found === undefined:
			return Result("unbound", "no approval for this exact candidate");
		default:
	}
	const Candidate = Found as Binding;
	switch (true) {
		case Candidate.decision !== "approved":
			return Result(Candidate.decision, `binding ${Candidate.id} is not approved`);
		case Candidate.version !== Version:
			return Result("stale", "candidate changed after the approval");
		default:
			return Result("approved", "");
	}
};
