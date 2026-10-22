import { Service, type Context } from "@deepseek-ai/cordis";
import { type Input } from "./Enqueue.js";
import type State from "../Interface/State.js";
import type Task from "../Interface/Task.js";
export default class Dispatcher extends Service {
    private Context;
    private State;
    constructor(Context_: Context, State_: State);
    /** Queue a task (the task as data; the spec is stored verbatim). */
    Enqueue(Input_: Input): Task;
    /** The deterministic next assignment for the main pool (or a named
     * agent's child cap). Undefined = nothing eligible or no capacity. */
    Dispatch(Agent?: string): Task | undefined;
    /** The free slots for the main pool (default) or a named agent. */
    Capacity(Agent?: string): number;
    /** The task entered execution (dispatched -> running; no seat change). */
    Start(Id: string): Task | undefined;
    /** Complete a task (releases the seat; the auto-dispatch regime fills
     * the freed slot on the next Dispatch call). */
    Complete(Id: string, ResultHash?: string): Task | undefined;
    /** Fail a task (releases the seat). */
    Fail(Id: string): Task | undefined;
    /** Interrupt a task (releases the seat; the partial state persists in the
     * journal for the restart reconciliation). */
    Interrupt(Id: string): Task | undefined;
    /** The batch-state TOC line (the pre-baked queue visibility). */
    Board(): string;
    /** The full queue record: the active lanes and their tasks, the queued
     * lanes, the reports delivered (the queue record's contract). */
    Snapshot(): {
        tasks: Task[];
        board: string;
    };
    /** The loading context (the orchestrator's tooling consumes the queue
     * through this service, never through the state). */
    get Owner(): Context;
}
