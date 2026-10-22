// Persist - the fire-and-forget record writer (Function/Persist): one put
// into the opened domain's `proposals` table plus the `__meta` record
// (sequence + refusals). Never awaited by the caller; every failure is
// contained (the storage layer is best-effort - the in-memory table and
// the ledger line are the truth when the domain is absent).
import type Proposal from "@Interface/Proposal.js";
import type State from "@Interface/State.js";

export default (State: State, Proposal: Proposal | undefined): void => {
	const Handle = State.Handle;
	if (Handle === undefined) {
		return;
	}
	void (async () => {
		try {
			if (Proposal !== undefined) {
				await Handle.table("proposals").put(Proposal.id, Proposal);
			}
			await Handle.table("meta").put("__meta", {
				sequence: State.Sequence,
				refused: State.Refused,
			});
		} catch {
			/* storage optional - never on any caller path */
		}
	})();
};
