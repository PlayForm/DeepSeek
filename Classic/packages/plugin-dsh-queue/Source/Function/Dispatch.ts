// Dispatch - the dispatcher's assignment step (section 2.2): pick the next
// task (Function/Schedule), take the agent's seat, flip the state to
// `dispatched`, resolve the route per the user's policy when the routing
// enforcer is present (the routed dispatch, silently - the queue NEVER
// alters the spec, only schedules), write the journal record + the ledger
// line, and return the task (undefined when nothing was dispatchable).
//
// THE SPAWN (the completion wave): when `autoSpawn` is on, the assignment
// also STARTS the child through the harness subagent service
// (Function/Spawn) - the routed dispatch's resolved triple becomes the
// child's `agentOptions`, the spec goes verbatim. The start is asynchronous
// (the harness's `startActivation` returns a promise), so the dispatch
// itself stays synchronous: the task is returned as assigned, the spawn
// round-trip is tracked on the State for `Flush()`, and the child's own
// result settles the task through the Settle callback. With `autoSpawn` off
// the dispatch assigns and ledgers only (the manual posture) and writes NO
// spawn line at all.
//
// THE POLICY GATE (D6): the policy is the OUTER gate, `autoSpawn` the INNER
// one. An `approve` verdict for `spawn` refuses the launch even with the knob
// on - the task stays `dispatched` with its seat held and the documented line
// `spawn held <id> (policy spawn=approve)` records why (the user approves by
// flipping `policy.spawn` to auto). The precedence is policy approve > knob:
// the knob can never widen an approve verdict, while a knob that is off still
// refuses on its own and writes no line.
//
// The routing service is PROBED at dispatch time (the tool-jobs precedent -
// never an injection dependency): the plugin ships disabled independently of
// the routing enforcer, so a missing `dshRoute` is a contained skip, not a
// load block. The probe is once per dispatch, cheap, and typed through the
// queue's own Interface/Route.ts (the self-contained sibling shape).
import { MAIN, Seat } from "@Function/Capacity.js";
import ScheduleFn from "@Function/Schedule.js";
import SpawnFn, { type Settle } from "@Function/Spawn.js";
import type RouteService from "@Interface/Route.js";
import type State from "@Interface/State.js";
import { Decide } from "@playform/plugin-dsh-factory";

export default (
	State: State,
	Agent: string,
	Append: (Message: string) => void,
	Settle?: Settle,
) => {
	const Task_ = ScheduleFn(State, Agent);
	if (Task_ === undefined) {
		return undefined;
	}
	Seat(State, Agent);
	Task_.state = "dispatched";
	Task_.assignedAgent = Agent;
	Task_.dispatchedAt = Date.now();
	// The routed dispatch (section 2.4): the route resolved per the user's
	// policy, silently, when the routing enforcer is present and enabled.
	if (State.RoutedDispatch) {
		const Route_ = State.Context?.get?.("dshRoute") as RouteService | undefined;
		if (Route_ !== undefined && typeof Route_.Resolve === "function") {
			try {
				const Resolved = Route_.Resolve({ taskType: Task_.role, spec: Task_.spec });
				Task_.route = `${Resolved.provider} ${Resolved.model} ${Resolved.reasoningEffort}`;
				Task_.agentOptions = {
					provider: Resolved.provider,
					model: Resolved.model,
					reasoningEffort: Resolved.reasoningEffort,
				};
			} catch {
				// Fail-open: a routing failure never blocks the dispatch.
				Task_.route = undefined;
				Task_.agentOptions = undefined;
			}
		}
	}
	State.Factory?.Journal(State, "task dispatched", Task_.id, Task_.assignedAgent);
	// Byte-stable template: `dispatched <id> -> <agent>[ route <p> <m> <e>]`.
	const RouteLine = Task_.route ? ` route ${Task_.route}` : "";
	Append(`dispatched ${Task_.id} -> ${Agent}${RouteLine}`);
	// The launch: only when the user allowed the spawn (the approval posture)
	// AND the policy's outer gate is open (D6). An `approve` verdict refuses
	// the launch with the documented line - the task keeps its seat and waits.
	if (State.AutoSpawn) {
		if (Decide(State.Allow, "spawn") === "auto") {
			const Pending = SpawnFn(State, Task_, Append, Settle);
			State.Spawns.add(Pending);
			void Pending.then(() => State.Spawns.delete(Pending));
		} else {
			Append(`spawn held ${Task_.id} (policy spawn=approve)`);
		}
	}
	return Task_;
};

// The main pool's key is re-exported for the callers that dispatch from the
// main conversation's reserved slots.
export { MAIN };
