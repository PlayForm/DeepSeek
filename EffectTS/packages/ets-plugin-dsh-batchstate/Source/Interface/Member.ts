// Member - one batch member's LIVE record (Interface/Member). The record is
// the CURRENT ACTIVITY, not the initial spec: the task field is what the
// agent is doing right now, updated by setTask at every phase change.
//
// THE STATUSES (the plan's state machine): idle -> active -> completed |
// failed -> interrupted. A terminal status leaves the running lanes and
// puts the member on the completions ring (the recent list).
export default interface Member {
	/** The agent's id (the session id the parent uses). */
	id: string;
	/** The lane's role (coder/explorer/planner/...). */
	role: string;
	/** The CURRENT ACTIVITY - the last-updated phase/target, never the
	 *  initial spec. */
	task: string;
	/** The status (the plan's state machine). */
	status: "idle" | "active" | "completed" | "failed" | "interrupted";
	/** The queue position; -1 = not queued (running or done). */
	queue: number;
	/** The surfaces (paths) the member owns; the scope registry. */
	scope: string[];
	/** Activation timestamp (epoch ms; set once, by the first transition to
	 *  active). */
	startedAt: number;
	/** Completion timestamp; 0 until the member leaves the running lanes. */
	finishedAt: number;
}
