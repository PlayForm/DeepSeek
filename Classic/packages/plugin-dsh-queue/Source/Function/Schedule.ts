// Schedule - the dispatcher's deterministic order (SUBAGENT-QUEUE-PLUGIN.md
// section 2.2, the pair-schedule replacement): from the queued tasks, pick
// the NEXT one to dispatch. Pure and deterministic - the same store always
// produces the same order:
//
//   1. Only tasks whose dependencies are all COMPLETED are eligible (a
//      dependency in any other state blocks the task - it is never skipped
//      over silently, the order simply waits).
//   2. Priority descending (higher first).
//   3. FIFO by enqueue sequence (the Map's insertion order; the seq field
//      makes it explicit).
//
// Returns undefined when nothing is eligible (an empty queue, a saturated
// dependency, or no capacity).
import CapacityFn from "@Function/Capacity.js";
import type State from "@Interface/State.js";
import type Task from "@Interface/Task.js";

export default (State: State, Agent: string): Task | undefined => {
	// The capacity gate first: no free slot, no dispatch.
	if (CapacityFn(State, Agent) <= 0) {
		return undefined;
	}
	// The completed set for the dependency check.
	const Done = new Set<string>();
	for (const Task of State.Tasks.values()) {
		if (Task.state === "completed") {
			Done.add(Task.id);
		}
	}
	// The scan: insertion order (FIFO), filtered, then the highest priority
	// wins (stable - ties stay in FIFO order).
	let Next: Task | undefined;
	for (const Task of State.Tasks.values()) {
		if (Task.state !== "queued") {
			continue;
		}
		if (!Task.dependsOn.every((Id) => Done.has(Id))) {
			continue;
		}
		if (Next === undefined || Task.priority > Next.priority) {
			Next = Task;
		}
	}
	return Next;
};
