// Queue - the idle-queue append (Function/Queue): enqueue one member at the
// tail (the plan's queue management: the plugin holds the idle queue + the
// pair schedule). Idempotent: an already-queued id is a no-op (the queue
// position is unchanged). The append is ledgered and emitted after the
// state is updated. Removal happens through setStatus's terminal transition
// (Function/Status) - a removal shifts the remaining members up.
import Emit from "@Function/Emit.js";
import Ensure from "@Function/Ensure.js";
import type State from "@Interface/State.js";

export default (State: State, Agent: string): void => {
	switch (true) {
		case State.IdleQueue.includes(Agent):
			return; // already queued - idempotent
	}
	const Member = Ensure(State, Agent);
	State.IdleQueue.push(Agent);
	Member.queue = State.IdleQueue.length - 1;
	State.Factory.Append(State, `queued ${Agent} (position ${Member.queue})`);
	Emit(State, { batch: State.Batch, id: Agent, kind: "queue" });
};
