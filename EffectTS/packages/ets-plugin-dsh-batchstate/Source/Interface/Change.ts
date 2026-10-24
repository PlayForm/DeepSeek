// Change - the batch/state-change event payload (Interface/Change): one
// state transition. The kind is the write API that caused it (or "clear"
// for the reset; "proposal" / "decision" / "gate" for the inbox splice and
// the Gates block). Emitted after the state is updated and persisted; the
// consumers re-splice the compiled block (the plan's refresh trigger).
export default interface Change {
	/** The batch key. */
	batch: string;
	/** The member id, the proposal id, the gate name - or "" for a
	 *  whole-batch change (clear). */
	id: string;
	/** The write API that caused the change. */
	kind: "task" | "status" | "scope" | "queue" | "clear" | "proposal" | "decision" | "gate";
}
