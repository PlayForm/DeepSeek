import type { Role, RoleSpec } from "../Interface/Policy.js";
import type Request from "../Interface/Request.js";
import type Route from "../Interface/Route.js";
export default _default;
/**
 * @module Resolve
 *
 * The role-resolution service's deterministic core (ROUTING-ENFORCER-PLUGIN.md
 * section 2.1): Routing(launchRequest, UserPolicy) -> { provider, model,
 * reasoningEffort }.
 *
 * @remarks
 *
 * Pure and deterministic - the same request and the same policy always produce
 * the same route. NO LLM involvement, NO ambiguity.
 *
 * The policy is the law (section 3): the user's configuration is the plugin's
 * law and the plugin never decides policy itself.
 *
 * - A declared or inferred task type selects the policy's role row.
 * - An explicitly passed route is kept ONLY when it is complete (all three
 *   fields) and legal: the model is in the allowed set AND the route matches
 *   the role row (the task-type rules). A partial or illegal explicit route is
 *   silently CORRECTED to the policy row (the user's configuration is the
 *   law; the orchestrator is never bothered) and the audit trail keeps what
 *   was passed.
 * - The escalation flag overrides everything: the escalation rung is the
 *   planner lane (DeepSeek max) per the attempts ladder, when the policy
 *   enables escalation. The rung's model is verified against the LIVE catalog
 *   when the caller read one (Function/Ladder), so a model that left the
 *   catalog can never be routed to.
 */
declare function _default(Request_: Request, Policy: {
    coder: RoleSpec;
    explorer: RoleSpec;
    planner: RoleSpec;
    allowedModels: string[];
    escalation: {
        enabled: boolean;
        max: number;
    };
}, DefaultRole: Role, Keywords?: import("../Interface/Policy.js").KeywordTable, Advertised?: readonly string[]): Route;
