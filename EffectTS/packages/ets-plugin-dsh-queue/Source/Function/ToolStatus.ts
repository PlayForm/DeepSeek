// ToolStatus - the `queue_status` tool: the queue record's surface (the
// active lanes and their tasks, the queued lanes, the board line). One
// canonical JSON value; the presenter is pure.
import type State from "@Interface/State.js";

export default (State: State) => ({
	name: "queue_status",
	description:
		"The subagent queue record: the tasks and their states, the seats, the batch-state TOC line.",
	parameters: { type: "object", properties: {} },
	exec() {
		try {
			if (!State.On) {
				return { ok: false, error: "queue disabled (enabled=false)" };
			}
			const Snapshot = State.DshQueue?.Snapshot();
			return Snapshot
				? {
						ok: true,
						board: Snapshot.board,
						tasks: Snapshot.tasks.map((Task_) => ({
							id: Task_.id,
							state: Task_.state,
							priority: Task_.priority,
							agent: Task_.assignedAgent,
							route: Task_.route,
						})),
					}
				: { ok: false, error: "snapshot failed" };
		} catch (Error) {
			return { ok: false, error: String(Error) };
		}
	},
});
