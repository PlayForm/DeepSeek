// Dispatch - the dispatcher's assignment step (section 2.2): pick the next
// task (Function/Schedule), take the agent's seat, flip the state to
// `dispatched`, resolve the route per the user's policy when the routing
// enforcer is present (the routed dispatch, silently - the queue NEVER
// alters the spec, only schedules), write the journal record + the ledger
// line, and return the task (undefined when nothing was dispatchable).
//
// The routing service is PROBED at dispatch time (the tool-jobs precedent -
// never an injection dependency): the plugin ships disabled independently of
// the routing enforcer, so a missing `dshRoute` is a contained skip, not a
// load block. The probe is once per dispatch, cheap, and typed through the
// queue's own Interface/Route.ts (the self-contained sibling shape).
import { MAIN, Seat } from "@Function/Capacity.js";
import ScheduleFn from "@Function/Schedule.js";
import type RouteService from "@Interface/Route.js";
import type State from "@Interface/State.js";

export default (State: State, Agent: string, Append: (Message: string) => void) => {
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
			} catch {
				// Fail-open: a routing failure never blocks the dispatch.
				Task_.route = undefined;
			}
		}
	}
	State.Factory?.Journal(State, "task dispatched", Task_.id, Task_.assignedAgent);
	// Byte-stable template: `dispatched <id> -> <agent>[ route <p> <m> <e>]`.
	const RouteLine = Task_.route ? ` route ${Task_.route}` : "";
	Append(`dispatched ${Task_.id} -> ${Agent}${RouteLine}`);
	return Task_;
};

// The main pool's key is re-exported for the callers that dispatch from the
// main conversation's reserved slots.
export { MAIN };
