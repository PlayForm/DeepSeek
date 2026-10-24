import { Service, type Context } from "@deepseek-ai/cordis";
import type Entry from "@Interface/Entry.js";
import type GateShape from "@Interface/Gate.js";
import type Scope from "@Interface/Scope.js";
import type Snapshot from "@Interface/Snapshot.js";
import type State from "@Interface/State.js";
export default class BatchState extends Service {
    /** The apply-built state the methods read and write. */
    State: State;
    constructor(Context: Context, State: State);
    /** The full batch snapshot (the running lanes + their CURRENT tasks +
     *  the idle queue + the recent completions). */
    getState(): Snapshot;
    /** The compiled dynamic context block for one agent (the table of
     *  contents + the scope reminders + the pending list). */
    getContext(Agent: string): string;
    /** The compiled scope view for one agent (yours / shared / off-limits). */
    getScope(Agent: string): Scope;
    /** The concurrent lanes' CURRENT activities (the "you are never alone"
     *  block), excluding the caller. */
    whoElse(Agent: string): string;
    /** The spliced batch proposals, in splice order (the inbox splice's
     *  result - the board's live proposal memory). */
    getProposals(): Entry[];
    /** The arbiter gates, by name (the Gates block's truth). */
    getGates(): GateShape[];
    /** The queue projection: the queue service's own compiled line, read
     *  read-only (`QUEUE: none` when no queue service is mounted). */
    getQueue(): string;
    /** The arbiter truth update (the build/smokes state the Gates block
     *  renders for every lane). */
    setGate(Name: string, State_: string, Owner?: string): void;
    /** The CURRENT ACTIVITY update (the LIVE task - the agents report their
     *  phase changes; the parent sets the task at the activation). */
    setTask(Agent: string, Task_: string): void;
    /** The state transition (idle -> active -> completed -> failed ->
     *  interrupted; the queue movements). */
    setStatus(Agent: string, Status_: string): void;
    /** The scope registry update (the surfaces the member owns). */
    setScope(Agent: string, Surfaces_: string[]): void;
    /** The idle-queue append (the plugin holds the idle queue; the parent
     *  reviews + confirms; the plugin proposes the next pair). */
    queue(Agent: string): void;
    /** The whole-batch reset. */
    clear(): void;
}
declare module "@deepseek-ai/cordis" {
    interface Context {
        /** The batch-state plugin's service (registered from apply). */
        batchstate: BatchState;
    }
    interface Events {
        /** One batch state transition (the plan's broadcast; the consumers:
         *  the splice trigger and any agent listening). */
        "batch/state-change"(Change: import("@Interface/Change.js").default): void;
    }
}
