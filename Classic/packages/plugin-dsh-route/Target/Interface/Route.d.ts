import type { Role, RoleSpec, RouteHint } from "./Policy.js";
/** How the route was produced (the ledger's explicit-or-resolved /
 * corrected-or-kept flags):
 * - "resolved": the launch omitted the route (or parts of it); the plugin
 *   filled it from the policy.
 * - "kept": the launch passed a complete, policy-legal route; untouched.
 * - "corrected": the launch passed a route that violates the policy (a model
 *   outside the allowed set, or a route that contradicts the task-type
 *   rules); the plugin overrode it silently per the policy.
 * - "escalated": the escalation rung (the policy's planner lane at max). */
export type RouteSource = "resolved" | "kept" | "corrected" | "escalated";
export default interface Route extends RoleSpec {
    /** The task type the route was resolved for. */
    taskType: Role;
    /** The source classification above. */
    source: RouteSource;
    /** The route as the launcher passed it, when one was passed and it was
     * corrected or kept (the audit trail; absent for "resolved"). */
    passed?: RouteHint | undefined;
}
