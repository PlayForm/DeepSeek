/**
 * @module Enqueue
 *
 * Put one task into the queue store (section 2.1): the task as data, no
 * agent context consumed.
 *
 * @remarks
 * The spec is stored verbatim (the queue
 * NEVER alters the self-contained prompts - the dispatcher only schedules).
 * The id and the enqueue sequence are assigned here (monotonic, the FIFO
 * tiebreaker), the initial state is `queued`, and one journal record +
 * one ledger line are written (the family's conventions).
 */
import type State from "@Interface/State.js";
import type Task from "@Interface/Task.js";
import type { TaskState } from "@Interface/Task.js";

/**
 * The enqueue input: everything except the id/seq/state bookkeeping. Each
 * optional field may also be explicitly undefined (the tool's parsed
 * arguments arrive that way).
 */
export interface Input {
	/**
	 * The task's self-contained prompt, stored verbatim.
	 */
	spec: string;
	/**
	 * The task's role hint (undefined = `auto`).
	 */
	role?: Task["role"];
	/**
	 * The scheduling priority (higher first; default 0).
	 */
	priority?: number | undefined;
	/**
	 * The ids this task waits on.
	 */
	dependsOn?: string[] | undefined;
}

/**
 * Map a state flip to the journal event name (the P5 record vocabulary).
 */
export const EventOf = (State_: TaskState): string => `task ${State_}`;

export default (State: State, Input_: Input, Append: (Message: string) => void): Task => {
	State.Seq += 1;
	const Task_: Task = {
		id: `queue-${State.Seq}`,
		spec: Input_.spec,
		role: Input_.role,
		priority: Input_.priority ?? 0,
		dependsOn: [...(Input_.dependsOn ?? [])],
		state: "queued",
		seq: State.Seq,
		queuedAt: Date.now(),
		attempts: 0,
	};
	State.Tasks.set(Task_.id, Task_);

	// The journal record (best-effort, the factory's P5 writer) + the ledger
	// line. Byte-stable template: `queued <id> <role|auto> p<priority> deps<n>`.
	State.Factory?.Journal(State, EventOf("queued"), Task_.id, `p${Task_.priority}`);
	Append(
		`queued ${Task_.id} ${Task_.role ?? "auto"} p${Task_.priority} deps${Task_.dependsOn.length}`,
	);
	return Task_;
};
