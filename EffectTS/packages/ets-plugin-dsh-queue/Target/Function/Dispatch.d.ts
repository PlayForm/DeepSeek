/**
 * @module Dispatch
 *
 * The dispatcher's assignment step: pick the next task, take the agent's
 * seat, flip the state to `dispatched`, and ledger the assignment.
 *
 * @remarks
 * Section 2.2. The step resolves the route per the user's policy when the
 * routing enforcer is present (the routed dispatch, silently - the queue
 * NEVER alters the spec, only schedules), writes the journal record and the
 * ledger line, and returns the task (undefined when nothing was
 * dispatchable).
 *
 * THE SPAWN (the completion wave): when `autoSpawn` is on, the assignment
 * also STARTS the child through the harness subagent service (Function/Spawn)
 * - the routed dispatch's resolved triple becomes the child's `agentOptions`,
 * the spec goes verbatim. The start is asynchronous (the harness's
 * `startActivation` returns a promise), so the dispatch itself stays
 * synchronous: the task is returned as assigned, the spawn round-trip is
 * tracked on the State for `Flush()`, and the child's own result settles the
 * task through the Settle callback. With `autoSpawn` off the dispatch assigns
 * and ledgers only (the manual posture) and writes NO spawn line at all.
 *
 * THE POLICY GATE (D6): the policy is the OUTER gate, `autoSpawn` the INNER
 * one. An `approve` verdict for `spawn` refuses the launch even with the knob
 * on - the task stays `dispatched` with its seat held and the documented line
 * `spawn held <id> (policy spawn=approve)` records why (the user approves by
 * flipping `policy.spawn` to auto). The precedence is policy approve > knob:
 * the knob can never widen an approve verdict, while a knob that is off still
 * refuses on its own and writes no line.
 *
 * The routing service is PROBED at dispatch time (the tool-jobs precedent -
 * never an injection dependency): the plugin ships disabled independently of
 * the routing enforcer, so a missing `dshRoute` is a contained skip, not a
 * load block. The probe is once per dispatch, cheap, and typed through the
 * queue's own Interface/Route.ts (the self-contained sibling shape).
 */
import { MAIN } from "./Capacity.js";
import { type Settle } from "./Spawn.js";
import type State from "../Interface/State.js";
export default _default;
declare function _default(State: State, Agent: string, Append: (Message: string) => void, Settle?: Settle): import("../Interface/Task.js").default | undefined;
/**
 * The main pool's key is re-exported for the callers that dispatch from the
 * main conversation's reserved slots.
 */
export { MAIN };
