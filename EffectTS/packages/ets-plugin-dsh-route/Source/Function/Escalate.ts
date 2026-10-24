// Escalate - the escalation path's automatic resolution
// (ROUTING-ENFORCER-PLUGIN.md section 2.2, the task-routing skill's attempts
// ladder): given how many escalations have already happened for a chain, the
// function returns the escalation route (the planner lane, DeepSeek max,
// with the artifacts carried in the spec) or undefined when the ladder is
// exhausted or the policy disables escalation. At most ONE escalation.
//
// The rung's MODEL comes from Function/Ladder, so the live catalog
// (`list_subagent_models`' source) decides which allowed model the rung
// actually runs on; the effort stays the planner row's `max`.
import Ladder from "@Function/Ladder.js";
import type { PolicyShape } from "@Interface/Policy.js";
import type Route from "@Interface/Route.js";

export default (
	Escalations: number,
	Policy: PolicyShape,
	Advertised?: readonly string[],
): Route | undefined => {
	if (!Policy.escalation.enabled) {
		return undefined;
	}
	if (Escalations >= Policy.escalation.max) {
		// The ladder is exhausted: no escalation, the caller reports.
		return undefined;
	}
	return { ...Ladder(Policy, Advertised), taskType: "planner", source: "escalated" };
};
