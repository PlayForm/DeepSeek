import type State from "../Interface/State.js";
import type Task from "../Interface/Task.js";
export default _default;
/**
 * @module Pull
 *
 * The IDLE-SLOT automation: a released seat pulls the next queued task.
 *
 * @remarks
 *
 * SUBAGENT-QUEUE-PLUGIN.md section 2.3. When a seat is released (a task
 * settles, or a reconcile requeues an orphan), the queue pulls the next task
 * into the freed slot instead of waiting for the orchestrator's next manual
 * dispatch. The same routine runs after an enqueue, so a queue with free
 * capacity starts its work immediately.
 *
 * GATED ON THE SPAWN: the pull runs only when BOTH `autoDispatch` and
 * `autoSpawn` are on. An automatic assignment the plugin cannot launch would
 * strand the task in `dispatched` with a held seat - the manual posture
 * (`autoSpawn: false`) therefore keeps every assignment caller-driven, which
 * is exactly the PoC's behaviour and keeps its ledger byte-identical.
 *
 * The loop is bounded by the pool: every dispatch takes a seat and the
 * capacity gate refuses at zero, so the drain terminates without a timer and
 * without a clock.
 */
declare function _default(State: State, Dispatch: (Agent: string) => Task | undefined): string[];
