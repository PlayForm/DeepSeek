// Dispatcher - the subagent-queue SERVICE (the factory's class/service
// pattern). Registered as `dshQueue` immediately on construction and removed
// with its owning fiber; it holds the State (the queue store, the seats) and
// exposes the surface the orchestration layer consumes:
//
//   Enqueue(input)          - queue a task (the task as data, spec verbatim)
//   Dispatch(agent?)        - the deterministic next assignment (a freed slot)
//   Start(id) / Complete(id, hash?) / Fail(id) / Interrupt(id)
//                           - the state machine (Complete/Fail/Interrupt release seats)
//   Board()                 - the batch-state TOC line
//   Snapshot()              - the full record (the queue record's contract)
//   Capacity(agent?)        - the free slots for the main pool or an agent
//
// Every method delegates to one Function module; the State's volatile fields
// are read live, so a capacity edit applies to the next dispatch without a
// remount.
import { Service, type Context } from "@deepseek-ai/cordis";
import BoardFn from "@Function/Board.js";
import CapacityFn, { MAIN } from "@Function/Capacity.js";
import DispatchFn from "@Function/Dispatch.js";
import EnqueueFn, { type Input } from "@Function/Enqueue.js";
import SettleFn from "@Function/Settle.js";
import type State from "@Interface/State.js";
import type Task from "@Interface/Task.js";

export default class Dispatcher extends Service {
	private Context: Context;
	private State: State;

	constructor(Context_: Context, State_: State) {
		super(Context_, "dshQueue");
		this.Context = Context_;
		this.State = State_;
	}

	/** Queue a task (the task as data; the spec is stored verbatim). */
	Enqueue(Input_: Input): Task {
		return EnqueueFn(this.State, Input_, (Message) =>
			this.State.Factory?.Append(this.State, Message),
		);
	}

	/** The deterministic next assignment for the main pool (or a named
	 * agent's child cap). Undefined = nothing eligible or no capacity. */
	Dispatch(Agent = MAIN): Task | undefined {
		return DispatchFn(this.State, Agent, (Message) =>
			this.State.Factory?.Append(this.State, Message),
		);
	}

	/** The free slots for the main pool (default) or a named agent. */
	Capacity(Agent = MAIN): number {
		return CapacityFn(this.State, Agent);
	}

	/** The task entered execution (dispatched -> running; no seat change). */
	Start(Id: string): Task | undefined {
		const Task_ = this.State.Tasks.get(Id);
		if (Task_ === undefined || Task_.state !== "dispatched") {
			return Task_;
		}
		Task_.state = "running";
		this.State.Factory?.Journal(this.State, "task running", Id, Task_.assignedAgent ?? MAIN);
		this.State.Factory?.Append(this.State, `running ${Id}`);
		return Task_;
	}

	/** Complete a task (releases the seat; the auto-dispatch regime fills
	 * the freed slot on the next Dispatch call). */
	Complete(Id: string, ResultHash?: string): Task | undefined {
		return SettleFn(this.State, Id, "completed", ResultHash, (Message) =>
			this.State.Factory?.Append(this.State, Message),
		);
	}

	/** Fail a task (releases the seat). */
	Fail(Id: string): Task | undefined {
		return SettleFn(this.State, Id, "failed", undefined, (Message) =>
			this.State.Factory?.Append(this.State, Message),
		);
	}

	/** Interrupt a task (releases the seat; the partial state persists in the
	 * journal for the restart reconciliation). */
	Interrupt(Id: string): Task | undefined {
		return SettleFn(this.State, Id, "interrupted", undefined, (Message) =>
			this.State.Factory?.Append(this.State, Message),
		);
	}

	/** The batch-state TOC line (the pre-baked queue visibility). */
	Board(): string {
		return BoardFn(this.State);
	}

	/** The full queue record: the active lanes and their tasks, the queued
	 * lanes, the reports delivered (the queue record's contract). */
	Snapshot(): { tasks: Task[]; board: string } {
		return {
			tasks: [...this.State.Tasks.values()],
			board: BoardFn(this.State),
		};
	}

	/** The loading context (the orchestrator's tooling consumes the queue
	 * through this service, never through the state). */
	get Owner(): Context {
		return this.Context;
	}
}
