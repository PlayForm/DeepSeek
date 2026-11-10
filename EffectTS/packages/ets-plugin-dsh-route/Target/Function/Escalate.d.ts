import type { PolicyShape } from "../Interface/Policy.js";
import type Route from "../Interface/Route.js";
export default _default;
/**
 * @module Escalate
 *
 * The escalation path's automatic resolution from the attempts ladder.
 *
 * @remarks
 *
 * ROUTING-ENFORCER-PLUGIN.md section 2.2, the task-routing skill's attempts
 * ladder: given how many escalations have already happened for a chain, the
 * function returns the escalation route (the planner lane, DeepSeek max,
 * with the artifacts carried in the spec) or undefined when the ladder is
 * exhausted or the policy disables escalation. At most ONE escalation.
 *
 * The rung's MODEL comes from Function/Ladder, so the live catalog
 * (`list_subagent_models`' source) decides which allowed model the rung
 * actually runs on; the effort stays the planner row's `max`.
 */
declare function _default(Escalations: number, Policy: PolicyShape, Advertised?: readonly string[]): Route | undefined;
