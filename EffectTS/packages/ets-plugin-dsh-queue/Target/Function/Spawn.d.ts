import type State from "../Interface/State.js";
import type Task from "../Interface/Task.js";
/**
 * @module Spawn
 *
 * The queue's LAUNCH: start a subagent through the HARNESS subagent service.
 *
 * @remarks
 *
 * The completion spec's re-spec: "use the harness subagent service, never a
 * private spawn"; SUBAGENT-QUEUE-PLUGIN.md section 4.4. The dispatcher calls
 * this after the seat is taken and the state flipped; the spec goes to the
 * child VERBATIM (the queue never alters a task's spec) and the resolved
 * route goes as the child's `agentOptions`.
 *
 * The probes (never injection dependencies - the queue ships disabled
 * independently of the agent loop and the subagent backends):
 * - ctx.subagents - the harness subagent service (startActivation)
 * - ctx.agents - the live-agent registry (currentInitiator = the exact live
 *   parent the harness identity-compares)
 *
 * Every refusal is ONE byte-stable ledger line and no spawn:
 * - `spawn skipped <id> (no subagents service)` - the backend is absent
 * - `spawn skipped <id> (no live parent)` - no initiating agent
 * - `spawn failed <id> (<error>)` - a probe or the start threw
 * and the success line is `spawned <id> -> <child>`.
 *
 * THE SETTLEMENT: the queue owns the task's terminal arm, so the child's own
 * result settles it - `completed` when the child stopped with `completed`,
 * `failed` otherwise (the honest arm: a partial or errored child is not a
 * completed task). The settlement runs through the Settle callback the
 * dispatcher supplies, which also pulls the next queued task into the freed
 * seat (the idle-slot automation).
 */
/**
 * The settle callback: `true` = completed, `false` = failed.
 */
export type Settle = (Id: string, Completed: boolean) => void;
export default _default;
declare function _default(State: State, Task_: Task, Append: (Message: string) => void, Settle?: Settle): Promise<void>;
