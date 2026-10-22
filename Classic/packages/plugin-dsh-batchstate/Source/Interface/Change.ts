// Change - the batch/state-change event payload (Interface/Change): one
// state transition. The kind is the write API that caused it (or "clear"
// for the reset). Emitted after the state is updated and persisted; the
// consumers re-splice the compiled block (the plan's refresh trigger).
export default interface Change {
	/** The batch key. */
	batch: string;
	/** The member id, or "" for a whole-batch change (clear). */
	id: string;
	/** The write API that caused the change. */
	kind: "task" | "status" | "scope" | "queue" | "clear";
}
