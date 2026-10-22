// Board - the batch-state integration (section 2.4): the queue's state as
// ONE compiled TOC line, pre-baked into the orchestration layer's context
// block. Byte-stable template:
//
//   QUEUE: <n> pending - next: <id|none> - running: <m>/<limit>
//
// The parent-bound visibility rule (the ORCHESTRATION-FAMILY's table): the
// orchestrator's view carries the full line; an agent's own view is its own
// task only, which the compiler derives from the snapshot, not from here.
import type State from "@Interface/State.js";

export default (State: State): string => {
	let Pending = 0;
	let Running = 0;
	let Next: string | undefined;
	for (const Task_ of State.Tasks.values()) {
		if (Task_.state === "queued") {
			Pending += 1;
			if (Next === undefined || Task_.priority > (State.Tasks.get(Next)?.priority ?? 0)) {
				Next = Task_.id;
			}
		} else if (Task_.state === "dispatched" || Task_.state === "running") {
			Running += 1;
		}
	}
	const Active = State.Seats.get("main") ?? 0;
	return `QUEUE: ${Pending} pending - next: ${Next ?? "none"} - running: ${Running}/${State.Capacity.main} (main seats ${Active})`;
};
