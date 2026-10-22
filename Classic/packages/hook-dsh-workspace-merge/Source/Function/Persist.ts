// Persist - the fire-and-forget batch record writer (Function/Persist):
// one put into the opened domain's `batches` table plus the `__meta`
// record (sequence). Never awaited by the caller; every failure is
// contained (the storage layer is best-effort - the in-memory map and the
// ledger line are the truth when the domain is absent).
import type Record from "@Interface/Record.js";
import type State from "@Interface/State.js";

export default (State: State, RecordData: Record): void => {
	State.Batches.set(RecordData.id, RecordData);
	const Handle = State.Handle;
	if (Handle === undefined) {
		return;
	}
	void (async () => {
		try {
			await Handle.table("batches").put(RecordData.id, RecordData);
			await Handle.table("meta").put("__meta", { sequence: State.Sequence });
		} catch {
			/* storage optional - never on any caller path */
		}
	})();
};
