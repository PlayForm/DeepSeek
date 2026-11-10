import { Service, type Context } from "@deepseek-ai/cordis";
import { type Input } from "./Enqueue.js";
import { type Report } from "./Reconcile.js";
import type State from "../Interface/State.js";
import type Task from "../Interface/Task.js";
/**
 * @module Dispatcher
 *
 * The subagent-queue SERVICE: registered as `dshQueue`, holding the State and
 * the surface the orchestration layer consumes.
 *
 * @remarks
 *
 * The factory's class/service pattern. Registered immediately on construction
 * and removed with its owning fiber; it holds the State (the queue store, the
 * seats) and exposes the surface:
 * - Enqueue(input) - queue a task (the task as data, spec verbatim)
 * - Dispatch(agent?) - the deterministic next assignment (a freed slot)
 * - Start(id) / Complete(id, hash?) / Fail(id) / Interrupt(id) - the state
 *   machine (Complete/Fail/Interrupt release seats)
 * - Board() - the batch-state TOC line
 * - Snapshot() - the full record (the queue record's contract)
 * - Capacity(agent?) - the free slots for the main pool or an agent
 * - Reconcile(persisted?) - the restart reconcile (orphans requeued or
 *   failed)
 * - Flush() - join the in-flight spawns (the tests' and the reconcile's
 *   seam; never a hot-path wait)
 *
 * Every method delegates to one Function module; the State's volatile fields
 * are read live, so a capacity edit applies to the next dispatch without a
 * remount.
 *
 * THE AUTOMATION (the completion wave): with `autoSpawn` on, an assignment
 * launches the child through the harness subagent service, and a released
 * seat pulls the next queued task (Function/Pull) - after an enqueue and
 * after every settle. The child's own result settles its task (completed /
 * failed), so the queue runs itself without a caller loop.
 */
export default class Dispatcher extends Service {
    private Context;
    private State;
    constructor(Context_: Context, State_: State);
    /**
     * The ledger sink (the factory's Append with this State bound).
     */
    private Append;
    /**
     * Pull the next queued task into every free slot (the idle-slot
     * automation; gated on autoDispatch AND autoSpawn).
     */
    private Pull;
    /**
     * Queue a task (the task as data; the spec is stored verbatim).
     */
    Enqueue(Input_: Input): Task;
    /**
     * The deterministic next assignment for the main pool (or a named
     * agent's child cap). Undefined = nothing eligible or no capacity.
     */
    Dispatch(Agent?: string): Task | undefined;
    /**
     * The free slots for the main pool (default) or a named agent.
     */
    Capacity(Agent?: string): number;
    /**
     * The task entered execution (dispatched -> running; no seat change).
     */
    Start(Id: string): Task | undefined;
    /**
     * Complete a task (releases the seat; the freed slot pulls the next
     * queued task when the automation is on).
     */
    Complete(Id: string, ResultHash?: string): Task | undefined;
    /**
     * Fail a task (releases the seat; the freed slot pulls the next).
     */
    Fail(Id: string): Task | undefined;
    /**
     * Interrupt a task (cancels the spawned child through the spawn's own
     * abort signal, releases the seat; the partial state persists in the
     * journal for the restart reconciliation).
     */
    Interrupt(Id: string): Task | undefined;
    /**
     * The batch-state TOC line (the pre-baked queue visibility).
     */
    Board(): string;
    /**
     * The full queue record: the active lanes and their tasks, the queued
     * lanes, the reports delivered (the queue record's contract).
     */
    Snapshot(): {
        tasks: Task[];
        board: string;
    };
    /**
     * The restart reconcile: rebuild from the persisted record (when the
     * caller hands one back), compare every active task with the live agents,
     * and requeue or fail each orphan honestly. The freed seats then pull the
     * requeued work when the automation is on.
     */
    Reconcile(Persisted?: readonly Task[]): Report;
    /**
     * Join the in-flight spawn round-trips (the harness's `startActivation`
     * calls) and let the children that already settled run their terminal
     * arm. The automation is otherwise fire-and-forget; the tests (and a
     * caller that wants a deterministic boundary) await this. It never waits
     * for a live child: only an event-loop turn is spent after the spawns
     * drain, so an unresolved child cannot block the join.
     */
    Flush(): Promise<void>;
    /**
     * The loading context (the orchestrator's tooling consumes the queue
     * through this service, never through the state).
     */
    get Owner(): Context;
}
