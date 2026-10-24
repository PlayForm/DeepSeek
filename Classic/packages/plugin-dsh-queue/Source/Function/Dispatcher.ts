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
//   Reconcile(persisted?)   - the restart reconcile (orphans requeued or failed)
//   Flush()                 - join the in-flight spawns (the tests' and the
//                             reconcile's seam; never a hot-path wait)
//
// Every method delegates to one Function module; the State's volatile fields
// are read live, so a capacity edit applies to the next dispatch without a
// remount.
//
// THE AUTOMATION (the completion wave): with `autoSpawn` on, an assignment
// launches the child through the harness subagent service, and a released
// seat pulls the next queued task (Function/Pull) - after an enqueue and
// after every settle. The child's own result settles its task (completed /
// failed), so the queue runs itself without a caller loop.
import { Service, type Context } from "@deepseek-ai/cordis";
import BoardFn from "@Function/Board.js";
import CapacityFn, { MAIN } from "@Function/Capacity.js";
import DispatchFn from "@Function/Dispatch.js";
import EnqueueFn, { type Input } from "@Function/Enqueue.js";
import PullFn from "@Function/Pull.js";
import ReconcileFn, { type Report } from "@Function/Reconcile.js";
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

	/** The ledger sink (the factory's Append with this State bound). */
	private Append = (Message: string): void => {
		this.State.Factory?.Append(this.State, Message);
	};

	/** Pull the next queued task into every free slot (the idle-slot
	 * automation; gated on autoDispatch AND autoSpawn). */
	private Pull(): string[] {
		return PullFn(this.State, (Agent) => this.Dispatch(Agent));
	}

	/** Queue a task (the task as data; the spec is stored verbatim). */
	Enqueue(Input_: Input): Task {
		const Task_ = EnqueueFn(this.State, Input_, this.Append);
		// A queue with free capacity starts its work immediately when the
		// spawn is allowed; the manual posture pulls nothing.
		this.Pull();
		return Task_;
	}

	/** The deterministic next assignment for the main pool (or a named
	 * agent's child cap). Undefined = nothing eligible or no capacity. */
	Dispatch(Agent = MAIN): Task | undefined {
		return DispatchFn(this.State, Agent, this.Append, (Id, Completed) => {
			if (Completed) {
				this.Complete(Id);
				return;
			}
			this.Fail(Id);
		});
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

	/** Complete a task (releases the seat; the freed slot pulls the next
	 * queued task when the automation is on). */
	Complete(Id: string, ResultHash?: string): Task | undefined {
		const Settled = SettleFn(this.State, Id, "completed", ResultHash, this.Append);
		if (Settled !== undefined) {
			this.Pull();
		}
		return Settled;
	}

	/** Fail a task (releases the seat; the freed slot pulls the next). */
	Fail(Id: string): Task | undefined {
		const Settled = SettleFn(this.State, Id, "failed", undefined, this.Append);
		if (Settled !== undefined) {
			this.Pull();
		}
		return Settled;
	}

	/** Interrupt a task (cancels the spawned child through the spawn's own
	 * abort signal, releases the seat; the partial state persists in the
	 * journal for the restart reconciliation). */
	Interrupt(Id: string): Task | undefined {
		this.State.Controllers.get(Id)?.abort();
		this.State.Controllers.delete(Id);
		const Settled = SettleFn(this.State, Id, "interrupted", undefined, this.Append);
		if (Settled !== undefined) {
			this.Pull();
		}
		return Settled;
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

	/** The restart reconcile: rebuild from the persisted record (when the
	 * caller hands one back), compare every active task with the live agents,
	 * and requeue or fail each orphan honestly. The freed seats then pull the
	 * requeued work when the automation is on. */
	Reconcile(Persisted?: readonly Task[]): Report {
		const Report_ = ReconcileFn(this.State, Persisted, this.Append);
		this.Pull();
		return Report_;
	}

	/** Join the in-flight spawn round-trips (the harness's `startActivation`
	 * calls) and let the children that already settled run their terminal
	 * arm. The automation is otherwise fire-and-forget; the tests (and a
	 * caller that wants a deterministic boundary) await this. It never waits
	 * for a live child: only an event-loop turn is spent after the spawns
	 * drain, so an unresolved child cannot block the join. */
	async Flush(): Promise<void> {
		while (true) {
			while (this.State.Spawns.size > 0) {
				await Promise.all([...this.State.Spawns]);
			}
			// One turn: an already-settled child's terminal arm may queue the
			// next spawn (the pull), which the next pass joins.
			await new Promise((Resolve) => setImmediate(Resolve));
			if (this.State.Spawns.size === 0) {
				return;
			}
		}
	}

	/** The loading context (the orchestrator's tooling consumes the queue
	 * through this service, never through the state). */
	get Owner(): Context {
		return this.Context;
	}
}
