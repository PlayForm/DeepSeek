// Service - the `batchstate` service (Function/Service): extends the cordis
// Service base and is REGISTERED FROM APPLY (the loader contract for the
// object-form plugin: apply constructs the service; the Service base
// constructor calls ctx.reflect.provide("batchstate", this), so
// `ctx.batchstate` resolves). Declaration merging below gives the typed
// accessor and the typed batch/state-change event.
//
// The methods are thin delegates (one Function module each):
//
//   getState()                  - the full batch snapshot (Compile.Snapshot);
//   getContext(agentId)         - the compiled context block (Compile.Context);
//   getScope(agentId)           - the compiled scope view (Compile.Scope);
//   whoElse(agentId)            - the concurrent lanes' activities (Compile.Else);
//   getProposals()              - the spliced proposals (the inbox splice's result);
//   getGates()                  - the arbiter gates (the Gates block's truth);
//   getQueue()                  - the queue projection (the queue's own line);
//   setTask(agentId, task)      - the CURRENT ACTIVITY update (Function/Task);
//   setStatus(agentId, status)  - the state transition (Function/Status);
//   setScope(agentId, surfaces) - the scope registry (Function/Surfaces);
//   queue(agentId)              - the idle-queue append (Function/Queue);
//   setGate(name, state, owner) - the arbiter truth (Function/Gate);
//   clear()                     - the whole-batch reset (Function/Clear).
//
// THE SERVICE API IS THE PLAN'S `batchstate/state` surface: the read
// methods the SUBAGENTS call (or the spliced block they read - both paths
// give the LIVE state), the write methods the parent/orchestrator side and
// the agents' phase reports use.
import { Service, type Context } from "@deepseek-ai/cordis";
import Clear from "@Function/Clear.js";
import * as Compile from "@Function/Compile.js";
import Gate from "@Function/Gate.js";
import Queue from "@Function/Queue.js";
import Status from "@Function/Status.js";
import Surfaces from "@Function/Surfaces.js";
import Task from "@Function/Task.js";
import type Entry from "@Interface/Entry.js";
import type GateShape from "@Interface/Gate.js";
import type Scope from "@Interface/Scope.js";
import type Snapshot from "@Interface/Snapshot.js";
import type State from "@Interface/State.js";

export default class BatchState extends Service {
	/** The apply-built state the methods read and write. */
	State: State;

	constructor(Context: Context, State: State) {
		super(Context, "batchstate");
		this.State = State;
	}

	/** The full batch snapshot (the running lanes + their CURRENT tasks +
	 *  the idle queue + the recent completions). */
	getState(): Snapshot {
		return Compile.Snapshot(this.State);
	}

	/** The compiled dynamic context block for one agent (the table of
	 *  contents + the scope reminders + the pending list). */
	getContext(Agent: string): string {
		return Compile.Context(this.State, Agent);
	}

	/** The compiled scope view for one agent (yours / shared / off-limits). */
	getScope(Agent: string): Scope {
		return Compile.Scope(this.State, Agent);
	}

	/** The concurrent lanes' CURRENT activities (the "you are never alone"
	 *  block), excluding the caller. */
	whoElse(Agent: string): string {
		return Compile.Else(this.State, Agent);
	}

	/** The spliced batch proposals, in splice order (the inbox splice's
	 *  result - the board's live proposal memory). */
	getProposals(): Entry[] {
		return [...this.State.Proposals.values()];
	}

	/** The arbiter gates, by name (the Gates block's truth). */
	getGates(): GateShape[] {
		return [...this.State.Gates.values()];
	}

	/** The queue projection: the queue service's own compiled line, read
	 *  read-only (`QUEUE: none` when no queue service is mounted). */
	getQueue(): string {
		return Compile.Schedule(this.State);
	}

	/** The arbiter truth update (the build/smokes state the Gates block
	 *  renders for every lane). */
	setGate(Name: string, State_: string, Owner = ""): void {
		Gate(this.State, Name, State_, Owner);
	}

	/** The CURRENT ACTIVITY update (the LIVE task - the agents report their
	 *  phase changes; the parent sets the task at the activation). */
	setTask(Agent: string, Task_: string): void {
		Task(this.State, Agent, Task_);
	}

	/** The state transition (idle -> active -> completed -> failed ->
	 *  interrupted; the queue movements). */
	setStatus(Agent: string, Status_: string): void {
		Status(this.State, Agent, Status_);
	}

	/** The scope registry update (the surfaces the member owns). */
	setScope(Agent: string, Surfaces_: string[]): void {
		Surfaces(this.State, Agent, Surfaces_);
	}

	/** The idle-queue append (the plugin holds the idle queue; the parent
	 *  reviews + confirms; the plugin proposes the next pair). */
	queue(Agent: string): void {
		Queue(this.State, Agent);
	}

	/** The whole-batch reset. */
	clear(): void {
		Clear(this.State);
	}
}

// Declaration merging: the typed accessor on the cordis Context and the
// typed batch/state-change event on the cordis Events.
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
